import { useState } from 'react'
import { ChevronRight, ChevronLeft, Shield, FileCheck, Building2 } from 'lucide-react'
import { PATIENT, AI_REFERRAL_CONTENT, AI_ICD_CODES, AI_RECOMMENDED_DEPT } from '../data/mockData'

export default function Step3Preview({ next, prev, selectedDoctor }) {
  const [signed, setSigned] = useState(false)
  const [signing, setSigning] = useState(false)

  function handleSign() {
    setSigning(true)
    setTimeout(() => { setSigning(false); setSigned(true) }, 2000)
  }

  const c = AI_REFERRAL_CONTENT
  const icdDisplay = AI_ICD_CODES.slice(0, 3)
  const transferDept = AI_RECOMMENDED_DEPT.department

  const today = new Date()
  const openDate = today.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const expireDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 3 — 預覽確認與簽章</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>確認轉診單內容無誤後，執行數位簽章</p>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Left: Referral Form Preview */}
        <div style={{
          flex: 1, minWidth: 0, background: '#fff', borderRadius: '14px',
          border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Form Header */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <FileCheck size={16} color="#059669" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#064e3b' }}>全民健康保險 電子轉診單</span>
            <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: 'auto' }}>預覽模式</span>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {/* 轉出 / 轉入 院所 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <PreviewBox label="轉出院所" style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>{PATIENT.clinic}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>機構代碼 {PATIENT.clinicCode}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>開單醫師：{PATIENT.clinicDoctor}</div>
              </PreviewBox>
              <div style={{ display: 'flex', alignItems: 'center', color: '#d1d5db', fontSize: '18px' }}>→</div>
              <PreviewBox label="轉入院所" style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', marginBottom: '4px' }}>國泰綜合醫院</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>科別：{transferDept}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>醫師：{selectedDoctor?.name || '由院方安排'}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>地址：台北市大安區仁愛路四段 280 號</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>電話：(02) 2708-2121</div>
              </PreviewBox>
            </div>

            {/* 病患資料 */}
            <PreviewBox label="保險對象基本資料" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <Field label="姓名" value={PATIENT.name} />
                <Field label="身分證號" value={PATIENT.insuranceId} />
                <Field label="出生日期" value={PATIENT.birthDate} />
                <Field label="性別 / 年齡" value={`${PATIENT.gender} / ${PATIENT.age}歲`} />
                <Field label="聯絡電話" value={PATIENT.phone} />
                <Field label="聯絡人" value={PATIENT.contactPerson} />
              </div>
              <div style={{ marginTop: '6px' }}>
                <Field label="聯絡地址" value={PATIENT.address} />
              </div>
            </PreviewBox>

            {/* 藥物過敏 */}
            <div style={{
              padding: '8px 14px', borderRadius: '8px', marginBottom: '14px',
              background: '#fef2f2', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
            }}>
              <span style={{ fontWeight: 700, color: '#dc2626' }}>D. 藥物過敏史</span>
              <span style={{ color: '#991b1b' }}>{PATIENT.drugAllergy}</span>
            </div>

            {/* 診斷碼 */}
            <PreviewBox label="B. 診斷 ICD-10" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {icdDisplay.map(icd => (
                  <span key={icd.code} style={{
                    fontFamily: 'monospace', fontSize: '11px', fontWeight: 600,
                    padding: '3px 8px', borderRadius: '6px',
                    background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
                  }}>{icd.code} {icd.desc}</span>
                ))}
              </div>
            </PreviewBox>

            {/* 病歷摘要內容 */}
            <PreviewBox label="A. 病情摘要（主訴及簡短病史）" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{c.chiefComplaint}</div>
            </PreviewBox>
            <PreviewBox label="現病史" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{c.presentIllness}</div>
            </PreviewBox>
            <PreviewBox label="過去病史" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{c.pastHistory}</div>
            </PreviewBox>
            <PreviewBox label="目前用藥" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{c.currentMeds}</div>
            </PreviewBox>
            <PreviewBox label="C. 檢查及治療摘要" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{c.abnormalFindings}</div>
            </PreviewBox>
            <PreviewBox label="轉診原因" style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.7' }}>{c.referralReason}</div>
            </PreviewBox>

            {/* 轉診目的 */}
            <PreviewBox label="轉診目的" style={{ marginBottom: '14px' }}>
              <span style={{
                fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '8px',
                background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5',
              }}>門診治療</span>
            </PreviewBox>

            {/* 開單日期 + 有效期限 */}
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              background: '#f9fafb', border: '1px solid #f3f4f6',
              display: 'flex', gap: '24px', fontSize: '12px',
            }}>
              <div>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>開單日期</span>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>{openDate}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>有效期限</span>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>{expireDate}（90 日）</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Signature Panel */}
        <div style={{
          width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          {/* Sign Card */}
          <div style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
            padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
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
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>醫事人員憑證卡</span>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' }}>mHPC 行動憑證</span>
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
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{new Date().toLocaleString('zh-TW')}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>簽章者：{PATIENT.clinicDoctor}</div>
                </div>
              ) : signing ? (
                <div>
                  <div style={{
                    width: '24px', height: '24px', border: '3px solid #059669',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 8px',
                  }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>驗證憑證中...</div>
                </div>
              ) : (
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  請確認內容無誤後執行簽章
                </div>
              )}
            </div>

            {!signed && (
              <button onClick={handleSign} disabled={signing} style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: signing ? '#d1d5db' : '#059669', color: '#fff',
                fontSize: '14px', fontWeight: 700, cursor: signing ? 'wait' : 'pointer',
                boxShadow: signing ? 'none' : '0 2px 8px rgba(5,150,105,0.25)',
              }}>
                {signing ? '簽章處理中...' : '執行數位簽章'}
              </button>
            )}

            <div style={{
              padding: '8px 10px', borderRadius: '6px',
              background: '#f0fdf4', fontSize: '10px', color: '#6b7280', lineHeight: '1.5',
            }}>
              符合健保署電子轉診格式（XML/PDF）
              <br />HTTPS/TLS 1.3 加密傳輸
            </div>
          </div>

          {/* Summary Card */}
          <div style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
            padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '10px' }}>送件摘要</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <SummaryRow label="病患" value={PATIENT.name} />
              <SummaryRow label="轉入院所" value="國泰綜合醫院" />
              <SummaryRow label="轉入科別" value={transferDept} />
              <SummaryRow label="轉入醫師" value={selectedDoctor?.name || '由院方安排'} />
              <SummaryRow label="轉出院所" value={PATIENT.clinic} />
              <SummaryRow label="開單醫師" value={PATIENT.clinicDoctor} />
              <SummaryRow label="開單日期" value={openDate} />
              <SummaryRow label="有效期限" value={expireDate} />
              <SummaryRow label="診斷" value={icdDisplay.map(i => i.code).join(', ')} />
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 回上一步編輯
        </button>
        <button onClick={next} disabled={!signed} style={signed ? btnPrimary : btnDisabled}>
          下一步：VPN 送件 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function PreviewBox({ label, children, style = {} }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: '8px',
      background: '#f9fafb', border: '1px solid #f3f4f6', ...style,
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <span style={{ fontSize: '10px', color: '#9ca3af' }}>{label}</span>
      <div style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1f2937' }}>{value}</span>
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
