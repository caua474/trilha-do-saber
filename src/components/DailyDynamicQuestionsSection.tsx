import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Target,
  ShieldAlert,
  Moon,
  Sun,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen,
  Volume2,
  Calendar,
  Share2,
  Send,
  Zap,
  Check,
} from 'lucide-react';
import {
  QuestionCategory,
  DynamicQuestion,
  getUserJourneyDay,
  setUserJourneyDay,
  generateDynamicAiQuestion,
  recordQuestionView,
} from '../services/dynamicQuestionService';
import { AuthUser } from '../types';

interface DailyDynamicQuestionsSectionProps {
  authUser?: AuthUser | null;
  onAddXp?: (xp: number) => void;
  onOpenPro?: () => void;
}

const CATEGORIES: { id: QuestionCategory; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
  {
    id: 'Foco Diário',
    label: 'Foco Diário',
    icon: <Target className="w-4 h-4 text-amber-400" />,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    desc: 'Elimine distrações, entre em estado de Flow e aumente a produtividade dos estudos.',
  },
  {
    id: 'Gestão de Ansiedade',
    label: 'Gestão de Ansiedade',
    icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    desc: 'Técnicas de respiração, controle do nervosismo e clareza mental para provas.',
  },
  {
    id: 'Autodesenvolvimento',
    label: 'Autodesenvolvimento',
    icon: <Brain className="w-4 h-4 text-purple-400" />,
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300',
    desc: 'Mentalidade de crescimento, superação de erros e resiliência cognitiva.',
  },
  {
    id: 'Reflexões Noturnas',
    label: 'Reflexões Noturnas',
    icon: <Moon className="w-4 h-4 text-sky-400" />,
    color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300',
    desc: 'Descompressão pré-sono, celebração de pequenas vitórias e consolidação da memória.',
  },
];

export const DailyDynamicQuestionsSection: React.FC<DailyDynamicQuestionsSectionProps> = ({
  authUser,
  onAddXp,
  onOpenPro,
}) => {
  const isPro = Boolean(authUser?.isPro);
  const [currentDay, setCurrentDay] = useState<number>(() => getUserJourneyDay());
  const [activeCategory, setActiveCategory] = useState<QuestionCategory>('Foco Diário');
  const [question, setQuestion] = useState<DynamicQuestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userTextAnswer, setUserTextAnswer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Carrega ou gera a pergunta ao trocar de dia ou categoria
  const loadQuestion = async (forceNew = false) => {
    setIsLoading(true);
    setIsAnswered(false);
    setSelectedOption(null);
    setUserTextAnswer('');

    try {
      const q = await generateDynamicAiQuestion({
        categoria: activeCategory,
        diaJornada: currentDay,
        userId: authUser?.id,
        forceNew,
      });
      setQuestion(q);
      // Registra a visualização para memória anti-repetição
      recordQuestionView({
        userId: authUser?.id,
        question: q,
      });
    } catch (e) {
      console.error('Falha ao gerar pergunta dinâmica:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion(false);
  }, [currentDay, activeCategory]);

  const handleSelectDay = (day: number) => {
    // Dias acima de 3 exigem plano Pro
    if (day > 3 && !isPro) {
      onOpenPro?.();
      return;
    }
    setCurrentDay(day);
    setUserJourneyDay(day);
  };

  const handleAnswerSubmit = (optionIndex?: number) => {
    if (isAnswered || !question) return;

    if (optionIndex !== undefined) {
      setSelectedOption(optionIndex);
    }
    setIsAnswered(true);

    // Concede XP ao responder
    if (onAddXp) {
      onAddXp(35);
    }

    // Registra a resposta no histórico de memória
    recordQuestionView({
      userId: authUser?.id,
      question,
      respostaUsuario: optionIndex !== undefined ? question.opcoes?.[optionIndex] : userTextAnswer,
    });
  };

  const handleSpeak = () => {
    if (!question || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${question.tema}. ${question.pergunta}. ${question.contextoProfundo}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    if (!question) return;
    const shareText = `🧠 MenteUp - Dia ${currentDay} do Desafio 30 Dias:\n"${question.pergunta}"\nReflita e evolua sua mente todos os dias!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Cálculo de progresso do desafio
  const progressPercentage = Math.round((currentDay / 30) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header do Desafio 30 Dias */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Desafio de 30 Dias
              </span>
              {isPro ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⭐ Membro Pro
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Dias 1-3 Gratuitos
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Perguntas Diárias Dinâmicas por IA
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Perguntas inéditas geradas em tempo real focadas em autoconhecimento, foco extremo e regulação emocional.
              Com memória anti-repetição para um feed sempre fresco.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-3.5 text-center min-w-[140px] shrink-0">
            <div className="text-xs font-semibold text-slate-400">Progresso do Desafio</div>
            <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-300">
              Dia {currentDay} <span className="text-xs text-slate-500 font-normal">/ 30</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{progressPercentage}% Concluído</div>
          </div>
        </div>

        {/* Trilha Horizontal de Dias (1 a 30) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Selecione o Dia da Sua Jornada:
            </span>
            {!isPro && (
              <button
                type="button"
                onClick={onOpenPro}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" /> Desbloquear todos os 30 dias com Pro
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const isLocked = day > 3 && !isPro;
              const isSelected = day === currentDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`relative shrink-0 w-11 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer font-bold text-xs ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border border-indigo-400'
                      : isLocked
                      ? 'bg-slate-900/60 border border-slate-800/60 text-slate-500 hover:border-slate-700'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-normal opacity-70">D</span>
                  <span>{day}</span>
                  {isLocked && (
                    <Lock className="w-2.5 h-2.5 text-amber-400/80 absolute top-1 right-1" />
                  )}
                  {day < currentDay && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Seleção de Categorias Temáticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? `bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ${cat.color}`
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">{cat.icon}</div>
                {isActive && <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">{cat.label}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{cat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Card Principal da Pergunta Dinâmica */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <div className="text-slate-300 font-semibold text-sm">
              Criando pergunta inédita via IA com filtro anti-repetição...
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Consultando os módulos de alta performance e garantindo uma reflexão profunda e personalizada.
            </p>
          </div>
        ) : question ? (
          <div className="space-y-6">
            {/* Top Bar da Pergunta */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Tema do Dia: {question.tema}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  • ~{question.tempoEstimadoMinutos || 3} min
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpeak}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                  title={isSpeaking ? 'Parar leitura' : 'Ouvir pergunta'}
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
                  title="Compartilhar pergunta"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => loadQuestion(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition cursor-pointer"
                  title="Gerar outra pergunta inédita"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Nova Pergunta IA</span>
                </button>
              </div>
            </div>

            {/* Pergunta em Destaque */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-snug">
                {question.pergunta}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <strong className="text-indigo-300 block mb-1">Fundamento & Contexto Científico:</strong>
                {question.contextoProfundo}
              </p>
            </div>

            {/* Opções de Resposta ou Campo de Reflexão */}
            {question.tipo === 'multipla_escolha' && question.opcoes ? (
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Selecione sua resposta ou identificação:
                </div>
                {question.opcoes.map((opcao, idx) => {
                  const isSelected = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleAnswerSubmit(idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/80 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : isAnswered
                          ? 'bg-slate-950/40 border-slate-800/40 text-slate-500 cursor-default'
                          : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-indigo-500/40 hover:bg-slate-900'
                      }`}
                    >
                      <span>{opcao}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sua reflexão pessoal:
                </div>
                <textarea
                  value={userTextAnswer}
                  onChange={(e) => setUserTextAnswer(e.target.value)}
                  disabled={isAnswered}
                  placeholder="Escreva como você enxerga essa questão no seu dia a dia de estudos..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-60 resize-none"
                />
                {!isAnswered && (
                  <button
                    type="button"
                    onClick={() => handleAnswerSubmit()}
                    disabled={userTextAnswer.trim().length === 0}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Concluir Reflexão & Ganhar +35 XP</span>
                  </button>
                )}
              </div>
            )}

            {/* Insight & Ação Prática após Resposta */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-4 border-t border-slate-800"
                >
                  <div className="bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm mb-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Diagnóstico & Insight da IA:
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {question.respostaSugeridaOuInsight}
                    </p>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                        Ação Prática de Hoje:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                        {question.acaoPraticaDoDia}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Reflexão concluída! +35 XP adicionados ao seu perfil.
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectDay(Math.min(30, currentDay + 1))}
                      className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      <span>Avançar para o Dia {Math.min(30, currentDay + 1)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">
            Nenhuma pergunta disponível no momento. Clique em tentar novamente.
          </div>
        )}
      </div>

      {/* 4. Banner Pro para os usuários do plano gratuito */}
      {!isPro && (
        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Exclusivo Pro Vitalício
              </span>
              <span className="text-xs font-bold text-amber-300">Desafio Completo 30 Dias</span>
            </div>
            <h4 className="text-base font-extrabold text-white">
              Desbloqueie perguntas inéditas todos os dias por apenas R$ 5,00 (Pagamento Único)
            </h4>
            <p className="text-xs text-slate-400">
              Pague uma única vez via Pix e tenha acesso vitalício garantido sem mensalidades.
            </p>
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
  );
};
