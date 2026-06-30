# BUILD LOG — 國泰 AI 智慧轉診平台 Prototype

**專案目的**：國泰醫院一期規劃的 AI 智慧轉診平台前端 prototype，展示完整轉診流程給國泰使用者
**建立日期**：2026-06-22
**對象**：國泰醫院使用者
**Deadline**：2026-06-23

---

## ① 需求確認

- **問題**：建立完整轉診流程的可操作 prototype，展示 AI 輔助轉診的價值
- **對象**：國泰醫院使用者
- **驗收**：7 步驟完整流程可操作，靜態前端不接任何模型
- **來源文件**：`轉診作業資訊系統-採購需求表_1150527.pdf`
- **參考**：健保電子轉診平台操作手冊（UserGuide_ET_IPR.pdf）

### 文件比對結論
- 流程圖與招標文件高度一致
- 我們的加值點：AI 輔助（STT/OCR/NLP）、綠色通道掛號、管理儀表板
- 現行健保系統全手動，我們自動化了輸入和推薦環節

## ② 技術選型

- **推薦**：React + Vite + lucide-react（icon）
- **CSS 策略**：全 inline style
- **不做**：後端、API 串接、模型推論——純前端靜態 mock

## ③ 專案結構

```
2026-06-cathay-referral/
├── BUILD_LOG.md
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                    ← 主框架（header + stepper + 路由）
    ├── data/
    │   └── mockData.js            ← 病患、醫師、時段、統計等 mock 資料
    └── components/
        ├── LoginScreen.jsx        ← 登入（醫事人員卡驗證）
        ├── Step1Input.jsx         ← 步驟1：輸入資料（健保卡讀取 + 語音 STT + OCR）
        ├── Step2AIGenerate.jsx    ← 步驟2：AI 生成轉診內容（自動啟動動畫）
        ├── Step3AIRecommend.jsx   ← 步驟3：AI 推薦科別與醫師（3 位候選）
        ├── Step4ConfirmSign.jsx   ← 步驟4：確認修訂 + 數位簽章
        ├── Step5GreenChannel.jsx  ← 步驟5：綠色通道掛號預約
        ├── Step6VPNSubmit.jsx     ← 步驟6：VPN 電子轉診送件
        └── Step7Dashboard.jsx     ← 管理儀表板（首頁）
```

## ④ 實作紀錄

### 流程設計（最終版）
```
登入 → Dashboard（首頁）→ 開立轉診單 → 步驟 1~6 → 回到 Dashboard
```

步驟順序：
1. 輸入資料（健保卡讀取 + 語音 + OCR）
2. AI 生成轉診內容（自動啟動，無需按鈕）
3. AI 推薦科別與醫師（選擇 1 位 + 可自選其他醫師）
4. 修訂與確認簽章（ICD-10 可增刪 + 內容可編輯 + 數位簽章）
5. 綠色通道掛號預約（轉診預留診號選位）
6. VPN 電子轉診送件（傳輸動畫 + 轉診單號 + Email 通知）

### 迭代過程
1. **初版**：7 步驟線性流程（Dashboard 在最後）
2. **佈局調整**：Dashboard 改為首頁，流程完成後回到 Dashboard
3. **登入重設計**：從通用登入改為「診所工作站 + 醫師身分驗證」情境
4. **步驟1 強化**：
   - 病患資料改為「讀取健保卡」按鈕帶入（非預填）
   - 語音輸入改為 streaming 逐字顯示（模擬即時 STT）
   - OCR 增加模擬處方箋圖像 + 結構化擷取結果（異常值紅色標示）
5. **步驟2 簡化**：進入即自動啟動 AI 分析，拿掉 STT/OCR 進度（前步已完成）
6. **步驟3 增強**：增加「自選其他醫師」按鈕，下一步改名「修訂與確認簽章」
7. **步驟4 ICD 編輯**：診斷碼支援 X 刪除 + 搜尋新增（自動帶入相近碼）
8. **Dashboard**：按鈕改為「開立轉診單」

### 關鍵設計決策
| 決策 | 選擇 | 理由 |
|------|------|------|
| 步驟順序 4↔5 | 確認簽章在前，綠色通道在後 | AI 推薦後先修訂確認內容，再掛號，最後 VPN 送出 |
| Dashboard 定位 | 首頁而非最後一步 | 使用者登入後先看全局，再發起新轉診 |
| 登入場景 | 診所工作站 + 醫師卡驗證 | 健保規定轉診必須醫事人員卡登入，診所端操作 |
| 步驟2 自動啟動 | 進入即跑，不需點按 | 前步已完成輸入，無需再確認 |
| OCR 結果 | 顯示模擬處方箋 + 結構化表格 | 讓 demo 更有說服力，展示 AI 擷取能力 |
| ICD-10 編輯 | 可刪除 + 搜尋新增 | 符合招標文件「AI 生成內容人工修訂紀錄」要求 |

### 色彩系統
- 主色：Teal `#059669`（國泰醫療綠）
- AI 強調：Indigo `#4f46e5`
- 成功：Green `#059669`
- 警告：Amber `#d97706`
- 異常值：Red `#dc2626`
- 中性色：標準灰階（同前專案）

---

## ⑤ 交付後迭代（2026-06-24 ~ 06-30）

交付後依國泰回饋與展示需求持續加值，分三條主線。

### A. 管理者後台強化
- **側邊欄導覽**（`App.jsx`）：管理者登入後左側出現 sidebar（管理儀表板 / 合作診所管理 / 轉診紀錄·系統設定佔位）。`adminView` state 切換右側內容；登出與點 logo 會重置回 dashboard。
- **合作診所管理**（`ClinicManagement.jsx`，新檔）：列表 + 搜尋（名稱/代碼/區域即時過濾）+ 新增 modal + 啟用/停用切換。全為 session 內 local state（示意操作，重整還原）。資料源 `PARTNER_CLINICS`。
- **儀表板改版**（`AdminDashboard.jsx`）：移除「轉診科別分布」；「近期轉診紀錄」移到右上、改點單號彈窗、狀態值比照診所端（已掛號/已到診/未到診）；底部新增**各診所來源轉診數折線圖**（純 SVG 手刻、可切週/月，資料源 `DASHBOARD_STATS.clinicTrend`）。

### B. 本地端 OCR 擷取（無 API、影像不外傳）
> 解決院方「不串 API、資料不外傳」前提下，怎麼把看診畫面資料快速帶進轉診系統。

- **`local-ocr-poc/`**：獨立 POC。`screencapture -i` 框選 → macOS Vision（`ocrmac`）本地 OCR → 規則抽欄位（`capture_ocr.py` 的 `PATIENT_RULES`/`FIELD_RULES`/`LABELED_FIELDS`）。
- **`bridge.py`**：地端 HTTP 服務（port 8765），讓網頁「一鍵」觸發整條流程。`Step1Input` 的「螢幕截圖擷取」按鈕 → fetch `localhost:8765/capture` → 跳框選 → 回欄位帶入。
- **HIS 字樣全移除**（院方敏感），UI 改稱「看診系統 / 擷取病患資料」。

### C. 手機拍照上傳（QR 配對 → 地端取件）
> 「QR 叫相機 → 拍 → 傳地端 → 地端 OCR → 桌機取件」。地端服務一台全包（中繼＋OCR 引擎），手機與電腦同熱點即可，影像不出區網。

- `bridge.py` 升級：綁 `0.0.0.0`（手機才連得到）；`/session` 發一次性 token + 區網網址、`/m` 回手機上傳頁（內建拍照 / 選相簿）、`/upload` 收圖跑 OCR、`/result` 給桌機輪詢、`/image` 回照片供預覽。
- `Step1Input.jsx`：擷取區改**左右並列**（左=螢幕截圖、右=手機 QR）；用 `qrcode` 套件渲染 QR；桌機 2 秒輪詢取件。
- **照片預覽**：不論辨識成功與否都顯示上傳照片。成功→帶入欄位＋縮圖；失敗（抽不到欄位）→只顯示預覽＋提示重拍/手動填。關鍵：`/result` 改成「照片到了就回 ok」，輪詢不再要求 fields > 0。

### 交付後新增/變更檔案
| 檔案 | 變更 |
|------|------|
| `App.jsx` | 管理者 sidebar + adminView 切換 |
| `components/ClinicManagement.jsx` | 新檔：合作診所管理 |
| `components/AdminDashboard.jsx` | 移除科別分布、紀錄移右上+彈窗、新增折線圖 |
| `data/mockData.js` | 新增 `PARTNER_CLINICS`、`DASHBOARD_STATS.clinicTrend` |
| `components/Step1Input.jsx` | 螢幕截圖＋手機 QR 並列、照片預覽 |
| `local-ocr-poc/capture_ocr.py` | 本地 OCR + 規則抽欄位 |
| `local-ocr-poc/bridge.py` | 地端服務：螢幕截圖 + 手機上傳一台全包 |
| `package.json` | 新增 `qrcode` 相依 |

### 關鍵設計決策（交付後）
| 決策 | 選擇 | 理由 |
|------|------|------|
| OCR 在哪跑 | 地端（macOS Vision）非雲端 | 院方資安底線：影像不出本機/區網 |
| 手機如何進系統 | QR token 配對 + 地端中繼 | 瀏覽器不能互傳/不能監聽 port，必須有會聽 port 的地端服務 |
| 同網方式 | 手機 4G 熱點優先於公司 Wi-Fi | 公司 Wi-Fi 常開 client isolation，熱點不做隔離最穩 |
| 照片預覽 | 辨識失敗也顯示 | 拍照誤判率高，醫師需肉眼確認原圖；`/result` 改為「照片到即回 ok」 |
| 影像生命週期 | 記憶體暫存、用完即刪、token 短時效 | 醫療資料等級，不落地長存 |
| 欄位抽取 | 樸素正則（未來可換 Claude Vision） | 先證可行；正則對版面敏感，語意理解是升級路徑 |

### 已知限制 / 部署注意
- **mixed content**：桌機站台若為 https（GitHub Pages），瀏覽器會擋對 `http://localhost` 與 `http://區網IP` 的請求 → OCR/手機上傳只在本機 http（`npm run dev`）環境成立。線上 demo 僅展示 UI。
- **部署兩條線**：`main`=原始碼、`gh-pages`=build 後的 dist（GitHub Pages 實際吃這個）。更新線上版需「build → 推 gh-pages」，光推 main 不會更新網站。
- `bridge.py` 改動後**必須重啟**（Python 不 hot-reload imports）。

### D. ICD-10 規定查證（保留決策）
> 起因：質疑轉診是否「法規上必填 ICD」，若不必填就拿掉編碼部分。

查三份來源文件後結論——**不能拿掉**：
- **健保轉診辦法**（`轉診注意事項`）：轉診單法定必要內容只有轉診目的、病歷摘要、院所資訊、診療科別、開立日期、有效期限。ICD **非必填**（要的是「病歷摘要」的文字診斷）。
- **健保電子轉診 Web API 介接說明書**：查詢輸出欄位也沒有診斷碼，佐證 ICD 非轉診單核心欄位。
- **本案採購需求表第 6 點**：白紙黑字要求「**ICD-10 預測模型：根據描述自動預測診斷碼，作為分科決策的基礎**」「判斷主診斷」。

→ ICD 在本案的角色不是「讓轉診單合法」，而是**智慧決策（AI 分科）的核心輸入**，是標案最值錢的加值點。維持現狀（`Step2AIGenerate` 可增刪、`Step3Preview` 預覽、`AdminDashboard`）。辨識準度問題後續再優化。

### E. 綠色通道掛號方式選擇（彈窗分流）
- `Step6VPNSubmit.jsx`：「下一步：綠色通道掛號預約」按鈕改成**開彈窗選掛號方式**，不直接 `next()`：
  1. **使用智慧轉診平台掛號**（推薦）→ `next()` 進綠色通道選位
  2. **使用國泰綜合醫院網路掛號** → `window.open('https://reg.cgh.org.tw/tw/reg/main_01.jsp', '_blank', 'noopener,noreferrer')` 另開官方掛號頁
- 遮罩點擊 / X 關閉；按鈕仍須 `phase === 'done'`（VPN 傳完）才可點。
- 設計理由：院方既有官方網路掛號系統，平台不該強制取代——給診所選擇權，平台掛號是加值選項而非唯一路徑。
