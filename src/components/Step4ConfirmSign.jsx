import { useState } from 'react'
import { ChevronRight, ChevronLeft, Shield, Edit3, FileText, X, Plus } from 'lucide-react'
import { PATIENT, AI_REFERRAL_CONTENT, AI_ICD_CODES } from '../data/mockData'

const ICD_SUGGESTIONS = [
  { code: 'I50.1', desc: 'Left ventricular failure' },
  { code: 'I50.2', desc: 'Systolic heart failure' },
  { code: 'I50.9', desc: 'Heart failure, unspecified' },
  { code: 'I11.0', desc: 'Hypertensive heart disease with HF' },
  { code: 'I10', desc: 'Essential hypertension' },
  { code: 'I25.10', desc: 'Atherosclerotic heart disease' },
  { code: 'E11.65', desc: 'Type 2 DM with hyperglycemia' },
  { code: 'E11.9', desc: 'Type 2 DM without complications' },
  { code: 'E78.5', desc: 'Dyslipidemia, unspecified' },
  { code: 'R06.0', desc: 'Dyspnea' },
  { code: 'R06.00', desc: 'Dyspnea, unspecified' },
  { code: 'R60.0', desc: 'Localized edema' },
]

const REFERRAL_PURPOSES = [
  { id: 'emergency', label: '急診治療' },
  { id: 'inpatient', label: '住院治療' },
  { id: 'outpatient', label: '門診治療' },
  { id: 'exam', label: '進一步檢查，檢查項目' },
  { id: 'followup', label: '轉回轉出或適當之院所繼續追蹤' },
  { id: 'other', label: '其他' },
]

export default function Step4ConfirmSign({ next, prev, selectedDoctor }) {
  const [signed, setSigned] = useState(false)
  const [signing, setSigning] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [content, setContent] = useState(AI_REFERRAL_CONTENT)
  const [icdCodes, setIcdCodes] = useState(AI_ICD_CODES.slice(0, 3))
  const [icdInput, setIcdInput] = useState('')
  const [showIcdAdd, setShowIcdAdd] = useState(false)
  const [referralPurpose, setReferralPurpose] = useState('outpatient')
  const [examDetail, setExamDetail] = useState('心臟超音波、冠狀動脈電腦斷層')

  const icdFiltered = icdInput.trim()
    ? ICD_SUGGESTIONS.filter(s =>
        s.code.toLowerCase().includes(icdInput.toLowerCase()) ||
        s.desc.toLowerCase().includes(icdInput.toLowerCase())
      ).filter(s => !icdCodes.some(c => c.code === s.code)).slice(0, 5)
    : []

  function handleSign() {
    setSigning(true)
    setTimeout(() => { setSigning(false); setSigned(true) }, 2000)
  }

  const fields = [
    { label: 'A. 病情摘要（主訴及簡短病史）', key: 'chiefComplaint' },
    { label: '現病史', key: 'presentIllness' },
    { label: '過去病史', key: 'pastHistory' },
    { label: '目前用藥', key: 'currentMeds' },
    { label: 'C. 檢查及治療摘要', key: 'abnormalFindings' },
    { label: '轉診原因', key: 'referralReason' },
  ]

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 3 — 確認轉診內容並數位簽章</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>審核 AI 生成的轉診單內容，確認後進行數位簽章</p>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Referral Form */}
        <div style={{
          flex: 1, minWidth: 0, background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', padding: '20px 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#064e3b' }}>
              <FileText size={14} /> 電子轉診單
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: editMode ? '#fef3c7' : '#f3f4f6', color: editMode ? '#92400e' : '#6b7280',
                border: `1px solid ${editMode ? '#fde68a' : '#e5e7eb'}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <Edit3 size={12} /> {editMode ? '完成修改' : '人工修訂'}
            </button>
          </div>

          {/* Patient Summary */}
          <div style={{
            padding: '10px 14px', borderRadius: '8px', marginBottom: '10px',
            background: '#f9fafb', border: '1px solid #f3f4f6',
            display: 'flex', gap: '16px', fontSize: '12px', color: '#374151', flexWrap: 'wrap',
          }}>
            <span><b>病患：</b>{PATIENT.name}</span>
            <span><b>年齡：</b>{PATIENT.age}歲/{PATIENT.gender}</span>
            <span><b>身分證號：</b>{PATIENT.insuranceId}</span>
            <span><b>轉入科別：</b>心臟內科</span>
            <span><b>轉入醫師：</b>{selectedDoctor?.name || '—'}</span>
          </div>

          {/* Drug Allergy */}
          <div style={{
            padding: '8px 14px', borderRadius: '8px', marginBottom: '14px',
            background: '#fef2f2', border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
          }}>
            <span style={{ fontWeight: 700, color: '#dc2626', flexShrink: 0 }}>藥物過敏史</span>
            <span style={{ color: '#991b1b' }}>{PATIENT.drugAllergy}</span>
          </div>

          {/* Referral Purpose */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>轉診目的</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {REFERRAL_PURPOSES.map(p => (
                <label key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                  background: referralPurpose === p.id ? '#ecfdf5' : '#fff',
                  border: `1.5px solid ${referralPurpose === p.id ? '#6ee7b7' : '#f3f4f6'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    border: `2px solid ${referralPurpose === p.id ? '#059669' : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {referralPurpose === p.id && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: referralPurpose === p.id ? 600 : 400,
                    color: referralPurpose === p.id ? '#064e3b' : '#6b7280',
                  }}>{p.label}</span>
                  <input
                    type="radio" name="purpose" value={p.id}
                    checked={referralPurpose === p.id}
                    onChange={() => setReferralPurpose(p.id)}
                    style={{ display: 'none' }}
                  />
                </label>
              ))}
            </div>
            {referralPurpose === 'exam' && (
              <input
                value={examDetail}
                onChange={e => setExamDetail(e.target.value)}
                placeholder="請填寫檢查項目..."
                style={{
                  marginTop: '8px', width: '100%', height: '34px', padding: '0 10px',
                  borderRadius: '7px', border: '1.5px solid #d1fae5', fontSize: '12px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            )}
          </div>

          {/* ICD Codes */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>診斷碼 (ICD-10)</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {icdCodes.map(icd => (
                <span key={icd.code} style={{
                  fontFamily: 'monospace', fontSize: '11px', fontWeight: 600,
                  padding: '3px 8px', borderRadius: '6px',
                  background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}>
                  {icd.code} {icd.desc}
                  {editMode && (
                    <X
                      size={12}
                      style={{ cursor: 'pointer', color: '#dc2626', flexShrink: 0 }}
                      onClick={() => setIcdCodes(prev => prev.filter(c => c.code !== icd.code))}
                    />
                  )}
                </span>
              ))}
              {editMode && !showIcdAdd && (
                <button
                  onClick={() => setShowIcdAdd(true)}
                  style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    color: '#6b7280', background: '#f3f4f6', border: '1px dashed #d1d5db',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <Plus size={12} /> 新增
                </button>
              )}
            </div>
            {editMode && showIcdAdd && (
              <div style={{ marginTop: '8px', position: 'relative' }}>
                <input
                  value={icdInput}
                  onChange={e => setIcdInput(e.target.value)}
                  placeholder="輸入診斷碼或關鍵字搜尋..."
                  autoFocus
                  style={{
                    width: '320px', height: '34px', padding: '0 10px', borderRadius: '7px',
                    border: '1.5px solid #d1fae5', fontSize: '12px', outline: 'none',
                    fontFamily: 'monospace', boxSizing: 'border-box',
                  }}
                  onBlur={() => setTimeout(() => { setShowIcdAdd(false); setIcdInput('') }, 200)}
                />
                {icdFiltered.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '38px', left: 0, width: '400px', zIndex: 10,
                    background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
                  }}>
                    {icdFiltered.map(s => (
                      <div
                        key={s.code}
                        onMouseDown={() => {
                          setIcdCodes(prev => [...prev, { code: s.code, desc: s.desc, confidence: null }])
                          setIcdInput('')
                          setShowIcdAdd(false)
                        }}
                        style={{
                          padding: '8px 12px', cursor: 'pointer', fontSize: '12px',
                          display: 'flex', gap: '8px', alignItems: 'center',
                          borderBottom: '1px solid #f3f4f6',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                      >
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#059669', width: '60px' }}>{s.code}</span>
                        <span style={{ color: '#374151' }}>{s.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {fields.map(f => (
              <div key={f.key}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#059669', marginBottom: '4px' }}>{f.label}</div>
                {editMode ? (
                  <textarea
                    value={content[f.key]}
                    onChange={e => setContent(p => ({ ...p, [f.key]: e.target.value }))}
                    rows={f.key === 'presentIllness' ? 4 : 2}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: '7px',
                      border: '1.5px solid #fde68a', fontSize: '12px', outline: 'none',
                      lineHeight: '1.6', resize: 'vertical', fontFamily: 'inherit',
                      background: '#fffbeb', boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{content[f.key]}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Signature Panel */}
        <div style={{
          width: '280px', flexShrink: 0, background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', padding: '20px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#064e3b' }}>
            <Shield size={14} /> 數位簽章
          </div>

          <div style={{
            padding: '12px', borderRadius: '10px', background: '#f9fafb', border: '1px solid #f3f4f6',
            fontSize: '12px', color: '#6b7280', lineHeight: '1.6',
          }}>
            <div style={{ fontWeight: 600, color: '#374151', marginBottom: '4px' }}>簽章方式</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
              }}>醫事人員憑證卡</span>
              <span style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb',
              }}>mHPC 行動憑證</span>
            </div>
            <div>簽章後文件具備時間戳記與不可否認性，符合電子簽章法</div>
          </div>

          <div style={{
            padding: '16px', borderRadius: '10px',
            background: signed ? '#ecfdf5' : '#f9fafb',
            border: `1.5px solid ${signed ? '#6ee7b7' : '#e5e7eb'}`,
            textAlign: 'center', transition: 'all 0.3s',
          }}>
            {signed ? (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>✅</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>簽章完成</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                  {new Date().toLocaleString('zh-TW')}
                </div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                  簽章者：{PATIENT.clinicDoctor}
                </div>
              </div>
            ) : signing ? (
              <div>
                <div style={{
                  width: '24px', height: '24px', border: '3px solid #059669',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 8px',
                }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>驗證憑證中...</div>
              </div>
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                請插入醫事人員憑證卡或使用 mHPC
              </div>
            )}
          </div>

          {!signed && (
            <button
              onClick={handleSign}
              disabled={signing}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: signing ? '#d1d5db' : '#059669', color: '#fff',
                fontSize: '14px', fontWeight: 700, cursor: signing ? 'wait' : 'pointer',
                boxShadow: signing ? 'none' : '0 2px 8px rgba(5,150,105,0.25)',
              }}
            >
              {signing ? '簽章處理中...' : '執行數位簽章'}
            </button>
          )}

          {/* Compliance */}
          <div style={{
            padding: '8px 10px', borderRadius: '6px',
            background: '#f0fdf4', fontSize: '10px', color: '#6b7280', lineHeight: '1.5',
          }}>
            符合健保署電子轉診格式（XML/PDF）
            <br />HTTPS/TLS 1.3 加密傳輸
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button onClick={next} disabled={!signed} style={signed ? btnPrimary : btnDisabled}>
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
