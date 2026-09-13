import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Flame,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Check,
  Award,
  ArrowRight
} from 'lucide-react';

interface WidgetProps {
  studyStreak?: number;
  onOpenQuizOfDay?: () => void;
}

export const WidgetSimulationCard: React.FC<WidgetProps> = ({
  studyStreak = 7,
  onOpenQuizOfDay,
}) => {
  const [questaoConcluida, setQuestaoConcluida] = useState<boolean>(false);
  const [widgetFormat, setWidgetFormat] = useState<'compact' | 'expanded'>('expanded');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Calculate days remaining until ENEM (Nov 8, 2026)
  const enemDate = new Date('2026-11-08T13:00:00');
  const today = new Date();
  const diffTime = enemDate.getTime() - today.getTime();
  const diasParaEnem = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleToggleQuestao = () => {
    setQuestaoConcluida((prev) => !prev);
  };

  const handleInstallWidgetAlert = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 text-slate-950 font-black flex items-center justify-center shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Retenção Diária
              </span>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                Módulo nº 2
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Widget para Tela Inicial do Celular (iOS & Android)
            </h3>
          </div>
        </div>

        {/* Format Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setWidgetFormat('compact')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1 ${
              widgetFormat === 'compact'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Compacto 2x2</span>
          </button>
          <button
            onClick={() => setWidgetFormat('expanded')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1 ${
              widgetFormat === 'expanded'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Expandido 4x2</span>
          </button>
        </div>
      </div>

      {/* Simulated Phone Screen Canvas */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">
          📱 Simulador do Widget em Tempo Real na Sua Tela Inicial
        </span>

        {/* THE WIDGET ITSELF */}
        <motion.div
          layout
          transition={{ duration: 0.3 }}
          className={`bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
            widgetFormat === 'compact' ? 'w-full max-w-xs space-y-3' : 'w-full max-w-md space-y-4'
          }`}
        >
          {/* Top Bar inside Widget */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-base">🎓</span>
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                GabaritaAí
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ao Vivo
            </span>
          </div>

          {/* Widget Grid Content */}
          <div className={`grid gap-3 ${widgetFormat === 'compact' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* 1. Ofensiva de Estudos (Streak) */}
            <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shrink-0">
                🔥
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                  Ofensiva Atual
                </span>
                <span className="text-base font-black text-amber-400">
                  {studyStreak} dias seguidos!
                </span>
              </div>
            </div>

            {/* 2. Dias para o ENEM */}
            <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center shadow-md shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                  Contagem ENEM
                </span>
                <span className="text-base font-black text-purple-300">
                  Faltam {diasParaEnem} dias
                </span>
              </div>
            </div>
          </div>

          {/* 3. Questão do Dia Status */}
          <div className="bg-black/40 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                questaoConcluida ? 'bg-emerald-500 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {questaoConcluida ? <CheckCircle2 className="w-5 h-5" /> : '🎯'}
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                  Questão do Dia (ENEM)
                </span>
                <span className={`text-xs font-black ${questaoConcluida ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {questaoConcluida ? 'Concluída (+50 XP) 🎉' : 'Pendente de Resolução'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleQuestao}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 ${
                questaoConcluida
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
              }`}
            >
              {questaoConcluida ? 'Desfazer' : 'Concluir'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-400">
          💡 <strong>Como instalar:</strong> Mantenha o dedo pressionado na tela inicial do seu celular, toque em <strong>+ (Widgets)</strong> e pesquise por <strong>GabaritaAí</strong>.
        </p>

        <button
          onClick={handleInstallWidgetAlert}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          {copiedNotification ? (
            <>
              <Check className="w-4 h-4 text-slate-950" />
              <span>Instruções Enviadas para Notificação!</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              <span>Ativar Widget no Meu Celular</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
