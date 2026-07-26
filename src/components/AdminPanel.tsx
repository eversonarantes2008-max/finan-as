import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import { ShieldCheck, UserCheck, UserX, Clock, Trash2, ArrowLeft, Users, DollarSign, RefreshCw, Check, X } from 'lucide-react';

interface AdminPanelProps {
  onBackToApp: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadUsersList = () => {
    const list = getUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'approved' as const,
          approvedAt: new Date().toISOString(),
        };
      }
      return u;
    });
    saveUsers(updated);
    setUsers(updated);
    showToast('Usuário APROVADO com sucesso!');
  };

  const handleDeny = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'denied' as const,
        };
      }
      return u;
    });
    saveUsers(updated);
    setUsers(updated);
    showToast('Acesso NEGADO para o usuário.');
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir permanentemente este usuário?')) return;
    const updated = users.filter((u) => u.id !== userId);
    saveUsers(updated);
    setUsers(updated);
    showToast('Usuário removido do sistema.');
  };

  // Metrics
  const pendingUsers = users.filter((u) => u.status === 'pending' && u.role !== 'master');
  const approvedUsers = users.filter((u) => u.status === 'approved' && u.role !== 'master');
  const deniedUsers = users.filter((u) => u.status === 'denied' && u.role !== 'master');
  const totalRevenue = approvedUsers.length * 4.8;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar às Contas
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Painel Administrativo Master
              <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Mestre
              </span>
            </h2>
            <p className="text-xs text-slate-400">Aprovação de cadastros e gestão de licenças PIX</p>
          </div>
        </div>

        <button
          onClick={loadUsersList}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold shadow-lg animate-bounce">
          {notification}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Aguardando PIX</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingUsers.length}</div>
          <p className="text-[10px] text-slate-500">Pendentes de aprovação</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Aprovados</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{approvedUsers.length}</div>
          <p className="text-[10px] text-slate-500">Usuários com acesso ativo</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Acessos Negados</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{deniedUsers.length}</div>
          <p className="text-[10px] text-slate-500">Solicitações recusadas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Receita Licenças</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
          </div>
          <p className="text-[10px] text-slate-500">Estimativa ({approvedUsers.length} × R$ 4,80)</p>
        </div>
      </div>

      {/* PENDING USERS SECTION (HIGH PRIORITY) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Solicitações de Cadastro Aguardando Aprovação ({pendingUsers.length})</h3>
          </div>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
            Requer Ação
          </span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhum usuário aguardando aprovação no momento.
          </div>
        ) : (
          <div className="space-y-2">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    {user.email}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cadastrado em: {new Date(user.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="flex-1 sm:flex-none py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                  >
                    <Check className="w-4 h-4" /> Aprovar PIX
                  </button>
                  <button
                    onClick={() => handleDeny(user.id)}
                    className="flex-1 sm:flex-none py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" /> Negar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALL USERS LIST SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Todos os Usuários Registrados</h3>
          </div>

          <input
            type="text"
            placeholder="Buscar e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-64"
          />
        </div>

        <div className="space-y-2">
          {filteredUsers.map((u) => {
            const isMaster = u.role === 'master';
            return (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    {u.email}
                    {isMaster && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                        ADMIN MASTER
                      </span>
                    )}
                    {!isMaster && u.status === 'approved' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                        APROVADO
                      </span>
                    )}
                    {!isMaster && u.status === 'pending' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                        PENDENTE
                      </span>
                    )}
                    {!isMaster && u.status === 'denied' && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-semibold">
                        NEGADO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Criado em: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {!isMaster && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {u.status !== 'approved' ? (
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Aprovar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeny(u.id)}
                        className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" /> Revogar Acesso
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
