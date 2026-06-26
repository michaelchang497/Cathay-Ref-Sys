export const PATIENT = {
  name: '王○○',
  idLast4: '5678',
  birthDate: '1958-03-15',
  age: 68,
  gender: '男',
  insuranceId: 'A123456789',
  phone: '0912-345-678',
  contactPerson: '王○○（配偶）',
  address: '台北市大安區信義路四段 XX 號 X 樓',
  drugAllergy: 'Penicillin 類（皮膚紅疹）',
  clinic: '仁愛家醫診所',
  clinicCode: '3701010018',
  clinicDoctor: '李○○ 醫師',
}

export const VOICE_TRANSCRIPT = `病患王先生，68歲男性，主訴近兩週反覆胸悶，活動時加劇，休息後緩解。
合併有高血壓及糖尿病病史約十年，目前規律服藥中。
近日有輕微下肢水腫，偶有夜間端坐呼吸情形。
血壓偏高約 160/95，心跳規則但偏快約 92 次。
建議轉診至心臟內科做進一步檢查。`

export const OCR_RESULT = {
  labDate: '2026-06-18',
  items: [
    { name: 'HbA1c', value: '7.8%', flag: '↑', ref: '<7.0%' },
    { name: 'Fasting Glucose', value: '156 mg/dL', flag: '↑', ref: '70-100' },
    { name: 'Total Cholesterol', value: '238 mg/dL', flag: '↑', ref: '<200' },
    { name: 'LDL', value: '152 mg/dL', flag: '↑', ref: '<130' },
    { name: 'Creatinine', value: '1.3 mg/dL', flag: '', ref: '0.7-1.3' },
    { name: 'BNP', value: '420 pg/mL', flag: '↑', ref: '<100' },
    { name: 'Hb', value: '13.1 g/dL', flag: '', ref: '13-17' },
    { name: 'Na', value: '139 mEq/L', flag: '', ref: '136-145' },
    { name: 'K', value: '4.2 mEq/L', flag: '', ref: '3.5-5.0' },
  ],
}

export const AI_REFERRAL_CONTENT = {
  chiefComplaint: '反覆胸悶兩週，活動時加劇，合併下肢水腫及夜間端坐呼吸',
  presentIllness: '68 歲男性，有高血壓及第二型糖尿病病史十年，規律服藥控制中。近兩週出現反覆胸悶，以活動時為甚，休息後可緩解。近日合併輕微雙側下肢水腫，偶有夜間端坐呼吸（orthopnea）。診所測量血壓 160/95 mmHg，心跳 92 bpm，規則。',
  pastHistory: '高血壓（10年）、第二型糖尿病（10年）',
  currentMeds: 'Amlodipine 5mg QD、Metformin 1000mg BID、Lisinopril 10mg QD',
  abnormalFindings: 'BNP 420 pg/mL↑、HbA1c 7.8%↑、LDL 152↑、BP 160/95 mmHg',
  referralReason: '疑似心臟衰竭，需進一步心臟超音波及冠狀動脈評估',
}

export const AI_ICD_CODES = [
  { code: 'I50.9', desc: 'Heart failure, unspecified', confidence: 0.92 },
  { code: 'I10', desc: 'Essential hypertension', confidence: 0.88 },
  { code: 'E11.65', desc: 'Type 2 DM with hyperglycemia', confidence: 0.85 },
  { code: 'R06.0', desc: 'Dyspnea', confidence: 0.78 },
]

export const AI_RECOMMENDED_DEPT = {
  department: '心臟內科',
  confidence: 0.94,
  reason: '基於病患胸悶症狀、BNP 顯著上升（420 pg/mL）及下肢水腫，高度懷疑心臟衰竭。合併高血壓及糖尿病為心血管疾病高風險群，建議心臟內科進行完整評估。',
}

export const AI_CANDIDATE_DOCTORS = [
  {
    id: 1,
    name: '張○○',
    title: '主治醫師',
    department: '心臟內科',
    subspecialty: '心臟衰竭、心臟超音波',
    matchScore: 96,
    reason: '專長心臟衰竭診治與超音波評估，適合此病患需心臟功能評估之需求。近三個月處理相似轉診 23 例。',
    availableSlots: ['06/24 (二) 上午', '06/26 (四) 上午', '06/27 (五) 下午'],
  },
  {
    id: 2,
    name: '陳○○',
    title: '主治醫師',
    department: '心臟內科',
    subspecialty: '冠狀動脈疾病、心導管',
    matchScore: 89,
    reason: '具冠狀動脈疾病專長，若需進一步心導管檢查可一站式處理。病患有多重心血管風險因子。',
    availableSlots: ['06/25 (三) 下午', '06/27 (五) 上午'],
  },
  {
    id: 3,
    name: '林○○',
    title: '資深主治醫師',
    department: '心臟內科',
    subspecialty: '高血壓、心臟代謝',
    matchScore: 82,
    reason: '擅長高血壓合併代謝症候群之整合管理，適合病患合併 DM + HTN 之長期照護規劃。',
    availableSlots: ['06/24 (二) 下午', '06/26 (四) 下午'],
  },
]

export const GREEN_CHANNEL_SLOTS = [
  { date: '2026-06-24 (二)', period: '上午', time: '09:30', doctor: '張○○', deptRoom: '心臟內科 第3診', reserved: true, slotId: 'R-20260624-AM-003' },
  { date: '2026-06-24 (二)', period: '下午', time: '14:00', doctor: '林○○', deptRoom: '心臟內科 第5診', reserved: true, slotId: 'R-20260624-PM-005' },
  { date: '2026-06-25 (三)', period: '下午', time: '14:30', doctor: '陳○○', deptRoom: '心臟內科 第2診', reserved: true, slotId: 'R-20260625-PM-002' },
  { date: '2026-06-26 (四)', period: '上午', time: '10:00', doctor: '張○○', deptRoom: '心臟內科 第3診', reserved: true, slotId: 'R-20260626-AM-003' },
  { date: '2026-06-26 (四)', period: '下午', time: '15:00', doctor: '林○○', deptRoom: '心臟內科 第5診', reserved: true, slotId: 'R-20260626-PM-005' },
  { date: '2026-06-27 (五)', period: '上午', time: '09:00', doctor: '陳○○', deptRoom: '心臟內科 第2診', reserved: true, slotId: 'R-20260627-AM-002' },
  { date: '2026-06-27 (五)', period: '下午', time: '14:00', doctor: '張○○', deptRoom: '心臟內科 第3診', reserved: true, slotId: 'R-20260627-PM-003' },
]

export const DASHBOARD_STATS = {
  totalReferrals: 1247,
  monthReferrals: 86,
  successRate: 97.2,
  avgWaitDays: 2.3,
  vpnSuccessRate: 99.1,
  patientSatisfaction: 4.6,
  topClinics: [
    { name: '仁愛家醫診所', count: 42 },
    { name: '康健聯合診所', count: 38 },
    { name: '信義內科診所', count: 31 },
    { name: '大安耳鼻喉科', count: 28 },
    { name: '中山眼科診所', count: 24 },
  ],
  topDepts: [
    { name: '心臟內科', count: 156, pct: 18 },
    { name: '骨科', count: 132, pct: 15 },
    { name: '腸胃內科', count: 118, pct: 14 },
    { name: '神經內科', count: 96, pct: 11 },
    { name: '泌尿科', count: 87, pct: 10 },
  ],
  // 各診所來源轉診數趨勢（折線圖）：可切換週/月週期
  clinicTrend: {
    week: {
      periods: ['5/19', '5/26', '6/02', '6/09', '6/16', '6/23'],
      series: [
        { name: '仁愛家醫診所', color: '#059669', values: [8, 7, 9, 11, 10, 12] },
        { name: '康健聯合診所', color: '#4f46e5', values: [6, 8, 7, 9, 8, 10] },
        { name: '信義內科診所', color: '#0d9488', values: [5, 6, 5, 7, 8, 7] },
        { name: '大安耳鼻喉科', color: '#d97706', values: [4, 5, 6, 5, 7, 6] },
        { name: '中山眼科診所', color: '#7c3aed', values: [3, 4, 4, 5, 5, 6] },
      ],
    },
    month: {
      periods: ['1月', '2月', '3月', '4月', '5月', '6月'],
      series: [
        { name: '仁愛家醫診所', color: '#059669', values: [28, 32, 30, 38, 42, 42] },
        { name: '康健聯合診所', color: '#4f46e5', values: [22, 26, 30, 33, 35, 38] },
        { name: '信義內科診所', color: '#0d9488', values: [18, 20, 24, 26, 28, 31] },
        { name: '大安耳鼻喉科', color: '#d97706', values: [15, 18, 20, 22, 25, 28] },
        { name: '中山眼科診所', color: '#7c3aed', values: [12, 15, 18, 19, 22, 24] },
      ],
    },
  },
  recentReferrals: [
    { id: 'REF-20260622-001', patient: '王○○', dept: '心臟內科', doctor: '張○○', status: 'booked', date: '2026-06-22', diagnosis: 'I50.9 Heart failure', purpose: '門診治療', clinic: '仁愛家醫診所' },
    { id: 'REF-20260621-003', patient: '李○○', dept: '骨科', doctor: '黃○○', status: 'arrived', date: '2026-06-21', diagnosis: 'M54.5 Low back pain', purpose: '進一步檢查', clinic: '康健聯合診所' },
    { id: 'REF-20260621-002', patient: '陳○○', dept: '腸胃內科', doctor: '吳○○', status: 'arrived', date: '2026-06-21', diagnosis: 'K21.0 GERD', purpose: '門診治療', clinic: '信義內科診所' },
    { id: 'REF-20260620-005', patient: '張○○', dept: '神經內科', doctor: '趙○○', status: 'no_show', date: '2026-06-20', diagnosis: 'G43.9 Migraine', purpose: '門診治療', clinic: '大安耳鼻喉科' },
    { id: 'REF-20260620-001', patient: '林○○', dept: '心臟內科', doctor: '陳○○', status: 'arrived', date: '2026-06-20', diagnosis: 'I10 Hypertension', purpose: '進一步檢查', clinic: '中山眼科診所' },
  ],
}

export const CLINIC_STATS = {
  totalReferrals: 73,
  monthReferrals: 8,
  successRate: 91.8,
  avgWaitDays: 3.1,
}

export const CLINIC_REFERRALS = [
  { id: 'REF-20260622-001', patient: '王○○', dept: '心臟內科', doctor: '張○○', status: 'booked', date: '2026-06-22', diagnosis: 'I50.9 Heart failure', purpose: '門診治療', clinic: '國泰綜合醫院' },
  { id: 'REF-20260618-002', patient: '李○○', dept: '骨科', doctor: '黃○○', status: 'arrived', date: '2026-06-18', diagnosis: 'M54.5 Low back pain', purpose: '進一步檢查', clinic: '國泰綜合醫院' },
  { id: 'REF-20260615-001', patient: '陳○○', dept: '腸胃內科', doctor: '吳○○', status: 'arrived', date: '2026-06-15', diagnosis: 'K21.0 GERD', purpose: '門診治療', clinic: '國泰綜合醫院' },
  { id: 'REF-20260610-003', patient: '張○○', dept: '神經內科', doctor: '趙○○', status: 'no_show', date: '2026-06-10', diagnosis: 'G43.9 Migraine', purpose: '門診治療', clinic: '國泰綜合醫院' },
  { id: 'REF-20260605-001', patient: '林○○', dept: '心臟內科', doctor: '陳○○', status: 'arrived', date: '2026-06-05', diagnosis: 'I10 Hypertension', purpose: '進一步檢查', clinic: '國泰綜合醫院' },
]

export const PARTNER_CLINICS = [
  { id: 1, name: '仁愛家醫診所', code: '3701010018', district: '台北市大安區', contact: '李○○ 醫師', phone: '(02) 2701-1234', monthReferrals: 42, status: 'active' },
  { id: 2, name: '康健聯合診所', code: '3701010025', district: '台北市信義區', contact: '陳○○ 醫師', phone: '(02) 2722-5678', monthReferrals: 38, status: 'active' },
  { id: 3, name: '信義內科診所', code: '3701010033', district: '台北市信義區', contact: '林○○ 醫師', phone: '(02) 2758-9012', monthReferrals: 31, status: 'active' },
  { id: 4, name: '大安耳鼻喉科', code: '3701010041', district: '台北市大安區', contact: '王○○ 醫師', phone: '(02) 2706-3456', monthReferrals: 28, status: 'active' },
  { id: 5, name: '中山眼科診所', code: '3701010059', district: '台北市中山區', contact: '張○○ 醫師', phone: '(02) 2531-7890', monthReferrals: 24, status: 'inactive' },
]

export const STEPS = [
  { num: 1, label: '輸入資料', short: '輸入' },
  { num: 2, label: 'AI 生成與推薦', short: 'AI' },
  { num: 3, label: '預覽確認', short: '確認' },
  { num: 4, label: 'VPN 送件', short: 'VPN' },
  { num: 5, label: '綠色通道', short: '掛號' },
]
