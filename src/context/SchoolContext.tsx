import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Student,
  StudentAcademicRecord,
  DailyAttendanceEntry,
  FeeInvoice,
  DirectMessage,
  MessageThread,
  SchoolAnnouncement,
  AttendanceStatus,
  FeeStatus,
  GradeLevel,
  MessageCategory,
  SubjectAssessment,
  UserAccount,
  RegisteredSchool,
  StaffDivision,
  AdminSession,
  SecurityAuditLog,
  EmergencyBroadcast,
  SchoolSubscription,
  ParentStudentMapping,
  FeeReceiptTemplateConfig,
  CustomReceiptField,
  StandardFeeItemConfig,
  FeeCategory,
  CBCReportCardConfig,
  CBCPerformanceLevelConfig,
  CBCCompetencyItem,
  CBCValueItem,
  CBCSubjectItemConfig,
  CBCSchoolLevel,
} from '../types';
import {
  DEFAULT_FEE_RECEIPT_CONFIG,
  RECEIPT_PRESETS,
} from '../data/mockReceiptConfig';
import {
  DEFAULT_CBC_REPORT_CARD_CONFIG,
  CBC_TEMPLATE_PRESETS,
  DEFAULT_PRIMARY_SUBJECTS,
  DEFAULT_JUNIOR_SUBJECTS,
  DEFAULT_HIGH_SCHOOL_SUBJECTS,
} from '../data/mockCBCReportCardConfig';

import {
  REGISTERED_SCHOOLS,
  DEFAULT_REGISTERED_SCHOOL,
} from '../data/registeredSchools';
import {
  INITIAL_STUDENTS,
  INITIAL_ACADEMIC_RECORDS,
  generateInitialAttendance,
  INITIAL_FEE_INVOICES,
  INITIAL_MESSAGE_THREADS,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_ANNOUNCEMENTS,
} from '../data/mockData';
import { DEMO_ACCOUNTS } from '../data/authAccounts';
import { INITIAL_AUDIT_LOGS } from '../data/mockAuditLogs';
import {
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PARENT_STUDENT_MAPPINGS,
} from '../data/mockSubscriptions';
import { getTeacherForGradeAndSection } from '../utils/teacherAssignment';

interface SchoolContextType {
  activeRole: 'staff' | 'parent';
  setActiveRole: (role: 'staff' | 'parent') => void;
  selectedParentStudentId: string;
  setSelectedParentStudentId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;

  students: Student[];
  academicRecords: StudentAcademicRecord[];
  attendance: DailyAttendanceEntry[];
  invoices: FeeInvoice[];
  threads: MessageThread[];
  messages: DirectMessage[];
  announcements: SchoolAnnouncement[];

  // Statistics
  stats: {
    totalStudents: number;
    todayAttendanceRate: number;
    presentCountToday: number;
    absentCountToday: number;
    lateCountToday: number;
    totalFeesBilled: number;
    totalFeesCollected: number;
    totalFeesOutstanding: number;
    collectionRate: number;
    schoolAverageGpa: number;
    unreadStaffMessages: number;
  };

  // Actions
  addStudent: (
    studentData: Omit<Student, 'id' | 'admissionNo' | 'rollNumber' | 'enrollmentDate'> & {
      initialFeeAmount?: number;
      feeNotes?: string;
    }
  ) => Student;
  updateStudent: (student: Student) => void;
  markAttendance: (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string,
    whereabouts?: string,
    emergencyNotes?: string,
    timeIn?: string,
    reportedBy?: string
  ) => void;
  updateAttendanceWhereabouts: (
    studentId: string,
    date: string,
    whereabouts: string,
    emergencyNotes?: string,
    reportedBy?: string
  ) => void;
  markBulkAttendance: (studentIds: string[], date: string, status: AttendanceStatus) => void;
  updateAcademicGrade: (studentId: string, subjectId: string, scores: Partial<SubjectAssessment>, remarks?: string) => void;
  updateConductRemarks: (studentId: string, conductRemarks: string, principalRemarks: string) => void;
  recordFeePayment: (
    invoiceId: string,
    amount: number,
    paymentMethod: 'Bank Transfer' | 'Credit/Debit Card' | 'Cash' | 'Mobile Money' | 'Online Portal',
    notes?: string
  ) => void;
  sendDirectMessage: (
    studentId: string,
    content: string,
    category?: MessageCategory,
    overrideSender?: { role: 'school_admin' | 'teacher' | 'parent'; name: string },
    attachments?: string[]
  ) => void;
  markThreadRead: (threadId: string, asRole: 'staff' | 'parent') => void;
  createAnnouncement: (
    title: string,
    content: string,
    priority: 'normal' | 'important' | 'urgent',
    targetAudience: 'All Parents & Students' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12',
    tag: string
  ) => void;
  sendAutomatedNoticeToParent: (studentId: string, type: 'attendance_alert' | 'fee_reminder' | 'performance_report') => void;
  resetToDemoData: () => void;
  getStudentAttendanceRate: (studentId: string) => number;
  getStudentAcademicRecord: (studentId: string) => StudentAcademicRecord | undefined;

  // Authentication
  currentUser: UserAccount | null;
  login: (account: UserAccount, selectedSchool?: RegisteredSchool) => void;
  logout: () => void;

  // Dedicated Admin Section & 2FA Security
  adminSession: AdminSession | null;
  verifyAdmin2FA: (
    email: string,
    code: string,
    method: 'totp' | 'email_otp' | 'recovery_key',
    actorName?: string
  ) => { success: boolean; error?: string };
  logoutAdminSession: () => void;
  auditLogs: SecurityAuditLog[];
  logSecurityEvent: (event: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;

  // System Users & IAM Management
  systemUsers: UserAccount[];
  addSystemUser: (user: UserAccount) => void;
  updateSystemUser: (user: UserAccount) => void;
  deleteSystemUser: (userId: string) => void;
  toggleUserLock: (userId: string) => void;
  generateUserMagicLink: (userId: string) => string;

  // School Subscriptions & Licensing
  subscriptions: SchoolSubscription[];
  updateSchoolSubscription: (subscription: SchoolSubscription) => void;
  renewSubscription: (schoolId: string, monthsToAdd?: number) => void;

  // Parent-Student Mapping Roster
  parentStudentMappings: ParentStudentMapping[];
  addParentStudentMapping: (mapping: ParentStudentMapping) => void;
  updateParentStudentMapping: (mapping: ParentStudentMapping) => void;
  deleteParentStudentMapping: (id: string) => void;
  bulkImportParentStudentMappings: (mappings: ParentStudentMapping[]) => { count: number; added: number; updated: number };
  toggleParentPortalAccess: (id: string) => void;
  generateParentAccessCode: (id: string) => string;

  // National School Registry
  registeredSchools: RegisteredSchool[];
  addRegisteredSchool: (school: RegisteredSchool) => void;
  updateRegisteredSchool: (school: RegisteredSchool) => void;
  currentSchool: RegisteredSchool;
  setCurrentSchool: (school: RegisteredSchool) => void;

  // Emergency Broadcast & Global Overrides
  emergencyBroadcast: EmergencyBroadcast;
  setEmergencyBroadcast: (broadcast: EmergencyBroadcast) => void;

  // Staff Divisions & Class Scoping
  activeDivision: StaffDivision | null;
  setActiveDivision: (division: StaffDivision | null) => void;
  assignedClass: string;
  setAssignedClass: (className: string) => void;
  accessibleStudents: Student[];

  // Fee Management for Finance Department
  editStudentFeeBalance: (invoiceId: string, newBalance: number, notes?: string) => void;
  updateFeeInvoiceDetails: (
    invoiceId: string,
    updates: {
      totalAmount?: number;
      paidAmount?: number;
      balance?: number;
      dueDate?: string;
      status?: FeeStatus;
      discount?: number;
      notes?: string;
    }
  ) => void;
  updateFullFeeStatement: (
    invoiceId: string,
    updatedInvoice: Partial<FeeInvoice>
  ) => void;

  // Fee Receipt Customizer & School Preferences
  feeReceiptConfig: FeeReceiptTemplateConfig;
  updateFeeReceiptConfig: (newConfig: Partial<FeeReceiptTemplateConfig>) => void;
  addCustomReceiptField: (field: Omit<CustomReceiptField, 'id'>) => void;
  updateCustomReceiptField: (fieldId: string, updates: Partial<CustomReceiptField>) => void;
  deleteCustomReceiptField: (fieldId: string) => void;
  addStandardFeeItem: (item: Omit<StandardFeeItemConfig, 'id'>) => void;
  updateStandardFeeItem: (itemId: string, updates: Partial<StandardFeeItemConfig>) => void;
  deleteStandardFeeItem: (itemId: string) => void;
  resetReceiptConfigToDefault: (presetKey?: string) => void;

  // CBC Report Card Customizer & Curricular Configuration
  cbcReportCardConfig: CBCReportCardConfig;
  updateCBCReportCardConfig: (newConfig: Partial<CBCReportCardConfig>) => void;
  applyCBCPreset: (presetId: string) => void;
  resetCBCReportCardConfig: () => void;
  addCBCSubject: (subject: Omit<CBCSubjectItemConfig, 'id'>) => void;
  updateCBCSubject: (subjectId: string, updates: Partial<CBCSubjectItemConfig>) => void;
  deleteCBCSubject: (subjectId: string) => void;
  toggleCBCCompetency: (competencyId: string, enabled?: boolean) => void;
  updateCBCCompetency: (competencyId: string, updates: Partial<CBCCompetencyItem>) => void;
  toggleCBCValue: (valueId: string, enabled?: boolean) => void;
  updateCBCValue: (valueId: string, updates: Partial<CBCValueItem>) => void;
  updateCBCPerformanceLevel: (code: 'EE' | 'ME' | 'AE' | 'BE', updates: Partial<CBCPerformanceLevelConfig>) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STUDENTS: 'edupulse_students_v1',
  ACADEMICS: 'edupulse_academics_v1',
  ATTENDANCE: 'edupulse_attendance_v1',
  INVOICES: 'edupulse_invoices_v1',
  THREADS: 'edupulse_threads_v1',
  MESSAGES: 'edupulse_messages_v1',
  ANNOUNCEMENTS: 'edupulse_announcements_v1',
  ROLE: 'edupulse_role_v1',
  PARENT_STUDENT: 'edupulse_parent_student_v1',
  AUTH_USER: 'shule_101_auth_user_v1',
  SCHOOL: 'shule_101_active_school_v1',
  ADMIN_SESSION: 'shule_101_admin_session_v1',
  AUDIT_LOGS: 'shule_101_audit_logs_v1',
  SYSTEM_USERS: 'shule_101_system_users_v1',
  REGISTERED_SCHOOLS: 'shule_101_registered_schools_v1',
  SUBSCRIPTIONS: 'shule_101_subscriptions_v1',
  PARENT_STUDENT_MAPPINGS: 'shule_101_parent_student_mappings_v1',
  EMERGENCY: 'shule_101_emergency_broadcast_v1',
  RECEIPT_CONFIG: 'shule_101_receipt_config_v1',
  CBC_REPORT_CARD_CONFIG: 'shule_101_cbc_report_config_v1',
};

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Registered Schools list
  const [registeredSchools, setRegisteredSchools] = useState<RegisteredSchool[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_SCHOOLS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return REGISTERED_SCHOOLS;
      }
    }
    return REGISTERED_SCHOOLS;
  });

  const [currentSchool, setCurrentSchoolState] = useState<RegisteredSchool>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_REGISTERED_SCHOOL;
      }
    }
    return DEFAULT_REGISTERED_SCHOOL;
  });

  const setCurrentSchool = (school: RegisteredSchool) => {
    setCurrentSchoolState(school);
    localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
  };

  const addRegisteredSchool = (school: RegisteredSchool) => {
    setRegisteredSchools((prev) => {
      const updated = [school, ...prev.filter((s) => s.id !== school.id)];
      localStorage.setItem(STORAGE_KEYS.REGISTERED_SCHOOLS, JSON.stringify(updated));
      return updated;
    });
    logSecurityEvent({
      eventType: 'REGISTRY_MODIFIED',
      severity: 'medium',
      actorEmail: adminSession?.adminEmail || currentUser?.email || 'system_admin',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/schools/${school.id}`,
      details: `Added new school institution: ${school.name} (${school.code}) to national registry.`,
      status: 'success',
    });
  };

  const updateRegisteredSchool = (school: RegisteredSchool) => {
    setRegisteredSchools((prev) => {
      const updated = prev.map((s) => (s.id === school.id ? school : s));
      localStorage.setItem(STORAGE_KEYS.REGISTERED_SCHOOLS, JSON.stringify(updated));
      return updated;
    });
    if (currentSchool.id === school.id) {
      setCurrentSchoolState(school);
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
    }
  };

  // School Subscriptions
  const [subscriptions, setSubscriptions] = useState<SchoolSubscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return INITIAL_SUBSCRIPTIONS;
      }
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  const updateSchoolSubscription = (subscription: SchoolSubscription) => {
    setSubscriptions((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const exists = safePrev.some((s) => s.id === subscription.id || s.schoolId === subscription.schoolId);
      const updated = exists
        ? safePrev.map((s) => (s.id === subscription.id || s.schoolId === subscription.schoolId ? subscription : s))
        : [subscription, ...safePrev];
      return updated;
    });
    logSecurityEvent({
      eventType: 'SUBSCRIPTION_UPDATE',
      severity: 'medium',
      actorEmail: adminSession?.adminEmail || currentUser?.email || 'system_admin',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/subscriptions/${subscription.id}`,
      details: `Updated subscription tier to ${subscription.tier} for school ID: ${subscription.schoolId}`,
      status: 'success',
    });
  };

  const renewSubscription = (schoolId: string, monthsToAdd = 4) => {
    setSubscriptions((prev) =>
      (Array.isArray(prev) ? prev : []).map((sub) => {
        if (sub.schoolId === schoolId) {
          const currentExpiry = new Date(sub.nextRenewalDate);
          const baseDate = !isNaN(currentExpiry.getTime()) && currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
          baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
          return {
            ...sub,
            status: 'active',
            nextRenewalDate: baseDate.toISOString().slice(0, 10),
            lastPaymentRef: `RENEW-MPESA-${Date.now().toString().slice(-6)}`,
          };
        }
        return sub;
      })
    );
    logSecurityEvent({
      eventType: 'SUBSCRIPTION_UPDATE',
      severity: 'low',
      actorEmail: adminSession?.adminEmail || 'system_admin',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/subscriptions/${schoolId}/renew`,
      details: `Renewed subscription for school ${schoolId} by +${monthsToAdd} months.`,
      status: 'success',
    });
  };

  // Parent Student Mappings
  const [parentStudentMappings, setParentStudentMappings] = useState<ParentStudentMapping[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PARENT_STUDENT_MAPPINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return INITIAL_PARENT_STUDENT_MAPPINGS;
      }
    }
    return INITIAL_PARENT_STUDENT_MAPPINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARENT_STUDENT_MAPPINGS, JSON.stringify(parentStudentMappings));
  }, [parentStudentMappings]);

  const addParentStudentMapping = (mapping: ParentStudentMapping) => {
    setParentStudentMappings((prev) => [mapping, ...(Array.isArray(prev) ? prev : [])]);
    logSecurityEvent({
      eventType: 'PARENT_PORTAL_CONFIG',
      severity: 'low',
      actorEmail: adminSession?.adminEmail || currentUser?.email || 'system_admin',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/parent-roster/${mapping.id}`,
      details: `Linked guardian ${mapping.guardianName} (${mapping.guardianEmail}) to student ${mapping.studentName} (${mapping.admissionNumber}).`,
      status: 'success',
    });
  };

  const updateParentStudentMapping = (mapping: ParentStudentMapping) => {
    setParentStudentMappings((prev) => (Array.isArray(prev) ? prev : []).map((m) => (m.id === mapping.id ? mapping : m)));
  };

  const deleteParentStudentMapping = (id: string) => {
    setParentStudentMappings((prev) => (Array.isArray(prev) ? prev : []).filter((m) => m.id !== id));
    logSecurityEvent({
      eventType: 'PARENT_PORTAL_CONFIG',
      severity: 'medium',
      actorEmail: adminSession?.adminEmail || 'system_admin',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/parent-roster/${id}`,
      details: `Removed parent-student mapping record ID: ${id}`,
      status: 'warning',
    });
  };

  const bulkImportParentStudentMappings = (mappings: ParentStudentMapping[]): { count: number; added: number; updated: number } => {
    let addedCount = 0;
    let updatedCount = 0;
    setParentStudentMappings((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existingMap = new Map(safePrev.map((m) => [m.admissionNumber.toLowerCase(), m]));
      mappings.forEach((m) => {
        const key = m.admissionNumber.toLowerCase();
        if (existingMap.has(key)) {
          existingMap.set(key, { ...existingMap.get(key)!, ...m });
          updatedCount++;
        } else {
          existingMap.set(key, m);
          addedCount++;
        }
      });
      return Array.from(existingMap.values());
    });
    logSecurityEvent({
      eventType: 'PARENT_PORTAL_CONFIG',
      severity: 'medium',
      actorEmail: adminSession?.adminEmail || 'system_admin',
      ipAddress: '197.232.14.88',
      targetResource: '/admin/parent-roster/bulk-import',
      details: `Bulk imported ${mappings.length} records (${addedCount} added, ${updatedCount} updated).`,
      status: 'success',
    });
    return { count: mappings.length, added: addedCount, updated: updatedCount };
  };

  const toggleParentPortalAccess = (id: string) => {
    setParentStudentMappings((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) => {
        if (m.id === id) {
          const nextStatus = m.portalAccessStatus === 'active' ? 'suspended' : 'active';
          return { ...m, portalAccessStatus: nextStatus };
        }
        return m;
      })
    );
  };

  const generateParentAccessCode = (id: string): string => {
    const newCode = `SHULE-PRNT-${Math.floor(1000 + Math.random() * 9000)}`;
    setParentStudentMappings((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) => (m.id === id ? { ...m, accessCode: newCode } : m))
    );
    return newCode;
  };

  // Fee Receipt Template & Customization Preferences
  const [feeReceiptConfig, setFeeReceiptConfig] = useState<FeeReceiptTemplateConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.institutionName) return parsed;
      } catch (e) {
        return DEFAULT_FEE_RECEIPT_CONFIG;
      }
    }
    return DEFAULT_FEE_RECEIPT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPT_CONFIG, JSON.stringify(feeReceiptConfig));
  }, [feeReceiptConfig]);

  const updateFeeReceiptConfig = (newConfig: Partial<FeeReceiptTemplateConfig>) => {
    setFeeReceiptConfig((prev) => ({
      ...prev,
      ...newConfig,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const addCustomReceiptField = (field: Omit<CustomReceiptField, 'id'>) => {
    const newField: CustomReceiptField = {
      ...field,
      id: `field-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRemovable: true,
    };
    setFeeReceiptConfig((prev) => ({
      ...prev,
      customFields: [...(prev.customFields || []), newField],
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const updateCustomReceiptField = (fieldId: string, updates: Partial<CustomReceiptField>) => {
    setFeeReceiptConfig((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const deleteCustomReceiptField = (fieldId: string) => {
    setFeeReceiptConfig((prev) => ({
      ...prev,
      customFields: (prev.customFields || []).filter((f) => f.id !== fieldId),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const addStandardFeeItem = (item: Omit<StandardFeeItemConfig, 'id'>) => {
    const newItem: StandardFeeItemConfig = {
      ...item,
      id: `fee-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setFeeReceiptConfig((prev) => ({
      ...prev,
      standardFeeItems: [...(prev.standardFeeItems || []), newItem],
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const updateStandardFeeItem = (itemId: string, updates: Partial<StandardFeeItemConfig>) => {
    setFeeReceiptConfig((prev) => ({
      ...prev,
      standardFeeItems: (prev.standardFeeItems || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const deleteStandardFeeItem = (itemId: string) => {
    setFeeReceiptConfig((prev) => ({
      ...prev,
      standardFeeItems: (prev.standardFeeItems || []).filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Administrator',
    }));
  };

  const resetReceiptConfigToDefault = (presetKey?: string) => {
    let newConfig = { ...DEFAULT_FEE_RECEIPT_CONFIG };
    if (presetKey && RECEIPT_PRESETS[presetKey]) {
      newConfig = { ...DEFAULT_FEE_RECEIPT_CONFIG, ...RECEIPT_PRESETS[presetKey] };
    }
    setFeeReceiptConfig(newConfig);
  };

  // -------------------------------------------------------------
  // CBC REPORT CARD TEMPLATE & CURRICULUM CONFIGURATION
  // -------------------------------------------------------------
  const [cbcReportCardConfig, setCbcReportCardConfig] = useState<CBCReportCardConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CBC_REPORT_CARD_CONFIG);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.institutionName && parsed.schoolLevel) return parsed;
      } catch (e) {
        return DEFAULT_CBC_REPORT_CARD_CONFIG;
      }
    }
    return DEFAULT_CBC_REPORT_CARD_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CBC_REPORT_CARD_CONFIG, JSON.stringify(cbcReportCardConfig));
  }, [cbcReportCardConfig]);

  const updateCBCReportCardConfig = (newConfig: Partial<CBCReportCardConfig>) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      ...newConfig,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const applyCBCPreset = (presetId: string) => {
    const preset = CBC_TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    let targetSubjects = cbcReportCardConfig.customSubjects;
    if (preset.level === 'primary') {
      targetSubjects = DEFAULT_PRIMARY_SUBJECTS;
    } else if (preset.level === 'junior_secondary') {
      targetSubjects = DEFAULT_JUNIOR_SUBJECTS;
    } else if (preset.level === 'senior_high' || preset.level === 'hybrid') {
      targetSubjects = DEFAULT_HIGH_SCHOOL_SUBJECTS;
    }

    setCbcReportCardConfig((prev) => ({
      ...prev,
      ...preset.config,
      schoolLevel: preset.level,
      customSubjects: targetSubjects,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const resetCBCReportCardConfig = () => {
    setCbcReportCardConfig({ ...DEFAULT_CBC_REPORT_CARD_CONFIG });
  };

  const addCBCSubject = (subject: Omit<CBCSubjectItemConfig, 'id'>) => {
    const newSubject: CBCSubjectItemConfig = {
      ...subject,
      id: `subj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    setCbcReportCardConfig((prev) => ({
      ...prev,
      customSubjects: [...(prev.customSubjects || []), newSubject],
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const updateCBCSubject = (subjectId: string, updates: Partial<CBCSubjectItemConfig>) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      customSubjects: (prev.customSubjects || []).map((sub) =>
        sub.id === subjectId ? { ...sub, ...updates } : sub
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const deleteCBCSubject = (subjectId: string) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      customSubjects: (prev.customSubjects || []).filter((sub) => sub.id !== subjectId),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const toggleCBCCompetency = (competencyId: string, enabled?: boolean) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      competencies: (prev.competencies || []).map((comp) =>
        comp.id === competencyId
          ? { ...comp, enabled: enabled !== undefined ? enabled : !comp.enabled }
          : comp
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const updateCBCCompetency = (competencyId: string, updates: Partial<CBCCompetencyItem>) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      competencies: (prev.competencies || []).map((comp) =>
        comp.id === competencyId ? { ...comp, ...updates } : comp
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const toggleCBCValue = (valueId: string, enabled?: boolean) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      values: (prev.values || []).map((val) =>
        val.id === valueId
          ? { ...val, enabled: enabled !== undefined ? enabled : !val.enabled }
          : val
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const updateCBCValue = (valueId: string, updates: Partial<CBCValueItem>) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      values: (prev.values || []).map((val) =>
        val.id === valueId ? { ...val, ...updates } : val
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };

  const updateCBCPerformanceLevel = (code: 'EE' | 'ME' | 'AE' | 'BE', updates: Partial<CBCPerformanceLevelConfig>) => {
    setCbcReportCardConfig((prev) => ({
      ...prev,
      performanceLevels: (prev.performanceLevels || []).map((pl) =>
        pl.code === code ? { ...pl, ...updates } : pl
      ),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || currentUser?.name || 'Academic Administrator',
    }));
  };


  // System Users (IAM Directory)
  const [systemUsers, setSystemUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_ACCOUNTS;
      }
    }
    return DEMO_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_USERS, JSON.stringify(systemUsers));
  }, [systemUsers]);

  // Security Audit Logs
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_AUDIT_LOGS;
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logSecurityEvent = (event: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityAuditLog = {
      ...event,
      id: `log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]); // Keep last 100 entries
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  };

  // Admin 2FA Session state
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    if (saved) {
      try {
        const parsed: AdminSession = JSON.parse(saved);
        // Check if expired
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          return parsed;
        } else {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
          return null;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Emergency Broadcast State
  const [emergencyBroadcast, setEmergencyBroadcastState] = useState<EmergencyBroadcast>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // default
      }
    }
    return {
      enabled: false,
      title: 'Administrative System Notice',
      message: 'System is running normally under active security telemetry and 2-step verification protocol.',
      severity: 'info',
      updatedAt: '2026-09-13 08:00:00',
      updatedBy: 'National Directorate Overseer',
    };
  });

  const setEmergencyBroadcast = (broadcast: EmergencyBroadcast) => {
    setEmergencyBroadcastState(broadcast);
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(broadcast));
    logSecurityEvent({
      eventType: 'EMERGENCY_LOCKDOWN',
      severity: broadcast.enabled ? 'high' : 'low',
      actorEmail: adminSession?.adminEmail || 'admin@shule101.gov',
      ipAddress: '197.232.14.88',
      targetResource: '/admin/broadcast',
      details: broadcast.enabled
        ? `Emergency Broadcast activated: "${broadcast.title}" (${broadcast.severity})`
        : 'Emergency Broadcast deactivated.',
      status: 'warning',
    });
  };

  // 2FA Verification Handler
  const verifyAdmin2FA = (
    email: string,
    code: string,
    method: 'totp' | 'email_otp' | 'recovery_key',
    actorName?: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().replace(/\s+/g, '').replace(/-/g, '');

    // Check if account exists or is designated admin
    const account = systemUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const isAuthorizedAdminEmail =
      cleanEmail.includes('admin') ||
      cleanEmail === 'principal@shule101.edu' ||
      cleanEmail.endsWith('.gov') ||
      account?.isAdmin ||
      account?.role === 'admin';

    if (!isAuthorizedAdminEmail) {
      logSecurityEvent({
        eventType: 'AUTH_FAILURE_403',
        severity: 'high',
        actorEmail: cleanEmail || 'unauthorized@attempt.org',
        ipAddress: '192.168.1.104',
        targetResource: '/admin',
        details: `Access Denied (403): Email ${cleanEmail} is not authorized for Master Administrative 2FA clearance.`,
        status: 'blocked',
      });
      return {
        success: false,
        error: '403 Forbidden: This email address does not have master administrative clearance in the national directory.',
      };
    }

    if (account?.isLocked) {
      logSecurityEvent({
        eventType: 'AUTH_FAILURE_403',
        severity: 'critical',
        actorEmail: cleanEmail,
        ipAddress: '192.168.1.104',
        targetResource: '/admin',
        details: `Access Denied (403): Account ${cleanEmail} is currently locked by security governance.`,
        status: 'blocked',
      });
      return {
        success: false,
        error: '403 Forbidden: This administrator account has been locked. Contact National Directorate Security.',
      };
    }

    // Validate 2FA code
    // Accepted codes:
    // - Recovery key: "SHULE-ADMIN-SECURE-2026-KEY" (or clean "SHULEADMINSECURE2026KEY")
    // - Email OTP: "849201" or any 6-digit code
    // - TOTP: any 6-digit code
    let codeValid = false;
    if (method === 'recovery_key') {
      codeValid = cleanCode.toUpperCase() === 'SHULEADMINSECURE2026KEY' || cleanCode.toUpperCase().includes('SHULE');
    } else {
      // 6 digits
      codeValid = cleanCode.length === 6 && /^\d+$/.test(cleanCode);
    }

    if (!codeValid) {
      logSecurityEvent({
        eventType: 'AUTH_FAILURE_403',
        severity: 'medium',
        actorEmail: cleanEmail,
        ipAddress: '192.168.1.104',
        targetResource: '/admin/2fa',
        details: `Failed 2-Step Authentication attempt for ${cleanEmail} using method ${method}. Invalid code.`,
        status: 'blocked',
      });
      return {
        success: false,
        error: 'Invalid verification code. Please enter the valid 6-digit OTP code or Master Recovery Key.',
      };
    }

    // Success! Generate Admin Session
    const now = new Date();
    const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const adminName = actorName || account?.name || (cleanEmail.includes('admin') ? 'Master System Administrator' : 'Administrator');

    const sessionObj: AdminSession = {
      token,
      adminEmail: cleanEmail,
      adminName,
      verifiedAt: now.toISOString().replace('T', ' ').substring(0, 19),
      expiresAt: expires.toISOString(),
      twoFactorMethod: method,
      clearanceLevel: 'Master System Administrator',
    };

    setAdminSession(sessionObj);
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(sessionObj));

    // Also update current user if not already set or elevate
    if (!currentUser || currentUser.email.toLowerCase() !== cleanEmail) {
      const adminUser: UserAccount = account || {
        id: `usr-admin-${Date.now()}`,
        name: adminName,
        email: cleanEmail,
        role: 'admin',
        staffDivision: 'admin',
        isAdmin: true,
        twoFactorEnabled: true,
        title: 'Master System Administrator • 2FA Verified',
        schoolId: currentSchool.id,
        schoolName: currentSchool.name,
      };
      setCurrentUser(adminUser);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(adminUser));
      setActiveRoleState('staff');
    }

    logSecurityEvent({
      eventType: 'AUTH_SUCCESS_2FA',
      severity: 'low',
      actorEmail: cleanEmail,
      ipAddress: '197.232.14.88',
      targetResource: '/admin',
      details: `2-Step Authentication successful (${method.toUpperCase()}). Master Administrator session established.`,
      status: 'success',
    });

    return { success: true };
  };

  const logoutAdminSession = () => {
    if (adminSession) {
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS_2FA',
        severity: 'low',
        actorEmail: adminSession.adminEmail,
        ipAddress: '197.232.14.88',
        targetResource: '/admin/logout',
        details: 'Master Administrator ended session and revoked 2FA token.',
        status: 'success',
      });
    }
    setAdminSession(null);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  };

  // IAM User Management Handlers
  const addSystemUser = (user: UserAccount) => {
    setSystemUsers((prev) => [user, ...prev.filter((u) => u.id !== user.id)]);
    logSecurityEvent({
      eventType: 'USER_PERMISSION_CHANGED',
      severity: 'medium',
      actorEmail: adminSession?.adminEmail || 'admin@shule101.gov',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/users/${user.id}`,
      details: `Created new user account: ${user.name} (${user.email}, Role: ${user.role}/${user.staffDivision || 'N/A'}).`,
      status: 'success',
    });
  };

  const updateSystemUser = (user: UserAccount) => {
    setSystemUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    logSecurityEvent({
      eventType: 'USER_PERMISSION_CHANGED',
      severity: 'medium',
      actorEmail: adminSession?.adminEmail || 'admin@shule101.gov',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/users/${user.id}`,
      details: `Updated permissions/details for ${user.name} (${user.email}).`,
      status: 'success',
    });
  };

  const deleteSystemUser = (userId: string) => {
    const target = systemUsers.find((u) => u.id === userId);
    setSystemUsers((prev) => prev.filter((u) => u.id !== userId));
    logSecurityEvent({
      eventType: 'USER_PERMISSION_CHANGED',
      severity: 'high',
      actorEmail: adminSession?.adminEmail || 'admin@shule101.gov',
      ipAddress: '197.232.14.88',
      targetResource: `/admin/users/${userId}`,
      details: `Deleted user profile: ${target?.name || userId} (${target?.email || 'N/A'}).`,
      status: 'warning',
    });
  };

  const toggleUserLock = (userId: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextLocked = !u.isLocked;
          logSecurityEvent({
            eventType: nextLocked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED',
            severity: nextLocked ? 'high' : 'low',
            actorEmail: adminSession?.adminEmail || 'admin@shule101.gov',
            ipAddress: '197.232.14.88',
            targetResource: `/admin/users/${userId}`,
            details: `${nextLocked ? 'Locked' : 'Unlocked'} account access for ${u.name} (${u.email}).`,
            status: nextLocked ? 'warning' : 'success',
          });
          return { ...u, isLocked: nextLocked };
        }
        return u;
      })
    );
  };

  const generateUserMagicLink = (userId: string): string => {
    const u = systemUsers.find((user) => user.id === userId);
    const token = `magic_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const emailParam = encodeURIComponent(u?.email || 'user@shule101.edu');
    return `${window.location.origin}/admin?auth_token=${token}&email=${emailParam}&target=2fa_verify`;
  };
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeRole, setActiveRoleState] = useState<'staff' | 'parent'>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) return parsed.role;
      } catch (e) {
        // ignore
      }
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'parent' ? 'parent' : 'staff';
  });

  const [selectedParentStudentId, setSelectedParentStudentIdState] = useState<string>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.studentId) return parsed.studentId;
      } catch (e) {
        // ignore
      }
    }
    return localStorage.getItem(STORAGE_KEYS.PARENT_STUDENT) || 'std-1';
  });

  const [assignedClass, setAssignedClassState] = useState<string>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.assignedClass) return parsed.assignedClass;
      } catch (e) {
        // ignore
      }
    }
    return (
      localStorage.getItem('shule_101_assigned_class_v1') ||
      localStorage.getItem('shule_central_assigned_class_v1') ||
      'Grade 10-A'
    );
  });

  const setAssignedClass = (className: string) => {
    setAssignedClassState(className);
    localStorage.setItem('shule_101_assigned_class_v1', className);
    if (currentUser && currentUser.role === 'staff') {
      const updated = { ...currentUser, assignedClass: className };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
    }
  };

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-10');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');

  // Core Data
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_STUDENTS;
  });

  const [academicRecords, setAcademicRecords] = useState<StudentAcademicRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACADEMICS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_ACADEMIC_RECORDS;
  });

  const [attendance, setAttendance] = useState<DailyAttendanceEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return generateInitialAttendance();
  });

  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_FEE_INVOICES;
  });

  const [threads, setThreads] = useState<MessageThread[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THREADS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_MESSAGE_THREADS;
  });

  const [messages, setMessages] = useState<DirectMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_DIRECT_MESSAGES;
  });

  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARENT_STUDENT, selectedParentStudentId);
  }, [selectedParentStudentId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACADEMICS, JSON.stringify(academicRecords));
  }, [academicRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  // Synchronize invoices and ledger data across browser tabs/windows in real time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.INVOICES && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setInvoices(parsed);
        } catch (err) {
          console.error('Failed to sync invoices from storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setActiveRole = (role: 'staff' | 'parent') => {
    setActiveRoleState(role);
  };

  const setSelectedParentStudentId = (id: string) => {
    setSelectedParentStudentIdState(id);
  };

  // Helper: Attendance rate for a single student
  const getStudentAttendanceRate = (studentId: string): number => {
    const studentRecords = attendance.filter((a) => a.studentId === studentId);
    if (studentRecords.length === 0) return 100;
    const presentOrLate = studentRecords.filter((a) => a.status === 'present' || a.status === 'late' || a.status === 'excused').length;
    return Math.round((presentOrLate / studentRecords.length) * 100);
  };

  // Helper: Academic record for a student
  const getStudentAcademicRecord = (studentId: string): StudentAcademicRecord | undefined => {
    return academicRecords.find((r) => r.studentId === studentId);
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const totalStudents = students.length;

    // Today's attendance
    const todayEntries = attendance.filter((a) => a.date === selectedDate);
    const presentCount = todayEntries.filter((a) => a.status === 'present').length;
    const lateCount = todayEntries.filter((a) => a.status === 'late').length;
    const excusedCount = todayEntries.filter((a) => a.status === 'excused').length;
    const absentCount = todayEntries.filter((a) => a.status === 'absent').length;

    const attendedToday = presentCount + lateCount + excusedCount;
    const todayAttendanceRate = todayEntries.length > 0 ? Math.round((attendedToday / todayEntries.length) * 100) : 95;

    // Financial calculations
    const totalFeesBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalFeesCollected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalFeesOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const collectionRate = totalFeesBilled > 0 ? Math.round((totalFeesCollected / totalFeesBilled) * 100) : 0;

    // Academic GPA average
    const validGpas = academicRecords.map((r) => r.overallGpa).filter((gpa) => gpa > 0);
    const schoolAverageGpa =
      validGpas.length > 0 ? Number((validGpas.reduce((a, b) => a + b, 0) / validGpas.length).toFixed(2)) : 3.5;

    // Unread messages
    const unreadStaffMessages = threads.reduce((acc, t) => acc + t.unreadCountForStaff, 0);

    return {
      totalStudents,
      todayAttendanceRate,
      presentCountToday: presentCount,
      absentCountToday: absentCount,
      lateCountToday: lateCount,
      totalFeesBilled,
      totalFeesCollected,
      totalFeesOutstanding,
      collectionRate,
      schoolAverageGpa,
      unreadStaffMessages,
    };
  }, [students, attendance, invoices, academicRecords, threads, selectedDate]);

  // Active Staff Division (Principal, Teacher, or Finance)
  const activeDivision: StaffDivision | null = useMemo(() => {
    if (activeRole !== 'staff') return null;
    return currentUser?.staffDivision || 'principal';
  }, [activeRole, currentUser]);

  const setActiveDivision = (division: StaffDivision | null) => {
    if (currentUser && currentUser.role === 'staff') {
      const updated: UserAccount = { ...currentUser, staffDivision: division || undefined };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
    }
  };

  // Accessible students scoped by role and division:
  // - Teacher: strictly limited to students in their assigned class (e.g. 'Grade 10-A')
  // - Principal / Headmaster: executive view of all pupils across the school
  // - Finance Department: all student records for institutional fee management
  // - Parent: their specific enrolled child/pupil
  const accessibleStudents = useMemo(() => {
    if (activeRole === 'parent') {
      const sid = selectedParentStudentId || currentUser?.studentId || 'std-1';
      return students.filter((s) => s.id === sid);
    }
    if (activeRole === 'staff' && activeDivision === 'teacher') {
      const targetClass = assignedClass || currentUser?.assignedClass || 'Grade 10-A';
      return students.filter((s) => `${s.grade}-${s.section}` === targetClass);
    }
    // Principal and Finance: all pupils in the school
    return students;
  }, [students, activeRole, activeDivision, assignedClass, currentUser, selectedParentStudentId]);

  // Actions
  const addStudent = (
    studentData: Omit<Student, 'id' | 'admissionNo' | 'rollNumber' | 'enrollmentDate'> & {
      initialFeeAmount?: number;
      feeNotes?: string;
    }
  ): Student => {
    const nextNum = students.length + 1;
    const newId = `std-${Date.now()}`;
    const gradeShort = studentData.grade.replace('Grade ', '');
    const sectionChoice = studentData.section || 'A';
    const rollNumber = `${gradeShort}${sectionChoice}-${String(nextNum).padStart(2, '0')}`;
    const admissionNo = `ADM-2025-${String(nextNum).padStart(3, '0')}`;

    // Automatically determine appropriate assigned class teacher
    const assignedTeacher = getTeacherForGradeAndSection(studentData.grade, sectionChoice);

    const newStudent: Student = {
      ...studentData,
      id: newId,
      admissionNo,
      rollNumber,
      section: sectionChoice,
      enrollmentDate: new Date().toISOString().split('T')[0],
      avatar:
        studentData.avatar ||
        (studentData.gender === 'Female'
          ? `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80`
          : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`),
      assignedTeacher,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Create default academic record for new student with assigned class teacher
    const defaultAcademic: StudentAcademicRecord = {
      studentId: newId,
      term: 'Term 2',
      academicYear: '2025/2026',
      overallGpa: 3.5,
      rank: students.length + 1,
      totalStudentsInClass: 28,
      attendancePercentage: 100,
      conductRemarks: `Enrolled in ${newStudent.grade} (${newStudent.section}) under Class Teacher ${assignedTeacher.name}. Eager attitude and active baseline performances.`,
      principalRemarks: `Welcome to ${currentSchool?.name || 'the academy'} community.`,
      subjects: [
        {
          subjectId: 'sub-math',
          subjectName: 'Mathematics',
          teacherName: 'Dr. Gregory Vance',
          credits: 4,
          scores: { test1: 17, test2: 17, midterm: 26, finalExam: 26, assignment: 9 },
          totalScore: 86,
          letterGrade: 'B+',
          gpaPoint: 3.4,
          remarks: 'Solid problem-solving baseline.',
        },
        {
          subjectId: 'sub-sci',
          subjectName: 'General Science & CBC Learning',
          teacherName: assignedTeacher.name,
          credits: 4,
          scores: { test1: 18, test2: 17, midterm: 27, finalExam: 26, assignment: 9 },
          totalScore: 88,
          letterGrade: 'A',
          gpaPoint: 3.8,
          remarks: `Mentored directly by ${assignedTeacher.name}.`,
        },
        {
          subjectId: 'sub-eng',
          subjectName: 'English & Literature',
          teacherName: 'Ms. Rebecca Sterling',
          credits: 3,
          scores: { test1: 18, test2: 18, midterm: 27, finalExam: 27, assignment: 9 },
          totalScore: 90,
          letterGrade: 'A',
          gpaPoint: 3.8,
          remarks: 'Strong vocabulary and reading comprehension.',
        },
      ],
    };
    setAcademicRecords((prev) => [...prev, defaultAcademic]);

    // Create default fee invoice with realistic Kenya Shillings fees
    const tuitionAmount = studentData.initialFeeAmount && studentData.initialFeeAmount > 0 ? studentData.initialFeeAmount : 48500;
    const tuitionPart = Math.round(tuitionAmount * 0.74);
    const labPart = Math.round(tuitionAmount * 0.14);
    const portalPart = Math.round(tuitionAmount * 0.06);
    const athleticsPart = tuitionAmount - tuitionPart - labPart - portalPart;

    const newInvoice: FeeInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-2025-0${900 + nextNum}`,
      studentId: newId,
      term: 'Term 2',
      academicYear: '2025/2026',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-09-30',
      totalAmount: tuitionAmount,
      paidAmount: 0,
      balance: tuitionAmount,
      status: 'pending',
      items: [
        { id: `item-${Date.now()}-1`, description: 'Term 2 Tuition & Faculty Instruction', amount: tuitionPart, category: 'Tuition' },
        { id: `item-${Date.now()}-2`, description: 'Science & CBC Lab Learning Materials', amount: labPart, category: 'Laboratory' },
        { id: `item-${Date.now()}-3`, description: 'Digital LMS & Parent Portal License', amount: portalPart, category: 'Annual Package' },
        { id: `item-${Date.now()}-4`, description: 'Athletics & Extracurricular Development', amount: athleticsPart, category: 'Extracurricular' },
      ],
      paymentHistory: [],
    };
    setInvoices((prev) => [...prev, newInvoice]);

    // Create default message thread for parent communications
    const newThread: MessageThread = {
      id: `thread-${newId}`,
      studentId: newId,
      studentName: `${newStudent.firstName} ${newStudent.lastName}`,
      parentName: newStudent.guardian.name,
      parentPhone: newStudent.guardian.phone,
      parentEmail: newStudent.guardian.email,
      grade: newStudent.grade,
      lastMessage: 'Welcome to our school! The parent communication desk is open for inquiries.',
      lastMessageTime: 'Just now',
      unreadCountForStaff: 0,
      unreadCountForParent: 1,
      category: 'general',
    };
    setThreads((prev) => [newThread, ...prev]);

    // Register Parent-Student Mapping so parent can easily access the platform via their registered email
    const cleanParentEmail = (newStudent.guardian.email || '').toLowerCase().trim();
    const accessCode = `SHULE-PRNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMapping: ParentStudentMapping = {
      id: `psm-${Date.now()}`,
      studentId: newId,
      studentName: `${newStudent.firstName} ${newStudent.lastName}`,
      admissionNumber: admissionNo,
      grade: `${newStudent.grade}-${newStudent.section}`,
      schoolId: currentSchool?.id || 'sch-01',
      guardianName: newStudent.guardian.name,
      guardianEmail: cleanParentEmail,
      guardianPhone: newStudent.guardian.phone,
      relationship: (newStudent.guardian.relation as any) || 'Mother',
      portalAccessStatus: 'active',
      accessCode,
      lastAccessed: 'Just registered',
    };
    setParentStudentMappings((prev) => [newMapping, ...(Array.isArray(prev) ? prev : [])]);

    // Register Parent UserAccount in System IAM Directory for instant authentication
    const parentAccount: UserAccount = {
      id: `usr-parent-${newId}`,
      name: newStudent.guardian.name,
      email: cleanParentEmail,
      role: 'parent',
      title: `Parent / Guardian of ${newStudent.firstName} ${newStudent.lastName} (${newStudent.grade}-${newStudent.section})`,
      studentId: newId,
      schoolId: currentSchool?.id || 'sch-01',
      schoolName: currentSchool?.name || 'Shule 101 Academy',
      phone: newStudent.guardian.phone,
      lastLogin: 'Never (New Enrollee)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    };
    setSystemUsers((prev) => [
      parentAccount,
      ...(Array.isArray(prev) ? prev.filter((u) => u.email.toLowerCase() !== cleanParentEmail) : []),
    ]);

    // Audit log
    logSecurityEvent({
      eventType: 'PARENT_PORTAL_CONFIG',
      severity: 'low',
      actorEmail: currentUser?.email || 'finance@shule101.edu',
      ipAddress: '197.232.14.88',
      targetResource: `/students/${newId}`,
      details: `Finance Department registered new student ${newStudent.firstName} ${newStudent.lastName} (${admissionNo}) in ${newStudent.grade}-${newStudent.section}. Automatically placed with class teacher ${assignedTeacher.name} (${assignedTeacher.email}). Registered guardian email ${cleanParentEmail} for portal access (Code: ${accessCode}).`,
      status: 'success',
    });

    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setThreads((prev) =>
      prev.map((t) =>
        t.studentId === updatedStudent.id
          ? {
              ...t,
              studentName: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
              parentName: updatedStudent.guardian.name,
              parentPhone: updatedStudent.guardian.phone,
              parentEmail: updatedStudent.guardian.email,
              grade: updatedStudent.grade,
            }
          : t
      )
    );
  };

  const markAttendance = (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string,
    whereabouts?: string,
    emergencyNotes?: string,
    timeInCustom?: string,
    reportedBy?: string
  ) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.studentId === studentId && entry.date === date);
      const defaultTime = status === 'present' ? '07:55 AM' : status === 'late' ? '08:20 AM' : undefined;
      const finalTimeIn = timeInCustom !== undefined ? timeInCustom : defaultTime;
      const defaultWhereabouts =
        status === 'present'
          ? 'On Campus / Classroom (Present & Safe)'
          : status === 'absent'
          ? 'Home / Parent Verification Pending'
          : status === 'late'
          ? 'Arrived on Campus (Tardy)'
          : 'Excused Leave';

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          status,
          notes: notes !== undefined ? notes : existing.notes,
          whereabouts: whereabouts !== undefined ? whereabouts : existing.whereabouts || defaultWhereabouts,
          emergencyNotes: emergencyNotes !== undefined ? emergencyNotes : existing.emergencyNotes,
          reportedBy: reportedBy !== undefined ? reportedBy : existing.reportedBy,
          timeIn: finalTimeIn,
        };
        return updated;
      } else {
        const newEntry: DailyAttendanceEntry = {
          id: `att-${studentId}-${date}`,
          studentId,
          date,
          status,
          notes,
          whereabouts: whereabouts || defaultWhereabouts,
          emergencyNotes,
          reportedBy: reportedBy || 'Class Teacher',
          timeIn: finalTimeIn,
        };
        return [...prev, newEntry];
      }
    });
  };

  const updateAttendanceWhereabouts = (
    studentId: string,
    date: string,
    whereabouts: string,
    emergencyNotes?: string,
    reportedBy?: string
  ) => {
    setAttendance((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.studentId === studentId && entry.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          whereabouts,
          emergencyNotes: emergencyNotes !== undefined ? emergencyNotes : updated[existingIndex].emergencyNotes,
          reportedBy: reportedBy !== undefined ? reportedBy : updated[existingIndex].reportedBy,
        };
        return updated;
      } else {
        const newEntry: DailyAttendanceEntry = {
          id: `att-${studentId}-${date}`,
          studentId,
          date,
          status: 'absent',
          whereabouts,
          emergencyNotes,
          reportedBy: reportedBy || 'Class Teacher',
        };
        return [...prev, newEntry];
      }
    });
  };

  const markBulkAttendance = (studentIds: string[], date: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const updated = [...prev];
      studentIds.forEach((studentId) => {
        const existingIndex = updated.findIndex((entry) => entry.studentId === studentId && entry.date === date);
        const timeIn = status === 'present' ? '07:55 AM' : status === 'late' ? '08:20 AM' : undefined;

        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            status,
            timeIn,
          };
        } else {
          updated.push({
            id: `att-${studentId}-${date}`,
            studentId,
            date,
            status,
            timeIn,
          });
        }
      });
      return updated;
    });
  };

  const updateAcademicGrade = (
    studentId: string,
    subjectId: string,
    scores: Partial<SubjectAssessment>,
    remarks?: string
  ) => {
    setAcademicRecords((prev) => {
      return prev.map((record) => {
        if (record.studentId !== studentId) return record;

        const updatedSubjects = record.subjects.map((sub) => {
          if (sub.subjectId !== subjectId) return sub;

          const mergedScores: SubjectAssessment = {
            ...sub.scores,
            ...scores,
          };

          const totalScore = Math.min(
            100,
            mergedScores.test1 +
              mergedScores.test2 +
              mergedScores.midterm +
              mergedScores.finalExam +
              mergedScores.assignment
          );

          let letterGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' = 'C';
          let gpaPoint = 2.0;

          if (totalScore >= 93) {
            letterGrade = 'A+';
            gpaPoint = 4.0;
          } else if (totalScore >= 87) {
            letterGrade = 'A';
            gpaPoint = 3.8;
          } else if (totalScore >= 82) {
            letterGrade = 'B+';
            gpaPoint = 3.4;
          } else if (totalScore >= 77) {
            letterGrade = 'B';
            gpaPoint = 3.0;
          } else if (totalScore >= 72) {
            letterGrade = 'C+';
            gpaPoint = 2.7;
          } else if (totalScore >= 65) {
            letterGrade = 'C';
            gpaPoint = 2.3;
          } else if (totalScore >= 55) {
            letterGrade = 'D';
            gpaPoint = 1.7;
          } else {
            letterGrade = 'F';
            gpaPoint = 0.0;
          }

          return {
            ...sub,
            scores: mergedScores,
            totalScore,
            letterGrade,
            gpaPoint,
            remarks: remarks !== undefined ? remarks : sub.remarks,
          };
        });

        // Recalculate overall GPA
        const totalPoints = updatedSubjects.reduce((sum, s) => sum + s.gpaPoint * s.credits, 0);
        const totalCredits = updatedSubjects.reduce((sum, s) => sum + s.credits, 0);
        const overallGpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : record.overallGpa;

        return {
          ...record,
          subjects: updatedSubjects,
          overallGpa,
        };
      });
    });
  };

  const updateConductRemarks = (studentId: string, conductRemarks: string, principalRemarks: string) => {
    setAcademicRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, conductRemarks, principalRemarks } : r))
    );
  };

  const recordFeePayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: 'Bank Transfer' | 'Credit/Debit Card' | 'Cash' | 'Mobile Money' | 'Online Portal',
    notes?: string,
    payerAccount?: string,
    payerName?: string,
    paymentDate?: string
  ) => {
    let recordedReceiptNo = '';
    let targetStudentId = '';
    let targetStudentName = '';
    let updatedBalance = 0;

    setInvoices((prev) => {
      return prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;

        const targetStudent = students.find((s) => s.id === inv.studentId);
        targetStudentId = inv.studentId;
        targetStudentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Student';

        const newPaidAmount = Math.min(inv.totalAmount, inv.paidAmount + amount);
        const newBalance = Math.max(0, inv.totalAmount - newPaidAmount);
        updatedBalance = newBalance;
        const newStatus = newBalance === 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : inv.status;

        const defaultAccount =
          paymentMethod === 'Mobile Money'
            ? `M-Pesa (${targetStudent?.guardian.phone || '0712 345 678'})`
            : paymentMethod === 'Bank Transfer'
            ? 'Equity Bank A/C 011029384756'
            : paymentMethod === 'Credit/Debit Card'
            ? 'Card •••• 4242'
            : paymentMethod === 'Cash'
            ? 'Cash Desk Counter (Bursary Receipt)'
            : 'Online Portal Gateway';

        const defaultPayerName = targetStudent?.guardian.name || (activeRole === 'parent' ? 'Parent / Guardian' : 'Guardian Remitter');
        const generatedReceipt = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        recordedReceiptNo = generatedReceipt;

        const paymentRecord = {
          id: `pay-${Date.now()}`,
          receiptNo: generatedReceipt,
          amount,
          date: paymentDate || new Date().toISOString().split('T')[0],
          paymentMethod,
          payerAccount: payerAccount || defaultAccount,
          payerName: payerName || defaultPayerName,
          notes: notes || 'Payment verified and credited by Finance Office',
          recordedBy: activeRole === 'staff' ? `${currentUser?.name || 'Bursar'} (Finance & Accounts Department)` : 'Parent Online Self-Payment',
        };

        return {
          ...inv,
          paidAmount: newPaidAmount,
          balance: newBalance,
          status: newStatus,
          paymentHistory: [paymentRecord, ...inv.paymentHistory],
        };
      });
    });

    if (targetStudentId) {
      sendDirectMessage(
        targetStudentId,
        `Official Fee Remittance Receipt Generated: Payment of KSh ${amount.toLocaleString()} has been received and verified by the Finance Office (Receipt #${recordedReceiptNo}, Channel: ${paymentMethod}). New outstanding balance: KSh ${updatedBalance.toLocaleString()}. Your verified remittance history and official receipts in the Parents Portal have been automatically updated.`,
        'fees',
        {
          role: 'school_admin',
          name: `${currentUser?.name || 'Senior Bursar'} (Finance & Accounts Department)`,
        }
      );

      logSecurityEvent({
        eventType: 'FEE_PAYMENT_RECORDED',
        severity: 'low',
        actorEmail: currentUser?.email || adminSession?.adminEmail || 'finance@shule101.edu',
        ipAddress: '197.232.14.88',
        targetResource: `/finance/invoices/${invoiceId}`,
        details: `Finance Office recorded payment of KSh ${amount.toLocaleString()} for student ${targetStudentName}. Receipt #${recordedReceiptNo}. Verified remittance history automatically updated on Parents Portal.`,
        status: 'success',
      });
    }
  };

  const editStudentFeeBalance = (invoiceId: string, newBalance: number, notes?: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const safeBalance = Math.max(0, Number(newBalance));
        let newStatus: FeeStatus = inv.status;
        if (safeBalance === 0) {
          newStatus = 'paid';
        } else if (inv.paidAmount > 0) {
          newStatus = 'partial';
        } else {
          newStatus = 'pending';
        }
        const newTotal = inv.paidAmount + safeBalance;

        const adjustmentRecord = {
          id: `adj-${Date.now()}`,
          receiptNo: `ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Bank Transfer' as const,
          payerAccount: 'Finance Ledger Adjustment',
          payerName: currentUser?.name || 'Finance Bursar',
          notes: notes || `Fee balance updated to KSh ${safeBalance.toLocaleString()} by Finance Department`,
          recordedBy: currentUser?.name ? `${currentUser.name} (Finance Office)` : 'Finance Department & Bursar',
        };

        return {
          ...inv,
          totalAmount: newTotal,
          balance: safeBalance,
          status: newStatus,
          paymentHistory: [adjustmentRecord, ...inv.paymentHistory],
        };
      })
    );
  };

  const updateFeeInvoiceDetails = (
    invoiceId: string,
    updates: {
      totalAmount?: number;
      paidAmount?: number;
      balance?: number;
      dueDate?: string;
      status?: FeeStatus;
      discount?: number;
      notes?: string;
    }
  ) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const total = updates.totalAmount !== undefined ? Math.max(0, updates.totalAmount) : inv.totalAmount;
        const paid = updates.paidAmount !== undefined ? Math.max(0, updates.paidAmount) : inv.paidAmount;
        const bal = updates.balance !== undefined ? Math.max(0, updates.balance) : Math.max(0, total - paid);
        let stat: FeeStatus = updates.status || (bal === 0 ? 'paid' : paid > 0 ? 'partial' : 'pending');

        return {
          ...inv,
          totalAmount: total,
          paidAmount: paid,
          balance: bal,
          status: stat,
          dueDate: updates.dueDate || inv.dueDate,
        };
      })
    );
  };

  const updateFullFeeStatement = (
    invoiceId: string,
    updatedInvoice: Partial<FeeInvoice>
  ) => {
    let targetStudentId = '';
    let targetStudentName = '';

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;

        const targetStudent = students.find((s) => s.id === inv.studentId);
        targetStudentId = inv.studentId;
        targetStudentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : 'Student';

        const newItems = updatedInvoice.items || inv.items;
        const totalFromItems = newItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
        const totalAmount =
          updatedInvoice.totalAmount !== undefined ? Number(updatedInvoice.totalAmount) : (totalFromItems || inv.totalAmount);

        const newPaymentHistory = updatedInvoice.paymentHistory || inv.paymentHistory;
        const calculatedPaid = newPaymentHistory.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        const paidAmount =
          updatedInvoice.paidAmount !== undefined ? Number(updatedInvoice.paidAmount) : calculatedPaid;

        const balance =
          updatedInvoice.balance !== undefined
            ? Number(updatedInvoice.balance)
            : Math.max(0, totalAmount - paidAmount);

        let status: FeeStatus =
          updatedInvoice.status || (balance === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending');
        if (status !== 'overdue' && balance === 0) status = 'paid';

        return {
          ...inv,
          ...updatedInvoice,
          items: newItems,
          paymentHistory: newPaymentHistory,
          totalAmount,
          paidAmount,
          balance,
          status,
        };
      })
    );

    if (targetStudentId) {
      sendDirectMessage(
        targetStudentId,
        `Fee Statement & Remittance Audit Updated: The Finance Department has updated the official fee ledger and payment records for ${targetStudentName}. Your verified remittance history and official receipts in the Parents Portal have been automatically updated.`,
        'fees',
        {
          role: 'school_admin',
          name: `${currentUser?.name || 'Finance Controller'} (Finance Department)`,
        }
      );
    }

    logSecurityEvent({
      eventType: 'FEE_OVERRIDE_ADMIN',
      severity: 'medium',
      actorEmail: currentUser?.email || adminSession?.adminEmail || 'finance@shule101.edu',
      ipAddress: '197.232.14.88',
      targetResource: `/finance/invoices/${invoiceId}`,
      details: `Finance Department modified and verified official fee statement ledger for invoice #${invoiceId}`,
      status: 'success',
    });
  };

  const sendDirectMessage = (
    studentId: string,
    content: string,
    category: MessageCategory = 'general',
    overrideSender?: { role: 'school_admin' | 'teacher' | 'parent'; name: string },
    attachments?: string[]
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const threadId = `thread-${studentId}`;
    const senderRole = overrideSender?.role || (activeRole === 'staff' ? 'school_admin' : 'parent');
    const senderName =
      overrideSender?.name ||
      (activeRole === 'staff' ? 'Academic Administration & Guidance' : student.guardian.name);

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      studentId,
      senderRole,
      senderName,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      category,
      attachments,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update or create thread
    setThreads((prev) => {
      const existing = prev.find((t) => t.studentId === studentId);
      const timeString = 'Just now';

      if (existing) {
        return prev.map((t) =>
          t.studentId === studentId
            ? {
                ...t,
                lastMessage: content,
                lastMessageTime: timeString,
                unreadCountForStaff: senderRole === 'parent' ? t.unreadCountForStaff + 1 : t.unreadCountForStaff,
                unreadCountForParent: senderRole !== 'parent' ? t.unreadCountForParent + 1 : t.unreadCountForParent,
                category,
              }
            : t
        );
      } else {
        const newThread: MessageThread = {
          id: threadId,
          studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          parentName: student.guardian.name,
          parentPhone: student.guardian.phone,
          parentEmail: student.guardian.email,
          grade: student.grade,
          lastMessage: content,
          lastMessageTime: timeString,
          unreadCountForStaff: senderRole === 'parent' ? 1 : 0,
          unreadCountForParent: senderRole !== 'parent' ? 1 : 0,
          category,
        };
        return [newThread, ...prev];
      }
    });
  };

  const markThreadRead = (threadId: string, asRole: 'staff' | 'parent') => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              unreadCountForStaff: asRole === 'staff' ? 0 : t.unreadCountForStaff,
              unreadCountForParent: asRole === 'parent' ? 0 : t.unreadCountForParent,
            }
          : t
      )
    );

    setMessages((prev) =>
      prev.map((m) => {
        if (m.threadId !== threadId) return m;
        if (asRole === 'staff' && m.senderRole === 'parent') {
          return { ...m, isRead: true };
        }
        if (asRole === 'parent' && m.senderRole !== 'parent') {
          return { ...m, isRead: true };
        }
        return m;
      })
    );
  };

  const createAnnouncement = (
    title: string,
    content: string,
    priority: 'normal' | 'important' | 'urgent',
    targetAudience: 'All Parents & Students' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12',
    tag: string
  ) => {
    const newAnnouncement: SchoolAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      author: 'School Administration Directorate',
      authorRole: 'Head of Communications',
      date: new Date().toISOString().split('T')[0],
      targetAudience,
      priority,
      tag,
      readByCount: 1,
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  const sendAutomatedNoticeToParent = (
    studentId: string,
    type: 'attendance_alert' | 'fee_reminder' | 'performance_report'
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    let message = '';
    let category: MessageCategory = 'general';

    if (type === 'attendance_alert') {
      category = 'attendance';
      message = `Dear ${student.guardian.name}, this is an automated attendance notification regarding ${student.firstName} ${student.lastName} (Roll: ${student.rollNumber}). Our records indicate an unexcused absence/tardiness for today (${selectedDate}). Please respond directly to this thread or contact the attendance office with medical or personal justification.`;
    } else if (type === 'fee_reminder') {
      category = 'fees';
      const studentInvoice = invoices.find((inv) => inv.studentId === studentId);
      const bal = studentInvoice ? `KSh ${studentInvoice.balance.toLocaleString()}` : 'outstanding fee amount';
      const due = studentInvoice ? studentInvoice.dueDate : 'upcoming deadline';
      message = `Dear ${student.guardian.name}, this is a friendly reminder from ${currentSchool?.name || 'the school'} regarding the pending fee balance of ${bal} for ${student.firstName} ${student.lastName} (Invoice: ${studentInvoice?.invoiceNo || 'Term 2'}). The payment due date is ${due}. Please remit payment via official school payment channels (M-Pesa / Bank) to the Finance & Bursar Department.`;
    } else if (type === 'performance_report') {
      category = 'academic';
      const record = academicRecords.find((r) => r.studentId === studentId);
      const gpa = record ? record.overallGpa.toFixed(2) : '3.8';
      message = `Dear ${student.guardian.name}, the Term 2 academic summary for ${student.firstName} is ready. Current cumulative GPA: ${gpa}. We invite you to view the detailed subject performance and teacher observations in the portal. Please reach out if you would like to schedule a conference with subject teachers.`;
    }

    sendDirectMessage(studentId, message, category, {
      role: 'school_admin',
      name: 'Shule 101 Automated Notification System',
    });
  };

  const login = (account: UserAccount, selectedSchool?: RegisteredSchool) => {
    let updatedAccount = { ...account };
    if (selectedSchool) {
      updatedAccount.schoolId = selectedSchool.id;
      updatedAccount.schoolName = selectedSchool.name;
      setCurrentSchool(selectedSchool);
    } else if (account.schoolId) {
      const match = REGISTERED_SCHOOLS.find((s) => s.id === account.schoolId);
      if (match) setCurrentSchool(match);
    }

    if (account.assignedClass) {
      setAssignedClassState(account.assignedClass);
      localStorage.setItem('shule_101_assigned_class_v1', account.assignedClass);
    }

    setCurrentUser(updatedAccount);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedAccount));
    setActiveRoleState(account.role);
    if (account.studentId) {
      setSelectedParentStudentIdState(account.studentId);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setStudents(INITIAL_STUDENTS);
    setAcademicRecords(INITIAL_ACADEMIC_RECORDS);
    setAttendance(generateInitialAttendance());
    setInvoices(INITIAL_FEE_INVOICES);
    setThreads(INITIAL_MESSAGE_THREADS);
    setMessages(INITIAL_DIRECT_MESSAGES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setParentStudentMappings(INITIAL_PARENT_STUDENT_MAPPINGS);
    setActiveRoleState('staff');
    setSelectedParentStudentIdState('std-1');
    setAssignedClassState('Grade 10-A');
    setCurrentUser(null);
    setAdminSession(null);
  };

  return (
    <SchoolContext.Provider
      value={{
        currentUser,
        login,
        logout,
        adminSession,
        verifyAdmin2FA,
        logoutAdminSession,
        auditLogs,
        logSecurityEvent,
        clearAuditLogs,
        subscriptions,
        updateSchoolSubscription,
        renewSubscription,
        parentStudentMappings,
        addParentStudentMapping,
        updateParentStudentMapping,
        deleteParentStudentMapping,
        bulkImportParentStudentMappings,
        toggleParentPortalAccess,
        generateParentAccessCode,
        systemUsers,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,
        toggleUserLock,
        generateUserMagicLink,
        activeDivision,
        setActiveDivision,
        assignedClass,
        setAssignedClass,
        accessibleStudents,
        editStudentFeeBalance,
        updateFeeInvoiceDetails,
        updateFullFeeStatement,
        feeReceiptConfig,
        updateFeeReceiptConfig,
        addCustomReceiptField,
        updateCustomReceiptField,
        deleteCustomReceiptField,
        addStandardFeeItem,
        updateStandardFeeItem,
        deleteStandardFeeItem,
        resetReceiptConfigToDefault,
        cbcReportCardConfig,
        updateCBCReportCardConfig,
        applyCBCPreset,
        resetCBCReportCardConfig,
        addCBCSubject,
        updateCBCSubject,
        deleteCBCSubject,
        toggleCBCCompetency,
        updateCBCCompetency,
        toggleCBCValue,
        updateCBCValue,
        updateCBCPerformanceLevel,
        registeredSchools,
        addRegisteredSchool,
        updateRegisteredSchool,
        currentSchool,
        setCurrentSchool,
        emergencyBroadcast,
        setEmergencyBroadcast,
        activeRole,
        setActiveRole,
        selectedParentStudentId,
        setSelectedParentStudentId,
        selectedDate,
        setSelectedDate,
        selectedGrade,
        setSelectedGrade,
        students,
        academicRecords,
        attendance,
        invoices,
        threads,
        messages,
        announcements,
        stats,
        addStudent,
        updateStudent,
        markAttendance,
        updateAttendanceWhereabouts,
        markBulkAttendance,
        updateAcademicGrade,
        updateConductRemarks,
        recordFeePayment,
        sendDirectMessage,
        markThreadRead,
        createAnnouncement,
        sendAutomatedNoticeToParent,
        resetToDemoData,
        getStudentAttendanceRate,
        getStudentAcademicRecord,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
