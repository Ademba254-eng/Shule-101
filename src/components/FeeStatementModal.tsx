import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Shule101Logo } from './Shule101Logo';
import {
  Download,
  Printer,
  CheckCircle2,
  Loader2,
  CreditCard,
  ShieldCheck,
  Receipt,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Calendar,
  Building,
  Info,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';
import { FeeCategory, FeeInvoiceItem, FeePaymentRecord, FeeStatus } from '../types';
import {
  downloadFeeStatementPDF,
  generateAndDownloadFeeStatement,
  generateAndDownloadRemittanceHistoryPDF,
  downloadRemittanceHistoryCSV,
  generateAndDownloadSingleReceiptPDF,
} from '../utils/pdfExport';

interface FeeStatementModalProps {
  studentId: string;
  invoiceId?: string;
  onClose: () => void;
  onOpenPayment?: (invoiceId: string) => void;
  initialEditMode?: boolean;
}

export const FeeStatementModal: React.FC<FeeStatementModalProps> = ({
  studentId,
  invoiceId,
  onClose,
  onOpenPayment,
  initialEditMode = false,
}) => {
  const {
    students,
    invoices,
    activeRole,
    activeDivision,
    currentUser,
    updateFullFeeStatement,
    sendAutomatedNoticeToParent,
  } = useSchool();

  const isFinance = activeDivision === 'finance' || currentUser?.staffDivision === 'finance';
  const canEdit = isFinance || currentUser?.isAdmin;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloadingRemittance, setIsDownloadingRemittance] = useState(false);
  const [downloadRemittanceSuccess, setDownloadRemittanceSuccess] = useState(false);
  const [downloadingSingleReceiptId, setDownloadingSingleReceiptId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialEditMode && canEdit);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const student = students.find((s) => s.id === studentId);
  const invoice = invoiceId
    ? invoices.find((inv) => inv.id === invoiceId)
    : invoices.find((inv) => inv.studentId === studentId);

  // Edit draft states
  const [editInvoiceNo, setEditInvoiceNo] = useState(invoice?.invoiceNo || '');
  const [editTerm, setEditTerm] = useState(invoice?.term || 'Term 2');
  const [editAcademicYear, setEditAcademicYear] = useState(invoice?.academicYear || '2025/2026');
  const [editIssuedDate, setEditIssuedDate] = useState(invoice?.issuedDate || '2026-08-15');
  const [editDueDate, setEditDueDate] = useState(invoice?.dueDate || '2026-09-30');
  const [editStatus, setEditStatus] = useState<FeeStatus>(invoice?.status || 'pending');
  const [editItems, setEditItems] = useState<FeeInvoiceItem[]>(invoice ? [...invoice.items] : []);
  const [editPayments, setEditPayments] = useState<FeePaymentRecord[]>(
    invoice ? [...invoice.paymentHistory] : []
  );
  const [auditReason, setAuditReason] = useState(
    'Finance Department ledger audit and fee statement revision'
  );
  const [notifyParentOnSave, setNotifyParentOnSave] = useState(true);

  if (!student || !invoice) return null;

  // Real-time calculations for draft
  const draftTotalAmount = editItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const draftPaidAmount = editPayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
  const draftBalance = Math.max(0, draftTotalAmount - draftPaidAmount);

  const handleStartEdit = () => {
    setEditInvoiceNo(invoice.invoiceNo);
    setEditTerm(invoice.term);
    setEditAcademicYear(invoice.academicYear);
    setEditIssuedDate(invoice.issuedDate);
    setEditDueDate(invoice.dueDate);
    setEditStatus(invoice.status);
    setEditItems(invoice.items ? JSON.parse(JSON.stringify(invoice.items)) : []);
    setEditPayments(invoice.paymentHistory ? JSON.parse(JSON.stringify(invoice.paymentHistory)) : []);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const newItem: FeeInvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'CBC Academic Learning & Activity Levy',
      amount: 2500,
      category: 'Tuition',
    };
    setEditItems([...editItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof FeeInvoiceItem, value: any) => {
    setEditItems(
      editItems.map((it) => (it.id === id ? { ...it, [field]: field === 'amount' ? Number(value) : value } : it))
    );
  };

  const handleDeleteItem = (id: string) => {
    setEditItems(editItems.filter((it) => it.id !== id));
  };

  const handleAddPayment = () => {
    const newPayment: FeePaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: 10000,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Mobile Money',
      payerAccount: `M-Pesa (${student.guardian.phone})`,
      payerName: student.guardian.name,
      notes: 'Payment verified and credited by Finance Office',
      recordedBy: `${currentUser?.name || 'Bursar'} (Finance Dept)`,
    };
    setEditPayments([newPayment, ...editPayments]);
  };

  const handleUpdatePayment = (id: string, field: keyof FeePaymentRecord, value: any) => {
    setEditPayments(
      editPayments.map((p) => (p.id === id ? { ...p, [field]: field === 'amount' ? Number(value) : value } : p))
    );
  };

  const handleDeletePayment = (id: string) => {
    setEditPayments(editPayments.filter((p) => p.id !== id));
  };

  const handleSaveStatement = (e: React.FormEvent) => {
    e.preventDefault();

    const calculatedStatus: FeeStatus =
      draftBalance <= 0 ? 'paid' : draftPaidAmount > 0 ? 'partial' : 'pending';

    updateFullFeeStatement(invoice.id, {
      invoiceNo: editInvoiceNo,
      term: editTerm,
      academicYear: editAcademicYear,
      issuedDate: editIssuedDate,
      dueDate: editDueDate,
      totalAmount: draftTotalAmount,
      paidAmount: draftPaidAmount,
      balance: draftBalance,
      status: calculatedStatus,
      items: editItems,
      paymentHistory: editPayments,
    });

    if (notifyParentOnSave && student) {
      sendAutomatedNoticeToParent(student.id, 'fee_reminder');
    }

    setIsEditing(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const success = await downloadFeeStatementPDF(
        'printable-fee-statement',
        `${student.firstName}_${student.lastName}`,
        invoice.invoiceNo
      );

      if (!success) {
        generateAndDownloadFeeStatement(student, invoice);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Error generating fee statement PDF:', err);
      generateAndDownloadFeeStatement(student, invoice);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadRemittancePDF = () => {
    if (!student || !invoice) return;
    setIsDownloadingRemittance(true);
    setDownloadRemittanceSuccess(false);
    setTimeout(() => {
      try {
        generateAndDownloadRemittanceHistoryPDF(student, invoice);
        setDownloadRemittanceSuccess(true);
        setTimeout(() => setDownloadRemittanceSuccess(false), 4000);
      } catch (err) {
        console.error('Failed to download remittance history PDF:', err);
      } finally {
        setIsDownloadingRemittance(false);
      }
    }, 400);
  };

  const handleDownloadRemittanceCSV = () => {
    if (!student || !invoice) return;
    downloadRemittanceHistoryCSV(student, invoice);
    setDownloadRemittanceSuccess(true);
    setTimeout(() => setDownloadRemittanceSuccess(false), 4000);
  };

  const handleDownloadSingleReceipt = (pmt: FeePaymentRecord) => {
    if (!student || !invoice) return;
    setDownloadingSingleReceiptId(pmt.id);
    setTimeout(() => {
      try {
        generateAndDownloadSingleReceiptPDF(student, invoice, pmt);
      } catch (err) {
        console.error('Failed to download single payment receipt:', err);
      } finally {
        setDownloadingSingleReceiptId(null);
      }
    }, 300);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-full uppercase tracking-wider">
            Cleared / Paid in Full
          </span>
        );
      case 'partial':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-full uppercase tracking-wider">
            Partially Paid
          </span>
        );
      case 'overdue':
        return (
          <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs rounded-full uppercase tracking-wider">
            Overdue
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-full uppercase tracking-wider">
            Pending Payment
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight block">
                {isEditing ? 'Finance Department • Fee Statement & Ledger Editor' : 'Official Student Fee Statement & Ledger'}
              </span>
              {activeRole === 'parent' ? (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                  Parent Portal Access
                </span>
              ) : isFinance ? (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-full">
                  Finance Bursary Authority
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded-full">
                  Faculty Access
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Accounts & Bursar Office • Invoice #{invoice.invoiceNo} • {invoice.term} {invoice.academicYear}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Back Button */}
            <button
              id="modal-back-fee-statement-btn"
              type="button"
              onClick={isEditing ? handleCancelEdit : onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
              title={isEditing ? 'Cancel editing and return to view mode' : 'Return to previous screen'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span>Back</span>
            </button>

            {/* Finance Department Edit Statement Toggle Button */}
            {canEdit && !isEditing && (
              <button
                id="modal-edit-fee-statement-btn"
                type="button"
                onClick={handleStartEdit}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                title="Edit Fee Statement breakdown, levies, and payment records"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Statement (Finance)</span>
              </button>
            )}

            {!isEditing && (
              <>
                {/* Download Remittance History Button */}
                <button
                  id="modal-download-remittance-btn"
                  onClick={handleDownloadRemittancePDF}
                  disabled={isDownloadingRemittance}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    downloadRemittanceSuccess
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-xs'
                  }`}
                  title="Download verified fee remittance history and payment receipts audit PDF"
                >
                  {isDownloadingRemittance ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Remittance PDF...</span>
                    </>
                  ) : downloadRemittanceSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Remittance Downloaded (&lt; 2MB)!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Remittance History (PDF • &lt; 2MB)</span>
                    </>
                  )}
                </button>

                {/* Download PDF Button */}
                <button
                  id="modal-download-fee-statement-btn"
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
                      <span>Compressing & Preparing PDF...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Statement Downloaded (&lt; 2MB)!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Statement (PDF • &lt; 2MB)</span>
                    </>
                  )}
                </button>

                {/* Print */}
                <button
                  id="modal-print-fee-statement-btn"
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                  <span>Print Statement</span>
                </button>

                {/* Pay balance if outstanding and handler provided */}
                {invoice.balance > 0 && onOpenPayment && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPayment(invoice.id);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Online</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Success Alert Banner if saved */}
        {saveSuccessNotice && (
          <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Fee Statement Successfully Updated!</strong> The ledger and itemized schedule for{' '}
                <strong>
                  {student.firstName} {student.lastName}
                </strong>{' '}
                have been updated across both Finance Department and Parent Portal views.
              </span>
            </div>
            <button
              onClick={() => setSaveSuccessNotice(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FINANCE EDIT MODE */}
        {/* ------------------------------------------------------------- */}
        {isEditing ? (
          <form onSubmit={handleSaveStatement} className="p-6 sm:p-8 space-y-6 text-xs bg-slate-50/50">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Edit Fee Statement & Remittance Ledger
                  </h2>
                  <p className="text-slate-500 text-[11px]">
                    Student: <strong>{student.firstName} {student.lastName}</strong> ({student.admissionNo} • {student.grade})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Statement</span>
                </button>
              </div>
            </div>

            {/* Header / Term Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={editInvoiceNo}
                  onChange={(e) => setEditInvoiceNo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Term & Academic Year
                </label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={editTerm}
                    onChange={(e) => setEditTerm(e.target.value)}
                    className="w-1/2 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                    placeholder="Term 2"
                    required
                  />
                  <input
                    type="text"
                    value={editAcademicYear}
                    onChange={(e) => setEditAcademicYear(e.target.value)}
                    className="w-1/2 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                    placeholder="2025/2026"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Issued Date
                </label>
                <input
                  type="date"
                  value={editIssuedDate}
                  onChange={(e) => setEditIssuedDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Section 1: Itemized Fee Schedule Items */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    1. Itemized Fee Components & Levies
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center space-x-1 border border-indigo-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {editItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 items-center"
                  >
                    <div className="sm:col-span-6">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Category
                      </label>
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value as FeeCategory)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                      >
                        <option value="Tuition">Tuition</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Transport">Transport</option>
                        <option value="Extracurricular">Extracurricular</option>
                        <option value="Examination">Examination</option>
                        <option value="Annual Package">Annual Package</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Amount (KSh)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.amount}
                        onChange={(e) => handleUpdateItem(item.id, 'amount', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        required
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={editItems.length <= 1}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg disabled:opacity-30 transition"
                        title="Delete component"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-900">
                <span>Total Invoiced Fee Sum:</span>
                <span className="font-mono text-sm">KSh {draftTotalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Section 2: Payment Receipts & Remittances Ledger */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block">
                      2. Payment History (Amount Paid, When Paid, Account Paid From)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      This information is directly presented to parents on their statement
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs flex items-center space-x-1 border border-emerald-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Payment Entry</span>
                </button>
              </div>

              {editPayments.length === 0 ? (
                <div className="p-6 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                  No payment remittances recorded yet. Click &quot;Add Payment Entry&quot; to credit a payment.
                </div>
              ) : (
                <div className="space-y-3">
                  {editPayments.map((pay, pIdx) => (
                    <div
                      key={pay.id || pIdx}
                      className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Receipt #
                          </label>
                          <input
                            type="text"
                            value={pay.receiptNo}
                            onChange={(e) => handleUpdatePayment(pay.id, 'receiptNo', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-indigo-700"
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-emerald-800 mb-0.5">
                            Amount Paid (KSh) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="100"
                            value={pay.amount}
                            onChange={(e) => handleUpdatePayment(pay.id, 'amount', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border-2 border-emerald-400 rounded-lg text-xs font-mono font-black text-emerald-800"
                            required
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            When Paid (Date) *
                          </label>
                          <input
                            type="date"
                            value={pay.date}
                            onChange={(e) => handleUpdatePayment(pay.id, 'date', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                            required
                          />
                        </div>

                        <div className="sm:col-span-3 flex justify-between items-center pt-2 sm:pt-0">
                          <div className="w-full pr-2">
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                              Channel / Method
                            </label>
                            <select
                              value={pay.paymentMethod}
                              onChange={(e) => handleUpdatePayment(pay.id, 'paymentMethod', e.target.value as any)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                            >
                              <option value="Mobile Money">Mobile Money (M-Pesa)</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Cash">Cash at Bursar Desk</option>
                              <option value="Credit/Debit Card">Card Payment</option>
                              <option value="Online Portal">Parent Online Portal</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(pay.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition mt-3"
                            title="Remove payment record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Explicit Account Paid From and Payer Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-emerald-100">
                        <div>
                          <label className="block text-[10px] font-bold text-indigo-700 mb-0.5">
                            Paid From Account / Number *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. M-Pesa 0712 345 678, Equity Bank A/C 011029384756"
                            value={pay.payerAccount || ''}
                            onChange={(e) => handleUpdatePayment(pay.id, 'payerAccount', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-medium text-slate-900"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Remitter / Payer Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sarah Davis (Guardian)"
                            value={pay.payerName || ''}
                            onChange={(e) => handleUpdatePayment(pay.id, 'payerName', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Reference / Notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Paybill #247247 Ref QKH82914K"
                            value={pay.notes || ''}
                            onChange={(e) => handleUpdatePayment(pay.id, 'notes', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-900 border border-emerald-200">
                <span>Total Remitted Payments:</span>
                <span className="font-mono text-sm text-emerald-800">KSh {draftPaidAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Financial Recalculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Billed (KSh)
                </span>
                <span className="text-base font-black text-slate-900 font-mono mt-0.5 block">
                  KSh {draftTotalAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Total Paid (KSh)
                </span>
                <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
                  KSh {draftPaidAmount.toLocaleString()}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border text-center ${
                  draftBalance <= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                  Net Balance Due (KSh)
                </span>
                <span className="text-base font-black font-mono mt-0.5 block">
                  {draftBalance <= 0 ? 'FULLY CLEARED (KSh 0)' : `KSh ${draftBalance.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Audit Reason & Guardian Notification */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Finance Audit Reason & Reason for Edit
                </label>
                <input
                  type="text"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="State official reason for amending this statement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  required
                />
              </div>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyParentOnSave}
                  onChange={(e) => setNotifyParentOnSave(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium">
                  Dispatch automated SMS & portal notice to student&apos;s guardian regarding the updated fee statement
                </span>
              </label>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Cancel / Exit Edit Mode
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-md transition"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Statement Changes</span>
              </button>
            </div>
          </form>
        ) : (
          /* ------------------------------------------------------------- */
          /* OFFICIAL READ-ONLY & PRINTABLE FEE STATEMENT VIEW */
          /* ------------------------------------------------------------- */
          <div id="printable-fee-statement" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 font-sans">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
              <div className="flex items-center space-x-4">
                <Shule101Logo variant="mark" size="lg" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    SHULE 101 ACADEMY
                  </h1>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mt-0.5">
                    Office of the Bursar & Directorate of Finance
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    National Code: SC-2026 • accounts@shule101.edu • Tel: +254 700 123 456 / (555) 019-2831
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-block">{getStatusBadge(invoice.status)}</div>
                <p className="text-xs font-mono font-bold text-slate-700 mt-2">
                  INVOICE: #{invoice.invoiceNo}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Cycle: {invoice.term} {invoice.academicYear}
                </p>
              </div>
            </div>

            {/* Statement Subject Banner */}
            <div className="bg-slate-100/90 py-2.5 px-4 rounded-xl text-center border border-slate-200">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                Official Student Fee Statement & Invoice Breakdown • {invoice.term} {invoice.academicYear}
              </h2>
            </div>

            {/* Student & Billing Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              {/* Student Info */}
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block border-b border-slate-200 pb-1">
                  Student Details
                </span>
                <div className="text-slate-500">
                  Name:{' '}
                  <strong className="text-slate-900 text-sm block">
                    {student.firstName} {student.lastName}
                  </strong>
                </div>
                <div className="text-slate-500">
                  Admission No: <strong className="text-slate-800 font-mono">{student.admissionNo}</strong>
                </div>
                <div className="text-slate-500">
                  Grade: <strong className="text-slate-800">{student.grade} ({student.section})</strong> • Roll #{student.rollNumber}
                </div>
              </div>

              {/* Guardian Info */}
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block border-b border-slate-200 pb-1">
                  Billed To (Guardian)
                </span>
                <div className="text-slate-500">
                  Parent / Guardian:{' '}
                  <strong className="text-slate-900 block">
                    {student.guardian.name} ({student.guardian.relation})
                  </strong>
                </div>
                <div className="text-slate-500">
                  Phone: <strong className="text-slate-800">{student.guardian.phone}</strong>
                </div>
                <div className="text-slate-500">
                  Email: <strong className="text-slate-800">{student.guardian.email}</strong>
                </div>
              </div>

              {/* Invoice Timeline */}
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block border-b border-slate-200 pb-1">
                  Billing Cycle & Terms
                </span>
                <div className="text-slate-500">
                  Issued Date: <strong className="text-slate-800">{invoice.issuedDate}</strong>
                </div>
                <div className="text-slate-500">
                  Due Date:{' '}
                  <strong className={(invoice.balance > 0) ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                    {invoice.dueDate}
                  </strong>
                </div>
                <div className="text-slate-500">
                  Billing Currency: <strong className="text-slate-800">Kenyan Shillings (KSh)</strong>
                </div>
              </div>
            </div>

            {/* Table 1: Itemized Fee Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  1. Itemized Fee Schedule & Levies
                </h3>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">#</th>
                      <th className="px-4 py-2.5">Fee Component & Description</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5 text-right">Amount (KSh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="px-4 py-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{item.description}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                          KSh {item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={3} className="px-4 py-2.5 text-right uppercase tracking-wider">
                        Total Invoiced Amount ({invoice.term})
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">
                        KSh {invoice.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Payment Receipts / Ledger (With Amount Paid, When Paid, and Account Paid From) */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    2. Payment Remittance & Account Audit History
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleDownloadRemittancePDF}
                    disabled={isDownloadingRemittance}
                    title="Download Official Fee Remittance History PDF"
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                  >
                    {isDownloadingRemittance ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    <span>Download Remittance (PDF • &lt; 2MB)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadRemittanceCSV}
                    title="Export Remittance History to CSV"
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                  >
                    <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Receipt #</th>
                      <th className="px-4 py-2.5">When Paid (Date)</th>
                      <th className="px-4 py-2.5">Paid From Account</th>
                      <th className="px-4 py-2.5">Channel / Method</th>
                      <th className="px-4 py-2.5">Payer / Remitter</th>
                      <th className="px-4 py-2.5">Reference / Notes</th>
                      <th className="px-4 py-2.5 text-right">Amount Paid</th>
                      <th className="px-4 py-2.5 text-center">Receipt PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
                      invoice.paymentHistory.map((pmt, idx) => (
                        <tr key={pmt.id} className={idx % 2 === 1 ? 'bg-slate-50/70 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}>
                          <td className="px-4 py-2.5 font-mono font-bold text-indigo-700">
                            {pmt.receiptNo}
                          </td>
                          <td className="px-4 py-2.5 text-slate-800 font-semibold whitespace-nowrap">
                            {pmt.date}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono text-[11px]">
                              {pmt.payerAccount || 'M-Pesa / Bank Channel'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 whitespace-nowrap">
                              {pmt.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 font-medium">
                            {pmt.payerName || student.guardian.name}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">
                            {pmt.notes || 'Official Remittance'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-black text-emerald-700 whitespace-nowrap">
                            KSh {pmt.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDownloadSingleReceipt(pmt)}
                              disabled={downloadingSingleReceiptId === pmt.id}
                              title="Download official receipt PDF for this transaction"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors shadow-2xs"
                            >
                              {downloadingSingleReceiptId === pmt.id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                              ) : (
                                <Download className="w-3 h-3 text-indigo-600" />
                              )}
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-4 text-center text-slate-400 italic">
                          No payments recorded for this statement period yet.
                        </td>
                      </tr>
                    )}
                    <tr className="bg-emerald-50 font-black text-emerald-900 border-t border-emerald-200">
                      <td colSpan={6} className="px-4 py-2.5 text-right uppercase tracking-wider">
                        Total Remitted & Cleared to Date
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm text-emerald-800">
                        KSh {invoice.paidAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Billed</span>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                  KSh {invoice.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Total Paid</span>
                <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                  KSh {invoice.paidAmount.toLocaleString()}
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border text-center ${
                  invoice.balance <= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                  Net Balance Due
                </span>
                <span className="text-lg font-black font-mono mt-0.5 block">
                  {invoice.balance <= 0 ? 'FULLY CLEARED (KSh 0)' : `KSh ${invoice.balance.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Instructions & Official Endorsement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wider block">
                  Bank & M-Pesa Payment Details
                </span>
                <p className="text-slate-600">
                  • <strong>M-Pesa Paybill:</strong> <span className="font-mono font-bold text-slate-900">247247</span> | <strong>Account:</strong> <span className="font-mono font-bold text-indigo-700">{student.admissionNo}</span>
                </p>
                <p className="text-slate-600">
                  • <strong>Equity Bank:</strong> <span className="font-mono font-bold text-slate-900">011029384756</span> (Shule 101)
                </p>
                <p className="text-slate-600">
                  • <strong>KCB Bank:</strong> <span className="font-mono font-bold text-slate-900">1122334455</span> (Branch: Westlands)
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wider block">
                  Bursar Clearance & Verification
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  This document serves as an authentic financial transcript generated from the Shule 101 Enterprise Accounts Ledger.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                  <span>Verified: {new Date().toLocaleDateString()}</span>
                  <span className="font-mono font-bold text-slate-700">STAMP: CLEARED-ACC-2026</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="text-center">
                <div className="w-48 border-b border-slate-400 pb-1 mb-1 mx-auto"></div>
                <span className="font-bold text-slate-800 block">Senior Bursar & Accounts Officer</span>
                <span className="text-[10px]">Directorate of Finance</span>
              </div>

              <div className="text-center">
                <div className="w-48 border-b border-slate-400 pb-1 mb-1 mx-auto"></div>
                <span className="font-bold text-slate-800 block">Margaret Hastings, Ph.D.</span>
                <span className="text-[10px]">Principal & Chief Accounting Officer</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
