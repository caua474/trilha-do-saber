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
                <span className="text-xs font-bold text-amber-200">GabaritaAí Premium</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Plano PRO - Ilimitado
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
                Parabéns! Você é GabaritaAí PRO!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed font-medium">
                Sua assinatura foi ativada com sucesso! Agora você tem perguntas ilimitadas para a IA, resumos ilimitados, corretor de redação, caderno de erros e todas as ferramentas para gabaritar no ENEM e vestibular.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-extrabold hover:bg-slate-800 transition cursor-pointer"
              >
                Voltar aos Estudos
              </button>
            </div>
          ) : (
            /* Plans Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Plano Grátis
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    R$ 0 <span className="text-xs font-medium text-slate-400">/sempre</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>5 perguntas para a IA por dia</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Acesso ao plano de estudos básico</span>
                    </li>
                    <li className="flex items-center space-x-2 opacity-50">
                      <X className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="line-through">Resumos ilimitados</span>
                    </li>
                    <li className="flex items-center space-x-2 opacity-50">
                      <X className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="line-through">Caderno de erros e Redação</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 text-center">
                  <span className="text-xs font-bold text-slate-400">Seu plano atual</span>
                </div>
              </div>

              {/* PRO Plan */}
              <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
                  Sem Fidelidade
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Plano PRO
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    R$ 9,90 <span className="text-xs font-medium text-slate-300">/mês</span>
                  </div>
                  <p className="text-[10px] text-amber-200 font-semibold mt-0.5">
                    Cancele quando quiser
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-200 font-medium">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Perguntas ilimitadas</strong> para a IA</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Simulador de SISU</strong> e Nota de Corte Real</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Gerador de Mapas Mentais</strong> do Edital</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Modo Foco Pomodoro</strong> com Som Ambiente & XP</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Corretor de Redação ENEM & Simulado TRI</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleSubscribe}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Assinar via Mercado Pago</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
