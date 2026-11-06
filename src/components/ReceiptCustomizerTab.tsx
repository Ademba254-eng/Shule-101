import React, { useState } from 'react';
import {
  Receipt,
  Building2,
  Plus,
  Trash2,
  Edit3,
  Check,
  Save,
  RotateCcw,
  Download,
  Sparkles,
  QrCode,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Landmark,
  FileText,
  Palette,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag,
  Hash,
  ArrowLeft,
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import {
  FeeReceiptTemplateConfig,
  CustomReceiptField,
  StandardFeeItemConfig,
  FeeCategory,
} from '../types';
import { RECEIPT_PRESETS } from '../data/mockReceiptConfig';
import { generateAndDownloadFeeStatement } from '../utils/pdfExport';
import { CompressedFileUpload } from './CompressedFileUpload';

export const ReceiptCustomizerTab: React.FC = () => {
  const {
    feeReceiptConfig,
    updateFeeReceiptConfig,
    addCustomReceiptField,
    updateCustomReceiptField,
    deleteCustomReceiptField,
    addStandardFeeItem,
    updateStandardFeeItem,
    deleteStandardFeeItem,
    resetReceiptConfigToDefault,
    students,
    invoices,
    registeredSchools,
  } = useSchool();

  const [activeSection, setActiveSection] = useState<
    'presets' | 'identity' | 'custom_details' | 'fee_items' | 'payment_channels' | 'signatories' | 'preview'
  >('identity');

  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);

  // New Custom Detail Field Form State
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newFieldCategory, setNewFieldCategory] = useState<
    'header' | 'student_info' | 'financial' | 'footer' | 'bank_channel'
  >('student_info');
  const [isAddingFieldModal, setIsAddingFieldModal] = useState(false);

  // New Fee Item Form State
  const [newFeeDescription, setNewFeeDescription] = useState('');
  const [newFeeCategory, setNewFeeCategory] = useState<FeeCategory>('Tuition');
  const [newFeeAmount, setNewFeeAmount] = useState<number>(5000);
  const [newFeeOptional, setNewFeeOptional] = useState(false);
  const [isAddingFeeModal, setIsAddingFeeModal] = useState(false);

  // Editing Item / Field states
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFeeItemId, setEditingFeeItemId] = useState<string | null>(null);

  const sampleStudent = students[0];
  const sampleInvoice = invoices[0];

  const handleApplyPreset = (presetKey: string) => {
    resetReceiptConfigToDefault(presetKey);
    showToast(`Applied ${presetKey.replace('_', ' ').toUpperCase()} school template preferences!`);
  };

  const showToast = (msg: string) => {
    setSaveSuccessNotification(msg);
    setTimeout(() => {
      setSaveSuccessNotification(null);
    }, 4000);
  };

  const handleAddNewCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    addCustomReceiptField({
      label: newFieldLabel.trim(),
      value: newFieldValue.trim() || 'N/A',
      category: newFieldCategory,
      enabled: true,
      isRemovable: true,
    });

    setNewFieldLabel('');
    setNewFieldValue('');
    setIsAddingFieldModal(false);
    showToast(`Added custom detail field: "${newFieldLabel.trim()}"`);
  };

  const handleAddNewFeeItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeDescription.trim() || newFeeAmount <= 0) return;

    addStandardFeeItem({
      description: newFeeDescription.trim(),
      category: newFeeCategory,
      defaultAmount: Number(newFeeAmount),
      isOptional: newFeeOptional,
    });

    setNewFeeDescription('');
    setNewFeeAmount(5000);
    setNewFeeOptional(false);
    setIsAddingFeeModal(false);
    showToast(`Added standard fee item: "${newFeeDescription.trim()}"`);
  };

  const handleDownloadSamplePdf = () => {
    if (!sampleStudent || !sampleInvoice) return;
    try {
      generateAndDownloadFeeStatement(sampleStudent, sampleInvoice, feeReceiptConfig);
      showToast('Generated sample official fee statement PDF with current custom preferences!');
    } catch (err) {
      console.error('Failed to generate sample PDF:', err);
    }
  };

  const themeColors = {
    classic_navy: {
      bg: 'from-slate-900 to-indigo-950',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      accent: 'border-indigo-600',
      text: 'text-indigo-900',
    },
    emerald_ke: {
      bg: 'from-emerald-950 to-slate-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accent: 'border-emerald-600',
      text: 'text-emerald-900',
    },
    maroon_heritage: {
      bg: 'from-rose-950 to-slate-900',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      accent: 'border-rose-600',
      text: 'text-rose-900',
    },
    slate_modern: {
      bg: 'from-slate-900 to-slate-800',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
      accent: 'border-slate-600',
      text: 'text-slate-900',
    },
    amber_gold: {
      bg: 'from-amber-950 to-slate-900',
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      accent: 'border-amber-600',
      text: 'text-amber-900',
    },
  };

  const currentTheme = themeColors[feeReceiptConfig.colorTheme || 'classic_navy'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30 shrink-0">
            <Receipt className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Institutional Fee Receipt & Statement Customizer
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                School Preference Engine
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl">
              Customize receipt headers, official school motto, KRA tax codes, custom student/bursary fields,
              add or delete itemized levies, configure bank/M-Pesa payment channels, and match any school format.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            id="admin-reset-receipt-defaults-btn"
            onClick={() => {
              if (window.confirm('Reset all receipt customization preferences to default Kenya CBC settings?')) {
                resetReceiptConfigToDefault();
                showToast('Reset all receipt customization to standard default settings.');
              }
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            id="admin-download-sample-receipt-pdf-btn"
            onClick={handleDownloadSamplePdf}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Test PDF Download</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveSuccessNotification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Receipt Preference Saved:</strong> {saveSuccessNotification}
            </span>
          </div>
          <button
            onClick={() => setSaveSuccessNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveSection('identity')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeSection === 'identity'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>1. School Identity & Header</span>
        </button>

        <button
          onClick={() => setActiveSection('custom_details')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeSection === 'custom_details'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>2. Custom Detail Fields ({feeReceiptConfig.customFields?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSection('fee_items')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeSection === 'fee_items'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>3. Fee Levies & Structure ({feeReceiptConfig.standardFeeItems?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSection('payment_channels')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeSection === 'payment_channels'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>4. Payment Channels & M-Pesa</span>
        </button>

        <button
          onClick={() => setActiveSection('signatories')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeSection === 'signatories'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>5. Signatories & Legal Terms</span>
        </button>

        <button
          onClick={() => setActiveSection('preview')}
          className={`px-3.5 py-2 font-semibold rounded-lg transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeSection === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>6. Live Receipt Preview</span>
        </button>
      </div>

      {/* SECTION: PRESET TEMPLATES */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Match: School Model Template Presets
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Click to instantly populate and match school profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleApplyPreset('national_boarding')}
            className="p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>National Boarding School</span>
              <span className="text-[10px] text-indigo-600 font-semibold">Alliance/Starehe</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Includes House/Dormitory tags, Boarding levies, National Directorate seal, and Equity Bank routing.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('cbc_standard')}
            className="p-3 bg-white hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span>CBC Comprehensive High</span>
              <span className="text-[10px] text-emerald-700 font-semibold">CBC STEM</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Optimized for NEMIS UPI learner codes, continuous assessment levies, and KCB Bank Paybill integration.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('private_academy')}
            className="p-3 bg-white hover:bg-rose-50/50 rounded-xl border border-slate-200 hover:border-rose-300 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-950">
              <span>Private Academy</span>
              <span className="text-[10px] text-rose-700 font-semibold">International</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Includes Transport Route Zones, Annual package tiers, Financial Controller endorsement, and KES formatting.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('day_secondary')}
            className="p-3 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-slate-300 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>County Day Secondary</span>
              <span className="text-[10px] text-slate-600 font-semibold">Township Day</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CDF Bursary allocation tracking, lunch levy, activity fees, and Co-op Bank Paybill setup.
            </p>
          </button>
        </div>
      </div>

      {/* SECTION 1: IDENTITY & HEADER PREFERENCES */}
      {activeSection === 'identity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Official School Identity & Header Configuration</h3>
              <p className="text-xs text-slate-500">
                Printed on top of every parent fee statement, invoice, and payment receipt.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">ID: {feeReceiptConfig.institutionCode}</span>
          </div>

          {/* School Crest / Logo Upload Card (< 2MB Compressed) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <CompressedFileUpload
              id="school-receipt-logo-upload"
              onFileCompressed={(res) => updateFeeReceiptConfig({ institutionLogoUrl: res.dataUrl })}
              onFileRemoved={() => updateFeeReceiptConfig({ institutionLogoUrl: undefined })}
              currentPreviewUrl={feeReceiptConfig.institutionLogoUrl}
              label="Official School Crest, Coat of Arms, or Emblem (Image or PDF)"
              helperText="Displayed in the header of fee statements and remittance receipts. Automatically compressed to < 2MB to save storage space."
              accept="image/*,.pdf"
              compact
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Institution Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Institution / School Full Name *</label>
              <input
                type="text"
                value={feeReceiptConfig.institutionName}
                onChange={(e) => updateFeeReceiptConfig({ institutionName: e.target.value })}
                placeholder="e.g. Alliance High School Central"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* School Registration Code */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">School / Ministry Code</label>
              <input
                type="text"
                value={feeReceiptConfig.institutionCode}
                onChange={(e) => updateFeeReceiptConfig({ institutionCode: e.target.value })}
                placeholder="e.g. SCH-01-CENTRAL"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* School Motto */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">School Motto & Subtitle</label>
              <input
                type="text"
                value={feeReceiptConfig.institutionMotto}
                onChange={(e) => updateFeeReceiptConfig({ institutionMotto: e.target.value })}
                placeholder="e.g. Strong to Serve • CBC Excellence & Integrity"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* KRA PIN */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">KRA Tax PIN</label>
              <input
                type="text"
                value={feeReceiptConfig.kraPin}
                onChange={(e) => updateFeeReceiptConfig({ kraPin: e.target.value })}
                placeholder="e.g. P051239847Z"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Postal Address */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Postal Address (P.O. Box)</label>
              <input
                type="text"
                value={feeReceiptConfig.poBox}
                onChange={(e) => updateFeeReceiptConfig({ poBox: e.target.value })}
                placeholder="e.g. P.O. Box 45100 - 00100, Nairobi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* County / City */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">County / Campus Location</label>
              <input
                type="text"
                value={feeReceiptConfig.countyCity}
                onChange={(e) => updateFeeReceiptConfig({ countyCity: e.target.value })}
                placeholder="e.g. Nairobi / Kiambu, Kenya"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Official Contact Phone</label>
              <input
                type="text"
                value={feeReceiptConfig.phoneNumber}
                onChange={(e) => updateFeeReceiptConfig({ phoneNumber: e.target.value })}
                placeholder="e.g. +254 700 123 456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bursar Official Email</label>
              <input
                type="email"
                value={feeReceiptConfig.emailAddress}
                onChange={(e) => updateFeeReceiptConfig({ emailAddress: e.target.value })}
                placeholder="e.g. bursar@alliancehigh.ac.ke"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Currency Symbol */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Currency Symbol</label>
              <input
                type="text"
                value={feeReceiptConfig.currencySymbol}
                onChange={(e) => updateFeeReceiptConfig({ currencySymbol: e.target.value })}
                placeholder="e.g. KSh, KES, $, UGX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Receipt Number Prefix */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Receipt Number Prefix</label>
              <input
                type="text"
                value={feeReceiptConfig.receiptPrefix}
                onChange={(e) => updateFeeReceiptConfig({ receiptPrefix: e.target.value })}
                placeholder="e.g. SHL-REC-, RCPT-2026-"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Visual Palette Theme</label>
              <select
                value={feeReceiptConfig.colorTheme}
                onChange={(e) =>
                  updateFeeReceiptConfig({
                    colorTheme: e.target.value as 'classic_navy' | 'emerald_ke' | 'maroon_heritage' | 'slate_modern' | 'amber_gold',
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="classic_navy">Classic Navy (Institutional)</option>
                <option value="emerald_ke">Kenya Emerald (CBC Official)</option>
                <option value="maroon_heritage">Maroon Heritage (Academy)</option>
                <option value="slate_modern">Slate Modern (Day Secondary)</option>
                <option value="amber_gold">Golden Amber (Premier)</option>
              </select>
            </div>

            {/* Watermark Toggle & Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Watermark Text</label>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feeReceiptConfig.showWatermark}
                    onChange={(e) => updateFeeReceiptConfig({ showWatermark: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Show</span>
                </label>
              </div>
              <input
                type="text"
                value={feeReceiptConfig.watermarkText}
                onChange={(e) => updateFeeReceiptConfig({ watermarkText: e.target.value })}
                placeholder="e.g. OFFICIAL RECEIPT • PAID"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DYNAMIC CUSTOM DETAILS & FIELDS (ADD / EDIT / DELETE) */}
      {activeSection === 'custom_details' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Custom Receipt Details & Dynamic School Fields
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                  {feeReceiptConfig.customFields?.length || 0} Active Fields
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, delete, or modify specific details to match your school&apos;s preferences (e.g. Dormitory, Transport Route, KRA Tax Exemption, NEMIS UPI, CDF Bursary Code).
              </p>
            </div>

            <button
              id="admin-add-custom-field-btn"
              onClick={() => setIsAddingFieldModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Detail Field</span>
            </button>
          </div>

          {/* Quick Field Suggestions */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
              💡 1-Click Quick Add Recommended School Fields:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Dormitory / Boarding House', value: 'Simba House (North Wing)', category: 'student_info' as const },
                { label: 'School Bus Transport Route', value: 'Zone 1: Westlands & Parklands', category: 'student_info' as const },
                { label: 'NEMIS / CBC Learner UPI', value: 'UPI-2026-90412-K', category: 'student_info' as const },
                { label: 'CDF / County Bursary Ref', value: 'Approved (CDF-2026-KIAMBU)', category: 'financial' as const },
                { label: 'KRA Tax Exemption Reg', value: 'KRA-EXEMPT-EDU-994', category: 'header' as const },
                { label: 'Student Medical Scheme', value: 'NHIF / EduAfya Registered', category: 'student_info' as const },
                { label: 'Exam Index Number', value: 'KNEC-INDEX-2026-042', category: 'student_info' as const },
              ].map((item, idx) => {
                const alreadyExists = feeReceiptConfig.customFields.some((f) => f.label === item.label);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={alreadyExists}
                    onClick={() => {
                      addCustomReceiptField({
                        label: item.label,
                        value: item.value,
                        category: item.category,
                        enabled: true,
                        isRemovable: true,
                      });
                      showToast(`Added field: "${item.label}"`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1 ${
                      alreadyExists
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                    }`}
                  >
                    <span>{alreadyExists ? '✓ Added' : '+ Add'} {item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of Current Custom Detail Fields */}
          <div className="space-y-3">
            {feeReceiptConfig.customFields && feeReceiptConfig.customFields.length > 0 ? (
              feeReceiptConfig.customFields.map((field) => (
                <div
                  key={field.id}
                  className={`p-4 rounded-xl border transition-all ${
                    field.enabled ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{field.label}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider">
                          {field.category.replace('_', ' ')}
                        </span>
                        {!field.enabled && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Hidden on Receipt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-mono">{field.value}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Toggle Enabled */}
                      <button
                        type="button"
                        onClick={() =>
                          updateCustomReceiptField(field.id, { enabled: !field.enabled })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          field.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {field.enabled ? 'Visible' : 'Hidden'}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingFieldId(editingFieldId === field.id ? null : field.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete custom field "${field.label}" from receipts?`)) {
                            deleteCustomReceiptField(field.id);
                            showToast(`Deleted field "${field.label}"`);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete this custom detail"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editingFieldId === field.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs animate-in fade-in">
                      <div>
                        <label className="font-bold text-slate-600 text-[10px] block mb-0.5">Field Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateCustomReceiptField(field.id, { label: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 text-[10px] block mb-0.5">Value / Pattern</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateCustomReceiptField(field.id, { value: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <label className="font-bold text-slate-600 text-[10px] block mb-0.5">Section</label>
                          <select
                            value={field.category}
                            onChange={(e) =>
                              updateCustomReceiptField(field.id, {
                                category: e.target.value as 'header' | 'student_info' | 'financial' | 'footer' | 'bank_channel',
                              })
                            }
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="header">Header Details</option>
                            <option value="student_info">Student Information</option>
                            <option value="financial">Financial / Ledger</option>
                            <option value="footer">Footer Endorsement</option>
                            <option value="bank_channel">Bank / M-Pesa</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingFieldId(null)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No custom receipt fields configured. Click &quot;Add Custom Detail Field&quot; or select one of the recommendations above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: STANDARD FEE LEVIES & ITEMS (ADD / EDIT / DELETE) */}
      {activeSection === 'fee_items' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Standard School Fee Levies & Itemized Charges
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {feeReceiptConfig.standardFeeItems?.length || 0} Levies
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, delete, or customize standard billing components such as Tuition, Laboratory, Transport, and CBC activity charges.
              </p>
            </div>

            <button
              id="admin-add-fee-item-btn"
              onClick={() => setIsAddingFeeModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Fee Levy</span>
            </button>
          </div>

          {/* Fee Items Table */}
          <div className="space-y-2">
            {feeReceiptConfig.standardFeeItems && feeReceiptConfig.standardFeeItems.length > 0 ? (
              feeReceiptConfig.standardFeeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                      <span className="font-bold text-slate-900">{item.description}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                        {item.category}
                      </span>
                      {item.isOptional && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Optional Pass
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {feeReceiptConfig.currencySymbol} {item.defaultAmount.toLocaleString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditingFeeItemId(editingFeeItemId === item.id ? null : item.id)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete fee levy "${item.description}"?`)) {
                          deleteStandardFeeItem(item.id);
                          showToast(`Deleted fee levy "${item.description}"`);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete this fee levy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inline Fee Editor */}
                  {editingFeeItemId === item.id && (
                    <div className="w-full mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 animate-in fade-in">
                      <div className="sm:col-span-2">
                        <label className="font-bold text-slate-600 text-[10px] block mb-0.5">Levy Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateStandardFeeItem(item.id, { description: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 text-[10px] block mb-0.5">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => updateStandardFeeItem(item.id, { category: e.target.value as FeeCategory })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Tuition">Tuition</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="Transport">Transport</option>
                          <option value="Extracurricular">Extracurricular</option>
                          <option value="Examination">Examination</option>
                          <option value="Annual Package">Annual Package</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 text-[10px] block mb-0.5">Amount ({feeReceiptConfig.currencySymbol})</label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={item.defaultAmount}
                            onChange={(e) => updateStandardFeeItem(item.id, { defaultAmount: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingFeeItemId(null)}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No fee levies configured. Click &quot;Add New Fee Levy&quot; above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: PAYMENT CHANNELS & M-PESA */}
      {activeSection === 'payment_channels' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Payment Channels & Bank Accounts Configuration</h3>
              <p className="text-xs text-slate-500">
                Instructions, Paybill numbers, and account credentials printed on every receipt.
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Banking Channels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* M-Pesa Paybill */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>M-Pesa Paybill Business Number *</span>
              </label>
              <input
                type="text"
                value={feeReceiptConfig.mpesaPaybill}
                onChange={(e) => updateFeeReceiptConfig({ mpesaPaybill: e.target.value })}
                placeholder="e.g. 247247 or 522522"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* M-Pesa Account Pattern */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">M-Pesa Account Number Format</label>
              <input
                type="text"
                value={feeReceiptConfig.mpesaAccountPattern}
                onChange={(e) => updateFeeReceiptConfig({ mpesaAccountPattern: e.target.value })}
                placeholder="e.g. Student Admission No (e.g. ADM-2026-001)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* M-Pesa Till */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">M-Pesa Buy Goods Till Number (Optional)</label>
              <input
                type="text"
                value={feeReceiptConfig.mpesaTillNumber || ''}
                onChange={(e) => updateFeeReceiptConfig({ mpesaTillNumber: e.target.value })}
                placeholder="e.g. 891024"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Primary Bank Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center space-x-1">
                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>Primary Bank Name *</span>
              </label>
              <input
                type="text"
                value={feeReceiptConfig.primaryBankName}
                onChange={(e) => updateFeeReceiptConfig({ primaryBankName: e.target.value })}
                placeholder="e.g. Equity Bank Kenya"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Primary Bank Account */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Primary Bank Account Number *</label>
              <input
                type="text"
                value={feeReceiptConfig.primaryBankAccountNumber}
                onChange={(e) => updateFeeReceiptConfig({ primaryBankAccountNumber: e.target.value })}
                placeholder="e.g. 011029384756"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Primary Bank Branch */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Primary Bank Branch</label>
              <input
                type="text"
                value={feeReceiptConfig.primaryBankBranch}
                onChange={(e) => updateFeeReceiptConfig({ primaryBankBranch: e.target.value })}
                placeholder="e.g. Supreme Centre Branch, Nairobi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Secondary Bank */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Secondary Bank Name (Optional)</label>
              <input
                type="text"
                value={feeReceiptConfig.secondaryBankName || ''}
                onChange={(e) => updateFeeReceiptConfig({ secondaryBankName: e.target.value })}
                placeholder="e.g. KCB Bank Kenya"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Secondary Account */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Secondary Account Number</label>
              <input
                type="text"
                value={feeReceiptConfig.secondaryBankAccountNumber || ''}
                onChange={(e) => updateFeeReceiptConfig({ secondaryBankAccountNumber: e.target.value })}
                placeholder="e.g. 1122334455"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SIGNATORIES & LEGAL TERMS */}
      {activeSection === 'signatories' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Signatory Titles & Clearance Policies</h3>
              <p className="text-xs text-slate-500">
                Configure signatory endorsements and institutional legal terms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Bursar Department Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Finance Directorate / Bursar Department Title</label>
              <input
                type="text"
                value={feeReceiptConfig.bursarDepartmentName}
                onChange={(e) => updateFeeReceiptConfig({ bursarDepartmentName: e.target.value })}
                placeholder="e.g. Directorate of Finance & Accounts"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Bursar Signatory Title */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bursar / Accounts Signatory Title</label>
              <input
                type="text"
                value={feeReceiptConfig.bursarSignatoryTitle}
                onChange={(e) => updateFeeReceiptConfig({ bursarSignatoryTitle: e.target.value })}
                placeholder="e.g. Senior Bursar / Accounts Controller"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Principal Title */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Principal / Executive Signatory Title</label>
              <input
                type="text"
                value={feeReceiptConfig.principalSignatoryTitle}
                onChange={(e) => updateFeeReceiptConfig({ principalSignatoryTitle: e.target.value })}
                placeholder="e.g. Chief Principal & Accounting Officer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* QR Code Validation */}
            <div className="space-y-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">QR Verification Code</span>
                <span className="text-[11px] text-slate-500">Prints digital security QR validation on receipt footer</span>
              </div>
              <input
                type="checkbox"
                checked={feeReceiptConfig.showQrValidation}
                onChange={(e) => updateFeeReceiptConfig({ showQrValidation: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            {/* Terms and Conditions */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Receipt Policies, Clearance Terms & Refund Rules</label>
              <textarea
                rows={3}
                value={feeReceiptConfig.receiptTermsAndConditions}
                onChange={(e) => updateFeeReceiptConfig({ receiptTermsAndConditions: e.target.value })}
                placeholder="e.g. All fees must be remitted through official designated channels..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: LIVE INTERACTIVE RECEIPT PREVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Live Real-Time Receipt Preview (Matches Current Configuration)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadSamplePdf}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Test</span>
            </button>
          </div>
        </div>

        {/* Realistic Styled Document Paper */}
        <div className="max-w-3xl mx-auto bg-white border-2 border-slate-300 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Watermark */}
          {feeReceiptConfig.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <span className="text-5xl sm:text-6xl font-black text-slate-200/40 uppercase rotate-[-25deg] tracking-widest text-center border-4 border-dashed border-slate-200/30 p-4 rounded-3xl">
                {feeReceiptConfig.watermarkText || 'OFFICIAL RECEIPT'}
              </span>
            </div>
          )}

          {/* Document Header */}
          <div className="relative z-10 text-center border-b-2 border-slate-900 pb-5 space-y-1.5">
            <div className="flex items-center justify-center space-x-2">
              <Building2 className="w-6 h-6 text-slate-900" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                {feeReceiptConfig.institutionName}
              </h2>
            </div>
            <p className="text-xs italic text-slate-600 font-serif">
              &quot;{feeReceiptConfig.institutionMotto}&quot;
            </p>
            <div className="text-[11px] text-slate-500 flex items-center justify-center flex-wrap gap-x-3 gap-y-1 font-mono pt-1">
              <span>{feeReceiptConfig.poBox}</span>
              <span>•</span>
              <span>{feeReceiptConfig.countyCity}</span>
              <span>•</span>
              <span>Tel: {feeReceiptConfig.phoneNumber}</span>
            </div>
            <div className="text-[11px] text-slate-600 font-mono font-bold flex items-center justify-center flex-wrap gap-x-3 pt-1">
              <span>KRA PIN: {feeReceiptConfig.kraPin}</span>
              <span>•</span>
              <span>Ministry Code: {feeReceiptConfig.institutionCode}</span>
              <span>•</span>
              <span>{feeReceiptConfig.bursarDepartmentName}</span>
            </div>
          </div>

          {/* Receipt Title & Meta Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Official School Fee Statement & Receipt
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Certified Active
                </span>
              </div>
              <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                Receipt No: <strong className="text-slate-900">{feeReceiptConfig.receiptPrefix}2026-00892</strong>
              </p>
            </div>
            <div className="sm:text-right text-[11px] font-mono text-slate-600">
              <div>Issue Date: <strong>2026-09-19</strong></div>
              <div>Billing Cycle: <strong>Term 2 • 2026 Academic Year</strong></div>
            </div>
          </div>

          {/* Student Information & Custom Dynamic Details */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Profile</span>
              <div className="font-bold text-slate-900 text-sm">
                {sampleStudent?.firstName} {sampleStudent?.lastName}
              </div>
              <p className="text-slate-600 font-mono text-xs">
                Admission No: <strong>{sampleStudent?.admissionNo}</strong> • Class: <strong>{sampleStudent?.grade}</strong>
              </p>
              <p className="text-slate-500 text-[11px]">
                Guardian: {sampleStudent?.guardian.name} ({sampleStudent?.guardian.phone})
              </p>
            </div>

            {/* Dynamic Custom Fields configured by Admin */}
            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Institutional Custom Details
              </span>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                {feeReceiptConfig.customFields
                  ?.filter((f) => f.enabled)
                  .map((field) => (
                    <div key={field.id} className="flex justify-between font-mono">
                      <span className="text-slate-500">{field.label}:</span>
                      <span className="font-bold text-slate-800">{field.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Itemized Fee Structure */}
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Itemized Fee Breakdown & Levies ({feeReceiptConfig.currencySymbol})
            </span>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                  <th className="py-2 px-3 text-left">#</th>
                  <th className="py-2 px-3 text-left">Levy / Item Description</th>
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-right">Amount ({feeReceiptConfig.currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {feeReceiptConfig.standardFeeItems?.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-2 px-3 text-slate-500 uppercase text-[10px]">{item.category}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {feeReceiptConfig.currencySymbol} {item.defaultAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-slate-900 bg-slate-100">
                  <td colSpan={3} className="py-2 px-3 text-right">Total Invoiced Billing:</td>
                  <td className="py-2 px-3 text-right font-mono text-sm">
                    {feeReceiptConfig.currencySymbol}{' '}
                    {(
                      feeReceiptConfig.standardFeeItems?.reduce((acc, curr) => acc + curr.defaultAmount, 0) || 0
                    ).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Remittance Channels */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>M-Pesa Remittance</span>
              </span>
              <p className="text-[11px] text-slate-600 font-mono">
                • Paybill Number: <strong>{feeReceiptConfig.mpesaPaybill}</strong>
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                • Account: <strong>{sampleStudent?.admissionNo || 'Student Admission No'}</strong>
              </p>
              {feeReceiptConfig.mpesaTillNumber && (
                <p className="text-[11px] text-slate-600 font-mono">
                  • Till Number: <strong>{feeReceiptConfig.mpesaTillNumber}</strong>
                </p>
              )}
            </div>

            <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2 sm:pt-0">
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bank Deposit Accounts</span>
              </span>
              <p className="text-[11px] text-slate-600 font-mono">
                • {feeReceiptConfig.primaryBankName}: A/C <strong>{feeReceiptConfig.primaryBankAccountNumber}</strong>
              </p>
              {feeReceiptConfig.secondaryBankName && (
                <p className="text-[11px] text-slate-600 font-mono">
                  • {feeReceiptConfig.secondaryBankName}: A/C <strong>{feeReceiptConfig.secondaryBankAccountNumber}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Legal Terms & Policies */}
          <div className="relative z-10 text-[10px] text-slate-500 border-t border-slate-200 pt-3 italic">
            <strong>Clearance Notice:</strong> {feeReceiptConfig.receiptTermsAndConditions}
          </div>

          {/* Signatures & Stamps */}
          <div className="relative z-10 pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <div className="w-36 border-b border-slate-400"></div>
              </div>
              <span className="font-bold text-slate-800 text-[11px] block">
                {feeReceiptConfig.bursarSignatoryTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Bursar & Accounts Office</span>
            </div>

            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <div className="w-36 border-b border-slate-400"></div>
              </div>
              <span className="font-bold text-slate-800 text-[11px] block">
                {feeReceiptConfig.principalSignatoryTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Official Seal & Stamp</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW CUSTOM DETAIL FIELD */}
      {isAddingFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFieldModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Tag className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add Custom Receipt Field</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddingFieldModal(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setIsAddingFieldModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleAddNewCustomField} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Field Label *</label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g. Student House / Dormitory, Route Zone, KRA Tax Code"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Default Value / Sample Value</label>
                <input
                  type="text"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="e.g. Simba House (North Wing) or Zone 2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Receipt Section Placement</label>
                <select
                  value={newFieldCategory}
                  onChange={(e) =>
                    setNewFieldCategory(
                      e.target.value as 'header' | 'student_info' | 'financial' | 'footer' | 'bank_channel'
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student_info">Student Information & House Metadata</option>
                  <option value="financial">Financial / Ledger & Bursary Allocation</option>
                  <option value="header">School Header & Ministry Identification</option>
                  <option value="bank_channel">Bank & Remittance Section</option>
                  <option value="footer">Footer Endorsement & Clearance Stamp</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFieldModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Add Field to Receipts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW FEE LEVY */}
      {isAddingFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFeeModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add Standard Fee Levy</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddingFeeModal(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setIsAddingFeeModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleAddNewFeeItem} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Levy Description *</label>
                <input
                  type="text"
                  required
                  value={newFeeDescription}
                  onChange={(e) => setNewFeeDescription(e.target.value)}
                  placeholder="e.g. Science Laboratory Fund, Boarding Levy, Bus Pass"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newFeeCategory}
                    onChange={(e) => setNewFeeCategory(e.target.value as FeeCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Transport">Transport</option>
                    <option value="Extracurricular">Extracurricular</option>
                    <option value="Examination">Examination</option>
                    <option value="Annual Package">Annual Package</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Amount ({feeReceiptConfig.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="optional-checkbox"
                  checked={newFeeOptional}
                  onChange={(e) => setNewFeeOptional(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="optional-checkbox" className="text-slate-700 font-medium">
                  Optional Levy (e.g. boarding or transport pass)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingFeeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Add Fee Levy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
