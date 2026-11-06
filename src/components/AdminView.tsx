import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Building2,
  FileText,
  Settings,
  CreditCard,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Send,
  Mail,
  Smartphone,
  School,
  Activity,
  Download,
  Upload,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Radio,
  X,
  Eye,
  FileSpreadsheet,
  Layers,
  Sparkles,
  BookOpen,
  DollarSign,
  Briefcase,
  UserCheck,
  GraduationCap,
  Calendar,
  Phone,
  Receipt,
  ArrowLeft,
} from 'lucide-react';
import { Shule101Logo } from './Shule101Logo';
import { ReceiptCustomizerTab } from './ReceiptCustomizerTab';
import { CBCReportCardCustomizerTab } from './CBCReportCardCustomizerTab';
import { useSchool } from '../context/SchoolContext';
import {
  UserAccount,
  RegisteredSchool,
  SecurityAuditLog,
  StaffDivision,
  SchoolSubscription,
  ParentStudentMapping,
  SubscriptionTier,
  BillingCycle,
} from '../types';

interface AdminViewProps {
  onExitAdmin: () => void;
  onSimulate403: () => void;
  onReauth2FA: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onExitAdmin,
  onSimulate403,
  onReauth2FA,
}) => {
  const {
    adminSession,
    logoutAdminSession,
    systemUsers,
    addSystemUser,
    updateSystemUser,
    deleteSystemUser,
    toggleUserLock,
    generateUserMagicLink,
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
    registeredSchools,
    addRegisteredSchool,
    updateRegisteredSchool,
    auditLogs,
    logSecurityEvent,
    clearAuditLogs,
    emergencyBroadcast,
    setEmergencyBroadcast,
  } = useSchool();

  // Active Admin Master Navigation Tab
  const [activeAdminTab, setActiveAdminTab] = useState<
    'subscriptions' | 'schools' | 'staff_roles' | 'parent_roster' | 'receipt_customizer' | 'cbc_customizer' | 'security' | 'governance'
  >('subscriptions');

  // Session timer countdown
  const [sessionRemaining, setSessionRemaining] = useState<number>(7200); // 2 hours

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatSessionTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // 1. SUBSCRIPTION MANAGEMENT STATE
  // -------------------------------------------------------------
  const [subSearchQuery, setSubSearchQuery] = useState('');
  const [subTierFilter, setSubTierFilter] = useState<string>('all');
  const [subStatusFilter, setSubStatusFilter] = useState<string>('all');
  const [editingSubscription, setEditingSubscription] = useState<SchoolSubscription | null>(null);

  const filteredSubscriptions = useMemo(() => {
    const q = subSearchQuery.trim().toLowerCase();
    return (subscriptions || []).filter((sub) => {
      const school = (registeredSchools || []).find((s) => s.id === sub.schoolId);
      const schoolName = school?.name?.toLowerCase() || '';
      const schoolCode = school?.code?.toLowerCase() || '';

      const matchesSearch = !q || schoolName.includes(q) || schoolCode.includes(q) || sub.tier.toLowerCase().includes(q);
      const matchesTier = subTierFilter === 'all' || sub.tier === subTierFilter;
      const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [subscriptions, registeredSchools, subSearchQuery, subTierFilter, subStatusFilter]);

  // -------------------------------------------------------------
  // 2. PARENT-TO-STUDENT ROSTER & EXCEL SHEET STATE
  // -------------------------------------------------------------
  const [mappingSearchQuery, setMappingSearchQuery] = useState('');
  const [mappingGradeFilter, setMappingGradeFilter] = useState<string>('all');
  const [mappingSchoolFilter, setMappingSchoolFilter] = useState<string>('all');
  const [mappingStatusFilter, setMappingStatusFilter] = useState<string>('all');
  const [isAddMappingModalOpen, setIsAddMappingModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ParentStudentMapping | null>(null);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New Mapping Form
  const [newMappingForm, setNewMappingForm] = useState({
    studentName: '',
    admissionNumber: '',
    grade: 'Grade 10-A',
    schoolId: registeredSchools?.[0]?.id || 'sch-01',
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    relationship: 'Mother' as 'Mother' | 'Father' | 'Guardian' | 'Sponsor',
  });

  const filteredMappings = useMemo(() => {
    const q = mappingSearchQuery.trim().toLowerCase();
    return (parentStudentMappings || []).filter((m) => {
      const matchesSearch =
        !q ||
        m.studentName.toLowerCase().includes(q) ||
        m.admissionNumber.toLowerCase().includes(q) ||
        m.guardianName.toLowerCase().includes(q) ||
        m.guardianEmail.toLowerCase().includes(q) ||
        m.guardianPhone.toLowerCase().includes(q) ||
        m.accessCode.toLowerCase().includes(q);

      const matchesGrade = mappingGradeFilter === 'all' || m.grade.includes(mappingGradeFilter);
      const matchesSchool = mappingSchoolFilter === 'all' || m.schoolId === mappingSchoolFilter;
      const matchesStatus = mappingStatusFilter === 'all' || m.portalAccessStatus === mappingStatusFilter;

      return matchesSearch && matchesGrade && matchesSchool && matchesStatus;
    });
  }, [parentStudentMappings, mappingSearchQuery, mappingGradeFilter, mappingSchoolFilter, mappingStatusFilter]);

  // Handle Export Parent Roster to CSV/Excel
  const handleExportParentRosterCSV = () => {
    const headers = [
      'Mapping ID',
      'Admission Number',
      'Student Name',
      'Class / Grade',
      'School ID',
      'Guardian Full Name',
      'Guardian Email',
      'Guardian Phone',
      'Relationship',
      'Portal Access Status',
      'Parent Access Code',
      'Last Portal Login',
    ];

    const rows = filteredMappings.map((m) => [
      m.id,
      m.admissionNumber,
      `"${m.studentName}"`,
      `"${m.grade}"`,
      m.schoolId,
      `"${m.guardianName}"`,
      m.guardianEmail,
      m.guardianPhone,
      m.relationship,
      m.portalAccessStatus,
      m.accessCode,
      m.lastAccessed || 'Never',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shule_101_parent_student_roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logSecurityEvent({
      eventType: 'SYSTEM_CACHE_PURGE',
      severity: 'low',
      actorEmail: adminSession?.adminEmail || 'admin@shule101.gov',
      ipAddress: '197.232.14.88',
      targetResource: '/admin/parent-mappings/export-csv',
      details: `Exported Parent-to-Student Excel/CSV roster (${filteredMappings.length} mapped pupil entries).`,
      status: 'success',
    });
  };

  // Download Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const template = [
      'Admission Number,Student Name,Grade,Guardian Name,Guardian Email,Guardian Phone,Relationship',
      'ADM-2025-101,Amina Hassan,Grade 10-A,Fatuma Hassan,fatuma.hassan@example.com,+254711002233,Mother',
      'ADM-2025-102,Brian Kipkorir,Grade 9-B,Daniel Kipkorir,daniel.kipkorir@example.com,+254722334455,Father',
      'ADM-2025-103,Faith Mwende,Grade 11-Science,Esther Mwende,esther.mwende@example.com,+254733445566,Guardian',
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shule_101_parent_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV/Excel File Import
  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length < 2) {
          setImportNotification('Error: CSV file must contain at least a header row and 1 student data row.');
          return;
        }

        const parsedMappings: ParentStudentMapping[] = [];
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 4) {
            const adm = cols[0] || `ADM-${Date.now()}-${i}`;
            const studentName = cols[1] || `Pupil ${i}`;
            const grade = cols[2] || 'Grade 10-A';
            const guardianName = cols[3] || 'Parent / Guardian';
            const guardianEmail = cols[4] || `parent.${adm.toLowerCase().replace(/[^a-z0-9]/g, '')}@shule101.edu`;
            const guardianPhone = cols[5] || '+254 700 000 000';
            const rel = (cols[6] as any) || 'Mother';

            parsedMappings.push({
              id: `psm-import-${Date.now()}-${i}`,
              studentId: `std-imp-${Date.now()}-${i}`,
              studentName,
              admissionNumber: adm,
              grade,
              schoolId: registeredSchools[0]?.id || 'sch-01',
              guardianName,
              guardianEmail,
              guardianPhone,
              relationship: ['Mother', 'Father', 'Guardian', 'Sponsor'].includes(rel) ? rel : 'Guardian',
              portalAccessStatus: 'active',
              accessCode: `SHULE-PRNT-${Math.floor(1000 + Math.random() * 9000)}`,
            });
          }
        }

        if (parsedMappings.length > 0) {
          const res = bulkImportParentStudentMappings(parsedMappings);
          setImportNotification(`Successfully parsed & imported ${res.count} student-parent mapping records into the system.`);
          setTimeout(() => setImportNotification(null), 5000);
        }
      } catch (err) {
        setImportNotification('Failed to parse CSV file. Please verify CSV column format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Save New Mapping
  const handleSaveNewMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMappingForm.studentName || !newMappingForm.guardianName || !newMappingForm.guardianEmail) return;

    const newObj: ParentStudentMapping = {
      id: `psm-${Date.now()}`,
      studentId: `std-${Date.now()}`,
      studentName: newMappingForm.studentName.trim(),
      admissionNumber: newMappingForm.admissionNumber.trim() || `ADM-${Date.now().toString().slice(-4)}`,
      grade: newMappingForm.grade,
      schoolId: newMappingForm.schoolId,
      guardianName: newMappingForm.guardianName.trim(),
      guardianEmail: newMappingForm.guardianEmail.trim().toLowerCase(),
      guardianPhone: newMappingForm.guardianPhone.trim() || '+254 700 000 000',
      relationship: newMappingForm.relationship,
      portalAccessStatus: 'active',
      accessCode: `SHULE-PRNT-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    addParentStudentMapping(newObj);
    setIsAddMappingModalOpen(false);
    setNewMappingForm({
      studentName: '',
      admissionNumber: '',
      grade: 'Grade 10-A',
      schoolId: registeredSchools[0]?.id || 'sch-01',
      guardianName: '',
      guardianEmail: '',
      guardianPhone: '',
      relationship: 'Mother',
    });
  };

  // -------------------------------------------------------------
  // 3. STAFF & TEACHER ROLE DELEGATION STATE
  // -------------------------------------------------------------
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'principal' | 'teacher' | 'finance'>('all');
  const [userSchoolFilter, setUserSchoolFilter] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [generatedMagicLink, setGeneratedMagicLink] = useState<{ userId: string; link: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'staff' as 'staff' | 'parent' | 'admin',
    staffDivision: 'teacher' as StaffDivision,
    assignedClass: 'Grade 10-A',
    title: '',
    schoolId: registeredSchools[0]?.id || 'sch-01',
    isAdmin: false,
    twoFactorEnabled: true,
    phone: '',
  });

  const filteredStaffUsers = useMemo(() => {
    const q = userSearchQuery.trim().toLowerCase();
    return systemUsers.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.title && user.title.toLowerCase().includes(q)) ||
        (user.assignedClass && user.assignedClass.toLowerCase().includes(q));

      const matchesRole =
        userRoleFilter === 'all' ||
        (userRoleFilter === 'admin' && (user.role === 'admin' || user.isAdmin)) ||
        (userRoleFilter === 'principal' && user.staffDivision === 'principal') ||
        (userRoleFilter === 'teacher' && user.staffDivision === 'teacher') ||
        (userRoleFilter === 'finance' && user.staffDivision === 'finance');

      const matchesSchool = userSchoolFilter === 'all' || user.schoolId === userSchoolFilter;

      return matchesSearch && matchesRole && matchesSchool;
    });
  }, [systemUsers, userSearchQuery, userRoleFilter, userSchoolFilter]);

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;

    const matchedSchool = registeredSchools.find((s) => s.id === newUserForm.schoolId);

    const userObj: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email.toLowerCase().trim(),
      role: newUserForm.role,
      staffDivision: newUserForm.role === 'staff' || newUserForm.role === 'admin' ? newUserForm.staffDivision : undefined,
      assignedClass: newUserForm.staffDivision === 'teacher' ? newUserForm.assignedClass : undefined,
      title:
        newUserForm.title ||
        (newUserForm.role === 'admin'
          ? 'System Administrator'
          : newUserForm.staffDivision === 'principal'
          ? 'Principal & Executive Head'
          : newUserForm.staffDivision === 'finance'
          ? 'Finance & Bursar Officer'
          : `Class Teacher (${newUserForm.assignedClass})`),
      schoolId: newUserForm.schoolId,
      schoolName: matchedSchool?.name || 'Shule 101 Academy',
      isAdmin: newUserForm.role === 'admin' || newUserForm.isAdmin,
      twoFactorEnabled: newUserForm.twoFactorEnabled,
      phone: newUserForm.phone || '+254 700 000 000',
      lastLogin: 'Never',
    };

    addSystemUser(userObj);
    setIsAddUserModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'staff',
      staffDivision: 'teacher',
      assignedClass: 'Grade 10-A',
      title: '',
      schoolId: registeredSchools[0]?.id || 'sch-01',
      isAdmin: false,
      twoFactorEnabled: true,
      phone: '',
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateSystemUser(editingUser);
    setEditingUser(null);
  };

  // -------------------------------------------------------------
  // 4. INSTITUTION ONBOARDING & REGISTRATION STATE
  // -------------------------------------------------------------
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<RegisteredSchool | null>(null);
  const [newSchoolForm, setNewSchoolForm] = useState({
    code: '',
    name: '',
    countyOrCity: '',
    level: 'Secondary & High School',
    curriculum: 'CBC & KCSE Dual Track',
    emailDomain: '',
    studentCount: 450,
    principalName: '',
    principalEmail: '',
    address: '',
    phone: '',
    tier: 'Standard CBC' as SubscriptionTier,
  });

  const filteredSchools = useMemo(() => {
    const q = schoolSearchQuery.trim().toLowerCase();
    return registeredSchools.filter((school) => {
      return (
        !q ||
        school.name.toLowerCase().includes(q) ||
        school.code.toLowerCase().includes(q) ||
        school.countyOrCity.toLowerCase().includes(q) ||
        school.curriculum.toLowerCase().includes(q)
      );
    });
  }, [registeredSchools, schoolSearchQuery]);

  const handleSaveNewSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolForm.name || !newSchoolForm.code) return;

    const schoolId = `sch-${Date.now()}`;
    const schoolObj: RegisteredSchool = {
      id: schoolId,
      code: newSchoolForm.code.toUpperCase().trim(),
      name: newSchoolForm.name.trim(),
      countyOrCity: newSchoolForm.countyOrCity.trim() || 'Nairobi',
      level: newSchoolForm.level,
      curriculum: newSchoolForm.curriculum,
      emailDomain: newSchoolForm.emailDomain || `${newSchoolForm.code.toLowerCase()}.ac.ke`,
      studentCount: Number(newSchoolForm.studentCount) || 300,
      isVerified: true,
      principalName: newSchoolForm.principalName || 'Principal In-Charge',
      principalEmail: newSchoolForm.principalEmail || `principal@${newSchoolForm.code.toLowerCase()}.ac.ke`,
      address: newSchoolForm.address || 'Academic Plaza',
      phone: newSchoolForm.phone || '+254 20 555 0100',
    };

    addRegisteredSchool(schoolObj);

    // Also bootstrap subscription
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const subObj: SchoolSubscription = {
      id: `sub-${Date.now()}`,
      schoolId,
      tier: newSchoolForm.tier,
      status: 'active',
      billingCycle: 'termly',
      amountKSH: newSchoolForm.tier === 'Enterprise Plus' ? 95000 : newSchoolForm.tier === 'National Directorate' ? 350000 : 50000,
      startDate: new Date().toISOString().slice(0, 10),
      nextRenewalDate: nextYear.toISOString().slice(0, 10),
      studentLimit: Number(newSchoolForm.studentCount) + 200,
      activeStudents: Number(newSchoolForm.studentCount),
      features: {
        smsNotifications: true,
        financeBursarModule: true,
        cbcAnalytics: true,
        parentPortalApp: true,
        customDomain: newSchoolForm.tier === 'Enterprise Plus' || newSchoolForm.tier === 'National Directorate',
      },
      lastPaymentRef: `MPESA-INIT-${Date.now().toString().slice(-6)}`,
    };

    updateSchoolSubscription(subObj);
    setIsAddSchoolModalOpen(false);
    setNewSchoolForm({
      code: '',
      name: '',
      countyOrCity: '',
      level: 'Secondary & High School',
      curriculum: 'CBC & KCSE Dual Track',
      emailDomain: '',
      studentCount: 450,
      principalName: '',
      principalEmail: '',
      address: '',
      phone: '',
      tier: 'Standard CBC',
    });
  };

  // -------------------------------------------------------------
  // 5. SECURITY AUDIT LOGS & GOVERNANCE STATE
  // -------------------------------------------------------------
  const [logSeverityFilter, setLogSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [broadcastForm, setBroadcastForm] = useState({
    enabled: emergencyBroadcast.enabled,
    title: emergencyBroadcast.title,
    message: emergencyBroadcast.message,
    severity: emergencyBroadcast.severity,
  });

  const filteredLogs = useMemo(() => {
    const q = logSearchQuery.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchesSeverity = logSeverityFilter === 'all' || log.severity === logSeverityFilter;
      const matchesSearch =
        !q ||
        log.actorEmail.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q);

      return matchesSeverity && matchesSearch;
    });
  }, [auditLogs, logSeverityFilter, logSearchQuery]);

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencyBroadcast({
      ...broadcastForm,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedBy: adminSession?.adminName || 'Master Administrator',
    });
  };

  return (
    <div id="admin-master-view" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Directorate Master Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Shule101Logo variant="horizontal" size="md" />
            <div className="h-5 w-px bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Master Admin Portal (2FA Active)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Session Timer */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Session: <strong>{formatSessionTimer(sessionRemaining)}</strong></span>
            </div>

            {/* Test 403 Page */}
            <button
              id="admin-test-403-btn"
              onClick={onSimulate403}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 font-semibold transition"
              title="Test 403 Forbidden intercept"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Test 403 Intercept</span>
            </button>

            {/* Exit Admin Session */}
            <button
              id="admin-exit-btn"
              onClick={() => {
                logoutAdminSession();
                onExitAdmin();
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Master Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 overflow-x-auto border-t border-slate-800/60 py-2">
          {/* TAB 1: Subscriptions */}
          <button
            id="tab-admin-subscriptions"
            onClick={() => setActiveAdminTab('subscriptions')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>School Subscriptions ({subscriptions?.length || 0})</span>
          </button>

          {/* TAB 2: Institutions */}
          <button
            id="tab-admin-schools"
            onClick={() => setActiveAdminTab('schools')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'schools'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>Register Institutions ({registeredSchools?.length || 0})</span>
          </button>

          {/* TAB 3: Staff & Teacher Roles */}
          <button
            id="tab-admin-staff-roles"
            onClick={() => setActiveAdminTab('staff_roles')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'staff_roles'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Staff & Teacher Role Assignments ({systemUsers?.length || 0})</span>
          </button>

          {/* TAB 4: Parent-to-Student Excel Roster */}
          <button
            id="tab-admin-parent-roster"
            onClick={() => setActiveAdminTab('parent_roster')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'parent_roster'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Parent-Student Excel Roster ({parentStudentMappings?.length || 0})</span>
          </button>

          {/* TAB 5: Fee Receipt & School Customizer */}
          <button
            id="tab-admin-receipt-customizer"
            onClick={() => setActiveAdminTab('receipt_customizer')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'receipt_customizer'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4 text-indigo-300" />
            <span>Fee Receipt Customizer</span>
          </button>

          {/* TAB 6: CBC Report Card Customizer */}
          <button
            id="tab-admin-cbc-customizer"
            onClick={() => setActiveAdminTab('cbc_customizer')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'cbc_customizer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>CBC Report Card Customizer</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold rounded-full border border-emerald-500/30">
              Primary & High School
            </span>
          </button>

          {/* TAB 7: Security Telemetry */}
          <button
            id="tab-admin-security"
            onClick={() => setActiveAdminTab('security')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Security & 403 Logs ({auditLogs?.length || 0})</span>
          </button>

          {/* TAB 7: Governance */}
          <button
            id="tab-admin-governance"
            onClick={() => setActiveAdminTab('governance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeAdminTab === 'governance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Governance & Broadcast</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Administrator Clearance Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white">National School Directorate Administrator Console</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  2FA Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Master Admin: <strong className="text-slate-200">{adminSession?.adminName || 'Dr. Victor Ochieng'}</strong> ({adminSession?.adminEmail || 'admin@shule101.gov'}) • Full Multi-School & Directorate Authority
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              Return to Portal View
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: MANAGE SUBSCRIPTIONS OF SCHOOLS                   */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'subscriptions' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Top Toolbar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    placeholder="Search subscriptions by school name, code, or tier..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={subTierFilter}
                  onChange={(e) => setSubTierFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Subscription Tiers</option>
                  <option value="Trial">Free Trial</option>
                  <option value="Standard CBC">Standard CBC</option>
                  <option value="Enterprise Plus">Enterprise Plus</option>
                  <option value="National Directorate">National Directorate</option>
                </select>

                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Billing Statuses</option>
                  <option value="active">Active</option>
                  <option value="expiring_soon">Expiring Soon</option>
                  <option value="grace_period">Grace Period</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Subscriptions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubscriptions.map((sub) => {
                const school = registeredSchools.find((s) => s.id === sub.schoolId);
                const isExpiring = sub.status === 'expiring_soon' || sub.status === 'grace_period';

                return (
                  <div
                    key={sub.id}
                    className={`bg-slate-900 rounded-2xl border p-5 space-y-4 transition flex flex-col justify-between ${
                      isExpiring ? 'border-amber-700/80 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sub.tier === 'National Directorate'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : sub.tier === 'Enterprise Plus'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : sub.tier === 'Standard CBC'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {sub.tier}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1">{school?.name || 'School Node'}</h3>
                          <p className="text-xs text-slate-400">Code: <strong className="text-slate-200">{school?.code}</strong> • {school?.countyOrCity}</p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : sub.status === 'expiring_soon'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : sub.status === 'grace_period'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Pricing & Cycle */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Billing Plan:</span>
                          <span className="font-bold text-white uppercase">{sub.billingCycle}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Subscription Fee:</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {sub.amountKSH === 0 ? 'FREE TRIAL' : `KSh ${sub.amountKSH.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Next Renewal:</span>
                          <span className="font-semibold text-amber-300">{sub.nextRenewalDate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Pupil Capacity:</span>
                          <span className="font-semibold text-slate-200">
                            {sub.activeStudents} / {sub.studentLimit} Students
                          </span>
                        </div>
                      </div>

                      {/* Feature Toggles Summary */}
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300 pt-1">
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${sub.features.smsNotifications ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span>SMS Gateways</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${sub.features.financeBursarModule ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span>Finance Bursar</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${sub.features.cbcAnalytics ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span>CBC Analytics</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${sub.features.parentPortalApp ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span>Parent App Portal</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => renewSubscription(sub.schoolId, 4)}
                        className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew (+4 Months)</span>
                      </button>

                      <button
                        onClick={() => setEditingSubscription(sub)}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
                      >
                        Edit Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: REGISTER INSTITUTIONS & SCHOOL ONBOARDING          */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'schools' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={schoolSearchQuery}
                  onChange={(e) => setSchoolSearchQuery(e.target.value)}
                  placeholder="Search registered schools by name, code, curriculum, county..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                id="admin-add-school-btn"
                onClick={() => setIsAddSchoolModalOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Register New School Institution</span>
              </button>
            </div>

            {/* School Registry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-indigo-500/50 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold">
                        <School className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {school.code}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white">{school.name}</h3>
                      <p className="text-xs text-slate-400">{school.countyOrCity} • {school.level}</p>
                    </div>

                    <div className="space-y-1 text-xs pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-slate-400">
                        <span>Principal:</span>
                        <strong className="text-slate-200">{school.principalName || 'Dr. Arthur Vance'}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Curriculum:</span>
                        <strong className="text-slate-200">{school.curriculum}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Email Domain:</span>
                        <strong className="text-indigo-400 font-mono">@{school.emailDomain || 'shule101.edu'}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Capacity:</span>
                        <strong className="text-slate-200">{school.studentCount || 400} Pupils</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accredited & Synced</span>
                    </span>

                    <button
                      onClick={() => setEditingSchool(school)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: ASSIGN TEACHERS, PRINCIPALS & FINANCE ROLES       */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'staff_roles' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Toolbar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search staff, teachers, bursars by name, email, stream..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Roles & Divisions</option>
                  <option value="admin">Administrators</option>
                  <option value="principal">Principals & Headteachers</option>
                  <option value="teacher">Class Teachers</option>
                  <option value="finance">Finance & Bursars</option>
                </select>

                <select
                  value={userSchoolFilter}
                  onChange={(e) => setUserSchoolFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500 max-w-[160px] truncate"
                >
                  <option value="all">All Schools</option>
                  {registeredSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="admin-add-staff-btn"
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Assign New Staff Role</span>
              </button>
            </div>

            {/* Generated Magic Link Card */}
            {generatedMagicLink && (
              <div className="bg-indigo-950/60 border border-indigo-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                    <Send className="w-4 h-4" />
                    <span>Instant Staff 2FA Magic Link Generated</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px] break-all">
                    {generatedMagicLink.link}
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (!generatedMagicLink) return;
                      navigator.clipboard.writeText(generatedMagicLink.link);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={() => setGeneratedMagicLink(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Staff & Role Assignment Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Staff Identity & Email</th>
                      <th className="px-4 py-3">Assigned Institutional Role</th>
                      <th className="px-4 py-3">Assigned Class / Scope</th>
                      <th className="px-4 py-3">Institution</th>
                      <th className="px-4 py-3">2FA & Status</th>
                      <th className="px-4 py-3 text-right">Role Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredStaffUsers.map((user) => {
                      const isLocked = user.isLocked;

                      return (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                                  {user.name[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-200">{user.name}</p>
                                <p className="text-slate-400 font-mono text-[11px]">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                user.role === 'admin' || user.isAdmin
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : user.staffDivision === 'principal'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : user.staffDivision === 'finance'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : user.staffDivision === 'teacher'
                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {user.staffDivision === 'principal' && <GraduationCap className="w-3 h-3 mr-1" />}
                              {user.staffDivision === 'finance' && <DollarSign className="w-3 h-3 mr-1" />}
                              {user.staffDivision === 'teacher' && <BookOpen className="w-3 h-3 mr-1" />}
                              {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                              <span>
                                {user.role === 'admin'
                                  ? 'System Admin'
                                  : user.staffDivision
                                  ? user.staffDivision.toUpperCase()
                                  : user.role.toUpperCase()}
                              </span>
                            </span>
                            <p className="text-[11px] text-slate-400 mt-0.5">{user.title}</p>
                          </td>

                          <td className="px-4 py-3">
                            {user.staffDivision === 'teacher' ? (
                              <span className="font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                                {user.assignedClass || 'Unassigned'}
                              </span>
                            ) : user.staffDivision === 'finance' ? (
                              <span className="text-emerald-400 text-[11px]">Fee Invoicing & Payments</span>
                            ) : user.staffDivision === 'principal' ? (
                              <span className="text-amber-400 text-[11px]">All Pupils & Academic Overseer</span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Directorate Level</span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-slate-200">{user.schoolName || 'Shule 101 Academy'}</p>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isLocked
                                  ? 'text-rose-400 bg-rose-950 border border-rose-800'
                                  : 'text-emerald-400 bg-emerald-950'
                              }`}
                            >
                              {isLocked ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              <span>{isLocked ? 'Suspended' : 'Active (2FA)'}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Generate Magic Link */}
                              <button
                                onClick={() => {
                                  const link = generateUserMagicLink(user.id);
                                  setGeneratedMagicLink({ userId: user.id, link });
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 rounded-lg transition"
                                title="Generate instant 2FA Magic Link"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Lock */}
                              <button
                                onClick={() => toggleUserLock(user.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  isLocked
                                    ? 'bg-rose-900/60 text-rose-300 hover:bg-rose-800'
                                    : 'bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300'
                                }`}
                                title={isLocked ? 'Unlock Account' : 'Lock / Suspend Account'}
                              >
                                {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Edit User */}
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                                title="Edit Role Assignment"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User */}
                              {user.id !== 'usr-admin-master' && (
                                <button
                                  onClick={() => deleteSystemUser(user.id)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition"
                                  title="Delete User Profile"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 4: PARENT-TO-STUDENT ROSTER & EXCEL TABLE SHEET       */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'parent_roster' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Toolbar with Excel Import & Export Buttons */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-1 items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={mappingSearchQuery}
                    onChange={(e) => setMappingSearchQuery(e.target.value)}
                    placeholder="Search by student name, admission #, guardian name, email, phone, access code..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={mappingGradeFilter}
                  onChange={(e) => setMappingGradeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Grades</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>

                <select
                  value={mappingStatusFilter}
                  onChange={(e) => setMappingStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Access Statuses</option>
                  <option value="active">Active Access</option>
                  <option value="pending_invitation">Pending Invitation</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Action Buttons: Import Excel/CSV, Export Excel, Add Single */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.txt"
                  onChange={handleImportCSVFile}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-bold transition"
                  title="Upload CSV / Excel spreadsheet containing parent and student rows"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Excel / CSV</span>
                </button>

                <button
                  onClick={handleExportParentRosterCSV}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition"
                  title="Download complete roster as formatted CSV spreadsheet"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Spreadsheet</span>
                </button>

                <button
                  onClick={handleDownloadSampleCSV}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl text-xs"
                  title="Download CSV Sample Template"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsAddMappingModalOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Link Parent to Pupil</span>
                </button>
              </div>
            </div>

            {/* Import Notification Banner */}
            {importNotification && (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{importNotification}</span>
                </div>
                <button onClick={() => setImportNotification(null)} className="text-emerald-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* High-Volume Parent-to-Student Excel Roster Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2 font-mono">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-200">PARENT & GUARDIAN ACCESS MATRIX</span>
                  <span>({filteredMappings.length} Records Loaded)</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Real-time synchronization with Pupil Attendance, Performance and Fee balances
                </span>
              </div>

              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      <th className="px-4 py-3">Adm No.</th>
                      <th className="px-4 py-3">Pupil Name & Grade</th>
                      <th className="px-4 py-3">Guardian Name & Relation</th>
                      <th className="px-4 py-3">Contact Email & Phone</th>
                      <th className="px-4 py-3">Portal Access Code</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredMappings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No student-parent mappings found. Click "Import Excel / CSV" or "Link Parent to Pupil" to add.
                        </td>
                      </tr>
                    ) : (
                      filteredMappings.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-300">
                            {m.admissionNumber}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-bold text-white">{m.studentName}</p>
                            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-800">
                              {m.grade}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-200">{m.guardianName}</p>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {m.relationship}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <p className="text-slate-300 font-mono text-[11px] flex items-center space-x-1">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{m.guardianEmail}</span>
                              </p>
                              <p className="text-slate-400 font-mono text-[11px] flex items-center space-x-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{m.guardianPhone}</span>
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-mono">
                            <span className="text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                              {m.accessCode}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                m.portalAccessStatus === 'active'
                                  ? 'text-emerald-400 bg-emerald-950 border border-emerald-800'
                                  : m.portalAccessStatus === 'pending_invitation'
                                  ? 'text-amber-400 bg-amber-950 border border-amber-800'
                                  : 'text-rose-400 bg-rose-950 border border-rose-800'
                              }`}
                            >
                              {m.portalAccessStatus === 'active' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>{m.portalAccessStatus.replace('_', ' ')}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Regenerate Code */}
                              <button
                                onClick={() => generateParentAccessCode(m.id)}
                                className="p-1.5 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 rounded-lg transition"
                                title="Regenerate Parent Access PIN"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Active / Suspended */}
                              <button
                                onClick={() => toggleParentPortalAccess(m.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  m.portalAccessStatus === 'active'
                                    ? 'bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300'
                                    : 'bg-rose-950 text-rose-300 hover:bg-rose-900'
                                }`}
                                title="Toggle Parent Access"
                              >
                                {m.portalAccessStatus === 'active' ? (
                                  <Lock className="w-3.5 h-3.5" />
                                ) : (
                                  <Unlock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete Mapping */}
                              <button
                                onClick={() => deleteParentStudentMapping(m.id)}
                                className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition"
                                title="Remove Link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 5: SECURITY TELEMETRY & 403 INTRUSION AUDIT TRAIL     */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'security' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Top Security Banner */}
            <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h2 className="text-sm font-bold text-white">Live Security Telemetry & 403 Intercept Logs</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Every direct URL probe, unauthorized access attempt to <code className="text-rose-400 font-mono">/admin</code>, and 2FA authentication challenge is recorded in real time.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    logSecurityEvent({
                      eventType: 'UNAUTHORIZED_URL_ATTEMPT',
                      severity: 'critical',
                      actorEmail: 'suspicious-origin@45.33.32.156',
                      ipAddress: '45.33.32.156',
                      targetResource: '/admin/database/dump',
                      details: 'Direct URL bypass probe intercepted without valid 2FA token. 403 Forbidden rendered.',
                      status: 'blocked',
                    });
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Simulate Intrusion Event</span>
                </button>

                <button
                  onClick={clearAuditLogs}
                  className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Logs</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Logs */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Filter security events by actor email, IP address, resource, or event type..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={logSeverityFilter}
                onChange={(e) => setLogSeverityFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Severity & Status</th>
                      <th className="px-4 py-3">Event Classification</th>
                      <th className="px-4 py-3">Actor & Origin IP</th>
                      <th className="px-4 py-3">Target Resource</th>
                      <th className="px-4 py-3">Diagnostic Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-400">{log.timestamp}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                              log.severity === 'critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : log.severity === 'high'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : log.severity === 'medium'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {log.severity} • {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-sans font-bold text-slate-200">
                          {log.eventType.replace(/_/g, ' ')}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-indigo-300">{log.actorEmail}</p>
                          <p className="text-slate-500 text-[10px]">{log.ipAddress}</p>
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">{log.targetResource}</td>
                        <td className="px-4 py-3 font-sans text-slate-300 max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 6: SYSTEM GOVERNANCE & EMERGENCY BROADCAST           */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'governance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            {/* Emergency Broadcast System */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <Radio className="w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-bold text-white">System-Wide Emergency Broadcast Banner</h3>
              </div>
              <p className="text-xs text-slate-400">
                Publish instantaneous high-priority announcements displayed across all teacher, bursar, and parent interfaces.
              </p>

              <form onSubmit={handleSaveBroadcast} className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-200">Active Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastForm.enabled}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Banner Alert Title</label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Alert Body Message</label>
                  <textarea
                    rows={3}
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Alert Severity Level</label>
                  <select
                    value={broadcastForm.severity}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="info">Informational Notification (Blue)</option>
                    <option value="warning">Warning / Action Required (Amber)</option>
                    <option value="critical">Critical Urgent Emergency (Red)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition"
                >
                  Publish Broadcast Updates
                </button>
              </form>
            </div>

            {/* Directorate Infrastructure Health */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Settings className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Directorate Engine Diagnostics & Controls</h3>
              </div>
              <p className="text-xs text-slate-400">
                System telemetry and administrative overrides for Kenyan Ministry of Education compliance.
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">2-Step Verification (2FA)</p>
                    <p className="text-slate-400 text-[11px]">Enforce TOTP/OTP across master administrative accounts</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                    ENFORCED
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">CBC Competency Registry API</p>
                    <p className="text-slate-400 text-[11px]">Automatic sync with National Assessment Directorate</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                    OPERATIONAL
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">M-Pesa C2B / B2C Instant Webhooks</p>
                    <p className="text-slate-400 text-[11px]">Paybill 400200 real-time payment reconciliation</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                    LIVE (100%)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onSimulate403}
                  className="w-full py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold rounded-xl border border-rose-800 transition text-xs flex items-center justify-center space-x-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Launch 403 Forbidden Intercept Simulation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 5: FEE RECEIPT CUSTOMIZER & PREFERENCES              */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'receipt_customizer' && (
          <div className="animate-in fade-in">
            <ReceiptCustomizerTab />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 6: CBC REPORT CARD CUSTOMIZER (PRIMARY & HIGH SCHOOL) */}
        {/* ------------------------------------------------------------- */}
        {activeAdminTab === 'cbc_customizer' && (
          <div className="animate-in fade-in">
            <CBCReportCardCustomizerTab />
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT STAFF USER & ROLE ASSIGNMENT              */}
      {/* ------------------------------------------------------------- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Assign Staff / Teacher Role</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNewUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Mr. Timothy Cheruiyot"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Staff Institutional Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="e.g. t.cheruiyot@shule101.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Institutional Division</label>
                  <select
                    value={newUserForm.staffDivision}
                    onChange={(e) => setNewUserForm({ ...newUserForm, staffDivision: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="teacher">Class Teacher</option>
                    <option value="principal">Principal / Head</option>
                    <option value="finance">Finance Bursar</option>
                    <option value="directorate">Directorate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Assigned Class / Stream</label>
                  <select
                    disabled={newUserForm.staffDivision !== 'teacher'}
                    value={newUserForm.assignedClass}
                    onChange={(e) => setNewUserForm({ ...newUserForm, assignedClass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                  >
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 9-B">Grade 9-B</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-Science">Grade 11-Science</option>
                    <option value="Grade 11-Arts">Grade 11-Arts</option>
                    <option value="Grade 12-Science">Grade 12-Science</option>
                    <option value="Grade 12-Arts">Grade 12-Arts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assigned School</label>
                <select
                  value={newUserForm.schoolId}
                  onChange={(e) => setNewUserForm({ ...newUserForm, schoolId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {registeredSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-300">Enforce 2-Step Authentication (2FA)</span>
                <input
                  type="checkbox"
                  checked={newUserForm.twoFactorEnabled}
                  onChange={(e) => setNewUserForm({ ...newUserForm, twoFactorEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  Confirm Role Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: LINK PARENT TO PUPIL (PARENT-STUDENT MAPPING)        */}
      {/* ------------------------------------------------------------- */}
      {isAddMappingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMappingModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Link Parent / Guardian to Pupil</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddMappingModalOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setIsAddMappingModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNewMapping} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pupil Full Name</label>
                  <input
                    type="text"
                    required
                    value={newMappingForm.studentName}
                    onChange={(e) => setNewMappingForm({ ...newMappingForm, studentName: e.target.value })}
                    placeholder="e.g. Zuberi Ochieng"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Admission Number</label>
                  <input
                    type="text"
                    required
                    value={newMappingForm.admissionNumber}
                    onChange={(e) => setNewMappingForm({ ...newMappingForm, admissionNumber: e.target.value })}
                    placeholder="e.g. ADM-2025-088"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Grade / Stream</label>
                  <select
                    value={newMappingForm.grade}
                    onChange={(e) => setNewMappingForm({ ...newMappingForm, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 9-B">Grade 9-B</option>
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 10-B">Grade 10-B</option>
                    <option value="Grade 11-Science">Grade 11-Science</option>
                    <option value="Grade 11-Arts">Grade 11-Arts</option>
                    <option value="Grade 12-Science">Grade 12-Science</option>
                    <option value="Grade 12-Arts">Grade 12-Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Relationship</label>
                  <select
                    value={newMappingForm.relationship}
                    onChange={(e) => setNewMappingForm({ ...newMappingForm, relationship: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sponsor">Sponsor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Guardian Full Name</label>
                <input
                  type="text"
                  required
                  value={newMappingForm.guardianName}
                  onChange={(e) => setNewMappingForm({ ...newMappingForm, guardianName: e.target.value })}
                  placeholder="e.g. Amina Ochieng"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Guardian Email (Portal Login)</label>
                  <input
                    type="email"
                    required
                    value={newMappingForm.guardianEmail}
                    onChange={(e) => setNewMappingForm({ ...newMappingForm, guardianEmail: e.target.value })}
                    placeholder="e.g. parent.amina@shule101.edu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Guardian Phone Number (SMS/M-Pesa)</label>
                  <input
                    type="text"
                    value={newMappingForm.guardianPhone}
                    onChange={(e) => setNewMappingForm({ ...newMappingForm, guardianPhone: e.target.value })}
                    placeholder="+254 712 345 678"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-[11px] text-emerald-300">
                A unique Parent Portal access code (e.g. <strong className="font-mono">SHULE-PRNT-XXXX</strong>) will automatically be generated and linked to this pupil record.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMappingModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Save & Link Parent to Pupil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: REGISTER NEW INSTITUTION                            */}
      {/* ------------------------------------------------------------- */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
                  <School className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Register New School Institution</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveNewSchool} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-400 mb-1 font-semibold">School Code</label>
                  <input
                    type="text"
                    required
                    value={newSchoolForm.code}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, code: e.target.value })}
                    placeholder="e.g. SC-006"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 uppercase font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Institution Full Name</label>
                  <input
                    type="text"
                    required
                    value={newSchoolForm.name}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                    placeholder="e.g. Alliance National High School"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">County / City</label>
                  <input
                    type="text"
                    value={newSchoolForm.countyOrCity}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, countyOrCity: e.target.value })}
                    placeholder="e.g. Kiambu County"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Subscription Tier</label>
                  <select
                    value={newSchoolForm.tier}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, tier: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Trial">Trial Plan (Free)</option>
                    <option value="Standard CBC">Standard CBC (KSh 50,000/term)</option>
                    <option value="Enterprise Plus">Enterprise Plus (KSh 95,000/term)</option>
                    <option value="National Directorate">National Directorate (KSh 350,000/yr)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Principal / Headteacher Name</label>
                  <input
                    type="text"
                    value={newSchoolForm.principalName}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, principalName: e.target.value })}
                    placeholder="e.g. Dr. Arthur Vance"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Initial Pupil Capacity</label>
                  <input
                    type="number"
                    value={newSchoolForm.studentCount}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, studentCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Onboard & Register School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: EDIT SUBSCRIPTION PLAN                              */}
      {/* ------------------------------------------------------------- */}
      {editingSubscription && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSubscription(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Modify Subscription Plan</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setEditingSubscription(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setEditingSubscription(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Subscription Tier</label>
                <select
                  value={editingSubscription.tier}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, tier: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Trial">Trial</option>
                  <option value="Standard CBC">Standard CBC</option>
                  <option value="Enterprise Plus">Enterprise Plus</option>
                  <option value="National Directorate">National Directorate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Billing Status</label>
                  <select
                    value={editingSubscription.status}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="expiring_soon">Expiring Soon</option>
                    <option value="grace_period">Grace Period</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Amount (KSh)</label>
                  <input
                    type="number"
                    value={editingSubscription.amountKSH}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, amountKSH: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Next Renewal Date</label>
                <input
                  type="date"
                  value={editingSubscription.nextRenewalDate}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, nextRenewalDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSubscription(null)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSchoolSubscription(editingSubscription);
                    setEditingSubscription(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Update Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
