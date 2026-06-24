import { useState } from 'react'
import { ChevronRight, ChevronLeft, Brain, Star, User, Clock } from 'lucide-react'
import { AI_RECOMMENDED_DEPT, AI_CANDIDATE_DOCTORS, AI_ICD_CODES } from '../data/mockData'

export default function Step3AIRecommend({ next, prev, selectedDoctor, setSelectedDoctor }) {
  const [showReason, setShowReason] = useState(null)

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 3 — AI 推薦科別與醫師</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>AI 根據病情分析推薦最適科別，並提供 3 位候選醫師</p>

      {/* Department Recommendation */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderRadius: '14px',
        border: '1.5px solid #6ee7b7', padding: '20px 24px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Brain size={18} color="#059669" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#064e3b' }}>AI 推薦科別</span>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
            background: '#059669', color: '#fff', marginLeft: '4px',
          }}>
            信心度 {Math.round(AI_RECOMMENDED_DEPT.confidence * 100)}%
          </span>
        </div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
          {AI_RECOMMENDED_DEPT.department}
        </div>
        <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7', marginBottom: '14px' }}>
          {AI_RECOMMENDED_DEPT.reason}
        </div>

        {/* ICD Codes */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {AI_ICD_CODES.map(icd => (
            <div key={icd.code} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '8px',
              background: '#fff', border: '1px solid #d1fae5',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#059669' }}>{icd.code}</span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>{icd.desc}</span>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '99px',
                background: icd.confidence >= 0.9 ? '#dcfce7' : icd.confidence >= 0.8 ? '#fef3c7' : '#f3f4f6',
                color: icd.confidence >= 0.9 ? '#059669' : icd.confidence >= 0.8 ? '#d97706' : '#9ca3af',
              }}>{Math.round(icd.confidence * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Doctors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={14} /> 候選醫師（請選擇 1 位）
        </div>
        <button style={{
          padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
          color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          自選其他醫師
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {AI_CANDIDATE_DOCTORS.map(doc => {
          const isSelected = selectedDoctor?.id === doc.id
          return (
            <div key={doc.id} style={{
              background: '#fff', borderRadius: '14px',
              border: isSelected ? '2px solid #059669' : '1px solid #e5e7eb',
              padding: '16px 20px', cursor: 'pointer',
              boxShadow: isSelected ? '0 2px 12px rgba(5,150,105,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
            }}
              onClick={() => setSelectedDoctor(doc)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Score */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: doc.matchScore >= 95 ? '#ecfdf5' : doc.matchScore >= 85 ? '#fef3c7' : '#f3f4f6',
                  border: `1.5px solid ${doc.matchScore >= 95 ? '#6ee7b7' : doc.matchScore >= 85 ? '#fde68a' : '#e5e7eb'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontSize: '16px', fontWeight: 800,
                    color: doc.matchScore >= 95 ? '#059669' : doc.matchScore >= 85 ? '#d97706' : '#6b7280',
                  }}>{doc.matchScore}</div>
                  <div style={{ fontSize: '8px', fontWeight: 600, color: '#9ca3af' }}>MATCH</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{doc.name}</span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{doc.title}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                      background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe',
                    }}>{doc.subspecialty}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>{doc.reason}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <Clock size={12} color="#9ca3af" />
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      可約診：{doc.availableSlots.join(' / ')}
                    </span>
                  </div>
                </div>

                {/* Select indicator */}
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: isSelected ? '2px solid #059669' : '2px solid #d1d5db',
                  background: isSelected ? '#059669' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button onClick={next} disabled={!selectedDoctor} style={selectedDoctor ? btnPrimary : btnDisabled}>
          下一步：修訂與確認簽章 <ChevronRight size={16} />
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
