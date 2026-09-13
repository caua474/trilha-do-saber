export interface QuizQuestion {
  pergunta: string;
  resposta: string;
}

export interface Flashcard {
  frente: string;
  verso: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  originalText: string;
  resumoDireto: string;
  pontosPrincipais: string[];
  perguntas: QuizQuestion[];
  flashcards: Flashcard[];
  rawText: string;
  createdAt: string;
  focusTopic?: string;
}

export interface SampleText {
  title: string;
  category: string;
  description: string;
  content: string;
}

export interface TutorScheduleItem {
  etapa: string;
  duracao: string;
  descricao: string;
}

export interface TutorQuestion {
  pergunta: string;
  opcoes?: string[];
  respostaCorreta: string;
  explicacaoGabarito: string;
}

export interface TutorPlan {
  id: string;
  createdAt: string;
  materia: string;
  serieAno: string;
  objetivo: string;
  tempoDisponivel: string;
  cronograma: TutorScheduleItem[];
  aulaResumo: string;
  questoes: TutorQuestion[];
  gabaritoComentado: string;
}

export interface ELI5Explanation {
  id: string;
  createdAt: string;
  duvida: string;
  analogiaSimples: string;
  passoAPasso: string[];
  dicaDeOuro: string;
}

export interface EnemCompetencyDetail {
  nota: number;
  feedback: string;
}

export interface EnemEssayAnalysis {
  tipo_resposta?: string;
  tema_detectado: string;
  nota_estimada_total: number;
  competencias: {
    c1_gramatica: EnemCompetencyDetail;
    c2_repertorio: EnemCompetencyDetail;
    c3_argumentacao: EnemCompetencyDetail;
    c4_coesao: EnemCompetencyDetail;
    c5_proposta_intervencao: EnemCompetencyDetail;
  };
  pontos_fortes: string[];
  pontos_a_melhorar: string[];
  dica_de_ouro: string;
  sugestao_reescrita?: string;
  aviso_legal?: string;
}

export interface EssayCompetency {
  competencia: number;
  nome: string;
  nota: number;
  feedback: string;
  pontosFortes?: string[];
  pontosMelhorar?: string[];
}

export interface EssayRewriteSuggestion {
  trechoOriginal: string;
  problemaIdentificado: string;
  sugestaoMelhoria: string;
}

export interface EssayAnalysis {
  id?: string;
  createdAt?: string;
  temaEnem?: string;
  textoOriginal?: string;
  notaEstimadaTotal: number;
  nivelGeral: string;
  resumoAvaliacao: string;
  competencias: EssayCompetency[];
  analiseEstruturalECoesao: {
    introducao: string;
    desenvolvimento: string;
    conclusao: string;
    repertorioSocioCultural: string;
    conectivosRecomendados: string[];
  };
  sugestoesReescrita: EssayRewriteSuggestion[];
  dicaDeOuroEnem: string;
}

export interface UserAchievement {
  teve_desbloqueio: boolean;
  id_conquista: string;
  titulo: string;
  descricao: string;
  icone: string;
}

export interface UserProgressResponse {
  tipo_resposta: 'progresso_usuario';
  xp_ganho: number;
  novo_total_xp: number;
  conquista_desbloqueada: UserAchievement;
  mensagem_incentivo: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  targetCourse: string;
  targetExam: string;
  targetUniversity?: string;
  studyRoutine?: '1 hora' | '2 a 4 horas' | '5+ horas' | string;
  dailyHoursGoal: number;
  dailyQuestionsGoal: number;
  rankTitle: string;
  soundEffects: boolean;
  quizSuccessSound?: boolean;
  notificationsEnabled: boolean;
  notificationTime: string;
  examDate?: string;
  onboardingCompleted?: boolean;
}

export interface QuizResultLog {
  id: string;
  materia: string;
  topico?: string;
  acertos: number;
  totalQuestoes: number;
  porcentagem: number;
  createdAt: string;
}

export interface DuelRoundScore {
  roundNumber: number;
  questionTopic?: string;
  questionPreview?: string;
  player1Correct: boolean;
  player2Correct: boolean;
  player1Points?: number;
  player2Points?: number;
  timeTakenSeconds?: number;
}

export interface DuelResultLog {
  id: string;
  battleId: string;
  materia: string;
  topico: string;
  mode: '1v1_local' | '1v1_rival_ia' | '1v1_online' | '1v1_link' | '1v1_amigo' | 'arena_ranqueada' | string;
  player1Name: string;
  player1Score: number;
  player2Name: string;
  player2Score: number;
  player2Avatar?: string;
  player2Course?: string;
  player2Elo?: string;
  totalQuestions: number;
  winner: 'player1' | 'player2' | 'tie';
  xpAwarded: number;
  createdAt: string;
  roundsDetail?: DuelRoundScore[];
}

export interface TopDuelist {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  elo: string;
  vitorias: number;
  derrotas: number;
  pontos: number;
  xpSemanal: number;
  winRate: number;
  isCurrentUser?: boolean;
  uf: string;
  curso: string;
  badge?: string;
  recentMateria?: string;
}




