import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Shule101Logo } from './Shule101Logo';
import { Download, Printer, Send, CheckCircle2, FileDown, Loader2, ArrowLeft } from 'lucide-react';
import { downloadReportCardPDF, generateAndDownloadStudentReportCard } from '../utils/pdfExport';

interface ReportCardModalProps {
  studentId: string;
  onClose: () => void;
  onSendToParent?: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  studentId,
  onClose,
  onSendToParent,
}) => {
  const { students, getStudentAcademicRecord, sendAutomatedNoticeToParent, activeRole, cbcReportCardConfig } = useSchool();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const record = getStudentAcademicRecord(studentId);

  if (!student || !record) return null;

  const config = cbcReportCardConfig;

  // Map 100-point scores to CBC rubric levels if CBC grading enabled
  const getCbcRating = (percentage: number) => {
    if (percentage >= 80) return { code: 'EE', label: 'Exceeding Expectations', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (percentage >= 65) return { code: 'ME', label: 'Meeting Expectations', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    if (percentage >= 50) return { code: 'AE', label: 'Approaching Expectations', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { code: 'BE', label: 'Below Expectations', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // First attempt direct high-fidelity canvas export, fallback to vector generation
      const success = await downloadReportCardPDF(
        'printable-report-card',
        `${student.firstName}_${student.lastName}`,
        record.term
      );

      if (!success) {
        generateAndDownloadStudentReportCard(student, record);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback
      generateAndDownloadStudentReportCard(student, record);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNotifyParent = () => {
    sendAutomatedNoticeToParent(studentId, 'performance_report');
    alert(`Term 2 Academic Report notification sent to ${student.guardian.name}!`);
    if (onSendToParent) onSendToParent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight block">Official Student Academic Transcript</span>
              {activeRole === 'parent' && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                  Parent Access
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">Office of the Registrar • Term 2 2025/2026</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {/* Back Button */}
            <button
              id="back-report-card-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
              title="Return to previous screen"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Back</span>
            </button>

            {/* Direct Download Button */}
            <button
              id="download-report-card-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Report Card Downloaded (&lt; 2MB)!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report Card (PDF • &lt; 2MB)</span>
                </>
              )}
            </button>

            {/* Print / Save */}
            <button
              id="print-report-card-btn"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Document</span>
            </button>

            {/* Send to Parent (if staff) */}
            {activeRole !== 'parent' && (
              <button
                id="send-report-to-parent-btn"
                onClick={handleNotifyParent}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition-colors"
              >
                <Send className="w-3 h-3 text-slate-400" />
                <span>Send to Parent</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Report Card Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 bg-white" id="printable-report-card">
          {/* Institutional Header */}
          <div className="text-center pb-6 border-b-2 border-slate-800">
            <div className="flex justify-center mb-3">
              <Shule101Logo variant="horizontal" size="lg" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              {config?.schoolName || 'St. Jude International Academy'}
            </h2>
            <p className="text-xs text-slate-600 font-semibold italic mt-0.5">
              "{config?.motto || 'Striving for Excellence in Wisdom & Integrity'}"
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              P.O. Box {config?.poBox || '40200-00100'}, {config?.county || 'Nairobi County'} • School Code: {config?.schoolCode || 'SC-2026'} • {config?.schoolEmail || 'registrar@shule101.edu'} • {config?.schoolPhone || '+254 700 123 456'}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="px-3.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                {config?.schoolLevel === 'primary' ? 'Primary School CBC Learner Progress Report' : config?.schoolLevel === 'junior_secondary' ? 'Junior Secondary School (JSS) CBC Assessment Transcript' : config?.schoolLevel === 'senior_secondary' ? 'Senior High School CBC / KCSE Academic Transcript' : 'Official Student Academic Transcript'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                {config?.academicTerm || record.term} • {config?.academicYear || record.academicYear}
              </span>
            </div>

            <div className="mt-2 text-[10px] text-slate-500 font-medium">
              Closing Date: <span className="font-bold text-slate-700">{config?.closingDate || '2026-09-10'}</span> • Next Term Opening: <span className="font-bold text-slate-700">{config?.nextTermOpeningDate || '2026-10-06'}</span>
            </div>
          </div>

          {/* Student Profile Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Student Full Name</span>
              <span className="font-bold text-slate-900 text-sm">
                {student.firstName} {student.lastName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Admission Number</span>
              <span className="font-mono font-bold text-slate-900">{student.admissionNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Class & Stream</span>
              <span className="font-bold text-slate-900">
                {student.grade} (Sec {student.section}) • Roll {student.rollNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Primary Guardian</span>
              <span className="font-bold text-slate-900">
                {student.guardian.name} ({student.guardian.relation})
              </span>
            </div>
          </div>

          {/* CBC Assessment Rubric Legend */}
          {config?.showAssessmentRubric && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Kenyan Competency-Based Curriculum (CBC) Performance Rubric:</span>
                <span className="text-[10px] font-normal text-slate-500">
                  Weighting: {config?.formativeWeightPercentage || 40}% Formative + {config?.summativeWeightPercentage || 60}% Summative
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {config?.gradingScale.levels.map((lvl) => (
                  <div key={lvl.code} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center space-x-2">
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-900">
                      {lvl.code} ({lvl.points} pts)
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">{lvl.label}</div>
                      <div className="text-[10px] text-slate-500">{lvl.minScore}% - {lvl.maxScore}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Performance Breakdown Table */}
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100/80 font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5 text-left">Learning Area / Subject</th>
                  <th className="px-2 py-2.5 text-center">Strand / Code</th>
                  <th className="px-2 py-2.5 text-center">Formative ({config?.formativeWeightPercentage || 40}%)</th>
                  <th className="px-2 py-2.5 text-center">Summative ({config?.summativeWeightPercentage || 60}%)</th>
                  <th className="px-2 py-2.5 text-center">Total (%)</th>
                  <th className="px-2 py-2.5 text-center">CBC Level</th>
                  <th className="px-2 py-2.5 text-center">Points</th>
                  <th className="px-3 py-2.5 text-left">Facilitator / Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {record.subjects.map((sub) => {
                  const formativeScore = Math.round((sub.scores.test1 + sub.scores.test2) / 2);
                  const summativeScore = Math.round((sub.scores.midterm + sub.scores.finalExam) / 2);
                  const cbcRating = getCbcRating(sub.totalScore);
                  return (
                    <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{sub.subjectName}</div>
                        <div className="text-[10px] text-slate-500">{sub.teacherName}</div>
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono text-[11px] text-slate-600">
                        {sub.subjectId}
                      </td>
                      <td className="px-2 py-2.5 text-center text-slate-700 font-medium">
                        {formativeScore}%
                      </td>
                      <td className="px-2 py-2.5 text-center text-slate-700 font-medium">
                        {summativeScore}%
                      </td>
                      <td className="px-2 py-2.5 text-center font-bold text-slate-900 text-sm">
                        {sub.totalScore}%
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={`inline-block font-black px-2 py-0.5 rounded text-[11px] border ${cbcRating.color}`}>
                          {cbcRating.code}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-bold text-indigo-700">
                        {sub.gpaPoint.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 text-[11px] italic max-w-xs">{sub.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Core Competencies Assessment Section */}
          {config?.showCoreCompetencies && (config.competencies?.length || 0) > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  CBC Core Competencies & Skills Evaluation:
                </span>
                <span className="text-[10px] text-slate-500">Scale: EE (4) • ME (3) • AE (2) • BE (1)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {(config.competencies || []).map((comp) => (
                  <div key={comp.id} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{comp.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{comp.description}</div>
                    </div>
                    <span className="ml-2 font-mono font-black text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex-shrink-0">
                      {comp.defaultRating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Values & Character Formation */}
          {config?.showValuesAssessment && (config.values?.length || 0) > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  CBC Core Values & Character Formation:
                </span>
                <span className="text-[10px] text-slate-500">Ministry of Education National Values</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                {(config.values || []).map((val) => (
                  <div key={val.id} className="p-2 rounded-lg bg-white border border-slate-200">
                    <div className="font-bold text-slate-800 text-[11px]">{val.name}</div>
                    <span className="mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {val.defaultRating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Standing & KPI Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 text-center">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                Cumulative Performance
              </span>
              <span className="text-2xl font-black text-indigo-950 font-mono">
                {record.overallGpa.toFixed(2)} / 4.0
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Cohort Position
              </span>
              <span className="text-2xl font-bold text-slate-900 font-mono">
                #{record.rank} of {record.totalStudentsInClass}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 text-center">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Attendance Rate
              </span>
              <span className="text-2xl font-bold text-emerald-950 font-mono">
                {record.attendancePercentage}% ({record.attendanceDaysPresent}/{record.attendanceTotalDays} Days)
              </span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100 text-center">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                Overall CBC Rating
              </span>
              <span className="text-base font-black text-amber-950 mt-1 block">
                {record.overallGpa >= 3.5 ? 'Exceeding Expectations (EE)' : record.overallGpa >= 2.8 ? 'Meeting Expectations (ME)' : record.overallGpa >= 2.0 ? 'Approaching Expectations (AE)' : 'Below Expectations (BE)'}
              </span>
            </div>
          </div>

          {/* Observational Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="font-bold text-slate-900 block mb-1">
                Class Facilitator / Teacher Conduct Notes:
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{record.conductRemarks || config?.defaultTeacherRemarks || 'Demonstrates exceptional intellectual curiosity, consistent task mastery, and exemplary teamwork in all CBC strands.'}"
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="font-bold text-slate-900 block mb-1">
                Principal / Head of Institution Endorsement:
              </span>
              <p className="text-slate-700 leading-relaxed italic">
                "{record.principalRemarks || config?.defaultPrincipalRemarks || 'Commendable academic and co-curricular performance. Transition to next grade approved with honors.'}"
              </p>
            </div>
          </div>

          {/* Institutional Verification Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
            <div>
              <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center font-serif text-slate-800 italic font-bold">
                {config?.classTeacherName || 'Dr. Gregory Vance'}
              </div>
              <span className="font-medium text-slate-500">Class Facilitator / Advisor</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center font-serif text-slate-800 italic font-bold">
                {config?.principalName || 'Margaret Hastings, Ph.D.'}
              </div>
              <span className="font-medium text-slate-500">Principal / Head of School</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center font-mono text-slate-700 font-bold">
                OFFICIALLY SEALED
              </div>
              <span className="font-medium text-slate-500">
                School Seal • {config?.closingDate || '2026-09-10'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
