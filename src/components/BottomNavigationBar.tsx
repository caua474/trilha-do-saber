import React from 'react';
import { Home, Swords, BookOpen, PenTool, Target, User } from 'lucide-react';

export type PrimaryTab = 'home' | 'arena' | 'conteudos' | 'redacao_ia' | 'simulados_treino' | 'perfil_gamificacao' | 'opcoes_hub';

interface BottomNavigationBarProps {
  activePrimaryTab: PrimaryTab;
  onSelectPrimaryTab: (tab: PrimaryTab) => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activePrimaryTab,
  onSelectPrimaryTab,
}) => {
  const tabs: { id: PrimaryTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'arena',
      label: 'Arena ⚔️',
      icon: <Swords className="w-5 h-5" />,
      badge: 'X1',
    },
    {
      id: 'conteudos',
      label: 'Conteúdos',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'redacao_ia',
      label: 'Redação & IA',
      icon: <PenTool className="w-5 h-5" />,
      badge: 'IA',
    },
    {
      id: 'simulados_treino',
      label: 'Simulados',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'perfil_gamificacao',
      label: 'Perfil & XP',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 dark:bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl shadow-2xl px-2 py-1.5 transition-all">
      <div className="max-w-md sm:max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activePrimaryTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectPrimaryTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-indigo-600/20 text-indigo-400 scale-110' : ''
                  }`}
                >
                  {tab.icon}
                </div>

                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 font-black text-[8px] px-1 py-0.2 rounded-full uppercase shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight mt-0.5">
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
