import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Target,
  PenTool,
  Trophy,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  Brain,
  Zap,
  Play
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface HowItWorksModalProps {
  onClose: () => void;
  onNavigateModule?: (primaryTab: string, subTool?: string) => void;
}

interface TutorialSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorTheme: 'indigo' | 'amber' | 'rose' | 'emerald' | 'purple';
  highlights: string[];
  primaryTab: string;
  subTool?: string;
  actionText: string;
}

const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    id: 'dashboard',
    badge: 'Visão Geral & Metas',
    title: 'Seu Painel Focado & Metas Diárias',
    description:
      'Acompanhe a contagem regressiva exata para a prova do seu curso e universidade dos sonhos. Monitore sua barra de metas diárias de questões e minutos em tempo real com comemorações automáticas!',
    icon: <Rocket className="w-8 h-8 text-amber-400" />,
    colorTheme: 'amber',
    highlights: [
      'Contagem regressiva personalizada por curso e faculdade',
      'Barra de progresso circular com celebrações de 100%',
      'Ofensiva diária (Streak) com bônus de XP'
    ],
    primaryTab: 'home',
    actionText: 'Explorar Painel Home'
  },
  {
    id: 'conteudos',
    badge: 'Resumos & Repetição',
    title: 'Biblioteca Digital Bento AI & Flashcards',
    description:
      'Gere resumos estruturados em 3 frases objetivas, 4 conceitos indispensáveis e 3 testes de fixação. Estude com flashcards de repetição espaçada (Método Leitner) e modo áudio/podcast.',
    icon: <BookOpen className="w-8 h-8 text-indigo-400" />,
    colorTheme: 'indigo',
    highlights: [
      'Resumos instantâneos para qualquer tema',
      'Flashcards com sistema de caixas Leitner',
      'Modo Áudio e Podcasts para estudar no fone'
    ],
    primaryTab: 'conteudos',
    subTool: 'flashcards',
    actionText: 'Ver Biblioteca & Resumos'
  },
  {
    id: 'redacao',
    badge: 'Correção ENEM',
    title: 'Redação Nota 1000 & Assistente Gabi IA',
    description:
      'Envie sua redação por texto ou foto e receba correção detalhada em segundos segundo a grade oficial do ENEM (C1 a C5). Acesse o Detector C5 de Proposta de Intervenção e repertórios socioculturais.',
    icon: <PenTool className="w-8 h-8 text-rose-400" />,
    colorTheme: 'rose',
    highlights: [
      'Nota de 0 a 1000 com análise por competência',
      'Detector de falhas na Proposta de Intervenção (C5)',
      'Esqueletos coringa e repertórios filosóficos'
    ],
    primaryTab: 'redacao_ia',
    subTool: 'redacao',
    actionText: 'Treinar Redação com IA'
  },
  {
    id: 'simulados',
    badge: 'Treino Prático',
    title: 'Simulados TRI Oficial & Scanner de Gabarito',
    description:
      'Treine com questões reais do ENEM e vestibulares ajustadas pela Teoria de Resposta ao Item (TRI). Ative o som ambiente de sala de aula e corrija cartões gabarito físicos tirando foto com a câmera!',
    icon: <Target className="w-8 h-8 text-emerald-400" />,
    colorTheme: 'emerald',
    highlights: [
      'Algoritmo com nota TRI real estimada',
      'Som ambiente de prova com ruídos realistas',
      'Leitor óptico que lê o cartão de respostas por foto'
    ],
    primaryTab: 'simulados_treino',
    subTool: 'simulado_tri',
    actionText: 'Ir para Simulados TRI'
  },
  {
    id: 'gamificacao',
    badge: 'Gamificação & Ranking',
    title: 'Evolua o Mascote Gabaritão e Suba no Ranking',
    description:
      'Alimente o mascote Gabaritão conforme você estuda. Vença duelos X1 de questões contra a IA ou amigos, suba na liga semanal regional e acompanhe seus relatórios de evolução.',
    icon: <Trophy className="w-8 h-8 text-purple-400" />,
    colorTheme: 'purple',
    highlights: [
      'Mascote evolutivo com frases motivacionais',
      'Ranking semanal regional de estudantes',
      'Desafios Batalha X1 e Caderno de Erros automático'
    ],
    primaryTab: 'perfil_gamificacao',
    subTool: 'mascote_xp',
    actionText: 'Ver Mascote & Ranking'
  }
];

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  onClose,
  onNavigateModule
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const slide = TUTORIAL_SLIDES[currentSlideIndex];

  const handleNext = () => {
    playClickSound();
    if (currentSlideIndex < TUTORIAL_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      playSuccessSound();
      onClose();
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleExplore = () => {
    playSuccessSound();
    if (onNavigateModule) {
      onNavigateModule(slide.primaryTab, slide.subTool);
    } else {
      onClose();
    }
  };

  const getThemeStyles = (theme: TutorialSlide['colorTheme']) => {
    switch (theme) {
      case 'amber':
        return {
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          gradientBorder: 'border-amber-500/40',
          btnBg: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black',
          highlightIconBg: 'bg-amber-500/20 text-amber-400',
          dotBg: 'bg-amber-500'
        };
      case 'rose':
        return {
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          gradientBorder: 'border-rose-500/40',
          btnBg: 'bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 font-black',
          highlightIconBg: 'bg-rose-500/20 text-rose-400',
          dotBg: 'bg-rose-500'
        };
      case 'emerald':
        return {
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          gradientBorder: 'border-emerald-500/40',
          btnBg: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black',
          highlightIconBg: 'bg-emerald-500/20 text-emerald-400',
          dotBg: 'bg-emerald-500'
        };
      case 'purple':
        return {
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          gradientBorder: 'border-purple-500/40',
          btnBg: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black',
          highlightIconBg: 'bg-purple-500/20 text-purple-400',
          dotBg: 'bg-purple-500'
        };
      default:
        return {
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          gradientBorder: 'border-indigo-500/40',
          btnBg: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black',
          highlightIconBg: 'bg-indigo-500/20 text-indigo-400',
          dotBg: 'bg-indigo-500'
        };
    }
  };

  const themeStyle = getThemeStyles(slide.colorTheme);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative text-white my-auto max-h-[95vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Tutorial Rápido GabaritaAí</h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Passo {currentSlideIndex + 1} de {TUTORIAL_SLIDES.length} • Guia da Plataforma
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            title="Fechar Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar across top */}
        <div className="w-full bg-slate-800 h-1.5 flex shrink-0">
          {TUTORIAL_SLIDES.map((s, idx) => (
            <div
              key={s.id}
              className={`h-full transition-all duration-300 ${
                idx <= currentSlideIndex
                  ? 'bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-500 flex-1'
                  : 'bg-transparent flex-1'
              }`}
            />
          ))}
        </div>

        {/* Slide Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Badge & Icon Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${themeStyle.badgeBg}`}
                  >
                    {slide.badge}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {slide.title}
                  </h2>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 shrink-0 shadow-lg">
                  {slide.icon}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {slide.description}
              </p>

              {/* Highlights checklist */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Destaques da Funcionalidade:
                </h4>

                <div className="space-y-2">
                  {slide.highlights.map((item) => (
                    <div
                      key={item}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center space-x-3 text-xs font-bold text-slate-200"
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${themeStyle.highlightIconBg}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Jump Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExplore}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-95 ${themeStyle.btnBg}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{slide.actionText}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition cursor-pointer ${
              currentSlideIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Interactive Step Indicator Dots */}
          <div className="flex items-center space-x-2">
            {TUTORIAL_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setCurrentSlideIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx
                    ? `w-6 ${themeStyle.dotBg}`
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Ir para o slide ${idx + 1}`}
              />
            ))}
          </div>

          {currentSlideIndex < TUTORIAL_SLIDES.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <span>Concluir Tutorial 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
