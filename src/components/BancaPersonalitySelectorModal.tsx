import React, { useState, useEffect } from 'react';
import { Target, BookOpen, Compass, Check, X, Shield, Sparkles } from 'lucide-react';

export type BancaPersonality = 'enem' | 'fuvest' | 'vunesp_unicamp';

export interface BancaOption {
  id: BancaPersonality;
  nome: string;
  subtitulo: string;
  caracteristicas: string[];
  exemplo: string;
  badgeColor: string;
}

export const BANCAS: BancaOption[] = [
  {
    id: 'enem',
    nome: 'ENEM',
    subtitulo: 'Interpretação, Contexto Social e Aplicação Prática',
    caracteristicas: [
      'Enunciados contextualizados e focados na realidade do estudante.',
      'Valoriza a competência leitora e interdisciplinaridade.',
      'Enfatiza propostas de intervenção e resolução de problemas sociais.',
    ],
    exemplo: '"Como o fenômeno x impacta a comunidade local e qual medida pode ser aplicada?"',
    badgeColor: 'bg-amber-500 text-slate-950',
  },
  {
    id: 'fuvest',
    nome: 'FUVEST / USP',
    subtitulo: 'Rigor Acadêmico, Conceitual e Direto',
    caracteristicas: [
      'Linguagem formal, precisa e alta exigência de fundamentação teórica.',
      'Cálculos sem atalhos simplificados e domínio de definições clássicas.',
      'Análise crítica e erudição conceitual sem enrolação.',
    ],
    exemplo: '"Demonstre algebricamente a relação conceitual entre as forças e calcule a constante k."',
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    id: 'vunesp_unicamp',
    nome: 'VUNESP & UNICAMP',
    subtitulo: 'Análise Crítica, Leitura de Imagens e Interdisciplinaridade',
    caracteristicas: [
      'Análise de charges, gráficos, excertos literários e visões históricas.',
      'Questões discursivas que exigem encadeamento lógico de argumentos.',
      'Foco na formação crítica do cidadão contemporâneo.',
    ],
    exemplo: '"Relacione a charge abaixo ao contexto sócio-político e diferencie as visões dos autores."',
    badgeColor: 'bg-purple-600 text-white',
  },
];

const STORAGE_KEY = 'gabaritai_banca_personality';

export function getSelectedBanca(): BancaPersonality {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'enem' || raw === 'fuvest' || raw === 'vunesp_unicamp') {
      return raw;
    }
  } catch (e) {
    console.error('Erro ao ler banca:', e);
  }
  return 'enem';
}

export function setSelectedBanca(banca: BancaPersonality) {
  try {
    localStorage.setItem(STORAGE_KEY, banca);
  } catch (e) {
    console.error('Erro ao salvar banca:', e);
  }
}

export const BancaPersonalitySelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (banca: BancaPersonality) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [selected, setSelected] = useState<BancaPersonality>(getSelectedBanca());

  useEffect(() => {
    setSelected(getSelectedBanca());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (bancaId: BancaPersonality) => {
    setSelected(bancaId);
    setSelectedBanca(bancaId);
    if (onSelect) onSelect(bancaId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <Compass className="w-3.5 h-3.5" /> Seletor de Personalidade da Banca
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Ajuste o Estilo das Respostas da IA
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Escolha a banca do vestibular do seu foco para recalibrar a linguagem, profundidade teórica e formato das explicações em todo o aplicativo!
          </p>
        </div>

        <div className="space-y-4">
          {BANCAS.map((banca) => {
            const isSelected = selected === banca.id;
            return (
              <div
                key={banca.id}
                onClick={() => handleSelect(banca.id)}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-3 relative ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 bg-slate-50/50 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-black ${banca.badgeColor}`}>
                      {banca.nome}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {banca.subtitulo}
                    </h4>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <ul className="space-y-1">
                  {banca.caracteristicas.map((item, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-1.5">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 italic">
                  💡 Estilo de Pergunta: {banca.exemplo}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition cursor-pointer shadow-md"
        >
          Confirmar Banca Selecionada
        </button>
      </div>
    </div>
  );
};
