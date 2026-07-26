import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, QrCode, ShieldCheck, Smartphone, DollarSign, X } from 'lucide-react';
import { generatePixPayload, PIX_CONFIG } from '../utils/pix';

interface PixModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onProceedToRegister?: () => void;
  title?: string;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  onProceedToRegister,
  title = 'Pagamento PIX da Licença - R$ 4,80',
}) => {
  const [copied, setCopied] = useState(false);
  const pixPayload = generatePixPayload(
    PIX_CONFIG.pixKey,
    PIX_CONFIG.price,
    PIX_CONFIG.receiverName,
    'BRASILIA'
  );

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400">Acesso vitalício ao aplicativo PWA</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Price Tag */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-xl p-4 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Valor Único da Licença</span>
            <div className="text-3xl font-bold text-emerald-300 my-1">
              R$ 4,80
            </div>
            <p className="text-xs text-slate-400">
              Chave PIX: <span className="font-mono text-slate-200 font-semibold">{PIX_CONFIG.pixKey}</span> ({PIX_CONFIG.receiverName})
            </p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-inner border border-slate-200">
            <QRCodeSVG
              value={pixPayload}
              size={180}
              level="M"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
            <p className="text-xs text-slate-600 mt-2 font-medium flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Escaneie o QR Code no app do seu banco
            </p>
          </div>

          {/* Copia e Cola Button */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Código PIX Copia e Cola</span>
              {copied && <span className="text-emerald-400 text-xs font-bold">Copiado para a área de transferência!</span>}
            </label>
            <div className="relative">
              <textarea
                readOnly
                value={pixPayload}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none resize-none selection:bg-emerald-500 selection:text-slate-950"
              />
            </div>
            <button
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Código PIX Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar Código PIX (Copia e Cola)
                </>
              )}
            </button>
          </div>

          {/* Step-by-step guidance */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Como ativar sua conta em 3 passos:
            </h4>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside pl-1">
              <li>Copie o código PIX acima ou escaneie com o app do seu banco.</li>
              <li>Confirme o valor de <strong className="text-slate-200">R$ 4,80</strong> para <strong className="text-slate-200">{PIX_CONFIG.receiverName}</strong>.</li>
              <li>Clique no botão abaixo para criar seu cadastro (E-mail e Senha). O acesso é liberado após a aprovação.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {onProceedToRegister && (
            <button
              onClick={onProceedToRegister}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Já fiz o PIX / Ir para Cadastro
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
