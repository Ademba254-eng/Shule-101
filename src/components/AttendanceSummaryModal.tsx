import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserX,
  Phone,
  ShieldAlert,
  Search,
  Filter,
  MapPin,
  Edit2,
  Check,
  Send,
  Info,
  Sparkles,
} from 'lucide-react';
import { Student, DailyAttendanceEntry, AttendanceStatus } from '../types';
import { useSchool } from '../context/SchoolContext';
import { generateAndDownloadAttendanceSummaryPDF } from '../utils/pdfExport';
import { downloadAttendanceSummaryCSV } from '../utils/csvExport';

interface AttendanceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetClass?: string;
  defaultStudents?: Student[];
}

export type SummaryDurationType =
  | 'today'
  | 'yesterday'
  | '7days'
  | '14days'
  | 'thisMonth'
  | '30days'
  | 'term'
  | 'custom';

export const AttendanceSummaryModal: React.FC<AttendanceSummaryModalProps> = ({
  isOpen,
  onClose,
  targetClass,
  defaultStudents,
}) => {
  const {
    students: allStudents,
    accessibleStudents,
    currentUser,
    currentSchool,
    attendance,
    selectedDate: currentSelectedDate,
    assignedClass,
    activeDivision,
    updateAttendanceWhereabouts,
    sendAutomatedNoticeToParent,
  } = useSchool();

  // Determine scoped class & students
  const isTeacher = activeDivision === 'teacher';
  const effectiveClass = targetClass || assignedClass || 'Grade 10-A';
  const baseStudents = useMemo(() => {
    if (defaultStudents && defaultStudents.length > 0) return defaultStudents;
    if (isTeacher) return accessibleStudents;
    // If not teacher, filter by targetClass if provided
    return allStudents.filter((s) => s.grade + '-' + s.section === effectiveClass || s.grade === effectiveClass);
  }, [defaultStudents, isTeacher, accessibleStudents, allStudents, effectiveClass]);

  // Duration State
  const [duration, setDuration] = useState<SummaryDurationType>('7days');
  const [customStartDate, setCustomStartDate] = useState('2026-09-04');
  const [customEndDate, setCustomEndDate] = useState(currentSelectedDate || '2026-09-10');

  // Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'absent_late' | 'absent_only' | 'late_only'>('absent_late');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Whereabouts inline state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editWhereaboutsText, setEditWhereaboutsText] = useState('');
  const [editEmergencyNotes, setEditEmergencyNotes] = useState('');
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Compute Active Date Range
  const { startDate, endDate, dateRangeLabel, dateList } = useMemo(() => {
    const today = currentSelectedDate || '2026-09-10';
    const todayDate = new Date(today);

    let start = today;
    let end = today;
    let label = 'Today (Emergency Roll Call)';

    if (duration === 'today') {
      start = today;
      end = today;
      label = `Today (${today})`;
    } else if (duration === 'yesterday') {
      const prev = new Date(todayDate);
      prev.setDate(prev.getDate() - 1);
      start = prev.toISOString().split('T')[0];
      end = start;
      label = `Yesterday (${start})`;
    } else if (duration === '7days') {
      const prev = new Date(todayDate);
      prev.setDate(prev.getDate() - 6);
      start = prev.toISOString().split('T')[0];
      end = today;
      label = 'Last 7 Days (Past Week)';
    } else if (duration === '14days') {
      const prev = new Date(todayDate);
      prev.setDate(prev.getDate() - 13);
      start = prev.toISOString().split('T')[0];
      end = today;
      label = 'Last 14 Days (Past 2 Weeks)';
    } else if (duration === 'thisMonth') {
      start = `${today.slice(0, 7)}-01`;
      end = today;
      label = 'This Month (Month-to-Date)';
    } else if (duration === '30days') {
      const prev = new Date(todayDate);
      prev.setDate(prev.getDate() - 29);
      start = prev.toISOString().split('T')[0];
      end = today;
      label = 'Past 30 Days';
    } else if (duration === 'term') {
      start = '2026-08-15';
      end = today;
      label = 'Current Term (Term 2 to Date)';
    } else if (duration === 'custom') {
      start = customStartDate;
      end = customEndDate;
      label = `Custom Period (${customStartDate} to ${customEndDate})`;
    }

    // Build array of dates in range (chronological ascending)
    const dates: string[] = [];
    const cur = new Date(start);
    const stop = new Date(end);
    while (cur <= stop) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    return {
      startDate: start,
      endDate: end,
      dateRangeLabel: label,
      dateList: dates,
    };
  }, [duration, customStartDate, customEndDate, currentSelectedDate]);

  // Flattened entries: for each date in dateList, for each student in baseStudents
  const allPeriodEntries = useMemo(() => {
    const list: Array<{
      date: string;
      student: Student;
      record: DailyAttendanceEntry | undefined;
    }> = [];

    // Reverse date list so newest dates are shown first
    const sortedDates = [...dateList].reverse();

    sortedDates.forEach((date) => {
      baseStudents.forEach((student) => {
        const record = attendance.find((a) => a.studentId === student.id && a.date === date);
        list.push({ date, student, record });
      });
    });

    return list;
  }, [dateList, baseStudents, attendance]);

  // Filter entries based on filterMode & search query
  const filteredEntries = useMemo(() => {
    return allPeriodEntries.filter((item) => {
      const status: AttendanceStatus = item.record?.status || 'present';

      if (filterMode === 'absent_late' && status !== 'absent' && status !== 'late') {
        return false;
      }
      if (filterMode === 'absent_only' && status !== 'absent') {
        return false;
      }
      if (filterMode === 'late_only' && status !== 'late') {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullName = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
        const roll = item.student.rollNumber.toLowerCase();
        const where = (item.record?.whereabouts || '').toLowerCase();
        const guardian = item.student.guardian.name.toLowerCase();
        const phone = item.student.guardian.phone.toLowerCase();

        return (
          fullName.includes(query) ||
          roll.includes(query) ||
          where.includes(query) ||
          guardian.includes(query) ||
          phone.includes(query) ||
          item.date.includes(query)
        );
      }

      return true;
    });
  }, [allPeriodEntries, filterMode, searchQuery]);

  // Overall Statistics for this period
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    allPeriodEntries.forEach((item) => {
      const status: AttendanceStatus = item.record?.status || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    const total = allPeriodEntries.length;
    const rate = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 100;

    return { total, present, absent, late, excused, rate };
  }, [allPeriodEntries]);

  if (!isOpen) return null;

  // Handle Whereabouts inline update
  const handleStartEdit = (entryKey: string, currentWhereabouts?: string, currentNotes?: string) => {
    setEditingKey(entryKey);
    setEditWhereaboutsText(currentWhereabouts || '');
    setEditEmergencyNotes(currentNotes || '');
  };

  const handleSaveEdit = (studentId: string, date: string) => {
    updateAttendanceWhereabouts(
      studentId,
      date,
      editWhereaboutsText.trim() || 'Parent Verification Pending',
      editEmergencyNotes.trim() || undefined,
      `Class Teacher (${currentUser?.name || 'In-Charge'})`
    );
    setEditingKey(null);
  };

  // Quick Preset tags for whereabouts
  const WHEREABOUTS_PRESETS = [
    { label: '🏠 Home (Sick / Flu)', value: 'Home (Sick - Parent Confirmed)' },
    { label: '🏥 Hospital / Clinic', value: 'Hospital / Pediatric Clinic Appointment' },
    { label: '🚌 Bus Delayed', value: 'School Transport / Bus Breakdown' },
    { label: '🚗 Traffic snarl', value: 'Traffic commute delay on Highway' },
    { label: '⚽ School Trip', value: 'Official School Athletics / Field Trip' },
    { label: '⚕️ Nurse Infirmary', value: 'School Infirmary (Sick Bay Observation)' },
    { label: '❓ Unconfirmed', value: 'Unverified - Whereabouts Unknown (EMERGENCY)' },
  ];

  // PDF Export
  const handleDownloadPDF = () => {
    generateAndDownloadAttendanceSummaryPDF({
      schoolName: currentSchool?.name || 'EduPulse Academy',
      className: effectiveClass,
      teacherName: currentUser?.name || 'Class Teacher',
      dateRangeLabel,
      startDate,
      endDate,
      entries: filteredEntries,
      totalPresent: stats.present,
      totalAbsent: stats.absent,
      totalLate: stats.late,
      totalExcused: stats.excused,
      attendanceRate: stats.rate,
      emergencyFilterActive: filterMode !== 'all',
    });

    setDownloadSuccessNotice(
      `Official Attendance & Emergency Whereabouts Summary PDF downloaded successfully (< 2MB)!`
    );
    setTimeout(() => setDownloadSuccessNotice(null), 6000);
  };

  // CSV Export
  const handleDownloadCSV = () => {
    downloadAttendanceSummaryCSV({
      schoolName: currentSchool?.name || 'EduPulse Academy',
      className: effectiveClass,
      teacherName: currentUser?.name || 'Class Teacher',
      dateRangeLabel,
      startDate,
      endDate,
      entries: filteredEntries,
    });

    setDownloadSuccessNotice(`Attendance Summary CSV exported successfully!`);
    setTimeout(() => setDownloadSuccessNotice(null), 5000);
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Emergency Warning Theme */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Student Attendance & Emergency Whereabouts Summary
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Emergency Safety Roster
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Classroom roll-call records with clear whereabouts for absent or tardy students, arrival timestamps, and verified emergency guardian contacts — instantly available for drills, emergencies, and administrative audits.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                <span>
                  Class: <strong className="text-white">{effectiveClass}</strong>
                </span>
                <span>•</span>
                <span>
                  In-Charge: <strong className="text-white">{currentUser?.name || 'Class Teacher'}</strong>
                </span>
                <span>•</span>
                <span>
                  Enrolled Pupils: <strong className="text-white">{baseStudents.length} Students</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {downloadSuccessNotice && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 flex items-center justify-between font-semibold">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{downloadSuccessNotice}</span>
            </div>
            <button
              onClick={() => setDownloadSuccessNotice(null)}
              className="text-emerald-100 hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-4">
          {/* Duration Selector ("the teacher should be able to choose for how long he wants the summary") */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Choose Summary Duration / Period:</span>
              </label>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                Active: {dateRangeLabel} ({startDate} to {endDate})
              </span>
            </div>

            {/* Duration Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'today', label: '📌 Today (Emergency Roll)' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: 'Last 7 Days (Past Week)' },
                { id: '14days', label: 'Last 14 Days' },
                { id: 'thisMonth', label: 'This Month' },
                { id: '30days', label: 'Past 30 Days' },
                { id: 'term', label: 'Term 2 (Term-to-Date)' },
                { id: 'custom', label: '⚙️ Custom Range...' },
              ].map((p) => (
                <button
                  key={p.id}
                  id={`duration-btn-${p.id}`}
                  onClick={() => setDuration(p.id as SummaryDurationType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    duration === p.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs if Custom is selected */}
            {duration === 'custom' && (
              <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Start Date:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">End Date:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[11px] text-slate-500 italic">
                  Showing all daily muster entries between {customStartDate} and {customEndDate}.
                </span>
              </div>
            )}
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Logs
              </span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{stats.total} entries</span>
            </div>
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Present on Campus
                </span>
                <span className="text-[10px] font-bold text-emerald-600">{stats.rate}%</span>
              </div>
              <span className="text-lg font-bold text-emerald-900 mt-0.5 block">{stats.present}</span>
            </div>
            <div className="bg-rose-50/90 p-3 rounded-xl border border-rose-300 shadow-2xs">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Absent Pupils
              </span>
              <span className="text-lg font-bold text-rose-900 mt-0.5 block flex items-center space-x-1">
                <span>{stats.absent}</span>
                <span className="text-[10px] text-rose-600 font-semibold">(Whereabouts stated)</span>
              </span>
            </div>
            <div className="bg-amber-50/90 p-3 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Late / Tardy Arrivals
              </span>
              <span className="text-lg font-bold text-amber-900 mt-0.5 block">{stats.late}</span>
            </div>
            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Excused Leaves
              </span>
              <span className="text-lg font-bold text-blue-900 mt-0.5 block">{stats.excused}</span>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Filter Toggle */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Show:</span>
              </span>
              <button
                onClick={() => setFilterMode('absent_late')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'absent_late'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🚨 Absent & Late Only ({stats.absent + stats.late})
              </button>
              <button
                onClick={() => setFilterMode('absent_only')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'absent_only'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Absentees Only ({stats.absent})
              </button>
              <button
                onClick={() => setFilterMode('late_only')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'late_only'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Late Arrivals Only ({stats.late})
              </button>
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                All Students ({allPeriodEntries.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student, whereabouts, parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area: Table of Whereabouts & Attendance Records */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">
                {filterMode === 'absent_late'
                  ? 'No Absences or Tardiness in this Period!'
                  : 'No Records Found Matching Filters'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {filterMode === 'absent_late'
                  ? 'All students in this class were present and safely accounted for during this timeframe.'
                  : 'Try selecting a different date range or resetting search filters.'}
              </p>
              {filterMode !== 'all' && (
                <button
                  onClick={() => setFilterMode('all')}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
                >
                  View Full Class Roster
                </button>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3.5 py-3">Date</th>
                    <th className="px-3.5 py-3">Student</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Time</th>
                    <th className="px-3.5 py-3">Whereabouts / Location</th>
                    <th className="px-3.5 py-3">Emergency Contact & Phone</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map(({ date, student, record }) => {
                    const status: AttendanceStatus = record?.status || 'present';
                    const timeIn = record?.timeIn || (status === 'present' ? '07:55 AM' : '—');
                    const whereabouts =
                      record?.whereabouts ||
                      (status === 'present'
                        ? 'On Campus / Classroom (Present & Safe)'
                        : status === 'absent'
                        ? 'Home / Parent Verification Pending'
                        : status === 'late'
                        ? 'Arrived on Campus (Tardy)'
                        : 'Excused Leave');
                    const notes = record?.notes;
                    const emergencyNotes = record?.emergencyNotes;
                    const reportedBy = record?.reportedBy;
                    const entryKey = `${student.id}-${date}`;
                    const isEditing = editingKey === entryKey;

                    return (
                      <tr
                        key={entryKey}
                        className={`transition-colors ${
                          status === 'absent'
                            ? 'bg-rose-50/40 hover:bg-rose-50/70'
                            : status === 'late'
                            ? 'bg-amber-50/40 hover:bg-amber-50/70'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Date */}
                        <td className="px-3.5 py-3 font-medium text-slate-800 whitespace-nowrap align-top">
                          <div className="font-bold text-slate-900">{date}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </td>

                        {/* Student */}
                        <td className="px-3.5 py-3 align-top">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={student.avatar}
                              alt={student.firstName}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 leading-tight">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Roll: {student.rollNumber} • {student.grade}-{student.section}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide ${
                              status === 'present'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : status === 'absent'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : status === 'late'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}
                          >
                            {status === 'absent' && <UserX className="w-3 h-3 mr-0.5" />}
                            {status === 'late' && <Clock className="w-3 h-3 mr-0.5" />}
                            {status === 'present' && <CheckCircle2 className="w-3 h-3 mr-0.5" />}
                            <span>{status}</span>
                          </span>
                        </td>

                        {/* Time In */}
                        <td className="px-3 py-3 align-top font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {timeIn}
                        </td>

                        {/* Whereabouts / Location (Crucial Emergency Column) */}
                        <td className="px-3.5 py-3 align-top max-w-xs">
                          {isEditing ? (
                            <div className="space-y-2 bg-indigo-50/70 p-2 rounded-lg border border-indigo-200">
                              <span className="text-[10px] font-bold text-indigo-900 block">
                                Update Student Whereabouts:
                              </span>
                              <input
                                type="text"
                                value={editWhereaboutsText}
                                onChange={(e) => setEditWhereaboutsText(e.target.value)}
                                placeholder="State current location/whereabouts..."
                                className="w-full px-2 py-1 bg-white border border-indigo-300 rounded text-xs text-slate-900 focus:outline-hidden"
                              />

                              {/* Quick Presets */}
                              <div className="flex flex-wrap gap-1">
                                {WHEREABOUTS_PRESETS.map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => setEditWhereaboutsText(p.value)}
                                    className="px-1.5 py-0.5 bg-white text-[10px] text-slate-700 hover:bg-indigo-100 rounded border border-slate-200 font-medium"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>

                              <input
                                type="text"
                                value={editEmergencyNotes}
                                onChange={(e) => setEditEmergencyNotes(e.target.value)}
                                placeholder="Emergency note (e.g. Doctor contact, Parent home)"
                                className="w-full px-2 py-1 bg-white border border-indigo-300 rounded text-xs text-slate-900 focus:outline-hidden"
                              />

                              <div className="flex items-center space-x-1.5 pt-1">
                                <button
                                  onClick={() => handleSaveEdit(student.id, date)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold inline-flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Save Whereabouts</span>
                                </button>
                                <button
                                  onClick={() => setEditingKey(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <span
                                  className={`font-semibold text-xs flex items-center space-x-1 ${
                                    status === 'absent'
                                      ? 'text-rose-900 font-bold'
                                      : status === 'late'
                                      ? 'text-amber-900 font-bold'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                  <span>{whereabouts}</span>
                                </span>

                                <button
                                  onClick={() => handleStartEdit(entryKey, whereabouts, emergencyNotes)}
                                  className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100"
                                  title="Edit whereabouts & emergency notes"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>

                              {(emergencyNotes || notes || reportedBy) && (
                                <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                                  {emergencyNotes && (
                                    <div className="text-rose-700 font-medium">
                                      ⚠️ Safety Note: {emergencyNotes}
                                    </div>
                                  )}
                                  {notes && !emergencyNotes && <div>Reason: {notes}</div>}
                                  {reportedBy && <div className="text-slate-400">Reported by: {reportedBy}</div>}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Emergency Contact & Phone */}
                        <td className="px-3.5 py-3 align-top whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {student.guardian.name}{' '}
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({student.guardian.relation})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <a
                              href={`tel:${student.guardian.phone}`}
                              className="font-bold text-indigo-600 hover:text-indigo-800 font-mono text-[11px] flex items-center space-x-1"
                              title="Call Guardian in an emergency"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{student.guardian.phone}</span>
                            </a>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {student.guardian.address}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3 align-top text-right whitespace-nowrap">
                          {(status === 'absent' || status === 'late') && (
                            <button
                              onClick={() => {
                                sendAutomatedNoticeToParent(student.id, 'attendance_alert');
                                setDownloadSuccessNotice(
                                  `Emergency notice sent to ${student.guardian.name} (${student.guardian.phone})!`
                                );
                                setTimeout(() => setDownloadSuccessNotice(null), 5000);
                              }}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md text-[11px] font-bold border border-rose-200 transition-colors"
                              title="Send instant emergency notification to guardian"
                            >
                              <Send className="w-2.5 h-2.5" />
                              <span>Alert Parent</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer with Download & Export Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>
              All generated PDF reports comply with standard safety manifest protocols and are compressed strictly under 2MB for immediate mobile sharing.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs inline-flex items-center space-x-1.5 transition-colors"
              title="Print emergency muster roll sheet"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Sheet</span>
            </button>

            <button
              id="export-csv-summary-btn"
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs inline-flex items-center space-x-1.5 transition-colors"
              title="Export formatted CSV spreadsheet for roll call"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              id="download-summary-pdf-btn"
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-2 transition-all hover:shadow-md"
              title="Download official PDF report with whereabouts and emergency contacts"
            >
              <Download className="w-4 h-4" />
              <span>Download Summary (PDF • &lt; 2MB)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
