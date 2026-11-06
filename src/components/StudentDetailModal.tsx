import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Send, ShieldAlert, CheckCircle2, ArrowLeft, BookOpen, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { getTeacherForGradeAndSection } from '../utils/teacherAssignment';

interface StudentDetailModalProps {
  studentId: string;
  onClose: () => void;
  onOpenReportCard: (studentId: string) => void;
  onOpenPaymentModal: (invoiceId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
  onOpenReportCard,
  onOpenPaymentModal,
}) => {
  const {
    students,
    academicRecords,
    attendance,
    invoices,
    threads,
    messages,
    activeDivision,
    sendDirectMessage,
    sendAutomatedNoticeToParent,
    getStudentAttendanceRate,
    parentStudentMappings,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'academic' | 'attendance' | 'fees' | 'guardian' | 'messages'>('academic');
  const [quickMsg, setQuickMsg] = useState('');

  const student = (students || []).find((s) => s.id === studentId);
  const academic = (academicRecords || []).find((r) => r.studentId === studentId);
  const studentAttendance = (attendance || []).filter((a) => a.studentId === studentId);
  const invoice = (invoices || []).find((i) => i.studentId === studentId);
  const thread = (threads || []).find((t) => t.studentId === studentId);
  const threadMessages = thread ? (messages || []).filter((m) => m.threadId === thread.id) : [];
  const parentMapping = (parentStudentMappings || []).find((m) => m.studentId === studentId);

  if (!student) return null;

  const assignedTeacher = student.assignedTeacher || getTeacherForGradeAndSection(student.grade, student.section);
  const attendanceRate = getStudentAttendanceRate(studentId);

  const handleSendQuickMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsg.trim()) return;

    sendDirectMessage(studentId, quickMsg.trim(), 'general', {
      role: 'school_admin',
      name: 'Class Faculty Desk',
    });

    setQuickMsg('');
    alert(`Message sent to ${student.guardian.name}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header with Student Identity Banner */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={student.avatar}
              alt={student.firstName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-400/50 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {student.grade} ({student.section})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Admission: <span className="font-mono text-white">{student.admissionNo}</span> • Roll: <span className="font-mono text-white">{student.rollNumber}</span> • Class Teacher: <span className="text-indigo-300 font-semibold">{assignedTeacher.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/70 flex space-x-6 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'academic', label: 'Academic Performance' },
            { id: 'attendance', label: 'Attendance Records' },
            { id: 'fees', label: 'Fee Payments' },
            { id: 'guardian', label: 'Guardian Details' },
            { id: 'messages', label: 'Parent Messages' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[500px] overflow-y-auto text-xs space-y-4">
          {/* Tab 1: Academic Performance */}
          {activeTab === 'academic' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
                    Current Term GPA
                  </span>
                  <span className="text-2xl font-black text-indigo-950 font-mono">
                    {academic?.overallGpa.toFixed(2) || '3.40'} / 4.0
                  </span>
                  <span className="block text-slate-500 text-[11px] mt-0.5">
                    Class Rank: #{academic?.rank || 5} of {academic?.totalStudentsInClass || 28}
                  </span>
                </div>

                <button
                  id={`open-report-from-detail-${student.id}`}
                  onClick={() => onOpenReportCard(student.id)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  View Official Report Card
                </button>
              </div>

              {/* Subject Scores List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5">Subject</th>
                      <th className="px-2 py-2.5 text-center">T1</th>
                      <th className="px-2 py-2.5 text-center">T2</th>
                      <th className="px-2 py-2.5 text-center">Mid</th>
                      <th className="px-2 py-2.5 text-center">Final</th>
                      <th className="px-2 py-2.5 text-center">Total</th>
                      <th className="px-2 py-2.5 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {academic?.subjects.map((sub) => (
                      <tr key={sub.subjectId} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-semibold text-slate-900">{sub.subjectName}</td>
                        <td className="px-2 py-2 text-center text-slate-600">{sub.scores.test1}</td>
                        <td className="px-2 py-2 text-center text-slate-600">{sub.scores.test2}</td>
                        <td className="px-2 py-2 text-center text-slate-600">{sub.scores.midterm}</td>
                        <td className="px-2 py-2 text-center text-slate-600">{sub.scores.finalExam}</td>
                        <td className="px-2 py-2 text-center font-bold text-slate-900">{sub.totalScore}%</td>
                        <td className="px-2 py-2 text-center font-bold text-indigo-700">{sub.letterGrade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Attendance Records */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Attendance Rate</span>
                  <span className="text-xl font-bold text-slate-900">{attendanceRate}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Present Days</span>
                  <span className="text-xl font-bold text-emerald-900">
                    {studentAttendance.filter((a) => a.status === 'present').length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] uppercase font-semibold text-rose-700 block">Absences</span>
                  <span className="text-xl font-bold text-rose-900">
                    {studentAttendance.filter((a) => a.status === 'absent').length}
                  </span>
                </div>
              </div>

              {/* Attendance Log */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Time In</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {studentAttendance.map((att) => (
                      <tr key={att.id}>
                        <td className="px-3 py-2 font-medium text-slate-800">{att.date}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              att.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">{att.timeIn || '—'}</td>
                        <td className="px-3 py-2 text-slate-500 italic">{att.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Fee Payments */}
          {activeTab === 'fees' && invoice && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-slate-500 block">Invoice #{invoice.invoiceNo}</span>
                  <span className="font-bold text-slate-900 text-sm">
                    Total: KSh {invoice.totalAmount.toLocaleString()} • Paid: KSh {invoice.paidAmount.toLocaleString()}
                  </span>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : invoice.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                    <span className="ml-2 text-slate-500 font-bold">
                      Balance Due: KSh {invoice.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {invoice.balance > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        sendAutomatedNoticeToParent(student.id, 'fee_reminder');
                        alert(`Fee reminder dispatched to guardian ${student.guardian.name} for ${student.firstName}'s pending balance of KSh ${invoice.balance.toLocaleString()}!`);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold shadow-xs text-xs transition-colors"
                      title="Send Fee Reminder Message to Parent"
                    >
                      <Send className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Send Fee Reminder</span>
                    </button>
                    {activeDivision === 'finance' && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPaymentModal(invoice.id);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs text-xs transition-colors"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                )}
              </div>

              {activeDivision === 'teacher' && (
                <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Faculty Fee Policy:</span> Teachers can monitor student fee status and dispatch fee reminders to parents. Payment recording, invoice alterations, and official receipts are exclusively processed by the Finance & Bursar Department.
                  </div>
                </div>
              )}

              {/* Items Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  Invoice Items Breakdown
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between">
                      <span className="text-slate-800">{item.description}</span>
                      <span className="font-mono font-bold text-slate-900">KSh {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Guardian Details */}
          {activeTab === 'guardian' && (
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block">Guardian Full Name</span>
                  <span className="font-bold text-slate-900 text-sm">{student.guardian.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Relationship</span>
                  <span className="font-semibold text-slate-800">{student.guardian.relation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Primary Phone</span>
                  <span className="font-semibold text-slate-800">{student.guardian.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address (Platform Access)</span>
                  <span className="font-semibold text-slate-800">{student.guardian.email}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Residential Address</span>
                  <span className="font-medium text-slate-800">{student.guardian.address}</span>
                </div>
              </div>

              {/* Portal Access Status Card */}
              <div className="pt-3 border-t border-slate-200 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 text-xs block">
                      Platform Portal Access Authorized
                    </span>
                    <span className="text-emerald-800 text-[11px]">
                      Registered login email: <strong className="font-mono">{student.guardian.email}</strong>
                    </span>
                  </div>
                </div>
                {parentMapping?.accessCode && (
                  <span className="text-[10px] font-mono font-bold bg-white px-2 py-1 rounded border border-emerald-300 text-emerald-900 flex-shrink-0">
                    Code: {parentMapping.accessCode}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Parent Communication Thread */}
          {activeTab === 'messages' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto space-y-2">
                {threadMessages.length > 0 ? (
                  threadMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-lg text-xs ${
                        msg.senderRole === 'parent'
                          ? 'bg-white border border-slate-200 text-slate-900'
                          : 'bg-indigo-600 text-white ml-6'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-[10px] opacity-80 mb-0.5">
                        <span>{msg.senderName}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-4">No recent messages</p>
                )}
              </div>

              <form onSubmit={handleSendQuickMsg} className="flex space-x-2">
                <input
                  type="text"
                  placeholder={`Send quick message to ${student.guardian.name}...`}
                  value={quickMsg}
                  onChange={(e) => setQuickMsg(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
