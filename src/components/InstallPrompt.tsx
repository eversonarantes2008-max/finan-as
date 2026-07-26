import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface InstallPromptProps {
  deferredPrompt: any;
  onInstall: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ deferredPrompt, onInstall }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-40 bg-slate-900 border border-sky-500/40 rounded-2xl p-4 shadow-2xl animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Instalar Aplicativo PWA</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Adicione à tela inicial do seu dispositivo para usar como app nativo.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onInstall}
          className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Instalar na Tela Inicial
        </button>
      </div>
    </div>
  );
};
