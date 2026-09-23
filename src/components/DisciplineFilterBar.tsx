import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Sparkles } from 'lucide-react';

export type GlobalDisciplina =
  | 'Todas'
  | 'Matemática'
  | 'Biologia'
  | 'História'
  | 'Física'
  | 'Química'
  | 'Geografia'
  | 'Filosofia & Sociologia'
  | 'Língua Portuguesa & Literatura';

export interface DisciplinaOption {
  id: GlobalDisciplina;
  nome: string;
  icone: string;
  badgeCor: string;
}

export const DISCIPLINAS_GLOBAIS: DisciplinaOption[] = [
  {
    id: 'Todas',
    nome: 'Todas as Matérias',
    icone: '🌟',
    badgeCor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'Matemática',
    nome: 'Matemática',
    icone: '📐',
    badgeCor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  {
    id: 'Biologia',
    nome: 'Biologia',
    icone: '🌿',
    badgeCor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'História',
    nome: 'História',
    icone: '🏛️',
    badgeCor: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30',
  },
  {
    id: 'Física',
    nome: 'Física',
    icone: '⚡',
    badgeCor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'Química',
    nome: 'Química',
    icone: '🧪',
    badgeCor: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
  },
  {
    id: 'Geografia',
    nome: 'Geografia',
    icone: '🌍',
    badgeCor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  {
    id: 'Filosofia & Sociologia',
    nome: 'Filosofia & Sociologia',
    icone: '⚖️',
    badgeCor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  {
    id: 'Língua Portuguesa & Literatura',
    nome: 'Português & Literatura',
    icone: '✍️',
    badgeCor: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30',
  },
];

interface DisciplineFilterBarProps {
  selectedDisciplina: GlobalDisciplina;
  onSelectDisciplina: (disciplina: GlobalDisciplina) => void;
  className?: string;
}

export const DisciplineFilterBar: React.FC<DisciplineFilterBarProps> = ({
  selectedDisciplina,
  onSelectDisciplina,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-2 ${className}`}>
      <div className="bg-slate-900/90 dark:bg-slate-900/90 rounded-2xl border border-slate-800 p-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between px-2 pb-1.5 text-xs">
          <span className="flex items-center gap-1.5 font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filtro Rápido de Conteúdos por Disciplina</span>
          </span>
          {selectedDisciplina !== 'Todas' && (
            <button
              type="button"
              onClick={() => onSelectDisciplina('Todas')}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
            >
              Limpar Filtro (Ver Todas)
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap' }}
        >
          {DISCIPLINAS_GLOBAIS.map((item) => {
            const isSelected = selectedDisciplina === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onSelectDisciplina(item.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700/80'
                }`}
              >
                <span>{item.icone}</span>
                <span>{item.nome}</span>
                {isSelected && <Sparkles className="w-3 h-3 text-amber-300 ml-0.5" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default DisciplineFilterBar;
