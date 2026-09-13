import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  PenTool, 
  Target, 
  Swords, 
  Wrench, 
  Flame, 
  Search, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { PrimaryTab } from './BottomNavigationBar';
import { AbaAtiva } from './NavigationTabs';
import { playClickSound } from '../utils/audio';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  primaryTab: PrimaryTab;
  subTab: AbaAtiva;
  isPopular?: boolean;
  highlightGradient?: string;
}

interface CategoryGroup {
  id: string;
  title: string;
  icon: React.ReactNode;
  emoji: string;
  badge: string;
  description: string;
  borderHoverColor: string;
  headerAccent: string;
  resources: ResourceItem[];
}

interface HomeHubCategoriesProps {
  onNavigate: (primaryTab: PrimaryTab, subTab: AbaAtiva) => void;
}

export const HomeHubCategories: React.FC<HomeHubCategoriesProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleResourceClick = (primaryTab: PrimaryTab, subTab: AbaAtiva) => {
    playClickSound();
    onNavigate(primaryTab, subTab);
  };

  // Top 4 Acesso Rápido Resources (Highlighted)
  const quickAccessResources: ResourceItem[] = [
    {
      id: 'quick_flashcards',
      title: 'Resumos & Flashcards',
      description: 'Fórmulas, conceitos e tópicos com repetição ativa',
      icon: '⚡',
      tag: 'Mais Acessado',
      primaryTab: 'conteudos',
      subTab: 'flashcards',
      isPopular: true,
      highlightGradient: 'from-amber-500/20 via-orange-500/15 to-purple-600/20 border-amber-500/50 hover:border-amber-400 text-amber-300',
    },
    {
      id: 'quick_redacao',
      title: 'Corretor de Redação',
      description: 'Correção instantânea C1-C5 padrão Nota 1000',
      icon: '✍️',
      tag: 'IA Oficial',
      primaryTab: 'redacao_ia',
      subTab: 'redacao',
      isPopular: true,
      highlightGradient: 'from-rose-500/20 via-pink-500/10 to-slate-900 border-rose-500/40 hover:border-rose-400 text-rose-300',
    },
    {
      id: 'quick_simulado',
      title: 'Simulado TRI Oficial',
      description: 'Provas cronometradas com cálculo pedagógico TRI',
      icon: '📝',
      tag: 'Treino Real',
      primaryTab: 'simulados_treino',
      subTab: 'simulado_tri',
      isPopular: true,
      highlightGradient: 'from-cyan-500/20 via-blue-500/10 to-slate-900 border-cyan-500/40 hover:border-cyan-400 text-cyan-300',
    },
    {
      id: 'quick_arena',
      title: 'Arena X1 (Duelos)',
      description: 'Duelos 1v1 ao vivo com estudantes do Brasil',
      icon: '⚔️',
      tag: 'Multiplayer',
      primaryTab: 'arena',
      subTab: 'arena_x1',
      isPopular: true,
      highlightGradient: 'from-indigo-500/20 via-purple-500/10 to-slate-900 border-indigo-500/40 hover:border-indigo-400 text-indigo-300',
    },
  ];

  // Defined Category Groups based on user specification
  const categoryGroups: CategoryGroup[] = [
    {
      id: 'redacao_ia',
      title: '✍️ Redação & IA',
      icon: <PenTool className="w-5 h-5 text-rose-400" />,
      emoji: '✍️',
      badge: '5 recursos',
      description: 'Estruturação, análise de competências C1 a C5 e repertórios estratégicos.',
      borderHoverColor: 'hover:border-rose-500/40',
      headerAccent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      resources: [
        {
          id: 'redacao_corretor',
          title: 'Corretor de Redação',
          description: 'Diagnóstico C1-C5 com nota estimada e pontos de melhoria',
          icon: '✍️',
          tag: 'Nota 1000',
          primaryTab: 'redacao_ia',
          subTab: 'redacao',
        },
        {
          id: 'redacao_esqueleto',
          title: 'Esqueleto de Redação',
          description: 'Canvas visual para estruturar tese, D1, D2 e intervenção',
          icon: '🏗️',
          tag: 'Estrutura',
          primaryTab: 'redacao_ia',
          subTab: 'esquema_redacao',
        },
        {
          id: 'redacao_radar',
          title: 'Radar de Redação',
          description: 'Temas quentes e apostas temáticas do ano',
          icon: '🔥',
          tag: 'Tendências',
          primaryTab: 'redacao_ia',
          subTab: 'radar_redacao',
        },
        {
          id: 'redacao_c5',
          title: 'Detector C5 (Intervenção)',
          description: 'Checagem dos 5 elementos obrigatórios: agente, ação, meio, efeito e detalhamento',
          icon: '🔍',
          tag: '200 Pontos',
          primaryTab: 'redacao_ia',
          subTab: 'c5_intervencao',
        },
        {
          id: 'redacao_repertorio',
          title: 'Repertórios Coringa',
          description: 'Filósofos, alusões históricas, leis e dados sociológicos',
          icon: '📖',
          tag: 'Legitimado',
          primaryTab: 'redacao_ia',
          subTab: 'repertorio',
        },
      ],
    },
    {
      id: 'conteudos_memoria',
      title: '📚 Conteúdos & Memória',
      icon: <BookOpen className="w-5 h-5 text-amber-400" />,
      emoji: '📚',
      badge: '6 recursos',
      description: 'Sínteses visuais, mapas de raciocínio, matriz de competências e retenção ativa.',
      borderHoverColor: 'hover:border-amber-500/40',
      headerAccent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      resources: [
        {
          id: 'conteudo_flashcards',
          title: 'Resumos & Flashcards',
          description: 'Bento IA com resumos esquematizados e repetição espaçada',
          icon: '⚡',
          tag: 'Spaced Rep',
          primaryTab: 'conteudos',
          subTab: 'flashcards',
        },
        {
          id: 'conteudo_mapas',
          title: 'Mapas Mentais',
          description: 'Diagramas visuais conectando conceitos e matérias',
          icon: '🧠',
          tag: 'Visual',
          primaryTab: 'conteudos',
          subTab: 'mapas_mentais',
        },
        {
          id: 'conteudo_biblioteca',
          title: 'Biblioteca & Fichamentos',
          description: 'Fichamentos completos organizados por matéria e aula',
          icon: '📚',
          tag: 'Teoria',
          primaryTab: 'conteudos',
          subTab: 'biblioteca',
        },
        {
          id: 'conteudo_pilulas',
          title: 'Pílulas do Conhecimento',
          description: 'Micro-conteúdos rápidos de 90 segundos para fixação',
          icon: '💡',
          tag: 'Rápido',
          primaryTab: 'conteudos',
          subTab: 'pilulas_conhecimento',
        },
        {
          id: 'conteudo_catalogo',
          title: 'Catálogo do Edital',
          description: 'Todas as competências e habilidades da matriz do ENEM',
          icon: '📐',
          tag: 'Edital',
          primaryTab: 'conteudos',
          subTab: 'catalogo',
        },
        {
          id: 'conteudo_glossario',
          title: 'Glossário do Edital',
          description: 'Termos técnicos, vocabulário e pegadinhas recorrentes',
          icon: '📖',
          tag: 'Vocabulário',
          primaryTab: 'conteudos',
          subTab: 'glossario_enem',
        },
        {
          id: 'conteudo_ai_playground',
          title: 'AI Studio Playground',
          description: 'Laboratório multimodal para dúvidas, upload de imagens e documentos com Gemini',
          icon: '🤖',
          tag: 'Multimodal',
          primaryTab: 'conteudos',
          subTab: 'ai_playground',
        },
      ],
    },
    {
      id: 'simulados_estrategia',
      title: '📝 Simulados & Estratégia',
      icon: <Target className="w-5 h-5 text-cyan-400" />,
      emoji: '📝',
      badge: '5 recursos',
      description: 'Provas oficiais, cronômetro de aplicação, algoritmo TRI e gestão de erros.',
      borderHoverColor: 'hover:border-cyan-500/40',
      headerAccent: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      resources: [
        {
          id: 'simulado_tri',
          title: 'Simulado TRI Oficial',
          description: 'Provas cronometradas no modelo do INEP com nota TRI',
          icon: '📝',
          tag: 'TRI Real',
          primaryTab: 'simulados_treino',
          subTab: 'simulado_tri',
        },
        {
          id: 'simulado_adaptativo',
          title: 'Simulado Adaptativo IA',
          description: 'Questões ajustadas dinamicamente ao seu nível de acerto',
          icon: '🎯',
          tag: 'IA Dinâmica',
          primaryTab: 'simulados_treino',
          subTab: 'simulado_adaptativo',
        },
        {
          id: 'simulado_caderno_erros',
          title: 'Caderno de Erros',
          description: 'Banco personalizado com os seus pontos fracos a zerar',
          icon: '📓',
          tag: 'Revisão',
          primaryTab: 'simulados_treino',
          subTab: 'caderno_erros',
        },
        {
          id: 'simulado_reels',
          title: 'Feed Reels de Questões',
          description: 'Resolução vertical ágil estilo reels para momentos livres',
          icon: '📱',
          tag: 'Ágil',
          primaryTab: 'simulados_treino',
          subTab: 'reels_feed',
        },
        {
          id: 'simulado_chute',
          title: 'Chute Consciente & Estratégia',
          description: 'Técnicas de eliminação e preservação da coerência pedagógica',
          icon: '🎯',
          tag: 'Tática',
          primaryTab: 'simulados_treino',
          subTab: 'estratégia_chute',
        },
      ],
    },
    {
      id: 'arena_gamificacao',
      title: '⚔️ Arena & Gamificação',
      icon: <Swords className="w-5 h-5 text-indigo-400" />,
      emoji: '⚔️',
      badge: '4 recursos',
      description: 'Competição síncrona, desafios de agilidade, troféus e liderança regional.',
      borderHoverColor: 'hover:border-indigo-500/40',
      headerAccent: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      resources: [
        {
          id: 'arena_duelos',
          title: 'Arena X1 (Duelos)',
          description: 'Duelos 1v1 ao vivo valendo troféus de XP e classificação',
          icon: '⚔️',
          tag: 'Ao Vivo',
          primaryTab: 'arena',
          subTab: 'arena_x1',
        },
        {
          id: 'arena_batalha_questoes',
          title: 'Batalha X1 de Questões',
          description: 'Quiz competitivo rápido contra bots ou colegas de estudo',
          icon: '🛡️',
          tag: 'X1 Rápido',
          primaryTab: 'simulados_treino',
          subTab: 'desafios',
        },
        {
          id: 'arena_ranking',
          title: 'Ranking Semanal Regional',
          description: 'Classificação por estado e liga dos maiores pontuadores',
          icon: '🏆',
          tag: 'Ligas',
          primaryTab: 'perfil_gamificacao',
          subTab: 'ranking',
        },
        {
          id: 'arena_mascote',
          title: 'Mascote Gabaritão & XP',
          description: 'Níveis de evolução, ofensiva de estudo diário e recompensas',
          icon: '🦁',
          tag: 'Gamificação',
          primaryTab: 'perfil_gamificacao',
          subTab: 'mascote_xp',
        },
      ],
    },
    {
      id: 'ferramentas_estudo',
      title: '🛠️ Ferramentas de Estudo',
      icon: <Wrench className="w-5 h-5 text-emerald-400" />,
      emoji: '🛠️',
      badge: '11 recursos',
      description: 'Instrumentos de apoio operacional, rotina, imersão acústica e cálculos.',
      borderHoverColor: 'hover:border-emerald-500/40',
      headerAccent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      resources: [
        {
          id: 'ferramenta_duvidas',
          title: 'Scanner Tira-Dúvidas',
          description: 'Fotografe ou envie sua questão para resolução detalhada',
          icon: '📷',
          tag: 'Scanner IA',
          primaryTab: 'conteudos',
          subTab: 'duvidas',
        },
        {
          id: 'ferramenta_feynman',
          title: 'Teste Verbal Feynman',
          description: 'Explique o conteúdo com a sua voz e teste seu domínio',
          icon: '🎤',
          tag: 'Voz',
          primaryTab: 'conteudos',
          subTab: 'feynman_audio',
        },
        {
          id: 'ferramenta_podcasts',
          title: 'Modo Áudio & Podcasts',
          description: 'Aulas em áudio para absorver matérias em movimento',
          icon: '🎧',
          tag: 'Áudio',
          primaryTab: 'conteudos',
          subTab: 'audio_podcasts',
        },
        {
          id: 'ferramenta_auto_flashcards',
          title: 'Auto-Flashcards (Foto/Texto)',
          description: 'Transforme anotações e resumos em decks prontos',
          icon: '🎴',
          tag: 'Gerador',
          primaryTab: 'conteudos',
          subTab: 'auto_flashcards',
        },
        {
          id: 'ferramenta_advogado',
          title: 'Advogado do Diabo (Debate)',
          description: 'Debata com a IA para encontrar falhas nos seus argumentos',
          icon: '😈',
          tag: 'Debate',
          primaryTab: 'redacao_ia',
          subTab: 'advogado_diabo',
        },
        {
          id: 'ferramenta_som_ambiente',
          title: 'Som Ambiente de Prova',
          description: 'Ruídos reais de sala de exame para aclimatação psicológica',
          icon: '🔊',
          tag: 'Foco Real',
          primaryTab: 'simulados_treino',
          subTab: 'som_ambiente',
        },
        {
          id: 'ferramenta_estatisticas',
          title: 'Estatísticas de Estudo',
          description: 'Métricas de rendimento, horas e acertos por disciplina',
          icon: '📊',
          tag: 'Métricas',
          primaryTab: 'perfil_gamificacao',
          subTab: 'estatisticas_estudo',
        },
        {
          id: 'ferramenta_reta_final',
          title: 'Modo Reta Final (30 Dias)',
          description: 'Cronograma intensivo de emergência para a reta final',
          icon: '🚨',
          tag: '30 Dias',
          primaryTab: 'perfil_gamificacao',
          subTab: 'reta_final',
        },
        {
          id: 'ferramenta_planner',
          title: 'Planner & Rotina',
          description: 'Planejamento semanal estruturado de estudo e descanso',
          icon: '📅',
          tag: 'Rotina',
          primaryTab: 'perfil_gamificacao',
          subTab: 'planner_rotina',
        },
        {
          id: 'ferramenta_sisu',
          title: 'Simulador SISU',
          description: 'Comparativo de notas com cortes de universidades federais',
          icon: '🏛️',
          tag: 'Cortes',
          primaryTab: 'perfil_gamificacao',
          subTab: 'sisu_simulator',
        },
        {
          id: 'ferramenta_folha_vespera',
          title: 'Folha de Véspera',
          description: 'Cheat-sheet condensado para revisão no dia anterior',
          icon: '📑',
          tag: 'Véspera',
          primaryTab: 'perfil_gamificacao',
          subTab: 'folha_vespera',
        },
      ],
    },
  ];

  // Filter groups if a specific filter is selected
  const filteredGroups = selectedFilter === 'todos'
    ? categoryGroups
    : categoryGroups.filter((g) => g.id === selectedFilter);

  return (
    <div className="w-full space-y-8 pt-1">
      {/* 1. SEÇÃO DE ACESSO RÁPIDO NO TOPO (4 RECURSOS MAIS POPULARES) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4 fill-amber-400" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                Acesso Rápido
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Mais Usados
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Os 4 recursos mais populares para acelerar seus estudos
              </p>
            </div>
          </div>
        </div>

        {/* Grid de 4 Cards de Acesso Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickAccessResources.map((res, index) => {
            const isTopCard = index === 0; // Resumos & Flashcards em super destaque
            return (
              <button
                key={res.id}
                type="button"
                onClick={() => handleResourceClick(res.primaryTab, res.subTab)}
                className={`relative p-4 rounded-2xl text-left transition-all duration-200 group cursor-pointer border flex flex-col justify-between overflow-hidden shadow-lg select-none active:scale-98 ${
                  isTopCard
                    ? 'bg-gradient-to-br from-amber-950/50 via-slate-900/90 to-purple-950/40 border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10'
                    : `bg-slate-900/80 hover:bg-slate-800/90 border-slate-800/80 hover:border-slate-700 shadow-slate-950/50`
                }`}
              >
                {/* Glow decorativo suave no card #1 */}
                {isTopCard && (
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                      {res.icon}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isTopCard
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {res.tag}
                    </span>
                  </div>

                  <h4
                    className={`text-sm font-bold tracking-tight mb-1 group-hover:translate-x-0.5 transition-transform ${
                      isTopCard ? 'text-amber-200 font-extrabold' : 'text-white group-hover:text-indigo-300'
                    }`}
                  >
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-slate-200">
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 group-hover:text-slate-300">
                    Abrir Módulo
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-slate-400 group-hover:text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. BARRA DE FILTRO POR CATEGORIA (Opcional, rápida e fluida) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Filtrar Recursos:
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSelectedFilter('todos');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'todos'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              Todos (31)
            </button>
            {categoryGroups.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedFilter(cat.id);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="hidden sm:inline">{cat.title.replace(/^[^\s]+\s/, '')}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIAS DE AGRUPAMENTO DENTRO DE CARDS ELEGANTES */}
      <div className="space-y-6">
        {filteredGroups.map((cat) => (
          <div
            key={cat.id}
            className={`rounded-3xl bg-slate-900/60 border border-slate-800/90 p-4 sm:p-6 shadow-xl backdrop-blur-sm transition-all duration-200 ${cat.borderHoverColor}`}
          >
            {/* Cabeçalho da Categoria */}
            <div className="flex items-start sm:items-center justify-between flex-wrap gap-2 pb-4 mb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/70">
                  {cat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {cat.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cat.headerAccent}`}
                    >
                      {cat.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid Responsiva de Botões Internos (Grid de 2 colunas no celular) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {cat.resources.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleResourceClick(res.primaryTab, res.subTab)}
                  className="group relative p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-600/90 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[110px] shadow-sm select-none active:scale-97"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl sm:text-2xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:scale-110 transition-transform">
                        {res.icon}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/70 group-hover:border-slate-500 group-hover:text-slate-300 transition-colors">
                        {res.tag}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {res.title}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
                      {res.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-slate-500 group-hover:text-slate-300 uppercase tracking-wider">
                      Acessar
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeHubCategories;
