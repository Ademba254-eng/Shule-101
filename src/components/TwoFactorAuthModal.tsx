import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Smartphone,
  Key,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Send,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserAccount } from '../types';

interface TwoFactorAuthModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialEmail?: string;
  targetEmail?: string;
}

export const TwoFactorAuthModal: React.FC<TwoFactorAuthModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  initialEmail,
  targetEmail,
}) => {
  const { verifyAdmin2FA, systemUsers, currentUser } = useSchool();
  const effectiveEmail = targetEmail || initialEmail;

  // Admin Email & Primary Credentials
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    if (effectiveEmail) return effectiveEmail;
    if (currentUser?.isAdmin || currentUser?.role === 'admin') return currentUser.email;
    return 'admin@shule101.gov';
  });
  const [adminPassword, setAdminPassword] = useState<string>('admin2026');

  // Step in 2FA flow: 'credentials' | 'challenge'
  const [step, setStep] = useState<'credentials' | 'challenge'>('challenge');

  // 2FA Method: 'totp' | 'email_otp' | 'recovery_key'
  const [method, setMethod] = useState<'totp' | 'email_otp' | 'recovery_key'>('totp');

  // Verification Code Input
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated TOTP state (30-second rotating code)
  const [simulatedTotp, setSimulatedTotp] = useState<string>('592814');
  const [totpCountdown, setTotpCountdown] = useState<number>(24);
  const [copiedTotp, setCopiedTotp] = useState<boolean>(false);

  // Simulated Email OTP state
  const [emailOtpSent, setEmailOtpSent] = useState<boolean>(false);
  const [simulatedEmailCode, setSimulatedEmailCode] = useState<string>('849201');

  // Emergency Recovery Key
  const MASTER_RECOVERY_KEY = 'SHULE-ADMIN-SECURE-2026-KEY';

  // Update TOTP countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTotpCountdown((prev) => {
        if (prev <= 1) {
          // Generate new simulated 6-digit code
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          setSimulatedTotp(newCode);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (targetEmail || initialEmail) {
      setAdminEmail(targetEmail || initialEmail || 'admin@shule101.gov');
    }
  }, [targetEmail, initialEmail]);

  if (!isOpen) return null;

  // Handle Credentials Check (Step 1)
  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter the administrator institutional email.');
      return;
    }

    const matchedAccount = systemUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const isAuthorized =
      cleanEmail.includes('admin') ||
      cleanEmail === 'principal@shule101.edu' ||
      cleanEmail.endsWith('.gov') ||
      matchedAccount?.isAdmin ||
      matchedAccount?.role === 'admin';

    if (!isAuthorized) {
      setErrorMessage('403 Forbidden: Account does not have administrative security clearance.');
      return;
    }

    setStep('challenge');
  };

  // Handle Email OTP Dispatch Simulation
  const handleDispatchEmailOtp = () => {
    setEmailOtpSent(true);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedEmailCode(generated);
  };

  // Quick fill helper
  const handleFillCode = (val: string) => {
    setCode(val);
    setErrorMessage(null);
  };

  // Copy code helper
  const handleCopyCode = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedTotp(true);
    setTimeout(() => setCopiedTotp(false), 2000);
  };

  // Handle Submit 2FA Code (Step 2)
  const handleSubmit2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = code.trim().replace(/-/g, '').replace(/\s+/g, '');
    if (!cleanCode) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Verify with context
      const result = verifyAdmin2FA(adminEmail, cleanCode, method);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(result.error || 'Verification failed. 403 Forbidden.');
      }
    }, 450);
  };

  return (
    <div
      id="two-factor-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Admin 2-Step Authentication</h2>
              <p className="text-xs text-indigo-200/80">
                National Directorate Security Clearance • Level 4
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-xs animate-in shake">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication Refused: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {step === 'credentials' ? (
            /* STEP 1: Enter Email & Password */
            <form onSubmit={handleVerifyCredentials} className="space-y-4">
              <p className="text-xs text-slate-600">
                Please confirm your authorized administrator email credentials before proceeding to the 2FA verification challenge.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institutional Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@shule101.gov"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Master Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  <span>Continue to 2FA Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: 2FA Methods */
            <form onSubmit={handleSubmit2FA} className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Authenticating Account: </span>
                  <strong className="text-slate-800 font-semibold">{adminEmail}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] underline"
                >
                  Change Account
                </button>
              </div>

              {/* Method Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select 2-Step Verification Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('totp');
                      setCode('');
                      setErrorMessage(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      method === 'totp'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs">Authenticator App (TOTP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('email_otp');
                      setCode('');
                      setErrorMessage(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      method === 'email_otp'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs">Email OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('recovery_key');
                      setCode('');
                      setErrorMessage(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      method === 'recovery_key'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs'
                    }`}
                  >
                    <Key className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs">Recovery Key</span>
                  </button>
                </div>
              </div>

              {/* Method Specific Assistance Card */}
              {method === 'totp' && (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">LIVE TOTP GENERATOR SIMULATION</span>
                    <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{totpCountdown}s remaining</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div className="font-mono text-xl font-bold tracking-widest text-indigo-300">
                      {simulatedTotp.slice(0, 3)} {simulatedTotp.slice(3)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(simulatedTotp)}
                        className="p-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition flex items-center space-x-1"
                        title="Copy OTP"
                      >
                        {copiedTotp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTotp ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCode(simulatedTotp)}
                        className="px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-1000"
                      style={{ width: `${(totpCountdown / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {method === 'email_otp' && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-start justify-between text-xs text-indigo-900">
                    <div className="space-y-0.5">
                      <p className="font-bold">Email One-Time Password Dispatch</p>
                      <p className="text-indigo-700 text-[11px]">
                        Dispatched to registered inbox: <strong>{adminEmail}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDispatchEmailOtp}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold"
                    >
                      <Send className="w-3 h-3" />
                      <span>{emailOtpSent ? 'Resend' : 'Send Code'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-200 text-xs">
                    <span className="text-slate-600">Simulated Received Code:</span>
                    <div className="flex items-center space-x-2">
                      <strong className="font-mono text-indigo-900 font-bold tracking-wider">
                        {simulatedEmailCode}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleFillCode(simulatedEmailCode)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline ml-1"
                      >
                        Use Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {method === 'recovery_key' && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-xs text-amber-900">
                  <p className="font-bold">Master Directorate Recovery Key</p>
                  <p className="text-amber-800 text-[11px]">
                    Use your institutional offline recovery cipher for emergency administrative override.
                  </p>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200 font-mono text-[11px] text-slate-800">
                    <span>{MASTER_RECOVERY_KEY}</span>
                    <button
                      type="button"
                      onClick={() => handleFillCode(MASTER_RECOVERY_KEY)}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 underline"
                    >
                      Auto-fill Key
                    </button>
                  </div>
                </div>
              )}

              {/* Code Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {method === 'recovery_key' ? 'Master Recovery Key' : '6-Digit Verification Code'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={method === 'recovery_key' ? 'SHULE-ADMIN-SECURE-2026-KEY' : 'e.g. 592814'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying Security Token...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Enter Admin Portal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted IAM Clearance</span>
          </span>
          <span>Session validity: 2 Hours</span>
        </div>
      </div>
    </div>
  );
};
