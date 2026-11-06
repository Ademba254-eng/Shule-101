import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  KeyRound,
  FileText,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Building,
  Terminal,
} from 'lucide-react';
import { Shule101Logo } from './Shule101Logo';
import { useSchool } from '../context/SchoolContext';

interface Forbidden403ViewProps {
  onOpen2FA?: () => void;
  onAuthenticate2FA?: () => void;
  onGoHome?: () => void;
  onReturnHome?: () => void;
  attemptedPath?: string;
  userEmail?: string;
  userRole?: string;
}

export const Forbidden403View: React.FC<Forbidden403ViewProps> = ({
  onOpen2FA,
  onAuthenticate2FA,
  onGoHome,
  onReturnHome,
  attemptedPath = '/admin',
  userEmail,
  userRole,
}) => {
  const { currentSchool, currentUser } = useSchool();
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [incidentId] = useState(() => `SEC-403-${Date.now().toString().slice(-6)}`);
  const [timestamp] = useState(() => new Date().toISOString().replace('T', ' ').slice(0, 19));

  const handleTrigger2FA = () => {
    if (onAuthenticate2FA) {
      onAuthenticate2FA();
    } else if (onOpen2FA) {
      onOpen2FA();
    }
  };

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else if (onGoHome) {
      onGoHome();
    }
  };

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(`INCIDENT_${incidentId}_${attemptedPath}`);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <div
      id="forbidden-403-screen"
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white"
    >
      {/* Top Banner */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <Shule101Logo variant="horizontal" size="md" />
          <span className="hidden sm:inline-block text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Security Directorate
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            id="forbidden-back-home-btn"
            onClick={handleReturnHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs font-semibold border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to School Portal</span>
          </button>
        </div>
      </header>

      {/* Main 403 Content */}
      <main className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 my-auto">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-rose-900/40 shadow-2xl shadow-rose-950/20 overflow-hidden">
          {/* Status Header Bar */}
          <div className="bg-rose-950/40 border-b border-rose-900/50 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
              <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
                HTTP Status: 403 Forbidden • Access Denied
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              <span>Incident Ticket #{incidentId}</span>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Visual Icon & Main Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 flex-shrink-0 ring-4 ring-rose-500/20">
                <ShieldAlert className="w-10 h-10 stroke-[2.2]" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restricted National Directorate Endpoint</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  403 Forbidden: Administrative Clearance Required
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  You do not have the required clearance level or active Two-Factor Authentication (2FA) session to access the dedicated <span className="text-rose-300 font-mono font-semibold">{attemptedPath}</span> administrative command portal.
                </p>
              </div>
            </div>

            {/* Incident Telemetry Log Box */}
            <div className="bg-slate-950/80 rounded-xl p-4 sm:p-5 border border-slate-800 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300 flex items-center space-x-2">
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>ACCESS ATTEMPT TELEMETRY & SECURITY LOG</span>
                </span>
                <button
                  onClick={handleCopyTicket}
                  className="flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                  title="Copy incident ref"
                >
                  {copiedTicket ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTicket ? 'Copied' : 'Copy Log Ref'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500">Timestamp: </span>
                  <span className="text-slate-200">{timestamp} UTC</span>
                </div>
                <div>
                  <span className="text-slate-500">Attempted Resource: </span>
                  <span className="text-rose-400 font-bold">{attemptedPath}</span>
                </div>
                <div>
                  <span className="text-slate-500">Client Identity: </span>
                  <span className="text-slate-200">
                    {currentUser ? `${currentUser.name} (${currentUser.email})` : 'Unauthenticated Origin / Guest'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Assigned Privilege: </span>
                  <span className="text-amber-400">
                    {currentUser?.role === 'staff'
                      ? `Staff (${currentUser.staffDivision || 'Faculty'}) - Missing 2FA Key`
                      : currentUser?.role === 'parent'
                      ? 'Guardian / Student Account (Denied)'
                      : 'Zero Clearance'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Institutional Node: </span>
                  <span className="text-slate-200">{currentSchool?.name || 'Shule 101 Academy'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Enforcement Action: </span>
                  <span className="text-rose-400 font-bold">403_ACCESS_INTERCEPT_AND_LOGGED</span>
                </div>
              </div>
            </div>

            {/* Why was this blocked? Informational notice */}
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 flex items-start space-x-3 text-amber-200 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 mb-1">Administrative Security Protocol</p>
                <p className="text-amber-200/90">
                  To prevent unauthorized access to student records, national registry databases, financial bursar overrides, and staff credentials, access to this dedicated section is strictly safeguarded by mandatory <strong>Two-Step Authentication (TOTP / Email OTP Verification)</strong>.
                </p>
              </div>
            </div>

            {/* Call to action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                id="authenticate-2fa-btn"
                onClick={handleTrigger2FA}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-900/30 transition transform active:scale-95 ring-2 ring-indigo-400/30"
              >
                <KeyRound className="w-4 h-4" />
                <span>Authenticate with Admin 2-Step Verification</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  id="return-portal-btn"
                  onClick={handleReturnHome}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
                >
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>Back to Portal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Helper */}
          <div className="bg-slate-950 border-t border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                Demo Admin Credentials available: <strong className="text-slate-300">admin@shule101.gov</strong> or{' '}
                <strong className="text-slate-300">sysadmin@shule101.edu</strong>
              </span>
            </div>
            <button
              onClick={handleTrigger2FA}
              className="text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Launch 2FA Challenge</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>Shule 101 Security Telemetry & National Directorate Node • Strict Access Enforcement</p>
      </footer>
    </div>
  );
};
