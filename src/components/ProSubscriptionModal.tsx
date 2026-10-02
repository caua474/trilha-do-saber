import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Zap,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  Crown,
  AlertCircle,
  MessageCircle,
  Key,
} from 'lucide-react';
import { sendProWelcomeEmail } from '../services/resendEmailService';

interface ProSubscriptionModalProps {
  onClose: () => void;
  onUpgradeSuccess?: () => void;
  onStatusChange?: (status: 'pending_approval' | 'approved') => void;
  initialStep?: 'plans' | 'checkout' | 'pending';
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  onClose,
  onUpgradeSuccess,
  onStatusChange,
  initialStep,
}) => {
  const [step, setStep] = useState<'plans' | 'checkout' | 'pending' | 'success'>(() => {
    if (initialStep) return initialStep;
    try {
      const savedUser = localStorage.getItem('gabaritai_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.subscriptionStatus === 'pending_approval' && !parsed.isPro) {
          return 'pending';
        }
      }
    } catch {}
    return 'plans';
  });
  const [copied, setCopied] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comprovanteNome, setComprovanteNome] = useState('');
  const [nameError, setNameError] = useState('');

  // Chave Pix Direta Oficial
  const PIX_KEY = 'f089644f-3ceb-4873-b009-7e76e69ad569';

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PIX_KEY);
    }
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  /**
   * Confirmação Pix e Envio do Comprovante:
   * 1. Exige o preenchimento obrigatório do 'Nome no comprovante'
   * 2. Abre o WhatsApp com a mensagem formatada: Olá! Paguei o MenteUp Pro (R$ 5,00). Nome no comprovante: {nome}
   * 3. NUNCA ativa o Pro automaticamente: altera o estado exclusivamente para 'Aguardando Aprovação / Pagamento em Análise'
   */
  const handleConfirmPixPayment = async () => {
    const cleanName = comprovanteNome.trim();
    if (!cleanName) {
      setNameError('Por favor, digite seu nome conforme consta no comprovante Pix para prosseguir.');
      return;
    }
    setNameError('');
    setIsProcessing(true);

    let userEmail = 'estudante@menteup.app';

    try {
      const savedUser = localStorage.getItem('gabaritai_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email) userEmail = parsed.email;

        // SEGURANÇA: O botão NUNCA ativa o Pro automaticamente
        parsed.isPro = false;
        parsed.subscriptionStatus = 'pending_approval';
        parsed.pixStatus = 'pending_approval';
        parsed.pixPayerName = cleanName;
        parsed.pixPaymentDate = new Date().toISOString();
        parsed.pixAmount = 5.0;
        localStorage.setItem('gabaritai_auth_user', JSON.stringify(parsed));
      }
    } catch {}

    // Notifica o estado global na aplicação como pendente
    onStatusChange?.('pending_approval');

    // Abre o WhatsApp com a mensagem formatada exigida
    const formattedWhatsAppMsg = `Olá! Paguei o MenteUp Pro (R$ 5,00). Nome no comprovante: ${cleanName}`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(formattedWhatsAppMsg)}`;
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      window.location.href = whatsappUrl;
    }

    // Registra na fila do painel /admin do administrador
    try {
      fetch('/api/admin/register-pending-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: cleanName,
          comprovanteNome: cleanName,
          amount: 5.0,
        }),
      }).catch(() => {});
    } catch {}

    setIsProcessing(false);
    // Mostra obrigatoriamente a tela de 'Pagamento em Análise'
    setStep('pending');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header com ícone SVG Crown nítido (sem caractere vazio) */}
        <div className="px-6 py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/25 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Crown className="w-6 h-6 fill-amber-300 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                  <span>ACESSO DEFINITIVO</span>
                </span>
                <span className="text-xs font-bold text-amber-200">MenteUp Pro Vitalício</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {step === 'checkout'
                  ? 'Pagamento Único via Pix • R$ 5,00'
                  : step === 'pending'
                  ? 'Aguardando Aprovação / Pagamento em Análise'
                  : step === 'success'
                  ? 'Acesso Pro Aprovado!'
                  : 'Planos & Acesso Vitalício'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* STEP 1: COMPARAÇÃO E SELEÇÃO DE PLANOS */}
          {step === 'plans' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Plano Gratuito */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Plano Gratuito
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Básico
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white mt-1">
                      R$ 0,00
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                      Acesso básico com limites diários de uso para conhecer a plataforma.
                    </p>

                    <ul className="mt-4 space-y-2.5 text-xs text-slate-400 font-medium border-t border-slate-800/80 pt-3">
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Dúvidas diárias limitadas</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Resolução em 3 passos</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Apenas 3 primeiros dias do Desafio</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-4 text-center border-t border-slate-800/60">
                    <span className="text-xs font-bold text-slate-500">Seu plano atual</span>
                  </div>
                </div>

                {/* 2. PLANO PRO VITALÍCIO */}
                <div className="bg-gradient-to-b from-indigo-950/90 via-slate-900 to-purple-950/90 text-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-md">
                    Compra Única • Vitalício
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        PLANO PRO VITALÍCIO
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                      R$ 5,00
                    </div>
                    <div className="text-xs font-bold text-amber-300">
                      (Pagamento Único - Vitalício)
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
                      Pague uma única vez e tenha acesso irrestrito para sempre a todas as ferramentas inteligentes de estudo e aprovação.
                    </p>

                    {/* Lista Expandida de Benefícios */}
                    <ul className="mt-4 space-y-2.5 text-xs text-slate-200 font-medium border-t border-indigo-800/50 pt-3">
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Acesso ilimitado</strong> ao Scanner Tira-Dúvidas e Redações corrigidas por IA</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Simulados TRI oficiais</strong> com cálculo de nota pedagógica</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Banco de Flashcards Avançados</strong> e Cadernos de Erros com repetição espaçada</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Cronograma de Estudos Personalizado</strong> gerado por Inteligência Artificial</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Desafio de 30 Dias</strong> completo com Perguntas Diárias Inéditas por IA</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Acesso prioritário</strong> a novos módulos e atualizações futuras sem pagar nada a mais</span>
                      </li>
                    </ul>
                  </div>

                  {/* Botão de Ação */}
                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Garantir Acesso Vitalício (R$ 5,00)</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Informação sobre segurança e pagamento único */}
              <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Pagamento único, sem mensalidade
                </span>
                <span>•</span>
                <span>Chave Pix Oficial</span>
              </div>
            </div>
          )}

          {/* STEP 2: PÁGINA DE CHECKOUT COM PIX DIRETO */}
          {step === 'checkout' && (
            <div className="space-y-4">
              {/* Resumo do Pedido */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-950 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Compra Única Selecionada
                  </span>
                  <h4 className="text-sm font-extrabold text-white">MenteUp Pro • Acesso Vitalício</h4>
                  <p className="text-[11px] text-slate-300">Acesso definitivo a todos os módulos</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-amber-300">R$ 5,00</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">Pagamento Único</span>
                </div>
              </div>

              {/* Card de Pagamento Direto via Pix */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      Pix Direto Oficial
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    R$ 5,00 — Pagamento Único Vitalício
                  </span>
                </div>

                {/* Chave Pix em Destaque */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Chave Pix Oficial:
                    </label>
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      Banco: Nubank
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-amber-300 select-all break-all shadow-inner">
                      {PIX_KEY}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      {pixCopied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Chave</span>
                        </>
                      )}
                    </button>
                  </div>
                  {pixCopied && (
                    <p className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                      ✓ Chave Pix copiada para a área de transferência! Cole no seu banco.
                    </p>
                  )}
                </div>

                {/* Instruções Passo a Passo Compactas */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Como efetuar o pagamento:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>
                      Copie a chave Pix acima: <strong className="text-amber-300 font-mono">{PIX_KEY}</strong>
                    </li>
                    <li>
                      Abra o app do seu banco e faça a transferência de <strong>R$ 5,00</strong>.
                    </li>
                    <li>
                      Informe abaixo seu nome do comprovante e clique no botão fixo <strong className="text-amber-300">"Confirmar Pagamento e Liberar Acesso"</strong> no rodapé.
                    </li>
                  </ol>
                </div>

                {/* Identificação do Titular */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Nome no comprovante Pix (obrigatório para conferência): <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={comprovanteNome}
                    onChange={(e) => {
                      setComprovanteNome(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Ex: Seu Nome Completo no Banco"
                    className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none shadow-inner transition ${
                      nameError
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : 'border-slate-700 focus:border-amber-400'
                    }`}
                  />
                  {nameError && (
                    <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                {/* Botão de Envio de Comprovante / Suporte WhatsApp */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmPixPayment}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:border-emerald-400 group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Enviar Comprovante via WhatsApp (Suporte 24h)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TELA DE PAGAMENTO EM ANÁLISE / AGUARDANDO APROVAÇÃO */}
          {step === 'pending' && (
            <div className="text-center py-5 space-y-4">
              <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-400 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Status: Pagamento em Análise
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Pagamento em Análise / Aguardando Aprovação
                </h3>
              </div>

              {/* Mensagem Obrigatória Conforme Relatório de Testes */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm leading-relaxed text-center font-medium shadow-md">
                Pagamento informado! O seu acesso Pro será liberado em instantes após a confirmação do Pix na nossa conta.
              </div>

              {/* Dados do Pagamento em Fila */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl max-w-md mx-auto text-xs text-slate-300 text-left space-y-2">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Valor transferido:</span>
                  <span className="font-bold text-white">R$ 5,00 (Pagamento Único)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Chave de Destino:</span>
                  <span className="font-mono text-amber-300 text-[11px]">{PIX_KEY.slice(0, 15)}...</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Titular informado:</span>
                  <span className="font-semibold text-white">{comprovanteNome || 'Informado no envio'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo estimado:</span>
                  <span className="font-bold text-emerald-400">Até 15 minutos</span>
                </div>
              </div>

              {/* Botão de Enviar Comprovante via WhatsApp para Agilizar */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <a
                  href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                    `Olá! Paguei o MenteUp Pro (R$ 5,00). Nome no comprovante: ${comprovanteNome.trim() || 'Estudante'}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reabrir WhatsApp de Envio do Comprovante</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Fechar e Aguardar Liberação
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TELA DE SUCESSO E ATIVAÇÃO VITALÍCIA (SÓ APÓS APROVAÇÃO) */}
          {step === 'success' && (
            <div className="text-center py-6 sm:py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
                🎉
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Parabéns! Seu Plano Pro Vitalício está Ativo!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed font-medium">
                Seu pagamento de <strong>R$ 5,00</strong> foi conferido e aprovado. Seu <strong>Acesso Vitalício Definitivo</strong> está liberado com sucesso.
              </p>

              <div className="p-4 bg-indigo-950/50 border border-indigo-500/30 rounded-2xl max-w-md mx-auto text-xs text-indigo-200 text-left space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Benefícios vitalícios ativos:
                </div>
                <div>• Scanner Tira-Dúvidas e Redações com IA ilimitadas</div>
                <div>• Desafio de 30 Dias completo com Perguntas Diárias Inéditas por IA</div>
                <div>• Simulados TRI oficiais e Caderno de Erros inteligente</div>
                <div>• Sem mensalidades, sem renovações ou cobranças futuras</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xl shadow-indigo-600/30 active:scale-95"
              >
                Começar a Estudar no Modo Vitalício →
              </button>
            </div>
          )}
        </div>

        {/* RODAPÉ FIXO / STICKY FOOTER PARA O CHECKOUT PIX */}
        {step === 'checkout' && (
          <div className="bg-slate-950/98 backdrop-blur-md border-t border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 shrink-0 z-30 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('plans')}
                className="w-1/3 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPixPayment}
                className="w-2/3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 ring-2 ring-amber-400/40"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Registrando Informação...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Confirmar Pagamento e Liberar Acesso</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pagamento único de R$ 5,00 • Sem mensalidades • Análise rápida</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProSubscriptionModal;
