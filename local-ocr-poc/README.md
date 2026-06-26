# 本地端螢幕 OCR — 轉診欄位擷取 POC

證明「桌面工具讀 HIS 畫面 → 自動帶入轉診系統」可行的最小原型。
**全程本地、不連雲端、不需 API key。影像不離開本機**——對應醫院資安的底線。

## 技術組成（全部現成、叫得出名字）
- `screencapture`：macOS 內建截圖（互動框選）
- **macOS Vision 框架**：系統內建 OCR，中英並辨，本地執行
- `ocrmac`：把 Vision 包成一行 Python
- `pbcopy`：把結果丟進剪貼簿，供網頁「貼上帶入」

## 安裝
```bash
pip install -r requirements.txt
```

## 用法
```bash
# 互動框選：跑起來後用滑鼠框選 HIS 畫面要辨識的區域
python3 capture_ocr.py

# 或直接辨識一張現成圖片
python3 capture_ocr.py mock_his.png
```

> 第一次跑互動框選，macOS 會要求「螢幕錄製」權限：
> 系統設定 → 隱私權與安全性 → 螢幕錄製 → 勾選你的終端機 / Python，然後重開終端機。

## 輸出
- 終端機印出 OCR 原文 + 抽取到的結構化欄位
- 結構化 JSON 自動複製到剪貼簿

## 實測結果（mock_his.png）
血壓 / 心跳 / HbA1c / BNP / LDL / 血糖 / 主訴 / 現病史 / 診斷 / 用藥 — 10/10 抽取正確。

## 已知限制（也是設計重點）
- OCR 偶有字形誤認（例：「末」→「未」）。**所以一定要有預覽確認頁讓醫師掃一眼**——這正是轉診流程裡那一步的價值。
- 欄位抽取目前用樸素正則（`FIELD_RULES` / `LABELED_FIELDS`），對版面敏感。
- 升級路徑：把 `extract_fields` 那一步換成 **Claude 視覺**，就能理解亂排版的語意，架構不變。

## 端到端真實測試（截圖 → OCR → 帶入網頁）
瀏覽器沙箱不能自己截圖或讀本機檔案，所以用**剪貼簿**當橋（零後端）：
腳本把辨識結果 `pbcopy` 到剪貼簿 → 網頁用 `navigator.clipboard.readText()` 讀回來解析帶入。

1. 啟動前端：`cd ..  && npm run dev`（網址 http://localhost:5190/Cathay-Ref-Sys/，建議用 **Chrome**）
2. 開一塊「有字」的畫面當作 HIS（可用 `mock_his.png`，或真的病歷視窗）
3. 終端機跑：`python3 capture_ocr.py` → 框選該區域 → 結果自動進剪貼簿
4. 回到瀏覽器 → 診所端登入 → 開立轉診單 → Step1 → 點「**讀取擷取結果並帶入**」
5. 網頁讀剪貼簿 JSON → 主訴/現病史填入文字框，辨識欄位以 chips 顯示（**真實 OCR 值，非寫死**）

> 注意：clipboard 讀取需在 localhost（安全環境）+ 使用者點擊觸發；首次可能跳權限，允許即可。
> 換不同畫面截圖，帶入的 chips 會跟著變 —— 這就是可行性驗證。
