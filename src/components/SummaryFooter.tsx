import React from 'react';
import { formatBRL } from '../utils/currency';
import { Calculator, AlertCircle, CheckCircle2, PieChart } from 'lucide-react';

interface SummaryFooterProps {
  totalGeneral: number; // Total Geral
  totalRemaining: number; // Restante a Pagar
  totalPaid: number; // Total Pago
}

export const SummaryFooter: React.FC<SummaryFooterProps> = ({
  totalGeneral,
  totalRemaining,
  totalPaid,
}) => {
  const percentagePaid = totalGeneral > 0 ? Math.round((totalPaid / totalGeneral) * 100) : 0;

  return (
    <div className="sticky bottom-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 shadow-2xl">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5 text-sky-400" /> Progresso de Pagamentos
            </span>
            <span className="text-emerald-400 font-mono font-bold">{percentagePaid}% Concluído</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentagePaid}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Total Geral */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5 text-sky-400" /> Total Geral
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              {formatBRL(totalGeneral)}
            </div>
          </div>

          {/* Restante a Pagar */}
          <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-3 flex flex-col justify-between shadow-lg shadow-rose-950/20">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Restante a Pagar
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-rose-300 mt-1">
              {formatBRL(totalRemaining)}
            </div>
          </div>

          {/* Total Pago */}
          <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Total Pago
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300 mt-1">
              {formatBRL(totalPaid)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
