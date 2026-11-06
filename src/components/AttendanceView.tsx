import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  CalendarCheck,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Send,
  Users,
  Search,
  Check,
  TrendingUp,
  BookOpen,
  GraduationCap,
  CreditCard,
  Download,
  ShieldAlert,
  MapPin,
  Phone,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { AttendanceStatus } from '../types';
import { AttendanceSummaryModal } from './AttendanceSummaryModal';

export const AttendanceView: React.FC = () => {
  const {
    students,
    accessibleStudents,
    activeDivision,
    assignedClass,
    currentUser,
    currentSchool,
    attendance,
    selectedDate,
    setSelectedDate,
    selectedGrade,
    setSelectedGrade,
    markAttendance,
    markBulkAttendance,
    sendAutomatedNoticeToParent,
    getStudentAttendanceRate,
  } = useSchool();

  const isTeacher = activeDivision === 'teacher';
  const isPrincipal = activeDivision === 'principal';
  const isFinance = activeDivision === 'finance';

  // Base list of students depending on division
  const baseStudents = isTeacher ? accessibleStudents : students;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [selectedStudentHistoryId, setSelectedStudentHistoryId] = useState<string>(
    baseStudents[0]?.id || 'std-1'
  );
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Filter students based on grade & search query
  const filteredStudents = useMemo(() => {
    return baseStudents.filter((s) => {
      const matchesGrade = isTeacher || selectedGrade === 'All' || s.grade === selectedGrade;
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGrade && matchesSearch;
    });
  }, [baseStudents, isTeacher, selectedGrade, searchQuery]);

  // Today's entries
  const currentDayEntries = attendance.filter((a) => a.date === selectedDate);

  // Status counts for selected date
  const counts = useMemo(() => {
    const relevantEntries = currentDayEntries.filter((e) =>
      filteredStudents.some((s) => s.id === e.studentId)
    );
    const present = relevantEntries.filter((e) => e.status === 'present').length;
    const late = relevantEntries.filter((e) => e.status === 'late').length;
    const absent = relevantEntries.filter((e) => e.status === 'absent').length;
    const excused = relevantEntries.filter((e) => e.status === 'excused').length;
    const total = filteredStudents.length;
    const rate = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 100;

    return { present, late, absent, excused, total, rate };
  }, [currentDayEntries, filteredStudents]);

  // Handle Date Navigation
  const changeDate = (deltaDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + deltaDays);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Bulk Mark
  const handleMarkAllPresent = () => {
    const ids = filteredStudents.map((s) => s.id);
    markBulkAttendance(ids, selectedDate, 'present');
  };

  // Distinct dates in attendance history
  const historyDates = useMemo(() => {
    const dates = Array.from(new Set(attendance.map((a) => a.date)));
    return dates.sort();
  }, [attendance]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600" />
            <span>Student Attendance Register</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily roll call tracking, tardiness records, and automated absence alerts for parents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Action: Download Attendance & Emergency Whereabouts Summary */}
          <button
            id="open-attendance-summary-header-btn"
            onClick={() => setIsSummaryModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all"
            title="Download attendance summary with student whereabouts and tardiness records for emergencies"
          >
            <Download className="w-4 h-4" />
            <span>Download Attendance Summary</span>
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500 text-indigo-100 ml-0.5">
              Emergency Ready
            </span>
          </button>

          {/* View Switcher: Daily Register vs Historical Analytics */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              id="tab-daily-register"
              onClick={() => setActiveTab('register')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Register
            </button>
            <button
              id="tab-attendance-history"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Log & Trends
            </button>
          </div>
        </div>
      </div>

      {/* Dismissible Toast Banner */}
      {toastNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastNotice}</span>
          </div>
          <button
            onClick={() => setToastNotice(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg text-emerald-100 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Division Context Banner */}
      {isTeacher && (
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  Class Teacher Attendance Register: {assignedClass || 'Grade 10-A'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Assigned Class Scoped
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                In charge: <strong>{currentUser?.name || 'Class Teacher'}</strong> • Managing roll-call & marking register for {baseStudents.length} assigned pupils.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="open-emergency-whereabouts-banner-btn"
              onClick={() => setIsSummaryModalOpen(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
              title="Open Emergency Muster Roll & Whereabouts Manifest"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency Muster Manifest</span>
            </button>
            <div className="text-xs text-indigo-700 font-semibold bg-white px-3 py-1.5 rounded-lg border border-indigo-200 flex-shrink-0">
              🔒 {assignedClass || 'Grade 10-A'} Pupils Only
            </div>
          </div>
        </div>
      )}

      {isPrincipal && (
        <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">
                Principal / Headmaster Executive Register Overview
              </span>
              <p className="text-slate-500 text-xs mt-0.5">
                Executive oversight of all pupils in {currentSchool?.name || 'the school'} across all grades.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
            {students.length} Total Enrolled Pupils
          </span>
        </div>
      )}

      {isFinance && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Finance Department Register View</span>
              <p className="text-slate-500 text-xs mt-0.5">
                Classroom teachers mark registers. The Finance Department manages student fee balances and invoice payments.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' ? (
        <>
          {/* Controls Bar: Date Selector & Cohort Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Date Navigator */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeDate(-1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => changeDate(1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate('2026-09-10')}
                className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              >
                Today
              </button>
            </div>

            {/* Cohort Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">
                {isTeacher ? 'Class:' : 'Grade:'}
              </span>
              {isTeacher ? (
                <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-800">
                  {assignedClass || 'Grade 10-A'} (Assigned in Charge)
                </div>
              ) : (
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  {['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                    <button
                      key={g}
                      id={`att-grade-${g.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedGrade(g)}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        selectedGrade === g
                          ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Bulk Action & Download Summary */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="open-summary-sheet-btn"
                onClick={() => setIsSummaryModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold shadow-2xs transition-colors"
                title="Download custom attendance summary & emergency muster roll"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Download Summary...</span>
              </button>

              <button
                id="mark-all-present-btn"
                onClick={handleMarkAllPresent}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Attendance Rate</span>
              <span className="text-xl font-bold text-slate-900 mt-1 block">{counts.rate}%</span>
            </div>
            <div className="bg-emerald-50/70 rounded-xl border border-emerald-200 p-3.5">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Present</span>
              <span className="text-xl font-bold text-emerald-900 mt-1 block">{counts.present}</span>
            </div>
            <div className="bg-amber-50/70 rounded-xl border border-amber-200 p-3.5">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Late / Tardy</span>
              <span className="text-xl font-bold text-amber-900 mt-1 block">{counts.late}</span>
            </div>
            <div className="bg-rose-50/70 rounded-xl border border-rose-200 p-3.5">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">Absent</span>
              <span className="text-xl font-bold text-rose-900 mt-1 block">{counts.absent}</span>
            </div>
            <div className="bg-blue-50/70 rounded-xl border border-blue-200 p-3.5">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">Excused</span>
              <span className="text-xl font-bold text-blue-900 mt-1 block">{counts.excused}</span>
            </div>
          </div>

          {/* Attendance Roll Call Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student list..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Roll Call Date: <strong>{selectedDate}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-3 py-3.5">Roll No</th>
                    <th className="px-3 py-3.5">Status Selection</th>
                    <th className="px-3 py-3.5">Time Recorded</th>
                    <th className="px-3.5 py-3.5">Whereabouts & Emergency Location</th>
                    <th className="px-3 py-3.5">Remarks / Reason</th>
                    <th className="px-4 py-3.5 text-right">Parent Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.map((student) => {
                    const entry = currentDayEntries.find((e) => e.studentId === student.id);
                    const status: AttendanceStatus = entry?.status || 'present';
                    const timeIn = entry?.timeIn || (status === 'present' ? '07:55 AM' : undefined);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Student Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={student.avatar}
                              alt={student.firstName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {student.grade} • Guardian: {student.guardian.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Roll Number */}
                        <td className="px-3 py-3 font-mono font-medium text-slate-700">
                          {student.rollNumber}
                        </td>

                        {/* Status Toggle Buttons */}
                        <td className="px-3 py-3">
                          <div className="flex items-center space-x-1">
                            <button
                              id={`att-status-present-${student.id}`}
                              onClick={() => markAttendance(student.id, selectedDate, 'present')}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              id={`att-status-late-${student.id}`}
                              onClick={() => markAttendance(student.id, selectedDate, 'late', 'Tardy arrival')}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                status === 'late'
                                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              id={`att-status-absent-${student.id}`}
                              onClick={() => markAttendance(student.id, selectedDate, 'absent', 'Unexcused absence')}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              id={`att-status-excused-${student.id}`}
                              onClick={() => markAttendance(student.id, selectedDate, 'excused', 'Approved school excuse')}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                status === 'excused'
                                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>

                        {/* Time in */}
                        <td className="px-3 py-3 text-slate-600 font-mono text-[11px]">
                          {timeIn || '—'}
                        </td>

                        {/* Whereabouts & Emergency Location (Vital for Roll Call & Emergency Safety) */}
                        <td className="px-3.5 py-3 max-w-[210px]">
                          {status === 'absent' ? (
                            <div className="space-y-1">
                              <div className="flex items-start space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[11px] font-bold text-rose-900 block leading-tight">
                                    {entry?.whereabouts || 'Parent Verification Pending'}
                                  </span>
                                  {entry?.emergencyNotes && (
                                    <span className="text-[10px] text-rose-700 block mt-0.5 font-medium">
                                      ⚠️ {entry.emergencyNotes}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                <span>{student.guardian.name}: </span>
                                <a href={`tel:${student.guardian.phone}`} className="text-indigo-600 font-mono font-bold hover:underline">
                                  {student.guardian.phone}
                                </a>
                              </div>
                            </div>
                          ) : status === 'late' ? (
                            <div className="space-y-1">
                              <div className="flex items-start space-x-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-[11px] font-bold text-amber-900 block leading-tight">
                                    {entry?.whereabouts || 'Arrived on Campus (Tardy)'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                <span>In: {timeIn || '08:20 AM'}</span>
                              </div>
                            </div>
                          ) : status === 'excused' ? (
                            <div className="flex items-start space-x-1.5 text-[11px] font-medium text-blue-800">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span>{entry?.whereabouts || 'Excused School Absence'}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mr-0.5" />
                              <span>On Campus (Present & Safe)</span>
                            </span>
                          )}
                        </td>

                        {/* Notes / Remarks */}
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            placeholder="Add reason/note..."
                            value={entry?.notes || ''}
                            onChange={(e) => markAttendance(student.id, selectedDate, status, e.target.value)}
                            className="w-full max-w-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-800 placeholder:text-slate-400 focus:bg-white"
                          />
                        </td>

                        {/* Parent Alert Action */}
                        <td className="px-4 py-3 text-right">
                          {(status === 'absent' || status === 'late') && (
                            <button
                              id={`notify-parent-roll-${student.id}`}
                              onClick={() => {
                                sendAutomatedNoticeToParent(student.id, 'attendance_alert');
                                setToastNotice(`Absence notification dispatched to ${student.guardian.name} (${student.guardian.phone})!`);
                                setTimeout(() => setToastNotice(null), 5000);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 transition-colors"
                              title="Send instant notification to parent's messaging dashboard"
                            >
                              <Send className="w-3 h-3" />
                              <span>Notify Parent</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Historical Attendance Trends & Analytics */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Attendance History</h2>
              <p className="text-xs text-slate-500">Historical roll call logs and monthly consistency rates.</p>
            </div>

            {/* Student Picker for History */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Select Student:</span>
              <select
                value={selectedStudentHistoryId}
                onChange={(e) => setSelectedStudentHistoryId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.grade} - {s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Student Stats */}
          {(() => {
            const currentStudent = students.find((s) => s.id === selectedStudentHistoryId);
            if (!currentStudent) return null;
            const studentEntries = attendance.filter((a) => a.studentId === selectedStudentHistoryId);
            const rate = getStudentAttendanceRate(selectedStudentHistoryId);

            return (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.firstName}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-indigo-100"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {currentStudent.firstName} {currentStudent.lastName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Admission: {currentStudent.admissionNo} • Class: {currentStudent.grade} ({currentStudent.section}) • Roll: {currentStudent.rollNumber}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Parent: {currentStudent.guardian.name} ({currentStudent.guardian.relation}) • Phone: {currentStudent.guardian.phone}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-xs text-slate-500 block">Overall Term Rate</span>
                    <span className="text-2xl font-black text-indigo-700 font-mono">{rate}%</span>
                  </div>
                </div>

                {/* Day-by-Day Historical Log Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Date</th>
                        <th className="px-4 py-2.5 text-left">Status</th>
                        <th className="px-4 py-2.5 text-left">Time In</th>
                        <th className="px-4 py-2.5 text-left">Notes / Justification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {historyDates.map((date) => {
                        const rec = studentEntries.find((e) => e.date === date);
                        const status = rec?.status || 'present';
                        return (
                          <tr key={date} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-800">{date}</td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                                  status === 'present'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : status === 'late'
                                    ? 'bg-amber-100 text-amber-800'
                                    : status === 'excused'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-600">{rec?.timeIn || '—'}</td>
                            <td className="px-4 py-2.5 text-slate-500 italic">{rec?.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Attendance & Emergency Whereabouts Summary Modal */}
      <AttendanceSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        targetClass={assignedClass || (isTeacher ? assignedClass : selectedGrade !== 'All' ? selectedGrade : 'Grade 10-A')}
        defaultStudents={baseStudents}
      />
    </div>
  );
};
