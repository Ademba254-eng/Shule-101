/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PerformanceView } from './components/PerformanceView';
import { AttendanceView } from './components/AttendanceView';
import { FeesView } from './components/FeesView';
import { MessagingView } from './components/MessagingView';
import { StudentDirectoryView } from './components/StudentDirectoryView';
import { ParentPortalView } from './components/ParentPortalView';
import { ReportCardModal } from './components/ReportCardModal';
import { PaymentModal } from './components/PaymentModal';
import { AddStudentModal } from './components/AddStudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { LoginPage } from './components/LoginPage';
import { Shule101Logo } from './components/Shule101Logo';
import { AdminView } from './components/AdminView';
import { Forbidden403View } from './components/Forbidden403View';
import { TwoFactorAuthModal } from './components/TwoFactorAuthModal';

const MainContent: React.FC = () => {
  const {
    activeRole,
    currentUser,
    adminSession,
    logSecurityEvent,
    verifyAdmin2FA,
    login,
    registeredSchools,
  } = useSchool();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // 2FA and Security Interception State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [twoFactorTargetEmail, setTwoFactorTargetEmail] = useState<string>('admin@shule101.gov');
  const [simulatedForbidden, setSimulatedForbidden] = useState<boolean>(false);

  // Modals state
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | undefined>(undefined);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);

  // Sync URL hash / pathname on initial load and route changes
  const checkUrlRoute = useCallback(() => {
    try {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search;
      const params = new URLSearchParams(search);

      // Magic link or Email token parameter support
      const emailParam = params.get('email') || params.get('auth_email') || params.get('user');
      const magicToken = params.get('token') || params.get('magic') || params.get('code');

      if (magicToken && emailParam) {
        // Auto-validate magic link
        const success = verifyAdmin2FA(emailParam, magicToken);
        if (success) {
          setCurrentTab('admin');
          return;
        }
      }

      if (
        pathname.includes('/admin') ||
        hash === '#admin' ||
        params.get('tab') === 'admin' ||
        params.get('view') === 'admin' ||
        params.get('section') === 'admin'
      ) {
        setCurrentTab('admin');
      }
    } catch {
      // Ignore URL parse errors in isolated sandboxes
    }
  }, [verifyAdmin2FA]);

  useEffect(() => {
    checkUrlRoute();

    const handlePopState = () => {
      checkUrlRoute();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [checkUrlRoute]);

  // Sync browser history state when changing tabs
  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab);
    setSimulatedForbidden(false);

    try {
      if (tab === 'admin') {
        window.history.pushState(null, '', '#admin');
      } else if (window.location.hash === '#admin') {
        window.history.pushState(null, '', '#dashboard');
      }
    } catch {
      // Safe fallback
    }
  };

  // If user requests 2FA verification from 403 or Login
  const handleTriggerAdmin2FA = (targetEmail?: string) => {
    if (targetEmail) {
      setTwoFactorTargetEmail(targetEmail);
    }
    setIs2FAModalOpen(true);
  };

  const handle2FASuccess = () => {
    setIs2FAModalOpen(false);
    setSimulatedForbidden(false);
    setCurrentTab('admin');
    try {
      window.history.pushState(null, '', '#admin');
    } catch {
      // Safe
    }
  };

  // If no user is authenticated AND not attempting to access admin via URL/email
  if (!currentUser && currentTab !== 'admin' && !simulatedForbidden) {
    return (
      <>
        <LoginPage
          onOpenAdmin2FA={(email) => handleTriggerAdmin2FA(email)}
          onNavigateAdminUrl={() => handleNavigateTab('admin')}
        />
        {is2FAModalOpen && (
          <TwoFactorAuthModal
            targetEmail={twoFactorTargetEmail}
            onClose={() => setIs2FAModalOpen(false)}
            onSuccess={handle2FASuccess}
          />
        )}
      </>
    );
  }

  // Handlers for standard school modals
  const handleOpenReportCard = (studentId: string) => {
    setReportCardStudentId(studentId);
  };

  const handleOpenPaymentModal = (invoiceId?: string) => {
    setPaymentInvoiceId(invoiceId);
    setIsPaymentModalOpen(true);
  };

  const handleOpenStudentDetail = (studentId: string) => {
    setDetailStudentId(studentId);
  };

  // -------------------------------------------------------------
  // ADMIN SECTION ROUTE INTERCEPTION & 403 FORBIDDEN LOGIC
  // -------------------------------------------------------------
  if (currentTab === 'admin' || simulatedForbidden) {
    // 1. If user is in simulated 403 mode or has no active 2FA admin session
    if (simulatedForbidden || !adminSession) {
      return (
        <>
          <Forbidden403View
            attemptedPath="/admin"
            userEmail={currentUser?.email || 'unauthorized-client@external.network'}
            userRole={currentUser?.role || 'guest'}
            onAuthenticate2FA={() => handleTriggerAdmin2FA(currentUser?.email || 'admin@shule101.gov')}
            onReturnHome={() => handleNavigateTab('dashboard')}
          />

          {is2FAModalOpen && (
            <TwoFactorAuthModal
              targetEmail={twoFactorTargetEmail}
              onClose={() => setIs2FAModalOpen(false)}
              onSuccess={handle2FASuccess}
            />
          )}
        </>
      );
    }

    // 2. User has active, verified 2FA admin clearance
    return (
      <>
        <AdminView
          onExitAdmin={() => handleNavigateTab('dashboard')}
          onSimulate403={() => setSimulatedForbidden(true)}
          onReauth2FA={() => handleTriggerAdmin2FA(adminSession.adminEmail)}
        />

        {is2FAModalOpen && (
          <TwoFactorAuthModal
            targetEmail={twoFactorTargetEmail}
            onClose={() => setIs2FAModalOpen(false)}
            onSuccess={handle2FASuccess}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // STANDARD SCHOOL PORTAL VIEWS (Staff / Teacher / Parent)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeRole === 'parent' ? (
          /* Parent Portal Experience */
          <ParentPortalView
            onOpenReportCard={handleOpenReportCard}
            onOpenPaymentModal={handleOpenPaymentModal}
            onNavigateToMessaging={() => handleNavigateTab('messaging')}
          />
        ) : (
          /* Staff / Faculty Dashboard Views */
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                onNavigate={(tab) => handleNavigateTab(tab)}
                onNavigateToTab={(tab) => handleNavigateTab(tab)}
                onOpenReportCard={handleOpenReportCard}
                onOpenPaymentModal={handleOpenPaymentModal}
                onOpenStudentDetail={handleOpenStudentDetail}
              />
            )}

            {currentTab === 'performance' && (
              <PerformanceView onOpenReportCard={handleOpenReportCard} />
            )}

            {currentTab === 'attendance' && <AttendanceView />}

            {currentTab === 'fees' && (
              <FeesView
                onOpenPaymentModal={handleOpenPaymentModal}
                isPaymentModalOpen={isPaymentModalOpen}
                selectedInvoiceIdForPayment={paymentInvoiceId}
                onClosePaymentModal={() => setIsPaymentModalOpen(false)}
                onNavigateToDashboard={() => handleNavigateTab('dashboard')}
              />
            )}

            {currentTab === 'messaging' && <MessagingView />}

            {currentTab === 'students' && (
              <StudentDirectoryView
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
                onOpenStudentDetail={handleOpenStudentDetail}
                onOpenReportCard={handleOpenReportCard}
                onNavigateToMessaging={() => handleNavigateTab('messaging')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <Shule101Logo variant="mark" size="sm" />
            <span className="font-bold text-[#261611]">Shule 101</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-800 italic font-medium">connect . simplify and grow</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              id="footer-admin-link"
              onClick={() => handleNavigateTab('admin')}
              className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition"
            >
              Directorate Admin (2FA)
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 text-[11px]">Academic Year 2025/2026 • Term 2 Active • National Registry</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {reportCardStudentId && (
        <ReportCardModal
          studentId={reportCardStudentId}
          onClose={() => setReportCardStudentId(null)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          invoiceId={paymentInvoiceId}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentInvoiceId(undefined);
          }}
        />
      )}

      {isAddStudentOpen && (
        <AddStudentModal
          onClose={() => setIsAddStudentOpen(false)}
          onSuccess={() => handleNavigateTab('students')}
        />
      )}

      {detailStudentId && (
        <StudentDetailModal
          studentId={detailStudentId}
          onClose={() => setDetailStudentId(null)}
          onOpenReportCard={handleOpenReportCard}
          onOpenPaymentModal={handleOpenPaymentModal}
        />
      )}

      {is2FAModalOpen && (
        <TwoFactorAuthModal
          targetEmail={twoFactorTargetEmail}
          onClose={() => setIs2FAModalOpen(false)}
          onSuccess={handle2FASuccess}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainContent />
    </SchoolProvider>
  );
}
