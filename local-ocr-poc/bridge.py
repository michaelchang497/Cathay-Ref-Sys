#!/usr/bin/env python3
"""
地端橋接服務 — 一台全包：螢幕截圖 OCR ＋ 手機拍照上傳 OCR
-------------------------------------------------
這支程式同時是「中繼」也是「OCR 引擎」，全程本地、不連雲端、影像不出區網。

提供的端點：
  GET  /capture?delay=4     桌機觸發：跳框選準星 → 螢幕 OCR → 回欄位（原功能）
  GET  /session             桌機要一組一次性 token + 手機可掃的區網網址（給 QR 用）
  GET  /m?token=XXX         手機掃 QR 後開啟的上傳頁（內建拍照 / 選相簿）
  POST /upload?token=XXX    手機把照片傳上來 → 本地 OCR → 結果暫存在 token 下
  GET  /result?token=XXX    桌機輪詢取件：拿到手機那張照片的辨識欄位

連線前提（地端模擬）：
  - 手機與這台電腦在「同一個區網」。最穩做法：用手機開 4G 熱點，電腦連進去。
  - 本服務綁 0.0.0.0，手機才連得到（不是只有 localhost）。
  - 桌機站台與本服務同為 http，瀏覽器可直接呼叫；https（如 GitHub Pages）會被
    mixed content 擋——所以這個 demo 要在本機 http（npm run dev）環境跑。

用法：
    python3 bridge.py        # 啟動後保持視窗開著，常駐等呼叫
"""

import json
import secrets
import socket
import tempfile
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from capture_ocr import grab_screenshot, run_ocr, extract_fields

PORT = 8765

# token -> {"status": "pending"|"done", "fields": {...}, "raw": "...", "ts": float}
RESULTS = {}
TOKEN_TTL = 600  # 秒；逾時的 token / 結果清掉


def get_lan_ip() -> str:
    """取得本機在區網裡的 IP（手機要連的就是這個）。熱點環境也適用。"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))  # 不會真的送封包，只為取得對外網卡 IP
        return s.getsockname()[0]
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "127.0.0.1"
    finally:
        s.close()


def gc_tokens():
    now = time.time()
    for t in [k for k, v in RESULTS.items() if now - v.get("ts", now) > TOKEN_TTL]:
        RESULTS.pop(t, None)


MOBILE_PAGE = """<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>上傳病患資料照片</title>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin:0; font-family:-apple-system,"PingFang TC",sans-serif; background:#f0fdf4; color:#1f2937; }
  .wrap { max-width:480px; margin:0 auto; padding:24px 18px 40px; }
  .head { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
  .logo { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#059669,#0d9488);
          color:#fff; font-weight:800; font-size:12px; display:flex; align-items:center; justify-content:center; }
  h1 { font-size:17px; color:#064e3b; margin:0; }
  .sub { font-size:12px; color:#6b7280; margin:6px 0 20px; line-height:1.6; }
  .btns { display:flex; gap:12px; margin-bottom:16px; }
  .btn { flex:1; border:none; border-radius:12px; padding:16px 8px; font-size:14px; font-weight:700;
         display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; }
  .btn-cam { background:#059669; color:#fff; box-shadow:0 2px 10px rgba(5,150,105,.3); }
  .btn-alb { background:#fff; color:#059669; border:1.5px solid #a7f3d0; }
  .ico { font-size:22px; }
  .preview { border-radius:12px; overflow:hidden; border:1px solid #d1fae5; background:#fff; margin-bottom:14px; }
  .preview img { width:100%; display:block; }
  .send { width:100%; border:none; border-radius:12px; padding:15px; font-size:15px; font-weight:800;
          background:#4f46e5; color:#fff; box-shadow:0 2px 10px rgba(79,70,229,.3); cursor:pointer; }
  .send:disabled { background:#c7d2fe; box-shadow:none; }
  .card { background:#fff; border-radius:12px; border:1px solid #e5e7eb; padding:16px; margin-top:16px; }
  .ok { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#fff;
        background:#059669; border-radius:99px; padding:4px 12px; }
  .chip { display:inline-block; font-size:12px; font-weight:600; color:#4338ca; background:#eef2ff;
          border:1px solid #c7d2fe; border-radius:6px; padding:3px 10px; margin:3px 3px 0 0; }
  .spin { width:18px; height:18px; border:3px solid #fff; border-top-color:transparent; border-radius:50%;
          animation:sp .8s linear infinite; }
  @keyframes sp { to { transform:rotate(360deg) } }
  .hint { font-size:12px; color:#9ca3af; margin-top:14px; line-height:1.6; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
  <div class="head"><div class="logo">CG</div><h1>上傳病患資料照片</h1></div>
  <p class="sub">拍攝或選取一張看診畫面 / 報告 / 病歷照片，系統會在電腦端做本地 OCR 辨識並自動帶入轉診欄位。影像只在區網內傳輸，不上傳雲端。</p>

  <div class="btns">
    <button class="btn btn-cam" id="camBtn"><span class="ico">📷</span>拍照</button>
    <button class="btn btn-alb" id="albBtn"><span class="ico">🖼️</span>從相簿選取</button>
  </div>
  <input id="camIn" type="file" accept="image/*" capture="environment" hidden>
  <input id="albIn" type="file" accept="image/*" hidden>

  <div id="previewBox" style="display:none">
    <div class="preview"><img id="previewImg" alt=""></div>
    <button class="send" id="sendBtn">上傳並辨識</button>
  </div>

  <div id="resultBox"></div>
  <p class="hint" id="hint">同一個熱點 / Wi-Fi 才連得到電腦端。傳完可回電腦查看帶入結果。</p>
</div>

<script>
  const token = new URLSearchParams(location.search).get('token') || '';
  const camIn = document.getElementById('camIn'),  albIn = document.getElementById('albIn');
  const previewBox = document.getElementById('previewBox'), previewImg = document.getElementById('previewImg');
  const sendBtn = document.getElementById('sendBtn'), resultBox = document.getElementById('resultBox');
  const hint = document.getElementById('hint');
  let file = null;

  document.getElementById('camBtn').onclick = () => camIn.click();
  document.getElementById('albBtn').onclick = () => albIn.click();
  [camIn, albIn].forEach(inp => inp.onchange = () => {
    if (!inp.files[0]) return;
    file = inp.files[0];
    previewImg.src = URL.createObjectURL(file);
    previewBox.style.display = 'block';
    resultBox.innerHTML = '';
    sendBtn.disabled = false;
    sendBtn.textContent = '上傳並辨識';
  });

  sendBtn.onclick = async () => {
    if (!file) return;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="spin" style="display:inline-block;vertical-align:middle"></span> 辨識中…';
    try {
      const res = await fetch('/upload?token=' + encodeURIComponent(token), {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      const j = await res.json();
      if (j.ok) {
        const chips = Object.values(j.fields || {}).map(f => '<span class="chip">' + f.label + '：' + f.value + '</span>').join('');
        resultBox.innerHTML = '<div class="card"><div class="ok">✓ 已辨識 ' + Object.keys(j.fields||{}).length + ' 個欄位並送回電腦</div><div style="margin-top:10px">' + (chips || '<span style="color:#9ca3af;font-size:12px">未抽到結構化欄位，但原文已送回</span>') + '</div></div>';
        hint.textContent = '完成！請回到電腦端確認帶入的欄位。';
        sendBtn.style.display = 'none';
      } else {
        resultBox.innerHTML = '<div class="card" style="color:#dc2626;font-size:13px">⚠ ' + (j.error || '辨識失敗') + '</div>';
        sendBtn.disabled = false; sendBtn.textContent = '重新上傳';
      }
    } catch (e) {
      resultBox.innerHTML = '<div class="card" style="color:#dc2626;font-size:13px">⚠ 連不到電腦端服務，請確認手機與電腦在同一個熱點 / Wi-Fi。</div>';
      sendBtn.disabled = false; sendBtn.textContent = '重新上傳';
    }
  };
</script>
</body>
</html>"""


class Handler(BaseHTTPRequestHandler):
    # ---------- 共用 ----------
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def _json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def _html(self, html, status=200):
        body = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    # ---------- GET ----------
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        gc_tokens()

        if path == "/capture":
            return self._handle_screen_capture(query)
        if path == "/session":
            return self._handle_new_session()
        if path == "/m":
            return self._html(MOBILE_PAGE)
        if path == "/result":
            return self._handle_result(query)
        if path == "/image":
            return self._handle_image(query)

        self._json({"ok": False, "error": "not found"}, status=404)

    # ---------- POST ----------
    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/upload":
            return self._json({"ok": False, "error": "not found"}, status=404)
        return self._handle_upload(parse_qs(parsed.query))

    # ---------- 各端點 ----------
    def _handle_screen_capture(self, query):
        try:
            delay = int(query.get("delay", ["4"])[0])
        except ValueError:
            delay = 4
        try:
            print("\n📸 桌機觸發螢幕擷取 — 請切到目標畫面並框選...")
            image_path = grab_screenshot(delay=delay)
            annotations = run_ocr(image_path)
            fields, full_text = extract_fields(annotations)
            print(f"✅ 螢幕辨識完成，回傳 {len(fields)} 個欄位")
            self._json({"ok": True, "fields": fields, "raw": full_text})
        except SystemExit as e:
            self._json({"ok": False, "error": str(e) or "已取消擷取"})
        except Exception as e:
            self._json({"ok": False, "error": repr(e)}, status=500)

    def _handle_new_session(self):
        token = secrets.token_urlsafe(12)
        RESULTS[token] = {"status": "pending", "ts": time.time()}
        lan_ip = get_lan_ip()
        url = f"http://{lan_ip}:{PORT}/m?token={token}"
        print(f"\n🔗 新的手機上傳工作階段：{url}")
        self._json({"ok": True, "token": token, "url": url, "lan_ip": lan_ip, "port": PORT})

    def _handle_result(self, query):
        token = query.get("token", [""])[0]
        rec = RESULTS.get(token)
        if not rec:
            return self._json({"ok": False, "error": "工作階段不存在或已逾時", "pending": False})
        if rec["status"] != "done":
            return self._json({"ok": False, "pending": True})
        # 不論有沒有抽到欄位，只要照片上傳完成就回 ok（讓桌機顯示預覽）
        self._json({
            "ok": True,
            "fields": rec.get("fields", {}),
            "raw": rec.get("raw", ""),
            "has_image": bool(rec.get("image")),
        })

    def _handle_image(self, query):
        """回傳手機上傳的那張照片（供桌機預覽）。影像只存在記憶體，隨 token 逾時清掉。"""
        token = query.get("token", [""])[0]
        rec = RESULTS.get(token)
        if not rec or not rec.get("image"):
            self.send_response(404)
            self._cors()
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", rec.get("ctype", "image/jpeg"))
        self.send_header("Cache-Control", "no-store")
        self._cors()
        self.end_headers()
        self.wfile.write(rec["image"])

    def _handle_upload(self, query):
        token = query.get("token", [""])[0]
        if token not in RESULTS:
            return self._json({"ok": False, "error": "工作階段不存在或已逾時"})
        try:
            length = int(self.headers.get("Content-Length", 0))
            if length <= 0:
                return self._json({"ok": False, "error": "沒有收到影像"})
            data = self.rfile.read(length)
            ctype = self.headers.get("Content-Type") or "image/jpeg"

            tmp = Path(tempfile.gettempdir()) / f"referral_mobile_{token}.jpg"
            tmp.write_bytes(data)
            print(f"\n📲 收到手機上傳影像（{len(data)//1024} KB），本地 OCR 中...")

            annotations = run_ocr(str(tmp))
            fields, full_text = extract_fields(annotations)
            # 照片留在記憶體供桌機預覽（不寫進磁碟長存），隨 token 逾時一併清掉
            RESULTS[token] = {
                "status": "done", "fields": fields, "raw": full_text,
                "image": data, "ctype": ctype, "ts": time.time(),
            }
            try:
                tmp.unlink()  # 磁碟暫存用完即刪
            except OSError:
                pass
            print(f"✅ 手機影像辨識完成，{len(fields)} 個欄位已備妥給桌機取件")
            self._json({"ok": True, "fields": fields, "raw": full_text})
        except Exception as e:
            self._json({"ok": False, "error": repr(e)}, status=500)

    def log_message(self, *args):
        pass  # 靜音預設請求日誌


if __name__ == "__main__":
    ip = get_lan_ip()
    print("🚀 地端橋接服務已啟動（螢幕截圖 OCR ＋ 手機拍照上傳）")
    print(f"   桌機端： http://localhost:{PORT}")
    print(f"   手機端（同一熱點 / Wi-Fi 才連得到）： http://{ip}:{PORT}")
    print("   保持此視窗開著。Ctrl+C 結束。\n")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
