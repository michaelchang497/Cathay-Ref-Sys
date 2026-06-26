import { useState } from 'react'
import { TrendingUp, Users, BarChart3, Clock, Plus, X } from 'lucide-react'
import { CLINIC_STATS, CLINIC_REFERRALS } from '../data/mockData'

const STATUS_MAP = {
  booked: { label: '已掛號', color: '#4f46e5', bg: '#eef2ff' },
  arrived: { label: '已到診', color: '#059669', bg: '#ecfdf5' },
  no_show: { label: '未到診', color: '#dc2626', bg: '#fef2f2' },
}

export default function Step7Dashboard({ startReferral }) {
  const s = CLINIC_STATS
  const [detail, setDetail] = useState(null)

  return (
    <div style={{ padding: '24px 32px', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>轉診總覽</h2>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>仁愛家醫診所</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={<Users size={16} />} label="總轉診數" value={s.totalReferrals} color="#4f46e5" />
        <StatCard icon={<TrendingUp size={16} />} label="本月轉診" value={s.monthReferrals} color="#059669" />
        <StatCard icon={<BarChart3 size={16} />} label="到診率" value={`${s.successRate}%`} color="#0d9488" />
        <StatCard icon={<Clock size={16} />} label="平均等候" value={`${s.avgWaitDays}天`} color="#d97706" />
      </div>

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
            {CLINIC_REFERRALS.map(r => {
              const st = STATUS_MAP[r.status]
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '10px' }}>
                    <span
                      onClick={() => setDetail(r)}
                      style={{
                        fontFamily: 'monospace', fontSize: '11px', fontWeight: 600,
                        color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline',
                        textDecorationColor: '#c7d2fe', textUnderlineOffset: '2px',
                      }}
                    >{r.id}</span>
                  </td>
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

      {/* Detail Modal */}
      {detail && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }} onClick={() => setDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '480px', background: '#fff', borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#064e3b' }}>轉診摘要</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4f46e5', marginTop: '2px' }}>{detail.id}</div>
              </div>
              <button onClick={() => setDetail(null)} style={{
                width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                background: '#f3f4f6', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={14} color="#6b7280" />
              </button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <DetailField label="病患" value={detail.patient} />
                <DetailField label="日期" value={detail.date} />
                <DetailField label="轉入科別" value={detail.dept} />
                <DetailField label="轉入醫師" value={detail.doctor} />
                <DetailField label="轉入院所" value={detail.clinic} />
                <DetailField label="狀態" value={STATUS_MAP[detail.status].label} color={STATUS_MAP[detail.status].color} />
              </div>
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                <DetailField label="診斷" value={detail.diagnosis} />
              </div>
              <div>
                <DetailField label="轉診目的" value={detail.purpose} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailField({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: color || '#1f2937' }}>{value}</div>
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
