import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GradeLevel, Section } from '../types';
import { getTeacherForGradeAndSection } from '../utils/teacherAssignment';
import { CompressedFileUpload } from './CompressedFileUpload';
import { CompressedFileResult } from '../utils/fileCompression';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Mail,
  Phone,
  User,
  BookOpen,
  CreditCard,
  GraduationCap,
  Sparkles,
  Check,
} from 'lucide-react';

interface FinanceRegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentId: string) => void;
}

export const FinanceRegisterStudentModal: React.FC<FinanceRegisterStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addStudent, currentSchool, login, systemUsers, setActiveRole, setSelectedParentStudentId } = useSchool();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 10');
  const [section, setSection] = useState<Section>('A');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<CompressedFileResult | null>(null);

  // Parent / Guardian
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'Mother' | 'Father' | 'Guardian'>('Mother');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+254 7');

  // Finance Billing
  const [feeAmount, setFeeAmount] = useState<number>(48500);

  // Success State
  const [registeredResult, setRegisteredResult] = useState<{
    studentId: string;
    studentName: string;
    admissionNo: string;
    gradeClass: string;
    teacherName: string;
    teacherEmail: string;
    teacherAvatar: string;
    parentName: string;
    parentEmail: string;
    accessCode: string;
  } | null>(null);

  const [copiedInvite, setCopiedInvite] = useState(false);

  // Automatically determine the assigned teacher live as the user changes Grade/Section
  const assignedTeacher = useMemo(() => {
    return getTeacherForGradeAndSection(grade, section);
  }, [grade, section]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !guardianName.trim() || !guardianEmail.trim()) {
      return;
    }

    const cleanEmail = guardianEmail.trim().toLowerCase();

    const createdStudent = addStudent({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      grade,
      section,
      gender,
      dob: '2010-05-14',
      bloodGroup: 'O+',
      avatar:
        customAvatar ||
        (gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
      guardian: {
        name: guardianName.trim(),
        relation: guardianRelation,
        phone: guardianPhone.trim() || '+254 712 345 678',
        email: cleanEmail,
        address: 'Nairobi Metropolitan Area',
      },
      initialFeeAmount: feeAmount,
    });

    const accessCode = `SHULE-PRNT-${Math.floor(1000 + Math.random() * 9000)}`;

    setRegisteredResult({
      studentId: createdStudent.id,
      studentName: `${createdStudent.firstName} ${createdStudent.lastName}`,
      admissionNo: createdStudent.admissionNo,
      gradeClass: `${createdStudent.grade}-${createdStudent.section}`,
      teacherName: assignedTeacher.name,
      teacherEmail: assignedTeacher.email,
      teacherAvatar: assignedTeacher.avatar,
      parentName: guardianName.trim(),
      parentEmail: cleanEmail,
      accessCode,
    });

    if (onSuccess) {
      onSuccess(createdStudent.id);
    }
  };

  const handleCopyCredentials = () => {
    if (!registeredResult) return;
    const text = `SHULE 101 PARENT PORTAL ACCESS
Student: ${registeredResult.studentName} (${registeredResult.admissionNo})
Class: ${registeredResult.gradeClass} (Class Teacher: ${registeredResult.teacherName})
School: ${currentSchool?.name || 'Shule 101 Academy'}

Guardian Login Details:
Portal URL: ${window.location.origin}
Registered Email: ${registeredResult.parentEmail}
Default Password: parent2026
Access Code: ${registeredResult.accessCode}

Log in to inspect verified fee remittance history, statements, receipts, and academic records.`;

    navigator.clipboard.writeText(text);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleSwitchToParentPortal = () => {
    if (!registeredResult) return;
    // Find or create parent account in systemUsers
    const parentAccount = (systemUsers || []).find(
      (u) => u.role === 'parent' && u.email.toLowerCase() === registeredResult.parentEmail.toLowerCase()
    ) || {
      id: `usr-parent-${registeredResult.studentId}`,
      name: registeredResult.parentName,
      email: registeredResult.parentEmail,
      role: 'parent' as const,
      studentId: registeredResult.studentId,
      title: `Guardian of ${registeredResult.studentName}`,
      schoolId: currentSchool?.id || 'sch-01',
      schoolName: currentSchool?.name || 'Shule 101 Academy',
    };

    login(parentAccount, currentSchool);
    setActiveRole('parent');
    setSelectedParentStudentId(registeredResult.studentId);
    onClose();
  };

  const handleResetForAnother = () => {
    setRegisteredResult(null);
    setFirstName('');
    setLastName('');
    setGuardianName('');
    setGuardianEmail('');
    setGuardianPhone('+254 7');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Finance Department • Register New Student
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Bursar Registry
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrolls student, automatically places with appropriate class teacher, and authorizes parent email for portal access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>

        {/* Success View */}
        {registeredResult ? (
          <div className="mt-5 space-y-4 text-xs animate-in fade-in">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  Student Successfully Registered & Placed!
                </h4>
                <p className="text-emerald-800 text-xs mt-0.5">
                  <strong>{registeredResult.studentName}</strong> ({registeredResult.admissionNo}) is now enrolled in <strong>{registeredResult.gradeClass}</strong>. An initial fee statement and ledger have been established.
                </p>
              </div>
            </div>

            {/* Placement & Access Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Teacher Placement Box */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-indigo-900 uppercase tracking-wider flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Automatically Assigned Teacher</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-200 text-indigo-900 rounded">
                    Class Roster
                  </span>
                </div>
                <div className="flex items-center space-x-2.5 pt-1">
                  <img
                    src={registeredResult.teacherAvatar}
                    alt={registeredResult.teacherName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-400 flex-shrink-0"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {registeredResult.teacherName}
                    </span>
                    <span className="text-[11px] text-indigo-700 block">
                      Class Teacher • {registeredResult.gradeClass}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {registeredResult.teacherEmail}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 border-t border-indigo-100">
                  ✓ Student placed on teacher&apos;s daily attendance roll, continuous assessments, and term reports.
                </p>
              </div>

              {/* Parent Access Box */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-emerald-900 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parent Portal Access Authorized</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-200 text-emerald-900 rounded">
                    Active
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Guardian:</span>
                    <span className="font-semibold text-slate-800">{registeredResult.parentName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Registered Email:</span>
                    <span className="font-bold text-emerald-800 font-mono">{registeredResult.parentEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Default Password:</span>
                    <span className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      parent2026
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Access Code:</span>
                    <span className="font-bold text-emerald-900 font-mono">{registeredResult.accessCode}</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 pt-1 border-t border-emerald-100">
                  ✓ Guardian can immediately log in using their registered email to view fee invoices and verified remittance records.
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition"
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Parent Login Details</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  Register Another
                </button>

                <button
                  type="button"
                  id="direct-switch-to-parent-btn"
                  onClick={handleSwitchToParentPortal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                  title="Directly view the student's Parent Portal with verified remittance history"
                >
                  <span>Open Parent Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Step 1: Student Demographics */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Student Name & Academic Placement</span>
                </span>
                <span className="text-[10px] text-slate-400">Required</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Student First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Benjamin"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Student Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brooks"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Grade Level *</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Class Stream / Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value as Section)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Student Photo & Enrollment Records (< 2MB Compressed) */}
              <div className="mt-3">
                <CompressedFileUpload
                  id="finance-student-photo-upload"
                  onFileCompressed={(res) => {
                    setCustomAvatar(res.dataUrl);
                    setUploadedDoc(res);
                  }}
                  onFileRemoved={() => {
                    setCustomAvatar(null);
                    setUploadedDoc(null);
                  }}
                  label="Student Passport Photo or Enrollment Document (Image or PDF)"
                  helperText="Upload image or PDF document. Auto-compressed to < 2MB to save storage space."
                  accept="image/*,.pdf"
                  compact
                />
              </div>
            </div>

            {/* LIVE AUTOMATIC TEACHER PLACEMENT CARD */}
            <div className="p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <img
                  src={assignedTeacher.avatar}
                  alt={assignedTeacher.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-200">
                      Automatic Teacher Placement
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {assignedTeacher.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Assigned Class Teacher for <strong>{grade}-{section}</strong> • Student automatically placed in their class roster and register.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-900 bg-white px-2 py-1 rounded-md border border-indigo-200 flex-shrink-0 hidden sm:inline-block">
                {assignedTeacher.email}
              </span>
            </div>

            {/* Step 2: Parent / Guardian Details & Email Authorization */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Parent / Guardian & Portal Email Access</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Instant Portal Sign-In</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Parent / Guardian Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Laura Brooks"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Relationship</label>
                  <select
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-600 font-medium mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parent&apos;s Registered Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. laura.brooks@example.com"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-emerald-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <p className="text-[10px] text-emerald-700 mt-1">
                    🔒 The parent can easily access the platform simply using this registered email.
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-600 font-medium mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Parent Phone (M-Pesa Remittance)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Initial Fee Billing */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Initial Fee Statement & Billing (Term 2)</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  Standard CBC Term Rate
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-600 block">
                    Term 2 Total Fees (Tuition, Lab, Digital Portal, & Athletics):
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      KSh {feeAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-semibold">
                      Pending Collection
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {[42000, 48500, 54000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFeeAmount(preset)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition border ${
                        feeAmount === preset
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      KSh {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-finance-registration-btn"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center space-x-1.5 transition active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Student & Authorize Parent</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
