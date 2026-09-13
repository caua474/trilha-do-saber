import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  FileText,
  Calendar,
  Lightbulb,
  ChevronRight,
  Sparkles,
  Command,
  Clock,
  BookOpen,
  ArrowRight,
  Filter,
  Zap,
  Target,
  Swords,
  PenTool,
  Brain,
  CheckCircle2,
  Bookmark,
  GraduationCap,
  Trophy,
  HelpCircle,
  Layers,
  Flame,
  Volume2,
  Mic,
  Camera,
  Sliders,
  Award,
  Compass,
  Check,
} from 'lucide-react';
import { StudyMaterial, TutorPlan, ELI5Explanation } from '../types';
import { PrimaryTab } from './BottomNavigationBar';
import { AbaAtiva } from './NavigationTabs';
import { ENEM_CATALOG } from '../data/enemCatalog';
import { playClickSound, playSuccessSound } from '../utils/audio';

export type SearchCategoryFilter = 'all' | 'recursos' | 'flashcards' | 'conteudos' | 'historico';

export interface HeaderGlobalSearchProps {
  materials?: StudyMaterial[];
  tutorPlans?: TutorPlan[];
  eli5Explanations?: ELI5Explanation[];
  onSelectMaterial?: (material: StudyMaterial) => void;
  onSelectTutorPlan?: (plan: TutorPlan) => void;
  onSelectELI5?: (explanation: ELI5Explanation) => void;
  onNavigate?: (primaryTab: PrimaryTab, subTab?: AbaAtiva) => void;
  onOpenModal?: (modalName: string) => void;
  onSelectFlashcardTopic?: (topic: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'warning' | 'info') => void;
  className?: string;
  autoFocus?: boolean;
}

export type SearchItemType = 'recurso' | 'flashcard' | 'conteudo' | 'material' | 'tutor' | 'eli5';

export interface SearchResultItem {
  id: string;
  category: 'recursos' | 'flashcards' | 'conteudos' | 'historico';
  itemType: SearchItemType;
  title: string;
  subtitle?: string;
  description: string;
  badgeLabel: string;
  badgeColor: 'indigo' | 'rose' | 'amber' | 'emerald' | 'cyan' | 'purple' | 'slate';
  iconType: string;
  tags?: string[];
  destinationLabel: string;
  actionType: 'navigate_tab' | 'open_modal' | 'flashcard_topic' | 'history_item';
  primaryTab?: PrimaryTab;
  subTab?: AbaAtiva;
  modalName?: string;
  flashcardTopic?: string;
  rawHistoryItem?: StudyMaterial | TutorPlan | ELI5Explanation;
  dateStr?: string;
  timestamp?: number;
}

function normalizeSearchText(text?: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatDateDisplay(isoDateStr?: string): string {
  if (!isoDateStr) return '';
  try {
    const d = new Date(isoDateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

// 1. Catálogo Estático de Recursos e Ferramentas do Aplicativo
const APP_RESOURCES: Array<Omit<SearchResultItem, 'category' | 'itemType'> & { category: 'recursos'; itemType: 'recurso' }> = [
  // Redação & IA
  {
    id: 'rec-redacao',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Corretor de Redação IA',
    subtitle: 'Redação & IA • Diagnóstico C1 a C5',
    description: 'Correção instantânea com nota 1000, apontamentos de desvios gramaticais e sugestões de melhoria.',
    badgeLabel: 'Redação & IA',
    badgeColor: 'rose',
    iconType: 'pen',
    tags: ['redacao', 'corretor', 'ia', 'nota 1000', 'competencias', 'c1', 'c2', 'c3', 'c4', 'c5', 'texto', 'enem'],
    destinationLabel: 'Módulo Redação & IA → Corretor Oficial',
    actionType: 'navigate_tab',
    primaryTab: 'redacao_ia',
    subTab: 'redacao',
  },
  {
    id: 'rec-c5',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Detector C5 (Proposta de Intervenção)',
    subtitle: 'Redação & IA • 5 Elementos Obrigatórios',
    description: 'Validação automática de Agente, Ação, Meio/Modo, Efeito e Detalhamento para garantir os 200 pontos.',
    badgeLabel: 'Redação & IA',
    badgeColor: 'rose',
    iconType: 'target',
    tags: ['c5', 'intervencao', 'agente', 'acao', 'modo', 'meio', 'efeito', 'detalhamento', 'redacao', 'conclusao'],
    destinationLabel: 'Módulo Redação & IA → Detector C5',
    actionType: 'navigate_tab',
    primaryTab: 'redacao_ia',
    subTab: 'c5_intervencao',
  },
  {
    id: 'rec-esqueleto',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Esqueleto de Redação (Canvas)',
    subtitle: 'Redação & IA • Estrutura em Blocos',
    description: 'Construa sua tese, repertórios e argumentos parágrafo por parágrafo em um editor estruturado.',
    badgeLabel: 'Redação & IA',
    badgeColor: 'rose',
    iconType: 'layers',
    tags: ['esqueleto', 'canvas', 'estrutura', 'introducao', 'd1', 'd2', 'conclusao', 'redacao'],
    destinationLabel: 'Módulo Redação & IA → Esqueleto Canvas',
    actionType: 'navigate_tab',
    primaryTab: 'redacao_ia',
    subTab: 'esquema_redacao',
  },
  {
    id: 'rec-radar-redacao',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Radar de Redação (Apostas ENEM)',
    subtitle: 'Redação & IA • Eixos Temáticos Quentes',
    description: 'Temas com maior probabilidade de cair no ENEM com propostas de redação e textos motivadores.',
    badgeLabel: 'Redação & IA',
    badgeColor: 'rose',
    iconType: 'flame',
    tags: ['radar', 'apostas', 'temas', 'redacao', 'meio ambiente', 'saude', 'tecnologia', 'sociedade'],
    destinationLabel: 'Módulo Redação & IA → Radar de Temas',
    actionType: 'navigate_tab',
    primaryTab: 'redacao_ia',
    subTab: 'radar_redacao',
  },
  {
    id: 'rec-repertorios',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Repertórios Coringa para Redação',
    subtitle: 'Redação & IA • Citações, Leis e Filósofos',
    description: 'Banco selecionado de pensadores (Bauman, Habermas, Foucault), leis constitucionais e dados históricos.',
    badgeLabel: 'Redação & IA',
    badgeColor: 'rose',
    iconType: 'bookmark',
    tags: ['repertorio', 'filosofia', 'sociologia', 'leis', 'constituicao', 'bauman', 'citacoes', 'argumentos'],
    destinationLabel: 'Módulo Redação & IA → Repertórios Coringa',
    actionType: 'navigate_tab',
    primaryTab: 'redacao_ia',
    subTab: 'repertorio',
  },
  {
    id: 'rec-advogado-diabo',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Advogado do Diabo (Debate de Teses)',
    subtitle: 'Redação & IA • Teste de Argumentação',
    description: 'A IA desafia seus argumentos com contra-teses para você blindar seu ponto de vista na redação.',
    badgeLabel: 'Redação & IA',
    badgeColor: 'rose',
    iconType: 'swords',
    tags: ['advogado', 'diabo', 'debate', 'teses', 'contra argumento', 'retorica', 'redacao'],
    destinationLabel: 'Módulo Redação & IA → Advogado do Diabo',
    actionType: 'navigate_tab',
    primaryTab: 'redacao_ia',
    subTab: 'advogado_diabo',
  },

  // Conteúdos & Memória
  {
    id: 'rec-flashcards',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Resumos & Flashcards (Bento IA)',
    subtitle: 'Conteúdos & Memória • Repetição Espaçada',
    description: 'Gerador inteligente de kits de estudo com resumos diretos, pontos-chave, quiz interativo e flashcards.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'zap',
    tags: ['flashcards', 'resumos', 'bento', 'memorizacao', 'repeticao espacada', 'anki', 'quiz', 'revisao'],
    destinationLabel: 'Módulo Conteúdos → Flashcards Bento',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'flashcards',
  },
  {
    id: 'rec-mapas-mentais',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Mapas Mentais Inteligentes',
    subtitle: 'Conteúdos & Memória • Conexões Visuais',
    description: 'Diagramas de conceitos interligados gerados por IA para fixação rápida de matérias complexas.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'brain',
    tags: ['mapas mentais', 'diagramas', 'fluxogramas', 'resumo visual', 'conceitos', 'ia'],
    destinationLabel: 'Módulo Conteúdos → Mapas Mentais',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'mapas_mentais',
  },
  {
    id: 'rec-biblioteca',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Biblioteca & Fichamentos Completos',
    subtitle: 'Conteúdos & Memória • Todas as Disciplinas',
    description: 'Fichamentos teóricos organizados por matéria para leitura rápida e aprofundamento nos vestibulares.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'book',
    tags: ['biblioteca', 'fichamentos', 'teoria', 'aulas', 'materias', 'disciplinas', 'conteudo'],
    destinationLabel: 'Módulo Conteúdos → Biblioteca',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'biblioteca',
  },
  {
    id: 'rec-pilulas',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Pílulas do Conhecimento (90s)',
    subtitle: 'Conteúdos & Memória • Microlearning',
    description: 'Explicações ultrarrápidas de 90 segundos sobre os conceitos mais cobrados de cada disciplina.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'clock',
    tags: ['pilulas', 'microlearning', '90s', 'audio', 'rapido', 'conceitos'],
    destinationLabel: 'Módulo Conteúdos → Pílulas 90s',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'pilulas_conhecimento',
  },
  {
    id: 'rec-catalogo',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Catálogo do Edital ENEM & Habilidades',
    subtitle: 'Conteúdos & Memória • Matriz Oficial',
    description: 'Mapeamento completo dos conteúdos que mais caem divididos por área e índice de incidência.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'compass',
    tags: ['catalogo', 'edital', 'matriz', 'competencias', 'habilidades', 'o que mais cai', 'natureza', 'humanas', 'matematica'],
    destinationLabel: 'Módulo Conteúdos → Catálogo do Edital',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'catalogo',
  },
  {
    id: 'rec-glossario',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Glossário do Edital do ENEM',
    subtitle: 'Conteúdos & Memória • Termos Técnicos',
    description: 'Dicionário de vocabulário técnico, conceitos fundamentais e pegadinhas linguísticas do exame.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'help',
    tags: ['glossario', 'vocabulario', 'termos tecnicos', 'dicionario', 'pegadinhas', 'palavras dificeis'],
    destinationLabel: 'Módulo Conteúdos → Glossário ENEM',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'glossario_enem',
  },
  {
    id: 'rec-scanner-duvidas',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Scanner Tira-Dúvidas com IA',
    subtitle: 'Conteúdos & Memória • Foto ou Texto',
    description: 'Fotografe ou digite uma questão difícil e receba uma resolução didática passo a passo.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'camera',
    tags: ['scanner', 'tira duvidas', 'foto da questao', 'resolucao passo a passo', 'eli5', 'camera'],
    destinationLabel: 'Módulo Conteúdos → Scanner Tira-Dúvidas',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'duvidas',
  },
  {
    id: 'rec-feynman',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Teste Verbal Feynman (Áudio)',
    subtitle: 'Conteúdos & Memória • Retenção Ativa',
    description: 'Grave sua explicação em voz alta; a IA analisa lacunas conceituais e mede seu domínio.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'mic',
    tags: ['feynman', 'audio', 'gravacao', 'voz', 'tecnica feynman', 'explicacao ativa', 'microfone'],
    destinationLabel: 'Módulo Conteúdos → Teste Feynman',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'feynman_audio',
  },
  {
    id: 'rec-audio-podcasts',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Modo Áudio & Podcasts Educacionais',
    subtitle: 'Conteúdos & Memória • Estudo em Trânsito',
    description: 'Aulas sintetizadas em áudio para você revisar enquanto se desloca ou descansa a visão.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'volume',
    tags: ['podcasts', 'audio', 'ouvir', 'aulas em audio', 'locucao', 'transito'],
    destinationLabel: 'Módulo Conteúdos → Modo Áudio & Podcasts',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'audio_podcasts',
  },
  {
    id: 'rec-auto-flashcards',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Auto-Flashcards (Foto ou Texto)',
    subtitle: 'Conteúdos & Memória • Geração Instantânea',
    description: 'Transforme anotações de caderno ou trechos de apostilas em decks prontos de flashcards.',
    badgeLabel: 'Conteúdos',
    badgeColor: 'indigo',
    iconType: 'sparkles',
    tags: ['auto flashcards', 'gerar baralhos', 'foto do caderno', 'ocr', 'anotacoes'],
    destinationLabel: 'Módulo Conteúdos → Auto-Flashcards',
    actionType: 'navigate_tab',
    primaryTab: 'conteudos',
    subTab: 'auto_flashcards',
  },

  // Simulados & Estratégia
  {
    id: 'rec-simulado-tri',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Simulado TRI Oficial (INEP)',
    subtitle: 'Simulados & Estratégia • Prova Real Cronometrada',
    description: 'Simulações completas com cálculo real da TRI (Teoria de Resposta ao Item) e pesos por área.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'target',
    tags: ['simulado', 'tri', 'oficial', 'inep', 'cronometro', 'caderno', 'nota tri', 'peso'],
    destinationLabel: 'Módulo Simulados → Simulado TRI Oficial',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'simulado_tri',
  },
  {
    id: 'rec-simulado-adaptativo',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Simulado Adaptativo com IA',
    subtitle: 'Simulados & Estratégia • Calibrado ao seu Nível',
    description: 'As questões ficam mais fáceis ou difíceis dinamicamente dependendo dos seus acertos.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'sliders',
    tags: ['simulado adaptativo', 'ia', 'dificuldade dinamica', 'questoes calibradas', 'nivel'],
    destinationLabel: 'Módulo Simulados → Simulado Adaptativo',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'simulado_adaptativo',
  },
  {
    id: 'rec-caderno-erros',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Caderno de Erros Personalizado',
    subtitle: 'Simulados & Estratégia • Revisão dos Pontos Fracos',
    description: 'Banco inteligente que guarda as questões que você errou nos simulados para você refazer até dominar.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'bookmark',
    tags: ['caderno de erros', 'erros', 'revisao', 'pontos fracos', 'questoes erradas', 'aprender com erro'],
    destinationLabel: 'Módulo Simulados → Caderno de Erros',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'caderno_erros',
  },
  {
    id: 'rec-reels-feed',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Feed Reels de Questões Rápidas',
    subtitle: 'Simulados & Estratégia • Formato TikTok / Vertical',
    description: 'Responda questões rápidas em feed contínuo com resolução em vídeo/texto e feedback instantâneo.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'zap',
    tags: ['reels', 'feed', 'questoes rapidas', 'vertical', 'tiktok', 'quiz continuo'],
    destinationLabel: 'Módulo Simulados → Feed Reels',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'reels_feed',
  },
  {
    id: 'rec-chute-consciente',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Chute Consciente & Estratégia TRI',
    subtitle: 'Simulados & Estratégia • Eliminação de Alternativas',
    description: 'Técnicas para identificar distratores absurdos e manter a coerência pedagógica da prova.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'compass',
    tags: ['chute consciente', 'estrategia', 'tri', 'distratores', 'eliminacao', 'coerencia pedagogica'],
    destinationLabel: 'Módulo Simulados → Chute Consciente',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'estratégia_chute',
  },
  {
    id: 'rec-som-ambiente',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Som Ambiente de Prova (Foco Real)',
    subtitle: 'Simulados & Estratégia • Aclimatação Sonora',
    description: 'Ruídos reais de sala de exame (folhas de papel virando, passos, canetas) para treinar foco.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'volume',
    tags: ['som ambiente', 'ruido branco', 'sala de prova', 'foco', 'aclimatacao', 'barulho enem'],
    destinationLabel: 'Módulo Simulados → Som Ambiente de Prova',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'som_ambiente',
  },
  {
    id: 'rec-leitor-gabarito',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Leitor Óptico de Gabarito',
    subtitle: 'Simulados & Estratégia • Scanner de Folha Resposta',
    description: 'Fotografe seu cartão-resposta preenchido e receba a correção automática em segundos.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'camera',
    tags: ['leitor optico', 'scanner gabarito', 'cartao resposta', 'correcao automatica', 'foto da folha'],
    destinationLabel: 'Módulo Simulados → Leitor de Gabarito',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'corretor_gabarito',
  },
  {
    id: 'rec-batalha-x1',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Batalha X1 de Questões (Quiz Rápido)',
    subtitle: 'Simulados & Estratégia • Desafios contra o Relógio',
    description: 'Duelos ágeis de 5 perguntas para testar seus reflexos e conhecimento sob pressão de tempo.',
    badgeLabel: 'Simulados',
    badgeColor: 'emerald',
    iconType: 'swords',
    tags: ['batalha', 'desafios', 'quiz rapido', 'x1', 'tempo', 'jogo de questoes'],
    destinationLabel: 'Módulo Simulados → Batalha X1 de Questões',
    actionType: 'navigate_tab',
    primaryTab: 'simulados_treino',
    subTab: 'desafios',
  },

  // Arena & Gamificação
  {
    id: 'rec-arena-x1',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Arena X1 (Duelos ao Vivo)',
    subtitle: 'Arena & Gamificação • Multiplayer em Tempo Real',
    description: 'Desafie outros estudantes online em duelos síncronos de matérias e suba nas ligas nacionais.',
    badgeLabel: 'Arena X1',
    badgeColor: 'amber',
    iconType: 'swords',
    tags: ['arena', 'x1', 'duelos', 'ao vivo', 'multiplayer', 'competitivo', 'trofeus', 'ligas'],
    destinationLabel: 'Módulo Arena → Arena X1 ao Vivo',
    actionType: 'navigate_tab',
    primaryTab: 'arena',
    subTab: 'arena_x1',
  },
  {
    id: 'rec-ranking',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Ranking Semanal por Estado',
    subtitle: 'Arena & Gamificação • Ligas e Classificação',
    description: 'Acompanhe sua pontuação, suba de liga (Bronze a Diamante) e compare seu desempenho com sua região.',
    badgeLabel: 'Gamificação',
    badgeColor: 'amber',
    iconType: 'trophy',
    tags: ['ranking', 'classificacao', 'ligas', 'ouro', 'diamante', 'estado', 'top estudantes', 'xp'],
    destinationLabel: 'Perfil & Gamificação → Ranking Semanal',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'ranking',
  },
  {
    id: 'rec-mascote-xp',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Mascote Gabaritão & Pontos XP',
    subtitle: 'Arena & Gamificação • Níveis, Ofensiva e Recompensas',
    description: 'Evolua o mascote estudando diariamente, mantenha sua ofensiva viva e desbloqueie conquistas.',
    badgeLabel: 'Gamificação',
    badgeColor: 'amber',
    iconType: 'award',
    tags: ['mascote', 'gabaritao', 'xp', 'nivel', 'streak', 'ofensiva', 'recompensas', 'conquistas'],
    destinationLabel: 'Perfil & Gamificação → Mascote Gabaritão',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'mascote_xp',
  },
  {
    id: 'rec-estatisticas',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Estatísticas de Estudo & Desempenho',
    subtitle: 'Ferramentas de Estudo • Métricas Detalhadas',
    description: 'Gráficos de horas dedicadas, precisão por matéria, evolução temporal e projeção de nota.',
    badgeLabel: 'Ferramentas',
    badgeColor: 'cyan',
    iconType: 'sliders',
    tags: ['estatisticas', 'graficos', 'horas estudadas', 'taxa de acertos', 'desempenho', 'projecao'],
    destinationLabel: 'Perfil & Gamificação → Estatísticas',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'estatisticas_estudo',
  },
  {
    id: 'rec-reta-final',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Modo Reta Final (30 Dias para o ENEM)',
    subtitle: 'Ferramentas de Estudo • Cronograma de Emergência',
    description: 'Roteiro intensivo priorizando apenas os tópicos com 80% de chance de queda para a reta final.',
    badgeLabel: 'Ferramentas',
    badgeColor: 'cyan',
    iconType: 'flame',
    tags: ['reta final', '30 dias', 'emergencia', 'cronograma intensivo', 'revisao final', 'o que priorizar'],
    destinationLabel: 'Perfil & Gamificação → Modo Reta Final',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'reta_final',
  },
  {
    id: 'rec-planner',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Planner & Rotina Semanal de Estudos',
    subtitle: 'Ferramentas de Estudo • Gestão de Horários',
    description: 'Organize blocos de matérias de segunda a domingo respeitando seus períodos de maior concentração.',
    badgeLabel: 'Ferramentas',
    badgeColor: 'cyan',
    iconType: 'calendar',
    tags: ['planner', 'rotina', 'horarios', 'planejamento semanal', 'organizacao', 'cronograma'],
    destinationLabel: 'Perfil & Gamificação → Planner Semanal',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'planner_rotina',
  },
  {
    id: 'rec-sisu',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Simulador SISU (Notas de Corte)',
    subtitle: 'Ferramentas de Estudo • Universidades Federais',
    description: 'Simule sua aprovação em Medicina, Direito e Engenharias nas universidades com pesos específicos.',
    badgeLabel: 'Ferramentas',
    badgeColor: 'cyan',
    iconType: 'graduation',
    tags: ['sisu', 'simulador sisu', 'notas de corte', 'universidades federais', 'medicina', 'direito', 'pesos'],
    destinationLabel: 'Perfil & Gamificação → Simulador SISU',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'sisu_simulator',
  },
  {
    id: 'rec-folha-vespera',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Folha de Véspera (Cheat Sheet ENEM)',
    subtitle: 'Ferramentas de Estudo • Revisão Relâmpago',
    description: 'Resumo ultradensificado com as fórmulas e conceitos indispensáveis para ler 24h antes da prova.',
    badgeLabel: 'Ferramentas',
    badgeColor: 'cyan',
    iconType: 'file',
    tags: ['folha de vespera', 'cheat sheet', 'dia da prova', 'formulas', 'revisao relampago', 'urgente'],
    destinationLabel: 'Perfil & Gamificação → Folha de Véspera',
    actionType: 'navigate_tab',
    primaryTab: 'perfil_gamificacao',
    subTab: 'folha_vespera',
  },

  // Modais e Assistentes Virtuais
  {
    id: 'rec-gabi',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Professora Gabi IA (Tutora Virtual)',
    subtitle: 'Assistente Inteligente • Chat 24/7',
    description: 'Converse com a Gabi para tirar dúvidas conceituais, pedir conselhos de estudo e reforço imediato.',
    badgeLabel: 'Assistente',
    badgeColor: 'purple',
    iconType: 'sparkles',
    tags: ['gabi', 'professora gabi', 'assistente', 'chat ia', 'tutora', 'ajuda', 'mentor', 'duvidas'],
    destinationLabel: 'Abrir Chat com Professora Gabi IA',
    actionType: 'open_modal',
    modalName: 'gabi',
  },
  {
    id: 'rec-banca',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Personalidade da Banca IA',
    subtitle: 'Configurações • Estilo ENEM, FUVEST e VUNESP',
    description: 'Ajuste o tom e o rigor da inteligência artificial para o vestibular específico que você vai prestar.',
    badgeLabel: 'Assistente',
    badgeColor: 'purple',
    iconType: 'sliders',
    tags: ['banca', 'personalidade', 'fuvest', 'unicamp', 'vunesp', 'estilo de prova', 'enem'],
    destinationLabel: 'Abrir Seletor de Banca IA',
    actionType: 'open_modal',
    modalName: 'banca',
  },
  {
    id: 'rec-calendario',
    category: 'recursos',
    itemType: 'recurso',
    title: 'Calendário de Estudos & Ofensiva',
    subtitle: 'Rotina • Dias Consecutivos e Provas',
    description: 'Acompanhe seus dias estudados, data oficial do ENEM e contagem regressiva para os exames.',
    badgeLabel: 'Rotina',
    badgeColor: 'purple',
    iconType: 'calendar',
    tags: ['calendario', 'streak', 'ofensiva', 'dias seguidos', 'frequencia', 'datas', 'contagem regressiva'],
    destinationLabel: 'Abrir Calendário de Estudos',
    actionType: 'open_modal',
    modalName: 'calendar',
  },
];

// 2. Banco Curado de Tópicos de Flashcards Prontos para Repetição Espaçada
const CURATED_FLASHCARD_TOPICS = [
  {
    id: 'fc-ecologia',
    title: 'Flashcards: Ecologia & Biomas',
    subtitle: 'Biologia • Relações Ecológicas e Impactos',
    description: 'Deck completo com cadeia trófica, bioacumulação, eutrofização e ciclos biogeoquímicos.',
    materia: 'Biologia',
    topicParam: 'Ecologia',
    tags: ['ecologia', 'biologia', 'cadeia trofica', 'bioacumulacao', 'eutrofizacao', 'biomas', 'sustentabilidade'],
  },
  {
    id: 'fc-geometria-plana',
    title: 'Flashcards: Geometria Plana',
    subtitle: 'Matemática • Áreas e Relações Métricas',
    description: 'Fórmulas essenciais de triângulos, círculos, quadriláteros, Teorema de Pitágoras e semelhança.',
    materia: 'Matemática',
    topicParam: 'Geometria Plana',
    tags: ['geometria plana', 'matematica', 'areas', 'pitagoras', 'triangulos', 'circulo', 'trigonometria'],
  },
  {
    id: 'fc-termoquimica',
    title: 'Flashcards: Termoquímica & Entalpia',
    subtitle: 'Química • Calor de Reação e Lei de Hess',
    description: 'Conceitos de reações endotérmicas e exotérmicas, energia de ligação e cálculos de delta H.',
    materia: 'Química',
    topicParam: 'Termoquímica',
    tags: ['termoquimica', 'quimica', 'entalpia', 'lei de hess', 'calor de reacao', 'endotermica', 'exotermica'],
  },
  {
    id: 'fc-brasil-colonia',
    title: 'Flashcards: Brasil Colônia',
    subtitle: 'História • Ciclos Econômicos e Escravidão',
    description: 'Pacto colonial, cana-de-açúcar, mineração, escravismo e revoltas nativistas e separatistas.',
    materia: 'História',
    topicParam: 'Brasil Colônia',
    tags: ['brasil colonia', 'historia', 'ouro', 'mineracao', 'acucar', 'escravidao', 'inconfidencia'],
  },
  {
    id: 'fc-estatistica',
    title: 'Flashcards: Estatística ENEM',
    subtitle: 'Matemática • Média, Moda e Mediana',
    description: 'Interpretação de gráficos, tabelas de distribuição de frequência e desvio padrão.',
    materia: 'Matemática',
    topicParam: 'Estatística',
    tags: ['estatistica', 'matematica', 'media', 'moda', 'mediana', 'graficos', 'tabelas'],
  },
  {
    id: 'fc-funcoes',
    title: 'Flashcards: Funções de 1º e 2º Grau',
    subtitle: 'Matemática • Gráficos, Raízes e Vértice',
    description: 'Estudo do coeficiente angular, parábolas, ponto de máximo/mínimo e aplicações financeiras.',
    materia: 'Matemática',
    topicParam: 'Funções de 1º e 2º Grau',
    tags: ['funcoes', 'matematica', 'primeiro grau', 'segundo grau', 'parabola', 'vertice', 'raizes'],
  },
  {
    id: 'fc-revolucao-industrial',
    title: 'Flashcards: Revolução Industrial',
    subtitle: 'História • 1ª, 2ª e 3ª Fases',
    description: 'Transformações nas relações de trabalho, êxodo rural, taylorismo, fordismo e revolução tecnológica.',
    materia: 'História',
    topicParam: 'Revolução Industrial',
    tags: ['revolucao industrial', 'historia', 'trabalho', 'fabrica', 'urbanizacao', 'fordismo', 'taylorismo'],
  },
  {
    id: 'fc-eletrodinamica',
    title: 'Flashcards: Eletrodinâmica & Circuitos',
    subtitle: 'Física • Lei de Ohm, Potência e Consumo',
    description: 'Associação de resistores (série e paralelo), fusíveis, voltímetro, amperímetro e cálculo de kWh.',
    materia: 'Física',
    topicParam: 'Eletrodinâmica',
    tags: ['eletrodinamica', 'fisica', 'circuitos', 'resistores', 'lei de ohm', 'potencia', 'consumo eletrico'],
  },
  {
    id: 'fc-ondulatoria',
    title: 'Flashcards: Ondulatória & Espectro',
    subtitle: 'Física • Fenômenos Ondulatórios',
    description: 'Difração, refração, polarização, ressonância, interferência e velocidade de propagação (v = λ · f).',
    materia: 'Física',
    topicParam: 'Ondulatória',
    tags: ['ondulatoria', 'fisica', 'ondas', 'difracao', 'refracao', 'polarizacao', 'ressonancia'],
  },
  {
    id: 'fc-genetica',
    title: 'Flashcards: Genética & Biotecnologia',
    subtitle: 'Biologia • Leis de Mendel e DNA Recombinante',
    description: 'Heredogramas, grupos sanguíneos (ABO e Rh), transgênicos, clonagem e terapia gênica.',
    materia: 'Biologia',
    topicParam: 'Genética',
    tags: ['genetica', 'biologia', 'mendel', 'dna', 'heredograma', 'transgenicos', 'biotecnologia'],
  },
  {
    id: 'fc-estequiometria',
    title: 'Flashcards: Estequiometria & Soluções',
    subtitle: 'Química • Cálculos e Concentrações',
    description: 'Mol, massa molar, pureza e rendimento de reações químicas e cálculo de molaridade.',
    materia: 'Química',
    topicParam: 'Estequiometria',
    tags: ['estequiometria', 'quimica', 'mol', 'massa molar', 'solucoes', 'pureza', 'rendimento'],
  },
  {
    id: 'fc-cidadania',
    title: 'Flashcards: Cidadania & Direitos Humanos',
    subtitle: 'Filosofia/Sociologia • Democracia e Minorias',
    description: 'Gerações de direitos, Constituição de 1988, estratificação social e movimentos por igualdade.',
    materia: 'Humanas',
    topicParam: 'Cidadania e Direitos Humanos',
    tags: ['cidadania', 'direitos humanos', 'sociologia', 'filosofia', 'democracia', 'constituicao', 'minorias'],
  },
];

export const HeaderGlobalSearch: React.FC<HeaderGlobalSearchProps> = ({
  materials = [],
  tutorPlans = [],
  eli5Explanations = [],
  onSelectMaterial,
  onSelectTutorPlan,
  onSelectELI5,
  onNavigate,
  onOpenModal,
  onSelectFlashcardTopic,
  onShowToast,
  className = '',
  autoFocus = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategoryFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isMac, setIsMac] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
      setIsOpen(true);
    }
  }, [autoFocus]);

  // Detect OS for shortcut label (⌘K or Ctrl+K)
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
        setIsMac(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K or "/" to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // Trigger on Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        return;
      }

      // Trigger on "/" when not already typing in another input
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 3. Computed Index of All Disciplines and Topics from ENEM_CATALOG
  const catalogItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    for (const area of ENEM_CATALOG) {
      for (const disc of area.disciplinas) {
        // Add the discipline entry
        items.push({
          id: `cat-disc-${disc.id}`,
          category: 'conteudos',
          itemType: 'conteudo',
          title: `${disc.nome} (${area.sigla})`,
          subtitle: `${area.areaNome} • Disciplina Completa`,
          description: `Catálogo de habilidades e conteúdos essenciais de ${disc.nome} mapeados para o ENEM.`,
          badgeLabel: area.sigla,
          badgeColor: area.id === 'natureza' ? 'emerald' : area.id === 'humanas' ? 'amber' : area.id === 'matematica' ? 'cyan' : 'rose',
          iconType: 'book',
          tags: [disc.nome, area.areaNome, area.sigla, 'disciplina', 'conteudos', 'edital'],
          destinationLabel: `Catálogo do Edital → ${disc.nome}`,
          actionType: 'navigate_tab',
          primaryTab: 'conteudos',
          subTab: 'catalogo',
        });

        // Add each topic
        for (const topic of disc.topicos) {
          items.push({
            id: `cat-top-${topic.id}`,
            category: 'conteudos',
            itemType: 'conteudo',
            title: `${topic.nome} • ${disc.nome}`,
            subtitle: `${area.sigla} • Incidência: ${topic.incidencia}`,
            description: `${topic.descricao} Dica-chave: ${topic.dicaChave}`,
            badgeLabel: topic.incidencia,
            badgeColor: topic.incidencia === 'Mais Cai' ? 'rose' : topic.incidencia === 'Médio' ? 'amber' : 'slate',
            iconType: topic.incidencia === 'Mais Cai' ? 'flame' : 'book',
            tags: [topic.nome, disc.nome, area.sigla, topic.incidencia, topic.descricao, topic.dicaChave],
            destinationLabel: `Catálogo do Edital → ${disc.nome}`,
            actionType: 'navigate_tab',
            primaryTab: 'conteudos',
            subTab: 'catalogo',
          });
        }
      }
    }

    return items;
  }, []);

  // 4. Computed Curated Flashcards Items
  const flashcardItems = useMemo<SearchResultItem[]>(() => {
    return CURATED_FLASHCARD_TOPICS.map((fc) => ({
      id: fc.id,
      category: 'flashcards',
      itemType: 'flashcard',
      title: fc.title,
      subtitle: fc.subtitle,
      description: fc.description,
      badgeLabel: fc.materia,
      badgeColor: 'indigo',
      iconType: 'zap',
      tags: [...fc.tags, 'flashcard', 'deck', 'repeticao'],
      destinationLabel: 'Flashcards Bento IA → Estudo Ativo',
      actionType: 'flashcard_topic',
      primaryTab: 'conteudos',
      subTab: 'flashcards',
      flashcardTopic: fc.topicParam,
    }));
  }, []);

  // 5. Computed User History Items (Materials, Tutor Plans, ELI5)
  const historyItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // Materials
    for (const mat of materials) {
      const title = mat.title || 'Resumo de Estudo';
      const focus = mat.focusTopic || '';
      const summary = mat.resumoDireto || '';
      const bullets = (mat.pontosPrincipais || []).join(' ');
      const cards = (mat.flashcards || []).map((f) => `${f.frente} ${f.verso}`).join(' ');
      const fullText = `${title} ${focus} ${summary} ${bullets} ${cards} ${mat.originalText || ''}`;

      items.push({
        id: `hist-mat-${mat.id}`,
        category: 'historico',
        itemType: 'material',
        title: title,
        subtitle: focus ? `Resumo Salvo • ${focus}` : 'Resumo Salvo no Histórico',
        description: summary || bullets || 'Resumo gerado com flashcards e quiz interativo.',
        badgeLabel: 'Meu Resumo',
        badgeColor: 'indigo',
        iconType: 'file',
        tags: [title, focus, summary, bullets, cards, 'historico', 'meu resumo'],
        destinationLabel: 'Abrir Quiz Interativo & Resumo',
        actionType: 'history_item',
        rawHistoryItem: mat,
        dateStr: formatDateDisplay(mat.createdAt),
        timestamp: new Date(mat.createdAt).getTime() || 0,
      });
    }

    // Tutor Plans
    for (const plan of tutorPlans) {
      const title = `Plano Coach: ${plan.materia}`;
      const objective = plan.objetivo || '';
      const summary = plan.aulaResumo || '';
      const schedule = (plan.cronograma || []).map((c) => `${c.etapa}: ${c.descricao}`).join(' ');
      const fullText = `${plan.materia} ${plan.serieAno} ${objective} ${summary} ${schedule}`;

      items.push({
        id: `hist-tutor-${plan.id}`,
        category: 'historico',
        itemType: 'tutor',
        title: title,
        subtitle: `Plano de Estudo • ${plan.tempoDisponivel || 'Coach'}`,
        description: objective || summary || 'Cronograma estruturado com etapas de estudo e exercícios.',
        badgeLabel: 'Meu Plano',
        badgeColor: 'amber',
        iconType: 'calendar',
        tags: [plan.materia, plan.serieAno || '', objective, summary, schedule, 'historico', 'plano coach'],
        destinationLabel: 'Abrir Plano de Estudos no Catálogo',
        actionType: 'history_item',
        rawHistoryItem: plan,
        dateStr: formatDateDisplay(plan.createdAt),
        timestamp: new Date(plan.createdAt).getTime() || 0,
      });
    }

    // ELI5 Explanations
    for (const exp of eli5Explanations) {
      const title = `ELI5: ${exp.duvida}`;
      const analogy = exp.analogiaSimples || '';
      const goldTip = exp.dicaDeOuro || '';
      const steps = (exp.passoAPasso || []).join(' ');

      items.push({
        id: `hist-eli5-${exp.id}`,
        category: 'historico',
        itemType: 'eli5',
        title: title,
        subtitle: 'Dúvida Descomplicada Salva',
        description: analogy || goldTip || 'Explicação simples com analogia e passo a passo.',
        badgeLabel: 'Minha Dúvida',
        badgeColor: 'purple',
        iconType: 'lightbulb',
        tags: [exp.duvida, analogy, goldTip, steps, 'historico', 'eli5', 'duvida'],
        destinationLabel: 'Abrir Explicação Passo a Passo',
        actionType: 'history_item',
        rawHistoryItem: exp,
        dateStr: formatDateDisplay(exp.createdAt),
        timestamp: new Date(exp.createdAt).getTime() || 0,
      });
    }

    return items;
  }, [materials, tutorPlans, eli5Explanations]);

  // Master Collection of Searchable Items
  const allCorpusItems = useMemo<SearchResultItem[]>(() => {
    return [
      ...APP_RESOURCES,
      ...flashcardItems,
      ...catalogItems,
      ...historyItems,
    ];
  }, [flashcardItems, catalogItems, historyItems]);

  // Execute Search Filtering across all collections
  const allResults = useMemo<SearchResultItem[]>(() => {
    const query = searchTerm.trim();
    if (!query) {
      // Return empty query suggestions when no search term is entered
      return [];
    }

    const normQuery = normalizeSearchText(query);
    const tokens = normQuery.split(/\s+/).filter(Boolean);

    const scored: Array<{ item: SearchResultItem; score: number }> = [];

    for (const item of allCorpusItems) {
      const normTitle = normalizeSearchText(item.title);
      const normSubtitle = normalizeSearchText(item.subtitle);
      const normDesc = normalizeSearchText(item.description);
      const normTags = (item.tags || []).map(normalizeSearchText).join(' ');
      const corpus = `${normTitle} ${normSubtitle} ${normDesc} ${normTags}`;

      const allTokensPresent = tokens.every((tok) => corpus.includes(tok));
      if (!allTokensPresent) continue;

      let score = 0;
      // Exact title match
      if (normTitle === normQuery) score += 100;
      else if (normTitle.startsWith(normQuery)) score += 60;
      else if (normTitle.includes(normQuery)) score += 40;

      // Subtitle or Tags match
      if (normSubtitle.includes(normQuery)) score += 20;
      if (normTags.includes(normQuery)) score += 25;

      // Type weight (Resources and Flashcards have high intent priority)
      if (item.category === 'recursos') score += 15;
      else if (item.category === 'flashcards') score += 12;
      else if (item.category === 'historico') score += 10;
      else score += 5;

      scored.push({ item, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }, [allCorpusItems, searchTerm]);

  // Filtered by selected Category Chip
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return allResults;
    return allResults.filter((item) => item.category === activeCategory);
  }, [allResults, activeCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    let recCount = 0;
    let fcCount = 0;
    let contCount = 0;
    let histCount = 0;

    for (const item of allResults) {
      if (item.category === 'recursos') recCount++;
      else if (item.category === 'flashcards') fcCount++;
      else if (item.category === 'conteudos') contCount++;
      else if (item.category === 'historico') histCount++;
    }

    return {
      all: allResults.length,
      recursos: recCount,
      flashcards: fcCount,
      conteudos: contCount,
      historico: histCount,
    };
  }, [allResults]);

  // Quick Action / Selection Handler
  const handleSelectItem = (item: SearchResultItem) => {
    playClickSound();
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);

    if (item.actionType === 'navigate_tab') {
      if (onNavigate && item.primaryTab) {
        onNavigate(item.primaryTab, item.subTab);
      }
      if (onShowToast) {
        onShowToast(`🚀 Acessando: ${item.title}`, 'info');
      }
    } else if (item.actionType === 'open_modal') {
      if (onOpenModal && item.modalName) {
        onOpenModal(item.modalName);
      }
      if (onShowToast) {
        onShowToast(`✨ Abrindo: ${item.title}`, 'info');
      }
    } else if (item.actionType === 'flashcard_topic') {
      if (onSelectFlashcardTopic && item.flashcardTopic) {
        onSelectFlashcardTopic(item.flashcardTopic);
      } else if (onNavigate) {
        onNavigate('conteudos', 'flashcards');
      }
      if (onShowToast) {
        onShowToast(`🎴 Abrindo Flashcards: ${item.title}`, 'success');
      }
    } else if (item.actionType === 'history_item' && item.rawHistoryItem) {
      if (item.itemType === 'material') {
        onSelectMaterial?.(item.rawHistoryItem as StudyMaterial);
        onShowToast?.(`📄 Abrindo Resumo: ${item.title}`, 'info');
      } else if (item.itemType === 'tutor') {
        onSelectTutorPlan?.(item.rawHistoryItem as TutorPlan);
        onShowToast?.(`📅 Abrindo Plano Coach: ${item.title}`, 'info');
      } else if (item.itemType === 'eli5') {
        onSelectELI5?.(item.rawHistoryItem as ELI5Explanation);
        onShowToast?.(`💡 Abrindo Explicação: ${item.title}`, 'info');
      }
    }
  };

  // Keyboard navigation within the dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      } else if (filteredResults.length > 0) {
        handleSelectItem(filteredResults[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Ensure highlighted item scrolls into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Helper icon renderer
  const renderItemIcon = (iconType: string, category: string) => {
    switch (iconType) {
      case 'pen':
        return <PenTool className="w-4 h-4" />;
      case 'zap':
        return <Zap className="w-4 h-4" />;
      case 'target':
        return <Target className="w-4 h-4" />;
      case 'swords':
        return <Swords className="w-4 h-4" />;
      case 'brain':
        return <Brain className="w-4 h-4" />;
      case 'book':
        return <BookOpen className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'clock':
        return <Clock className="w-4 h-4" />;
      case 'camera':
        return <Camera className="w-4 h-4" />;
      case 'mic':
        return <Mic className="w-4 h-4" />;
      case 'volume':
        return <Volume2 className="w-4 h-4" />;
      case 'flame':
        return <Flame className="w-4 h-4" />;
      case 'trophy':
        return <Trophy className="w-4 h-4" />;
      case 'award':
        return <Award className="w-4 h-4" />;
      case 'graduation':
        return <GraduationCap className="w-4 h-4" />;
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'lightbulb':
        return <Lightbulb className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      case 'layers':
        return <Layers className="w-4 h-4" />;
      default:
        return category === 'recursos' ? <Zap className="w-4 h-4" /> : <Search className="w-4 h-4" />;
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'cyan':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'indigo':
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  const getIconContainerStyle = (color: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900';
      case 'amber':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900';
      case 'emerald':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'cyan':
        return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900';
      case 'indigo':
      default:
        return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900';
    }
  };

  // Trending / Quick Access Suggestions when input is empty
  const quickSuggestions = [
    { label: '✍️ Corretor de Redação', query: 'Corretor' },
    { label: '🎴 Flashcards Bento', query: 'Flashcards' },
    { label: '📝 Simulado TRI', query: 'Simulado TRI' },
    { label: '⚔️ Arena X1', query: 'Arena' },
    { label: '🌿 Ecologia', query: 'Ecologia' },
    { label: '📐 Geometria Plana', query: 'Geometria' },
    { label: '🏛️ Repertórios Coringa', query: 'Repertórios' },
    { label: '🦁 Mascote & XP', query: 'Mascote' },
    { label: '🎯 Modo Reta Final', query: 'Reta Final' },
  ];

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 min-w-[200px] w-full max-w-xl ${className}`}
    >
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center w-full transition-all duration-200 rounded-xl border ${
          isOpen
            ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-lg'
            : 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 shadow-xs'
        }`}
      >
        <div className="pl-3 pr-2 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className={`w-4 h-4 transition-colors ${isOpen ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar recursos, flashcards ou matérias..."
          className="w-full py-2 bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none pr-16"
          aria-label="Buscar recursos, flashcards, conteúdos e histórico no aplicativo"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button or Keyboard Shortcut */}
        <div className="absolute right-2 flex items-center space-x-1">
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-300/60 dark:border-slate-600/60 pointer-events-none select-none">
              <span className="text-[9px] mr-0.5">{isMac ? '⌘' : 'Ctrl'}</span>
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Results Popover */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-2 top-14 sm:inset-x-auto sm:top-full sm:left-0 sm:right-0 mt-1 sm:mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[85vh] sm:max-h-[520px]">
          {/* Top Bar with Category Filter Pills */}
          <div className="px-3 py-2 bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center space-x-1 text-[11px] font-bold shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSelectedIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                Todos ({searchTerm ? categoryCounts.all : allCorpusItems.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('recursos');
                  setSelectedIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'recursos'
                    ? 'bg-rose-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Recursos ({searchTerm ? categoryCounts.recursos : APP_RESOURCES.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('flashcards');
                  setSelectedIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'flashcards'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Flashcards ({searchTerm ? categoryCounts.flashcards : flashcardItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('conteudos');
                  setSelectedIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'conteudos'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Matérias ({searchTerm ? categoryCounts.conteudos : catalogItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory('historico');
                  setSelectedIndex(-1);
                }}
                className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'historico'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Meu Histórico ({searchTerm ? categoryCounts.historico : historyItems.length})</span>
              </button>
            </div>
          </div>

          {/* Results List or Quick Suggestions */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60"
          >
            {searchTerm.trim() ? (
              filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => {
                  const isSelected = selectedIndex === idx;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group pt-2.5 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 shadow-xs'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 border shadow-xs ${getIconContainerStyle(
                          item.badgeColor
                        )}`}
                      >
                        {renderItemIcon(item.iconType, item.category)}
                      </div>

                      {/* Item Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </span>

                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md shrink-0 border ${getBadgeStyle(
                              item.badgeColor
                            )}`}
                          >
                            {item.badgeLabel}
                          </span>
                        </div>

                        {item.subtitle && (
                          <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-1 pt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <span className="truncate max-w-[80%] text-slate-400 dark:text-slate-500">
                            {item.destinationLabel}
                          </span>

                          <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            Acessar <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Nenhum resultado encontrado para "{searchTerm}"
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Tente termos como "Redação", "Simulado TRI", "Ecologia", "Geometria", "Arena X1" ou "Repertórios".
                  </p>
                </div>
              )
            ) : (
              // Empty Search State: Show Trending Topics and Popular Modules
              <div className="p-3 sm:p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                      <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Acesso Rápido & Mais Buscados</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 sm:hidden">Deslize para ver mais →</span>
                  </div>

                  {/* Chips container with flexible layout and horizontal scroll on small mobile */}
                  <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0 scrollbar-none whitespace-nowrap">
                    {quickSuggestions.map((sug) => (
                      <button
                        key={sug.label}
                        type="button"
                        onClick={() => {
                          setSearchTerm(sug.query);
                          inputRef.current?.focus();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-bold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer active:scale-95 shrink-0"
                      >
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Ferramentas em Destaque</span>
                    </div>
                    <span className="text-[10px] text-slate-400">31 recursos disponíveis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {APP_RESOURCES.slice(0, 6).map((rec) => (
                      <button
                        key={rec.id}
                        type="button"
                        onClick={() => handleSelectItem(rec)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-left transition group cursor-pointer"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs border ${getIconContainerStyle(
                            rec.badgeColor
                          )}`}
                        >
                          {renderItemIcon(rec.iconType, rec.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {rec.title}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {rec.badgeLabel}
                          </p>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Shortcuts hint */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[9px] font-mono">↑</kbd>
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[9px] font-mono">↓</kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[9px] font-mono">Enter</kbd>
                Abrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[9px] font-mono">Esc</kbd>
                Fechar
              </span>
            </div>

            <span className="text-[10px] sm:hidden text-slate-500 dark:text-slate-400">
              Toque em um item para abrir
            </span>

            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              {searchTerm ? `${filteredResults.length} encontrados` : `${allCorpusItems.length} itens indexados`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

