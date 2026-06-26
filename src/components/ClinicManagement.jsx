import { useState } from 'react'
import { Plus, Search, Building2, MapPin, Phone, User, X, Check } from 'lucide-react'
import { PARTNER_CLINICS } from '../data/mockData'

const EMPTY_FORM = { name: '', code: '', district: '', contact: '', phone: '' }

export default function ClinicManagement() {
  const [clinics, setClinics] = useState(PARTNER_CLINICS)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = clinics.filter(c =>
    [c.name, c.code, c.district].some(f => f.includes(query.trim()))
  )
  const activeCount = clinics.filter(c => c.status === 'active').length

  function toggleStatus(id) {
    setClinics(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ))
  }

  function addClinic() {
    if (!form.name.trim() || !form.code.trim()) return
    setClinics(prev => [
      { id: Date.now(), ...form, monthReferrals: 0, status: 'active' },
      ...prev,
    ])
    setForm(EMPTY_FORM)
    setModalOpen(false)
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* 標題列 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#064e3b', margin: 0 }}>合作診所管理</h1>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            background: '#059669', color: '#fff', fontSize: '13px', fontWeight: 700,
            boxShadow: '0 1px 4px rgba(5,150,105,0.3)',
          }}
        >
          <Plus size={16} /> 新增合作診所
        </button>
      </div>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>
        共 {clinics.length} 間合作診所，其中 {activeCount} 間啟用中
      </p>

      {/* 搜尋 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '9px 14px', marginBottom: '16px', maxWidth: '360px',
      }}>
        <Search size={16} color="#9ca3af" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜尋診所名稱 / 院所代碼 / 區域"
          style={{ border: 'none', outline: 'none', fontSize: '13px', flex: 1, color: '#1f2937' }}
        />
      </div>

      {/* 診所列表 */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: '1px solid #e5e7eb', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
              {['診所名稱', '院所代碼', '區域', '聯絡窗口', '本月轉診', '狀態', '操作'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: '11px', fontWeight: 700, color: '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1f2937' }}>{c.name}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>{c.code}</td>
                <td style={{ padding: '12px 14px', color: '#6b7280' }}>{c.district}</td>
                <td style={{ padding: '12px 14px', color: '#6b7280' }}>{c.contact}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#064e3b' }}>{c.monthReferrals} 件</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '99px',
                    background: c.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                    color: c.status === 'active' ? '#059669' : '#9ca3af',
                  }}>{c.status === 'active' ? '啟用中' : '已停用'}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <button
                    onClick={() => toggleStatus(c.id)}
                    style={{
                      padding: '4px 12px', borderRadius: '6px', cursor: 'pointer',
                      border: '1px solid #e5e7eb', background: '#fff',
                      fontSize: '11px', fontWeight: 600,
                      color: c.status === 'active' ? '#dc2626' : '#059669',
                    }}
                  >{c.status === 'active' ? '停用' : '啟用'}</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>查無符合的診所</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新增診所 Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', width: '440px', maxWidth: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#059669" />
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#064e3b', margin: 0 }}>新增合作診所</h2>
              </div>
              <X size={18} color="#9ca3af" style={{ cursor: 'pointer' }} onClick={() => setModalOpen(false)} />
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 18px' }}>填寫後即建立合作關係，預設為啟用狀態（示意操作）。</p>

            <FormRow icon={<Building2 size={14} />} label="診所名稱" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="例：仁愛家醫診所" />
            <FormRow icon={<span style={{ fontSize: '11px', fontWeight: 800 }}>#</span>} label="院所代碼" value={form.code} onChange={v => setForm({ ...form, code: v })} placeholder="例：3701010018" />
            <FormRow icon={<MapPin size={14} />} label="區域" value={form.district} onChange={v => setForm({ ...form, district: v })} placeholder="例：台北市大安區" />
            <FormRow icon={<User size={14} />} label="聯絡窗口" value={form.contact} onChange={v => setForm({ ...form, contact: v })} placeholder="例：李○○ 醫師" />
            <FormRow icon={<Phone size={14} />} label="聯絡電話" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="例：(02) 2701-1234" />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '9px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}
              >取消</button>
              <button
                onClick={addClinic}
                disabled={!form.name.trim() || !form.code.trim()}
                style={{
                  flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                  background: (!form.name.trim() || !form.code.trim()) ? '#a7f3d0' : '#059669',
                  color: '#fff', fontSize: '13px', fontWeight: 700,
                  cursor: (!form.name.trim() || !form.code.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              ><Check size={15} /> 確認新增</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormRow({ icon, label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '5px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '9px', padding: '9px 12px' }}>
        <span style={{ color: '#9ca3af', display: 'flex' }}>{icon}</span>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ border: 'none', outline: 'none', fontSize: '13px', flex: 1, color: '#1f2937' }}
        />
      </div>
    </div>
  )
}
