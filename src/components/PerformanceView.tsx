import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Award,
  Search,
  Filter,
  FileText,
  Edit3,
  TrendingUp,
  GraduationCap,
  Send,
  Check,
  ChevronRight,
  BookOpen,
  CreditCard,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { ReportCardModal } from './ReportCardModal';
import { SubjectAssessment } from '../types';

interface PerformanceViewProps {
  onOpenReportCard: (studentId: string) => void;
  selectedReportCardStudentId?: string | null;
  onCloseReportCard?: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  onOpenReportCard,
  selectedReportCardStudentId = null,
  onCloseReportCard = () => {},
}) => {
  const {
    students,
    accessibleStudents,
    activeDivision,
    assignedClass,
    currentUser,
    currentSchool,
    academicRecords,
    selectedGrade,
    setSelectedGrade,
    updateAcademicGrade,
    sendAutomatedNoticeToParent,
  } = useSchool();

  const isTeacher = activeDivision === 'teacher';
  const isPrincipal = activeDivision === 'principal';
  const isFinance = activeDivision === 'finance';

  // Base list of students depending on division scoping
  const baseStudents = isTeacher ? accessibleStudents : students;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string>('sub-math');
  const [editScores, setEditScores] = useState<SubjectAssessment>({
    test1: 18,
    test2: 18,
    midterm: 26,
    finalExam: 27,
    assignment: 8,
  });
  const [editRemarks, setEditRemarks] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Filter students based on grade & search query
  const filteredStudents = useMemo(() => {
    return baseStudents.filter((s) => {
      const matchesGrade = isTeacher || selectedGrade === 'All' || s.grade === selectedGrade;
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGrade && matchesSearch;
    });
  }, [baseStudents, isTeacher, selectedGrade, searchQuery]);

  // Handle open quick edit
  const handleOpenEdit = (studentId: string, subjectId = 'sub-math') => {
    const record = academicRecords.find((r) => r.studentId === studentId);
    if (!record) return;

    const subject = record.subjects.find((sub) => sub.subjectId === subjectId) || record.subjects[0];
    if (!subject) return;

    setEditingStudentId(studentId);
    setEditingSubjectId(subject.subjectId);
    setEditScores({ ...subject.scores });
    setEditRemarks(subject.remarks);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentId) return;

    updateAcademicGrade(editingStudentId, editingSubjectId, editScores, editRemarks);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      setSaveSuccessNotice(false);
      setEditingStudentId(null);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <span>Academic Performance & Gradebook</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous assessment tracking, GPA calculations, and parent-accessible academic reports.
          </p>
        </div>

        {/* Grade Level Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">
            {isTeacher ? 'Class:' : 'Cohort:'}
          </span>
          {isTeacher ? (
            <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-800">
              {assignedClass || 'Grade 10-A'} (Assigned in Charge)
            </div>
          ) : (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((g) => (
                <button
                  key={g}
                  id={`perf-grade-${g.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
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
      </div>

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
                  Class Teacher Gradebook: {assignedClass || 'Grade 10-A'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Edit Performance Enabled
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                In charge: <strong>{currentUser?.name || 'Class Teacher'}</strong> • You can edit tests, midterms, final exam scores, and teacher remarks for {baseStudents.length} assigned pupils.
              </p>
            </div>
          </div>
          <div className="text-xs text-indigo-700 font-semibold bg-white px-3 py-1.5 rounded-lg border border-indigo-200 flex-shrink-0">
            🔒 {assignedClass || 'Grade 10-A'} Pupils Only
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
                Principal / Headmaster Academic Oversight
              </span>
              <p className="text-slate-500 text-xs mt-0.5">
                Executive oversight: Reviewing academic performance and report cards for all {students.length} pupils in {currentSchool?.name || 'the school'}.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
            All Pupils Visible ({students.length})
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
              <span className="font-bold text-slate-900 text-sm">Finance Department Overview</span>
              <p className="text-slate-500 text-xs mt-0.5">
                Academic assessments are updated by teaching staff. Finance can edit fee structures and student fee balances under Student Fees.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="perf-search-input"
            type="text"
            placeholder="Search by student name, roll no, or admission ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span>Showing {filteredStudents.length} Students</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          <span>Term 2 Assessment Cycle</span>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-3 py-3.5">Class & Roll</th>
                <th className="px-3 py-3.5">Term GPA</th>
                <th className="px-3 py-3.5">Core Subject Grades</th>
                <th className="px-3 py-3.5 text-center">Class Rank</th>
                <th className="px-3 py-3.5 text-center">Attendance</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.map((student) => {
                const record = academicRecords.find((r) => r.studentId === student.id);
                const gpa = record ? record.overallGpa : 3.4;
                const subjects = record?.subjects || [];

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Profile */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.avatar}
                          alt={student.firstName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {student.admissionNo} • Guardian: {student.guardian.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Class & Roll */}
                    <td className="px-3 py-3.5">
                      <span className="font-semibold text-slate-800">{student.grade}</span>
                      <span className="block text-slate-500 font-mono text-[11px]">Roll: {student.rollNumber}</span>
                    </td>

                    {/* GPA */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">{gpa.toFixed(2)}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            gpa >= 3.8
                              ? 'bg-emerald-100 text-emerald-800'
                              : gpa >= 3.3
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {gpa >= 3.8 ? 'A+' : gpa >= 3.3 ? 'A / B+' : 'B / C'}
                        </span>
                      </div>
                    </td>

                    {/* Subject Pills */}
                    <td className="px-3 py-3.5">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {subjects.slice(0, 4).map((sub) => (
                          <button
                            key={sub.subjectId}
                            onClick={() => handleOpenEdit(student.id, sub.subjectId)}
                            title={`Click to edit ${sub.subjectName} scores (Current: ${sub.totalScore}%)`}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-[11px] text-slate-700 transition-colors"
                          >
                            <span className="font-medium truncate max-w-[80px]">
                              {sub.subjectName.split(' ')[0]}
                            </span>
                            <span className="font-bold text-indigo-600">{sub.letterGrade}</span>
                            <span className="text-[10px] text-slate-400">({sub.totalScore}%)</span>
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Class Rank */}
                    <td className="px-3 py-3.5 text-center">
                      <span className="font-mono font-bold text-slate-900">#{record?.rank || 5}</span>
                      <span className="block text-[10px] text-slate-400">of {record?.totalStudentsInClass || 28}</span>
                    </td>

                    {/* Attendance % */}
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`font-semibold ${
                          (record?.attendancePercentage || 95) < 85 ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {record?.attendancePercentage || 95}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          id={`edit-grade-btn-${student.id}`}
                          onClick={() => handleOpenEdit(student.id)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Assessment Grades"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`notify-parent-perf-${student.id}`}
                          onClick={() => {
                            sendAutomatedNoticeToParent(student.id, 'performance_report');
                            alert(`Academic report alert notice sent to ${student.guardian.name}!`);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Send Performance Notice to Parent Message Thread"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          id={`view-report-card-btn-${student.id}`}
                          onClick={() => onOpenReportCard(student.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Report Card</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Entry & Score Adjustment Modal */}
      {editingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingStudentId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Record Assessment Grades</h3>
                  <p className="text-xs text-slate-500">
                    Student: {students.find((s) => s.id === editingStudentId)?.firstName}{' '}
                    {students.find((s) => s.id === editingStudentId)?.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setEditingStudentId(null)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setEditingStudentId(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
              {/* Select Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={editingSubjectId}
                  onChange={(e) => {
                    setEditingSubjectId(e.target.value);
                    const record = academicRecords.find((r) => r.studentId === editingStudentId);
                    const sub = record?.subjects.find((s) => s.subjectId === e.target.value);
                    if (sub) {
                      setEditScores({ ...sub.scores });
                      setEditRemarks(sub.remarks);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                >
                  {academicRecords
                    .find((r) => r.studentId === editingStudentId)
                    ?.subjects.map((sub) => (
                      <option key={sub.subjectId} value={sub.subjectId}>
                        {sub.subjectName} ({sub.teacherName})
                      </option>
                    ))}
                </select>
              </div>

              {/* Assessment Scores Row */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Test 1 (20)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={editScores.test1}
                    onChange={(e) => setEditScores({ ...editScores, test1: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Test 2 (20)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={editScores.test2}
                    onChange={(e) => setEditScores({ ...editScores, test2: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Midterm (30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editScores.midterm}
                    onChange={(e) => setEditScores({ ...editScores, midterm: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Final (30)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editScores.finalExam}
                    onChange={(e) => setEditScores({ ...editScores, finalExam: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Continuous (10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editScores.assignment}
                    onChange={(e) => setEditScores({ ...editScores, assignment: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              {/* Calculated Total Live Preview */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-indigo-900">Total Subject Score:</span>
                <span className="font-mono text-base font-bold text-indigo-950">
                  {Math.min(100, editScores.test1 + editScores.test2 + editScores.midterm + editScores.finalExam + editScores.assignment)} / 100
                </span>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Feedback & Observations</label>
                <textarea
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Demonstrated exceptional problem-solving and peer leadership in laboratory experiments..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudentId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center space-x-1.5 shadow-xs"
                >
                  {saveSuccessNotice ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Updated!</span>
                    </>
                  ) : (
                    <span>Save Grade Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Report Card Modal */}
      {selectedReportCardStudentId && (
        <ReportCardModal
          studentId={selectedReportCardStudentId}
          onClose={onCloseReportCard}
        />
      )}
    </div>
  );
};
