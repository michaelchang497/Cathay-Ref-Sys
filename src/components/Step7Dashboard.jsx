import { BarChart3, TrendingUp, Users, Clock, Wifi, Star, Plus } from 'lucide-react'
import { DASHBOARD_STATS } from '../data/mockData'

const STATUS_MAP = {
  booked: { label: '已掛號', color: '#4f46e5', bg: '#eef2ff' },
  vpn_sent: { label: 'VPN 已送', color: '#0d9488', bg: '#f0fdfa' },
  completed: { label: '已完成', color: '#059669', bg: '#ecfdf5' },
  feedback_sent: { label: '已回覆', color: '#7c3aed', bg: '#f5f3ff' },
}

export default function Step7Dashboard({ startReferral }) {
  const s = DASHBOARD_STATS

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>管理儀表板</h2>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>轉診績效分析與雙向回饋管理</p>
        </div>
        <button onClick={startReferral} style={{
          padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
          background: '#059669', color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 8px rgba(5,150,105,0.2)',
        }}>
          <Plus size={14} /> 開立轉診單
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <StatCard icon={<Users size={16} />} label="總轉診數" value={s.totalReferrals.toLocaleString()} color="#4f46e5" />
        <StatCard icon={<TrendingUp size={16} />} label="本月轉診" value={s.monthReferrals} color="#059669" />
        <StatCard icon={<BarChart3 size={16} />} label="到診率" value={`${s.successRate}%`} color="#0d9488" />
        <StatCard icon={<Clock size={16} />} label="平均等候" value={`${s.avgWaitDays}天`} color="#d97706" />
        <StatCard icon={<Wifi size={16} />} label="VPN 成功率" value={`${s.vpnSuccessRate}%`} color="#7c3aed" />
        <StatCard icon={<Star size={16} />} label="滿意度" value={`${s.patientSatisfaction}/5`} color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Top Clinics */}
        <div style={{
          background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', padding: '18px 22px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            診所來源分析（本月）
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {s.topClinics.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: i === 0 ? '#059669' : '#f3f4f6',
                  color: i === 0 ? '#fff' : '#6b7280',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: '13px', color: '#1f2937' }}>{c.name}</span>
                <div style={{ width: '100px' }}>
                  <div style={{
                    height: '6px', borderRadius: '99px', background: '#f3f4f6',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      background: '#059669', width: `${(c.count / 50) * 100}%`,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#064e3b', width: '30px', textAlign: 'right' }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Departments */}
        <div style={{
          background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', padding: '18px 22px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            轉診科別分布
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {s.topDepts.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '13px', fontWeight: 600, color: '#1f2937', flex: 1,
                }}>{d.name}</span>
                <div style={{ width: '120px' }}>
                  <div style={{ height: '6px', borderRadius: '99px', background: '#f3f4f6' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      background: i === 0 ? '#4f46e5' : '#93c5fd',
                      width: `${d.pct * 5}%`,
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280', width: '40px', textAlign: 'right' }}>{d.count}件</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#4f46e5', width: '35px', textAlign: 'right' }}>{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #e5e7eb', padding: '18px 22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
          近期轉診紀錄
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
              {['轉診單號', '病患', '科別', '醫師', '狀態', '日期'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.recentReferrals.map(r => {
              const st = STATUS_MAP[r.status]
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: '#4f46e5' }}>{r.id}</td>
                  <td style={{ padding: '10px', color: '#1f2937' }}>{r.patient}</td>
                  <td style={{ padding: '10px', color: '#6b7280' }}>{r.dept}</td>
                  <td style={{ padding: '10px', color: '#6b7280' }}>{r.doctor}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                      background: st.bg, color: st.color,
                    }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '10px', color: '#9ca3af', fontSize: '12px' }}>{r.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '12px',
      border: '1px solid #e5e7eb', padding: '14px 16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ color, marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937' }}>{value}</div>
      <div style={{ fontSize: '10px', fontWeight: 500, color: '#9ca3af' }}>{label}</div>
    </div>
  )
}
