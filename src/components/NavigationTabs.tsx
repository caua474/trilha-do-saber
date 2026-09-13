import React from 'react';
import { PrimaryTab } from './BottomNavigationBar';

export type AbaAtiva =
  | 'flashcards'
  | 'biblioteca'
  | 'arena_x1'
  | 'reels_feed'
  | 'esquema_redacao'
  | 'pilulas_conhecimento'
  | 'audio_podcasts'
  | 'feynman_audio'
  | 'caderno_erros'
  | 'simulado_adaptativo'
  | 'radar_redacao'
  | 'revisao_leitner'
  | 'modo_economia'
  | 'mascote_xp'
  | 'folha_vespera'
  | 'advogado_diabo'
  | 'auto_flashcards'
  | 'c5_intervencao'
  | 'planner_rotina'
  | 'estratégia_chute'
  | 'corretor_gabarito'
  | 'som_ambiente'
  | 'reta_final'
  | 'cronograma'
  | 'catalogo'
  | 'repertorio'
  | 'aulao_domingo'
  | 'duvidas'
  | 'redacao'
  | 'simulado_tri'
  | 'ranking'
  | 'desafios'
  | 'sisu_simulator'
  | 'mapas_mentais'
  | 'glossario_enem'
  | 'estatisticas_estudo'
  | 'modo_foco'
  | 'ai_playground';

interface NavigationTabsProps {
  abaAtiva?: AbaAtiva;
  setAbaAtiva?: (aba: AbaAtiva) => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  primaryTab?: PrimaryTab;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  abaAtiva: propAbaAtiva,
  setAbaAtiva: propSetAbaAtiva,
  activeTab,
  onTabChange,
  primaryTab = 'home',
}) => {
  // Resolve current active tab value
  const currentTab: AbaAtiva = (propAbaAtiva || activeTab || 'flashcards') as AbaAtiva;

  const handleTabClick = (tabId: AbaAtiva) => {
    console.log('[NavigationTabs] Clicked tab:', tabId);
    if (propSetAbaAtiva) {
      propSetAbaAtiva(tabId);
    }
    if (onTabChange) {
      onTabChange(tabId);
    }

    // Smooth scroll to tab content if available
    const contentArea = document.getElementById('tab-content-area');
    if (contentArea) {
      contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const allTabs: { id: AbaAtiva; label: string; icon: string; category: PrimaryTab }[] = [
    // ARENA & COMPETIÇÃO
    { id: 'arena_x1', label: 'Arena X1 (Duelos ⚔️)', icon: '⚔️', category: 'arena' },

    // CONTEÚDOS & BIBLIOTECA
    { id: 'flashcards', label: 'Resumos & Flashcards', icon: '⚡', category: 'conteudos' },
    { id: 'biblioteca', label: 'Biblioteca & Fichamentos', icon: '📚', category: 'conteudos' },
    { id: 'catalogo', label: 'Catálogo do Edital', icon: '📐', category: 'conteudos' },
    { id: 'glossario_enem', label: 'Glossário do Edital', icon: '📖', category: 'conteudos' },
    { id: 'mapas_mentais', label: 'Mapas Mentais', icon: '🧠', category: 'conteudos' },
    { id: 'feynman_audio', label: 'Teste Verbal Feynman', icon: '🎤', category: 'conteudos' },
    { id: 'pilulas_conhecimento', label: 'Pílulas do Conhecimento', icon: '💡', category: 'conteudos' },
    { id: 'audio_podcasts', label: 'Modo Áudio & Podcasts', icon: '🎧', category: 'conteudos' },
    { id: 'auto_flashcards', label: 'Auto-Flashcards (Foto/Texto)', icon: '🎴', category: 'conteudos' },
    { id: 'duvidas', label: 'Scanner Tira-Dúvidas', icon: '💡', category: 'conteudos' },
    { id: 'ai_playground', label: 'AI Studio Playground', icon: '🤖', category: 'conteudos' },

    // REDAÇÃO & IA
    { id: 'redacao', label: 'Corretor de Redação', icon: '✍️', category: 'redacao_ia' },
    { id: 'c5_intervencao', label: 'Detector C5 (Intervenção)', icon: '🔍', category: 'redacao_ia' },
    { id: 'repertorio', label: 'Repertórios Coringa', icon: '📖', category: 'redacao_ia' },
    { id: 'esquema_redacao', label: 'Esqueleto de Redação', icon: '✍️', category: 'redacao_ia' },
    { id: 'radar_redacao', label: 'Radar de Redação', icon: '🔥', category: 'redacao_ia' },
    { id: 'advogado_diabo', label: 'Advogado do Diabo (Debate)', icon: '😈', category: 'redacao_ia' },

    // SIMULADOS & TREINO
    { id: 'simulado_tri', label: 'Simulado TRI Oficial', icon: '📝', category: 'simulados_treino' },
    { id: 'simulado_adaptativo', label: 'Simulado Adaptativo IA', icon: '🎯', category: 'simulados_treino' },
    { id: 'reels_feed', label: 'Feed Reels de Questões', icon: '📱', category: 'simulados_treino' },
    { id: 'desafios', label: 'Batalha X1 de Questões', icon: '⚔️', category: 'simulados_treino' },
    { id: 'caderno_erros', label: 'Caderno de Erros', icon: '📓', category: 'simulados_treino' },
    { id: 'corretor_gabarito', label: 'Corretor Visual de Gabarito', icon: '📸', category: 'simulados_treino' },
    { id: 'estratégia_chute', label: 'Chute Consciente & Estratégia', icon: '🎯', category: 'simulados_treino' },
    { id: 'som_ambiente', label: 'Som Ambiente de Prova', icon: '🎧', category: 'simulados_treino' },

    // PERFIL & GAMIFICAÇÃO
    { id: 'estatisticas_estudo', label: 'Estatísticas de Estudo', icon: '📊', category: 'perfil_gamificacao' },
    { id: 'mascote_xp', label: 'Mascote Gabaritão & XP', icon: '🦁', category: 'perfil_gamificacao' },
    { id: 'ranking', label: 'Ranking Semanal Regional', icon: '🏆', category: 'perfil_gamificacao' },
    { id: 'reta_final', label: 'Modo Reta Final (30 Dias)', icon: '🚨', category: 'perfil_gamificacao' },
    { id: 'planner_rotina', label: 'Planner & Rotina', icon: '📅', category: 'perfil_gamificacao' },
    { id: 'sisu_simulator', label: 'Simulador SISU', icon: '🏛️', category: 'perfil_gamificacao' },
    { id: 'folha_vespera', label: 'Folha de Véspera (Cheat Sheet)', icon: '📑', category: 'perfil_gamificacao' },
  ];

  // Filter tabs by primary category if a category is selected, or show all if home
  const displayedTabs = primaryTab && primaryTab !== 'home'
    ? allTabs.filter((t) => t.category === primaryTab)
    : allTabs;

  return (
    <div 
      className="relative z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1.5 mb-3 pointer-events-auto"
      style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
    >
      <div 
        className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/95 dark:bg-slate-900/95 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md relative z-50 pointer-events-auto"
        style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
      >
        {displayedTabs.map((tab) => {
          const isActive =
            currentTab === tab.id ||
            (currentTab === ('summarize' as any) && tab.id === 'flashcards') ||
            (currentTab === ('tutor' as any) && tab.id === 'cronograma') ||
            (currentTab === ('eli5' as any) && tab.id === 'duvidas');

          return (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(tab.id);
              }}
              className={`pointer-events-auto cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all select-none touch-manipulation active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 50,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation',
              }}
            >
              <span className="pointer-events-none">{tab.icon}</span>
              <span className="pointer-events-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
