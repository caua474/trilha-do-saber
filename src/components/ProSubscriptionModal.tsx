import React, { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';

interface ProSubscriptionModalProps {
  onClose: () => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({ onClose }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl shadow-inner">
              ⭐
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                  Mercado Pago
                </span>
                <span className="text-xs font-bold text-amber-200">MenteUp Premium</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Planos & Assinatura
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {isSubscribed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                🎉
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Parabéns! Você é assinante do MenteUp PRO!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed font-medium">
                Sua assinatura foi ativada com sucesso! Agora você tem acesso ilimitado ao Scanner Tira-Dúvidas com explicação detalhada em 3 passos e suporte completo à IA.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
              >
                Voltar aos Estudos
              </button>
            </div>
          ) : (
            /* Plans Grid - 2 Options */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Plano Gratuito */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Plano Gratuito
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Básico
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    R$ 0,00
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                    Teste grátis para tirar dúvidas básicas diárias no Scanner Tira-Dúvidas.
                  </p>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium border-t border-slate-200 dark:border-slate-800/80 pt-3">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Dúvidas diárias no Scanner Tira-Dúvidas</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Resolução em 3 passos básica</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Acesso a conteúdos e matérias</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 text-center border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="text-xs font-bold text-slate-400">Seu plano atual</span>
                </div>
              </div>

              {/* 2. Plano Pro Mensal */}
              <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                  Sem Fidelidade
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Plano Pro Mensal
                    </span>
                    <span className="text-xs">⭐</span>
                  </div>
                  <div className="text-2xl font-black text-white mt-1">
                    R$ 5,00 <span className="text-xs font-medium text-slate-300">/ mês</span>
                  </div>
                  <p className="text-xs text-amber-200 font-medium mt-2 leading-relaxed">
                    Acesso ilimitado ao Scanner Tira-Dúvidas com explicação detalhada em 3 passos e suporte a IA.
                  </p>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-200 font-medium border-t border-indigo-800/50 pt-3">
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Acesso ilimitado</strong> ao Scanner Tira-Dúvidas</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Explicação detalhada em 3 passos</strong> com IA</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Suporte a IA</strong> com leitura de foto e texto</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Simulador TRI, Redação e ferramentas avançadas</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleSubscribe}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Assinar Plano Pro Mensal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
