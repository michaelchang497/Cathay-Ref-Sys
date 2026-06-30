import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft, Wifi, Lock, Mail, FileText, CheckCircle, X, Sparkles, ExternalLink } from 'lucide-react'
import { PATIENT } from '../data/mockData'

const CGH_REG_URL = 'https://reg.cgh.org.tw/tw/reg/main_01.jsp'

const VPN_STEPS = [
  { id: 'xml', label: '轉診單 XML/PDF 產生', icon: FileText, duration: 800 },
  { id: 'vpn', label: 'VPN 安全通道連線', icon: Lock, duration: 1200 },
  { id: 'upload', label: '上傳至健保署', icon: Wifi, duration: 1500 },
  { id: 'confirm', label: '傳輸狀態確認', icon: CheckCircle, duration: 600 },
  { id: 'email', label: 'Email 通知寄發', icon: Mail, duration: 500 },
]

export default function Step6VPNSubmit({ next, prev, selectedDoctor, selectedSlot, setReferralId, backToDashboard }) {
  const [phase, setPhase] = useState('ready')
  const [stepStatus, setStepStatus] = useState({})
  const [currentStep, setCurrentStep] = useState(null)
  const [genRefId, setGenRefId] = useState(null)
  const [showRegModal, setShowRegModal] = useState(false)
  const timeoutsRef = useRef([])

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), [])

  function startSubmit() {
    setPhase('submitting')
    let delay = 300

    VPN_STEPS.forEach(step => {
      schedule(() => {
        setCurrentStep(step.id)
        setStepStatus(p => ({ ...p, [step.id]: 'running' }))
      }, delay)
      delay += step.duration
      schedule(() => {
        setStepStatus(p => ({ ...p, [step.id]: 'done' }))
      }, delay)
    })

    delay += 500
    schedule(() => {
      const refId = `REF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`
      setGenRefId(refId)
      setReferralId(refId)
      setPhase('done')
    }, delay)
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 4 — VPN 電子轉診送件</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>透過健保 VPN 安全通道上傳轉診資料</p>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Left: Summary */}
        <div style={{
          flex: 1, minWidth: 0, background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', padding: '20px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            送件摘要
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['病患', `${PATIENT.name}（${PATIENT.insuranceId}）`],
              ['轉入院所', '國泰綜合醫院'],
              ['轉入科別', '心臟內科'],
              ['轉入醫師', selectedDoctor?.name || '—'],
              ['預約時段', selectedSlot ? `${selectedSlot.date} ${selectedSlot.period} ${selectedSlot.time}` : '—'],
              ['診號', selectedSlot?.slotId || '—'],
              ['開單醫師', PATIENT.clinicDoctor],
              ['開單診所', PATIENT.clinic],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', fontSize: '13px' }}>
                <span style={{ width: '100px', flexShrink: 0, fontWeight: 600, color: '#6b7280' }}>{label}</span>
                <span style={{ color: '#1f2937' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Security badges */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['HTTPS/TLS 1.3', '健保 VPN', 'XML/PDF 格式', '數位簽章'].map(tag => (
              <span key={tag} style={{
                fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '99px',
                background: '#f0fdf4', color: '#059669', border: '1px solid #d1fae5',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Lock size={9} /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: VPN Progress */}
        <div style={{
          width: '320px', flexShrink: 0, background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            VPN 傳輸狀態
          </div>

          {phase === 'ready' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Wifi size={40} color="#d1d5db" style={{ marginBottom: '12px' }} />
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>確認送件內容無誤後開始傳輸</div>
              <button onClick={startSubmit} style={{
                padding: '12px 32px', borderRadius: '10px', border: 'none',
                background: '#059669', color: '#fff', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
              }}>
                開始 VPN 傳輸
              </button>
            </div>
          )}

          {(phase === 'submitting' || phase === 'done') && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {VPN_STEPS.map(step => {
                  const status = stepStatus[step.id]
                  const Icon = step.icon
                  return (
                    <div key={step.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', borderRadius: '8px',
                      background: status === 'running' ? '#f0fdf4' : '#fff',
                      border: `1px solid ${status === 'running' ? '#d1fae5' : '#f3f4f6'}`,
                      transition: 'all 0.2s',
                    }}>
                      <Icon size={14} color={status === 'done' ? '#059669' : status === 'running' ? '#0d9488' : '#d1d5db'} />
                      <span style={{
                        flex: 1, fontSize: '12px', fontWeight: 500,
                        color: status === 'done' ? '#064e3b' : status === 'running' ? '#0d9488' : '#9ca3af',
                      }}>{step.label}</span>
                      {status === 'running' && (
                        <div style={{
                          width: '12px', height: '12px', border: '2px solid #059669',
                          borderTopColor: 'transparent', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      )}
                      {status === 'done' && <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>✓</span>}
                    </div>
                  )
                })}
              </div>

              {phase === 'done' && (
                <div style={{
                  padding: '14px', borderRadius: '10px',
                  background: '#ecfdf5', border: '1.5px solid #6ee7b7',
                  textAlign: 'center', animation: 'fadeIn 0.3s ease',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>✅</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>傳輸成功</div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: '14px', fontWeight: 700,
                    color: '#064e3b', padding: '4px 12px', borderRadius: '6px',
                    background: '#fff', display: 'inline-block', border: '1px solid #d1fae5',
                  }}>
                    {genRefId}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                    📧 Email 通知已寄至診所與院方
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button onClick={() => setShowRegModal(true)} disabled={phase !== 'done'} style={phase === 'done' ? btnPrimary : btnDisabled}>
          下一步：綠色通道掛號預約 <ChevronRight size={16} />
        </button>
      </div>

      {/* 掛號方式選擇彈窗 */}
      {showRegModal && (
        <div
          onClick={() => setShowRegModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(6,78,59,0.35)', backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '460px', background: '#fff',
              borderRadius: '16px', padding: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '4px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#064e3b', margin: 0 }}>選擇掛號方式</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>轉診單已送出，請為病患安排國泰綜合醫院門診</p>
              </div>
              <button onClick={() => setShowRegModal(false)} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', padding: '2px',
              }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
              {/* 選項 1：智慧轉診平台掛號 */}
              <button
                onClick={() => { setShowRegModal(false); next() }}
                style={regOption(true)}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg,#059669,#0d9488)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <Sparkles size={19} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    使用智慧轉診平台掛號
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px', background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>推薦</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>綠色通道預留診號，直接選位，無需離開系統</div>
                </div>
                <ChevronRight size={16} color="#059669" />
              </button>

              {/* 選項 2：國泰綜合醫院網路掛號 */}
              <button
                onClick={() => { window.open(CGH_REG_URL, '_blank', 'noopener,noreferrer'); setShowRegModal(false) }}
                style={regOption(false)}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
                }}>
                  <ExternalLink size={18} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>使用國泰綜合醫院網路掛號</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>另開官方網路掛號頁面（reg.cgh.org.tw）</div>
                </div>
                <ExternalLink size={15} color="#9ca3af" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const regOption = (primary) => ({
  display: 'flex', alignItems: 'center', gap: '12px',
  padding: '14px', borderRadius: '12px', cursor: 'pointer', width: '100%',
  background: '#fff',
  border: `1.5px solid ${primary ? '#6ee7b7' : '#e5e7eb'}`,
  transition: 'all 0.15s',
})

const btnPrimary = {
  padding: '10px 24px', borderRadius: '10px', border: 'none',
  background: '#059669', color: '#fff', fontSize: '13px', fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
}
const btnSecondary = {
  padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
  background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
}
const btnDisabled = {
  ...btnPrimary, background: '#d1d5db', boxShadow: 'none', cursor: 'not-allowed',
}
