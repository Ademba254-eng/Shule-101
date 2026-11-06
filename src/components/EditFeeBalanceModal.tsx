import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Building,
  Sliders,
  Calendar,
  FileEdit,
  Percent,
  ArrowLeft,
} from 'lucide-react';
import { FeeStatus } from '../types';

interface EditFeeBalanceModalProps {
  invoiceId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditFeeBalanceModal: React.FC<EditFeeBalanceModalProps> = ({
  invoiceId,
  onClose,
  onSuccess,
}) => {
  const {
    invoices,
    students,
    editStudentFeeBalance,
    updateFeeInvoiceDetails,
    sendAutomatedNoticeToParent,
    currentUser,
  } = useSchool();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoiceId || invoices[0]?.id || ''
  );

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const student = selectedInvoice ? students.find((s) => s.id === selectedInvoice.studentId) : undefined;

  // Form states initialized with selected invoice
  const [balance, setBalance] = useState<number>(selectedInvoice ? selectedInvoice.balance : 0);
  const [totalAmount, setTotalAmount] = useState<number>(selectedInvoice ? selectedInvoice.totalAmount : 0);
  const [paidAmount, setPaidAmount] = useState<number>(selectedInvoice ? selectedInvoice.paidAmount : 0);
  const [dueDate, setDueDate] = useState<string>(selectedInvoice ? selectedInvoice.dueDate : '2026-09-30');
  const [status, setStatus] = useState<FeeStatus>(selectedInvoice ? selectedInvoice.status : 'pending');
  const [adjustmentReason, setAdjustmentReason] = useState<string>(
    'Finance Department periodic balance reconciliation & ledger update'
  );
  const [notifyParent, setNotifyParent] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // When invoice selection changes
  const handleSelectInvoice = (newId: string) => {
    setSelectedInvoiceId(newId);
    const inv = invoices.find((i) => i.id === newId);
    if (inv) {
      setBalance(inv.balance);
      setTotalAmount(inv.totalAmount);
      setPaidAmount(inv.paidAmount);
      setDueDate(inv.dueDate);
      setStatus(inv.status);
    }
  };

  // Quick balance adjustment actions
  const applyQuickClear = () => {
    setBalance(0);
    setStatus('paid');
    setPaidAmount(totalAmount);
    setAdjustmentReason('Full balance clearance & waiver granted by Finance Office');
  };

  const applyWaiverPercent = (percent: number) => {
    const waiver = Math.round((balance * percent) / 100);
    const newBal = Math.max(0, balance - waiver);
    setBalance(newBal);
    setTotalAmount(Math.max(paidAmount + newBal, totalAmount - waiver));
    setAdjustmentReason(`Applied ${percent}% special bursary fee waiver (-KSh ${waiver.toLocaleString()})`);
    if (newBal === 0) setStatus('paid');
  };

  const handleBalanceInput = (val: number) => {
    const num = Math.max(0, val);
    setBalance(num);
    // Recalculate status
    if (num === 0) {
      setStatus('paid');
    } else if (paidAmount > 0) {
      setStatus('partial');
    } else {
      setStatus('pending');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    // Call context to update fee details & balance
    updateFeeInvoiceDetails(selectedInvoice.id, {
      totalAmount: Number(totalAmount),
      paidAmount: Number(paidAmount),
      balance: Number(balance),
      dueDate,
      status,
      notes: adjustmentReason,
    });

    editStudentFeeBalance(selectedInvoice.id, Number(balance), adjustmentReason);

    // Optionally notify guardian
    if (notifyParent && student) {
      sendAutomatedNoticeToParent(student.id, 'fee_reminder');
    }

    setIsSaved(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  Finance Department • Edit Fee & Balance
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Bursar Access
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Adjust tuition records, balance arrears, discounts, and payment clearance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isSaved ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Student Fee Balance Updated!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The institutional ledger has been synchronized. {student?.firstName} {student?.lastName}&apos;s new
                fee balance is <strong>KSh {balance.toLocaleString()}</strong> ({status.toUpperCase()}).
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <div className="flex justify-between">
                <span>Invoice Number:</span>
                <span className="font-bold text-slate-900">{selectedInvoice?.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Billed:</span>
                <span className="font-bold text-slate-900">KSh {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Cleared:</span>
                <span className="font-bold text-emerald-600">KSh {paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Outstanding Balance:</span>
                <span className="font-bold text-amber-600">KSh {balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Recorded By:</span>
                <span className="font-semibold text-indigo-700">
                  {currentUser?.name || 'Mr. James Kariuki'} (Finance Department)
                </span>
              </div>
            </div>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Done & Return to Ledger
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Student & Invoice Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Student Fee Invoice
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleSelectInvoice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {invoices.map((inv) => {
                  const st = students.find((s) => s.id === inv.studentId);
                  return (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo} — {st ? `${st.firstName} ${st.lastName} (${st.grade}-${st.section})` : 'Student'} • Due: KSh {inv.balance.toLocaleString()} ({inv.status})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Student Info Card */}
            {student && selectedInvoice && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={student.avatar}
                    alt={student.firstName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-300"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Admission: <span className="font-mono font-medium">{student.admissionNo}</span> • Class: {student.grade} - {student.section}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Guardian: {student.guardian.name} ({student.guardian.phone})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 block">Current Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoice.status === 'overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
            )}

            {/* Financial Balance Editing Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Fee Billing (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                    KSh
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={totalAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalAmount(val);
                      setBalance(Math.max(0, val - paidAmount));
                    }}
                    className="w-full pl-11 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Full term tuition + levies</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Paid to Date (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                    KSh
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={paidAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPaidAmount(val);
                      setBalance(Math.max(0, totalAmount - val));
                    }}
                    className="w-full pl-11 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Cleared payments</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                  Outstanding Balance (KSh) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-[11px]">
                    KSh
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={balance}
                    onChange={(e) => handleBalanceInput(Number(e.target.value))}
                    className="w-full pl-11 pr-3 py-2 bg-indigo-50/50 border-2 border-indigo-400 rounded-xl text-xs font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">
                  Editable student balance
                </span>
              </div>
            </div>

            {/* Quick Balance Adjustment Shortcuts */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Quick Finance Department Adjustments:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={applyQuickClear}
                  className="px-2.5 py-1 text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition"
                >
                  ✓ Mark Balance as Fully Cleared (KSh 0)
                </button>
                <button
                  type="button"
                  onClick={() => applyWaiverPercent(25)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition flex items-center space-x-1"
                >
                  <Percent className="w-3 h-3" />
                  <span>25% Sibling / Hardship Waiver</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyWaiverPercent(50)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition flex items-center space-x-1"
                >
                  <Percent className="w-3 h-3" />
                  <span>50% Bursary Grant</span>
                </button>
              </div>
            </div>

            {/* Due Date and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Due Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FeeStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="paid">Paid (Fully Cleared)</option>
                  <option value="partial">Partial Payment</option>
                  <option value="pending">Pending Due</option>
                  <option value="overdue">Overdue (Past Deadline)</option>
                </select>
              </div>
            </div>

            {/* Official Audit Reason */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Audit Reason & Adjustment Memo
              </label>
              <textarea
                rows={2}
                required
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="State the official reason for altering this student fee balance..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notify Guardian Checkbox */}
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyParent}
                onChange={(e) => setNotifyParent(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="font-medium">
                Dispatch automated SMS & portal notice to student&apos;s guardian regarding the updated balance
              </span>
            </label>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save & Update Fee Balance</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
