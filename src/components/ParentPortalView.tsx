import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  User,
  Award,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Printer,
  ChevronRight,
  Download,
  FileDown,
  Loader2,
  Check,
  Receipt,
  Building2,
  FileSpreadsheet,
  ArrowDownToLine,
  ShieldCheck,
} from 'lucide-react';
import {
  generateAndDownloadStudentReportCard,
  generateAndDownloadFeeStatement,
  generateAndDownloadRemittanceHistoryPDF,
  downloadRemittanceHistoryCSV,
  generateAndDownloadSingleReceiptPDF,
} from '../utils/pdfExport';
import { FeePaymentRecord } from '../types';
import { FeeStatementModal } from './FeeStatementModal';

interface ParentPortalViewProps {
  onOpenReportCard: (studentId: string) => void;
  onOpenPaymentModal: (invoiceId: string) => void;
  onNavigateToMessaging: () => void;
  onOpenFeeStatement?: (studentId: string, invoiceId?: string) => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  onOpenReportCard,
  onOpenPaymentModal,
  onNavigateToMessaging,
  onOpenFeeStatement,
}) => {
  const {
    students,
    academicRecords,
    attendance,
    invoices,
    threads,
    messages,
    announcements,
    sendDirectMessage,
    getStudentAttendanceRate,
  } = useSchool();

  // Active student in parent view (default Liam Davis, but parent can switch)
  const [activeChildId, setActiveChildId] = useState<string>(students[0]?.id || 'std-1');
  const [chatMessage, setChatMessage] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState(false);
  const [isDownloadingFeePdf, setIsDownloadingFeePdf] = useState(false);
  const [downloadFeeSuccessMessage, setDownloadFeeSuccessMessage] = useState(false);
  const [isDownloadingRemittancePdf, setIsDownloadingRemittancePdf] = useState(false);
  const [downloadRemittanceSuccess, setDownloadRemittanceSuccess] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState<string | null>(null);
  const [selectedStatementStudentId, setSelectedStatementStudentId] = useState<string | null>(null);

  const child = students.find((s) => s.id === activeChildId) || students[0];
  const academic = child ? academicRecords.find((r) => r.studentId === child.id) : undefined;
  const childAttendance = child ? attendance.filter((a) => a.studentId === child.id) : [];
  const childInvoices = child ? invoices.filter((i) => i.studentId === child.id) : [];
  const invoice = childInvoices[0];
  const thread = child ? threads.find((t) => t.studentId === child.id) : undefined;
  const threadMessages = thread ? messages.filter((m) => m.threadId === thread.id) : [];
  const attendanceRate = child ? getStudentAttendanceRate(child.id) : 98;

  // Today's attendance
  const todayEntry = childAttendance.find((a) => a.date === '2026-09-10');

  const handleSendParentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !child) return;

    sendDirectMessage(child.id, chatMessage.trim(), 'general', {
      role: 'parent',
      name: child.guardian.name,
    });

    setChatMessage('');
  };

  const handleDownloadDirectPDF = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!child || !academic) return;

    setIsDownloadingPdf(true);
    setDownloadSuccessMessage(false);

    setTimeout(() => {
      try {
        generateAndDownloadStudentReportCard(child, academic);
        setDownloadSuccessMessage(true);
        setTimeout(() => setDownloadSuccessMessage(false), 4000);
      } catch (err) {
        console.error('Failed to download report card PDF:', err);
      } finally {
        setIsDownloadingPdf(false);
      }
    }, 400);
  };

  const handleDownloadFeeStatementPDF = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!child || !invoice) return;

    setIsDownloadingFeePdf(true);
    setDownloadFeeSuccessMessage(false);

    setTimeout(() => {
      try {
        generateAndDownloadFeeStatement(child, invoice);
        setDownloadFeeSuccessMessage(true);
        setTimeout(() => setDownloadFeeSuccessMessage(false), 4000);
      } catch (err) {
        console.error('Failed to download fee statement PDF:', err);
      } finally {
        setIsDownloadingFeePdf(false);
      }
    }, 400);
  };

  const handleDownloadRemittanceHistoryPDF = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!child || !invoice) return;

    setIsDownloadingRemittancePdf(true);
    setDownloadRemittanceSuccess(false);

    setTimeout(() => {
      try {
        generateAndDownloadRemittanceHistoryPDF(child, invoice);
        setDownloadRemittanceSuccess(true);
        setTimeout(() => setDownloadRemittanceSuccess(false), 4000);
      } catch (err) {
        console.error('Failed to download remittance history PDF:', err);
      } finally {
        setIsDownloadingRemittancePdf(false);
      }
    }, 400);
  };

  const handleDownloadRemittanceCSV = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!child || !invoice) return;
    downloadRemittanceHistoryCSV(child, invoice);
    setDownloadRemittanceSuccess(true);
    setTimeout(() => setDownloadRemittanceSuccess(false), 4000);
  };

  const handleDownloadSingleReceipt = (pmt: FeePaymentRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!child || !invoice) return;

    setDownloadingReceiptId(pmt.id);
    setTimeout(() => {
      try {
        generateAndDownloadSingleReceiptPDF(child, invoice, pmt);
      } catch (err) {
        console.error('Failed to download single payment receipt:', err);
      } finally {
        setDownloadingReceiptId(null);
      }
    }, 300);
  };

  const handleOpenStatement = (studentId: string, invoiceId?: string) => {
    if (onOpenFeeStatement) {
      onOpenFeeStatement(studentId, invoiceId);
    } else {
      setSelectedStatementStudentId(studentId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-500/30">
            <span>Verified Parent Portal</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Welcome, {child.guardian.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitoring academic progression, attendance verification, and school fee records for {child.firstName}.
          </p>
        </div>

        {/* Child Selector Switcher if family has multiple students */}
        <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-xl backdrop-blur-xs">
          <span className="text-xs text-slate-300 font-medium">Viewing Student:</span>
          <select
            value={activeChildId}
            onChange={(e) => setActiveChildId(e.target.value)}
            className="bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg border-none focus:outline-hidden"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Download Alert Notifications */}
      {downloadSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Report Card Downloaded (&lt; 2MB)!</strong> {child.firstName}&apos;s Official Term 2 Academic Transcript PDF has been compressed and saved to your device to optimize storage.
            </span>
          </div>
          <button
            onClick={() => setDownloadSuccessMessage(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {downloadFeeSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>School Fee Statement Downloaded (&lt; 2MB)!</strong> Official Statement #{invoice?.invoiceNo} for {child.firstName} {child.lastName} has been compressed to &lt; 2MB to save storage space.
            </span>
          </div>
          <button
            onClick={() => setDownloadFeeSuccessMessage(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {downloadRemittanceSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Fee Remittance History Downloaded (&lt; 2MB)!</strong> Official payment receipts and audit trail for {child.firstName} {child.lastName} compressed to &lt; 2MB to save storage space.
            </span>
          </div>
          <button
            onClick={() => setDownloadRemittanceSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Child Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Academic GPA Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Milestone</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{academic?.overallGpa.toFixed(2)}</span>
              <span className="text-xs font-medium text-slate-400">/ 4.0 GPA</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100">
            <span className="text-xs text-slate-500">Rank #{academic?.rank || 2} of {academic?.totalStudentsInClass || 28}</span>
            <div className="flex items-center space-x-2">
              <button
                id="parent-quick-download-pdf-btn"
                onClick={handleDownloadDirectPDF}
                disabled={isDownloadingPdf}
                title="Download PDF directly to your device"
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-colors"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>PDF</span>
              </button>
              <button
                id="parent-view-report-card-btn"
                onClick={() => onOpenReportCard(child.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                View →
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Status</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-600">{attendanceRate}%</span>
            <span className="text-xs font-medium text-slate-400">Term Consistency</span>
          </div>
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Today:</span>
            <span className="font-bold text-emerald-700">
              {todayEntry ? todayEntry.status.toUpperCase() : 'PRESENT (07:55 AM)'}
            </span>
          </div>
        </div>

        {/* Fee Payment Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">School Fee Balance</span>
              <CreditCard className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-2xl font-bold ${(invoice?.balance || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                KSh {(invoice?.balance || 0).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {(invoice?.balance || 0) > 0 ? 'Outstanding' : 'Cleared'}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Due: {invoice?.dueDate}</span>
            <div className="flex items-center space-x-2">
              <button
                id="parent-quick-download-fee-pdf-btn"
                onClick={handleDownloadFeeStatementPDF}
                disabled={isDownloadingFeePdf}
                title="Download School Fee Statement PDF directly"
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition-colors"
              >
                {isDownloadingFeePdf ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>PDF</span>
              </button>
              <button
                id="parent-view-fee-statement-btn"
                onClick={() => invoice && handleOpenStatement(child.id, invoice.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Statement →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Download Banners: Report Card & Fee Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Report Card */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <FileDown className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white tracking-tight">Academic Report Card</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Certified
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Term 2 transcript for {child.firstName} ({child.grade}) with teacher remarks and GPA marks.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
            <button
              id="parent-banner-download-btn"
              onClick={handleDownloadDirectPDF}
              disabled={isDownloadingPdf}
              className="flex-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report Card (PDF • &lt; 2MB)</span>
                </>
              )}
            </button>
            <button
              id="parent-banner-view-btn"
              onClick={() => onOpenReportCard(child.id)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>

        {/* Banner 2: Official Fee Statement */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Receipt className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white tracking-tight">Official Fee Statement</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  KSh Ledger
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Itemized tuition breakdown, M-Pesa receipts audit trail, and cleared balance invoice #{invoice?.invoiceNo}.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
            <button
              id="parent-banner-download-fee-btn"
              onClick={handleDownloadFeeStatementPDF}
              disabled={isDownloadingFeePdf}
              className="flex-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              {isDownloadingFeePdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Fee Statement (PDF • &lt; 2MB)</span>
                </>
              )}
            </button>
            <button
              id="parent-banner-view-fee-btn"
              onClick={() => invoice && handleOpenStatement(child.id, invoice.id)}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
            >
              Statement
            </button>
            {(invoice?.balance || 0) > 0 && (
              <button
                onClick={() => invoice && onOpenPaymentModal(invoice.id)}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs transition-colors"
              >
                Pay
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dedicated School Fee & Financial Statement Section */}
      {invoice && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {child.firstName}&apos;s Term 2 School Fee Statement & Itemized Ledger
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official invoice #{invoice.invoiceNo} • Issued: {invoice.issuedDate} • Due: {invoice.dueDate}
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                id="parent-section-download-remittance-pdf-btn"
                onClick={handleDownloadRemittanceHistoryPDF}
                disabled={isDownloadingRemittancePdf}
                title="Download verified fee remittance history and receipt audit trail as PDF"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                {isDownloadingRemittancePdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Remittance History (PDF • &lt; 2MB)</span>
              </button>

              <button
                id="parent-section-download-fee-pdf-btn"
                onClick={handleDownloadFeeStatementPDF}
                disabled={isDownloadingFeePdf}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                {isDownloadingFeePdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download Statement (PDF • &lt; 2MB)</span>
              </button>

              <button
                id="parent-section-preview-statement-btn"
                onClick={() => handleOpenStatement(child.id, invoice.id)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Ledger</span>
              </button>

              {invoice.balance > 0 && (
                <button
                  onClick={() => onOpenPaymentModal(invoice.id)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay KSh {invoice.balance.toLocaleString()}</span>
                </button>
              )}
            </div>
          </div>

          {/* Fee Itemization & Payment Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Itemized Bill List */}
            <div className="lg:col-span-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Itemized Tuition & CBC Levies
              </span>
              <div className="space-y-2">
                {invoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.description}</div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Category: {item.category}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">
                      KSh {item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Balance & Payment Channels */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-200 pb-1.5">
                  Account Position (KSh)
                </span>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Invoiced:</span>
                  <span className="font-mono font-bold text-slate-900">
                    KSh {invoice.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Remitted:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    KSh {invoice.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Net Due:</span>
                  <span
                    className={`font-mono font-black ${
                      invoice.balance <= 0 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    KSh {invoice.balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct Remittance Channels</span>
                </div>
                <p>• M-Pesa Paybill: <strong>247247</strong></p>
                <p>• Account: <strong>{child.admissionNo}</strong></p>
                <p>• Bank: Equity Bank A/C 011029384756</p>
              </div>
            </div>
          </div>

          {/* Payment Receipts & Remittance Audit Ledger (Amount Paid, When Paid, Account Paid From) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Verified Remittance History (Amount Paid, When Paid & Source Account)</span>
                  </div>
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Finance Live Auto-Synced</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time audit trail: All fee payments recorded or updated by the Finance Department update this ledger and receipts automatically.
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  id="parent-table-download-remittance-pdf-btn"
                  onClick={handleDownloadRemittanceHistoryPDF}
                  disabled={isDownloadingRemittancePdf}
                  title="Download Official Fee Remittance History as PDF"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                >
                  {isDownloadingRemittancePdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download Remittance (PDF • &lt; 2MB)</span>
                </button>

                <button
                  id="parent-table-download-remittance-csv-btn"
                  onClick={handleDownloadRemittanceCSV}
                  title="Export Remittance History to CSV Spreadsheet"
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>

                <span className="text-[11px] text-slate-500 font-medium pl-1">
                  {invoice.paymentHistory?.length || 0} verified transaction(s)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-3.5 py-2">Receipt #</th>
                    <th className="px-3.5 py-2">When Paid (Date)</th>
                    <th className="px-3.5 py-2">Paid From Account</th>
                    <th className="px-3.5 py-2">Channel</th>
                    <th className="px-3.5 py-2">Payer / Remitter</th>
                    <th className="px-3.5 py-2">Verified By</th>
                    <th className="px-3.5 py-2 text-right">Amount Paid</th>
                    <th className="px-3.5 py-2 text-center">Receipt PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
                    invoice.paymentHistory.map((pmt, pIdx) => (
                      <tr key={pmt.id || pIdx} className={pIdx % 2 === 1 ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}>
                        <td className="px-3.5 py-2 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          <span>{pmt.receiptNo}</span>
                          {pIdx === 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                              Latest
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-slate-800 font-semibold whitespace-nowrap">
                          {pmt.date}
                        </td>
                        <td className="px-3.5 py-2">
                          <span className="font-mono text-[11px] font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {pmt.payerAccount || 'Direct M-Pesa / Bank Channel'}
                          </span>
                        </td>
                        <td className="px-3.5 py-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 whitespace-nowrap">
                            {pmt.paymentMethod}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-slate-700">
                          {pmt.payerName || child.guardian.name}
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{pmt.recordedBy || 'Finance Office'}</span>
                          </span>
                        </td>
                        <td className="px-3.5 py-2 text-right font-mono font-black text-emerald-700 whitespace-nowrap">
                          KSh {pmt.amount.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => handleDownloadSingleReceipt(pmt, e)}
                            disabled={downloadingReceiptId === pmt.id}
                            title="Download official receipt PDF for this remittance"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition-colors shadow-2xs"
                          >
                            {downloadingReceiptId === pmt.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                            ) : (
                              <Download className="w-3 h-3 text-indigo-600" />
                            )}
                            <span>Receipt (&lt; 2MB)</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3.5 py-4 text-center text-slate-400 italic">
                        No payments recorded for this statement period yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Split: Academic Breakdown vs Direct Chat with School */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Term Subject Marks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{child.firstName}&apos;s Academic Performance</h3>
              <p className="text-xs text-slate-500">{academic?.term} {academic?.academicYear} Grade Breakdown</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="parent-subject-download-pdf-btn"
                onClick={handleDownloadDirectPDF}
                disabled={isDownloadingPdf}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => onOpenReportCard(child.id)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Transcript</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {academic?.subjects.map((sub) => (
              <div key={sub.subjectId} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{sub.subjectName}</div>
                  <span className="text-[11px] text-slate-500">Teacher: {sub.teacherName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs block">{sub.totalScore}%</span>
                    <span className="text-[10px] text-slate-400">Score</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 font-black text-xs font-mono">
                    {sub.letterGrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Direct Parent Chat with Teachers & Bursar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Direct School Communication Desk</h3>
              <p className="text-xs text-slate-500">Contact {child.firstName}&apos;s class advisor and school registrar</p>
            </div>
            <button
              onClick={onNavigateToMessaging}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Full Hub →
            </button>
          </div>

          {/* Messages Stream */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {threadMessages.slice(-5).map((msg) => {
              const isMine = msg.senderRole === 'parent';
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs max-w-sm ${
                    isMine
                      ? 'bg-indigo-600 text-white ml-auto'
                      : 'bg-slate-100 text-slate-800 mr-auto'
                  }`}
                >
                  <div className="flex justify-between text-[10px] opacity-75 font-semibold mb-1">
                    <span>{msg.senderName}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              );
            })}
          </div>

          {/* Quick reply */}
          <form onSubmit={handleSendParentMessage} className="flex space-x-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder={`Send message to ${child.firstName}'s teacher...`}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center space-x-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* School Circulars Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">School Circulars & Notifications for Parents</h3>
          </div>
          <span className="text-xs text-slate-500">{announcements.length} bulletins active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {ann.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
              </div>
              <h4 className="font-bold text-slate-900">{ann.title}</h4>
              <p className="text-slate-600 leading-relaxed line-clamp-3">{ann.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Local Fee Statement Modal if opened */}
      {selectedStatementStudentId && (
        <FeeStatementModal
          studentId={selectedStatementStudentId}
          onClose={() => setSelectedStatementStudentId(null)}
          onOpenPayment={(invId) => {
            setSelectedStatementStudentId(null);
            onOpenPaymentModal(invId);
          }}
        />
      )}
    </div>
  );
};
