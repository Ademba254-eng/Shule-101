import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  GraduationCap,
  LayoutDashboard,
  Award,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Users,
  Bell,
  RefreshCw,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  LogOut,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { StaffDivision } from '../types';
import { Shule101Logo } from './Shule101Logo';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAddStudent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAddStudent }) => {
  const {
    activeRole,
    setActiveRole,
    activeDivision,
    setActiveDivision,
    assignedClass,
    setAssignedClass,
    selectedParentStudentId,
    setSelectedParentStudentId,
    students,
    stats,
    resetToDemoData,
    currentUser,
    logout,
    currentSchool,
    adminSession,
    emergencyBroadcast,
  } = useSchool();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedParentStudentId) || students[0];

  // Division label helper
  const getStaffBadgeLabel = () => {
    if (adminSession) return 'Master Admin • 2FA Active';
    if (activeDivision === 'principal') return 'Principal • All Pupils';
    if (activeDivision === 'teacher') return `Teacher • ${assignedClass || 'Class'}`;
    if (activeDivision === 'finance') return 'Finance • Fee Balances';
    return 'Staff / Faculty';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'performance', label: 'Performance', icon: Award },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'fees', label: 'Fee Payments', icon: CreditCard },
    {
      id: 'messaging',
      label: 'Parent Messaging',
      icon: MessageSquare,
      badge: stats.unreadStaffMessages > 0 ? stats.unreadStaffMessages : undefined,
    },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'admin', label: 'Admin Portal (2FA)', icon: ShieldCheck, isProtected: true },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Emergency Broadcast Banner if Active */}
      {emergencyBroadcast.enabled && (
        <div
          className={`px-4 py-2 text-xs font-semibold text-center flex items-center justify-center space-x-2 ${
            emergencyBroadcast.severity === 'critical'
              ? 'bg-rose-600 text-white'
              : emergencyBroadcast.severity === 'warning'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-indigo-600 text-white'
          }`}
        >
          <span className="uppercase tracking-wider font-bold">[{emergencyBroadcast.title}]</span>
          <span>{emergencyBroadcast.message}</span>
        </div>
      )}

      {/* Top Bar with School Identity and Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Shule 101 Brand Logo & School Context */}
          <div className="flex items-center space-x-3.5">
            <Shule101Logo variant="mark" size="md" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#261611] text-lg tracking-tight">Shule 101</span>
                {currentSchool && (
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 truncate max-w-[200px]" title={currentSchool.name}>
                    {currentSchool.name}
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Term 2 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {currentSchool ? `${currentSchool.name} (${currentSchool.code}) • ${currentSchool.countyOrCity}` : 'connect . simplify and grow'}
              </p>
            </div>
          </div>

          {/* Right Actions: Role Switcher & Utilities */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Reset */}
            <button
              id="reset-demo-btn"
              onClick={() => {
                if (window.confirm('Reset all demo data (grades, attendance, fees, messages) back to defaults?')) {
                  resetToDemoData();
                }
              }}
              title="Reset Sample School Data"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setShowNotificationToast(!showNotificationToast)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {stats.unreadStaffMessages > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotificationToast && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="font-semibold text-sm text-slate-800">System Notifications</span>
                    <span className="text-xs text-indigo-600 font-medium cursor-pointer" onClick={() => setShowNotificationToast(false)}>
                      Dismiss
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-900">
                      <p className="font-semibold">Fee Balance Alert</p>
                      <p className="text-amber-800">2 students have pending overdue invoices past September 01.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-900">
                      <p className="font-semibold">Parent Messaging</p>
                      <p className="text-indigo-800">Direct thread with Eleanor Davis updated today at 09:42 AM.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                id="role-switcher-toggle"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeRole === 'staff'
                    ? activeDivision === 'principal'
                      ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                      : activeDivision === 'finance'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  {activeRole === 'staff' ? (
                    activeDivision === 'principal' ? (
                      <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    ) : activeDivision === 'finance' ? (
                      <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    )
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>
                    {activeRole === 'staff'
                      ? getStaffBadgeLabel()
                      : `Parent: ${selectedStudent?.guardian.name}`}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1.5">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Staff Division & Perspective
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Switch services or experience the portal as a parent
                    </p>
                  </div>

                  {/* Staff Department Divisions */}
                  <div className="space-y-1">
                    {/* Teacher */}
                    <button
                      id="switch-to-teacher"
                      onClick={() => {
                        setActiveRole('staff');
                        setActiveDivision('teacher');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs ${
                        activeRole === 'staff' && activeDivision === 'teacher'
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-300 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Teacher Division ({assignedClass || 'Grade 10-A'})</div>
                          <div className="text-[10px] text-slate-500">
                            Edit performance & mark attendance for {assignedClass}
                          </div>
                        </div>
                      </div>
                      {activeRole === 'staff' && activeDivision === 'teacher' && (
                        <span className="text-xs text-indigo-700 font-bold">✓</span>
                      )}
                    </button>

                    {/* Class Quick Switch if Teacher */}
                    {activeRole === 'staff' && activeDivision === 'teacher' && (
                      <div className="px-2.5 py-1 bg-indigo-50/50 rounded-lg flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Assigned Class:</span>
                        <select
                          value={assignedClass}
                          onChange={(e) => setAssignedClass(e.target.value)}
                          className="bg-white border border-indigo-200 rounded px-1.5 py-0.5 text-xs font-semibold text-indigo-800"
                        >
                          <option value="Grade 10-A">Grade 10-A</option>
                          <option value="Grade 9-A">Grade 9-A</option>
                          <option value="Grade 10-B">Grade 10-B</option>
                          <option value="Grade 11-A">Grade 11-A</option>
                          <option value="Grade 12-A">Grade 12-A</option>
                        </select>
                      </div>
                    )}

                    {/* Finance */}
                    <button
                      id="switch-to-finance"
                      onClick={() => {
                        setActiveRole('staff');
                        setActiveDivision('finance');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs ${
                        activeRole === 'staff' && activeDivision === 'finance'
                          ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Finance & Bursar Department</div>
                          <div className="text-[10px] text-slate-500">
                            Exclusively record payments, edit fee balances & receipts
                          </div>
                        </div>
                      </div>
                      {activeRole === 'staff' && activeDivision === 'finance' && (
                        <span className="text-xs text-amber-700 font-bold">✓</span>
                      )}
                    </button>

                    {/* Principal */}
                    <button
                      id="switch-to-principal"
                      onClick={() => {
                        setActiveRole('staff');
                        setActiveDivision('principal');
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs ${
                        activeRole === 'staff' && activeDivision === 'principal'
                          ? 'bg-purple-50 text-purple-900 border border-purple-300 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Principal / Headmaster</div>
                          <div className="text-[10px] text-slate-500">
                            Executive oversight of all pupils in school
                          </div>
                        </div>
                      </div>
                      {activeRole === 'staff' && activeDivision === 'principal' && (
                        <span className="text-xs text-purple-700 font-bold">✓</span>
                      )}
                    </button>

                    <div className="pt-2 px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Or View As Parent:
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {students.slice(0, 5).map((student) => (
                        <button
                          key={student.id}
                          id={`switch-to-parent-${student.id}`}
                          onClick={() => {
                            setSelectedParentStudentId(student.id);
                            setActiveRole('parent');
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs ${
                            activeRole === 'parent' && selectedParentStudentId === student.id
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-medium">{student.guardian.name}</span>
                            <span
                              className={`block text-[10px] truncate ${
                                activeRole === 'parent' && selectedParentStudentId === student.id
                                  ? 'text-emerald-100'
                                  : 'text-slate-500'
                              }`}
                            >
                              Parent of {student.firstName} ({student.grade})
                            </span>
                          </div>
                          {activeRole === 'parent' && selectedParentStudentId === student.id && (
                            <span>✓</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Sign Out Option inside switcher */}
                    <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between px-2">
                      <span className="text-[10px] text-slate-400">Current Session</span>
                      <button
                        onClick={() => {
                          setIsRoleDropdownOpen(false);
                          logout();
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center space-x-1 py-1 px-1.5 rounded hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Staff Quick Action: Add Student */}
            {activeRole === 'staff' && (
              <button
                id="header-add-student-btn"
                onClick={onOpenAddStudent}
                className="hidden md:inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                + Add Student
              </button>
            )}

            {/* User Profile & Sign Out Button */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              {currentUser && (
                <div className="hidden xl:flex items-center space-x-2">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {currentUser.name[0]}
                    </div>
                  )}
                  <div className="text-left leading-none">
                    <span className="block text-xs font-semibold text-slate-800 truncate max-w-[110px]">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {currentUser.role === 'staff' ? 'Staff Portal' : 'Parent Portal'}
                    </span>
                  </div>
                </div>
              )}

              <button
                id="header-signout-btn"
                onClick={logout}
                title="Sign Out of Shule 101"
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs (Visible in Staff Mode; in Parent Mode we highlight Parent View tab) */}
      {activeRole === 'staff' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      ) : (
        <div className="bg-emerald-50/60 border-t border-emerald-100 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-medium text-emerald-800">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Viewing Parent Portal for <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> ({selectedStudent?.grade} - Roll: {selectedStudent?.rollNumber})
              </span>
            </div>
            <button
              onClick={() => setActiveRole('staff')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
            >
              Back to Administrator / Teacher Dashboard →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
