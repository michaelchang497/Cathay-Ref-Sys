import { useState } from 'react'
import { BarChart3, TrendingUp, Users, Clock, Wifi, Star, X } from 'lucide-react'
import { DASHBOARD_STATS } from '../data/mockData'

const STATUS_MAP = {
  booked: { label: '已掛號', color: '#4f46e5', bg: '#eef2ff' },
  arrived: { label: '已到診', color: '#059669', bg: '#ecfdf5' },
  no_show: { label: '未到診', color: '#dc2626', bg: '#fef2f2' },
}

export default function AdminDashboard() {
  const s = DASHBOARD_STATS
  const [detail, setDetail] = useState(null)

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>管理儀表板</h2>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>轉診績效分析與雙向回饋管理</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <StatCard icon={<Users size={16} />} label="總轉診數" value={s.totalReferrals.toLocaleString()} color="#4f46e5" />
        <StatCard icon={<TrendingUp size={16} />} label="本月轉診" value={s.monthReferrals} color="#059669" />
        <StatCard icon={<BarChart3 size={16} />} label="到診率" value={`${s.successRate}%`} color="#0d9488" />
        <StatCard icon={<Clock size={16} />} label="平均等候" value={`${s.avgWaitDays}天`} color="#d97706" />
        <StatCard icon={<Wifi size={16} />} label="VPN 成功率" value={`${s.vpnSuccessRate}%`} color="#7c3aed" />
        <StatCard icon={<Star size={16} />} label="滿意度" value={`${s.patientSatisfaction}/5`} color="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
                  <div style={{ height: '6px', borderRadius: '99px', background: '#f3f4f6' }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      background: '#059669', width: `${(c.count / 50) * 100}%`,
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#064e3b', width: '30px', textAlign: 'right' }}>{c.count}</span>
              </div>
            ))}
          </div>
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
                {['轉診單號', '狀態', '日期'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.recentReferrals.map(r => {
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

      <ClinicTrendChart trend={s.clinicTrend} />

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
                <DetailField label="轉出院所" value={detail.clinic} />
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

function ClinicTrendChart({ trend }) {
  const [period, setPeriod] = useState('month')
  const { periods, series } = trend[period]

  // 圖表座標系
  const W = 920, H = 300
  const padL = 36, padR = 16, padT = 16, padB = 32
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const maxV = Math.max(...series.flatMap(s => s.values))
  const yMax = Math.max(5, Math.ceil(maxV / 5) * 5)
  const ticks = 5

  const xAt = i => padL + (periods.length <= 1 ? 0 : (plotW * i) / (periods.length - 1))
  const yAt = v => padT + plotH - (plotH * v) / yMax

  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1px solid #e5e7eb', padding: '18px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          各診所來源轉診數趨勢
        </div>
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '8px', padding: '3px' }}>
          {[['week', '週'], ['month', '月']].map(([k, label]) => (
            <button key={k} onClick={() => setPeriod(k)} style={{
              padding: '4px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700,
              background: period === k ? '#fff' : 'transparent',
              color: period === k ? '#064e3b' : '#9ca3af',
              boxShadow: period === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        {/* 水平格線 + Y 軸刻度 */}
        {Array.from({ length: ticks + 1 }, (_, k) => {
          const v = (yMax / ticks) * k
          const y = yAt(v)
          return (
            <g key={k}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{Math.round(v)}</text>
            </g>
          )
        })}

        {/* X 軸標籤 */}
        {periods.map((p, i) => (
          <text key={p} x={xAt(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#9ca3af">{p}</text>
        ))}

        {/* 每間診所一條折線 */}
        {series.map(s => (
          <g key={s.name}>
            <polyline
              fill="none" stroke={s.color} strokeWidth="2.5"
              strokeLinejoin="round" strokeLinecap="round"
              points={s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')}
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2">
                <title>{`${s.name} ${periods[i]}：${v} 件`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>

      {/* 圖例 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
        {series.map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', borderRadius: '99px', background: s.color }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{s.name}</span>
          </div>
        ))}
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
