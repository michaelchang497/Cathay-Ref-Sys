#!/usr/bin/env python3
"""
本地端螢幕 OCR → 轉診欄位擷取 POC
-------------------------------------------------
流程：截圖（框選區域）→ macOS Vision 本地 OCR → 規則抽取欄位 → 輸出 JSON + 複製到剪貼簿
特性：全程本地、不連雲端、不需 API key。影像不出本機。

用法：
    python3 capture_ocr.py            # 互動框選一塊畫面來辨識
    python3 capture_ocr.py 某圖.png   # 直接辨識一張現成圖片
"""

import json
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

try:
    from ocrmac import ocrmac
except ImportError:
    sys.exit("缺少 ocrmac，請先執行：pip install -r requirements.txt")


# ---------- 1. 取得畫面 ----------
def grab_screenshot(delay: int = 0) -> str:
    """用 macOS 內建 screencapture 互動框選一塊畫面，回傳暫存 png 路徑。
    delay > 0 時，先倒數幾秒讓使用者切換到目標視窗，再出現框選準星。"""
    tmp = Path(tempfile.gettempdir()) / "referral_capture.png"
    if delay > 0:
        print(f"⏳ {delay} 秒後出現框選準星，請立刻切換到要擷取的畫面（Cmd+Tab）...")
        time.sleep(delay)
    print("👉 請用滑鼠框選 HIS 畫面上要辨識的區域（Esc 取消）...")
    # -i 互動模式；使用者放開滑鼠就截圖
    result = subprocess.run(["screencapture", "-i", str(tmp)])
    if result.returncode != 0 or not tmp.exists():
        sys.exit("已取消截圖。")
    return str(tmp)


# ---------- 2. 本地 OCR ----------
def run_ocr(image_path: str):
    """用 macOS Vision 框架做 OCR，中英並辨。回傳 [(text, confidence, bbox), ...]。"""
    annotations = ocrmac.OCR(
        image_path,
        language_preference=["zh-Hant", "en-US"],
        recognition_level="accurate",
    ).recognize()
    return annotations


# ---------- 3. 規則抽取轉診欄位 ----------
# 病患基本資料（單一抓值）。末四碼容許 OCR 把「末」誤認成「未」。
PATIENT_RULES = {
    "name":     (r"(?:病患|姓名)\s*[:：]\s*([一-龥]{2,4})", "姓名"),
    "age":      (r"(\d{1,3})\s*歲", "年齡"),
    "gender":   (r"\d{1,3}\s*歲\s*([男女])", "性別"),
    "id_last4": (r"[末未]四碼\s*[:：]?\s*(\d{4})", "末四碼"),
}

# 每個欄位：一組關鍵字 + 抓值的正則。先用最樸素的規則證明可行性，之後可替換成 AI 語意版。
FIELD_RULES = {
    "blood_pressure": (r"(?:血壓|BP)\D{0,4}(\d{2,3}\s*/\s*\d{2,3})", "血壓"),
    "heart_rate":     (r"(?:心跳|心率|HR|脈搏)\D{0,4}(\d{2,3})", "心跳"),
    "hba1c":          (r"HbA1c\D{0,4}([\d.]+\s*%?)", "HbA1c"),
    "bnp":            (r"BNP\D{0,4}([\d.]+)", "BNP"),
    "ldl":            (r"LDL\D{0,4}([\d.]+)", "LDL"),
    "glucose":        (r"(?:血糖|Glucose|GLU)\D{0,4}([\d.]+)", "血糖"),
}

# 自由文字欄位：抓「標籤：內容」這種格式
LABELED_FIELDS = {
    "chief_complaint": (["主訴", "Chief Complaint", "C.C", "CC"], "主訴"),
    "present_illness": (["病史", "現病史", "Present Illness", "PI"], "現病史"),
    "diagnosis":       (["診斷", "Diagnosis", "Dx", "Impression"], "診斷"),
    "medication":      (["用藥", "藥物", "Medication", "Meds"], "用藥"),
}


def extract_fields(annotations):
    full_text = "\n".join(a[0] for a in annotations)

    fields = {}

    # 病患基本資料
    for key, (pattern, label) in PATIENT_RULES.items():
        m = re.search(pattern, full_text)
        if m:
            fields[key] = {"label": label, "value": m.group(1).strip()}

    # 數值型欄位
    for key, (pattern, label) in FIELD_RULES.items():
        m = re.search(pattern, full_text, re.IGNORECASE)
        if m:
            fields[key] = {"label": label, "value": m.group(1).strip()}

    # 標籤型自由文字欄位：標籤須在「行首」且帶冒號，避免誤抓內文中出現的相同字
    # （例如現病史「曾診斷膽結石」不應被當成診斷欄位）
    lines = [a[0] for a in annotations]
    for key, (labels, label_zh) in LABELED_FIELDS.items():
        value = None
        for line in lines:
            for lab in labels:
                m = re.match(rf"\s*{re.escape(lab)}\s*[:：]\s*(.+)", line, re.IGNORECASE)
                if m and m.group(1).strip():
                    value = m.group(1).strip()
                    break
            if value:
                break
        if value:
            fields[key] = {"label": label_zh, "value": value}

    return fields, full_text


# ---------- 4. 輸出 ----------
def copy_to_clipboard(text: str):
    subprocess.run("pbcopy", input=text.encode("utf-8"))


def main():
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if not Path(image_path).exists():
            sys.exit(f"找不到檔案：{image_path}")
    else:
        image_path = grab_screenshot()

    print(f"\n🔍 本地辨識中（macOS Vision，影像不外傳）...")
    annotations = run_ocr(image_path)
    fields, full_text = extract_fields(annotations)

    print("\n" + "=" * 50)
    print("📄 OCR 原始文字：")
    print("=" * 50)
    print(full_text)

    print("\n" + "=" * 50)
    print("✅ 抽取到的轉診欄位：")
    print("=" * 50)
    if fields:
        for key, v in fields.items():
            print(f"  • {v['label']}（{key}）: {v['value']}")
    else:
        print("  （沒抓到結構化欄位 — 可調整 FIELD_RULES，或改用 AI 語意版）")

    payload = json.dumps(fields, ensure_ascii=False, indent=2)
    copy_to_clipboard(payload)
    print("\n📋 結構化 JSON 已複製到剪貼簿，可直接貼進轉診系統。")
    print(payload)


if __name__ == "__main__":
    main()
