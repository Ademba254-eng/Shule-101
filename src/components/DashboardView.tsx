import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  CalendarCheck,
  CreditCard,
  Award,
  AlertTriangle,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Megaphone,
  TrendingUp,
  FileSpreadsheet,
  BookOpen,
  GraduationCap,
  Edit3,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate?: (tab: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenPaymentModal?: (invoiceId?: string) => void;
  onOpenReportCard?: (studentId: string) => void;
  onOpenStudentDetail?: (studentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onNavigateToTab,
  onOpenPaymentModal = (_invoiceId?: string) => {},
  onOpenReportCard = (_studentId: string) => {},
  onOpenStudentDetail = (_studentId: string) => {},
}) => {
  const handleNav = (tab: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(tab);
    } else if (typeof onNavigateToTab === 'function') {
      onNavigateToTab(tab);
    }
  };
  const {
    students,
    accessibleStudents,
    activeDivision,
    assignedClass,
    currentSchool,
    currentUser,
    stats,
    attendance,
    selectedDate,
    invoices,
    threads,
    announcements,
    sendAutomatedNoticeToParent,
    getStudentAttendanceRate,
  } = useSchool();

  const isTeacher = activeDivision === 'teacher';
  const isFinance = activeDivision === 'finance';
  const isPrincipal = activeDivision === 'principal';

  // Find today's absences or tardiness
  const todayRecords = attendance.filter((a) => a.date === selectedDate);
  const flaggedToday = todayRecords
    .filter((a) => a.status === 'absent' || a.status === 'late')
    .map((rec) => {
      const student = students.find((s) => s.id === rec.studentId);
      return {
        ...rec,
        student,
      };
    })
    .filter((item) => item.student !== undefined);

  // Find overdue or high outstanding invoices
  const pendingInvoices = invoices
    .filter((inv) => inv.status === 'overdue' || (inv.status === 'partial' && inv.balance > 500))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner with Today's Date and Quick Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {currentSchool?.name || 'Central Academy'} • Term 2 Active
            </span>
            {isTeacher && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-[10px] font-bold">
                Teacher Division: {assignedClass}
              </span>
            )}
            {isFinance && (
              <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[10px] font-bold">
                Finance Division: Bursar
              </span>
            )}
            {isPrincipal && (
              <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-bold">
                Principal Division: All Pupils
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isTeacher
              ? `Class Teacher Portal: ${assignedClass || 'Grade 10-A'}`
              : isFinance
              ? 'Finance Department & Bursar Operations'
              : isPrincipal
              ? 'Headmaster & Principal Executive Overview'
              : 'School Administrative Overview'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            {isTeacher
              ? `You are in charge of ${assignedClass || 'Grade 10-A'} (${accessibleStudents.length} students). Mark roll call attendance, update academic subject scores, and connect with parents.`
              : isFinance
              ? 'Institutional financial reconciliation: manage student fee structures, adjust invoice balances, issue bursaries, and record receipts.'
              : isPrincipal
              ? `Complete institutional oversight of all ${students.length} pupils in ${currentSchool?.name || 'the school'}, academic benchmarks, attendance metrics, and fee balances.`
              : 'Real-time monitoring of academic grading, daily roll-call attendance, fee reconciliation, and bidirectional parent communication.'}
          </p>
        </div>

        {/* Quick Actions Cluster */}
        <div className="flex flex-wrap gap-2.5">
          {isTeacher && (
            <>
              <button
                id="dash-quick-attendance-teacher"
                onClick={() => handleNav('attendance')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Mark {assignedClass} Attendance</span>
              </button>
              <button
                id="dash-quick-performance-teacher"
                onClick={() => handleNav('performance')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Edit Class Grades</span>
              </button>
            </>
          )}

          {isFinance && (
            <>
              <button
                id="dash-quick-edit-fees"
                onClick={() => handleNav('fees')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Fee Balances</span>
              </button>
              <button
                id="dash-quick-fees"
                onClick={() => onOpenPaymentModal()}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Fee Payment</span>
              </button>
            </>
          )}

          {isPrincipal && (
            <>
              <button
                id="dash-quick-students-principal"
                onClick={() => handleNav('students')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>View All Pupils ({students.length})</span>
              </button>
              <button
                id="dash-quick-performance-principal"
                onClick={() => handleNav('performance')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>School Performance</span>
              </button>
            </>
          )}

          <button
            id="dash-quick-message"
            onClick={() => handleNav('messaging')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold border border-slate-600 shadow-xs transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Parent Messages</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrollment</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Active Enrollees
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Across Grades 9 to 12 • 4 Cohorts</p>
        </div>

        {/* Metric 2: Attendance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{stats.todayAttendanceRate}%</div>
            <span className="text-xs font-medium text-slate-600">
              {stats.presentCountToday} Present • {stats.absentCountToday} Absent
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.todayAttendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3: Fee Collection */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Collection</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">KSh {stats.totalFeesCollected.toLocaleString()}</div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {stats.collectionRate}% Paid
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            KSh {stats.totalFeesOutstanding.toLocaleString()} Outstanding Balance
          </p>
        </div>

        {/* Metric 4: Academic Performance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">School Academic GPA</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900">{stats.schoolAverageGpa} / 4.0</div>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Grade 10 Lead
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">86% of students scoring B or above</p>
        </div>
      </div>

      {/* Two Column Layout: Action Center & Watchlists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Actionable Watchlists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Today's Attendance Watchlist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Attendance Watchlist ({selectedDate})</h2>
              </div>
              <button
                onClick={() => handleNav('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Full Register</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {flaggedToday.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {flaggedToday.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.student?.avatar}
                        alt={item.student?.firstName}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => item.student && onOpenStudentDetail(item.student.id)}
                            className="font-semibold text-sm text-slate-900 hover:text-indigo-600 text-left"
                          >
                            {item.student?.firstName} {item.student?.lastName}
                          </button>
                          <span className="text-xs text-slate-500">({item.student?.grade} - {item.student?.rollNumber})</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                              item.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.whereabouts ? (
                            <span className="font-semibold text-slate-700">📍 {item.whereabouts} • </span>
                          ) : null}
                          {item.notes || (item.status === 'late' ? `Arrived at ${item.timeIn}` : 'No excuse submitted yet')}
                          {' • '}Parent: {item.student?.guardian.name} ({item.student?.guardian.phone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        id={`notify-parent-att-${item.student?.id}`}
                        onClick={() => {
                          if (item.student) {
                            sendAutomatedNoticeToParent(item.student.id, 'attendance_alert');
                            alert(`Attendance alert notice sent to ${item.student.guardian.name} for ${item.student.firstName}!`);
                          }
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        title="Direct message student's guardian with attendance alert"
                      >
                        <Send className="w-3 h-3" />
                        <span>Notify Parent</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No unexcused absences flagged today</p>
                <p className="text-xs text-slate-400">All registered students are marked present or accounted for.</p>
              </div>
            )}
          </div>

          {/* Section: Fee Collection & Overdue Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Fee Payment Follow-Up</h2>
              </div>
              <button
                onClick={() => handleNav('fees')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>All Invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingInvoices.map((inv) => {
                const student = students.find((s) => s.id === inv.studentId);
                return (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {student?.firstName} {student?.lastName}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">({inv.invoiceNo})</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                            inv.status === 'overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Due: {inv.dueDate} • Total: KSh {inv.totalAmount.toLocaleString()} •{' '}
                        <strong className="text-slate-800">Balance: KSh {inv.balance.toLocaleString()}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        id={`remind-fee-${inv.id}`}
                        onClick={() => {
                          sendAutomatedNoticeToParent(inv.studentId, 'fee_reminder');
                          alert(`Fee reminder sent to parent for ${student?.firstName}'s pending balance of KSh ${inv.balance.toLocaleString()}!`);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        title="Send Fee Reminder Message to Parent"
                      >
                        <Send className="w-3 h-3 text-indigo-600" />
                        <span>Send Reminder</span>
                      </button>
                      {isFinance && (
                        <button
                          id={`pay-fee-btn-${inv.id}`}
                          onClick={() => onOpenPaymentModal(inv.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Parent Messaging & School Circulars */}
        <div className="space-y-6">
          {/* Recent Parent Inquiries */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Parent Communication</h2>
              </div>
              <button
                onClick={() => handleNav('messaging')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Open Inbox →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {threads.slice(0, 4).map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleNav('messaging')}
                  className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-xs text-slate-900">{thread.parentName}</span>
                      <span className="text-[11px] text-slate-500">({thread.studentName}'s Guardian)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{thread.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{thread.lastMessage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* School Announcements */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Active Circulars</h2>
              </div>
              <button
                onClick={() => handleNav('messaging')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + New Circular
              </button>
            </div>

            <div className="p-4 space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ann.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">{ann.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{ann.title}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{ann.content}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Audience: {ann.targetAudience}</span>
                    <span>{ann.readByCount} parents read</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
