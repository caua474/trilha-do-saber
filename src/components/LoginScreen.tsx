import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Crown,
  GraduationCap,
  RefreshCw,
  MailCheck,
  ArrowLeft,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { AuthUser } from '../types';
import {
  signUpUser,
  signInUser,
  verifyEmailCode,
  resendVerificationEmail,
} from '../services/authService';
import { TermsAndPrivacyModal, LegalTab } from './TermsAndPrivacyModal';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
  onOpenProModal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onOpenProModal }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<LegalTab | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('termos') || hash.includes('termos') || hash.includes('terms')) return 'terms';
      if (path.includes('privacidade') || hash.includes('privacidade') || hash.includes('privacy')) return 'privacy';
    }
    return null;
  });

  React.useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('termos') || hash.includes('termos') || hash.includes('terms')) {
        setShowLegalModal('terms');
      } else if (path.includes('privacidade') || hash.includes('privacidade') || hash.includes('privacy')) {
        setShowLegalModal('privacy');
      }
    };
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Estado de Confirmação de E-mail Obrigatória
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. Validação de envio com campos vazios (aviso claro: "Preencha todos os campos")
    if (tab === 'register' && (!cleanName || !cleanEmail || !password)) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    if (tab === 'login' && (!cleanEmail || !password)) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }

    // 2. Validação rigorosa de formato de e-mail (aviso claro: "E-mail inválido")
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('E-mail inválido. Por favor, utilize o formato: exemplo@dominio.com.');
      return;
    }

    // 3. Validação individual de tamanho
    if (tab === 'register' && cleanName.length < 2) {
      setErrorMsg('O nome precisa ter pelo menos 2 caracteres.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (tab === 'register') {
        // FLUXO DE CADASTRO REAL:
        // Dispara e-mail de verificação e NUNCA loga o usuário automaticamente no localStorage
        const res = await signUpUser({
          name: cleanName,
          email: cleanEmail,
          password,
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Não foi possível cadastrar. Verifique os dados informados.');
          setIsSubmitting(false);
          return;
        }

        // Abre a tela explícita de "Confirme o seu e-mail para continuar"
        setPendingVerificationEmail(cleanEmail);
        setInfoMsg(
          'E-mail de confirmação enviado com sucesso! Verifique sua caixa de entrada e spam para ativar sua conta.'
        );
        setIsSubmitting(false);
      } else {
        // FLUXO DE LOGIN REAL:
        const res = await signInUser({
          email: cleanEmail,
          password,
        });

        if (!res.success) {
          if (res.requiresEmailVerification) {
            setPendingVerificationEmail(cleanEmail);
            setErrorMsg('Confirme o seu e-mail para continuar. Sua conta ainda não foi ativada.');
          } else {
            setErrorMsg(res.error || 'E-mail ou senha incorretos.');
          }
          setIsSubmitting(false);
          return;
        }

        if (res.user) {
          try {
            localStorage.setItem('gabaritai_auth_user', JSON.stringify(res.user));
          } catch {
            // Falha silenciosa defensiva
          }
          onLogin(res.user);
        }
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado na autenticação.');
      setIsSubmitting(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingVerificationEmail) return;
    if (!pinCode.trim() || pinCode.trim().length < 4) {
      setErrorMsg('Digite o código numérico recebido no seu e-mail.');
      return;
    }

    setIsVerifyingPin(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await verifyEmailCode(pendingVerificationEmail, pinCode.trim());
      if (res.success && res.user) {
        setInfoMsg('E-mail confirmado com sucesso! Entrando...');
        try {
          localStorage.setItem('gabaritai_auth_user', JSON.stringify(res.user));
        } catch {
          // Falha silenciosa defensiva
        }
        setTimeout(() => {
          onLogin(res.user!);
        }, 800);
      } else {
        setErrorMsg(res.error || 'Código de confirmação incorreto ou expirado.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao confirmar código.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleResendEmail = async () => {
    if (!pendingVerificationEmail) return;
    setIsResending(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await resendVerificationEmail(pendingVerificationEmail);
      setInfoMsg(res.message || 'Novo e-mail de confirmação enviado!');
    } catch (err: any) {
      setErrorMsg('Erro ao reenviar e-mail de confirmação.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const googleUser: AuthUser = {
        id: `google-${Date.now()}`,
        name: 'Aluno Google',
        email: 'aluno.enem@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        isGuest: false,
        isPro: false,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('gabaritai_auth_user', JSON.stringify(googleUser));
      } catch {
        // Falha silenciosa defensiva
      }
      onLogin(googleUser);
      setIsSubmitting(false);
    }, 400);
  };

  const handleGuestLogin = () => {
    const guestUser: AuthUser = {
      id: `guest-${Date.now()}`,
      name: 'Visitante ENEM',
      email: 'visitante@menteup.app',
      provider: 'guest',
      isGuest: true,
      isPro: false,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('gabaritai_auth_user', JSON.stringify(guestUser));
    } catch {
      // Falha silenciosa defensiva
    }
    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10 space-y-4 my-8"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 shadow-xl shadow-indigo-600/25 mb-1 ring-1 ring-white/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MenteUp
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30 text-purple-300">
              IA Oficial ENEM
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Sua aprovação no ENEM e vestibulares acelerada com tutoria inteligente em tempo real
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* TELA DE CONFIRMAÇÃO DE E-MAIL (QUANDO PENDENTE) */}
          {pendingVerificationEmail ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <MailCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Confirme o seu e-mail para continuar
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enviamos uma mensagem de ativação para{' '}
                  <strong className="text-amber-300 font-bold underline">
                    {pendingVerificationEmail}
                  </strong>
                  . Por favor, acesse o link enviado ou informe o código PIN para ativar sua conta.
                </p>
              </div>

              {/* Informative message */}
              <AnimatePresence>
                {infoMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{infoMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                  >
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form de Confirmação com Código PIN */}
              <form onSubmit={handleVerifyPin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Código PIN de Ativação (6 dígitos)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 123456"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-center tracking-widest text-base font-black text-amber-300 placeholder-slate-600 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingPin}
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isVerifyingPin ? 'Verificando...' : 'Confirmar e Ativar Minha Conta'}</span>
                </button>
              </form>

              {/* Ações Auxiliares: Reenviar e Voltar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Reenviar E-mail</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPendingVerificationEmail(null);
                    setErrorMsg('');
                    setInfoMsg('');
                    setTab('login');
                  }}
                  className="text-slate-400 hover:text-white font-medium flex items-center gap-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Login</span>
                </button>
              </div>
            </div>
          ) : (
            /* TELA PADRÃO DE LOGIN OU CADASTRO */
            <>
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'login'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Entrar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'register'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Criar Conta</span>
                </button>
              </div>

              {/* Informative Notice */}
              <AnimatePresence>
                {infoMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{infoMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-md shadow-rose-950/40"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Social Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98] mb-4 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="w-full border-t border-slate-800" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-semibold uppercase tracking-wider absolute">
                  ou continue com e-mail
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
                {tab === 'register' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="Seu nome ou apelido de estudos"
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden transition-all ${
                          hasAttemptedSubmit && tab === 'register' && (!name.trim() || name.trim().length < 2)
                            ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 bg-rose-500/5'
                            : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                    {hasAttemptedSubmit && tab === 'register' && !name.trim() && (
                      <span className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" /> Preencha o seu nome completo
                      </span>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="exemplo@gmail.com"
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden transition-all ${
                        hasAttemptedSubmit && (!email.trim() || !EMAIL_REGEX.test(email.trim().toLowerCase()))
                          ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 bg-rose-500/5'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                  </div>
                  {hasAttemptedSubmit && !email.trim() && (
                    <span className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Preencha o seu e-mail
                    </span>
                  )}
                  {hasAttemptedSubmit && email.trim() && !EMAIL_REGEX.test(email.trim().toLowerCase()) && (
                    <span className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> E-mail inválido (ex: seu.nome@email.com)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden transition-all ${
                        hasAttemptedSubmit && (!password || password.length < 6)
                          ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50 bg-rose-500/5'
                          : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {hasAttemptedSubmit && !password && (
                    <span className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> Preencha a sua senha
                    </span>
                  )}
                  {hasAttemptedSubmit && password && password.length < 6 && (
                    <span className="text-[11px] text-rose-400 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> A senha precisa ter no mínimo 6 caracteres
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] mt-2 disabled:opacity-50 ${
                    tab === 'login'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/20'
                      : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-600/20'
                  }`}
                >
                  <span>
                    {isSubmitting
                      ? 'Processando...'
                      : tab === 'login'
                      ? 'Entrar no MenteUp'
                      : 'Criar Minha Conta e Enviar Confirmação'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Visitor Mode Button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Continuar como Visitante / Testar Grátis</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Promo Banner: MenteUp Pro (Acesso Vitalício R$ 5,00) */}
        <button
          type="button"
          onClick={() => onOpenProModal?.()}
          className="w-full text-left rounded-2xl p-4 bg-gradient-to-r from-amber-500/15 via-purple-950/60 to-indigo-950/60 border border-amber-400/40 shadow-lg relative overflow-hidden cursor-pointer hover:border-amber-300 transition-all group active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Crown className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-white">MenteUp Pro R$ 5,00 (Acesso Vitalício)</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-xs">
                    Compra Única
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Correções de Redação ilimitadas, Simulados TRI completos e tutoria 24h com a Professora Gabi.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Acesso Seguro
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Padrão INEP / ENEM
          </span>
          <span>•</span>
          <span>Pagamento único, sem mensalidade</span>
        </div>

        {/* Links Termos de Uso e Política de Privacidade */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-900/80">
          <a
            href="#/termos-de-uso"
            onClick={(e) => {
              e.preventDefault();
              setShowLegalModal('terms');
            }}
            className="hover:text-indigo-400 transition-colors underline cursor-pointer"
          >
            Termos de Uso
          </a>
          <span>•</span>
          <a
            href="#/politica-de-privacidade"
            onClick={(e) => {
              e.preventDefault();
              setShowLegalModal('privacy');
            }}
            className="hover:text-emerald-400 transition-colors underline cursor-pointer"
          >
            Política de Privacidade
          </a>
        </div>
      </motion.div>

      {/* Modal de Termos de Uso e Política de Privacidade */}
      {showLegalModal && (
        <TermsAndPrivacyModal
          initialTab={showLegalModal}
          onClose={() => {
            setShowLegalModal(null);
            if (typeof window !== 'undefined') {
              if (window.location.hash) {
                window.history.replaceState(null, '', window.location.pathname);
              }
              if (window.location.pathname === '/termos-de-uso' || window.location.pathname === '/politica-de-privacidade') {
                window.history.replaceState(null, '', '/');
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default LoginScreen;
