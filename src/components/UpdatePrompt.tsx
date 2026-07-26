import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const UpdatePrompt: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [checkStatusMsg, setCheckStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const handleControllerChange = () => {
      // Reload page automatically when new service worker takes over
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      registration = reg;

      // Check if there is already a waiting worker
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShowUpdateBanner(true);
      }

      // Listen for new service worker being installed
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowUpdateBanner(true);
          }
        });
      });
    });

    // Check for updates periodically when user switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && registration) {
        registration.update().catch((err) => console.log('Checking update error:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleApplyUpdate = () => {
    if (!waitingWorker) {
      window.location.reload();
      return;
    }
    setIsUpdating(true);
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  const handleManualCheckUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;
    setCheckStatusMsg('Verificando atualizações...');

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowUpdateBanner(true);
          setCheckStatusMsg('Nova versão encontrada!');
        } else {
          setCheckStatusMsg('Seu aplicativo já está atualizado!');
        }
      } else {
        setCheckStatusMsg('Service Worker não registrado.');
      }
    } catch (err) {
      setCheckStatusMsg('Erro ao verificar atualização.');
    }

    setTimeout(() => {
      setCheckStatusMsg(null);
    }, 4000);
  };

  if (!showUpdateBanner) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-amber-500/10 text-slate-100 animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Nova Atualização Disponível!
            </h4>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Uma versão mais recente do <strong>Relatório de Finanças Mensais</strong> está pronta com melhorias e correções.
          </p>

          <div className="flex items-center gap-2 mt-3.5">
            <button
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Atualizando...' : 'Atualizar Agora'}
            </button>

            <button
              onClick={() => setShowUpdateBanner(false)}
              className="py-2 px-3 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Lembrar mais tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
