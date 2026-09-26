import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  PenTool,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Zap,
  Target
} from 'lucide-react';
import { PrimaryTab } from './BottomNavigationBar';
import { AbaAtiva } from './NavigationTabs';
import { playClickSound, playSuccessSound } from '../utils/audio';

export const WELCOME_TOUR_KEY = 'menteup_welcome_tour_seen_v1';
const LEGACY_TOUR_KEYS = ['cfjvmg_welcome_tour_seen_v1', 'gabaritai_welcome_tour_seen_v1'];

export const hasSeenWelcomeTour = (): boolean => {
  try {
    if (localStorage.getItem(WELCOME_TOUR_KEY) === 'true') return true;
    for (const key of LEGACY_TOUR_KEYS) {
      if (localStorage.getItem(key) === 'true') return true;
    }
    return false;
  } catch {
    return true;
  }
};

export const markWelcomeTourSeen = (): void => {
  try {
    localStorage.setItem(WELCOME_TOUR_KEY, 'true');
    for (const key of LEGACY_TOUR_KEYS) {
      localStorage.setItem(key, 'true');
    }
  } catch (e) {
    console.error('Erro ao registrar tour visto:', e);
  }
};

interface WelcomeTourStep {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accentGradient: string;
  targetPrimaryTab: PrimaryTab;
  targetAbaAtiva: AbaAtiva;
  ctaText: string;
}

const TOUR_STEPS: WelcomeTourStep[] = [
  {
    id: 1,
    badge: 'Passo 1 de 3 • Tira-Dúvidas Instantâneo',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    title: 'Scanner Inteligente de Questões',
    subtitle: 'Aponte a câmera ou digite qualquer questão',
    description:
      'Tire uma foto do caderno, apostila ou prova. A inteligência artificial transcreve o enunciado, identifica o conceito-chave e explica a resolução didática passo a passo em 3 etapas com gabarito oficial.',
    features: [
      'Reconhecimento óptico de imagem e texto',
      'Resolução didática em 3 passos pedagógicos',
      'Dicas rápidas e atalhos para não errar no ENEM'
    ],
    icon: Camera,
    iconBg: 'bg-indigo-600/20 border-indigo-500/30',
    iconColor: 'text-indigo-400',
    accentGradient: 'from-indigo-600 to-blue-600',
    targetPrimaryTab: 'conteudos',
    targetAbaAtiva: 'duvidas',
    ctaText: 'Ver o Scanner em Ação'
  },
  {
    id: 2,
    badge: 'Passo 2 de 3 • Nota 1000 no ENEM',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    title: 'Corretor de Redação com IA',
    subtitle: 'Correção analítica nas 5 competências oficiais do INEP',
    description:
      'Envie o texto da sua redação sobre qualquer tema. O corretor pontua cada uma das 5 competências de 0 a 200 pontos, aponta desvios gramaticais, repertório sociocultural e detalha sua proposta de intervenção (C5).',
    features: [
      'Notas detalhadas por competência (C1 a C5)',
      'Checagem da regra AAMED na proposta de intervenção',
      'Exportação da correção oficial em PDF diagramado'
    ],
    icon: PenTool,
    iconBg: 'bg-purple-600/20 border-purple-500/30',
    iconColor: 'text-purple-400',
    accentGradient: 'from-purple-600 to-pink-600',
    targetPrimaryTab: 'redacao_ia',
    targetAbaAtiva: 'redacao',
    ctaText: 'Conhecer a Redação'
  },
  {
    id: 3,
    badge: 'Passo 3 de 3 • Calibração Real de Nota',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    title: 'Simulador de Provas & Nota TRI',
    subtitle: 'Treino com cronômetro, som de prova e caderno de erros',
    description:
      'Realize simulados paramétricos com cálculo da Teoria de Resposta ao Item (TRI) oficial, ambientação sonora realista com áudio procedural e envio automático de questões erradas para repetição espaçada no Caderno de Erros.',
    features: [
      'Cálculo estatístico de coerência pedagógica TRI',
      'Som ambiente de sala de aula com Web Audio API',
      'Caderno de Erros com revisão espaçada de Leitner'
    ],
    icon: GraduationCap,
    iconBg: 'bg-emerald-600/20 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    accentGradient: 'from-emerald-600 to-teal-600',
    targetPrimaryTab: 'simulados_treino',
    targetAbaAtiva: 'simulado_tri',
    ctaText: 'Explorar Simulados'
  }
];

interface WelcomeTourModalProps {
  onClose: () => void;
  onNavigateToFeature: (primaryTab: PrimaryTab, abaAtiva: AbaAtiva) => void;
  userName?: string;
}

export const WelcomeTourModal: React.FC<WelcomeTourModalProps> = ({
  onClose,
  onNavigateToFeature,
  userName = 'Estudante'
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const step = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  // Marca imediatamente no localStorage para não reabrir em recarregamentos
  useEffect(() => {
    markWelcomeTourSeen();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playClickSound();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleNext = () => {
    playClickSound();
    if (isLast) {
      playSuccessSound();
      markWelcomeTourSeen();
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleDirectFeatureClick = () => {
    playSuccessSound();
    markWelcomeTourSeen();
    onNavigateToFeature(step.targetPrimaryTab, step.targetAbaAtiva);
    onClose();
  };

  const handleSkip = () => {
    playClickSound();
    markWelcomeTourSeen();
    onClose();
  };

  return (
    <div
      id="welcome-tour-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSkip();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col relative text-white"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Bem-vindo ao MenteUp, {userName}!
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Tour guiado rápido pelos 3 pilares essenciais da sua aprovação
              </p>
            </div>
          </div>
          <button
            id="welcome-tour-close-btn"
            onClick={handleSkip}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Pular tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Dots Indicator */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/40 bg-slate-950/40">
          <div className="flex items-center gap-2">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  playClickSound();
                  setCurrentStepIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-8 bg-indigo-500'
                    : idx < currentStepIndex
                    ? 'w-3 bg-emerald-500'
                    : 'w-3 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Ir para o passo ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Passo {currentStepIndex + 1} de {TOUR_STEPS.length}
          </span>
        </div>

        {/* Slide Content with AnimatePresence */}
        <div className="p-6 sm:p-7 relative z-10 min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Step Header */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${step.iconBg}`}
                >
                  <step.icon className={`w-7 h-7 ${step.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <span
                    className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${step.badgeColor}`}
                  >
                    {step.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-300">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
                {step.description}
              </p>

              {/* Highlight Features */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Destaques desta ferramenta:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {step.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStepIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkip}
                className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer w-full sm:w-auto text-center"
              >
                Pular Introdução
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Direct jump to feature button */}
            <button
              type="button"
              onClick={handleDirectFeatureClick}
              className="py-2.5 px-3.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
              title={`Abrir agora: ${step.title}`}
            >
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Abrir Agora</span>
            </button>

            {/* Next / Finish Button */}
            <button
              type="button"
              onClick={handleNext}
              className={`py-2.5 px-5 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer active:scale-95 w-full sm:w-auto bg-gradient-to-r ${step.accentGradient} hover:opacity-95 shadow-indigo-600/20`}
            >
              <span>{isLast ? 'Concluir & Começar a Estudar' : 'Próximo Pilar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default WelcomeTourModal;
