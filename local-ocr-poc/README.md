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

## 地端橋接服務：`bridge.py`（網頁一鍵觸發，一台全包）

`bridge.py` 是一支常駐的地端 HTTP 服務（port 8765），同時是「中繼」也是「OCR 引擎」。
它讓網頁不必靠剪貼簿，直接觸發整條流程。提供兩種擷取入口：

```bash
python3 bridge.py        # 啟動後保持視窗開著
```

| 端點 | 用途 |
|------|------|
| `GET /capture?delay=4` | **螢幕截圖**：桌機觸發 → 跳框選準星 → 螢幕 OCR → 回欄位 |
| `GET /session` | 發一次性 token + 手機可掃的區網網址（給 QR 用）|
| `GET /m?token=` | 手機掃 QR 後開啟的上傳頁（內建 📷 拍照 / 🖼️ 選相簿）|
| `POST /upload?token=` | 手機把照片傳上來 → 本地 OCR → 結果暫存 |
| `GET /result?token=` | 桌機輪詢取件（**照片到了就回 ok，辨識失敗也回**）|
| `GET /image?token=` | 回手機上傳的照片，供桌機預覽 |

> 改動 `bridge.py` 後**務必重啟**：Python 不會 hot-reload imports。

### 入口 A — 螢幕截圖擷取
1. 啟動前端：`cd .. && npm run dev`（http://localhost:5190/Cathay-Ref-Sys/，建議 **Chrome**）
2. 終端機跑 `python3 bridge.py`
3. 瀏覽器 → 診所端登入 → 開立轉診單 → Step1 → 左邊「**框選畫面並辨識**」
4. 約 4 秒後出現框選準星（時間足夠 Cmd+Tab 切到目標畫面）→ 框選 → 自動帶入

### 入口 B — 手機拍照上傳（QR 配對 → 地端取件 → 預覽）
> 原理：瀏覽器不能互傳、不能監聽 port，所以一定要一台「會聽 port 的地端服務」當中繼。
> `bridge.py` 綁 `0.0.0.0`，手機與電腦**同一個熱點 / Wi-Fi** 就能互通，影像不出區網。

1. **手機開 4G 個人熱點，電腦連進去**（比公司 Wi-Fi 穩：公司網常開 client isolation 擋裝置互連）
2. 終端機 `python3 bridge.py` → 確認印出「手機端 http://192.168.x.x:8765」這行
3. 前端 `npm run dev`
4. 瀏覽器 → Step1 → 右邊「**產生 QR Code**」
5. 手機相機掃 QR → 開上傳頁 → **拍照**或**從相簿選取** → 上傳並辨識
6. 桌機 2 秒內輪詢到結果並帶入

### 照片預覽（辨識失敗也顯示）
不論 OCR 有沒有抽到欄位，桌機都會顯示手機上傳的那張照片：
- **成功**：帶入欄位 + 右側顯示照片縮圖
- **失敗（抽不到欄位）**：只顯示照片預覽 + 提示「可重拍 / 改用螢幕截圖 / 手動填」

> 設計理由：拍照誤判率比乾淨截圖高，醫師需要肉眼對照原圖。所以 `/result` 改成
> 「照片到了就回 ok」，桌機輪詢不再要求 `fields > 0`；影像只存記憶體、用完即刪。

### 部署注意（mixed content）
桌機站台若為 **https**（如 GitHub Pages），瀏覽器會擋掉對 `http://localhost` 與
`http://區網IP` 的請求 → 這兩個入口都失效。所以 OCR / 手機上傳功能**只在本機 http
（`npm run dev`）環境成立**；線上版僅展示 UI。要上線得讓地端服務走 https，或整套同源 http。

### 舊版橋接（剪貼簿，保留參考）
最早不用 server，靠剪貼簿當橋：`capture_ocr.py` 把結果 `pbcopy` → 網頁
`navigator.clipboard.readText()` 讀回。零後端但要手動兩步，已被 `bridge.py` 取代。
