import React, { useState } from 'react';
import { AccountItem } from '../types';
import { formatBRL, parseBRLInput, formatRawDigitsToBRL } from '../utils/currency';
import { Check, AlertCircle, Trash2, Tag, DollarSign, Pencil } from 'lucide-react';

interface AccountRowProps {
  account: AccountItem;
  onUpdateAmount: (id: string, amount: number) => void;
  onUpdateName?: (id: string, name: string) => void;
  onTogglePaid: (id: string) => void;
  onToggleDueDay?: (id: string) => void;
  onDeleteCustom?: (id: string) => void;
}

export const AccountRow: React.FC<AccountRowProps> = ({
  account,
  onUpdateAmount,
  onUpdateName,
  onTogglePaid,
  onToggleDueDay,
  onDeleteCustom,
}) => {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(account.name);
  const [rawValue, setRawValue] = useState(
    account.amount ? formatRawDigitsToBRL(Math.round(account.amount * 100).toString()) : '0,00'
  );

  const handleAmountBlur = () => {
    setIsEditingAmount(false);
    const parsed = parseBRLInput(rawValue);
    onUpdateAmount(account.id, parsed);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRawDigitsToBRL(e.target.value);
    setRawValue(formatted);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (nameValue.trim() && nameValue.trim() !== account.name && onUpdateName) {
      onUpdateName(account.id, nameValue.trim());
    } else {
      setNameValue(account.name);
    }
  };

  return (
    <div
      className={`grid grid-cols-12 gap-2 sm:gap-4 items-center p-3 sm:p-4 rounded-xl border transition-all ${
        account.isPaid
          ? 'bg-slate-900/60 border-emerald-500/30 text-slate-200'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-white'
      }`}
    >
      {/* LADO ESQUERDO: Nome da conta e indicador de tipo */}
      <div className="col-span-5 sm:col-span-5 flex items-center gap-2 min-w-0">
        {!account.isDefault && onDeleteCustom && (
          <button
            onClick={() => onDeleteCustom(account.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            title="Excluir conta personalizada"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                autoFocus
                className="w-full bg-slate-950 border border-sky-500 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleNameSave}
                className="p-1 bg-sky-600 text-white rounded-lg hover:bg-sky-500 shrink-0"
                title="Salvar nome"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <span
                className={`text-sm font-bold truncate ${
                  account.isPaid ? 'line-through text-slate-400' : 'text-slate-100'
                }`}
              >
                {account.name}
              </span>
              {onUpdateName && (
                <button
                  type="button"
                  onClick={() => {
                    setNameValue(account.name);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-sky-400 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Editar nome da conta"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <button
              type="button"
              onClick={() => onToggleDueDay && onToggleDueDay(account.id)}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                account.dueDay === 5
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
              }`}
              title="Clique para mudar o vencimento (5º Dia Útil / Dia 20)"
            >
              {account.dueDay === 5 ? '5º Dia Útil' : 'Dia 20'}
            </button>

            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                account.isDefault
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              }`}
            >
              {account.isDefault ? 'Padrão' : 'Personalizada'}
            </span>
          </div>
        </div>
      </div>

      {/* CENTRO: Campo para digitar o valor (R$) */}
      <div className="col-span-4 sm:col-span-4 flex items-center justify-center">
        <div className="relative w-full max-w-[150px]">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
            R$
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={isEditingAmount ? rawValue : formatBRL(account.amount).replace('R$', '').trim()}
            onFocus={() => {
              setIsEditingAmount(true);
              setRawValue(
                account.amount
                  ? formatRawDigitsToBRL(Math.round(account.amount * 100).toString())
                  : '0,00'
              );
            }}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            placeholder="0,00"
            className={`w-full bg-slate-950 border rounded-xl pl-8 pr-2.5 py-2 text-xs sm:text-sm font-mono font-bold text-right transition-colors focus:outline-none focus:border-sky-500 ${
              account.isPaid
                ? 'border-slate-800 text-emerald-400/90'
                : 'border-slate-700 text-white'
            }`}
          />
        </div>
      </div>

      {/* LADO DIREITO: Indicador de Pagamento (PAGO / A PAGAR) */}
      <div className="col-span-3 sm:col-span-3 flex justify-end">
        <button
          onClick={() => onTogglePaid(account.id)}
          className={`w-full max-w-[120px] py-2 px-2 sm:px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
            account.isPaid
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30'
          }`}
          title={account.isPaid ? 'Clique para marcar como Não Pago' : 'Clique para marcar como Pago'}
        >
          {account.isPaid ? (
            <>
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="truncate">PAGO</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="truncate">A PAGAR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
