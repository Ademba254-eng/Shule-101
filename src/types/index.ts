export type GradeLevel = 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';
export type Section = 'A' | 'B';

export type SubscriptionTier = 'Trial' | 'Standard CBC' | 'Enterprise Plus' | 'National Directorate';
export type SubscriptionStatus = 'active' | 'expiring_soon' | 'expired' | 'grace_period' | 'pending_payment';
export type BillingCycle = 'termly' | 'annual' | 'monthly';

export interface SchoolSubscription {
  id: string;
  schoolId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amountKSH: number;
  startDate: string;
  nextRenewalDate: string;
  studentLimit: number;
  activeStudents: number;
  features: {
    smsNotifications: boolean;
    financeBursarModule: boolean;
    cbcAnalytics: boolean;
    parentPortalApp: boolean;
    customDomain: boolean;
  };
  lastPaymentRef?: string;
}

export interface ParentStudentMapping {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  grade: string;
  schoolId: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  relationship: 'Mother' | 'Father' | 'Guardian' | 'Sponsor';
  portalAccessStatus: 'active' | 'pending_invitation' | 'suspended';
  accessCode: string;
  lastAccessed?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type FeeStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export type FeeCategory = 'Tuition' | 'Laboratory' | 'Transport' | 'Extracurricular' | 'Examination' | 'Annual Package';

export type MessageCategory = 'general' | 'academic' | 'attendance' | 'fees' | 'urgent';

export interface RegisteredSchool {
  id: string;
  code: string;
  name: string;
  countyOrCity: string;
  level: string;
  curriculum: string;
  studentCount?: number;
  emailDomain?: string;
  isVerified: boolean;
  address?: string;
  phone?: string;
  principalName?: string;
  principalEmail?: string;
  subscription?: SchoolSubscription;
}

export type StaffDivision = 'principal' | 'teacher' | 'finance' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'parent' | 'admin';
  staffDivision?: StaffDivision;
  assignedClass?: string; // e.g. 'Grade 10-A'
  assignedGrade?: GradeLevel;
  assignedSection?: Section;
  title?: string;
  avatar?: string;
  studentId?: string;
  schoolId?: string;
  schoolName?: string;
  isAdmin?: boolean;
  twoFactorEnabled?: boolean;
  isLocked?: boolean;
  phone?: string;
  lastLogin?: string;
}

export interface AdminSession {
  token: string;
  adminEmail: string;
  adminName: string;
  verifiedAt: string;
  expiresAt: string;
  twoFactorMethod: 'totp' | 'email_otp' | 'recovery_key';
  clearanceLevel: 'Master System Administrator' | 'National Directorate Overseer';
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType:
    | 'AUTH_SUCCESS_2FA'
    | 'AUTH_FAILURE_403'
    | 'UNAUTHORIZED_URL_ATTEMPT'
    | 'USER_PERMISSION_CHANGED'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_UNLOCKED'
    | 'REGISTRY_MODIFIED'
    | 'EMERGENCY_LOCKDOWN'
    | 'SYSTEM_CACHE_PURGE'
    | 'FEE_OVERRIDE_ADMIN'
    | 'FEE_PAYMENT_RECORDED'
    | 'SUBSCRIPTION_UPDATE'
    | 'PARENT_PORTAL_CONFIG';
  severity: 'low' | 'medium' | 'high' | 'critical';
  actorEmail: string;
  ipAddress: string;
  targetResource: string;
  details: string;
  status: 'success' | 'blocked' | 'warning';
}

export interface EmergencyBroadcast {
  enabled: boolean;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  updatedAt: string;
  updatedBy: string;
}

export interface Guardian {
  name: string;
  relation: 'Mother' | 'Father' | 'Guardian';
  phone: string;
  email: string;
  address: string;
  occupation?: string;
}

export interface AssignedTeacherInfo {
  id: string;
  name: string;
  email: string;
  title: string;
  avatar: string;
  assignedClass: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  grade: GradeLevel;
  section: Section;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  avatar: string;
  bloodGroup: string;
  guardian: Guardian;
  enrollmentDate: string;
  assignedTeacher?: AssignedTeacherInfo;
}

export interface SubjectAssessment {
  test1: number; // Max 20
  test2: number; // Max 20
  midterm: number; // Max 30
  finalExam: number; // Max 30
  assignment: number; // Max 10 (Bonus / Continuous)
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  teacherName: string;
  credits: number;
  scores: SubjectAssessment;
  totalScore: number; // Out of 100
  letterGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  gpaPoint: number;
  remarks: string;
}

export interface StudentAcademicRecord {
  studentId: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  subjects: SubjectGrade[];
  overallGpa: number;
  rank: number;
  totalStudentsInClass: number;
  attendancePercentage: number;
  conductRemarks: string;
  principalRemarks: string;
}

export interface DailyAttendanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
  timeIn?: string;
  whereabouts?: string; // Whereabouts if absent or late (e.g., "Home (Flu - Sick Bed)", "School Infirmary", "Delayed Highway 101", "Varsity Trip", "Unconfirmed")
  emergencyNotes?: string; // Emergency details or special instructions
  reportedBy?: string; // Person who verified whereabouts (e.g. "Parent (Phone)", "Class Teacher", "Clinic Nurse", "Bus Driver")
}

export interface FeePaymentRecord {
  id: string;
  receiptNo: string;
  amount: number;
  date: string;
  paymentMethod: 'Bank Transfer' | 'Credit/Debit Card' | 'Cash' | 'Mobile Money' | 'Online Portal';
  payerAccount?: string; // e.g. "M-Pesa 0712 345 678", "Equity Bank A/C 011029384756", "KCB Bank A/C 1122334455"
  payerName?: string;
  notes?: string;
  recordedBy: string;
}

export interface FeeInvoiceItem {
  id: string;
  description: string;
  amount: number;
  category: FeeCategory;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  term: string;
  academicYear: string;
  dueDate: string;
  issuedDate: string;
  items: FeeInvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: FeeStatus;
  paymentHistory: FeePaymentRecord[];
}

export interface DirectMessage {
  id: string;
  threadId: string;
  studentId: string;
  senderRole: 'school_admin' | 'teacher' | 'parent';
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  category: MessageCategory;
  attachments?: string[];
}

export interface MessageThread {
  id: string;
  studentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  studentName: string;
  grade: GradeLevel;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountForStaff: number;
  unreadCountForParent: number;
  category: MessageCategory;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  targetAudience: 'All Parents & Students' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';
  priority: 'normal' | 'important' | 'urgent';
  tag: string;
  readByCount: number;
}

export interface CustomReceiptField {
  id: string;
  label: string;
  value: string;
  category: 'header' | 'student_info' | 'financial' | 'footer' | 'bank_channel';
  enabled: boolean;
  isRemovable: boolean;
}

export interface StandardFeeItemConfig {
  id: string;
  description: string;
  category: FeeCategory;
  defaultAmount: number;
  isOptional: boolean;
}

export interface FeeReceiptTemplateConfig {
  schoolId?: string;
  institutionName: string;
  institutionMotto: string;
  institutionCode: string;
  kraPin: string;
  nemisCode?: string;
  poBox: string;
  countyCity: string;
  phoneNumber: string;
  emailAddress: string;
  website: string;
  currencySymbol: string;
  receiptPrefix: string;
  bursarDepartmentName: string;
  bursarSignatoryTitle: string;
  principalSignatoryTitle: string;
  mpesaPaybill: string;
  mpesaAccountPattern: string;
  mpesaTillNumber?: string;
  primaryBankName: string;
  primaryBankAccountNumber: string;
  primaryBankBranch: string;
  secondaryBankName?: string;
  secondaryBankAccountNumber?: string;
  receiptTermsAndConditions: string;
  institutionLogoUrl?: string;
  principalSignatureUrl?: string;
  showWatermark: boolean;
  watermarkText: string;
  showQrValidation: boolean;
  showBarcode: boolean;
  colorTheme: 'classic_navy' | 'emerald_ke' | 'maroon_heritage' | 'slate_modern' | 'amber_gold';
  customFields: CustomReceiptField[];
  standardFeeItems: StandardFeeItemConfig[];
  updatedAt?: string;
  updatedBy?: string;
}

export type CBCSchoolLevel = 'primary' | 'junior_secondary' | 'senior_high' | 'hybrid';

export type CBCGradingScaleMode =
  | 'rubric_only'
  | 'numeric_and_rubric'
  | 'knec_letter_scale'
  | 'comprehensive_dual';

export interface CBCPerformanceLevelConfig {
  code: 'EE' | 'ME' | 'AE' | 'BE';
  label: string;
  level: number;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
}

export interface CBCCompetencyItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultRating: 'EE' | 'ME' | 'AE' | 'BE';
  evidenceNotes?: string;
}

export interface CBCValueItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultRating: 'EE' | 'ME' | 'AE' | 'BE';
}

export interface CBCSubjectItemConfig {
  id: string;
  code: string;
  name: string;
  learningArea: string;
  schoolLevel: 'primary' | 'junior_secondary' | 'senior_high' | 'all';
  pathway?: 'STEM' | 'Arts & Sports Science' | 'Social Sciences' | 'Core';
  credits: number;
  enabled: boolean;
  strands?: string[];
}

export interface CBCReportCardConfig {
  schoolId?: string;
  schoolLevel: CBCSchoolLevel;
  institutionName: string;
  institutionMotto: string;
  institutionCode: string;
  nemisCode: string;
  knecCode: string;
  poBox: string;
  countySubCounty: string;
  phoneNumber: string;
  emailAddress: string;
  reportTitle: string;
  academicTerm: string;
  academicYear: string;
  gradingScaleMode: CBCGradingScaleMode;
  showFormativeWeight: boolean;
  formativeAssessmentWeight: number; // e.g. 40
  summativeAssessmentWeight: number; // e.g. 60
  showCoreCompetencies: boolean;
  showValuesAssessment: boolean;
  showCommunityServiceLearning: boolean;
  cslProjectTitle: string;
  showTalentAndExtracurricular: boolean;
  showClassRanking: boolean;
  showGpaPoints: boolean;
  showAttendanceSummary: boolean;
  showFeeBalanceNotice: boolean;
  closingDate: string;
  nextTermOpeningDate: string;
  classTeacherTitle: string;
  principalTitle: string;
  officialSealText: string;
  institutionLogoUrl?: string;
  officialSealUrl?: string;
  colorTheme: 'emerald_cbc' | 'navy_classic' | 'maroon_high' | 'indigo_modern' | 'slate_refined';
  performanceLevels: CBCPerformanceLevelConfig[];
  competencies: CBCCompetencyItem[];
  values: CBCValueItem[];
  customSubjects: CBCSubjectItemConfig[];
  updatedAt?: string;
  updatedBy?: string;
}

