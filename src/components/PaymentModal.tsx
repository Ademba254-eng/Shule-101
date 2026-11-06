import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { FeeInvoice } from '../types';
import { ShieldAlert, Send, ArrowLeft, Download, CheckCircle2, FileText } from 'lucide-react';
import { CompressedFileUpload } from './CompressedFileUpload';
import { generateAndDownloadSingleReceiptPDF } from '../utils/pdfExport';
import { CompressedFileResult } from '../utils/fileCompression';

interface PaymentModalProps {
  invoiceId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoiceId,
  onClose,
  onSuccess,
}) => {
  const { invoices, students, activeRole, activeDivision, recordFeePayment, sendAutomatedNoticeToParent, feeReceiptConfig } = useSchool();

  const isTeacher = activeRole === 'staff' && activeDivision === 'teacher';

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoiceId || invoices.find((inv) => inv.balance > 0)?.id || invoices[0]?.id || ''
  );

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);
  const student = selectedInvoice ? students.find((s) => s.id === selectedInvoice.studentId) : undefined;

  const [amount, setAmount] = useState<number>(selectedInvoice ? selectedInvoice.balance : 25000);
  const [method, setMethod] = useState<'Credit/Debit Card' | 'Bank Transfer' | 'Cash' | 'Mobile Money' | 'Online Portal'>('Mobile Money');
  const [payerAccount, setPayerAccount] = useState<string>(
    student ? `M-Pesa (${student.guardian.phone})` : 'M-Pesa (0712 345 678)'
  );
  const [payerName, setPayerName] = useState<string>(student?.guardian?.name || 'Parent / Guardian');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNotes, setReferenceNotes] = useState('');
  const [receiptGenerated, setReceiptGenerated] = useState<string | null>(null);
  const [remittanceProof, setRemittanceProof] = useState<CompressedFileResult | null>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  // Update default amount and account when invoice changes
  const handleInvoiceChange = (newInvId: string) => {
    setSelectedInvoiceId(newInvId);
    const inv = invoices.find((i) => i.id === newInvId);
    if (inv) {
      setAmount(inv.balance);
      const st = students.find((s) => s.id === inv.studentId);
      if (st) {
        setPayerName(st.guardian.name);
        if (method === 'Mobile Money') {
          setPayerAccount(`M-Pesa (${st.guardian.phone})`);
        }
      }
    }
  };

  const handleMethodChange = (newMethod: typeof method) => {
    setMethod(newMethod);
    if (newMethod === 'Mobile Money') {
      setPayerAccount(student ? `M-Pesa (${student.guardian.phone})` : 'M-Pesa (0712 345 678)');
    } else if (newMethod === 'Bank Transfer') {
      setPayerAccount('Equity Bank A/C 011029384756');
    } else if (newMethod === 'Credit/Debit Card') {
      setPayerAccount('Visa / Mastercard (•••• 8421)');
    } else if (newMethod === 'Cash') {
      setPayerAccount('Bursar Cash Desk Counter');
    } else {
      setPayerAccount('Parent Online Self-Service');
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTeacher) return;
    if (!selectedInvoice || amount <= 0) return;

    recordFeePayment(selectedInvoice.id, amount, method, referenceNotes, payerAccount, payerName, paymentDate);
    const recNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setReceiptGenerated(recNumber);

    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="font-bold text-sm block">
                {receiptGenerated ? 'Payment Receipt Confirmation' : isTeacher ? 'Fee Policy Restriction' : 'Record School Fee Payment'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isTeacher ? 'Teacher Division Access Control' : 'Bursar & Finance Office'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded border border-slate-700 hover:bg-slate-800 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {isTeacher ? (
          /* Restricted View for Teachers */
          <div className="p-6 space-y-5 text-slate-900">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Finance Department Authority Required</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Recording fee payments, adjusting invoices, and generating official bursary receipts is exclusively reserved for the <strong>Finance & Bursar Department</strong>.
              </p>
            </div>

            {selectedInvoice && student && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">{student.firstName} {student.lastName} ({student.grade})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guardian:</span>
                  <span className="font-medium text-slate-800">{student.guardian.name} ({student.guardian.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending Balance:</span>
                  <span className="font-bold text-amber-700">KSh {selectedInvoice.balance.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                id="payment-modal-cancel-btn"
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </button>
              {selectedInvoice && student && (
                <button
                  onClick={() => {
                    sendAutomatedNoticeToParent(student.id, 'fee_reminder');
                    alert(`Fee reminder dispatched to guardian ${student.guardian.name} for ${student.firstName}'s pending balance of KSh ${selectedInvoice.balance.toLocaleString()}!`);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Fee Reminder</span>
                </button>
              )}
            </div>
          </div>
        ) : receiptGenerated ? (
          /* Receipt Success State */
          <div className="p-6 space-y-6 text-slate-900">
            <div className="text-center">
              <div className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                Payment Recorded
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Successfully Logged</h3>
              <p className="text-xs text-slate-500">Official bursary receipt generated and added to institutional ledger.</p>
            </div>

            {/* Receipt Card */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-mono">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{receiptGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">
                  {student?.firstName} {student?.lastName} ({student?.grade})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700 text-sm">KSh {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid When (Date):</span>
                <span className="font-bold text-slate-900">{paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid From Account:</span>
                <span className="font-bold text-indigo-700">{payerAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remitter / Payer:</span>
                <span className="font-bold text-slate-900">{payerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-900">{method}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-bold text-slate-900">
                  KSh {Math.max(0, (selectedInvoice?.balance || 0) - amount).toLocaleString()}
                </span>
              </div>

              {remittanceProof && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Remittance Proof Attached:</span>
                  </span>
                  <span className="font-bold font-mono">
                    {remittanceProof.name} ({remittanceProof.compressedSizeFormatted})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors text-center flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </button>
              <button
                onClick={() => {
                  if (student && selectedInvoice) {
                    setIsDownloadingReceipt(true);
                    try {
                      generateAndDownloadSingleReceiptPDF(
                        student,
                        selectedInvoice,
                        {
                          id: `pay-${Date.now()}`,
                          receiptNo: receiptGenerated || 'REC-2026',
                          amount,
                          date: paymentDate,
                          paymentMethod: method,
                          payerAccount,
                          payerName,
                          notes: referenceNotes,
                          recordedBy: 'Finance Desk',
                        },
                        feeReceiptConfig
                      );
                    } finally {
                      setIsDownloadingReceipt(false);
                    }
                  }
                }}
                disabled={isDownloadingReceipt}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors text-center flex items-center justify-center space-x-1 shadow-xs"
                title="Download official receipt PDF compressed to < 2MB"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF (&lt; 2MB)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-xs transition-colors text-center"
              >
                Print
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Payment Input Form */
          <form onSubmit={handleProcessPayment} className="p-6 space-y-4 text-xs">
            {/* Invoice Picker */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Fee Invoice</label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
              >
                {invoices.map((inv) => {
                  const s = students.find((st) => st.id === inv.studentId);
                  return (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNo} — {s?.firstName} {s?.lastName} ({inv.term} • Bal: KSh {inv.balance.toLocaleString()})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Invoice Breakdown Summary */}
            {selectedInvoice && student && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Student Enrollee:</span>
                  <strong className="text-slate-900">
                    {student.firstName} {student.lastName} ({student.rollNumber})
                  </strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Invoiced:</span>
                  <span className="font-mono text-slate-800">KSh {selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Currently Paid:</span>
                  <span className="font-mono text-emerald-700">KSh {selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-slate-900 font-bold">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono text-amber-700 text-sm">
                    KSh {selectedInvoice.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Amount to Pay */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Amount (KSh / KES)</label>
              <div>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice?.balance || 500000}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="flex items-center space-x-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => selectedInvoice && setAmount(selectedInvoice.balance)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Pay Full Balance (KSh {selectedInvoice?.balance.toLocaleString()})
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => selectedInvoice && setAmount(Math.round(selectedInvoice.balance / 2))}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Pay 50% Installment
                </button>
              </div>
            </div>

            {/* Payment Method & Date Paid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Channel / Instrument</label>
                <select
                  value={method}
                  onChange={(e) => handleMethodChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                >
                  <option value="Mobile Money">M-Pesa / Mobile Money (Paybill / Till)</option>
                  <option value="Bank Transfer">Bank Transfer (Equity, KCB, Co-op, NCBA)</option>
                  <option value="Cash">Cash at Bursar Desk</option>
                  <option value="Credit/Debit Card">Credit / Debit Card (Visa, Mastercard)</option>
                  <option value="Online Portal">Parent Online Self-Service Portal</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">When Paid (Payment Date)</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Paid From Which Account & Payer Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Paid From Which Account / Phone #
                </label>
                <input
                  type="text"
                  placeholder="e.g. M-Pesa 0712 345 678, Equity Bank A/C 011029384756"
                  value={payerAccount}
                  onChange={(e) => setPayerAccount(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Visible on parent fee statement</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payer / Remitter Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Davis (Guardian)"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Parent / Sponsor name</span>
              </div>
            </div>

            {/* Transaction Reference / Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Reference / Memo</label>
              <input
                type="text"
                placeholder="e.g. M-Pesa Ref #QKH82914K or Bank Slip #09821"
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
              />
            </div>

            {/* Compressed Remittance Slip Upload (< 2MB Standard) */}
            <div className="pt-1">
              <CompressedFileUpload
                id="remittance-slip-upload"
                onFileCompressed={(res) => setRemittanceProof(res)}
                onFileRemoved={() => setRemittanceProof(null)}
                label="Upload Remittance Slip / Payment Proof (Optional)"
                helperText="Upload M-Pesa confirmation screenshot or bank slip PDF. Image or PDF text is auto-compressed to < 2MB to save storage space."
                accept="image/*,.pdf"
                compact
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
              >
                Confirm Payment & Issue Receipt
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
