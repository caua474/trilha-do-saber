import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Zap,
  Users,
  Trophy,
  Crown,
  Flame,
  Clock,
  Sparkles,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Bot,
  UserCheck,
  Shield,
  Award,
  ChevronRight,
  TrendingUp,
  X,
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { OFFLINE_QUESTION_BANK, OfflineQuestion } from '../data/offlineQuestionBank';
import { shuffleQuestionOptions } from '../utils/questionShuffle';
import {
  playClickSound,
  playSuccessSound,
  playErrorSound,
  playQuizSuccessPling
} from '../utils/audio';
import { saveDuelResult, getAllDuelResults } from '../utils/db';
import { DuelResultLog, DuelRoundScore } from '../types';
import { ArenaBattleHeader } from './ArenaBattleHeader';
import { ArenaMyDuelsTab } from './ArenaMyDuelsTab';
import { DuelRoundScoreModal } from './DuelRoundScoreModal';

export interface ArenaUserStats {
  elo: string;
  patente: string;
  pontosElo: number;
  vitorias: number;
  derrotas: number;
  streak: number;
  xpTotal: number;
  quizDiarioConcluidoHoje: boolean;
}

export interface LeaderboardCompetitor {
  id: string;
  posicao: number;
  nome: string;
  avatar: string;
  elo: string;
  xp: number;
  vitorias: number;
  curso: string;
  uf: string;
  isCurrentUser?: boolean;
}

const ARENA_STATS_STORAGE_KEY = 'gabaritai_arena_x1_stats_v2';

const DEFAULT_ARENA_STATS: ArenaUserStats = {
  elo: 'Ouro II',
  patente: 'Bixo Federal',
  pontosElo: 1420,
  vitorias: 28,
  derrotas: 7,
  streak: 4,
  xpTotal: 3850,
  quizDiarioConcluidoHoje: false,
};

const LEADERBOARD_TOP10: LeaderboardCompetitor[] = [
  {
    id: 'lead_1',
    posicao: 1,
    nome: 'Lucas Ferreira',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    elo: 'Mestre Federal',
    xp: 5420,
    vitorias: 74,
    curso: 'Medicina • USP',
    uf: 'SP',
  },
  {
    id: 'lead_2',
    posicao: 2,
    nome: 'Mariana Souza',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    elo: 'Diamante I',
    xp: 4890,
    vitorias: 63,
    curso: 'Direito • UFMG',
    uf: 'MG',
  },
  {
    id: 'lead_3',
    posicao: 3,
    nome: 'Gabriel Pires',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    elo: 'Diamante II',
    xp: 4350,
    vitorias: 56,
    curso: 'Eng. Computação • ITA',
    uf: 'RJ',
  },
  {
    id: 'lead_4',
    posicao: 4,
    nome: 'Beatriz Lima',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    elo: 'Platina I',
    xp: 3980,
    vitorias: 49,
    curso: 'Psicologia • UnB',
    uf: 'DF',
  },
  {
    id: 'lead_5',
    posicao: 5,
    nome: 'Você (Gabaritador)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    elo: 'Bixo Federal',
    xp: 3850,
    vitorias: 28,
    curso: 'Medicina • SISU',
    uf: 'BR',
    isCurrentUser: true,
  },
  {
    id: 'lead_6',
    posicao: 6,
    nome: 'Rafael Castilho',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    elo: 'Platina II',
    xp: 3620,
    vitorias: 44,
    curso: 'Ciência da Comp. • UFPE',
    uf: 'PE',
  },
  {
    id: 'lead_7',
    posicao: 7,
    nome: 'Camila Duarte',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    elo: 'Ouro I',
    xp: 3410,
    vitorias: 39,
    curso: 'Odontologia • UFRGS',
    uf: 'RS',
  },
  {
    id: 'lead_8',
    posicao: 8,
    nome: 'Matheus Alencar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    elo: 'Ouro I',
    xp: 3190,
    vitorias: 35,
    curso: 'Arquitetura • UFBA',
    uf: 'BA',
  },
  {
    id: 'lead_9',
    posicao: 9,
    nome: 'Juliana Mendes',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    elo: 'Ouro II',
    xp: 2980,
    vitorias: 31,
    curso: 'Biomedicina • UNIFESP',
    uf: 'SP',
  },
  {
    id: 'lead_10',
    posicao: 10,
    nome: 'Pedro Henrique',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    elo: 'Ouro III',
    xp: 2750,
    vitorias: 29,
    curso: 'Engenharia Civil • UFPR',
    uf: 'PR',
  },
];

export interface OpponentData {
  nome: string;
  avatar: string;
  elo: string;
  curso: string;
  isBot?: boolean;
}

export interface BattleRoundQuestion {
  id: string;
  materia: string;
  topico: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta_index: number;
  explicacao: string;
}

interface ArenaX1SectionProps {
  onAddXP?: (amount: number) => void;
  userStatsProp?: ArenaUserStats;
}

export const ArenaX1Section: React.FC<ArenaX1SectionProps> = ({ onAddXP }) => {
  // User Stats & Persistence
  const [userStats, setUserStats] = useState<ArenaUserStats>(() => {
    try {
      const saved = localStorage.getItem(ARENA_STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler dados da Arena:', e);
    }
    return DEFAULT_ARENA_STATS;
  });

  const saveStats = (newStats: ArenaUserStats) => {
    setUserStats(newStats);
    try {
      localStorage.setItem(ARENA_STATS_STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error('Erro ao salvar dados da Arena:', e);
    }
  };

  // Game Mode States
  type GameMode = 'idle' | 'matchmaking' | 'battle' | 'finished';
  const [gameState, setGameState] = useState<GameMode>('idle');
  const [currentModeType, setCurrentModeType] = useState<'amigo' | 'rapida' | 'diario'>('rapida');
  
  // Main Tab Navigation: 'arena' (Modes & Leaderboard) vs 'meus_duelos' (1v1 History & Round Scores)
  const [activeMainTab, setActiveMainTab] = useState<'arena' | 'meus_duelos'>('arena');
  const [duelHistory, setDuelHistory] = useState<DuelResultLog[]>([]);
  const [selectedDuelForModal, setSelectedDuelForModal] = useState<DuelResultLog | null>(null);
  const [duelFilter, setDuelFilter] = useState<'todos' | 'vitorias' | 'derrotas' | 'amigos' | 'ranqueadas'>('todos');
  const [duelSearchQuery, setDuelSearchQuery] = useState<string>('');
  const [currentRoundsScores, setCurrentRoundsScores] = useState<DuelRoundScore[]>([]);

  // Load duels from IndexedDB
  const loadDuelHistory = async () => {
    try {
      const records = await getAllDuelResults();
      if (records && records.length > 0) {
        setDuelHistory(records);
      } else {
        // Seed initial history if clean
        const seedDuels: DuelResultLog[] = [
          {
            id: 'duel_seed_1',
            battleId: 'ARENA_RANQUEADA',
            materia: 'Biologia',
            topico: 'Arena X1 - Genética e Ecologia',
            mode: 'arena_ranqueada',
            player1Name: 'Você',
            player1Score: 4,
            player2Name: 'Mariana Souza',
            player2Score: 3,
            player2Avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            player2Course: 'Direito • UFMG',
            player2Elo: 'Diamante I',
            totalQuestions: 5,
            winner: 'player1',
            xpAwarded: 180,
            createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
            roundsDetail: [
              { roundNumber: 1, questionTopic: 'Biologia Celular', questionPreview: 'Processo de transcrição e tradução no RNA mensageiro', player1Correct: true, player2Correct: true, player1Points: 85, player2Points: 72, timeTakenSeconds: 3 },
              { roundNumber: 2, questionTopic: 'Ecologia', questionPreview: 'Relações ecológicas desarmônicas e parasitismo', player1Correct: true, player2Correct: false, player1Points: 92, player2Points: 0, timeTakenSeconds: 2 },
              { roundNumber: 3, questionTopic: 'Genética', questionPreview: 'Segunda Lei de Mendel e segregação independente', player1Correct: false, player2Correct: true, player1Points: 0, player2Points: 80, timeTakenSeconds: 12 },
              { roundNumber: 4, questionTopic: 'Evolução', questionPreview: 'Seleção natural darwiniana vs lamarckismo', player1Correct: true, player2Correct: true, player1Points: 88, player2Points: 85, timeTakenSeconds: 3 },
              { roundNumber: 5, questionTopic: 'Fisiologia Humana', questionPreview: 'Sistema cardiovascular e circulação sistêmica', player1Correct: true, player2Correct: false, player1Points: 95, player2Points: 0, timeTakenSeconds: 2 }
            ]
          },
          {
            id: 'duel_seed_2',
            battleId: 'ARENA_AMIGO',
            materia: 'Matemática',
            topico: 'Arena X1 - Geometria Espacial & Funções',
            mode: '1v1_amigo',
            player1Name: 'Você',
            player1Score: 5,
            player2Name: 'Gabriel Pires',
            player2Score: 4,
            player2Avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            player2Course: 'Eng. Comp. • ITA',
            player2Elo: 'Diamante II',
            totalQuestions: 5,
            winner: 'player1',
            xpAwarded: 180,
            createdAt: new Date(Date.now() - 3600000 * 16).toISOString(),
            roundsDetail: [
              { roundNumber: 1, questionTopic: 'Geometria Plana', questionPreview: 'Teorema de Pitágoras aplicado a trapézios', player1Correct: true, player2Correct: true, player1Points: 80, player2Points: 75, timeTakenSeconds: 4 },
              { roundNumber: 2, questionTopic: 'Função Quadrática', questionPreview: 'Cálculo de vértice e ponto de máximo/mínimo', player1Correct: true, player2Correct: true, player1Points: 90, player2Points: 65, timeTakenSeconds: 2 },
              { roundNumber: 3, questionTopic: 'Probabilidade', questionPreview: 'Probabilidade condicional em lançamentos de dados', player1Correct: true, player2Correct: true, player1Points: 85, player2Points: 82, timeTakenSeconds: 3 },
              { roundNumber: 4, questionTopic: 'Logaritmos', questionPreview: 'Propriedades de mudança de base e expoentes', player1Correct: true, player2Correct: false, player1Points: 78, player2Points: 0, timeTakenSeconds: 6 },
              { roundNumber: 5, questionTopic: 'Trigonometria', questionPreview: 'Relação fundamental e círculo trigonométrico', player1Correct: true, player2Correct: true, player1Points: 89, player2Points: 90, timeTakenSeconds: 2 }
            ]
          },
          {
            id: 'duel_seed_3',
            battleId: 'ARENA_RANQUEADA',
            materia: 'Química',
            topico: 'Arena X1 - Estequiometria & Termoquímica',
            mode: 'arena_ranqueada',
            player1Name: 'Você',
            player1Score: 2,
            player2Name: 'Beatriz Lima',
            player2Score: 4,
            player2Avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            player2Course: 'Psicologia • UnB',
            player2Elo: 'Platina I',
            totalQuestions: 5,
            winner: 'player2',
            xpAwarded: 50,
            createdAt: new Date(Date.now() - 3600000 * 34).toISOString(),
            roundsDetail: [
              { roundNumber: 1, questionTopic: 'Química Orgânica', questionPreview: 'Identificação de funções oxigenadas e álcoois', player1Correct: true, player2Correct: true, player1Points: 70, player2Points: 85, timeTakenSeconds: 6 },
              { roundNumber: 2, questionTopic: 'Estequiometria', questionPreview: 'Rendimento de reação com reagente em excesso', player1Correct: false, player2Correct: true, player1Points: 0, player2Points: 90, timeTakenSeconds: 18 },
              { roundNumber: 3, questionTopic: 'Termoquímica', questionPreview: 'Variação de entalpia e Lei de Hess', player1Correct: true, player2Correct: true, player1Points: 85, player2Points: 70, timeTakenSeconds: 3 },
              { roundNumber: 4, questionTopic: 'Eletroquímica', questionPreview: 'Pilha de Daniell e cálculo de ddp', player1Correct: false, player2Correct: true, player1Points: 0, player2Points: 75, timeTakenSeconds: 15 },
              { roundNumber: 5, questionTopic: 'Cinética Química', questionPreview: 'Fatores que alteram a velocidade da reação', player1Correct: false, player2Correct: true, player1Points: 0, player2Points: 80, timeTakenSeconds: 14 }
            ]
          }
        ];
        setDuelHistory(seedDuels);
        for (const duel of seedDuels) {
          await saveDuelResult(duel);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico de duelos:', e);
    }
  };

  useEffect(() => {
    loadDuelHistory();
  }, [gameState]);
  
  // Friend Challenge Modal
  const [isFriendModalOpen, setIsFriendModalOpen] = useState<boolean>(false);
  const [friendRoomCode, setFriendRoomCode] = useState<string>('');
  const [hasCopiedLink, setHasCopiedLink] = useState<boolean>(false);

  // Matchmaking State
  const [matchmakingSeconds, setMatchmakingSeconds] = useState<number>(0);
  const [opponent, setOpponent] = useState<OpponentData | null>(null);

  // Battle In-Game State
  const [questions, setQuestions] = useState<BattleRoundQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRoundAnswered, setIsRoundAnswered] = useState<boolean>(false);
  
  // Scores
  const [userPoints, setUserPoints] = useState<number>(0);
  const [rivalPoints, setRivalPoints] = useState<number>(0);
  const [userRoundsWon, setUserRoundsWon] = useState<boolean[]>([]);
  const [rivalRoundsWon, setRivalRoundsWon] = useState<boolean[]>([]);
  const [rivalStatusText, setRivalStatusText] = useState<string>('Pensando...');

  // Timer: 20s per question
  const QUESTION_MAX_TIME = 20;
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_MAX_TIME);
  const timerRef = useRef<any>(null);

  // Handle Matchmaking Simulation
  useEffect(() => {
    let interval: any;
    if (gameState === 'matchmaking') {
      setMatchmakingSeconds(0);
      interval = setInterval(() => {
        setMatchmakingSeconds((prev) => prev + 1);
      }, 1000);

      // Match found after 2.5 seconds
      const timeout = setTimeout(() => {
        const potentialOpponents: OpponentData[] = [
          {
            nome: 'Mariana Souza',
            avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            elo: 'Diamante I',
            curso: 'Direito • UFMG',
          },
          {
            nome: 'Gabriel Pires',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
            elo: 'Diamante II',
            curso: 'Eng. Comp. • ITA',
          },
          {
            nome: 'Beatriz Lima',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            elo: 'Platina I',
            curso: 'Psicologia • UnB',
          },
          {
            nome: 'Rafael Castilho',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            elo: 'Platina II',
            curso: 'Ciência da Comp. • UFPE',
          },
        ];
        const randomOpp = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
        setOpponent(randomOpp);
        startBattleGame(randomOpp);
      }, 2400);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [gameState]);

  // Question Timer Countdown
  useEffect(() => {
    if (gameState === 'battle' && !isRoundAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, isRoundAnswered, timeLeft, currentQuestionIndex]);

  // Generate Questions for Battle
  const generateBattleQuestions = (count = 5): BattleRoundQuestion[] => {
    const shuffled = [...OFFLINE_QUESTION_BANK].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    return selected.map((q) => {
      const shuffledOptions = shuffleQuestionOptions(q.opcoes, q.resposta_correta_index);
      return {
        id: q.id,
        materia: q.materia,
        topico: q.topico,
        pergunta: q.pergunta,
        opcoes: shuffledOptions.options,
        resposta_correta_index: shuffledOptions.correctIndex,
        explicacao: q.explicacao,
      };
    });
  };

  // Start Quick Match
  const handleStartQuickMatch = () => {
    playClickSound();
    setCurrentModeType('rapida');
    setGameState('matchmaking');
  };

  // Start Daily Quiz Battle
  const handleStartDailyQuiz = () => {
    playClickSound();
    setCurrentModeType('diario');
    const gabiOpponent: OpponentData = {
      nome: 'Gabi IA Bot (Treino)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      elo: 'Mestre ENEM',
      curso: 'Gabarito Oficial',
      isBot: true,
    };
    setOpponent(gabiOpponent);
    startBattleGame(gabiOpponent);
  };

  // Create Friend Challenge
  const handleOpenFriendChallenge = () => {
    playClickSound();
    const randomCode = `X1-${Math.floor(1000 + Math.random() * 9000)}`;
    setFriendRoomCode(randomCode);
    setIsFriendModalOpen(true);
    setHasCopiedLink(false);
  };

  // Start Friend Battle
  const handleStartFriendBattle = () => {
    setIsFriendModalOpen(false);
    setCurrentModeType('amigo');
    const friendOpponent: OpponentData = {
      nome: 'Amigo Convidado (Online)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      elo: 'Desafiante',
      curso: 'Vestibular 2026',
    };
    setOpponent(friendOpponent);
    startBattleGame(friendOpponent);
  };

  // Start the Battle State
  const startBattleGame = (opp: OpponentData) => {
    const newQuestions = generateBattleQuestions(5);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserPoints(0);
    setRivalPoints(0);
    setUserRoundsWon([]);
    setRivalRoundsWon([]);
    setCurrentRoundsScores([]);
    setSelectedOption(null);
    setIsRoundAnswered(false);
    setTimeLeft(QUESTION_MAX_TIME);
    setRivalStatusText('Pensando...');
    setGameState('battle');
  };

  // Handle User Answer
  const handleSelectOption = (optionIndex: number) => {
    if (isRoundAnswered) return;
    setSelectedOption(optionIndex);
    setIsRoundAnswered(true);

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQ.resposta_correta_index;
    const timeSpent = QUESTION_MAX_TIME - timeLeft;

    // Calculate score based on remaining time (Speed bonus)
    const pointsEarned = isCorrect ? Math.round(50 + (timeLeft / QUESTION_MAX_TIME) * 50) : 0;

    if (isCorrect) {
      playSuccessSound();
      setUserPoints((prev) => prev + pointsEarned);
    } else {
      playErrorSound();
    }

    setUserRoundsWon((prev) => [...prev, isCorrect]);

    // Simulate Rival Behavior
    const rivalSpeed = Math.random() * 2 + 1; // 1-3 seconds
    setTimeout(() => {
      // 70% accuracy for rival
      const rivalCorrect = Math.random() > 0.3;
      const rivalScore = rivalCorrect ? Math.round(50 + Math.random() * 45) : 0;
      setRivalPoints((prev) => prev + rivalScore);
      setRivalRoundsWon((prev) => [...prev, rivalCorrect]);
      setRivalStatusText(
        rivalCorrect ? `Acertou! (+${rivalScore} pts)` : 'Errou a questão!'
      );

      // Record round detail
      const roundScoreData: DuelRoundScore = {
        roundNumber: currentQuestionIndex + 1,
        questionTopic: currentQ.topico || currentQ.materia,
        questionPreview: currentQ.pergunta.length > 70 ? currentQ.pergunta.substring(0, 70) + '...' : currentQ.pergunta,
        player1Correct: isCorrect,
        player2Correct: rivalCorrect,
        player1Points: pointsEarned,
        player2Points: rivalScore,
        timeTakenSeconds: timeSpent,
      };
      setCurrentRoundsScores((prev) => [...prev, roundScoreData]);
    }, 800);
  };

  // Handle Time Expired
  const handleTimeExpired = () => {
    if (isRoundAnswered) return;
    setIsRoundAnswered(true);
    playErrorSound();
    setUserRoundsWon((prev) => [...prev, false]);

    const currentQ = questions[currentQuestionIndex];

    // Rival might still answer
    const rivalCorrect = Math.random() > 0.4;
    const rivalScore = rivalCorrect ? 60 : 0;
    setRivalPoints((prev) => prev + rivalScore);
    setRivalRoundsWon((prev) => [...prev, rivalCorrect]);
    setRivalStatusText(
      rivalCorrect ? `Acertou! (+${rivalScore} pts)` : 'Tempo esgotado!'
    );

    const roundScoreData: DuelRoundScore = {
      roundNumber: currentQuestionIndex + 1,
      questionTopic: currentQ?.topico || currentQ?.materia || 'Geral',
      questionPreview: currentQ?.pergunta ? (currentQ.pergunta.length > 70 ? currentQ.pergunta.substring(0, 70) + '...' : currentQ.pergunta) : 'Questão ' + (currentQuestionIndex + 1),
      player1Correct: false,
      player2Correct: rivalCorrect,
      player1Points: 0,
      player2Points: rivalScore,
      timeTakenSeconds: QUESTION_MAX_TIME,
    };
    setCurrentRoundsScores((prev) => [...prev, roundScoreData]);
  };

  // Next Question or Finish Battle
  const handleNextRound = () => {
    playClickSound();
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsRoundAnswered(false);
      setTimeLeft(QUESTION_MAX_TIME);
      setRivalStatusText('Pensando...');
    } else {
      // Finish Battle
      finishBattle();
    }
  };

  // Finish Battle and update stats
  const finishBattle = async () => {
    setGameState('finished');
    const isWinner = userPoints >= rivalPoints;
    const isTie = userPoints === rivalPoints;
    const xpReward = isWinner ? 180 : 50;

    if (isWinner) {
      playQuizSuccessPling();
    }

    if (onAddXP) {
      onAddXP(xpReward);
    }

    // Save to IndexedDB Duel Results Store
    try {
      const currentMateria = questions[0]?.materia || 'Simulado Geral ENEM';
      await saveDuelResult({
        id: 'arena_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        battleId: 'ARENA_' + currentModeType.toUpperCase(),
        materia: currentMateria,
        topico: `Arena X1 - ${currentMateria}`,
        mode: currentModeType === 'amigo' ? '1v1_amigo' : 'arena_ranqueada',
        player1Name: 'Você',
        player1Score: userRoundsWon.filter(Boolean).length,
        player2Name: opponent?.nome || 'Rival da Arena',
        player2Score: rivalRoundsWon.filter(Boolean).length,
        player2Avatar: opponent?.avatar,
        player2Course: opponent?.curso,
        player2Elo: opponent?.elo,
        totalQuestions: questions.length,
        winner: isWinner ? 'player1' : isTie ? 'tie' : 'player2',
        xpAwarded: xpReward,
        roundsDetail: currentRoundsScores,
        createdAt: new Date().toISOString(),
      });
      loadDuelHistory();
    } catch (err) {
      console.warn('Erro ao salvar duelo da arena no IndexedDB:', err);
    }

    // Update user stats
    const updatedStats: ArenaUserStats = {
      ...userStats,
      vitorias: isWinner ? userStats.vitorias + 1 : userStats.vitorias,
      derrotas: !isWinner ? userStats.derrotas + 1 : userStats.derrotas,
      streak: isWinner ? userStats.streak + 1 : 0,
      xpTotal: userStats.xpTotal + xpReward,
      pontosElo: isWinner ? userStats.pontosElo + 25 : Math.max(1000, userStats.pontosElo - 15),
      quizDiarioConcluidoHoje: currentModeType === 'diario' ? true : userStats.quizDiarioConcluidoHoje,
    };
    saveStats(updatedStats);
  };

  // Share Friend Challenge on WhatsApp
  const shareOnWhatsApp = () => {
    const inviteUrl = window.location.origin;
    const msg = `⚔️ *DESAFIO ARENA X1 - GABARITAÍ ENEM* ⚔️\n\nEu te desafio para um duelo de 5 questões no estilo ENEM!\n🔑 Código da Sala: *${friendRoomCode}*\n\nEntre agora para disputar pontos e XP: ${inviteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Rematch from duel history
  const handleRematchFromHistory = (duel: DuelResultLog) => {
    playClickSound();
    const opponentData: OpponentData = {
      nome: duel.player2Name || 'Rival da Arena',
      avatar: duel.player2Avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      elo: duel.player2Elo || 'Diamante I',
      curso: duel.player2Course || 'Vestibulando',
    };
    setOpponent(opponentData);
    setCurrentModeType(duel.mode === '1v1_amigo' ? 'amigo' : 'rapida');
    startBattleGame(opponentData);
  };

  const copyFriendLink = () => {
    const textToCopy = `${window.location.origin}?sala=${friendRoomCode}`;
    navigator.clipboard.writeText(textToCopy);
    setHasCopiedLink(true);
    setTimeout(() => setHasCopiedLink(false), 2500);
  };

  // Relative progress bar math for comparison
  const totalScoreComparison = Math.max(1, userPoints + rivalPoints);
  const userProgressPercent = Math.round((userPoints / totalScoreComparison) * 100);
  const rivalProgressPercent = 100 - userProgressPercent;

  return (
    <div id="arena-x1-section" className="space-y-8 pb-14 max-w-7xl mx-auto">
      {/* 1. STATE: IDLE (MAIN ARENA DASHBOARD) */}
      {gameState === 'idle' && (
        <div className="space-y-8 animate-fadeIn">
          {/* CABEÇALHO DA ARENA: Título + Placar do Usuário */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            {/* Background Glow Accents */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Title & Badge */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30">
                    ⚔️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Arena X1
                      </h1>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        Ao Vivo
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      Duelos e quizzes competitivos em tempo real entre vestibulandos de todo o Brasil.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Scorecard (Elo / Patente / Vitórias / XP) */}
              <div
                id="arena-user-scorecard"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md shrink-0"
              >
                {/* Elo / Patente */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg shrink-0">
                    👑
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      Patente
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-300 truncate block">
                      {userStats.patente}
                    </span>
                  </div>
                </div>

                {/* Vitórias / Derrotas */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0">
                    🏆
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      Vitórias
                    </span>
                    <span className="text-xs sm:text-sm font-black text-emerald-400 truncate block">
                      {userStats.vitorias}V <span className="text-slate-500 text-[10px]">/ {userStats.derrotas}D</span>
                    </span>
                  </div>
                </div>

                {/* Win Streak */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg shrink-0">
                    🔥
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      Streak
                    </span>
                    <span className="text-xs sm:text-sm font-black text-rose-400 truncate block">
                      {userStats.streak} Seguidas
                    </span>
                  </div>
                </div>

                {/* Saldo de XP */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg shrink-0">
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      Saldo XP
                    </span>
                    <span className="text-xs sm:text-sm font-black text-indigo-300 truncate block">
                      {userStats.xpTotal} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NAVEGAÇÃO DE ABAS DA ARENA */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900/90 rounded-2xl border border-slate-300 dark:border-slate-800 backdrop-blur-md w-full sm:w-fit shadow-xs">
            <button
              id="tab-arena-modos"
              onClick={() => {
                playClickSound();
                setActiveMainTab('arena');
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'arena'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Modos & Top Duelos</span>
            </button>

            <button
              id="tab-meus-duelos"
              onClick={() => {
                playClickSound();
                setActiveMainTab('meus_duelos');
                loadDuelHistory();
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'meus_duelos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Meus Duelos 1v1</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeMainTab === 'meus_duelos'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {duelHistory.length}
              </span>
            </button>
          </div>

          {/* ABA 1: MODOS DE JOGO & LEADERBOARD */}
          {activeMainTab === 'arena' && (
            <div className="space-y-8 animate-fadeIn">
              {/* CARDS DE MODOS DE JOGO (3 MODOS) */}
              <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Escolha o Modo de Batalha
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                1.428 vestibulandos online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD 1: Desafio 1v1 com Amigos */}
              <div
                id="card-modo-amigos"
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      👥
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30">
                      Sala Privada
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Desafio 1v1 com Amigos
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                      Crie uma sala exclusiva e envie o link no WhatsApp para disputar quem gabarita mais rápido.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    id="btn-criar-desafio-amigo"
                    onClick={handleOpenFriendChallenge}
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Criar Desafio</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: Partida Rápida (Matchmaking) */}
              <div
                id="card-modo-partida-rapida"
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-b from-indigo-900/40 via-slate-900 to-slate-900 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200 text-white"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      ⚡
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Ranqueado
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                      Partida Rápida
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-normal">
                      Matchmaking instantâneo com outro estudante online com Elo semelhante. Valendo +180 XP e pontos de ranking!
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    id="btn-iniciar-partida-rapida"
                    onClick={handleStartQuickMatch}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buscar Oponente Online</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: Quiz Diário */}
              <div
                id="card-modo-quiz-diario"
                className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🎯
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                      Bônus Diário
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Quiz Diário
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                      5 perguntas rápidas selecionadas do ENEM para manter seu streak e garantir +200 XP diário contra a Gabi IA.
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    id="btn-iniciar-quiz-diario"
                    onClick={handleStartDailyQuiz}
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Iniciar Quiz do Dia (+200 XP)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. RANKING DOS GABARITADORES (LEADERBOARD TOP 10) */}
          <section id="arena-leaderboard-section" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Ranking dos Gabaritadores (Top 10 da Semana)
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Atualizado a cada rodada • Liga Ouro & Diamante
              </span>
            </div>

            {/* PÓDIO TOP 3 DESTACADO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* TOP 2 (Prata) */}
              <div className="order-2 md:order-1 p-5 rounded-3xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-4 text-white shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={LEADERBOARD_TOP10[1].avatar}
                      alt={LEADERBOARD_TOP10[1].nome}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-300 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 text-base">🥈</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      2º Lugar (Prata)
                    </span>
                    <h4 className="text-sm font-black text-white">{LEADERBOARD_TOP10[1].nome}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">{LEADERBOARD_TOP10[1].curso}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-200">{LEADERBOARD_TOP10[1].xp} XP</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">{LEADERBOARD_TOP10[1].vitorias} vitórias</span>
                </div>
              </div>

              {/* TOP 1 (Ouro) */}
              <div className="order-1 md:order-2 p-5 rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-400/80 flex items-center justify-between gap-4 text-white shadow-xl shadow-amber-500/10 scale-[1.02]">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={LEADERBOARD_TOP10[0].avatar}
                      alt={LEADERBOARD_TOP10[0].nome}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                    />
                    <span className="absolute -top-2 -right-1 text-xl animate-bounce">👑</span>
                    <span className="absolute -bottom-1 -right-1 text-base">🥇</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                      1º Lugar (Campeão)
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-white">{LEADERBOARD_TOP10[0].nome}</h4>
                    <span className="text-[11px] text-amber-200 font-medium">{LEADERBOARD_TOP10[0].curso}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-300">{LEADERBOARD_TOP10[0].xp} XP</span>
                  <span className="text-[10px] text-amber-400 font-bold block">{LEADERBOARD_TOP10[0].vitorias} vitórias</span>
                </div>
              </div>

              {/* TOP 3 (Bronze) */}
              <div className="order-3 md:order-3 p-5 rounded-3xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-4 text-white shadow-lg">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={LEADERBOARD_TOP10[2].avatar}
                      alt={LEADERBOARD_TOP10[2].nome}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-700/80 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 text-base">🥉</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                      3º Lugar (Bronze)
                    </span>
                    <h4 className="text-sm font-black text-white">{LEADERBOARD_TOP10[2].nome}</h4>
                    <span className="text-[11px] text-slate-400 font-medium">{LEADERBOARD_TOP10[2].curso}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-500">{LEADERBOARD_TOP10[2].xp} XP</span>
                  <span className="text-[10px] text-emerald-400 font-bold block">{LEADERBOARD_TOP10[2].vitorias} vitórias</span>
                </div>
              </div>
            </div>

            {/* TABELA COMPLETA DOS TOP 10 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {LEADERBOARD_TOP10.map((comp) => {
                  const isTop3 = comp.posicao <= 3;
                  const isUser = comp.isCurrentUser;

                  return (
                    <div
                      key={comp.id}
                      className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                        isUser
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Posição */}
                        <div className="w-7 text-center font-black text-xs sm:text-sm">
                          {comp.posicao === 1 && <span className="text-amber-400">1º</span>}
                          {comp.posicao === 2 && <span className="text-slate-300">2º</span>}
                          {comp.posicao === 3 && <span className="text-amber-600">3º</span>}
                          {comp.posicao > 3 && (
                            <span className="text-slate-400 dark:text-slate-500">{comp.posicao}º</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <img
                          src={comp.avatar}
                          alt={comp.nome}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />

                        {/* Informações */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                              {comp.nome}
                            </span>
                            {isUser && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-indigo-600 text-white">
                                VOCÊ
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{comp.elo}</span>
                            <span>•</span>
                            <span className="truncate">{comp.curso}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pontos de XP & Ação */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            {comp.xp} <span className="text-[10px] text-indigo-500 font-bold">XP</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {comp.vitorias}V
                          </span>
                        </div>

                        {!isUser && (
                          <button
                            onClick={() => {
                              playClickSound();
                              setOpponent({
                                nome: comp.nome,
                                avatar: comp.avatar,
                                elo: comp.elo,
                                curso: comp.curso,
                              });
                              startBattleGame({
                                nome: comp.nome,
                                avatar: comp.avatar,
                                elo: comp.elo,
                                curso: comp.curso,
                              });
                            }}
                            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs items-center gap-1 transition-all cursor-pointer"
                            title={`Desafiar ${comp.nome} para um 1v1`}
                          >
                            <Swords className="w-3 h-3" />
                            <span>Desafiar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ABA 2: MEUS DUELOS 1V1 (HISTÓRICO RECENTE & PLACAR POR RODADA) */}
      {activeMainTab === 'meus_duelos' && (
        <ArenaMyDuelsTab
          duels={duelHistory}
          onOpenScoreModal={(duel) => {
            playClickSound();
            setSelectedDuelForModal(duel);
          }}
          onStartRematch={handleRematchFromHistory}
          onStartNewQuickMatch={handleStartQuickMatch}
        />
      )}
    </div>
  )}

      {/* 2. STATE: MATCHMAKING SCREEN */}
      {gameState === 'matchmaking' && (
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 text-white text-center space-y-8 shadow-2xl animate-fadeIn max-w-2xl mx-auto my-6">
          <div className="space-y-3">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-t-rose-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-3xl shadow-lg shadow-indigo-600/50">
                ⚔️
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              Procurando Adversário Online...
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Buscando um vestibulando do mesmo nível na Liga {userStats.patente} • Tempo de espera: {matchmakingSeconds}s
            </p>
          </div>

          {/* Radar details */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 font-black uppercase">Região</span>
              <p className="font-bold text-slate-300">Brasil (Nacional)</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-black uppercase">Ping Estimado</span>
              <p className="font-bold text-emerald-400">18 ms (Ótimo)</p>
            </div>
          </div>

          <div>
            <button
              onClick={() => {
                playClickSound();
                setGameState('idle');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar Busca
            </button>
          </div>
        </div>
      )}

      {/* 3. STATE: TELA DE BATALHA (LAYOUT DAS QUESTÕES) */}
      {gameState === 'battle' && opponent && questions.length > 0 && (
        <div id="arena-battle-screen" className="space-y-6 animate-fadeIn">
          {/* SUB-SEÇÃO: HEADER DA BATALHA (CRONÔMETRO REGRESSIVO + BARRA COMPARATIVA TEMPO REAL) */}
          <ArenaBattleHeader
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            currentMateria={questions[currentQuestionIndex].materia}
            currentTopico={questions[currentQuestionIndex].topico}
            timeLeft={timeLeft}
            maxTime={QUESTION_MAX_TIME}
            userPoints={userPoints}
            rivalPoints={rivalPoints}
            userPatente={userStats.patente}
            userRoundsWon={userRoundsWon}
            rivalRoundsWon={rivalRoundsWon}
            opponent={opponent}
            rivalStatusText={rivalStatusText}
            isRoundAnswered={isRoundAnswered}
          />

          {/* CARD DA QUESTÃO ATUAL */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {questions[currentQuestionIndex].topico}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {questions[currentQuestionIndex].pergunta}
              </h3>
            </div>

            {/* Alternativas de Resposta */}
            <div className="space-y-2.5">
              {questions[currentQuestionIndex].opcoes.map((opcao, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === questions[currentQuestionIndex].resposta_correta_index;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';

                if (isRoundAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-950 dark:text-rose-300';
                  } else {
                    btnStyle = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-400';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isRoundAnswered}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                      {opcao}
                    </span>
                    {isRoundAnswered && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    {isRoundAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Próxima Questão */}
            {isRoundAnswered && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                    <span>Explicação Pedagógica</span>
                  </div>
                  <p className="leading-relaxed">
                    {questions[currentQuestionIndex].explicacao}
                  </p>
                </div>

                <button
                  onClick={handleNextRound}
                  className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>
                    {currentQuestionIndex + 1 < questions.length ? 'Próxima Questão' : 'Ver Resultado do Duelo'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. STATE: TELA DE RESULTADO (FIM DA BATALHA) */}
      {gameState === 'finished' && opponent && (
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 text-white text-center space-y-8 shadow-2xl animate-fadeIn max-w-2xl mx-auto my-6">
          <div className="space-y-3">
            <div className="text-5xl">
              {userPoints > rivalPoints ? '🏆' : userPoints === rivalPoints ? '🤝' : '⚔️'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {userPoints > rivalPoints
                ? 'Vitória Épica na Arena!'
                : userPoints === rivalPoints
                ? 'Empate Eletrizante!'
                : 'Derrota com Honra!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {userPoints > rivalPoints
                ? `Você superou ${opponent.nome} e garantiu +180 XP e pontos de Elo!`
                : `Boa batalha contra ${opponent.nome}! Você somou +50 XP de treino.`}
            </p>
          </div>

          {/* Placar Final Comparativo */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-black text-indigo-400">Você</span>
              <div className="text-2xl sm:text-3xl font-black text-white">{userPoints} pts</div>
              <span className="text-[10px] text-emerald-400 font-bold">
                {userRoundsWon.filter(Boolean).length} de {questions.length} certas
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-rose-400">{opponent.nome}</span>
              <div className="text-2xl sm:text-3xl font-black text-white">{rivalPoints} pts</div>
              <span className="text-[10px] text-rose-400 font-bold">
                {rivalRoundsWon.filter(Boolean).length} de {questions.length} certas
              </span>
            </div>
          </div>

          {/* Ações Finais */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleStartQuickMatch}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Outra Partida</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setGameState('idle');
              }}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Voltar à Arena
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR DESAFIO COM AMIGOS (GERAR LINK E WHATSAPP) */}
      <AnimatePresence>
        {isFriendModalOpen && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white space-y-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
                    👥
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">Desafio 1v1 com Amigos</h3>
                    <p className="text-xs text-slate-400">Sala Privada Criada</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFriendModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Room Code */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  Código da Sua Sala
                </span>
                <div className="text-2xl font-black text-amber-400 tracking-widest">
                  {friendRoomCode}
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2.5">
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Convite no WhatsApp</span>
                </button>

                <button
                  onClick={copyFriendLink}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {hasCopiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{hasCopiedLink ? 'Link Copiado!' : 'Copiar Link de Convite'}</span>
                </button>
              </div>

              {/* Start right away */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleStartFriendBattle}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-500/30"
                >
                  <span>Iniciar Batalha Imediata</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 6. MODAL: DETALHES DO PLACAR POR RODADA DO DUELO */}
        {selectedDuelForModal && (
          <DuelRoundScoreModal
            duel={selectedDuelForModal}
            onClose={() => setSelectedDuelForModal(null)}
            onRematch={handleRematchFromHistory}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
