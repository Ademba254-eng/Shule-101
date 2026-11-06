/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  School,
  X,
  Search,
  Building2,
  MapPin,
  Check,
  ChevronDown,
  BookOpen,
  Briefcase,
  Award,
  CalendarCheck,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import { Shule101Logo } from './Shule101Logo';
import { useSchool } from '../context/SchoolContext';
import { DEMO_ACCOUNTS } from '../data/authAccounts';
import { UserAccount, RegisteredSchool, StaffDivision } from '../types';

interface LoginPageProps {
  onOpenAdmin2FA?: (email?: string) => void;
  onNavigateAdminUrl?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onOpenAdmin2FA,
  onNavigateAdminUrl,
}) => {
  const { login, students, registeredSchools, currentSchool, systemUsers, parentStudentMappings } = useSchool();

  // Selected Registered School state
  const [selectedSchool, setSelectedSchool] = useState<RegisteredSchool | null>(
    () => currentSchool || registeredSchools[0] || null
  );
  const [isChangingSchool, setIsChangingSchool] = useState<boolean>(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState<boolean>(false);
  const schoolSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Tab: 'staff' vs 'parent'
  const [activeTab, setActiveTab] = useState<'staff' | 'parent'>('staff');

  // Staff Division: 'principal' | 'teacher' | 'finance'
  const [selectedDivision, setSelectedDivision] = useState<StaffDivision>('teacher');
  const [assignedClassChoice, setAssignedClassChoice] = useState<string>('Grade 10-A');

  // Form fields
  const [identifier, setIdentifier] = useState<string>('teacher.mwangi@shule101.edu');
  const [password, setPassword] = useState<string>('shule2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);

  // Focus input when changing school
  useEffect(() => {
    if (isChangingSchool && schoolSearchInputRef.current) {
      schoolSearchInputRef.current.focus();
    }
  }, [isChangingSchool]);

  // Automatic search filtering of registered schools
  const filteredSchools = useMemo(() => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return registeredSchools;

    return registeredSchools.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCode = s.code.toLowerCase().includes(q);
      const matchCity = s.countyOrCity.toLowerCase().includes(q);
      const matchCurriculum = s.curriculum.toLowerCase().includes(q);
      const matchLevel = s.level.toLowerCase().includes(q);
      return matchName || matchCode || matchCity || matchCurriculum || matchLevel;
    });
  }, [schoolSearchQuery, registeredSchools]);

  // Display accounts including any freshly registered parents
  const displayAccounts = useMemo(() => {
    const list = [...DEMO_ACCOUNTS];
    (systemUsers || []).forEach((u) => {
      if (u.role === 'parent' && !list.some((existing) => existing.email.toLowerCase() === u.email.toLowerCase())) {
        list.push(u);
      }
    });
    return list;
  }, [systemUsers]);

  // Select a school
  const handleSelectSchool = (school: RegisteredSchool) => {
    setSelectedSchool(school);
    setIsChangingSchool(false);
    setIsSchoolDropdownOpen(false);
    setSchoolSearchQuery('');
    setErrorMessage(null);

    // If staff email had default domain, update domain suggestion
    if (school.emailDomain && activeTab === 'staff') {
      if (identifier.includes('@shule101.edu') || identifier.includes('@')) {
        const username = identifier.split('@')[0] || 'admin';
        setIdentifier(`${username}@${school.emailDomain}`);
      }
    }
  };

  // Switch tabs
  const handleTabChange = (tab: 'staff' | 'parent') => {
    setActiveTab(tab);
    setErrorMessage(null);
    const domain = selectedSchool?.emailDomain || 'shule101.edu';
    if (tab === 'staff') {
      if (selectedDivision === 'principal') {
        setIdentifier(`principal@${domain}`);
      } else if (selectedDivision === 'finance') {
        setIdentifier(`finance@${domain}`);
      } else {
        setIdentifier(`teacher.mwangi@${domain}`);
      }
      setPassword('shule2026');
    } else {
      setIdentifier('eleanor.davis@example.com');
      setPassword('parent2026');
    }
  };

  // Switch Staff Division
  const handleDivisionChange = (div: StaffDivision) => {
    setSelectedDivision(div);
    setErrorMessage(null);
    const domain = selectedSchool?.emailDomain || 'shule101.edu';
    if (div === 'principal') {
      setIdentifier(`principal@${domain}`);
    } else if (div === 'finance') {
      setIdentifier(`finance@${domain}`);
    } else {
      setIdentifier(assignedClassChoice === 'Grade 9-A' ? `teacher.jenkins@${domain}` : `teacher.mwangi@${domain}`);
    }
  };

  // Submit standard login
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedSchool) {
      setErrorMessage('Please mention and select your registered school first.');
      setIsChangingSchool(true);
      return;
    }

    const trimmedId = identifier.trim().toLowerCase();
    if (!trimmedId) {
      setErrorMessage('Please enter your email or portal username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your access password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Check if trying to sign in as admin
      if (trimmedId.includes('admin') || activeTab === 'staff') {
        const found = DEMO_ACCOUNTS.find(
          (acc) => acc.email.toLowerCase() === trimmedId
        );

        if (found?.isAdmin || found?.role === 'admin' || trimmedId === 'admin@shule101.gov' || trimmedId === 'sysadmin@shule101.edu') {
          if (onOpenAdmin2FA) {
            onOpenAdmin2FA(trimmedId);
            return;
          }
        }

        if (found) {
          // Keep or override assigned class if teacher
          const userObj: UserAccount = {
            ...found,
            staffDivision: found.staffDivision || selectedDivision,
            assignedClass:
              (found.staffDivision || selectedDivision) === 'teacher'
                ? found.assignedClass || assignedClassChoice
                : undefined,
          };
          login(userObj, selectedSchool);
        } else {
          const customStaff: UserAccount = {
            id: `usr-custom-${Date.now()}`,
            name: trimmedId.includes('@') ? trimmedId.split('@')[0] : 'Faculty Member',
            email: trimmedId,
            role: 'staff',
            staffDivision: selectedDivision,
            assignedClass: selectedDivision === 'teacher' ? assignedClassChoice : undefined,
            title:
              selectedDivision === 'principal'
                ? `Principal / Headmaster at ${selectedSchool.name}`
                : selectedDivision === 'finance'
                ? `Finance Bursar at ${selectedSchool.name}`
                : `Class Teacher (${assignedClassChoice}) at ${selectedSchool.name}`,
            schoolId: selectedSchool.id,
            schoolName: selectedSchool.name,
          };
          login(customStaff, selectedSchool);
        }
      } else {
        const found =
          systemUsers.find((acc) => acc.role === 'parent' && acc.email.toLowerCase() === trimmedId) ||
          DEMO_ACCOUNTS.find((acc) => acc.role === 'parent' && acc.email.toLowerCase() === trimmedId);

        if (found) {
          login(found, selectedSchool);
        } else {
          // Check parentStudentMappings first
          const foundMapping = (parentStudentMappings || []).find(
            (m) =>
              m.guardianEmail.toLowerCase() === trimmedId ||
              m.accessCode.toLowerCase() === trimmedId ||
              m.admissionNumber.toLowerCase() === trimmedId
          );

          const matchedStudent = foundMapping
            ? students.find((s) => s.id === foundMapping.studentId)
            : students.find(
                (s) =>
                  s.admissionNo.toLowerCase() === trimmedId ||
                  (s.guardian && s.guardian.email && s.guardian.email.toLowerCase() === trimmedId) ||
                  (s.guardian && s.guardian.phone && s.guardian.phone.includes(trimmedId))
              );

          if (matchedStudent) {
            const parentAccount: UserAccount = {
              id: `usr-parent-${matchedStudent.id}`,
              name: matchedStudent.guardian.name,
              email: matchedStudent.guardian.email || trimmedId,
              role: 'parent',
              title: `Guardian of ${matchedStudent.firstName} ${matchedStudent.lastName} (${matchedStudent.grade}-${matchedStudent.section})`,
              studentId: matchedStudent.id,
              schoolId: selectedSchool.id,
              schoolName: selectedSchool.name,
            };
            login(parentAccount, selectedSchool);
          } else {
            const defaultStudent = students[0];
            const genericParent: UserAccount = {
              id: `usr-parent-${Date.now()}`,
              name: trimmedId.includes('@') ? trimmedId.split('@')[0] : 'Student Guardian',
              email: trimmedId,
              role: 'parent',
              title: `Guardian of ${defaultStudent?.firstName || 'Student'}`,
              studentId: defaultStudent?.id || 'std-1',
              schoolId: selectedSchool.id,
              schoolName: selectedSchool.name,
            };
            login(genericParent, selectedSchool);
          }
        }
      }
    }, 450);
  };

  // Quick 1-click login helper
  const handleQuickLogin = (account: UserAccount) => {
    if (account.isAdmin || account.role === 'admin') {
      if (onOpenAdmin2FA) {
        onOpenAdmin2FA(account.email);
        return;
      }
    }

    setIsLoading(true);
    // Find school for account or use selected
    const matchingSchool = registeredSchools.find((s) => s.id === account.schoolId) || selectedSchool || registeredSchools[0];
    setSelectedSchool(matchingSchool);

    setTimeout(() => {
      setIsLoading(false);
      login(account, matchingSchool);
    }, 250);
  };

  // Handle forgot password submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200/80 flex flex-col justify-between text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Header with Brand */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shule101Logo variant="horizontal" size="md" />
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{registeredSchools.length} Registered Schools Synced</span>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-lg">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden">
            {/* Top Accent Strip */}
            <div
              className={`h-1.5 w-full transition-colors duration-300 ${
                activeTab === 'staff' ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
            />

            <div className="p-6 sm:p-8">
              {/* Header Title with Official Logo Mark */}
              <div className="text-center mb-5">
                <div className="flex justify-center mb-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-50/80 border border-amber-100 shadow-xs">
                    <Shule101Logo variant="mark" size="lg" />
                  </div>
                </div>
                <h1 className="text-2xl font-black text-[#261611] tracking-tight">
                  Sign in to Shule 101
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  connect . simplify and grow
                </p>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* REGISTERED SCHOOL SEARCH / MENTION COMPONENT */}
              {/* ------------------------------------------------------------- */}
              <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="school-search-input"
                    className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
                  >
                    Your School / Institution
                  </label>
                  {selectedSchool && !isChangingSchool && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSchool(true);
                        setIsSchoolDropdownOpen(true);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Change School
                    </button>
                  )}
                </div>

                {/* Case 1: A school is already selected and not changing */}
                {selectedSchool && !isChangingSchool ? (
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-xs group">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {selectedSchool.name}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 truncate mt-0.5">
                        <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-1 rounded">
                          {selectedSchool.code}
                        </span>
                        <span>•</span>
                        <span>{selectedSchool.countyOrCity}</span>
                        <span>•</span>
                        <span>{selectedSchool.curriculum}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSchool(true);
                        setIsSchoolDropdownOpen(true);
                      }}
                      title="Search a different registered school"
                      className="ml-2 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded border border-slate-200 flex-shrink-0 transition"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  /* Case 2: User is typing/searching for their registered school */
                  <div className="relative">
                    <div className="relative">
                      <input
                        ref={schoolSearchInputRef}
                        id="school-search-input"
                        type="text"
                        value={schoolSearchQuery}
                        onChange={(e) => {
                          setSchoolSearchQuery(e.target.value);
                          setIsSchoolDropdownOpen(true);
                        }}
                        onFocus={() => setIsSchoolDropdownOpen(true)}
                        placeholder="Type school name, code (e.g. SC-1029), or town..."
                        className="w-full px-3 py-2 bg-white border border-indigo-400 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                      />
                      {schoolSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSchoolSearchQuery('')}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1.5 px-0.5 text-[11px] text-slate-500">
                      <span>
                        Automatic search across {registeredSchools.length} registered institutions
                      </span>
                      {selectedSchool && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingSchool(false);
                            setIsSchoolDropdownOpen(false);
                          }}
                          className="text-slate-500 hover:text-slate-700 underline"
                        >
                          Keep {selectedSchool.name.split(' ')[0]}
                        </button>
                      )}
                    </div>

                    {/* Automatic Search Results Dropdown */}
                    {isSchoolDropdownOpen && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95">
                        <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                          <span>
                            {schoolSearchQuery.trim()
                              ? `Matching Registered Schools (${filteredSchools.length})`
                              : 'All Registered Schools (Select yours)'}
                          </span>
                          <span className="text-slate-400">Click to connect</span>
                        </div>

                        {filteredSchools.length > 0 ? (
                          filteredSchools.map((school) => {
                            const isSelected = selectedSchool?.id === school.id;
                            return (
                              <button
                                key={school.id}
                                id={`select-school-${school.id}`}
                                type="button"
                                onClick={() => handleSelectSchool(school)}
                                className={`w-full text-left p-2.5 hover:bg-indigo-50/60 transition flex items-start justify-between group ${
                                  isSelected ? 'bg-indigo-50/80' : ''
                                }`}
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                                      {school.name}
                                    </span>
                                    <span className="font-mono text-[10px] font-semibold px-1 py-0.2 bg-slate-100 text-slate-600 rounded">
                                      {school.code}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                                    <span>{school.countyOrCity}</span>
                                    <span>•</span>
                                    <span className="truncate">{school.curriculum}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1.5 flex-shrink-0 pt-0.5">
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                    Verified
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] font-bold text-indigo-700">Selected</span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs font-bold text-slate-800">
                              No registered school found for &ldquo;{schoolSearchQuery}&rdquo;
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Check spelling or pick from official registered schools:
                            </p>
                            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                              {registeredSchools.slice(0, 3).map((s) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => handleSelectSchool(s)}
                                  className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 px-2 py-1 rounded-md transition"
                                >
                                  {s.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Portal Role Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 mb-4">
                <button
                  id="tab-staff"
                  type="button"
                  onClick={() => handleTabChange('staff')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                    activeTab === 'staff'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Staff & Faculty
                </button>
                <button
                  id="tab-parent"
                  type="button"
                  onClick={() => handleTabChange('parent')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                    activeTab === 'parent'
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parent & Guardian
                </button>
              </div>

              {/* Staff Divisions Selection & Service Matrix */}
              {activeTab === 'staff' && (
                <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Staff Division & Services</span>
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Scoped Permissions
                    </span>
                  </div>

                  {/* 3 Department Divisions */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Teacher Division */}
                    <button
                      type="button"
                      id="division-teacher"
                      onClick={() => handleDivisionChange('teacher')}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedDivision === 'teacher'
                          ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <BookOpen
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            selectedDivision === 'teacher' ? 'text-indigo-600' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">Teacher</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        Edit student performance & mark attendance register
                      </p>
                    </button>

                    {/* Finance Division */}
                    <button
                      type="button"
                      id="division-finance"
                      onClick={() => handleDivisionChange('finance')}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedDivision === 'finance'
                          ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <CreditCard
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            selectedDivision === 'finance' ? 'text-indigo-600' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">Finance</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        Exclusively record fee payments & manage balances
                      </p>
                    </button>

                    {/* Principal Division */}
                    <button
                      type="button"
                      id="division-principal"
                      onClick={() => handleDivisionChange('principal')}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedDivision === 'principal'
                          ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1">
                        <GraduationCap
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            selectedDivision === 'principal' ? 'text-indigo-600' : 'text-slate-500'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">Principal</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        Executive oversight of all pupils in school
                      </p>
                    </button>
                  </div>

                  {/* Division Detailed Context & Assignment */}
                  {selectedDivision === 'teacher' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <label
                          htmlFor="teacher-class-select"
                          className="text-[11px] font-bold text-slate-700 flex items-center space-x-1"
                        >
                          <span>Assigned Class in Charge:</span>
                        </label>
                        <select
                          id="teacher-class-select"
                          value={assignedClassChoice}
                          onChange={(e) => {
                            const newClass = e.target.value;
                            setAssignedClassChoice(newClass);
                            const domain = selectedSchool?.emailDomain || 'shule101.edu';
                            if (newClass === 'Grade 9-A') {
                              setIdentifier(`teacher.jenkins@${domain}`);
                            } else {
                              setIdentifier(`teacher.mwangi@${domain}`);
                            }
                          }}
                          className="text-xs font-bold bg-white border border-indigo-300 rounded-lg px-2.5 py-1 text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Grade 10-A">Grade 10-A (Class Teacher Mwangi)</option>
                          <option value="Grade 9-A">Grade 9-A (Class Teacher Jenkins)</option>
                          <option value="Grade 10-B">Grade 10-B (Class Teacher Ochieng)</option>
                          <option value="Grade 11-A">Grade 11-A (Class Teacher Sharma)</option>
                          <option value="Grade 12-A">Grade 12-A (Class Teacher Vance)</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1.5 flex items-start space-x-1">
                        <span className="text-indigo-600 font-bold">🔒 Scoped Access:</span>
                        <span>
                          Teachers manage <strong>{assignedClassChoice}</strong> academic performance, mark attendance, and send fee reminders. Recording fee payments is exclusively handled by Finance.
                        </span>
                      </p>
                    </div>
                  )}

                  {selectedDivision === 'finance' && (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Finance Division Access:</strong> Exclusively authorized to record fee payments, edit student fee balances, adjust tuition invoices, apply bursary waivers, and issue payment receipts across all student accounts.
                      </span>
                    </div>
                  )}

                  {selectedDivision === 'principal' && (
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Principal / Headmaster Oversight:</strong> Full administrative privilege to view all pupils in the school across all grades, academic reports, attendance registers, and finances.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-semibold">Notice: </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    {activeTab === 'staff'
                      ? 'Institutional Email / Staff ID'
                      : 'Guardian Email or Admission No.'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {activeTab === 'staff' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <School className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      id="login-identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activeTab === 'staff'
                          ? `e.g. admin@${selectedSchool?.emailDomain || 'shule101.edu'}`
                          : 'e.g. eleanor.davis@example.com'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                    >
                      Password / Access Code
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(identifier);
                        setForgotSuccess(false);
                        setIsForgotModalOpen(true);
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-600">Keep me logged in</span>
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>SSL 256-bit Encrypted</span>
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  id="submit-login-btn"
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center space-x-2 ${
                    activeTab === 'staff'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:bg-indigo-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:bg-emerald-800'
                  } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Connecting to {selectedSchool?.name || 'School'}...</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        Enter {activeTab === 'staff' ? 'Staff Portal' : 'Parent Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Sign-in Presets */}
              <div className="mt-7 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick Demo Sign-In (1-Click)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Sample Accounts</span>
                </div>

                <div className="space-y-2">
                  {displayAccounts.map((acc) => {
                    const isStaff = acc.role === 'staff';
                    const divisionLabel =
                      acc.staffDivision === 'principal'
                        ? 'Principal • All Pupils'
                        : acc.staffDivision === 'teacher'
                        ? `Teacher • ${acc.assignedClass || 'Class'}`
                        : acc.staffDivision === 'finance'
                        ? 'Finance • Fee Balances'
                        : isStaff
                        ? 'Staff'
                        : `Parent • ${acc.assignedClass || 'Guardian'}`;

                    const badgeColor =
                      acc.staffDivision === 'principal'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : acc.staffDivision === 'teacher'
                        ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        : acc.staffDivision === 'finance'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                    return (
                      <button
                        key={acc.id}
                        id={`quick-login-${acc.id}`}
                        type="button"
                        onClick={() => handleQuickLogin(acc)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition group bg-slate-50/50"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {acc.avatar ? (
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0">
                              {acc.name[0]}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-900">
                                {acc.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${badgeColor}`}
                              >
                                {divisionLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{acc.title}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-2" />
                      </button>
                    );
                  })}

                  {/* Dedicated Master Admin 2FA Entry */}
                  <div className="pt-2">
                    <button
                      id="login-master-admin-btn"
                      type="button"
                      onClick={() => {
                        if (onOpenAdmin2FA) {
                          onOpenAdmin2FA('admin@shule101.gov');
                        } else if (onNavigateAdminUrl) {
                          onNavigateAdminUrl();
                        }
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-950 text-left transition group shadow-xs"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 flex-shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                              Dr. Victor Ochieng (Master Admin)
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md border bg-indigo-950 text-indigo-300 border-indigo-700">
                              2FA Required
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            Direct URL access & National Governance Console
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal security badge */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {selectedSchool ? `${selectedSchool.name} • ` : ''}Verified Shule 101 Registry Node
              </span>
            </div>
          </div>

          {/* Quick Help Link */}
          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              School not listed in the registry? Contact Shule 101 onboarding at{' '}
              <a href="mailto:support@shule101.edu" className="underline text-indigo-600">
                support@shule101.edu
              </a>
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-semibold text-slate-600">
          Shule 101 • <span className="text-amber-700 italic font-medium">connect . simplify and grow</span>
        </p>
        <p className="text-slate-400">© 2026 Shule 101 School Information System • Ministry & Board Accredited</p>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back to Sign In"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Credentials</h3>
                  <p className="text-xs text-slate-500">
                    {selectedSchool?.name || 'Shule 101'} Security Desk
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Reset Instructions Dispatched</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We have dispatched a temporary access token and reset link to{' '}
                  <span className="font-semibold text-slate-800">{forgotEmail}</span>. Please verify your inbox or school registered mobile phone.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center justify-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered institutional email or guardian telephone number to receive an encrypted one-time recovery password.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. admin@shule101.edu or +1 555 234 8901"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                  >
                    Send Recovery Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
