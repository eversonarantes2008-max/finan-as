import React from 'react';
import { User, AccountItem } from '../types';
import { formatMonthName, getUserAccountsForMonth } from '../utils/storage';
import { formatBRL } from '../utils/currency';
import { generateSingleMonthPDF, generateConsolidatedHistoryPDF } from '../utils/pdf';
import { X, FileText, Download, Calendar, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface HistoryModalProps {
  currentUser: User;
  availableMonths: string[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  currentUser,
  availableMonths,
  selectedMonth,
  onSelectMonth,
  onClose,
}) => {
  const handleDownloadSingleMonth = (mKey: string) => {
    const accs = getUserAccountsForMonth(currentUser.id, mKey);
    generateSingleMonthPDF(mKey, accs, 'all', currentUser.email);
  };

  const handleDownloadConsolidated = () => {
    generateConsolidatedHistoryPDF(
      currentUser.id,
      currentUser.email,
      getUserAccountsForMonth,
      availableMonths
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Histórico de Meses & PDFs
              </h3>
              <p className="text-xs text-slate-400">
                Seus dados de meses anteriores ficam salvos e prontos para download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header Banner */}
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Existem <strong>{availableMonths.length}</strong> meses gravados no seu histórico.</span>
          </div>

          <button
            onClick={handleDownloadConsolidated}
            className="w-full sm:w-auto py-2 px-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" /> PDF Consolidado (Todos)
          </button>
        </div>

        {/* Scrollable Month List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {availableMonths.map((mKey) => {
            const accs = getUserAccountsForMonth(currentUser.id, mKey);
            const totalGeral = accs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const totalPago = accs.filter((a) => a.isPaid).reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const totalRestante = totalGeral - totalPago;
            const percentagePaid = totalGeral > 0 ? Math.round((totalPago / totalGeral) * 100) : 0;
            const isCurrent = mKey === selectedMonth;

            return (
              <div
                key={mKey}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-slate-800/80 border-sky-500/50 shadow-lg shadow-sky-500/5'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Month Name & Status Badge */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {formatMonthName(mKey)}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                          Mês Atual Selecionado
                        </span>
                      )}
                    </div>

                    {/* Financial Stats */}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                      <span>Total: <strong className="text-white">{formatBRL(totalGeral)}</strong></span>
                      <span className="text-emerald-400">Pago: <strong>{formatBRL(totalPago)}</strong></span>
                      <span className="text-rose-400">Restante: <strong>{formatBRL(totalRestante)}</strong></span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full sm:w-64 bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, percentagePaid))}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions for this Month */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleDownloadSingleMonth(mKey)}
                      className="py-1.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={`Baixar PDF de ${formatMonthName(mKey)}`}
                    >
                      <Download className="w-3.5 h-3.5 text-rose-400" /> Baixar PDF
                    </button>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSelectMonth(mKey);
                          onClose();
                        }}
                        className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Abrir Mês <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ao mudar o mês, o histórico é armazenado automaticamente.</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
