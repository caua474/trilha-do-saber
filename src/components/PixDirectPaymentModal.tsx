import React, { useState } from 'react';
import {
  X,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  Crown,
  MessageCircle,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export interface PixDirectPaymentModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onPaymentNotified?: (data: { email?: string; name?: string; comprovanteNome: string }) => void;
  pixKey?: string;
  amount?: number;
  whatsAppNumber?: string;
}

export const PixDirectPaymentModal: React.FC<PixDirectPaymentModalProps> = ({
  isOpen = true,
  onClose,
  onPaymentNotified,
  pixKey = 'f089644f-3ceb-4873-b009-7e76e69ad569',
  amount = 5.0,
  whatsAppNumber = '5511999999999',
}) => {
  const [copied, setCopied] = useState(false);
  const [comprovanteNome, setComprovanteNome] = useState('');
  const [nameError, setNameError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  // 1-Click Copy Handler
  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // WhatsApp Pre-filled message URL
  const formattedWhatsAppMsg = `Olá! Paguei o MenteUp Pro (R$ 5,00). Nome no comprovante: ${comprovanteNome.trim() || 'Estudante'}`;
  const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(formattedWhatsAppMsg)}`;

  // Envio / Confirmação manual
  const handleConfirmPayment = async () => {
    const cleanName = comprovanteNome.trim();
    if (!cleanName) {
      setNameError('Por favor, preencha o seu nome no comprovante para prosseguir.');
      return;
    }
    setNameError('');
    setIsProcessing(true);

    let userEmail = 'estudante@menteup.app';

    // Salva no localStorage como PENDENTE (NUNCA libera o Pro automaticamente)
    try {
      const savedUser = localStorage.getItem('gabaritai_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email) userEmail = parsed.email;
        parsed.isPro = false;
        parsed.subscriptionStatus = 'pending_approval';
        parsed.pixStatus = 'pending_approval';
        parsed.pixPayerName = cleanName;
        parsed.pixPaymentDate = new Date().toISOString();
        parsed.pixAmount = amount;
        localStorage.setItem('gabaritai_auth_user', JSON.stringify(parsed));
      }
    } catch {}

    // Abre o WhatsApp com a mensagem formatada exigida
    const directWhatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
      `Olá! Paguei o MenteUp Pro (R$ 5,00). Nome no comprovante: ${cleanName}`
    )}`;
    try {
      window.open(directWhatsAppUrl, '_blank');
    } catch {
      window.location.href = directWhatsAppUrl;
    }

    // Registra na fila do painel /admin do administrador de forma assíncrona
    try {
      fetch('/api/admin/register-pending-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          name: cleanName,
          comprovanteNome: cleanName,
          amount,
          pixKey,
        }),
      }).catch(() => {});
    } catch {}

    onPaymentNotified?.({
      comprovanteNome: cleanName,
    });

    setIsProcessing(false);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 rounded-[2rem] w-full max-w-lg overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[92vh] relative text-white">
        
        {/* Header com Destaque Vitalício */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/25 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Crown className="w-6 h-6 fill-amber-300 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Crown className="w-3.5 h-3.5 fill-slate-950 text-slate-950 shrink-0" />
                  <span>ACESSO VITALÍCIO</span>
                </span>
                <span className="text-xs font-bold text-amber-200">MenteUp Pro</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isSubmitted ? 'Pagamento em Análise' : 'Pagamento Único via Pix'}
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

        {/* Conteúdo Central */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {!isSubmitted ? (
            <>
              {/* Card Resumo do Pedido */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-950 to-purple-950/80 border border-indigo-500/30 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Compra Única Definitiva
                  </span>
                  <h4 className="text-sm font-extrabold text-white">MenteUp Pro • Acesso Ilimitado</h4>
                  <p className="text-[11px] text-slate-300">Sem mensalidade • Pague uma única vez</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-amber-300">R$ {amount.toFixed(2).replace('.', ',')}</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">Valor Único</span>
                </div>
              </div>

              {/* Bloco Chave Pix Oficial com 1-Clique para Copiar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      Chave Pix Oficial
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    R$ 5,00 — Pagamento Único Vitalício
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Chave Pix (Copia e Cola):
                    </label>
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      Banco: Nubank
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-amber-300 select-all break-all shadow-inner">
                      {pixKey}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      {copied ? (
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
                  {copied && (
                    <p className="text-[11px] text-emerald-400 font-semibold animate-in fade-in">
                      ✓ Chave Pix copiada com sucesso! Cole no aplicativo do seu banco.
                    </p>
                  )}
                </div>

                {/* Passo a Passo Rápido */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Como funciona:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>Copie a chave Pix acima e transfira <strong>R$ {amount.toFixed(2).replace('.', ',')}</strong> no seu banco.</li>
                    <li>Informe seu nome abaixo (ou envie o comprovante no WhatsApp).</li>
                    <li>Clique em <strong>"Confirmar Pagamento e Liberar Acesso"</strong> no rodapé.</li>
                  </ol>
                </div>

                {/* Campo Obrigatório de Identificação do Comprovante */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Nome no comprovante (obrigatório):
                  </label>
                  <input
                    type="text"
                    value={comprovanteNome}
                    onChange={(e) => {
                      setComprovanteNome(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Digite seu nome completo conforme consta no Pix"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                  {nameError && (
                    <p className="text-[11px] text-rose-400 font-medium animate-in fade-in">
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Botão de Envio de Comprovante / Suporte WhatsApp */}
                <div className="pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:border-emerald-400 group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Enviar Comprovante via WhatsApp (Suporte Direto)</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            /* Tela de Confirmação em Análise */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-400 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-pulse">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Status: Aguardando Aprovação / Pagamento em Análise
                </span>
                <h3 className="text-xl font-black text-white">
                  Pagamento Informado com Sucesso!
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm leading-relaxed text-center font-medium shadow-md">
                Pagamento informado! O seu acesso Pro será liberado em instantes após a confirmação do Pix na nossa conta.
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 text-left space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Valor:</span>
                  <span className="font-bold text-white">R$ {amount.toFixed(2).replace('.', ',')} (Pagamento Único)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Nome informado:</span>
                  <span className="font-semibold text-white">{comprovanteNome || 'Informado no envio'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tempo estimado:</span>
                  <span className="font-bold text-emerald-400">Até 15 minutos</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Comprovante (WhatsApp)</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo / Sticky Footer com Botão de Confirmação */}
        {!isSubmitted && (
          <div className="bg-slate-950/98 backdrop-blur-md border-t border-slate-800 px-4 py-3 sm:px-6 sm:py-3.5 shrink-0 z-30 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-2/3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 ring-2 ring-amber-400/40"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Registrando...</span>
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
              <span>Pagamento único de R$ {amount.toFixed(2).replace('.', ',')} • Sem mensalidades • Envio direto para análise</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PixDirectPaymentModal;
