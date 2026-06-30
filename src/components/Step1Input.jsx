import { useState, useRef, useEffect } from 'react'
import { Mic, Camera, Upload, ChevronRight, User, FileText, CreditCard, Monitor, Check, Smartphone } from 'lucide-react'
import QRCode from 'qrcode'
import { PATIENT } from '../data/mockData'

const BRIDGE = 'http://localhost:8765'

export default function Step1Input({ next }) {
  const [recording, setRecording] = useState(false)
  const [voiceDone, setVoiceDone] = useState(false)
  const [ocrDone, setOcrDone] = useState(false)
  const [ocrScanning, setOcrScanning] = useState(false)
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [cardRead, setCardRead] = useState(false)
  const [cardReading, setCardReading] = useState(false)
  const [capture, setCapture] = useState('idle') // idle | scanning | done
  const [captured, setCaptured] = useState(null) // 真實 OCR 結果（螢幕截圖或手機上傳）
  const [captureError, setCaptureError] = useState('')
  const [mobile, setMobile] = useState('idle') // idle | waiting（等手機上傳）| preview（收到照片但沒抽到欄位）
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [mobilePhoto, setMobilePhoto] = useState('') // 手機上傳的照片預覽 URL
  const pollRef = useRef(null)

  function applyCaptured(data) {
    setCaptured(data)
    const cc = data.chief_complaint?.value || ''
    const pi = data.present_illness?.value || ''
    const combined = [cc, pi].filter(Boolean).join('，')
    if (combined) { setChiefComplaint(combined); setVoiceDone(true) }
    setCardRead(true)
    setOcrDone(true)
    setCapture('done')
  }

  // 真功能：呼叫地端服務 → 跳出框選 → 本地 OCR → 回傳欄位帶入
  async function handleScreenCapture() {
    setCaptureError('')
    setCapture('scanning')
    try {
      const res = await fetch(`${BRIDGE}/capture?delay=4`)
      const json = await res.json()
      if (json.ok && json.fields && Object.keys(json.fields).length > 0) {
        applyCaptured(json.fields)
      } else {
        setCaptureError(json.error || '辨識結果為空，請重試或調整框選範圍。')
        setCapture('idle')
      }
    } catch (e) {
      setCaptureError('連不到地端服務。請先在終端機執行：python3 bridge.py')
      setCapture('idle')
    }
  }

  // 真功能：產生一次性 QR → 手機掃描拍照上傳 → 地端 OCR → 桌機輪詢取件帶入
  async function handleMobileUpload() {
    setMobileError('')
    try {
      const res = await fetch(`${BRIDGE}/session`)
      const json = await res.json()
      if (!json.ok) { setMobileError(json.error || '無法建立工作階段'); return }
      setQrUrl(json.url)
      const dataUrl = await QRCode.toDataURL(json.url, {
        width: 200, margin: 1, color: { dark: '#3730a3', light: '#ffffff' },
      })
      setQrDataUrl(dataUrl)
      setMobile('waiting')
      setMobilePhoto('')
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${BRIDGE}/result?token=${encodeURIComponent(json.token)}`)
          const j = await r.json()
          if (j.ok) {
            clearInterval(pollRef.current); pollRef.current = null
            // 照片上傳完成就先抓預覽（即使沒辨識成功也要顯示）
            setMobilePhoto(j.has_image ? `${BRIDGE}/image?token=${encodeURIComponent(json.token)}` : '')
            const fields = j.fields || {}
            if (Object.keys(fields).length > 0) {
              setMobile('idle')        // 收合右欄，改顯示帶入結果
              applyCaptured(fields)
            } else {
              setMobile('preview')     // 有照片、但沒抽到欄位 → 留在右欄顯示預覽
            }
          }
        } catch (e) { /* 手機還沒傳，繼續輪詢 */ }
      }, 2000)
    } catch (e) {
      setMobileError('連不到地端服務。請先在終端機執行：python3 bridge.py')
    }
  }

  function cancelMobile() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    setMobile('idle'); setQrDataUrl(''); setQrUrl(''); setMobilePhoto('')
  }

  function handleReadCard() {
    setCardReading(true)
    setTimeout(() => { setCardReading(false); setCardRead(true) }, 1500)
  }

  const streamRef = useRef(null)
  const fullText = '病患王先生，68歲男性，主訴近兩週反覆胸悶，活動時加劇，休息後緩解。合併有高血壓及糖尿病病史約十年，目前規律服藥中。近日有輕微下肢水腫，偶有夜間端坐呼吸情形。血壓偏高約 160/95，心跳規則但偏快約 92 次。建議轉診至心臟內科做進一步檢查。'

  useEffect(() => () => {
    if (streamRef.current) clearInterval(streamRef.current)
    if (pollRef.current) clearInterval(pollRef.current)
  }, [])

  function handleVoice() {
    setRecording(true)
    setChiefComplaint('')
    let idx = 0
    streamRef.current = setInterval(() => {
      const step = Math.random() < 0.3 ? 3 : 2
      idx += step
      if (idx >= fullText.length) {
        idx = fullText.length
        clearInterval(streamRef.current)
        setRecording(false)
        setVoiceDone(true)
      }
      setChiefComplaint(fullText.slice(0, idx))
    }, 60)
  }

  function handleOCR() {
    setOcrScanning(true)
    setTimeout(() => { setOcrScanning(false); setOcrDone(true) }, 2000)
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <style>{`@keyframes scanline { 0% { top: 0 } 100% { top: 100% } }`}</style>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 1 — 輸入轉診資料</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>從看診系統一鍵擷取，或以語音、上傳報告建立轉診資訊</p>

      {/* 擷取病患資料 — 螢幕截圖 OCR ＋ 手機拍照上傳 */}
      <div style={{
        borderRadius: '14px', marginBottom: '16px', overflow: 'hidden',
        border: '1.5px solid #c7d2fe', background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
        boxShadow: '0 2px 10px rgba(79,70,229,0.08)',
      }}>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Monitor size={16} color="#4f46e5" />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#3730a3' }}>擷取病患資料</span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
              background: '#fff', color: '#4f46e5', border: '1px solid #c7d2fe',
            }}>本地辨識 · 資料不外傳</span>
          </div>

          {capture === 'done' && captured ? (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
                  background: '#4f46e5', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}><Check size={12} /> 已辨識 {Object.keys(captured).length} 個欄位並帶入</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '6px', alignContent: 'flex-start' }}>
                  {Object.values(captured).map((v, i) => (
                    <span key={i} style={{
                      fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px',
                      background: '#fff', color: '#4338ca', border: '1px solid #c7d2fe',
                    }}>{v.label}：{v.value}</span>
                  ))}
                </div>
                {mobilePhoto && (
                  <div style={{ flexShrink: 0, textAlign: 'center' }}>
                    <img src={mobilePhoto} alt="上傳照片" style={{
                      width: '110px', maxHeight: '130px', objectFit: 'contain',
                      borderRadius: '8px', border: '1px solid #e0e7ff', background: '#fff',
                    }} />
                    <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '3px' }}>上傳照片</div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#6366f1', marginTop: '10px' }}>
                ↑ 以上為真實 OCR 辨識結果，主訴/現病史已帶入下方欄位，請醫師確認無誤。
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* 左：螢幕截圖擷取 */}
              <div style={subCard}>
                <div style={subHead}><Monitor size={15} color="#4f46e5" /> 螢幕截圖擷取</div>
                <p style={subDesc}>在看診系統畫面上框選病患資料區域，自動辨識帶入。</p>
                {capture === 'scanning' ? (
                  <div style={{
                    position: 'relative', borderRadius: '10px', overflow: 'hidden',
                    border: '1.5px solid #818cf8', background: '#1e1b4b',
                    padding: '16px', color: '#c7d2fe',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: '2px',
                      background: 'linear-gradient(90deg, transparent, #a5b4fc, transparent)',
                      animation: 'scanline 1.3s linear infinite', boxShadow: '0 0 8px #818cf8',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                      <div style={{
                        width: '14px', height: '14px', border: '2px solid #a5b4fc',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      切換到目標畫面，框選後自動辨識…
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={handleScreenCapture} style={btnIndigo}>
                      <Monitor size={15} /> 框選畫面並辨識
                    </button>
                    {captureError && <p style={errText}>⚠ {captureError}</p>}
                  </>
                )}
              </div>

              {/* 右：手機拍照上傳 */}
              <div style={subCard}>
                <div style={subHead}><Smartphone size={15} color="#4f46e5" /> 手機拍照上傳</div>
                <p style={subDesc}>產生 QR，手機掃描後拍照或選相簿，於電腦端辨識。</p>
                {mobile === 'waiting' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <img src={qrDataUrl} alt="掃描上傳 QR" style={{
                      width: '150px', height: '150px', borderRadius: '10px',
                      border: '1px solid #c7d2fe', background: '#fff', padding: '6px',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', margin: '10px 0 4px', fontSize: '12px', fontWeight: 600, color: '#4338ca' }}>
                      <div style={{
                        width: '12px', height: '12px', border: '2px solid #a5b4fc',
                        borderTopColor: 'transparent', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      等待手機上傳…
                    </div>
                    <p style={{ fontSize: '10px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }}>
                      手機需與電腦在同一個熱點 / Wi-Fi<br />
                      <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{qrUrl}</span>
                    </p>
                    <button onClick={cancelMobile} style={{
                      fontSize: '11px', color: '#6366f1', background: 'none', border: 'none',
                      cursor: 'pointer', textDecoration: 'underline',
                    }}>取消 / 重新產生</button>
                  </div>
                ) : mobile === 'preview' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {mobilePhoto && (
                      <img src={mobilePhoto} alt="上傳照片預覽" style={{
                        width: '100%', maxHeight: '160px', objectFit: 'contain',
                        borderRadius: '10px', border: '1px solid #e0e7ff', background: '#fff',
                      }} />
                    )}
                    <p style={{ fontSize: '11px', color: '#b45309', margin: '10px 0 8px', lineHeight: '1.6' }}>
                      ⚠ 已收到照片，但未自動辨識到欄位。可確認照片清晰度後重拍，或改用螢幕截圖，亦可手動填寫下方欄位。
                    </p>
                    <button onClick={cancelMobile} style={btnIndigoOutline}>
                      <Smartphone size={15} /> 重新拍照上傳
                    </button>
                  </div>
                ) : (
                  <>
                    <button onClick={handleMobileUpload} style={btnIndigoOutline}>
                      <Smartphone size={15} /> 產生 QR Code
                    </button>
                    {mobileError && <p style={errText}>⚠ {mobileError}</p>}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <Card title="病患基本資料" icon={<User size={14} />}>
        {!cardRead ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CreditCard size={36} color={cardReading ? '#059669' : '#d1d5db'} style={cardReading ? { animation: 'pulse 0.8s infinite' } : {}} />
            <div style={{ fontSize: '13px', color: '#6b7280', margin: '12px 0 16px' }}>
              尚未讀取到健保卡，請點擊重新讀取
            </div>
            <button
              onClick={handleReadCard}
              disabled={cardReading}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: cardReading ? '#d1d5db' : '#059669', color: '#fff',
                fontSize: '13px', fontWeight: 700, cursor: cardReading ? 'wait' : 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                boxShadow: cardReading ? 'none' : '0 2px 8px rgba(5,150,105,0.2)',
              }}
            >
              {cardReading ? (
                <>
                  <div style={{
                    width: '14px', height: '14px', border: '2px solid #fff',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  讀取中...
                </>
              ) : (
                <><CreditCard size={16} /> 讀取健保卡</>
              )}
            </button>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
              }}>✓ {captured ? '畫面判讀完成' : '健保卡已讀取'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <InfoField label="姓名" value={captured?.name?.value || PATIENT.name} ocr={!!captured?.name} />
              <InfoField label="身分證末四碼" value={captured?.id_last4?.value || PATIENT.idLast4} ocr={!!captured?.id_last4} />
              <InfoField label="出生日期" value={PATIENT.birthDate} />
              <InfoField label="性別 / 年齡" value={`${captured?.gender?.value || PATIENT.gender} / ${captured?.age?.value || PATIENT.age}歲`} ocr={!!(captured?.gender || captured?.age)} />
              <InfoField label="健保卡號" value={PATIENT.insuranceId} />
              <InfoField label="聯絡電話" value={PATIENT.phone} />
              <InfoField label="聯絡人" value={PATIENT.contactPerson} />
              <InfoField label="聯絡地址" value={PATIENT.address} />
            </div>
            <div style={{
              marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
              background: '#fef2f2', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', flexShrink: 0 }}>藥物過敏</span>
              <span style={{ fontSize: '12px', color: '#991b1b' }}>{PATIENT.drugAllergy}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Voice Input */}
      <Card title="AI 語音輸入" icon={<Mic size={14} />} style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
          支援中英文混雜醫學術語辨識，口述內容自動轉為主訴與醫囑
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <button
            onClick={handleVoice}
            disabled={recording}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: recording ? '#fef3c7' : voiceDone ? '#ecfdf5' : '#059669',
              color: recording ? '#92400e' : voiceDone ? '#059669' : '#fff',
              fontSize: '13px', fontWeight: 600, cursor: recording ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: recording ? 'none' : '0 2px 8px rgba(5,150,105,0.2)',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <Mic size={16} style={recording ? { animation: 'pulse 0.8s infinite' } : {}} />
            {recording ? '錄音中...' : voiceDone ? '✓ 語音轉文字完成' : '開始語音輸入'}
          </button>
          <textarea
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            placeholder="點擊左方按鈕開始語音輸入，或直接手動輸入..."
            rows={4}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: '8px',
              border: '1.5px solid #d1fae5', fontSize: '13px', outline: 'none',
              lineHeight: '1.7', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
        </div>
      </Card>

      {/* OCR Upload */}
      <Card title="拍照辨識 (OCR)" icon={<Camera size={14} />} style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
          上傳檢驗報告或處方箋，自動擷取關鍵資訊
        </p>

        {!ocrDone && !ocrScanning && (
          <div
            onClick={handleOCR}
            style={{
              padding: '24px', borderRadius: '10px',
              border: '2px dashed #d1d5db', background: '#f9fafb',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', gap: '8px',
            }}
          >
            <Upload size={28} color="#9ca3af" />
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>點擊上傳檢驗報告或處方箋</span>
            <span style={{ fontSize: '11px', color: '#d1d5db' }}>支援 JPG / PNG / PDF</span>
          </div>
        )}

        {ocrScanning && (
          <div style={{
            padding: '24px', borderRadius: '10px',
            border: '2px dashed #059669', background: '#f0fdf4',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '24px', height: '24px', border: '3px solid #059669',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>OCR 辨識中...</span>
          </div>
        )}

        {ocrDone && (captured ? (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe',
              }}>✓ 已從畫面判讀檢驗 / 生命徵象</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                ['血壓', captured.blood_pressure?.value, 'mmHg'],
                ['心跳', captured.heart_rate?.value, 'bpm'],
                ['HbA1c', captured.hba1c?.value, ''],
                ['血糖', captured.glucose?.value, 'mg/dL'],
                ['LDL', captured.ldl?.value, 'mg/dL'],
                ['BNP', captured.bnp?.value, 'pg/mL'],
              ].filter(r => r[1]).map(([name, val, unit]) => (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '4px 8px', borderRadius: '6px',
                  background: '#f9fafb', border: '1px solid #f3f4f6', fontSize: '12px',
                }}>
                  <span style={{ width: '120px', fontWeight: 600, color: '#374151' }}>{name}</span>
                  <span style={{ fontWeight: 700, color: '#1f2937', fontFamily: 'monospace' }}>{val}{unit ? ` ${unit}` : ''}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
              數值取自畫面 OCR 判讀，請醫師確認；參考區間與異常標示於正式系統由檢驗資料帶入。
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '14px', animation: 'fadeIn 0.3s ease' }}>
            {/* Mock prescription image */}
            <div style={{
              width: '200px', flexShrink: 0, borderRadius: '10px',
              border: '1px solid #d1fae5', background: '#fff',
              padding: '12px', fontSize: '10px', color: '#374151', lineHeight: '1.6',
              fontFamily: 'monospace',
            }}>
              <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '11px', color: '#064e3b', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                仁愛家醫診所 — 檢驗報告
              </div>
              <div style={{ marginBottom: '4px' }}>日期：2026-06-18</div>
              <div style={{ marginBottom: '4px' }}>姓名：王○○ (M/68)</div>
              <div style={{ borderTop: '1px dashed #e5e7eb', margin: '6px 0', paddingTop: '6px' }}>
                <div>HbA1c &nbsp;&nbsp;&nbsp; <b style={{ color: '#dc2626' }}>7.8%</b> ↑</div>
                <div>Glucose &nbsp; <b style={{ color: '#dc2626' }}>156</b> &nbsp;↑</div>
                <div>T-Chol &nbsp;&nbsp; <b style={{ color: '#dc2626' }}>238</b> &nbsp;↑</div>
                <div>LDL &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b style={{ color: '#dc2626' }}>152</b> &nbsp;↑</div>
                <div>Cr &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1.3</div>
                <div>BNP &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b style={{ color: '#dc2626' }}>420</b> &nbsp;↑</div>
                <div>Hb &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 13.1</div>
                <div>Na &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 139</div>
                <div>K &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4.2</div>
              </div>
            </div>

            {/* Extracted results */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                  background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
                }}>✓ OCR 辨識完成</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#064e3b', marginBottom: '8px' }}>
                擷取結果：檢驗報告 2026-06-18
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { name: 'HbA1c', value: '7.8%', flag: true, ref: '<7.0%' },
                  { name: 'Fasting Glucose', value: '156 mg/dL', flag: true, ref: '70-100' },
                  { name: 'Total Cholesterol', value: '238 mg/dL', flag: true, ref: '<200' },
                  { name: 'LDL', value: '152 mg/dL', flag: true, ref: '<130' },
                  { name: 'Creatinine', value: '1.3 mg/dL', flag: false, ref: '0.7-1.3' },
                  { name: 'BNP', value: '420 pg/mL', flag: true, ref: '<100' },
                ].map(item => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 8px', borderRadius: '6px',
                    background: item.flag ? '#fef2f2' : '#f9fafb',
                    border: `1px solid ${item.flag ? '#fecaca' : '#f3f4f6'}`,
                    fontSize: '12px',
                  }}>
                    <span style={{ width: '120px', fontWeight: 600, color: '#374151' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: item.flag ? '#dc2626' : '#1f2937', fontFamily: 'monospace' }}>{item.value}</span>
                    {item.flag && <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>↑</span>}
                    <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: 'auto' }}>ref: {item.ref}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Next */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button onClick={next} style={btnPrimary}>
          下一步：AI 生成與推薦 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function Card({ title, icon, children, style = {} }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1px solid #e5e7eb', padding: '18px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '13px', fontWeight: 700, color: '#064e3b', marginBottom: '14px',
      }}>
        {icon} {title}
      </div>
      {children}
    </div>
  )
}

function InfoField({ label, value, ocr }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {ocr && (
          <span style={{
            fontSize: '8px', fontWeight: 800, color: '#4f46e5',
            background: '#eef2ff', borderRadius: '4px', padding: '0 4px', letterSpacing: '0.04em',
          }}>OCR</span>
        )}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{value}</div>
    </div>
  )
}

const btnPrimary = {
  padding: '10px 24px', borderRadius: '10px', border: 'none',
  background: '#059669', color: '#fff', fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(5,150,105,0.25)', transition: 'all 0.2s',
}

const subCard = {
  background: '#fff', borderRadius: '12px', border: '1px solid #e0e7ff',
  padding: '14px 16px', display: 'flex', flexDirection: 'column',
}
const subHead = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '13px', fontWeight: 800, color: '#3730a3', marginBottom: '6px',
}
const subDesc = {
  fontSize: '11px', color: '#6366f1', margin: '0 0 12px', lineHeight: '1.6', minHeight: '32px',
}
const btnIndigo = {
  padding: '10px 18px', borderRadius: '10px', border: 'none',
  background: '#4f46e5', color: '#fff', fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
}
const btnIndigoOutline = {
  padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #c7d2fe',
  background: '#fff', color: '#4f46e5', fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
}
const errText = { fontSize: '11px', color: '#dc2626', marginTop: '10px', lineHeight: '1.6' }
