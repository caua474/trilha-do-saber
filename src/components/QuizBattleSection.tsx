import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Zap,
  Copy,
  Check,
  Share2,
  Play,
  Trophy,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Users,
  Code2,
  Flame,
  Award,
  Bot,
  UserCheck,
  Crown,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { getRandomOfflineQuestions } from '../data/offlineQuestionBank';
import { saveWrongQuestion } from '../utils/cadernoErros';
import { shuffleQuestionOptions, prepareQuestionsWithFullShuffle } from '../utils/questionShuffle';
import { saveDuelResult } from '../utils/db';
import { DuelResultLog } from '../types';
import { TopDuelosSection } from './TopDuelosSection';
import {
  playQuizSuccessPling,
  playSuccessSound,
  playErrorSound,
  playClickSound,
} from '../utils/audio';

export interface QuizQuestion {
  id: number;
  pergunta: string;
  opcoes: string[];
  resposta_correta_index: number;
  explicacao: string;
}

export interface QuizBattleData {
  tipo_resposta: 'batalha_quiz_x1';
  id_batalha: string;
  materia: string;
  topico: string;
  criador: string;
  recompensa_xp: number;
  questoes: QuizQuestion[];
}

const shuffleQuizBattleQuestions = (questoes: QuizQuestion[]): QuizQuestion[] => {
  return prepareQuestionsWithFullShuffle(questoes, {
    randomizeListOrder: true,
    randomizeStart: true,
    shuffleOptions: true,
  });
};

interface QuizBattleSectionProps {
  onAddXP?: (amount: number) => void;
}

const SUBJECTS = [
  'Biologia & Meio Ambiente',
  'Matemática & Raciocínio',
  'História do Brasil & Geral',
  'Química Orgânica & Geral',
  'Física & Mecânica',
  'Português & Literatura',
  'Geografia & Geopolítica',
  'Simulado Geral ENEM 2026',
];

const LOCAL_BATTLES_KEY = 'gabaritai_x1_battles_v1';

type SubSectionTab = 'duel_arena' | 'top_duelos' | 'history';
type DuelPlayMode = '1v1_local' | '1v1_rival_ia' | '1v1_link';

export const QuizBattleSection: React.FC<QuizBattleSectionProps> = ({ onAddXP }) => {
  // Main sub-section tab navigation
  const [activeSubSection, setActiveSubSection] = useState<SubSectionTab>('duel_arena');

  // Game Mode Selection (Modo 1v1 Local, 1v1 vs Rival IA, 1v1 Link)
  const [duelMode, setDuelMode] = useState<DuelPlayMode>('1v1_local');

  // Configuration State
  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [player1Name, setPlayer1Name] = useState<string>('Você');
  const [player2Name, setPlayer2Name] = useState<string>('Desafiante (Amigo)');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentBattle, setCurrentBattle] = useState<QuizBattleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Battle Arena Game State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isBattleFinished, setIsBattleFinished] = useState<boolean>(false);

  // 1v1 Local Turn-by-Turn state: 'player1' | 'player2'
  const [activeLocalTurn, setActiveLocalTurn] = useState<'player1' | 'player2'>('player1');
  const [p1AnsweredThisRound, setP1AnsweredThisRound] = useState<boolean>(false);
  const [p2AnsweredThisRound, setP2AnsweredThisRound] = useState<boolean>(false);
  const [p1SelectedThisRound, setP1SelectedThisRound] = useState<number | null>(null);
  const [p2SelectedThisRound, setP2SelectedThisRound] = useState<number | null>(null);

  // Saved battles
  const [savedBattles, setSavedBattles] = useState<QuizBattleData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_BATTLES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BATTLES_KEY, JSON.stringify(savedBattles));
    } catch (e) {
      console.error('Erro ao salvar batalhas no localStorage:', e);
    }
  }, [savedBattles]);

  // Question timer
  useEffect(() => {
    if (!isPlaying || isAnswerSubmitted || isBattleFinished) return;

    if (timeLeft <= 0) {
      // Auto submit time out
      if (duelMode === '1v1_local') {
        if (activeLocalTurn === 'player1' && !p1AnsweredThisRound) {
          handleLocalP1Submit(-1);
        } else if (activeLocalTurn === 'player2' && !p2AnsweredThisRound) {
          handleLocalP2Submit(-1);
        }
      } else {
        handleSubmitAnswer(-1);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    isPlaying,
    isAnswerSubmitted,
    isBattleFinished,
    timeLeft,
    duelMode,
    activeLocalTurn,
    p1AnsweredThisRound,
    p2AnsweredThisRound,
  ]);

  const handleOfflineBotDuel = () => {
    playClickSound();
    setIsLoading(true);
    setError(null);
    setCurrentBattle(null);
    setIsPlaying(false);
    setIsBattleFinished(false);

    try {
      const offlineQuestions = getRandomOfflineQuestions(selectedSubject, 5);
      const rawBattleQuestoes: QuizQuestion[] = offlineQuestions.map((q, i) => ({
        id: i + 1,
        pergunta: q.pergunta,
        opcoes: q.opcoes,
        resposta_correta_index: q.resposta_correta_index,
        explicacao: q.explicacao,
      }));

      const battleData: QuizBattleData = {
        tipo_resposta: 'batalha_quiz_x1',
        id_batalha: 'OFFLINE_1V1_' + Date.now().toString().slice(-4),
        materia: selectedSubject,
        topico: customTopic.trim() || 'Duelo 1v1 (Banco Local)',
        criador: player1Name.trim() || 'Você',
        recompensa_xp: 100,
        questoes: shuffleQuizBattleQuestions(rawBattleQuestoes),
      };

      setCurrentBattle(battleData);
      setSavedBattles((prev) => [battleData, ...prev.slice(0, 9)]);
      startBattleSession(battleData);
    } catch (e) {
      console.error('Erro ao gerar duelo offline:', e);
      setError('Erro ao carregar banco local de questões offline.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBattle = async () => {
    playClickSound();
    if (!navigator.onLine) {
      handleOfflineBotDuel();
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentBattle(null);
    setIsPlaying(false);
    setIsBattleFinished(false);

    try {
      const response = await fetch('/api/generate-quiz-battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materia: selectedSubject,
          topico: customTopic.trim() || 'Desafio 1v1 ENEM e Vestibulares',
          criador: player1Name.trim() || 'Você',
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Erro ao gerar batalha.');
      }

      const rawBattleData: QuizBattleData = json.data;
      const battleData: QuizBattleData = {
        ...rawBattleData,
        questoes: shuffleQuizBattleQuestions(rawBattleData.questoes || []),
      };
      setCurrentBattle(battleData);
      setSavedBattles((prev) => [battleData, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('Erro ao conectar via IA, ativando Bot Offline:', err);
      handleOfflineBotDuel();
    } finally {
      setIsLoading(false);
    }
  };

  const startBattleSession = (battle: QuizBattleData) => {
    setCurrentBattle({
      ...battle,
      questoes: shuffleQuizBattleQuestions(battle.questoes),
    });
    setIsPlaying(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setTimeLeft(20);
    setIsBattleFinished(false);
    setActiveLocalTurn('player1');
    setP1AnsweredThisRound(false);
    setP2AnsweredThisRound(false);
    setP1SelectedThisRound(null);
    setP2SelectedThisRound(null);
  };

  const getShareableLink = (battleId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/?battle=${battleId}&materia=${encodeURIComponent(selectedSubject)}`;
  };

  const handleCopyLink = () => {
    if (!currentBattle) return;
    playClickSound();
    const link = getShareableLink(currentBattle.id_batalha);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyJson = () => {
    if (!currentBattle) return;
    playClickSound();
    navigator.clipboard.writeText(JSON.stringify(currentBattle, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  // Solo / Rival IA mode submission
  const handleSubmitAnswer = (optionIdx: number) => {
    if (isAnswerSubmitted || !currentBattle) return;

    setSelectedOption(optionIdx);
    setIsAnswerSubmitted(true);

    const question = currentBattle.questoes[currentQuestionIndex];
    const isCorrect = optionIdx === question.resposta_correta_index;

    if (isCorrect) {
      playSuccessSound();
      setPlayer1Score((prev) => prev + 1);
    } else {
      playErrorSound();
      saveWrongQuestion({
        materia: currentBattle.materia,
        topico: currentBattle.topico,
        pergunta: question.pergunta,
        opcoes: question.opcoes,
        resposta_correta_index: question.resposta_correta_index,
        resposta_usuario_index: optionIdx,
        explicacao: question.explicacao,
      });
    }

    // Simulate rival AI response (65% accuracy)
    const rivalIsCorrect = Math.random() < 0.65;
    if (rivalIsCorrect) {
      setPlayer2Score((prev) => prev + 1);
    }
  };

  // 1v1 Local Turn-Based Player 1
  const handleLocalP1Submit = (optionIdx: number) => {
    if (p1AnsweredThisRound || !currentBattle) return;

    setP1SelectedThisRound(optionIdx);
    setP1AnsweredThisRound(true);

    const question = currentBattle.questoes[currentQuestionIndex];
    const isCorrect = optionIdx === question.resposta_correta_index;

    if (isCorrect) {
      playSuccessSound();
      setPlayer1Score((prev) => prev + 1);
    } else {
      playErrorSound();
      saveWrongQuestion({
        materia: currentBattle.materia,
        topico: currentBattle.topico,
        pergunta: question.pergunta,
        opcoes: question.opcoes,
        resposta_correta_index: question.resposta_correta_index,
        resposta_usuario_index: optionIdx,
        explicacao: question.explicacao,
      });
    }

    // Switch turn to Player 2
    setActiveLocalTurn('player2');
    setTimeLeft(20);
  };

  // 1v1 Local Turn-Based Player 2
  const handleLocalP2Submit = (optionIdx: number) => {
    if (p2AnsweredThisRound || !currentBattle) return;

    setP2SelectedThisRound(optionIdx);
    setP2AnsweredThisRound(true);
    setIsAnswerSubmitted(true);

    const question = currentBattle.questoes[currentQuestionIndex];
    const isCorrect = optionIdx === question.resposta_correta_index;

    if (isCorrect) {
      playSuccessSound();
      setPlayer2Score((prev) => prev + 1);
    } else {
      playErrorSound();
    }
  };

  const handleNextQuestion = async () => {
    if (!currentBattle) return;
    playClickSound();

    if (currentQuestionIndex + 1 < currentBattle.questoes.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(20);
      setActiveLocalTurn('player1');
      setP1AnsweredThisRound(false);
      setP2AnsweredThisRound(false);
      setP1SelectedThisRound(null);
      setP2SelectedThisRound(null);
    } else {
      // Battle Finished -> Save to IndexedDB & Trigger sounds / XP
      setIsBattleFinished(true);
      setIsPlaying(false);
      playQuizSuccessPling();

      const finalWinner =
        player1Score > player2Score
          ? 'player1'
          : player2Score > player1Score
          ? 'player2'
          : 'tie';

      const duelLog: DuelResultLog = {
        id: 'duel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        battleId: currentBattle.id_batalha,
        materia: currentBattle.materia,
        topico: currentBattle.topico,
        mode: duelMode,
        player1Name: player1Name.trim() || 'Você',
        player1Score,
        player2Name:
          duelMode === '1v1_local'
            ? player2Name.trim() || 'Jogador 2'
            : 'Rival IA (Arena)',
        player2Score,
        totalQuestions: currentBattle.questoes.length,
        winner: finalWinner,
        xpAwarded: 100,
        createdAt: new Date().toISOString(),
      };

      try {
        await saveDuelResult(duelLog);
      } catch (err) {
        console.warn('Erro ao salvar resultado do duelo no IndexedDB:', err);
      }

      if (onAddXP) {
        onAddXP(100);
      }
    }
  };

  // Comparative percentages for Tug-of-War bar
  const totalDuelPoints = player1Score + player2Score;
  let p1BarPercent = 50;
  let p2BarPercent = 50;
  if (totalDuelPoints > 0) {
    p1BarPercent = Math.max(10, Math.min(90, Math.round((player1Score / totalDuelPoints) * 100)));
    p2BarPercent = 100 - p1BarPercent;
  }

  return (
    <div id="quiz-battle-section-root" className="space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP SUB-SECTION NAVIGATION BAR */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => {
              playClickSound();
              setActiveSubSection('duel_arena');
            }}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
              activeSubSection === 'duel_arena'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Modo 1v1 & Criador</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubSection('top_duelos');
            }}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
              activeSubSection === 'top_duelos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Duelos da Semana</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubSection('history');
            }}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-black text-xs transition flex items-center gap-2 cursor-pointer ${
              activeSubSection === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Batalhas Salvas ({savedBattles.length})</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
          <Zap className="w-3.5 h-3.5 fill-amber-500" />
          <span>+100 XP por Duelo Vencido</span>
        </div>
      </div>

      {/* 2. SUB-SECTION: TOP DUELOS (CONSUMINDO DADOS DO BANCO LOCAL) */}
      {activeSubSection === 'top_duelos' && (
        <TopDuelosSection
          currentUserName={player1Name}
          onStart1v1Duel={() => setActiveSubSection('duel_arena')}
        />
      )}

      {/* 3. SUB-SECTION: CRIADOR & ARENA DE DUELO 1V1 */}
      {activeSubSection === 'duel_arena' && (
        <div className="space-y-6">
          {/* HEADER BANNER */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Swords className="w-3 h-3 fill-slate-950" /> Modo 1v1 Oficial
                  </span>
                  <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    batalha_quiz_x1 JSON
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ⚔️ Duelo 1v1 & Desafios da Arena
                </h2>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Dispute duelos 1v1 em tempo real no mesmo aparelho (Pass & Play), enfrente bots inteligentes do banco local ou gere links para desafiar seus amigos no WhatsApp!
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center space-x-4 shrink-0 shadow-inner">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
                  ⚡
                </div>
                <div>
                  <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                    Recompensa
                  </span>
                  <span className="text-lg font-black text-white">+100 XP Bônus</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1V1 MODE SELECTOR TILES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                playClickSound();
                setDuelMode('1v1_local');
              }}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer space-y-2.5 ${
                duelMode === '1v1_local'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 shadow-lg ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md">
                  👥
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    duelMode === '1v1_local'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  2 Jogadores
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Modo 1v1 Local (Pass & Play)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  Dois estudantes no mesmo dispositivo alternando turnos e disputando o placar.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setDuelMode('1v1_rival_ia');
              }}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer space-y-2.5 ${
                duelMode === '1v1_rival_ia'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 shadow-lg ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md">
                  🤖
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    duelMode === '1v1_rival_ia'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  Vs Bot IA
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Modo 1v1 vs Rival IA
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  Duelo rápido contra oponentes simulados com taxa de acertos realista.
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setDuelMode('1v1_link');
              }}
              className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer space-y-2.5 ${
                duelMode === '1v1_link'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 shadow-lg ring-2 ring-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                  🔗
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    duelMode === '1v1_link'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  Link & JSON
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Desafio 1v1 com Link
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                  Gere o código único e envie o link para amigos disputarem a mesma bateria.
                </p>
              </div>
            </button>
          </div>

          {/* GENERATION CONTROL CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                1️⃣
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Configurar Duelo 1v1
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {duelMode === '1v1_local'
                    ? 'Configure os nomes dos dois competidores e escolha a matéria'
                    : 'Escolha a matéria, foco e crie o desafio de 5 questões'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Matéria Principal
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Topic Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tópico Específico (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Genética, Eletrodinâmica, República Velha..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Player 1 Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {duelMode === '1v1_local' ? 'Nome do Jogador 1' : 'Seu Apelido no Duelo'}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Você, Lucas, Ana"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Player 2 Name (If Local 1v1) */}
              {duelMode === '1v1_local' && (
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Nome do Jogador 2 (Desafiante / Amigo)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amigo, Gabriel, Rafaela"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleGenerateBattle}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black text-xs sm:text-sm transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gerando Duelo 1v1 via IA...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5 text-amber-400" />
                    <span>Gerar Duelo 1v1 Online (+100 XP)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOfflineBotDuel}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                <Bot className="w-5 h-5 text-amber-300" />
                <span>🤖 Iniciar Duelo 1v1 Rápido (Banco Local)</span>
              </button>
            </div>
          </div>

          {/* GENERATED BATTLE PANEL & ACTIONS */}
          {currentBattle && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* LINK & ACTIONS PANEL */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 text-white shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        ID: {currentBattle.id_batalha}
                      </span>
                      <span className="text-xs text-amber-300 font-extrabold">
                        {currentBattle.materia}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">{currentBattle.topico}</h3>
                  </div>

                  <button
                    onClick={() => startBattleSession(currentBattle)}
                    className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shrink-0 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Disputar Duelo 1v1 Agora!</span>
                  </button>
                </div>

                {/* SHARE LINK BOX */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" /> Link Único para o Amigo:
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950/80 border border-indigo-700 rounded-2xl p-2">
                    <input
                      type="text"
                      readOnly
                      value={getShareableLink(currentBattle.id_batalha)}
                      className="bg-transparent flex-1 px-3 text-xs font-mono text-indigo-200 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* JSON DISPLAY */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-400" /> Estrutura batalha_quiz_x1 JSON:
                    </label>

                    <button
                      onClick={handleCopyJson}
                      className="text-xs font-bold text-amber-300 hover:text-amber-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedJson ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>JSON Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar JSON Completo</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40 leading-relaxed scrollbar-thin">
                    {JSON.stringify(currentBattle, null, 2)}
                  </pre>
                </div>
              </div>

              {/* 4. INTERACTIVE 1V1 BATTLE ARENA SCREEN */}
              {isPlaying && (
                <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                  {/* BATTLE TOP HUD: ROUND COUNTER + TIMER + TUG-OF-WAR PROGRESS */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Questão {currentQuestionIndex + 1} de {currentBattle.questoes.length}
                        </span>
                        <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                          {currentBattle.materia}
                        </span>
                      </div>

                      {/* COUNTDOWN TIMER */}
                      <div
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs sm:text-sm border transition-all ${
                          timeLeft <= 5
                            ? 'bg-rose-500/25 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/40'
                            : 'bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <Clock
                          className={`w-4 h-4 ${
                            timeLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-slate-400'
                          }`}
                        />
                        <span>{timeLeft}s restantes</span>
                      </div>
                    </div>

                    {/* COMPARATIVE PLAYERS HUD */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Player 1 */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-indigo-400 flex items-center justify-center font-black text-xs text-white">
                          P1
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black text-white block">
                            {player1Name.trim() || 'Jogador 1'}
                          </span>
                          <span className="text-xs font-black text-emerald-400">
                            {player1Score} pts
                          </span>
                        </div>
                      </div>

                      {/* VS Center Marker */}
                      <div className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          DUELO 1v1
                        </span>
                      </div>

                      {/* Player 2 */}
                      <div className="flex items-center gap-3 flex-row-reverse text-right">
                        <div className="w-10 h-10 rounded-xl bg-rose-600 border-2 border-rose-400 flex items-center justify-center font-black text-xs text-white">
                          {duelMode === '1v1_local' ? 'P2' : 'IA'}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black text-white block">
                            {duelMode === '1v1_local'
                              ? player2Name.trim() || 'Jogador 2'
                              : 'Rival IA'}
                          </span>
                          <span className="text-xs font-black text-rose-400">
                            {player2Score} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TUG-OF-WAR COMPARATIVE PROGRESS BAR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                        <span className="text-indigo-400">{player1Name}: {p1BarPercent}%</span>
                        <span className="text-rose-400">
                          {duelMode === '1v1_local' ? player2Name : 'Rival IA'}: {p2BarPercent}%
                        </span>
                      </div>
                      <div className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden flex shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 transition-all duration-500 ease-out"
                          style={{ width: `${p1BarPercent}%` }}
                        />
                        <div className="w-0.5 h-full bg-white/40 z-10" />
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-600 transition-all duration-500 ease-out"
                          style={{ width: `${p2BarPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1V1 LOCAL TURN BANNER */}
                  {duelMode === '1v1_local' && !isAnswerSubmitted && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-black flex items-center justify-between ${
                        activeLocalTurn === 'player1'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                          : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          👉 Vez de responder:{' '}
                          <strong className="underline">
                            {activeLocalTurn === 'player1'
                              ? player1Name.trim() || 'Jogador 1'
                              : player2Name.trim() || 'Jogador 2'}
                          </strong>
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold">
                        {activeLocalTurn === 'player1' ? 'Passo 1/2' : 'Passo 2/2'}
                      </span>
                    </div>
                  )}

                  {/* QUESTION BODY */}
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {currentBattle.questoes[currentQuestionIndex].pergunta}
                    </h4>

                    {/* OPTIONS LIST */}
                    <div className="space-y-2.5">
                      {currentBattle.questoes[currentQuestionIndex].opcoes.map((opt, optionIdx) => {
                        const isCorrectOption =
                          optionIdx ===
                          currentBattle.questoes[currentQuestionIndex].resposta_correta_index;

                        // Styling for options based on game mode and answers
                        let btnStyle =
                          'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

                        if (isAnswerSubmitted) {
                          if (isCorrectOption) {
                            btnStyle =
                              'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300';
                          } else if (
                            (selectedOption === optionIdx ||
                              p1SelectedThisRound === optionIdx ||
                              p2SelectedThisRound === optionIdx) &&
                            !isCorrectOption
                          ) {
                            btnStyle = 'bg-rose-500 text-white border-rose-600';
                          } else {
                            btnStyle =
                              'bg-slate-100 dark:bg-slate-900 opacity-50 border-transparent';
                          }
                        }

                        const handleOptionClick = () => {
                          if (duelMode === '1v1_local') {
                            if (activeLocalTurn === 'player1' && !p1AnsweredThisRound) {
                              handleLocalP1Submit(optionIdx);
                            } else if (activeLocalTurn === 'player2' && !p2AnsweredThisRound) {
                              handleLocalP2Submit(optionIdx);
                            }
                          } else {
                            handleSubmitAnswer(optionIdx);
                          }
                        };

                        return (
                          <button
                            key={optionIdx}
                            onClick={handleOptionClick}
                            disabled={
                              isAnswerSubmitted ||
                              (duelMode === '1v1_local' &&
                                activeLocalTurn === 'player1' &&
                                p1AnsweredThisRound)
                            }
                            className={`w-full text-left p-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswerSubmitted && isCorrectOption && (
                              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                            )}
                            {isAnswerSubmitted &&
                              (selectedOption === optionIdx ||
                                p1SelectedThisRound === optionIdx ||
                                p2SelectedThisRound === optionIdx) &&
                              !isCorrectOption && (
                                <XCircle className="w-5 h-5 text-white shrink-0" />
                              )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* EXPLANATION & NEXT BUTTON */}
                  {isAnswerSubmitted && (
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-extrabold text-xs">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          <span>Gabarito Comentado da Gabi:</span>
                        </div>

                        {duelMode === '1v1_local' && (
                          <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-3">
                            <span>
                              {player1Name}:{' '}
                              {p1SelectedThisRound ===
                              currentBattle.questoes[currentQuestionIndex].resposta_correta_index ? (
                                <strong className="text-emerald-500">Acertou (+1)</strong>
                              ) : (
                                <strong className="text-rose-500">Errou</strong>
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              {player2Name}:{' '}
                              {p2SelectedThisRound ===
                              currentBattle.questoes[currentQuestionIndex].resposta_correta_index ? (
                                <strong className="text-emerald-500">Acertou (+1)</strong>
                              ) : (
                                <strong className="text-rose-500">Errou</strong>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {currentBattle.questoes[currentQuestionIndex].explicacao}
                      </p>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <span>
                            {currentQuestionIndex + 1 < currentBattle.questoes.length
                              ? 'Próxima Questão ➔'
                              : 'Ver Resultado Final 🏆'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BATTLE VICTORY / FINAL RESULTS SCREEN */}
              {isBattleFinished && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 rounded-3xl p-8 text-white text-center space-y-6 shadow-2xl animate-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 mx-auto flex items-center justify-center text-4xl shadow-xl">
                    🏆
                  </div>

                  <div className="space-y-2">
                    <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full">
                      Duelo 1v1 Finalizado!
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">
                      {player1Score > player2Score
                        ? `🎉 Vitória de ${player1Name}!`
                        : player2Score > player1Score
                        ? `👑 Vitória de ${
                            duelMode === '1v1_local' ? player2Name : 'Rival IA'
                          }!`
                        : '⚖️ Duelo Empatado!'}
                    </h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Resultado salvo com sucesso no banco de dados local da Arena! Pontos e XP computados na tabela semanal.
                    </p>
                  </div>

                  <div className="flex justify-center items-center space-x-8 py-4 border-y border-indigo-800/80 max-w-sm mx-auto">
                    <div>
                      <span className="text-xs text-indigo-300 font-bold uppercase block">
                        {player1Name}
                      </span>
                      <span className="text-3xl font-black text-emerald-400">
                        {player1Score}/5
                      </span>
                    </div>
                    <div className="text-slate-500 font-black text-lg">VS</div>
                    <div>
                      <span className="text-xs text-rose-300 font-bold uppercase block">
                        {duelMode === '1v1_local' ? player2Name : 'Rival IA'}
                      </span>
                      <span className="text-3xl font-black text-rose-400">{player2Score}/5</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => startBattleSession(currentBattle)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Revanche Imediata</span>
                    </button>

                    <button
                      onClick={() => setActiveSubSection('top_duelos')}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Ver Posição no Top Duelos</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-SECTION: HISTÓRICO DE BATALHAS SALVAS LOCALMENTE */}
      {activeSubSection === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Histórico de Batalhas 1v1 Geradas ({savedBattles.length})
              </h3>
            </div>

            <button
              onClick={() => setActiveSubSection('duel_arena')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Criar Nova Batalha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedBattles.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs text-slate-500">Nenhuma batalha salva no histórico ainda.</p>
              <button
                onClick={() => setActiveSubSection('duel_arena')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Gerar Primeira Batalha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedBattles.map((b) => (
                <div
                  key={b.id_batalha}
                  onClick={() => {
                    setCurrentBattle(b);
                    setActiveSubSection('duel_arena');
                    setIsPlaying(false);
                    setIsBattleFinished(false);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                      {b.id_batalha}
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      <Flame className="w-3 h-3" /> 5 Questões
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {b.topico}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Matéria: {b.materia}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default QuizBattleSection;
