# SKILL — 國泰 AI 智慧轉診平台 Prototype

> 醫療轉診流程前端 prototype 的可重用架構。核心三塊：**多步驟引導流程**、**地端 OCR + 手機 QR 配對上傳**（最有沉澱價值）、**管理後台（側邊欄 + 純 SVG 圖表）**。
> 技術棧：React 18 + Vite 6 + lucide-react + qrcode，**全 inline style、零 CSS 框架、純前端 mock**。

---

## 一、完整畫面流程圖

```
LoginScreen（醫事人員卡驗證，分流 clinic / admin）
   │
   ├─ role=clinic ──▶ Step7Dashboard（診所首頁）─[開立轉診單]─┐
   │                                                          ▼
   │   ┌──────────────── 轉診流程 5 步（stepper 導覽）─────────────────┐
   │   │ Step1Input    輸入資料：健保卡讀取 + 語音STT + OCR擷取        │
   │   │   └ OCR 兩入口並列：①螢幕截圖  ②手機 QR 拍照上傳             │
   │   │ Step2AIGenerate  AI 生成轉診內容（自動啟動）+ ICD-10 可增刪   │
   │   │ Step3Preview     轉診單預覽（ICD/診斷/病歷摘要）             │
   │   │ Step6VPNSubmit   VPN 送件動畫 → 傳輸成功 REF 單號            │
   │   │   └ [下一步] 開彈窗：①平台掛號 ②國泰官方網路掛號(外連)        │
   │   │ Step5GreenChannel 綠色通道預留診號選位                       │
   │   └──────────────────────────────────────────────────────────┘
   │
   └─ role=admin ──▶ 側邊欄 layout
                      ├ AdminDashboard（KPI + 近期紀錄 + 各診所來源折線圖）
                      └ ClinicManagement（合作診所 CRUD，session local）
```

> ⚠️ App.jsx 的 `step` 數字 ≠ 檔名數字：step3→`Step3Preview`、step4→`Step6VPNSubmit`、step5→`Step5GreenChannel`。流程改版後檔名沒重命名，靠 App.jsx 路由對應。`Step3AIRecommend`/`Step4ConfirmSign` 已不在主流程（保留參考）。

---

## 二、核心技術模式

### 模式 A：地端 OCR + 手機 QR 配對上傳（★ 最值得複用）

**問題**：院方不串雲端 API、影像不能外傳，又要把看診畫面 / 紙本快速帶進系統。
**解法**：一台綁 `0.0.0.0` 的地端 HTTP 服務（`bridge.py`）同時當「中繼」+「OCR 引擎」。手機與電腦同熱點即可，影像不出區網。

**為什麼一定要 server**：瀏覽器不能互傳、不能監聽 port、WebRTC 仍需 signaling。必須有一台會聽 port 的地端服務當 rendezvous，用 **一次性 token** 當手機↔桌機的黏合。

```
桌機 fetch /session → 拿 token + 區網網址 → qrcode 渲染 QR
   ↓ 手機掃 QR
手機開 /m?token= → <input capture> 拍照 / <input> 選相簿
   ↓ POST /upload?token=（raw body，避開 multipart 解析）
地端 OCR（macOS Vision）→ 抽欄位 → RESULTS[token] 暫存（含影像 bytes）
   ↓ 桌機每 2s 輪詢 /result?token=
照片到了就回 ok（不要求 fields>0）→ 桌機帶入欄位 + 顯示照片預覽
```

bridge 端點表：

| 端點 | 用途 |
|------|------|
| `GET /capture?delay=4` | 螢幕截圖入口：跳框選準星 → 螢幕 OCR → 回欄位 |
| `GET /session` | 發一次性 token + 區網網址（給 QR）|
| `GET /m?token=` | 手機上傳頁（內建拍照 / 選相簿）|
| `POST /upload?token=` | 收 raw body 影像 → 本地 OCR → 暫存 |
| `GET /result?token=` | 桌機輪詢取件（照片到即回 ok，辨識失敗也回）|
| `GET /image?token=` | 回上傳照片供桌機預覽（no-store，記憶體暫存用完即刪）|

關鍵 client 片段（`Step1Input.jsx`）：

```jsx
import QRCode from 'qrcode'
const BRIDGE = 'http://localhost:8765'

// 1) 取 session → 渲染 QR → 開始輪詢
const { token, url } = await fetch(`${BRIDGE}/session`).then(r => r.json())
setQrDataUrl(await QRCode.toDataURL(url, { width: 200, margin: 1,
  color: { dark: '#3730a3', light: '#ffffff' } }))
pollRef.current = setInterval(async () => {
  const j = await fetch(`${BRIDGE}/result?token=${token}`).then(r => r.json())
  if (!j.ok) return
  clearInterval(pollRef.current); pollRef.current = null
  setMobilePhoto(j.has_image ? `${BRIDGE}/image?token=${token}` : '')
  const fields = j.fields || {}
  if (Object.keys(fields).length > 0) { applyCaptured(fields) }  // 成功帶入
  else { setMobile('preview') }                                  // 失敗只顯示照片
}, 2000)
```

手機端拍照 / 選相簿 + raw upload（`bridge.py` 的 `MOBILE_PAGE`）：

```html
<!-- 拍照：capture=environment 直接叫後鏡頭；選相簿：拿掉 capture -->
<input type="file" accept="image/*" capture="environment">
<input type="file" accept="image/*">
<script>
  // raw body 上傳，server 讀 Content-Length bytes，免 multipart
  fetch('/upload?token=' + token, { method: 'POST',
    headers: { 'Content-Type': file.type }, body: file })
</script>
```

**坑**：
- `bridge.py` 改動後**必須重啟**（Python 不 hot-reload imports）。
- **mixed content**：https 站台（GitHub Pages）會擋 `http://localhost` / 區網 IP → 此功能**只在本機 http（`npm run dev`）成立**。
- 同網優先用**手機 4G 熱點**，別用公司 Wi-Fi（常開 client isolation 擋裝置互連）。

### 模式 B：彈窗分流選擇（外連 vs 站內續流）

按鈕不直接動作，先開 modal 給選項。遮罩點擊關閉、`stopPropagation` 保護內容、外連用 `noopener,noreferrer`。

```jsx
{showModal && (
  <div onClick={() => setShowModal(false)}
    style={{ position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(6,78,59,0.35)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div onClick={e => e.stopPropagation()} style={{ maxWidth: 460, background: '#fff', borderRadius: 16, padding: 24 }}>
      <button onClick={() => { setShowModal(false); next() }}>站內續流（推薦）</button>
      <button onClick={() => { window.open(URL, '_blank', 'noopener,noreferrer'); setShowModal(false) }}>外部系統</button>
    </div>
  </div>
)}
```

### 模式 C：純 SVG 手刻折線圖（不引圖表庫）

專案慣例：不裝 chart library。週/月切換 + gridline + tooltip。

```jsx
const W = 920, H = 300, padL = 36, padR = 16, padT = 16, padB = 32
const yMax = Math.max(5, Math.ceil(maxV / 5) * 5)
const xAt = i => padL + (W - padL - padR) * i / (periods.length - 1)
const yAt = v => padT + (H - padT - padB) * (1 - v / yMax)
// 每條 series 一個 <polyline points={...}/> + 各點 <circle><title>tooltip</title></circle>
```

### 模式 D：多步驟流程 + stepper

`App.jsx` 集中管 `step` state，`next/prev/goToStep` + `window.scrollTo(0,0)`；stepper 已完成步驟可回跳（`isDone && goToStep`）。跨步驟資料用 props 往下傳（`selectedDoctor` / `selectedSlot` / `referralId`）。

### 模式 E：管理後台側邊欄

`role==='admin'` 時 flex layout（220px nav + main）。`ADMIN_NAV` 陣列驅動，`adminView` state 切右側內容，`disabled` 項顯示「規劃中」。登出 / 點 logo 都 reset 回 dashboard。

---

## 三、視覺設計規範

| 用途 | 色碼 |
|------|------|
| 主色（國泰醫療綠） | `#059669`，深 `#064e3b`，漸層 `linear-gradient(135deg,#059669,#0d9488)` |
| AI 強調（Indigo） | `#4f46e5`，QR 深色 `#3730a3` |
| 警告 / 異常 | Amber `#d97706`、Red `#dc2626` |
| 背景 / 邊框 | 頁底 `#f0fdf4`、卡片 `#fff`、淺綠邊 `#d1fae5`、灰邊 `#e5e7eb`、成功底 `#ecfdf5` |

- **字級**：標題 17–20px/700、內文 13px、輔助 11px、標籤 10px/800 + `letterSpacing:0.1em` + uppercase
- **圓角**：卡片 14–16px、按鈕 10px、chip/badge 99px（pill）
- **陰影**：卡片 `0 1px 4px rgba(0,0,0,0.04)`、主按鈕 `0 2px 8px rgba(5,150,105,0.25)`、modal `0 12px 40px rgba(0,0,0,0.18)`
- **動畫**（定義在 App.jsx `<style>`）：`spin` / `pulse` / `fadeIn` / `slideIn`
- **icon**：lucide-react，內文 14–17px、badge 9–10px

---

## 四、可複用時的調整點清單

1. **品牌色**：全 inline style，主色 `#059669` 散落各檔——換色用編輯器全域取代主色組（`#059669`/`#064e3b`/`#0d9488`/`#d1fae5`/`#ecfdf5`/`#f0fdf4`）。
2. **流程步數**：改 `STEPS`（mockData）+ App.jsx 的 `Math.min(s+1, N)` 上限 + 路由 `step===n` 對應。注意檔名與 step 數可能不一致。
3. **OCR 欄位規則**：`capture_ocr.py` 的 `PATIENT_RULES`/`FIELD_RULES`/`LABELED_FIELDS` 正則——換場景就改這裡。升級路徑：把 `extract_fields` 換成 **Claude Vision**，理解亂排版語意，架構不變。
4. **bridge port / token TTL**：`bridge.py` 的 `PORT=8765`、`TOKEN_TTL=600`、`BRIDGE` 常數（Step1Input）三處要一致。
5. **外連掛號 URL**：`Step6VPNSubmit.jsx` 的 `CGH_REG_URL`。
6. **mock 資料**：全集中 `src/data/mockData.js`（PATIENT / 醫師 / 時段 / DASHBOARD_STATS / PARTNER_CLINICS / AI_ICD_CODES）。

---

## 五、關鍵設計決策與原因（避免重踩）

| 決策 | 選擇 | 理由 |
|------|------|------|
| OCR 在哪跑 | 地端 macOS Vision，非雲端 | 院方資安底線：影像不出本機/區網，零 API key |
| 手機如何進系統 | QR token 配對 + 地端中繼 | 瀏覽器不能互傳/監聽 port，必須有會聽 port 的地端服務 |
| 同網方式 | 手機 4G 熱點 > 公司 Wi-Fi | 公司網常開 client isolation 擋裝置互連 |
| 照片預覽 | 辨識失敗也顯示 | 拍照誤判率高，醫師需肉眼對照原圖；`/result` 改「照片到即回 ok」 |
| 影像生命週期 | 記憶體暫存、用完即刪、token 短時效 | 醫療資料等級，不落地長存 |
| 欄位抽取 | 樸素正則（未來換 Claude Vision） | 先證可行；正則對版面敏感，語意理解是升級路徑 |
| ICD-10 去留 | **保留**（非必填但標案要） | 法規轉診單不必填 ICD，但採購需求表第 6 點明確要 ICD-10 預測模型當分科依據——是加值核心 |
| 掛號方式 | 彈窗分流（平台 / 官方網路掛號） | 院方已有官方掛號系統，平台是加值選項不強制取代，給診所選擇權 |
| 「HIS」字樣 | **全面移除**，改稱「看診系統 / 擷取病患資料」 | 院方敏感，不接受 HIS 字眼出現在 UI |
| CSS 策略 | 全 inline style，零框架 | prototype 求快、單檔可攜、無 build 額外設定 |
| 圖表 | 純 SVG 手刻 | 不為一張折線圖引整包 chart library |

---

## 六、本地端 OCR 啟動備忘

```bash
# 終端機 1：地端服務（改動後務必重啟）
cd local-ocr-poc && python3 bridge.py     # 印出 localhost:8765 + 區網 IP
# 終端機 2：前端
npm run dev                                # http://localhost:5190/Cathay-Ref-Sys/（建議 Chrome）
```
首次互動框選需給 macOS「螢幕錄製」權限（系統設定 → 隱私權與安全性 → 螢幕錄製 → 勾終端機/Python → 重開終端機）。

## 七、部署備忘（兩條線）

- `main` = 原始碼；`gh-pages` = build 後的 dist（GitHub Pages 實際吃這個）。
- 更新線上版：`npx vite build` → 進 `dist/` → `git init` → checkout `gh-pages` → commit → force push → `rm -rf .git`。**光推 main 不會更新網站。**
- 線上版（https）僅展示 UI；OCR / 手機上傳因 mixed content 只在本機 http 成立。
