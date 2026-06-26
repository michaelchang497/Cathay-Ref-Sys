import { useState } from 'react'
import { LayoutDashboard, Building2, FileText, Settings } from 'lucide-react'
import { STEPS } from './data/mockData'
import LoginScreen from './components/LoginScreen'
import Step1Input from './components/Step1Input'
import Step2AIGenerate from './components/Step2AIGenerate'
import Step3Preview from './components/Step3Preview'
import Step5GreenChannel from './components/Step5GreenChannel'
import Step6VPNSubmit from './components/Step6VPNSubmit'
import Step7Dashboard from './components/Step7Dashboard'
import AdminDashboard from './components/AdminDashboard'
import ClinicManagement from './components/ClinicManagement'

const ADMIN_NAV = [
  { key: 'dashboard', label: '管理儀表板', icon: LayoutDashboard },
  { key: 'clinics', label: '合作診所管理', icon: Building2 },
  { key: 'records', label: '轉診紀錄', icon: FileText, disabled: true },
  { key: 'settings', label: '系統設定', icon: Settings, disabled: true },
]

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [role, setRole] = useState(null)
  const [screen, setScreen] = useState('dashboard')
  const [step, setStep] = useState(1)
  const [adminView, setAdminView] = useState('dashboard')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [referralId, setReferralId] = useState(null)

  function next() { setStep(s => Math.min(s + 1, 5)); window.scrollTo(0, 0) }
  function prev() { setStep(s => Math.max(s - 1, 1)); window.scrollTo(0, 0) }
  function goToStep(s) { setStep(s); window.scrollTo(0, 0) }

  function startReferral() {
    setStep(1)
    setSelectedDoctor(null)
    setSelectedSlot(null)
    setReferralId(null)
    setScreen('referral')
  }

  function backToDashboard() {
    setScreen('dashboard')
    setAdminView('dashboard')
  }

  function handleLogout() {
    setLoggedIn(false)
    setRole(null)
    setScreen('dashboard')
    setAdminView('dashboard')
  }

  const screenProps = {
    next, prev, goToStep, step,
    selectedDoctor, setSelectedDoctor,
    selectedSlot, setSelectedSlot,
    referralId, setReferralId,
    backToDashboard,
  }

  if (!loggedIn) return <LoginScreen onLogin={(r) => { setRole(r); setLoggedIn(true) }} />

  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
      `}</style>

      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #d1fae5',
        padding: '0 32px', height: '56px',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div
          onClick={backToDashboard}
          style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #059669, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
          }}
        >CG</div>
        <span
          onClick={backToDashboard}
          style={{ fontSize: '15px', fontWeight: 700, color: '#064e3b', cursor: 'pointer' }}
        >國泰 AI 智慧轉診平台</span>
        <div style={{ width: '1px', height: '20px', background: '#d1fae5' }} />
        <span style={{ fontSize: '11px', color: '#6b7280' }}>一期規劃 Prototype</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '11px', color: '#6b7280' }}>
          {role === 'admin' ? '國泰醫院 · 管理者' : '仁愛家醫診所 · 李○○ 醫師'}
        </span>
        <button
          onClick={handleLogout}
          style={{
            marginLeft: '12px', padding: '4px 12px', borderRadius: '6px',
            border: '1px solid #e5e7eb', background: '#fff',
            fontSize: '11px', color: '#6b7280', cursor: 'pointer', fontWeight: 600,
          }}
        >登出</button>
      </header>

      {/* Stepper — only show during clinic referral flow */}
      {role === 'clinic' && screen === 'referral' && (
        <div style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '12px 32px', display: 'flex', alignItems: 'center',
          gap: '4px', flexShrink: 0, overflowX: 'auto',
          position: 'sticky', top: '56px', zIndex: 99,
        }}>
          {STEPS.map((s, i) => {
            const isActive = s.num === step
            const isDone = s.num < step
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  onClick={() => isDone && goToStep(s.num)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '99px',
                    cursor: isDone ? 'pointer' : 'default',
                    background: isActive ? '#ecfdf5' : isDone ? '#f0fdf4' : '#fff',
                    border: isActive ? '1.5px solid #059669' : '1.5px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700,
                    background: isDone ? '#059669' : isActive ? '#059669' : '#e5e7eb',
                    color: isDone || isActive ? '#fff' : '#9ca3af',
                  }}>
                    {isDone ? '✓' : s.num}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#059669' : isDone ? '#064e3b' : '#9ca3af',
                    whiteSpace: 'nowrap',
                  }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: '20px', height: '1.5px', margin: '0 2px',
                    background: s.num < step ? '#059669' : '#e5e7eb',
                  }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Admin layout: sidebar + content */}
      {role === 'admin' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <nav style={{
            width: '220px', flexShrink: 0, background: '#fff',
            borderRight: '1px solid #e5e7eb', padding: '18px 12px',
            display: 'flex', flexDirection: 'column', gap: '4px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px 10px' }}>
              管理後台
            </div>
            {ADMIN_NAV.map(item => {
              const Icon = item.icon
              const active = adminView === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => !item.disabled && setAdminView(item.key)}
                  disabled={item.disabled}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '9px', border: 'none',
                    background: active ? '#ecfdf5' : 'transparent',
                    color: item.disabled ? '#d1d5db' : active ? '#059669' : '#4b5563',
                    fontSize: '13px', fontWeight: active ? 700 : 500,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <Icon size={17} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.disabled && <span style={{ fontSize: '9px', color: '#d1d5db' }}>規劃中</span>}
                </button>
              )
            })}
          </nav>
          <main style={{ flex: 1, overflow: 'auto' }}>
            {adminView === 'dashboard' && <AdminDashboard />}
            {adminView === 'clinics' && <ClinicManagement />}
          </main>
        </div>
      )}

      {/* Main Content (clinic) */}
      <main style={{ flex: 1, overflow: 'auto', display: role === 'admin' ? 'none' : 'block' }}>
        {role === 'clinic' && screen === 'dashboard' && <Step7Dashboard startReferral={startReferral} />}
        {role === 'clinic' && screen === 'referral' && step === 1 && <Step1Input {...screenProps} />}
        {role === 'clinic' && screen === 'referral' && step === 2 && <Step2AIGenerate {...screenProps} />}
        {role === 'clinic' && screen === 'referral' && step === 3 && <Step3Preview {...screenProps} />}
        {role === 'clinic' && screen === 'referral' && step === 4 && <Step6VPNSubmit {...screenProps} />}
        {role === 'clinic' && screen === 'referral' && step === 5 && <Step5GreenChannel {...screenProps} />}
      </main>
    </div>
  )
}
