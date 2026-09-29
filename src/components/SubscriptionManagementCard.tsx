import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  Crown,
  Copy,
  Clock,
  MessageCircle,
  Key,
  RefreshCw,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { AuthUser } from '../types';
import { sendProWelcomeEmail } from '../services/resendEmailService';

interface SubscriptionManagementCardProps {
  authUser?: AuthUser | null;
  onOpenPro?: () => void;
  onStatusUpdated?: () => void;
}

export const SubscriptionManagementCard: React.FC<SubscriptionManagementCardProps> = ({
  authUser,
  onOpenPro,
  onStatusUpdated,
}) => {
  const [pixCopied, setPixCopied] = useState(false);
  const [showAdminApproval, setShowAdminApproval] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const PIX_KEY = 'f089644f-3ceb-4873-b009-7e76e69ad569';

  const isPro = Boolean(authUser?.isPro);
  const isPending = Boolean(!isPro && authUser?.subscriptionStatus === 'pending_approval');

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PIX_KEY);
    }
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleAdminApprove = async () => {
    if (adminPin.trim() !== 'MENTEUP2026' && adminPin.trim() !== 'admin123') {
      setAdminError('PIN de administrador inválido.');
      return;
    }

    setIsApproving(true);
    setAdminError('');

    try {
      const savedUser = localStorage.getItem('gabaritai_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.isPro = true;
        parsed.subscriptionStatus = 'active';
        parsed.pixStatus = 'approved';
        parsed.isLifetime = true;
        localStorage.setItem('gabaritai_auth_user', JSON.stringify(parsed));
      }

      await fetch('/api/admin/approve-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authUser?.email,
          adminSecret: adminPin.trim(),
        }),
      });

      if (authUser?.email) {
        sendProWelcomeEmail(authUser.email, authUser.name);
      }

      setIsApproving(false);
      setShowAdminApproval(false);
      onStatusUpdated?.();
      window.location.reload();
    } catch {
      setIsApproving(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">Meu Acesso Pro</h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                Pagamento Único
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gerencie seu acesso vitalício e ferramentas liberadas
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isPro ? (
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Acesso Vitalício Ativo
            </span>
          ) : isPending ? (
            <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              Pagamento Pix em Análise
            </span>
          ) : (
            <span className="bg-slate-800/80 border border-slate-700/60 text-slate-400 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Plano Gratuito
            </span>
          )}
        </div>
      </div>

      {/* Corpo dos Detalhes da Conta */}
      <div className="mt-5 space-y-4">
        {isPro ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[11px] font-medium text-slate-400">Plano Atual</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  MenteUp Pro
                </div>
                <div className="text-xs text-amber-400 font-semibold mt-1">
                  Acesso Completo Definitivo
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[11px] font-medium text-slate-400">Modelo de Cobrança</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Pagamento Único (Pix)
                </div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sem mensalidades
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="text-[11px] font-medium text-slate-400">Validade do Acesso</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5 flex items-center gap-1">
                  <InfinityIcon className="w-4 h-4 text-indigo-400" />
                  Vitalício Permanente
                </div>
                <div className="text-xs text-indigo-300 mt-1">Atualizações inclusas</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
              <div className="text-xs text-slate-300 space-y-0.5 text-center sm:text-left">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Seu Acesso Vitalício está 100% liberado!
                </div>
                <div className="text-slate-400">
                  Você tem acesso ilimitado e vitalício ao Tira-Dúvidas IA, Redações, Simulados TRI e ao Desafio 30 Dias.
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl block">
                  Pix Oficial: {PIX_KEY.slice(0, 18)}...
                </span>
              </div>
            </div>
          </div>
        ) : isPending ? (
          /* STATUS PENDENTE DE APROVAÇÃO MANUAL */
          <div className="space-y-4 p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Pagamento em Análise / Aguardando Aprovação
                </h4>
                <p className="text-xs text-amber-200 leading-relaxed font-medium">
                  Pagamento informado! O seu acesso Pro será liberado em instantes após a confirmação do Pix na nossa conta.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Valor Transferido:</span>
                <span className="font-bold text-white">R$ 5,00 (Pagamento Único)</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Status da Verificação:</span>
                <span className="font-bold text-amber-400">Aguardando Conferência Bancária</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                  `Olá! Acabei de fazer o Pix de R$ 5,00 para o MenteUp Pro Vitalício. Meu e-mail: ${authUser?.email || 'Estudante'}. Aguardo liberação!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Comprovante (WhatsApp)</span>
              </a>

              <button
                type="button"
                onClick={() => setShowAdminApproval(!showAdminApproval)}
                className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 underline cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Aprovação Manual do Administrador</span>
              </button>
            </div>

            {/* Painel do Administrador para Liberação */}
            {showAdminApproval && (
              <div className="mt-3 p-3.5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2 text-left animate-in fade-in">
                <span className="text-[11px] font-bold text-amber-300 block">
                  Painel de Aprovação (Administrador):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="PIN de Administrador (MENTEUP2026)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    disabled={isApproving || !adminPin.trim()}
                    onClick={handleAdminApprove}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {isApproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Aprovar Pro</span>
                  </button>
                </div>
                {adminError && <p className="text-[11px] text-rose-400">{adminError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-500/30">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">Acesso Definitivo Sem Mensalidades</span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white">
                Adquira o MenteUp Pro Vitalício por apenas R$ 5,00 (Pagamento Único)
              </h4>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Pague uma única vez via Pix direto e garanta acesso vitalício ilimitado: Perguntas Dinâmicas por IA, Desafio de 30 Dias, Simulados TRI com nota e correção de Redações.
              </p>
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[11px] font-mono text-amber-300/90 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                  Chave Pix: {PIX_KEY.slice(0, 18)}...
                </span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  {pixCopied ? 'Copiada!' : 'Copiar chave'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPro}
              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Garantir Acesso Vitalício (R$ 5,00)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
