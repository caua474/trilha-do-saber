import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  KeyRound,
  WifiOff,
  Clock,
  RefreshCw,
  X,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useGeminiError } from '../context/GeminiErrorContext';

interface GeminiErrorBannerProps {
  onOpenSettings?: () => void;
}

export const GeminiErrorBanner: React.FC<GeminiErrorBannerProps> = ({ onOpenSettings }) => {
  const { error, clearError, triggerRetry, retryAction } = useGeminiError();

  if (!error) return null;

  const isAuth = error.type === 'AUTH_ERROR';
  const isOffline = error.type === 'OFFLINE_ERROR';
  const isQuota = error.type === 'QUOTA_ERROR';

  const getThemeConfig = () => {
    if (isAuth) {
      return {
        bg: 'bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-indigo-950/90',
        border: 'border-amber-500/50',
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        badgeText: 'Serviço de IA Indisponível',
        Icon: KeyRound,
      };
    }
    if (isOffline) {
      return {
        bg: 'bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-amber-950/90',
        border: 'border-rose-500/50',
        iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        badgeText: 'Conexão Indisponível • Modo Offline',
        Icon: WifiOff,
      };
    }
    if (isQuota) {
      return {
        bg: 'bg-gradient-to-r from-orange-950/90 via-slate-900/95 to-slate-900/90',
        border: 'border-orange-500/50',
        iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
        badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        badgeText: 'Limite de Requisições • Cota Excedida',
        Icon: Clock,
      };
    }
    return {
      bg: 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/90',
      border: 'border-slate-700',
      iconBg: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      badgeText: 'Instabilidade de Resposta • IA',
      Icon: AlertTriangle,
    };
  };

  const theme = getThemeConfig();
  const IconComponent = theme.Icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-7xl mx-auto px-4 pt-3 pb-1 z-40"
      >
        <div
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border shadow-2xl backdrop-blur-md ${theme.bg} ${theme.border}`}
        >
          {/* Decoração sutil de fundo */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Lado Esquerdo: Ícone + Mensagem */}
            <div className="flex items-start space-x-3.5 flex-1 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${theme.iconBg}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0">
                {/* Badges de Categoria */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}
                  >
                    {theme.badgeText}
                  </span>

                  {error.componentSource && (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                      Origem: {error.componentSource}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                    {error.timestamp}
                  </span>
                </div>

                {/* Título Principal */}
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                  {error.title}
                </h4>

                {/* Descrição Amigável */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                  {error.message}
                </p>
              </div>
            </div>

            {/* Lado Direito: Ações */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
              {/* Botão Tentar Novamente */}
              {(retryAction || error.actionType === 'retry') && (
                <button
                  type="button"
                  onClick={triggerRetry}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tentar Novamente</span>
                </button>
              )}

              {/* Botão de Atalho para Configurações Gerais se não for auth */}
              {!isAuth && onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  title="Configurações da API"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Configurações</span>
                </button>
              )}

              {/* Botão Fechar / Dispensar */}
              <button
                type="button"
                onClick={clearError}
                aria-label="Dispensar aviso"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Dispensar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
