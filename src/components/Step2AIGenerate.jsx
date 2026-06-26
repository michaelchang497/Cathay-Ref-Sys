import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronLeft, ChevronDown, ClipboardList, Stethoscope, Brain, User, Clock, Edit3, FileText, X, Plus } from 'lucide-react'
import { PATIENT, AI_REFERRAL_CONTENT, AI_RECOMMENDED_DEPT, AI_CANDIDATE_DOCTORS, AI_ICD_CODES } from '../data/mockData'

const AI_TASKS = [
  { id: 'summary', label: '病歷摘要整理', icon: ClipboardList, duration: 1500, color: '#4f46e5' },
  { id: 'referral', label: '轉診單自動生成', icon: Stethoscope, duration: 1800, color: '#059669' },
  { id: 'recommend', label: 'AI 推薦科別與醫師', icon: Brain, duration: 1400, color: '#7c3aed' },
]

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

const DEPT_OPTIONS = ['心臟內科', '胸腔內科', '腎臟內科', '神經內科', '腸胃內科', '骨科', '泌尿科', '一般外科', '內分泌科', '家醫科']

export default function Step2AIGenerate({ next, prev, selectedDoctor, setSelectedDoctor }) {
  const [phase, setPhase] = useState('running')
  const [taskStatus, setTaskStatus] = useState({})
  const [streamText, setStreamText] = useState('')
  const timeoutsRef = useRef([])

  const [editMode, setEditMode] = useState(false)
  const [content, setContent] = useState(AI_REFERRAL_CONTENT)
  const [icdCodes, setIcdCodes] = useState(AI_ICD_CODES.slice(0, 3))
  const [icdInput, setIcdInput] = useState('')
  const [showIcdAdd, setShowIcdAdd] = useState(false)
  const [referralPurpose, setReferralPurpose] = useState('outpatient')
  const [examDetail, setExamDetail] = useState('心臟超音波、冠狀動脈電腦斷層')
  const [selectedDept, setSelectedDept] = useState(AI_RECOMMENDED_DEPT.department)
  const [showDeptChange, setShowDeptChange] = useState(false)
  const [sections, setSections] = useState({ patient: false, content: true, purpose: false, recommend: true })

  const icdFiltered = icdInput.trim()
    ? ICD_SUGGESTIONS.filter(s =>
        s.code.toLowerCase().includes(icdInput.toLowerCase()) ||
        s.desc.toLowerCase().includes(icdInput.toLowerCase())
      ).filter(s => !icdCodes.some(c => c.code === s.code)).slice(0, 5)
    : []

  function schedule(fn, ms) {
    const id = setTimeout(fn, ms)
    timeoutsRef.current.push(id)
  }

  useEffect(() => {
    startGenerate()
    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [])

  function startGenerate() {
    setPhase('running')
    let delay = 300
    AI_TASKS.forEach((task) => {
      schedule(() => setTaskStatus(p => ({ ...p, [task.id]: 'running' })), delay)
      delay += task.duration
      schedule(() => setTaskStatus(p => ({ ...p, [task.id]: 'done' })), delay)
    })
    delay += 400
    schedule(() => {
      setPhase('done')
      let idx = 0
      const fullText = buildReferralText()
      const interval = setInterval(() => {
        idx += 2
        setStreamText(fullText.slice(0, idx))
        if (idx >= fullText.length) clearInterval(interval)
      }, 8)
      timeoutsRef.current.push(interval)
    }, delay)
  }

  function buildReferralText() {
    const c = AI_REFERRAL_CONTENT
    return `【主訴】${c.chiefComplaint}\n\n【現病史】${c.presentIllness}\n\n【過去病史】${c.pastHistory}\n\n【目前用藥】${c.currentMeds}\n\n【異常發現】${c.abnormalFindings}\n\n【轉診原因】${c.referralReason}`
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
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 2 — AI 生成與推薦</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>AI 自動生成轉診內容並推薦科別與醫師，可修訂內容與調整科別</p>

      {/* === AI Processing Phase === */}
      {phase === 'running' && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '280px', flexShrink: 0, background: '#fff', borderRadius: '14px',
            border: '1px solid #e5e7eb', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              AI 處理進度
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {AI_TASKS.map(task => {
                const status = taskStatus[task.id]
                const Icon = task.icon
                return (
                  <div key={task.id} style={{
                    padding: '10px 12px', borderRadius: '10px',
                    background: status === 'running' ? '#f0fdf4' : status === 'done' ? '#f9fafb' : '#fff',
                    border: `1.5px solid ${status === 'running' ? '#059669' : status === 'done' ? '#d1fae5' : '#f3f4f6'}`,
                    transition: 'all 0.3s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={14} color={status === 'done' ? '#059669' : status === 'running' ? task.color : '#d1d5db'} />
                      <span style={{
                        fontSize: '12px', fontWeight: 600, flex: 1,
                        color: status === 'done' ? '#064e3b' : status === 'running' ? task.color : '#9ca3af',
                      }}>{task.label}</span>
                      {status === 'running' && <Spinner />}
                      {status === 'done' && <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{
            flex: 1, minWidth: 0, background: '#fff', borderRadius: '14px',
            border: '1px solid #e5e7eb', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              AI 生成轉診內容
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#1f2937', whiteSpace: 'pre-wrap' }}>
              {streamText || <span style={{ color: '#d1d5db', animation: 'pulse 1.5s infinite' }}>等待 AI 處理完成...</span>}
              <span style={{
                display: 'inline-block', width: '6px', height: '15px',
                background: '#059669', marginLeft: '2px',
                animation: 'pulse 0.8s infinite', verticalAlign: 'text-bottom',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* === Review Phase === */}
      {phase === 'done' && (
        <>
          {/* Patient Summary + Drug Allergy */}
          <Section
            title="病患資料"
            icon={<User size={14} />}
            open={sections.patient}
            onToggle={() => setSections(s => ({ ...s, patient: !s.patient }))}
            badge={`${PATIENT.name} · ${PATIENT.age}歲${PATIENT.gender}`}
          >
            <div style={{
              padding: '10px 14px', borderRadius: '8px', marginBottom: '10px',
              background: '#f9fafb', border: '1px solid #f3f4f6',
              display: 'flex', gap: '16px', fontSize: '12px', color: '#374151', flexWrap: 'wrap',
            }}>
              <span><b>病患：</b>{PATIENT.name}</span>
              <span><b>年齡：</b>{PATIENT.age}歲/{PATIENT.gender}</span>
              <span><b>身分證號：</b>{PATIENT.insuranceId}</span>
              <span><b>轉出院所：</b>{PATIENT.clinic}（{PATIENT.clinicCode}）</span>
            </div>
            <div style={{
              padding: '8px 14px', borderRadius: '8px',
              background: '#fef2f2', border: '1px solid #fecaca',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
            }}>
              <span style={{ fontWeight: 700, color: '#dc2626', flexShrink: 0 }}>D. 藥物過敏史</span>
              <span style={{ color: '#991b1b' }}>{PATIENT.drugAllergy}</span>
            </div>
          </Section>

          {/* Referral Form Content — Editable */}
          <Section
            title="轉診單內容"
            icon={<FileText size={14} />}
            open={sections.content}
            onToggle={() => setSections(s => ({ ...s, content: !s.content }))}
            action={
              <button
                onClick={e => { e.stopPropagation(); setEditMode(!editMode) }}
                style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  background: editMode ? '#fef3c7' : '#f3f4f6', color: editMode ? '#92400e' : '#6b7280',
                  border: `1px solid ${editMode ? '#fde68a' : '#e5e7eb'}`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <Edit3 size={12} /> {editMode ? '完成修改' : '人工修訂'}
              </button>
            }
          >
            {/* ICD Codes */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>B. 診斷碼 (ICD-10)</div>
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
                      <X size={12} style={{ cursor: 'pointer', color: '#dc2626', flexShrink: 0 }}
                        onClick={() => setIcdCodes(prev => prev.filter(c => c.code !== icd.code))} />
                    )}
                  </span>
                ))}
                {editMode && !showIcdAdd && icdCodes.length < 3 && (
                  <button onClick={() => setShowIcdAdd(true)} style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                    color: '#6b7280', background: '#f3f4f6', border: '1px dashed #d1d5db',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Plus size={12} /> 新增
                  </button>
                )}
              </div>
              {editMode && showIcdAdd && (
                <div style={{ marginTop: '8px', position: 'relative' }}>
                  <input value={icdInput} onChange={e => setIcdInput(e.target.value)}
                    placeholder="輸入診斷碼或關鍵字搜尋..." autoFocus
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
                        <div key={s.code}
                          onMouseDown={() => {
                            setIcdCodes(prev => {
                              if (prev.length >= 3) return prev
                              return [...prev, { code: s.code, desc: s.desc, confidence: null }]
                            })
                            setIcdInput(''); setShowIcdAdd(false)
                          }}
                          style={{
                            padding: '8px 12px', cursor: 'pointer', fontSize: '12px',
                            display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f3f4f6',
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
                    <textarea value={content[f.key]}
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
          </Section>

          {/* Referral Purpose */}
          <Section
            title="轉診目的"
            icon={<ClipboardList size={14} />}
            open={sections.purpose}
            onToggle={() => setSections(s => ({ ...s, purpose: !s.purpose }))}
            badge={REFERRAL_PURPOSES.find(p => p.id === referralPurpose)?.label}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {REFERRAL_PURPOSES.map(p => (
                <label key={p.id} onClick={() => setReferralPurpose(p.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: referralPurpose === p.id ? '#ecfdf5' : '#fff',
                  border: `1.5px solid ${referralPurpose === p.id ? '#6ee7b7' : '#f3f4f6'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${referralPurpose === p.id ? '#059669' : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {referralPurpose === p.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />}
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: referralPurpose === p.id ? 600 : 400,
                    color: referralPurpose === p.id ? '#064e3b' : '#6b7280',
                  }}>{p.label}</span>
                </label>
              ))}
            </div>
            {referralPurpose === 'exam' && (
              <input value={examDetail} onChange={e => setExamDetail(e.target.value)}
                placeholder="請填寫檢查項目..."
                style={{
                  marginTop: '8px', width: '100%', height: '34px', padding: '0 10px',
                  borderRadius: '7px', border: '1.5px solid #d1fae5', fontSize: '12px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            )}
          </Section>

          {/* AI Recommendation + Department Change */}
          <Section
            title={selectedDept === AI_RECOMMENDED_DEPT.department ? 'AI 推薦科別與醫師' : `轉診科別：${selectedDept}`}
            icon={<Brain size={14} />}
            open={sections.recommend}
            onToggle={() => setSections(s => ({ ...s, recommend: !s.recommend }))}
          >
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderRadius: '14px',
            border: '1.5px solid #6ee7b7', padding: '20px 24px', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Brain size={18} color="#059669" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#064e3b' }}>
                {selectedDept === AI_RECOMMENDED_DEPT.department ? 'AI 推薦科別' : '轉診科別（已調整）'}
              </span>
              {selectedDept === AI_RECOMMENDED_DEPT.department && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                  background: '#059669', color: '#fff',
                }}>信心度 {Math.round(AI_RECOMMENDED_DEPT.confidence * 100)}%</span>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowDeptChange(!showDeptChange)} style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                background: '#fff', color: '#6b7280', border: '1px solid #d1fae5', cursor: 'pointer',
              }}>
                {showDeptChange ? '收起' : '調整科別'}
              </button>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
              {selectedDept}
            </div>
            {selectedDept === AI_RECOMMENDED_DEPT.department && (
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>
                {AI_RECOMMENDED_DEPT.reason}
              </div>
            )}
            {showDeptChange && (
              <div style={{
                marginTop: '12px', padding: '12px', borderRadius: '10px',
                background: '#fff', border: '1px solid #d1fae5',
                display: 'flex', gap: '8px', flexWrap: 'wrap',
              }}>
                {DEPT_OPTIONS.map(dept => (
                  <button key={dept} onClick={() => { setSelectedDept(dept); setShowDeptChange(false); if (dept !== AI_RECOMMENDED_DEPT.department) setSelectedDoctor(null) }}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                      background: selectedDept === dept ? '#059669' : '#f9fafb',
                      color: selectedDept === dept ? '#fff' : '#374151',
                      border: `1.5px solid ${selectedDept === dept ? '#059669' : '#e5e7eb'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >{dept}</button>
                ))}
              </div>
            )}
          </div>

          {/* Doctor Selection — only when using AI recommended dept */}
          {selectedDept === AI_RECOMMENDED_DEPT.department && (<>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> 候選醫師
              <span style={{ fontSize: '11px', fontWeight: 400, color: '#9ca3af' }}>（可選擇或略過）</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {AI_CANDIDATE_DOCTORS.map(doc => {
              const isSelected = selectedDoctor?.id === doc.id
              return (
                <div key={doc.id} onClick={() => setSelectedDoctor(doc)} style={{
                  background: '#fff', borderRadius: '14px',
                  border: isSelected ? '2px solid #059669' : '1px solid #e5e7eb',
                  padding: '16px 20px', cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 12px rgba(5,150,105,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: doc.matchScore >= 95 ? '#ecfdf5' : doc.matchScore >= 85 ? '#fef3c7' : '#f3f4f6',
                      border: `1.5px solid ${doc.matchScore >= 95 ? '#6ee7b7' : doc.matchScore >= 85 ? '#fde68a' : '#e5e7eb'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: doc.matchScore >= 95 ? '#059669' : doc.matchScore >= 85 ? '#d97706' : '#6b7280' }}>{doc.matchScore}</div>
                      <div style={{ fontSize: '8px', fontWeight: 600, color: '#9ca3af' }}>MATCH</div>
                    </div>
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
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>可約診：{doc.availableSlots.join(' / ')}</span>
                      </div>
                    </div>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: isSelected ? '2px solid #059669' : '2px solid #d1d5db',
                      background: isSelected ? '#059669' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          </>)}

          {selectedDept !== AI_RECOMMENDED_DEPT.department && (
            <div style={{
              padding: '14px 18px', borderRadius: '10px',
              background: '#f9fafb', border: '1px solid #f3f4f6',
              fontSize: '12px', color: '#6b7280', lineHeight: '1.6',
            }}>
              已調整為 <b style={{ color: '#064e3b' }}>{selectedDept}</b>，醫師將由轉入院所安排。
            </div>
          )}
          </Section>

        </>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button onClick={next} disabled={phase !== 'done'} style={phase === 'done' ? btnPrimary : btnDisabled}>
          下一步：預覽確認 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon, open, onToggle, children, badge, action }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
      marginBottom: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '14px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          borderBottom: open ? '1px solid #f3f4f6' : 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
      >
        <span style={{ color: '#059669' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#064e3b' }}>{title}</span>
        {!open && badge && (
          <span style={{
            fontSize: '11px', color: '#6b7280', marginLeft: '4px',
            padding: '2px 8px', borderRadius: '99px', background: '#f3f4f6',
          }}>{badge}</span>
        )}
        <div style={{ flex: 1 }} />
        {action && open && <div onClick={e => e.stopPropagation()}>{action}</div>}
        <ChevronDown size={16} color="#9ca3af" style={{
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </div>
      {open && <div style={{ padding: '16px 20px' }}>{children}</div>}
    </div>
  )
}

function Spinner({ large }) {
  return (
    <div style={{
      width: large ? '24px' : '14px', height: large ? '24px' : '14px',
      border: `${large ? '3px' : '2px'} solid #059669`,
      borderTopColor: 'transparent', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: large ? '0 auto' : undefined,
    }} />
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
