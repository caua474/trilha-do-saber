import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
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
  GraduationCap
} from 'lucide-react';
import { AuthUser } from '../types';

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
  const [successNotice, setSuccessNotice] = useState<{ title: string; desc: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg('A senha precisa ter pelo menos 4 caracteres.');
      return;
    }

    if (tab === 'register' && !name.trim()) {
      setErrorMsg('Por favor, preencha o seu nome completo.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const derivedName = tab === 'register' ? name.trim() : email.split('@')[0];
      const capitalizedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const authenticatedUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: capitalizedName || 'Estudante ENEM',
        email: email.trim().toLowerCase(),
        provider: 'email',
        isGuest: false,
        isPro: false,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('gabaritai_auth_user', JSON.stringify(authenticatedUser));
      } catch (err) {
        console.error('Erro ao gravar sessão:', err);
      }

      if (tab === 'register') {
        // Envio de verificação de e-mail e aviso claro na tela
        setSuccessNotice({
          title: 'Cadastro realizado com sucesso!',
          desc: `Enviamos um e-mail de confirmação para ${email.trim().toLowerCase()}. Por favor, verifique sua caixa de entrada e spam.`,
        });
        setTimeout(() => {
          onLogin(authenticatedUser);
          setIsSubmitting(false);
        }, 1500);
      } else {
        onLogin(authenticatedUser);
        setIsSubmitting(false);
      }
    }, 450);
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
      } catch (err) {
        console.error('Erro ao gravar sessão:', err);
      }
      onLogin(googleUser);
      setIsSubmitting(false);
    }, 400);
  };

  const handleGuestLogin = () => {
    const guestUser: AuthUser = {
      id: `guest-${Date.now()}`,
      name: 'Visitante ENEM',
      email: 'visitante@gabaritou.app',
      provider: 'guest',
      isGuest: true,
      isPro: false,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('gabaritai_auth_user', JSON.stringify(guestUser));
    } catch (err) {
      console.error('Erro ao gravar sessão:', err);
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
              Gabaritou
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
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg('');
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

          {/* Success / Verification Notice */}
          <AnimatePresence>
            {successNotice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white text-xs">{successNotice.title}</div>
                  <p className="text-[11px] text-emerald-200/90 leading-relaxed">{successNotice.desc}</p>
                </div>
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
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
              >
                <span>⚠️</span>
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome ou apelido de estudos"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] mt-2 ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/20'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-600/20'
              }`}
            >
              <span>{tab === 'login' ? 'Entrar no Gabaritou' : 'Criar Minha Conta'}</span>
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
        </div>

        {/* Promo Banner: Gabaritou Pro (R$ 5,00/mês) */}
        <div
          onClick={() => onOpenProModal?.()}
          className="rounded-2xl p-4 bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-slate-900 border border-purple-500/30 shadow-lg relative overflow-hidden cursor-pointer hover:border-purple-400/50 transition-all group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
                <Crown className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Gabaritou Pro</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    R$ 5,00 / mês
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Correções de Redação ilimitadas, Simulados TRI completos e tutoria 24h com a Professora Gabi.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>

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
          <span>Cancele Quando Quiser</span>
        </div>
      </motion.div>
    </div>
  );
};
export default LoginScreen;
