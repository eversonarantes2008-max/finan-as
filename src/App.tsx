import React, { useState, useEffect } from 'react';
import { User } from './types';
import {
  initializeStorage,
  getCurrentUserSession,
  setCurrentUserSession,
} from './utils/storage';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { AccountsList } from './components/AccountsList';
import { AdminPanel } from './components/AdminPanel';
import { PixModal } from './components/PixModal';
import { OfflineBanner } from './components/OfflineBanner';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Initialize master user in storage if missing
    initializeStorage();

    // 2. Restore active session
    const savedSession = getCurrentUserSession();
    if (savedSession) {
      setCurrentUser(savedSession);
    }

    // 3. Listen for PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentUserSession(user);
    setIsAdminView(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserSession(null);
    setIsAdminView(false);
  };

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted PWA installation');
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Offline Status Bar */}
      <OfflineBanner />

      {/* PWA Automatic Update Banner Notification */}
      <UpdatePrompt />

      {/* Main App Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminView(!isAdminView)}
        isAdminActive={isAdminView}
        onOpenPix={() => setIsPixModalOpen(true)}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main View Area */}
      <main className="flex-1 p-3 sm:p-6">
        {!currentUser ? (
          /* Authentication Screen */
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onOpenPixModal={() => setIsPixModalOpen(true)}
          />
        ) : isAdminView && currentUser.role === 'master' ? (
          /* Master Admin Panel */
          <AdminPanel onBackToApp={() => setIsAdminView(false)} />
        ) : (
          /* Main Accounts Management View */
          <AccountsList currentUser={currentUser} />
        )}
      </main>

      {/* PIX Payment Modal */}
      <PixModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        onProceedToRegister={() => setIsPixModalOpen(false)}
      />

      {/* PWA Install Banner */}
      <InstallPrompt
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallPwa}
      />
    </div>
  );
}
