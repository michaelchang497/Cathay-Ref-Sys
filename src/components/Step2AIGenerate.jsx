import { useState, useEffect, useRef } from 'react'
import { Bot, ChevronRight, ChevronLeft, Mic, FileSearch, ClipboardList, Stethoscope } from 'lucide-react'
import { AI_REFERRAL_CONTENT, VOICE_TRANSCRIPT, OCR_RESULT } from '../data/mockData'

const AI_TASKS = [
  { id: 'summary', label: '病歷摘要整理', icon: ClipboardList, duration: 1500, color: '#4f46e5' },
  { id: 'referral', label: '轉診單自動生成', icon: Stethoscope, duration: 1800, color: '#059669' },
]

export default function Step2AIGenerate({ next, prev }) {
  const [phase, setPhase] = useState('running')
  const [taskStatus, setTaskStatus] = useState({})
  const [currentTask, setCurrentTask] = useState(null)
  const [streamText, setStreamText] = useState('')
  const timeoutsRef = useRef([])

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

    AI_TASKS.forEach((task, i) => {
      schedule(() => {
        setCurrentTask(task.id)
        setTaskStatus(p => ({ ...p, [task.id]: 'running' }))
      }, delay)
      delay += task.duration
      schedule(() => {
        setTaskStatus(p => ({ ...p, [task.id]: 'done' }))
      }, delay)
    })

    delay += 400
    schedule(() => {
      setPhase('done')
      setCurrentTask(null)
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

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>步驟 2 — AI 智慧轉診助理</h2>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>AI 自動處理語音、OCR 資料並生成轉診單內容</p>

      {(phase === 'running' || phase === 'done') && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Left: Task list */}
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
                      {status === 'running' && (
                        <div style={{
                          width: '14px', height: '14px', border: '2px solid #059669',
                          borderTopColor: 'transparent', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      )}
                      {status === 'done' && (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>✓</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {phase === 'done' && (
              <div style={{
                marginTop: '12px', padding: '8px 10px', borderRadius: '8px',
                background: '#ecfdf5', border: '1px solid #6ee7b7',
                fontSize: '11px', fontWeight: 600, color: '#059669', textAlign: 'center',
              }}>
                全部完成
              </div>
            )}
          </div>

          {/* Right: Generated content */}
          <div style={{
            flex: 1, minWidth: 0, background: '#fff', borderRadius: '14px',
            border: '1px solid #e5e7eb', padding: '16px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              AI 生成轉診內容
            </div>
            <div style={{
              flex: 1, fontSize: '13px', lineHeight: '1.8', color: '#1f2937',
              whiteSpace: 'pre-wrap', overflowY: 'auto',
            }}>
              {streamText || (
                <span style={{ color: '#d1d5db', animation: 'pulse 1.5s infinite' }}>等待 AI 處理完成...</span>
              )}
              {phase === 'running' && (
                <span style={{
                  display: 'inline-block', width: '6px', height: '15px',
                  background: '#059669', marginLeft: '2px',
                  animation: 'pulse 0.8s infinite', verticalAlign: 'text-bottom',
                }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button onClick={prev} style={btnSecondary}>
          <ChevronLeft size={16} /> 上一步
        </button>
        <button onClick={next} disabled={phase !== 'done'} style={phase === 'done' ? btnPrimary : btnDisabled}>
          下一步：AI 推薦科別 <ChevronRight size={16} />
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
