import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Shule101Logo } from './Shule101Logo';
import {
  CBCSchoolLevel,
  CBCGradingScaleMode,
  CBCSubjectItemConfig,
  CBCCompetencyItem,
  CBCValueItem,
  CBCPerformanceLevelConfig,
} from '../types';
import { CBC_TEMPLATE_PRESETS } from '../data/mockCBCReportCardConfig';
import {
  BookOpen,
  GraduationCap,
  Award,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  Download,
  RotateCcw,
  Sparkles,
  School,
  Layers,
  FileCheck,
  Tag,
  Check,
  Save,
  HelpCircle,
  Eye,
  Calendar,
  UserCheck,
  ShieldCheck,
  Printer,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { downloadReportCardPDF } from '../utils/pdfExport';
import { CompressedFileUpload } from './CompressedFileUpload';

export const CBCReportCardCustomizerTab: React.FC = () => {
  const {
    cbcReportCardConfig,
    updateCBCReportCardConfig,
    applyCBCPreset,
    resetCBCReportCardConfig,
    addCBCSubject,
    updateCBCSubject,
    deleteCBCSubject,
    toggleCBCCompetency,
    updateCBCCompetency,
    toggleCBCValue,
    updateCBCValue,
    updateCBCPerformanceLevel,
    students,
    academicRecords,
    currentSchool,
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState<
    'presets' | 'identity' | 'grading' | 'subjects' | 'competencies' | 'signatories'
  >('presets');

  const [saveToast, setSaveToast] = useState(false);
  const [isDownloadingPreview, setIsDownloadingPreview] = useState(false);
  const [previewLevelOverride, setPreviewLevelOverride] = useState<CBCSchoolLevel>(cbcReportCardConfig.schoolLevel);

  // New subject state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubArea, setNewSubArea] = useState('STEM & Applied Sciences');
  const [newSubLevel, setNewSubLevel] = useState<CBCSchoolLevel>('senior_high');
  const [newSubPathway, setNewSubPathway] = useState<'STEM' | 'Arts & Sports Science' | 'Social Sciences' | 'Core'>('Core');
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubStrands, setNewSubStrands] = useState('');

  // Editing subject state
  const [editingSubject, setEditingSubject] = useState<CBCSubjectItemConfig | null>(null);

  const triggerSaveNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleApplyPreset = (presetId: string) => {
    applyCBCPreset(presetId);
    const preset = CBC_TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setPreviewLevelOverride(preset.level);
    }
    triggerSaveNotification();
  };

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    const strandsList = newSubStrands
      ? newSubStrands.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Foundational Concepts', 'Practical Application', 'Inquiry Project'];

    addCBCSubject({
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase(),
      learningArea: newSubArea,
      schoolLevel: newSubLevel,
      pathway: newSubPathway,
      credits: Number(newSubCredits) || 4,
      enabled: true,
      strands: strandsList,
    });

    setNewSubName('');
    setNewSubCode('');
    setNewSubStrands('');
    setShowAddSubjectModal(false);
    triggerSaveNotification();
  };

  const handleUpdateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    updateCBCSubject(editingSubject.id, editingSubject);
    setEditingSubject(null);
    triggerSaveNotification();
  };

  const handleDownloadLivePreview = async () => {
    setIsDownloadingPreview(true);
    try {
      await downloadReportCardPDF('cbc-report-card-preview-container', 'CBC_Custom_Template_Sample', cbcReportCardConfig.academicTerm);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingPreview(false);
    }
  };

  // Sample student for preview
  const sampleStudent = students[0] || {
    id: 'sample-student',
    admissionNo: 'ADM-2026/8410',
    rollNumber: '01',
    firstName: 'Brian',
    lastName: 'Kipchumba',
    grade: previewLevelOverride === 'primary' ? 'Grade 6' : previewLevelOverride === 'junior_secondary' ? 'Grade 8' : 'Grade 11',
    section: 'A',
    gender: 'Male',
    guardian: {
      name: 'Dr. Joseph Kipchumba',
      relation: 'Father',
      phone: '+254 711 234 567',
      email: 'joseph.k@example.com',
      address: 'Westlands, Nairobi',
    },
  };

  const activeSubjects = (cbcReportCardConfig.customSubjects || []).filter(
    (s) => s.enabled && (s.schoolLevel === 'all' || s.schoolLevel === cbcReportCardConfig.schoolLevel)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-emerald-400 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold">CBC Report Card Settings Saved & Synchronized Successfully!</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/50 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <GraduationCap className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black tracking-tight text-white">CBC Report Card & Curriculum Customizer</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                  KICD / KNEC Compliant
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure official Competency-Based Curriculum report cards for <strong>Primary (Grades 1-6)</strong>,{' '}
                <strong>Junior Secondary (Grades 7-9)</strong>, and <strong>Senior High School (Grades 10-12)</strong> according to school specifications.
              </p>
            </div>
          </div>
        </div>

        {/* Global Level Indicator & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Active Level:</span>
            <span className="font-bold text-emerald-400 capitalize">
              {cbcReportCardConfig.schoolLevel === 'senior_high'
                ? 'Senior High School (10-12)'
                : cbcReportCardConfig.schoolLevel === 'junior_secondary'
                ? 'Junior Secondary (7-9)'
                : cbcReportCardConfig.schoolLevel === 'primary'
                ? 'Primary School (1-6)'
                : 'Hybrid / International'}
            </span>
          </div>

          <button
            id="reset-cbc-config-btn"
            onClick={() => {
              if (confirm('Reset CBC Report Card configuration back to default system templates?')) {
                resetCBCReportCardConfig();
                triggerSaveNotification();
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            id="export-cbc-preview-pdf-btn"
            onClick={handleDownloadLivePreview}
            disabled={isDownloadingPreview}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/30 flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingPreview ? 'Exporting PDF...' : 'Download Sample PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Customizer Configuration Controls & Live Interactive Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (Configuration Tabs) */}
        <div className="xl:col-span-7 space-y-6">
          {/* Sub-Navigation Tabs */}
          <div className="flex items-center space-x-1 p-1.5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <button
              id="subtab-cbc-presets"
              onClick={() => setActiveSubTab('presets')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'presets'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Presets & Level</span>
            </button>

            <button
              id="subtab-cbc-identity"
              onClick={() => setActiveSubTab('identity')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'identity'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <School className="w-3.5 h-3.5 text-blue-300" />
              <span>School Identity & Header</span>
            </button>

            <button
              id="subtab-cbc-grading"
              onClick={() => setActiveSubTab('grading')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'grading'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span>Grading & Assessment</span>
            </button>

            <button
              id="subtab-cbc-subjects"
              onClick={() => setActiveSubTab('subjects')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'subjects'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>Learning Areas ({cbcReportCardConfig.customSubjects?.length || 0})</span>
            </button>

            <button
              id="subtab-cbc-competencies"
              onClick={() => setActiveSubTab('competencies')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'competencies'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span>7 Competencies & Values</span>
            </button>

            <button
              id="subtab-cbc-signatories"
              onClick={() => setActiveSubTab('signatories')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeSubTab === 'signatories'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-rose-300" />
              <span>Signatories & Dates</span>
            </button>
          </div>

          {/* TAB 1: PRESETS & LEVEL SELECTOR */}
          {activeSubTab === 'presets' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Curriculum Level & One-Click Ministry Framework Presets</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select a standardized Kenya Ministry of Education (KICD / KNEC) template tailored for Primary, Junior School, or Senior High School. You can subsequently customize any aspect below.
                </p>
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CBC_TEMPLATE_PRESETS.map((preset) => {
                  const isCurrent = cbcReportCardConfig.schoolLevel === preset.level;
                  return (
                    <div
                      key={preset.id}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                            {preset.badge}
                          </span>
                          {isCurrent && (
                            <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">{preset.name}</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{preset.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 capitalize">
                          {preset.level.replace('_', ' ')}
                        </span>
                        <button
                          id={`apply-preset-${preset.id}`}
                          onClick={() => handleApplyPreset(preset.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <span>{isCurrent ? 'Re-apply Preset' : 'Switch to this Level'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct School Level Radio */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-800 block">Manual School Level Override:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'primary', label: 'Primary (Grades 1-6)' },
                    { id: 'junior_secondary', label: 'Junior Secondary (7-9)' },
                    { id: 'senior_high', label: 'Senior High (10-12)' },
                    { id: 'hybrid', label: 'International / Hybrid' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => {
                        updateCBCReportCardConfig({ schoolLevel: lvl.id as CBCSchoolLevel });
                        setPreviewLevelOverride(lvl.id as CBCSchoolLevel);
                        triggerSaveNotification();
                      }}
                      className={`p-2.5 rounded-lg text-xs font-bold text-center border transition ${
                        cbcReportCardConfig.schoolLevel === lvl.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHOOL IDENTITY & HEADER */}
          {activeSubTab === 'identity' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <School className="w-5 h-5 text-blue-600" />
                  <span>Institutional Header & Registry Credentials</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the official header details, registration codes (NEMIS, KNEC), and academic assessment titles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Official Institution Name</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.institutionName}
                    onChange={(e) => updateCBCReportCardConfig({ institutionName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Institution Motto & Vision</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.institutionMotto}
                    onChange={(e) => updateCBCReportCardConfig({ institutionMotto: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 italic"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Report Card Document Title</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.reportTitle}
                    onChange={(e) => updateCBCReportCardConfig({ reportTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">NEMIS Code</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.nemisCode}
                    onChange={(e) => updateCBCReportCardConfig({ nemisCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">KNEC Assessment Centre Code</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.knecCode}
                    onChange={(e) => updateCBCReportCardConfig({ knecCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Term</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.academicTerm}
                    onChange={(e) => updateCBCReportCardConfig({ academicTerm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.academicYear}
                    onChange={(e) => updateCBCReportCardConfig({ academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">County & Sub-County Location</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.countySubCounty}
                    onChange={(e) => updateCBCReportCardConfig({ countySubCounty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Contacts</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.phoneNumber}
                    onChange={(e) => updateCBCReportCardConfig({ phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Registry Email</label>
                  <input
                    type="email"
                    value={cbcReportCardConfig.emailAddress}
                    onChange={(e) => updateCBCReportCardConfig({ emailAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={triggerSaveNotification}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Header Details</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: GRADING & ASSESSMENT SCALE */}
          {activeSubTab === 'grading' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>CBC Grading System & Weighting Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure assessment display modes (Rubric vs KNEC numerical scale), SBA formative weights, and performance levels.
                </p>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">Grading Scale Display Format:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    {
                      id: 'rubric_only',
                      label: 'Pure CBC 4-Tier Rubric (EE, ME, AE, BE)',
                      desc: 'Standard for Primary School. Focuses on competency descriptors without numerical rank.',
                    },
                    {
                      id: 'numeric_and_rubric',
                      label: 'Numerical Marks + CBC Rubric Descriptors',
                      desc: 'Shows subject test percentage marks alongside EE/ME/AE/BE ratings.',
                    },
                    {
                      id: 'knec_letter_scale',
                      label: 'KNEC 12-Point Letter Scale (A through E)',
                      desc: 'Standard for Secondary/Senior High School with mean points.',
                    },
                    {
                      id: 'comprehensive_dual',
                      label: 'Dual Comprehensive Matrix (Marks, Letter, GPA & Rubrics)',
                      desc: 'Best for High School Pathways and International accreditation.',
                    },
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        cbcReportCardConfig.gradingScaleMode === mode.id
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <input
                          type="radio"
                          name="gradingScaleMode"
                          value={mode.id}
                          checked={cbcReportCardConfig.gradingScaleMode === mode.id}
                          onChange={() => {
                            updateCBCReportCardConfig({ gradingScaleMode: mode.id as CBCGradingScaleMode });
                            triggerSaveNotification();
                          }}
                          className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{mode.label}</span>
                          <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed">{mode.desc}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weightings and Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Formative SBA / Project Weight (%):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={cbcReportCardConfig.formativeAssessmentWeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateCBCReportCardConfig({
                          formativeAssessmentWeight: val,
                          summativeAssessmentWeight: 100 - val,
                        });
                      }}
                      className="w-full accent-emerald-600"
                    />
                    <span className="font-bold font-mono text-emerald-700 w-12 text-right">
                      {cbcReportCardConfig.formativeAssessmentWeight}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Continuous assessment tests (CAT 1, CAT 2, practicals)
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Summative Exam Weight (%):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={cbcReportCardConfig.summativeAssessmentWeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateCBCReportCardConfig({
                          summativeAssessmentWeight: val,
                          formativeAssessmentWeight: 100 - val,
                        });
                      }}
                      className="w-full accent-blue-600"
                    />
                    <span className="font-bold font-mono text-blue-700 w-12 text-right">
                      {cbcReportCardConfig.summativeAssessmentWeight}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Mid-term & End of Term unified examinations
                  </span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 text-xs">
                <label className="font-bold text-slate-800 block">Report Card Inclusions & Features:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cbcReportCardConfig.showClassRanking}
                      onChange={(e) => updateCBCReportCardConfig({ showClassRanking: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Show Class Position & Ranking</span>
                      <span className="text-[11px] text-slate-500">Disable for Primary CBC; Enable for High School</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cbcReportCardConfig.showGpaPoints}
                      onChange={(e) => updateCBCReportCardConfig({ showGpaPoints: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Show Mean GPA / Aggregate Points</span>
                      <span className="text-[11px] text-slate-500">Calculates cumulative 4.0 GPA or 12-point KNEC mean</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cbcReportCardConfig.showAttendanceSummary}
                      onChange={(e) => updateCBCReportCardConfig({ showAttendanceSummary: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Show Termly Attendance Stats</span>
                      <span className="text-[11px] text-slate-500">Days present, late arrivals, and attendance percentage</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cbcReportCardConfig.showFeeBalanceNotice}
                      onChange={(e) => updateCBCReportCardConfig({ showFeeBalanceNotice: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Attach Outstanding Fee Notice</span>
                      <span className="text-[11px] text-slate-500">Displays next term fee balance memo at footer</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* CBC Performance Levels Customization Table */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  CBC Performance Level Brackets (EE, ME, AE, BE):
                </label>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-3 py-2.5 text-left">Level & Code</th>
                        <th className="px-3 py-2.5 text-left">Descriptor Label</th>
                        <th className="px-3 py-2.5 text-center">Score Range (%)</th>
                        <th className="px-3 py-2.5 text-left">Criteria Definition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {(cbcReportCardConfig.performanceLevels || []).map((pl) => (
                        <tr key={pl.code}>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span
                              className="font-black px-2 py-1 rounded-md text-white font-mono text-xs inline-block"
                              style={{ backgroundColor: pl.color }}
                            >
                              {pl.code} ({pl.level})
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={pl.label}
                              onChange={(e) =>
                                updateCBCPerformanceLevel(pl.code, { label: e.target.value })
                              }
                              className="w-full px-2 py-1 rounded border border-slate-300 font-semibold"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1">
                              <input
                                type="number"
                                value={pl.minScore}
                                onChange={(e) =>
                                  updateCBCPerformanceLevel(pl.code, { minScore: Number(e.target.value) })
                                }
                                className="w-12 px-1.5 py-1 rounded border border-slate-300 font-mono text-center"
                              />
                              <span>-</span>
                              <input
                                type="number"
                                value={pl.maxScore}
                                onChange={(e) =>
                                  updateCBCPerformanceLevel(pl.code, { maxScore: Number(e.target.value) })
                                }
                                className="w-12 px-1.5 py-1 rounded border border-slate-300 font-mono text-center"
                              />
                              <span>%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              type="text"
                              value={pl.description}
                              onChange={(e) =>
                                updateCBCPerformanceLevel(pl.code, { description: e.target.value })
                              }
                              className="w-full px-2 py-1 rounded border border-slate-300 text-[11px]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUBJECTS & LEARNING AREAS */}
          {activeSubTab === 'subjects' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Learning Areas, Strands & Subject Curricula</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage subjects tailored for {cbcReportCardConfig.schoolLevel.replace('_', ' ')}. Add specific learning strands for rubrics.
                  </p>
                </div>
                <button
                  id="add-learning-area-btn"
                  onClick={() => {
                    setNewSubLevel(cbcReportCardConfig.schoolLevel);
                    setShowAddSubjectModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Learning Area</span>
                </button>
              </div>

              {/* Subject List */}
              <div className="space-y-3">
                {(cbcReportCardConfig.customSubjects || []).map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-xl border transition ${
                      sub.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={sub.enabled}
                          onChange={(e) => updateCBCSubject(sub.id, { enabled: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900">{sub.name}</span>
                            <span className="px-2 py-0.5 rounded-sm bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                              {sub.code}
                            </span>
                            {sub.pathway && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                                {sub.pathway}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Area: <strong>{sub.learningArea}</strong> • {sub.credits} Periods/Week • Level:{' '}
                            <span className="capitalize">{sub.schoolLevel.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingSubject({ ...sub })}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Subject"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${sub.name}" from active curriculum?`)) {
                              deleteCBCSubject(sub.id);
                              triggerSaveNotification();
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Strands tags */}
                    {sub.strands && sub.strands.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Strands:
                        </span>
                        {sub.strands.map((strand, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                          >
                            {strand}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: 7 COMPETENCIES & CORE VALUES */}
          {activeSubTab === 'competencies' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  <span>The 7 CBC Core Competencies & Ethical Values Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the 7 national CBC pillars and core values evaluated in termly holistic student transcripts.
                </p>
              </div>

              {/* 7 Competencies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Core Competency Strands:
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cbcReportCardConfig.showCoreCompetencies}
                      onChange={(e) => updateCBCReportCardConfig({ showCoreCompetencies: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold">Include Competency Matrix in Transcript</span>
                  </label>
                </div>

                <div className="space-y-2">
                  {(cbcReportCardConfig.competencies || []).map((comp) => (
                    <div
                      key={comp.id}
                      className={`p-3 rounded-xl border transition ${
                        comp.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={comp.enabled}
                            onChange={() => toggleCBCCompetency(comp.id)}
                            className="mt-1 rounded text-emerald-600"
                          />
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">{comp.name}</span>
                            <span className="text-[11px] text-slate-500 block">{comp.description}</span>
                          </div>
                        </div>

                        <select
                          value={comp.defaultRating}
                          onChange={(e) =>
                            updateCBCCompetency(comp.id, {
                              defaultRating: e.target.value as 'EE' | 'ME' | 'AE' | 'BE',
                            })
                          }
                          className="px-2 py-1 rounded border border-slate-300 text-xs font-bold text-emerald-700 bg-emerald-50"
                        >
                          <option value="EE">EE (Level 4)</option>
                          <option value="ME">ME (Level 3)</option>
                          <option value="AE">AE (Level 2)</option>
                          <option value="BE">BE (Level 1)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Values */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    CBC Values & Ethics Assessment:
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cbcReportCardConfig.showValuesAssessment}
                      onChange={(e) => updateCBCReportCardConfig({ showValuesAssessment: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold">Include Values Appraisal</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(cbcReportCardConfig.values || []).map((val) => (
                    <div
                      key={val.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        val.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={val.enabled}
                          onChange={() => toggleCBCValue(val.id)}
                          className="rounded text-emerald-600"
                        />
                        <span className="font-bold text-slate-800">{val.name}</span>
                      </label>

                      <select
                        value={val.defaultRating}
                        onChange={(e) =>
                          updateCBCValue(val.id, {
                            defaultRating: e.target.value as 'EE' | 'ME' | 'AE' | 'BE',
                          })
                        }
                        className="px-1.5 py-0.5 rounded border border-slate-300 text-[11px] font-bold text-emerald-800"
                      >
                        <option value="EE">EE</option>
                        <option value="ME">ME</option>
                        <option value="AE">AE</option>
                        <option value="BE">BE</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Service Learning (CSL) Project */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Community Service Learning (CSL) Termly Project</span>
                  <input
                    type="checkbox"
                    checked={cbcReportCardConfig.showCommunityServiceLearning}
                    onChange={(e) => updateCBCReportCardConfig({ showCommunityServiceLearning: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Active Term CSL Project Title</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.cslProjectTitle}
                    onChange={(e) => updateCBCReportCardConfig({ cslProjectTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SIGNATORIES & DATES */}
          {activeSubTab === 'signatories' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 text-slate-900">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-rose-600" />
                  <span>Institutional Signatories, Endorsements & Calendar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure official academic titles, school closing dates, next term resumption dates, and seal text.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Teacher / Facilitator Title</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.classTeacherTitle}
                    onChange={(e) => updateCBCReportCardConfig({ classTeacherTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head Teacher / Principal Title</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.principalTitle}
                    onChange={(e) => updateCBCReportCardConfig({ principalTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Term Closing Date</label>
                  <input
                    type="date"
                    value={cbcReportCardConfig.closingDate}
                    onChange={(e) => updateCBCReportCardConfig({ closingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Next Term Resumption Date</label>
                  <input
                    type="date"
                    value={cbcReportCardConfig.nextTermOpeningDate}
                    onChange={(e) => updateCBCReportCardConfig({ nextTermOpeningDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Official Registry Seal Watermark Text</label>
                  <input
                    type="text"
                    value={cbcReportCardConfig.officialSealText}
                    onChange={(e) => updateCBCReportCardConfig({ officialSealText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                </div>

                {/* School Crest / Seal Upload Card (< 2MB Compressed) */}
                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <CompressedFileUpload
                    id="cbc-report-card-crest-upload"
                    onFileCompressed={(res) => updateCBCReportCardConfig({ institutionLogoUrl: res.dataUrl })}
                    onFileRemoved={() => updateCBCReportCardConfig({ institutionLogoUrl: undefined })}
                    currentPreviewUrl={cbcReportCardConfig.institutionLogoUrl}
                    label="Official School Crest, Ministry Seal, or Emblem (Image or PDF)"
                    helperText="Printed on CBC report cards. Auto-compressed to < 2MB to save storage space."
                    accept="image/*,.pdf"
                    compact
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Document Theme Accent Color</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'emerald_cbc', label: 'Emerald CBC', bg: 'bg-emerald-600' },
                      { id: 'navy_classic', label: 'Navy Classic', bg: 'bg-blue-800' },
                      { id: 'maroon_high', label: 'Maroon Heritage', bg: 'bg-rose-900' },
                      { id: 'indigo_modern', label: 'Indigo Modern', bg: 'bg-indigo-700' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          updateCBCReportCardConfig({
                            colorTheme: theme.id as 'emerald_cbc' | 'navy_classic' | 'maroon_high' | 'indigo_modern',
                          })
                        }
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                          cbcReportCardConfig.colorTheme === theme.id
                            ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${theme.bg}`} />
                        <span>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={triggerSaveNotification}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Signatory & Date Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Document Preview */}
        <div className="xl:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Document Preview</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400">Previewing:</span>
              <select
                value={previewLevelOverride}
                onChange={(e) => setPreviewLevelOverride(e.target.value as CBCSchoolLevel)}
                className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400"
              >
                <option value="primary">Primary (Grades 1-6)</option>
                <option value="junior_secondary">Junior Secondary (7-9)</option>
                <option value="senior_high">Senior High (10-12)</option>
                <option value="hybrid">International Hybrid</option>
              </select>
            </div>
          </div>

          {/* Rendered CBC Document Box */}
          <div className="overflow-y-auto max-h-[800px] rounded-2xl border border-slate-300 bg-slate-100 p-2 shadow-inner">
            <div
              id="cbc-report-card-preview-container"
              className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200 text-slate-900 space-y-5 text-xs"
            >
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-slate-800">
                <div className="flex justify-center mb-2">
                  <Shule101Logo variant="horizontal" size="md" />
                </div>
                <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
                  {cbcReportCardConfig.institutionName}
                </h2>
                <p className="text-[11px] text-slate-600 italic mt-0.5">
                  "{cbcReportCardConfig.institutionMotto}"
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  NEMIS: {cbcReportCardConfig.nemisCode} • KNEC Code: {cbcReportCardConfig.knecCode} • {cbcReportCardConfig.countySubCounty}
                </p>

                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-black text-emerald-900 uppercase tracking-wider">
                  {cbcReportCardConfig.reportTitle}
                </div>
                <div className="text-[10px] font-bold text-slate-500 mt-1">
                  {cbcReportCardConfig.academicTerm} • Academic Year {cbcReportCardConfig.academicYear}
                </div>
              </div>

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Full Name</span>
                  <span className="font-bold text-slate-900">
                    {sampleStudent.firstName} {sampleStudent.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Admission Number / NEMIS UPI</span>
                  <span className="font-mono font-bold text-slate-900">{sampleStudent.admissionNo}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Grade & Stream</span>
                  <span className="font-bold text-slate-900">
                    {sampleStudent.grade} ({sampleStudent.section})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Parent / Guardian</span>
                  <span className="font-bold text-slate-900">{sampleStudent.guardian.name}</span>
                </div>
              </div>

              {/* Learning Areas & Strands Table */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>Learning Area Performance & Assessment Strands</span>
                  <span className="text-slate-500 text-[10px]">
                    SBA: {cbcReportCardConfig.formativeAssessmentWeight}% | Exam: {cbcReportCardConfig.summativeAssessmentWeight}%
                  </span>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-[10px]">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="px-2 py-1.5 text-left">Learning Area</th>
                        {cbcReportCardConfig.gradingScaleMode !== 'rubric_only' && (
                          <>
                            <th className="px-1.5 py-1.5 text-center">SBA ({cbcReportCardConfig.formativeAssessmentWeight})</th>
                            <th className="px-1.5 py-1.5 text-center">Exam ({cbcReportCardConfig.summativeAssessmentWeight})</th>
                            <th className="px-1.5 py-1.5 text-center">Total %</th>
                          </>
                        )}
                        <th className="px-2 py-1.5 text-center">CBC Level</th>
                        {cbcReportCardConfig.gradingScaleMode === 'comprehensive_dual' && (
                          <th className="px-1.5 py-1.5 text-center">KNEC Grade</th>
                        )}
                        <th className="px-2 py-1.5 text-left">Teacher Strand Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {activeSubjects.slice(0, 6).map((sub, idx) => {
                        const mockSba = 32 + (idx % 3) * 3;
                        const mockExam = 48 + (idx % 4) * 2;
                        const mockTotal = Math.min(100, mockSba + mockExam);
                        const cbcRating = mockTotal >= 80 ? 'EE' : mockTotal >= 65 ? 'ME' : mockTotal >= 50 ? 'AE' : 'BE';
                        const knecLetter = mockTotal >= 80 ? 'A' : mockTotal >= 70 ? 'B+' : mockTotal >= 60 ? 'B' : mockTotal >= 50 ? 'C+' : 'D';

                        return (
                          <tr key={sub.id}>
                            <td className="px-2 py-1.5 font-bold text-slate-900">
                              <div>{sub.name}</div>
                              {sub.strands && (
                                <div className="text-[9px] text-slate-500 font-normal truncate max-w-[140px]">
                                  {sub.strands.slice(0, 2).join(' • ')}
                                </div>
                              )}
                            </td>
                            {cbcReportCardConfig.gradingScaleMode !== 'rubric_only' && (
                              <>
                                <td className="px-1.5 py-1.5 text-center text-slate-600 font-mono">{mockSba}</td>
                                <td className="px-1.5 py-1.5 text-center text-slate-600 font-mono">{mockExam}</td>
                                <td className="px-1.5 py-1.5 text-center font-bold text-slate-900 font-mono">{mockTotal}%</td>
                              </>
                            )}
                            <td className="px-2 py-1.5 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold font-mono text-[9px] text-white ${
                                  cbcRating === 'EE'
                                    ? 'bg-emerald-600'
                                    : cbcRating === 'ME'
                                    ? 'bg-blue-600'
                                    : cbcRating === 'AE'
                                    ? 'bg-amber-600'
                                    : 'bg-rose-600'
                                }`}
                              >
                                {cbcRating}
                              </span>
                            </td>
                            {cbcReportCardConfig.gradingScaleMode === 'comprehensive_dual' && (
                              <td className="px-1.5 py-1.5 text-center font-bold font-mono text-indigo-700">
                                {knecLetter}
                              </td>
                            )}
                            <td className="px-2 py-1.5 text-[9px] text-slate-600 italic">
                              Demonstrates solid grasp of key learning strands.
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rubric Key Legend */}
              <div className="grid grid-cols-4 gap-1 text-[9px] text-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-emerald-700 font-bold">EE: Exceeding Exp (80-100%)</div>
                <div className="text-blue-700 font-bold">ME: Meeting Exp (65-79%)</div>
                <div className="text-amber-700 font-bold">AE: Approaching Exp (50-64%)</div>
                <div className="text-rose-700 font-bold">BE: Below Exp (0-49%)</div>
              </div>

              {/* 7 Competencies Rating Matrix */}
              {cbcReportCardConfig.showCoreCompetencies && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    CBC Core Competencies & Values Evaluation
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(cbcReportCardConfig.competencies || []).slice(0, 4).map((comp) => (
                      <div
                        key={comp.id}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-[9px]"
                      >
                        <span className="font-semibold text-slate-800 truncate mr-1">{comp.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
                          {comp.defaultRating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CSL Termly Project */}
              {cbcReportCardConfig.showCommunityServiceLearning && (
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[10px]">
                  <span className="font-bold text-emerald-900 block">Community Service Learning (CSL) Project:</span>
                  <p className="text-slate-700 italic mt-0.5">"{cbcReportCardConfig.cslProjectTitle}"</p>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-emerald-800 font-medium">
                    <span>Appraisal: <strong>Exemplary Civic Participation (Level 4)</strong></span>
                    <span>Portfolio Signed: Yes</span>
                  </div>
                </div>
              )}

              {/* Attendance & Term Summary */}
              {cbcReportCardConfig.showAttendanceSummary && (
                <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">Term Attendance</span>
                    <span className="font-bold text-slate-900">98.4% (62/63 Days)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Term Closing</span>
                    <span className="font-bold text-slate-900">{cbcReportCardConfig.closingDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">Next Term Reopening</span>
                    <span className="font-bold text-emerald-700">{cbcReportCardConfig.nextTermOpeningDate}</span>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[9px] text-slate-600">
                <div>
                  <div className="h-6 border-b border-slate-400 mb-1 flex items-end justify-center italic text-slate-800 font-serif">
                    G. Vance
                  </div>
                  <span>{cbcReportCardConfig.classTeacherTitle}</span>
                </div>
                <div>
                  <div className="h-6 border-b border-slate-400 mb-1 flex items-end justify-center italic text-slate-800 font-serif">
                    M. Hastings
                  </div>
                  <span>{cbcReportCardConfig.principalTitle}</span>
                </div>
                <div>
                  <div className="h-6 border-b border-slate-400 mb-1 flex items-end justify-center font-mono font-bold text-emerald-800">
                    VERIFIED SEAL
                  </div>
                  <span>Ministry & School Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Learning Area Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Add CBC Learning Area / Subject</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Learning Area / Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Science & AI Studies"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COMP-AI"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weekly Periods / Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Curriculum Level</label>
                  <select
                    value={newSubLevel}
                    onChange={(e) => setNewSubLevel(e.target.value as CBCSchoolLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="primary">Primary School (Grades 1-6)</option>
                    <option value="junior_secondary">Junior Secondary (Grades 7-9)</option>
                    <option value="senior_high">Senior High (Grades 10-12)</option>
                    <option value="all">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">High School Pathway</label>
                  <select
                    value={newSubPathway}
                    onChange={(e) =>
                      setNewSubPathway(e.target.value as 'STEM' | 'Arts & Sports Science' | 'Social Sciences' | 'Core')
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Core">Core / Universal</option>
                    <option value="STEM">STEM & Pure Sciences</option>
                    <option value="Arts & Sports Science">Arts & Sports Science</option>
                    <option value="Social Sciences">Social Sciences & Humanities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Learning Strands (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Data Analysis, Python Programming, AI Ethics"
                  value={newSubStrands}
                  onChange={(e) => setNewSubStrands(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-700/20"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Learning Area: {editingSubject.name}</h3>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setEditingSubject(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateSubjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weekly Periods</label>
                  <input
                    type="number"
                    value={editingSubject.credits}
                    onChange={(e) => setEditingSubject({ ...editingSubject, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Learning Strands (comma separated)</label>
                <input
                  type="text"
                  value={(editingSubject.strands || []).join(', ')}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      strands: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Update Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
