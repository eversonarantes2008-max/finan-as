import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, ShieldAlert, Wallet, Download, RefreshCw, Check } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  isAdminActive?: boolean;
  onOpenPix?: () => void;
  deferredPrompt?: any;
  onInstallPwa?: () => void;
  onCheckUpdates?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenAdmin,
  isAdminActive = false,
  onOpenPix,
  deferredPrompt,
  onInstallPwa,
  onCheckUpdates,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkFeedback, setCheckFeedback] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setCheckFeedback('Verificando...');

    if (onCheckUpdates) {
      onCheckUpdates();
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
        }
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => {
      setIsChecking(false);
      setCheckFeedback('Atualizado!');
      setTimeout(() => setCheckFeedback(null), 2500);
    }, 1200);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none flex items-center gap-2">
              Finanças Mensais
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Relatório de Finanças</p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Check Updates Button */}
          <button
            onClick={handleCheckUpdate}
            disabled={isChecking}
            className="p-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Verificar atualizações do PWA"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{checkFeedback || 'Atualizações'}</span>
          </button>

          {/* PWA Install Button */}
          {deferredPrompt && onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
              title="Instalar App na tela inicial"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar PWA</span>
            </button>
          )}

          {/* PIX Key Info Button */}
          {onOpenPix && (
            <button
              onClick={onOpenPix}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-xs font-medium text-emerald-400 flex items-center gap-1 transition-colors"
              title="Ver Chave PIX R$ 4,80"
            >
              <span className="font-semibold">PIX</span> R$ 4,80
            </button>
          )}

          {/* Master Admin Panel Toggle */}
          {currentUser?.role === 'master' && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAdminActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>
          )}

          {/* Current User Info & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                  {currentUser.email}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {currentUser.role === 'master' ? 'Administrador Master' : 'Usuário Aprovado'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
