import { useState } from 'react'
import { CreditCard, Cpu, Shield, LogIn, Building2, Stethoscope } from 'lucide-react'

export default function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('health')
  const [pin, setPin] = useState('••••••')
  const [verifying, setVerifying] = useState(false)

  function handleLogin() {
    setVerifying(true)
    setTimeout(() => { setVerifying(false); onLogin() }, 1500)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #f0f9ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '480px', animation: 'fadeIn 0.4s ease' }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(5,150,105,0.25)',
          }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>CG</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#064e3b', marginBottom: '4px' }}>國泰 AI 智慧轉診平台</h1>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>合作診所轉診作業系統</p>
        </div>

        {/* Clinic Context Card */}
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
          padding: '14px 18px', marginBottom: '12px',
          display: 'flex', alignItems: 'center', gap: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: '#f0fdf4', border: '1px solid #d1fae5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={20} color="#059669" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>仁愛家醫診所</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>機構代碼 3701010018 · 台北市大安區</div>
          </div>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#059669', boxShadow: '0 0 6px rgba(5,150,105,0.5)',
          }} />
        </div>

        {/* Login Card */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e5e7eb', overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Stethoscope size={16} color="#059669" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>醫師身分驗證</span>
            <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>轉診開單需以醫事人員卡登入</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
            {[
              { id: 'health', label: '健保讀卡機', icon: CreditCard },
              { id: 'chip', label: '晶片讀卡機', icon: Cpu },
            ].map(t => {
              const isActive = tab === t.id
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, padding: '12px', border: 'none',
                    borderBottom: isActive ? '2.5px solid #059669' : '2.5px solid transparent',
                    background: isActive ? '#f0fdf4' : '#fff',
                    color: isActive ? '#059669' : '#9ca3af',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={14} /> {t.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div style={{ padding: '24px 24px 20px' }}>
            {tab === 'health' ? (
              <div>
                <div style={{
                  padding: '14px', borderRadius: '10px',
                  background: '#f0fdf4', border: '1.5px solid #d1fae5',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CreditCard size={18} color="#059669" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>醫事人員卡已偵測</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>讀卡機狀態：已連線</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', width: '10px', height: '10px', borderRadius: '50%',
                    background: '#059669', boxShadow: '0 0 6px rgba(5,150,105,0.5)',
                  }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <InfoRow label="持卡人" value="李○○ 醫師" />
                  <InfoRow label="卡片類型" value="醫事人員憑證卡" />
                  <InfoRow label="醫事機構" value="仁愛家醫診所" />
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  padding: '14px', borderRadius: '10px',
                  background: '#f0fdf4', border: '1.5px solid #d1fae5',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Cpu size={18} color="#059669" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>晶片讀卡機已連線</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>裝置：ACR39U IC Card Reader</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', width: '10px', height: '10px', borderRadius: '50%',
                    background: '#059669', boxShadow: '0 0 6px rgba(5,150,105,0.5)',
                  }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>PIN 碼</label>
                  <input
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    type="password"
                    style={{
                      width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                      border: '1.5px solid #d1fae5', fontSize: '14px', outline: 'none',
                      fontFamily: 'monospace', letterSpacing: '4px', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <InfoRow label="持卡人" value="李○○ 醫師" />
                  <InfoRow label="醫事機構" value="仁愛家醫診所" />
                </div>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={verifying}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: verifying ? '#d1d5db' : '#059669', color: '#fff',
                fontSize: '14px', fontWeight: 700,
                cursor: verifying ? 'wait' : 'pointer',
                boxShadow: verifying ? 'none' : '0 2px 8px rgba(5,150,105,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', marginTop: '16px',
              }}
            >
              {verifying ? (
                <>
                  <div style={{
                    width: '16px', height: '16px', border: '2px solid #fff',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  驗證中...
                </>
              ) : (
                <>
                  <Shield size={16} /> 確認登入
                </>
              )}
            </button>
          </div>

          <div style={{
            padding: '10px 20px', borderTop: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            fontSize: '10px', color: '#9ca3af',
          }}>
            <Shield size={10} /> HTTPS/TLS 1.3 加密連線 · 健保 VPN 安全通道
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', fontSize: '13px' }}>
      <span style={{ width: '90px', flexShrink: 0, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
      <span style={{ color: '#1f2937', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
