import React, { useState, useEffect } from 'react';
import { User, AccountItem } from '../types';
import {
  getUserAccountsForMonth,
  saveUserAccountsForMonth,
  resetPaidStatusForMonth,
  getAvailableMonthsForUser,
  getCurrentMonthKey,
  formatMonthName,
} from '../utils/storage';
import { AccountRow } from './AccountRow';
import { SummaryFooter } from './SummaryFooter';
import { HistoryModal } from './HistoryModal';
import { generateSingleMonthPDF } from '../utils/pdf';
import { formatBRL } from '../utils/currency';
import { Plus, Calendar, RotateCcw, Share2, Search, Filter, CheckCircle, AlertCircle, FileText, Check, Clock, Download, History } from 'lucide-react';

interface AccountsListProps {
  currentUser: User;
}

export const AccountsList: React.FC<AccountsListProps> = ({ currentUser }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  
  // Due Day Tab (day5 vs day20 vs all)
  const [activeDueDayTab, setActiveDueDayTab] = useState<'day5' | 'day20' | 'all'>('day5');

  // Custom account form modal
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAmount, setNewAccountAmount] = useState('');
  const [newAccountDueDay, setNewAccountDueDay] = useState<5 | 20>(5);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  
  // History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Feedback toast
  const [copiedToast, setCopiedToast] = useState(false);

  // Load accounts for selected month
  const loadAccounts = (monthKey: string) => {
    const list = getUserAccountsForMonth(currentUser.id, monthKey);
    setAccounts(list);
  };

  useEffect(() => {
    const months = getAvailableMonthsForUser(currentUser.id);
    setAvailableMonths(months);
    loadAccounts(selectedMonth);
  }, [currentUser.id, selectedMonth]);

  // Handlers
  const handleUpdateAmount = (id: string, newAmount: number) => {
    const updated = accounts.map((item) =>
      item.id === id ? { ...item, amount: newAmount } : item
    );
    setAccounts(updated);
    saveUserAccountsForMonth(currentUser.id, selectedMonth, updated);
  };

  const handleUpdateName = (id: string, newName: string) => {
    const updated = accounts.map((item) =>
      item.id === id ? { ...item, name: newName } : item
    );
    setAccounts(updated);
    saveUserAccountsForMonth(currentUser.id, selectedMonth, updated);
  };

  const handleTogglePaid = (id: string) => {
    const updated = accounts.map((item) =>
      item.id === id ? { ...item, isPaid: !item.isPaid } : item
    );
    setAccounts(updated);
    saveUserAccountsForMonth(currentUser.id, selectedMonth, updated);
  };

  const handleToggleDueDay = (id: string) => {
    const updated = accounts.map((item) =>
      item.id === id ? { ...item, dueDay: (item.dueDay === 5 ? 20 : 5) as 5 | 20 } : item
    );
    setAccounts(updated);
    saveUserAccountsForMonth(currentUser.id, selectedMonth, updated);
  };

  const handleDeleteCustomAccount = (id: string) => {
    if (!confirm('Deseja excluir esta conta personalizada?')) return;
    const updated = accounts.filter((item) => item.id !== id);
    setAccounts(updated);
    saveUserAccountsForMonth(currentUser.id, selectedMonth, updated);
  };

  const handleOpenAddModal = () => {
    setNewAccountDueDay(activeDueDayTab === 'day20' ? 20 : 5);
    setIsAddingCustom(true);
  };

  const handleAddCustomAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    const parsedAmt = parseFloat(newAccountAmount.replace(',', '.')) || 0;
    const newCustomItem: AccountItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newAccountName.trim(),
      amount: parsedAmt,
      isPaid: false,
      isDefault: false,
      dueDay: newAccountDueDay,
      createdAt: new Date().toISOString(),
    };

    const updated = [...accounts, newCustomItem];
    setAccounts(updated);
    saveUserAccountsForMonth(currentUser.id, selectedMonth, updated);

    setNewAccountName('');
    setNewAccountAmount('');
    setIsAddingCustom(false);
  };

  const handleResetMonthPayments = () => {
    if (!confirm('Deseja desmarcar todas as contas como "A PAGAR" para este mês?')) return;
    const resetList = resetPaidStatusForMonth(currentUser.id, selectedMonth);
    setAccounts(resetList);
  };

  // Due Day Tab filtering
  const dueDayAccounts = accounts.filter((item) => {
    if (activeDueDayTab === 'day5') return item.dueDay === 5;
    if (activeDueDayTab === 'day20') return item.dueDay === 20;
    return true;
  });

  // Search & Status filtering on tab accounts
  const filteredAccounts = dueDayAccounts.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'paid') return matchesSearch && item.isPaid;
    if (statusFilter === 'pending') return matchesSearch && !item.isPaid;
    return matchesSearch;
  });

  // Tab specific calculations
  const totalGeneral = dueDayAccounts.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalPaid = dueDayAccounts
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalRemaining = totalGeneral - totalPaid;

  const handleCopyMonthReport = () => {
    const targetAccounts = dueDayAccounts;
    const totalGeral = targetAccounts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalPago = targetAccounts
      .filter((a) => a.isPaid)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalRestante = totalGeral - totalPago;

    const tabTitle =
      activeDueDayTab === 'day5'
        ? 'Contas 5º Dia Útil'
        : activeDueDayTab === 'day20'
        ? 'Contas do Dia 20'
        : 'Todas as Contas';

    let text = `📋 *Resumo de ${tabTitle} - ${formatMonthName(selectedMonth)}*\n\n`;
    text += `💰 *Total Geral:* ${formatBRL(totalGeral)}\n`;
    text += `✅ *Total Pago:* ${formatBRL(totalPago)}\n`;
    text += `⚠️ *Restante a Pagar:* ${formatBRL(totalRestante)}\n\n`;
    text += `----------------------------------------\n`;

    targetAccounts.forEach((acc) => {
      const statusIcon = acc.isPaid ? '✅ PAGO' : '❌ A PAGAR';
      const dueText = acc.dueDay === 5 ? '5º Dia Útil' : `Dia ${acc.dueDay}`;
      text += `• *${acc.name} (${dueText}):* ${formatBRL(acc.amount)} (${statusIcon})\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleDownloadPDF = () => {
    generateSingleMonthPDF(selectedMonth, accounts, activeDueDayTab, currentUser.email);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20 animate-fade-in">
      {/* Due Day Screen Tabs (5º Dia Útil / Dia 20 / Todas) */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
        <button
          onClick={() => setActiveDueDayTab('day5')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeDueDayTab === 'day5'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="font-mono bg-slate-950/20 px-1.5 py-0.5 rounded text-xs font-black">5º</span>
          <span>Contas 5º Dia Útil</span>
          <span className="hidden sm:inline-block text-[10px] opacity-80 font-mono">
            ({accounts.filter((a) => a.dueDay === 5).length})
          </span>
        </button>

        <button
          onClick={() => setActiveDueDayTab('day20')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeDueDayTab === 'day20'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span className="font-mono bg-slate-950/20 px-1.5 py-0.5 rounded text-xs font-black">20</span>
          <span>Contas Dia 20</span>
          <span className="hidden sm:inline-block text-[10px] opacity-80 font-mono">
            ({accounts.filter((a) => a.dueDay === 20).length})
          </span>
        </button>

        <button
          onClick={() => setActiveDueDayTab('all')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeDueDayTab === 'all'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <span>Visão Geral</span>
          <span className="hidden sm:inline-block text-[10px] opacity-80 font-mono">
            ({accounts.length})
          </span>
        </button>
      </div>

      {/* Month Selector & Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Mês de Referência
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 block w-full"
              >
                {availableMonths.map((mKey) => (
                  <option key={mKey} value={mKey}>
                    {formatMonthName(mKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <button
              onClick={handleOpenAddModal}
              className="flex-1 sm:flex-none py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nova Conta
            </button>

            <button
              onClick={handleDownloadPDF}
              className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Baixar lista em PDF"
            >
              <Download className="w-4 h-4 text-rose-400" /> Baixar PDF
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Ver histórico de meses e PDFs"
            >
              <History className="w-4 h-4 text-sky-400" /> Histórico PDF
            </button>

            <button
              onClick={handleCopyMonthReport}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Copiar relatório para WhatsApp"
            >
              {copiedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copiado!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-sky-400" /> Copiar Resumo
                </>
              )}
            </button>

            <button
              onClick={handleResetMonthPayments}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 rounded-xl transition-colors"
              title="Zerar todos os pagamentos deste mês"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Procurar conta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas ({dueDayAccounts.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A Pagamento ({dueDayAccounts.filter((a) => !a.isPaid).length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pagas ({dueDayAccounts.filter((a) => a.isPaid).length})
            </button>
          </div>
        </div>
      </div>

      {/* Account Rows Table Header */}
      <div className="px-4 py-2 bg-slate-900/40 rounded-xl border border-slate-800/60 hidden sm:grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-400">
        <div className="col-span-5">Conta</div>
        <div className="col-span-4 text-center">Valor (R$)</div>
        <div className="col-span-3 text-right">Status do Pagamento</div>
      </div>

      {/* Accounts Rows Container */}
      <div className="space-y-2">
        {filteredAccounts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Nenhuma conta encontrada nesta tela.</p>
            <p className="text-xs text-slate-500">
              {activeDueDayTab === 'day5'
                ? 'Nenhuma conta programada para o 5º Dia Útil.'
                : activeDueDayTab === 'day20'
                ? 'Nenhuma conta programada para o Dia 20.'
                : 'Tente ajustar o termo de busca ou filtros.'}
            </p>
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onUpdateAmount={handleUpdateAmount}
              onUpdateName={handleUpdateName}
              onTogglePaid={handleTogglePaid}
              onToggleDueDay={handleToggleDueDay}
              onDeleteCustom={handleDeleteCustomAccount}
            />
          ))
        )}
      </div>

      {/* Add Custom Account Modal */}
      {isAddingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" /> Adicionar Conta Personalizada
            </h3>

            <form onSubmit={handleAddCustomAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartão de Crédito, Condomínio, Faculdade..."
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Valor Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newAccountAmount}
                  onChange={(e) => setNewAccountAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Vencimento da Conta</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setNewAccountDueDay(5)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      newAccountDueDay === 5
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Vencimento 5º Dia Útil
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccountDueDay(20)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      newAccountDueDay === 20
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Vencimento Dia 20
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-sky-600/20"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persistent Summary Footer */}
      <SummaryFooter
        totalGeneral={totalGeneral}
        totalRemaining={totalRemaining}
        totalPaid={totalPaid}
      />

      {/* History Modal */}
      {isHistoryOpen && (
        <HistoryModal
          currentUser={currentUser}
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          onSelectMonth={(mKey) => setSelectedMonth(mKey)}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};
