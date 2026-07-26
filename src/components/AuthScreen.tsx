import React, { useState } from 'react';
import { User } from '../types';
import { getUsers, saveUsers, MASTER_CREDENTIALS } from '../utils/storage';
import { QrCode, Lock, Mail, UserPlus, LogIn, AlertCircle, CheckCircle2, ShieldCheck, DollarSign, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
  onOpenPixModal: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onOpenPixModal }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingMsg, setPendingMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPendingMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const users = getUsers();

      // Check master login match
      if (
        cleanEmail === MASTER_CREDENTIALS.email.toLowerCase() &&
        password === MASTER_CREDENTIALS.password
      ) {
        let masterUser = users.find((u) => u.email.toLowerCase() === MASTER_CREDENTIALS.email.toLowerCase());
        if (!masterUser) {
          masterUser = {
            id: 'master-001',
            email: MASTER_CREDENTIALS.email,
            passwordHash: MASTER_CREDENTIALS.password,
            status: 'approved',
            role: 'master',
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
          };
          users.push(masterUser);
          saveUsers(users);
        }
        setIsLoading(false);
        onLoginSuccess(masterUser);
        return;
      }

      // Check standard user
      const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

      if (!foundUser) {
        setIsLoading(false);
        setErrorMsg('E-mail ou senha incorretos. Caso não tenha conta, faça seu cadastro.');
        return;
      }

      if (foundUser.passwordHash !== password) {
        setIsLoading(false);
        setErrorMsg('E-mail ou senha incorretos.');
        return;
      }

      if (foundUser.status === 'pending') {
        setIsLoading(false);
        setPendingMsg(
          'Sua conta está em análise! O Administrador precisa aprovar o seu acesso após o pagamento do PIX de R$ 4,80.'
        );
        return;
      }

      if (foundUser.status === 'denied') {
        setIsLoading(false);
        setErrorMsg('Acesso negado pelo Administrador. Entre em contato com o suporte.');
        return;
      }

      // User approved
      setIsLoading(false);
      onLoginSuccess(foundUser);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPendingMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Preencha o e-mail e a senha desejada.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('A senha deve conter no mínimo 4 caracteres.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const users = getUsers();

      // If user tries registering master email
      if (cleanEmail === MASTER_CREDENTIALS.email.toLowerCase()) {
        setIsLoading(false);
        setErrorMsg('Este e-mail é reservado para o Administrador Master. Faça login diretamente.');
        return;
      }

      const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        setIsLoading(false);
        setErrorMsg('Este e-mail já está cadastrado no sistema.');
        return;
      }

      const newUser: User = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        passwordHash: password,
        status: 'pending',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveUsers(users);

      setIsLoading(false);
      setSuccessMsg(
        'Cadastro realizado com sucesso! Sua solicitação foi enviada para o Administrador. Realize o PIX de R$ 4,80 e aguarde a aprovação.'
      );
      setEmail('');
      setPassword('');
      setActiveTab('login');
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Hero Card PIX Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl text-center space-y-3 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" /> Pagamento Único: R$ 4,80
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Acesse seu Gerenciador de Contas
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Organize água, luz, telefone, internet e contas personalizadas. Funciona 100% offline no celular e computador.
          </p>

          <button
            onClick={onOpenPixModal}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <QrCode className="w-4 h-4" />
            Ver Chave PIX e QR Code (R$ 4,80)
          </button>
        </div>

        {/* Tab Switcher & Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setPendingMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setPendingMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {pendingMsg && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                Conta Pendente de Aprovação
              </div>
              <p>{pendingMsg}</p>
              <button
                onClick={onOpenPixModal}
                className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                Copiar PIX novamente (R$ 4,80)
              </button>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login / Register Form */}
          <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> E-mail
              </label>
              <input
                type="email"
                required
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Verificando...</span>
              ) : activeTab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Entrar no Aplicativo
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Solicitar Acesso com PIX
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="pt-2 border-t border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-400">
              {activeTab === 'login'
                ? 'Novos usuários realizam o cadastro com envio do PIX R$ 4,80.'
                : 'Após o cadastro, o Administrador autoriza seu acesso instantaneamente.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
