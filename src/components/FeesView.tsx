import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Send,
  Printer,
  FileText,
  ArrowDownRight,
  TrendingUp,
  Receipt,
  X,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import { FeeInvoice } from '../types';
import { PaymentModal } from './PaymentModal';
import { EditFeeBalanceModal } from './EditFeeBalanceModal';
import { FeeStatementModal } from './FeeStatementModal';
import { FinanceRegisterStudentModal } from './FinanceRegisterStudentModal';
import { Edit3, BookOpen, GraduationCap, FileCheck } from 'lucide-react';

interface FeesViewProps {
  onOpenPaymentModal: (invoiceId?: string) => void;
  isPaymentModalOpen: boolean;
  selectedInvoiceIdForPayment?: string;
  onClosePaymentModal: () => void;
  onNavigateToDashboard?: () => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  onOpenPaymentModal,
  isPaymentModalOpen,
  selectedInvoiceIdForPayment,
  onClosePaymentModal,
  onNavigateToDashboard,
}) => {
  const {
    invoices,
    students,
    accessibleStudents,
    activeDivision,
    assignedClass,
    currentUser,
    currentSchool,
    stats,
    selectedGrade,
    setSelectedGrade,
    sendAutomatedNoticeToParent,
  } = useSchool();

  const isTeacher = activeDivision === 'teacher';
  const isPrincipal = activeDivision === 'principal';
  const isFinance = activeDivision === 'finance' || currentUser?.staffDivision === 'finance';

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingInvoice, setInspectingInvoice] = useState<FeeInvoice | null>(null);
  const [editingFeeInvoice, setEditingFeeInvoice] = useState<FeeInvoice | null>(null);
  const [statementStudentId, setStatementStudentId] = useState<string | null>(null);
  const [statementInvoiceId, setStatementInvoiceId] = useState<string | undefined>(undefined);
  const [statementInitialEdit, setStatementInitialEdit] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Filtered invoices (teachers only see invoices for their assigned class students)
  const filteredInvoices = useMemo(() => {
    const studentPool = isTeacher ? accessibleStudents : students;

    return invoices.filter((inv) => {
      const student = studentPool.find((s) => s.id === inv.studentId);
      if (!student) return false;

      const matchesGrade = isTeacher || selectedGrade === 'All' || student.grade === selectedGrade;
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter.toLowerCase();
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesGrade && matchesStatus && matchesSearch;
    });
  }, [invoices, isTeacher, accessibleStudents, students, selectedGrade, statusFilter, searchQuery]);

  // Aggregate Payment History
  const allPayments = useMemo(() => {
    const list: {
      receiptNo: string;
      date: string;
      studentName: string;
      amount: number;
      method: string;
      payerAccount: string;
      payerName?: string;
      recordedBy: string;
    }[] = [];

    invoices.forEach((inv) => {
      const student = students.find((s) => s.id === inv.studentId);
      inv.paymentHistory.forEach((pay) => {
        list.push({
          receiptNo: pay.receiptNo,
          date: pay.date,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Student',
          amount: pay.amount,
          method: pay.paymentMethod,
          payerAccount: pay.payerAccount || 'M-Pesa / Bank Channel',
          payerName: pay.payerName || (student ? student.guardian.name : undefined),
          recordedBy: pay.recordedBy,
        });
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [invoices, students]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>School Fee Management & Bursary</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tuition fee tracking, payment collection records, and automated fee reminders for parents.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateToDashboard && (
            <button
              id="fees-cancel-btn"
              type="button"
              onClick={onNavigateToDashboard}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              title="Cancel and return to Dashboard page"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Cancel</span>
            </button>
          )}

          {isFinance && (
            <>
              <button
                id="fees-edit-statement-top-btn"
                onClick={() => {
                  const targetInv = filteredInvoices[0] || invoices[0];
                  if (targetInv) {
                    setStatementStudentId(targetInv.studentId);
                    setStatementInvoiceId(targetInv.id);
                    setStatementInitialEdit(true);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                title="Finance Department: Edit Fee Statement, line items, and payment ledger"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Fee Statement</span>
              </button>

              <button
                id="fees-edit-balance-top-btn"
                onClick={() => setEditingFeeInvoice(filteredInvoices[0] || invoices[0])}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Quick Balance Adjust</span>
              </button>

              <button
                id="fees-record-payment-btn"
                onClick={() => onOpenPaymentModal()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record New Payment</span>
              </button>

              <button
                id="fees-register-student-top-btn"
                onClick={() => setIsRegisterModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                title="Finance Department: Register New Student, Auto-Assign Class Teacher & Register Parent Email"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Student</span>
              </button>
            </>
          )}

          {isTeacher && (
            <button
              id="teacher-batch-remind-btn"
              onClick={() => {
                const pendingClassInvoices = filteredInvoices.filter((i) => i.balance > 0);
                if (pendingClassInvoices.length === 0) {
                  alert(`All students in ${assignedClass || 'your class'} have cleared their fee balances!`);
                  return;
                }
                pendingClassInvoices.forEach((inv) => {
                  sendAutomatedNoticeToParent(inv.studentId, 'fee_reminder');
                });
                alert(`Fee reminders dispatched to guardians of all ${pendingClassInvoices.length} student(s) with pending balances in ${assignedClass || 'your class'}!`);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Send Batch Fee Reminders ({filteredInvoices.filter((i) => i.balance > 0).length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Division Context Banner */}
      {isFinance && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-sm">
                  Finance & Bursar Department Division
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Exclusive Payment Recording Authority
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Staff Bursar: <strong>{currentUser?.name || 'Finance Bursar'}</strong> • Exclusively authorized to modify tuition fees, record fee payments, adjust student fee balances, register new students with automatic teacher placement, issue bursaries, and generate official receipts.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              type="button"
              id="fees-banner-register-student-btn"
              onClick={() => setIsRegisterModalOpen(true)}
              className="text-xs text-indigo-900 font-bold bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center space-x-1.5 transition shadow-2xs"
              title="Register a new student, automatically place with class teacher, and activate parent portal access"
            >
              <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Register Student</span>
            </button>
            <button
              type="button"
              onClick={() => setEditingFeeInvoice(filteredInvoices[0] || invoices[0])}
              className="text-xs text-amber-800 font-bold bg-white hover:bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center space-x-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Adjust Student Balance</span>
            </button>
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
                Principal / Headmaster Financial Audit Overview
              </span>
              <p className="text-slate-500 text-xs mt-0.5">
                Executive view of all {students.length} pupils across all grades in {currentSchool?.name || 'the school'}, total billing, and revenue collections.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
            {students.length} Total Enrolled Pupils
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
                  Class Teacher Fee Follow-Up Roster: {assignedClass || 'Grade 10-A'}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Fee Reminder Role
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                Viewing billing status for {filteredInvoices.length} pupils in {assignedClass || 'Grade 10-A'}. <strong>Teachers can send fee reminders to parents.</strong> Recording fee payments, receipts, and invoice modifications is exclusively handled by the Finance Department.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {onNavigateToDashboard && (
              <button
                id="teacher-banner-cancel-btn"
                type="button"
                onClick={onNavigateToDashboard}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                title="Cancel and return to Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel</span>
              </button>
            )}
            <span className="text-xs text-indigo-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              🔒 {assignedClass || 'Grade 10-A'} Scoped
            </span>
          </div>
        </div>
      )}

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Billed</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">KSh {stats.totalFeesBilled.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">Term 2 Invoices</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Total institutional receivables</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Collected</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">KSh {stats.totalFeesCollected.toLocaleString()}</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {stats.collectionRate}%
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.collectionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Outstanding Balance</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">KSh {stats.totalFeesOutstanding.toLocaleString()}</span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Receivables
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Due within current academic cycle</p>
        </div>

        {/* Overdue Accounts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Overdue Accounts</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600">
              {invoices.filter((i) => i.status === 'overdue').length}
            </span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Requires Action
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Past official due dates</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, student name, or admission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['All', 'Paid', 'Partial', 'Pending', 'Overdue'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Cohort Selector */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
          >
            <option value="All">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Student & Guardian</th>
                <th className="px-3 py-3.5">Term</th>
                <th className="px-3 py-3.5">Due Date</th>
                <th className="px-3 py-3.5 text-right">Total Amount</th>
                <th className="px-3 py-3.5 text-right">Paid</th>
                <th className="px-3 py-3.5 text-right">Balance Due</th>
                <th className="px-3 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredInvoices.map((inv) => {
                const student = students.find((s) => s.id === inv.studentId);
                const isOverdue = inv.status === 'overdue';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">
                        {student?.firstName} {student?.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {student?.grade} • Guardian: {student?.guardian.name}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 font-medium">
                      {inv.term} {inv.academicYear}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {inv.dueDate}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900">
                      KSh {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-emerald-600">
                      KSh {inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold">
                      <span className={inv.balance > 0 ? (isOverdue ? 'text-rose-600' : 'text-amber-600') : 'text-slate-400'}>
                        KSh {inv.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'partial'
                            ? 'bg-blue-100 text-blue-800'
                            : inv.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Statement View Action for all roles */}
                        <button
                          id={`view-statement-${inv.id}`}
                          onClick={() => {
                            setStatementStudentId(inv.studentId);
                            setStatementInvoiceId(inv.id);
                            setStatementInitialEdit(false);
                          }}
                          className="px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-2xs transition-colors"
                          title="View Official Student Fee Statement & Ledger"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Statement</span>
                        </button>

                        {/* Finance Edit Fee Statement Action */}
                        {isFinance && (
                          <button
                            id={`edit-fee-statement-${inv.id}`}
                            onClick={() => {
                              setStatementStudentId(inv.studentId);
                              setStatementInvoiceId(inv.id);
                              setStatementInitialEdit(true);
                            }}
                            className="px-2.5 py-1 text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                            title="Finance Division: Edit Full Fee Statement Breakdown, Levies & Payment Ledger"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Edit Statement</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectingInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Invoice Items Breakdown"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>

                        {inv.balance > 0 && (
                          <>
                            <button
                              id={`send-fee-reminder-${inv.id}`}
                              onClick={() => {
                                sendAutomatedNoticeToParent(inv.studentId, 'fee_reminder');
                                alert(`Fee reminder dispatched to ${student?.guardian.name} for ${student?.firstName}'s balance of KSh ${inv.balance.toLocaleString()}!`);
                              }}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                              title="Send Fee Reminder Message to Parent"
                            >
                              <Send className="w-3.5 h-3.5 text-slate-600" />
                              <span>Remind</span>
                            </button>
                            {isFinance && (
                              <button
                                id={`record-payment-${inv.id}`}
                                onClick={() => onOpenPaymentModal(inv.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                                title="Finance Department: Record Fee Payment"
                              >
                                Record Payment
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Ledger / Transaction History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Payment Ledger & Receipts</h2>
          </div>
          <span className="text-xs text-slate-500">{allPayments.length} recorded payments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Paid From Account</th>
                <th className="px-4 py-3">Payment Channel</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allPayments.map((pay) => (
                <tr key={pay.receiptNo} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono font-bold text-indigo-700">{pay.receiptNo}</td>
                  <td className="px-4 py-2.5 text-slate-600">{pay.date}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900">{pay.studentName}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[11px] text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                      {pay.payerAccount}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{pay.method}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">
                    +KSh {pay.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-[11px]">{pay.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Invoice Itemized Details Modal */}
      {inspectingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInspectingInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Invoice Breakdown</h3>
                  <p className="text-xs font-mono text-slate-500">{inspectingInvoice.invoiceNo}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setInspectingInvoice(null)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setInspectingInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Itemized Line Items:
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {inspectingInvoice.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{item.description}</div>
                        <span className="text-[10px] text-slate-500">{item.category}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">KSh {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 flex justify-between font-bold text-slate-900">
                <span>Total Invoice Sum:</span>
                <span className="font-mono">KSh {inspectingInvoice.totalAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setInspectingInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                {inspectingInvoice.balance > 0 && (
                  <button
                    onClick={() => {
                      const id = inspectingInvoice.id;
                      setInspectingInvoice(null);
                      onOpenPaymentModal(id);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    Pay Invoice (KSh {inspectingInvoice.balance.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          invoiceId={selectedInvoiceIdForPayment}
          onClose={onClosePaymentModal}
        />
      )}

      {/* Edit Fee Balance Modal (Finance Division) */}
      <EditFeeBalanceModal
        invoice={editingFeeInvoice}
        isOpen={!!editingFeeInvoice}
        onClose={() => setEditingFeeInvoice(null)}
      />

      {/* Fee Statement Modal (View & Finance Edit) */}
      {statementStudentId && (
        <FeeStatementModal
          studentId={statementStudentId}
          invoiceId={statementInvoiceId}
          initialEditMode={statementInitialEdit}
          onClose={() => {
            setStatementStudentId(null);
            setStatementInvoiceId(undefined);
            setStatementInitialEdit(false);
          }}
          onOpenPayment={(invId) => {
            setStatementStudentId(null);
            onOpenPaymentModal(invId);
          }}
        />
      )}

      {/* Finance Register Student Modal */}
      <FinanceRegisterStudentModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(newStdId) => {
          const newStd = students.find((s) => s.id === newStdId);
          if (newStd) {
            setSearchQuery(newStd.firstName);
          }
        }}
      />
    </div>
  );
};
