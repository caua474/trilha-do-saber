import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ShieldCheck, X, Sparkles, Lock } from 'lucide-react';

export interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDisallow: () => void;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onAllow,
  onDisallow,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="microphone-permission-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      >
        <motion.div
          id="microphone-permission-card"
          initial={{ scale: 0.92, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 380, damping: 25 }}
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 sm:p-7 space-y-5 border border-slate-200/90 dark:border-slate-800 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            id="mic-modal-close-btn"
            type="button"
            onClick={onDisallow}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fechar janela de permissão"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Áudio & Ditado por Voz (pt-BR)
              </span>
              <h3
                id="mic-permission-title"
                className="text-lg font-black text-slate-900 dark:text-white leading-tight"
              >
                Permissão de Acesso ao Microfone
              </h3>
            </div>
          </div>

          {/* Body Text in Brazilian Portuguese */}
          <p
            id="mic-permission-body"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed"
          >
            O <strong>GabaritaAí</strong> precisa de autorização para usar o seu microfone em português brasileiro. Assim, você pode ditar dúvidas para a Professora Gabi, gravar suas explicações no Método Feynman e praticar respostas orais.
          </p>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Privacidade garantida</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                O microfone só escuta quando você clicar deliberadamente para gravar. Nenhum áudio ou conversa é capturado em segundo plano.
              </span>
            </div>
          </div>

          {/* Action Buttons in Brazilian Portuguese */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            {/* Button 1: Disallow / Agora não */}
            <button
              id="mic-permission-disallow-btn"
              type="button"
              onClick={onDisallow}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95 cursor-pointer text-center"
            >
              Agora não
            </button>

            {/* Button 2: Allow Microphone access */}
            <button
              id="mic-permission-allow-btn"
              type="button"
              onClick={onAllow}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-center"
            >
              <Mic className="w-4 h-4" />
              Permitir acesso ao microfone
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

