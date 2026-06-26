#!/usr/bin/env python3
"""
本地橋接服務 — 讓網頁「一鍵」觸發截圖→本地OCR→回傳欄位
-------------------------------------------------
網頁 fetch http://localhost:8765/capture 時，這支程式會：
  跳出框選準星 → 你框選 HIS 畫面 → macOS Vision 本地 OCR → 回傳結構化欄位 JSON
全程本地、不連雲端、不需 API key。影像不出本機。

用法：
    python3 bridge.py        # 啟動後保持視窗開著，常駐等網頁呼叫

注意：
  - 需先給「終端機」螢幕錄製權限（系統設定 → 隱私權與安全性 → 螢幕錄製）。
  - 開發站台是 http://localhost:5190，與本服務同為 http，瀏覽器可直接呼叫。
    若網頁是 https（如 GitHub Pages），瀏覽器會擋 http 本地請求（mixed content），
    需改用 http 本機站台或讓本服務走 https。
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

from capture_ocr import grab_screenshot, run_ocr, extract_fields

PORT = 8765


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if not self.path.startswith("/capture"):
            self.send_response(404)
            self._cors()
            self.end_headers()
            return

        query = parse_qs(urlparse(self.path).query)
        try:
            delay = int(query.get("delay", ["4"])[0])
        except ValueError:
            delay = 4

        status, payload = 200, {}
        try:
            print("\n📸 網頁觸發擷取 — 請切到目標畫面並框選...")
            image_path = grab_screenshot(delay=delay)
            annotations = run_ocr(image_path)
            fields, full_text = extract_fields(annotations)
            payload = {"ok": True, "fields": fields, "raw": full_text}
            print(f"✅ 辨識完成，回傳 {len(fields)} 個欄位")
        except SystemExit as e:  # grab_screenshot 取消時會 sys.exit
            payload = {"ok": False, "error": str(e) or "已取消擷取"}
        except Exception as e:
            status = 500
            payload = {"ok": False, "error": repr(e)}

        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # 靜音預設請求日誌


if __name__ == "__main__":
    print(f"🚀 本地橋接服務已啟動： http://localhost:{PORT}/capture")
    print("   保持此視窗開著。網頁點「擷取畫面欄位」時，會在這裡跳出框選準星。")
    print("   Ctrl+C 結束。\n")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
