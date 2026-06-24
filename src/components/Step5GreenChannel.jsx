import { ChevronRight, ChevronLeft, CalendarCheck, MapPin } from 'lucide-react'
import { GREEN_CHANNEL_SLOTS, PATIENT } from '../data/mockData'

export default function Step5GreenChannel({ next, prev, selectedDoctor, selectedSlot, setSelectedSlot }) {
  const doctorSlots = selectedDoctor
    ? GREEN_CHANNEL_SLOTS.filter(s => s.doctor === selectedDoctor.name)
    : GREEN_CHANNEL_SLOTS

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 5 — 綠色通道掛號預約</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>為病患預約轉診預留診號，直接選位</p>

      {/* Info Bar */}
      <div style={{
        display: 'flex', gap: '16px', marginBottom: '16px',
        padding: '12px 16px', borderRadius: '10px',
        background: '#fff', border: '1px solid #e5e7eb',
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <b style={{ color: '#1f2937' }}>病患：</b>{PATIENT.name}（{PATIENT.age}歲/{PATIENT.gender}）
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <b style={{ color: '#1f2937' }}>轉入科別：</b>心臟內科
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <b style={{ color: '#1f2937' }}>指定醫師：</b>{selectedDoctor?.name || '不指定'}
        </div>
      </div>

      {/* Slot Grid */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #e5e7eb', padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: 700, color: '#064e3b', marginBottom: '14px',
        }}>
          <CalendarCheck size={14} /> 轉診預留診號
          <span style={{
            fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
            background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
          }}>
            {doctorSlots.length} 個可用時段
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {doctorSlots.map(slot => {
            const isSelected = selectedSlot?.slotId === slot.slotId
            return (
              <div
                key={slot.slotId}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 18px', borderRadius: '10px',
                  border: isSelected ? '2px solid #059669' : '1px solid #f3f4f6',
                  background: isSelected ? '#f0fdf4' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {/* Date */}
                <div style={{ width: '120px', flexShrink: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>{slot.date}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{slot.period} {slot.time}</div>
                </div>

                {/* Doctor */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{slot.doctor} 醫師</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9ca3af' }}>
                    <MapPin size={10} /> {slot.deptRoom}
                  </div>
                </div>

                {/* Reserved Badge */}
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
                  background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
                }}>轉診預留</span>

                {/* Slot ID */}
                <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#9ca3af' }}>{slot.slotId}</span>

                {/* Radio */}
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: isSelected ? '2px solid #059669' : '2px solid #d1d5db',
                  background: isSelected ? '#059669' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {isSelected && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedSlot && (
        <div style={{
          marginTop: '16px', padding: '14px 18px', borderRadius: '10px',
          background: '#ecfdf5', border: '1.5px solid #6ee7b7',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <CalendarCheck size={20} color="#059669" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>
              已選定：{selectedSlot.date} {selectedSlot.period} {selectedSlot.time}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {selectedSlot.doctor} 醫師 · {selectedSlot.deptRoom} · 診號 {selectedSlot.slotId}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button onClick={next} disabled={!selectedSlot} style={selectedSlot ? btnPrimary : btnDisabled}>
          下一步：VPN 送件 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

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
