import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  Search,
  Plus,
  LayoutGrid,
  List,
  Award,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  MoreVertical,
} from 'lucide-react';
import { Student } from '../types';
import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import { getTeacherForGradeAndSection } from '../utils/teacherAssignment';

interface StudentDirectoryViewProps {
  onOpenAddStudent: () => void;
  onOpenStudentDetail: (studentId: string) => void;
  onOpenReportCard: (studentId: string) => void;
  onNavigateToMessaging: () => void;
}

export const StudentDirectoryView: React.FC<StudentDirectoryViewProps> = ({
  onOpenAddStudent,
  onOpenStudentDetail,
  onOpenReportCard,
  onNavigateToMessaging,
}) => {
  const {
    students,
    accessibleStudents,
    activeDivision,
    assignedClass,
    currentSchool,
    academicRecords,
    invoices,
    selectedGrade,
    setSelectedGrade,
    getStudentAttendanceRate,
  } = useSchool();

  const isTeacher = activeDivision === 'teacher';
  const isPrincipal = activeDivision === 'principal';
  const isFinance = activeDivision === 'finance';

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter students: Teachers can ONLY see pupils from their assigned class
  const filteredStudents = useMemo(() => {
    const studentPool = isTeacher ? accessibleStudents : students;

    return studentPool.filter((s) => {
      const matchesGrade = isTeacher || selectedGrade === 'All' || s.grade === selectedGrade;
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.guardian.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesGrade && matchesSearch;
    });
  }, [students, accessibleStudents, isTeacher, selectedGrade, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Student Information Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized student registry, guardian contacts, and holistic academic profiles.
          </p>
        </div>

        <button
          id="dir-enroll-student-btn"
          onClick={onOpenAddStudent}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Division Context Banner */}
      {isPrincipal && (
        <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  Principal / Headmaster Pupil Directory
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                  All School Pupils ({students.length})
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Institutional registry for <strong>{currentSchool?.name || 'the school'}</strong>: Comprehensive oversight of all enrolled learners across all classes and streams.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-purple-200 flex-shrink-0">
            {filteredStudents.length} Students Listed
          </span>
        </div>
      )}

      {isTeacher && (
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  Class Teacher Student Roster
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
                  Assigned: {assignedClass || 'Grade 10-A'}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Restricted scope: You have permission to view and manage students from <strong>{assignedClass || 'Grade 10-A'}</strong>.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 flex-shrink-0">
            🔒 {filteredStudents.length} Pupils in Your Class
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
              <span className="font-bold text-slate-900 text-sm">
                Finance Bursar Student Records
              </span>
              <p className="text-slate-500 text-xs mt-0.5">
                School-wide student profiles with fee ledger status and billing balances.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
            {students.length} Billing Profiles
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, roll number, or parent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Grade Selector (locked to assigned class for teachers) */}
          {isTeacher ? (
            <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800 flex items-center space-x-1.5">
              <span>Class: {assignedClass || 'Grade 10-A'}</span>
              <span className="text-[10px] text-indigo-500">(Your Class)</span>
            </div>
          ) : (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                <button
                  key={g}
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

          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-600">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-2xs' : 'hover:text-slate-900'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-indigo-700 shadow-2xs' : 'hover:text-slate-900'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const academic = academicRecords.find((r) => r.studentId === student.id);
            const invoice = invoices.find((i) => i.studentId === student.id);
            const attendanceRate = getStudentAttendanceRate(student.id);
            const gpa = academic?.overallGpa || 3.4;
            const teacher = student.assignedTeacher || getTeacherForGradeAndSection(student.grade, student.section);

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student.avatar}
                        alt={student.firstName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          {student.rollNumber} • {student.grade} ({student.section})
                        </p>
                        <p className="text-[11px] text-slate-400">{student.admissionNo}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        gpa >= 3.8
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      GPA {gpa.toFixed(2)}
                    </span>
                  </div>

                  {/* Teacher & Guardian snapshot */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {student.guardian.name} ({student.guardian.relation})
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Portal Active
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      {student.guardian.email}
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Class Teacher:</span>
                      <span className="font-bold text-indigo-700 truncate">{teacher.name}</span>
                    </div>
                  </div>

                  {/* Mini Stats Row */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-400 block">Attendance</span>
                      <span className="font-bold text-slate-900">{attendanceRate}%</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase text-slate-400 block">Fee Balance</span>
                      <span className={`font-bold ${(invoice?.balance || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        KSh {(invoice?.balance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenStudentDetail(student.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    360° Profile →
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenReportCard(student.id)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Report Card"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onNavigateToMessaging}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Message Parent"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-3 py-3.5">Admission & Roll</th>
                  <th className="px-3 py-3.5">Cohort</th>
                  <th className="px-3 py-3.5">Primary Guardian</th>
                  <th className="px-3 py-3.5 text-center">GPA</th>
                  <th className="px-3 py-3.5 text-center">Attendance</th>
                  <th className="px-3 py-3.5 text-right">Fee Balance</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((student) => {
                  const academic = academicRecords.find((r) => r.studentId === student.id);
                  const invoice = invoices.find((i) => i.studentId === student.id);
                  const rate = getStudentAttendanceRate(student.id);
                  const teacher = student.assignedTeacher || getTeacherForGradeAndSection(student.grade, student.section);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar}
                            alt={student.firstName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div className="font-bold text-slate-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-slate-600">
                        {student.rollNumber} ({student.admissionNo})
                      </td>
                      <td className="px-3 py-3 text-slate-700 font-medium">
                        <div>{student.grade} (Sec {student.section})</div>
                        <div className="text-[10px] text-indigo-600 font-semibold">{teacher.name}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-semibold text-slate-800 block">{student.guardian.name}</span>
                        <span className="block text-[11px] text-emerald-700 font-mono">{student.guardian.email}</span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-900">
                        {academic?.overallGpa.toFixed(2) || '3.40'}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-slate-800">
                        {rate}%
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">
                        KSh {(invoice?.balance || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenStudentDetail(student.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-semibold text-xs transition-colors"
                        >
                          View 360°
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
