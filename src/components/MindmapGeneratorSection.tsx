import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENEM_CATALOG, EnemTopic } from '../data/enemCatalog';
import {
  GitBranch,
  Sparkles,
  Layers,
  Search,
  BookOpen,
  Zap,
  Share2,
  Download,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  Info,
  Lightbulb,
  Award
} from 'lucide-react';

interface MindmapBranch {
  id: string;
  titulo: string;
  corTheme: string; // e.g. "amber", "emerald", "purple", "rose"
  bgGrad: string;
  borderColor: string;
  subtopicos: {
    conceito: string;
    detalhes: string;
    dicaEnem?: string;
  }[];
}

interface MindmapData {
  topicoNome: string;
  materia: string;
  conceitoCentral: string;
  ramificacoes: MindmapBranch[];
}

interface MindmapGeneratorSectionProps {
  onStudyTopic?: (materia: string, topico: string) => void;
}

// Default high-yield mindmaps dictionary
const DEFAULT_MINDMAPS: { [key: string]: MindmapData } = {
  'Ecologia e Impactos Ambientais': {
    topicoNome: 'Ecologia e Impactos Ambientais',
    materia: 'Biologia',
    conceitoCentral: 'Fluxo de Energia & Relações nos Ecossistemas',
    ramificacoes: [
      {
        id: 'r1',
        titulo: 'Cadeias & Teias Alimentares',
        corTheme: 'emerald',
        bgGrad: 'from-emerald-950/80 to-teal-950/80',
        borderColor: 'border-emerald-500/40',
        subtopicos: [
          { conceito: 'Produtores (Autótrofos)', detalhes: 'Base da cadeia (plantas, algas) realizando fotossíntese.' },
          { conceito: 'Consumidores & Decompositores', detalhes: 'Heterótrofos. A energia diminui a cada nível trófico.' },
          { conceito: 'Bioacumulação e Magnificação', detalhes: 'Tópicos não biodegradáveis (mercúrio, DDT) acumulam no topo.' }
        ]
      },
      {
        id: 'r2',
        titulo: 'Ciclos Biogeoquímicos',
        corTheme: 'indigo',
        bgGrad: 'from-indigo-950/80 to-blue-950/80',
        borderColor: 'border-indigo-500/40',
        subtopicos: [
          { conceito: 'Ciclo do Carbono', detalhes: 'Fotossíntese fixa CO₂; respiração e combustão liberam CO₂.' },
          { conceito: 'Ciclo do Nitrogênio', detalhes: 'Fixação por bactérias (Rhizobium) → Nitratação → Assimilação.' }
        ]
      },
      {
        id: 'r3',
        titulo: 'Impactos Ambientais Grave',
        corTheme: 'rose',
        bgGrad: 'from-rose-950/80 to-pink-950/80',
        borderColor: 'border-rose-500/40',
        subtopicos: [
          { conceito: 'Eutrofização', detalhes: 'Esgoto/adubo na água → Proliferação de algas → Bloqueio da luz → Morte aeróbica.' },
          { conceito: 'Efeito Estufa & Aquecimento', detalhes: 'Acúmulo de CO₂ e CH₄ retém calor na atmosfera.' }
        ]
      },
      {
        id: 'r4',
        titulo: 'Como o ENEM Cobra',
        corTheme: 'amber',
        bgGrad: 'from-amber-950/80 to-orange-950/80',
        borderColor: 'border-amber-500/40',
        subtopicos: [
          { conceito: 'Análise de Gráficos Tróficos', detalhes: 'Identificar introdução de espécie exótica ou contaminação por toxinas.' },
          { conceito: 'Soluções Sustentáveis', detalhes: 'Biorremediação, controle biológico e energia limpa.' }
        ]
      }
    ]
  },
  'Álgebra, Razão e Proporção': {
    topicoNome: 'Álgebra, Razão e Proporção',
    materia: 'Matemática',
    conceitoCentral: 'Proporcionalidade & Grandezas Relacionadas',
    ramificacoes: [
      {
        id: 'r1',
        titulo: 'Razão & Proporção Direta',
        corTheme: 'amber',
        bgGrad: 'from-amber-950/80 to-orange-950/80',
        borderColor: 'border-amber-500/40',
        subtopicos: [
          { conceito: 'Proporção Direta (A/B = k)', detalhes: 'Se A aumenta, B aumenta na mesma razão (ex: peso e preço).' },
          { conceito: 'Proporção Inversa (A·B = k)', detalhes: 'Se A aumenta, B diminui na mesma razão (ex: velocidade e tempo).' }
        ]
      },
      {
        id: 'r2',
        titulo: 'Regra de Três & Escala',
        corTheme: 'emerald',
        bgGrad: 'from-emerald-950/80 to-teal-950/80',
        borderColor: 'border-emerald-500/40',
        subtopicos: [
          { conceito: 'Regra de Três Composta', detalhes: 'Analise cada grandeza isoladamente com a incógnita antes de cruzar.' },
          { conceito: 'Escala Cartográfica (1:N)', detalhes: 'Escala = Distância no Mapa / Distância Real. Cuidado com cm² para m²!' }
        ]
      },
      {
        id: 'r3',
        titulo: 'Porcentagem & Variação',
        corTheme: 'purple',
        bgGrad: 'from-purple-950/80 to-indigo-950/80',
        borderColor: 'border-purple-500/40',
        subtopicos: [
          { conceito: 'Acréscimos Sucessivos', detalhes: 'Multiplicação de fatores (ex: +10% e +20% = 1.10 × 1.20 = 1.32, ou seja, 32%).' },
          { conceito: 'Fração e Porcentagem', detalhes: '20% = 0.20 = 1/5; 25% = 1/4; 50% = 1/2.' }
        ]
      },
      {
        id: 'r4',
        titulo: 'Aplicação no ENEM',
        corTheme: 'rose',
        bgGrad: 'from-rose-950/80 to-pink-950/80',
        borderColor: 'border-rose-500/40',
        subtopicos: [
          { conceito: 'Interpretação de Infográficos', detalhes: 'Comparar dados orçamentários, misturas e velocidade média.' }
        ]
      }
    ]
  }
};

export const MindmapGeneratorSection: React.FC<MindmapGeneratorSectionProps> = ({ onStudyTopic }) => {
  const [selectedTopicName, setSelectedTopicName] = useState<string>('Ecologia e Impactos Ambientais');
  const [selectedBranch, setSelectedBranch] = useState<MindmapBranch | null>(null);
  const [copied, setCopied] = useState(false);

  // Collect all catalog topics for selection dropdown
  const catalogTopicsList: { materia: string; nome: string }[] = [];
  ENEM_CATALOG.forEach((area) => {
    area.disciplinas.forEach((disc) => {
      disc.topicos.forEach((top) => {
        catalogTopicsList.push({ materia: disc.nome, nome: top.nome });
      });
    });
  });

  // Get active mindmap data or generate structured fallback
  const getActiveMindmap = (): MindmapData => {
    if (DEFAULT_MINDMAPS[selectedTopicName]) {
      return DEFAULT_MINDMAPS[selectedTopicName];
    }

    // Dynamic procedural mindmap template for selected topic
    const topicObj = catalogTopicsList.find((t) => t.nome === selectedTopicName);
    const mat = topicObj ? topicObj.materia : 'Geral';

    return {
      topicoNome: selectedTopicName,
      materia: mat,
      conceitoCentral: `Conceitos Estruturantes de ${selectedTopicName}`,
      ramificacoes: [
        {
          id: 'b1',
          titulo: '1. Fundamentos & Definições',
          corTheme: 'amber',
          bgGrad: 'from-amber-950/80 to-orange-950/80',
          borderColor: 'border-amber-500/40',
          subtopicos: [
            { conceito: 'Definição Principal', detalhes: `Base conceitual e axiomas essenciais do estudo de ${selectedTopicName}.` },
            { conceito: 'Terminologia Chave', detalhes: 'Vocabulário técnico e palavras de comando exigidas no ENEM.' }
          ]
        },
        {
          id: 'b2',
          titulo: '2. Fórmulas, Leis & Conexões',
          corTheme: 'indigo',
          bgGrad: 'from-indigo-950/80 to-purple-950/80',
          borderColor: 'border-indigo-500/40',
          subtopicos: [
            { conceito: 'Equações ou Regras', detalhes: 'Relações matemáticas ou causa-efeito diretamente cobradas.' },
            { conceito: 'Princípio de Conservação', detalhes: 'Padrão recorrente nas questões de nível médio/difícil.' }
          ]
        },
        {
          id: 'b3',
          titulo: '3. Aplicações Práticas',
          corTheme: 'emerald',
          bgGrad: 'from-emerald-950/80 to-teal-950/80',
          borderColor: 'border-emerald-500/40',
          subtopicos: [
            { conceito: 'Cotidiano e Tecnologia', detalhes: 'Como o fenômeno/fato se manifesta no dia a dia da sociedade.' },
            { conceito: 'Estudos de Caso', detalhes: 'Situações-problema clássicas da matriz de referência.' }
          ]
        },
        {
          id: 'b4',
          titulo: '4. Pegadinhas do ENEM (TRI)',
          corTheme: 'rose',
          bgGrad: 'from-rose-950/80 to-pink-950/80',
          borderColor: 'border-rose-500/40',
          subtopicos: [
            { conceito: 'Distratores Recorrentes', detalhes: 'Erros conceituais comuns que aparecem nas alternativas falsas.' },
            { conceito: 'Dica Prática de Resolução', detalhes: 'Atenção aos comandos "exceto", "incorreto" e unidades de medida.' }
          ]
        }
      ]
    };
  };

  const activeMindmap = getActiveMindmap();

  const handleCopyText = () => {
    const summaryText = `🧠 MAPA MENTAL: ${activeMindmap.topicoNome} (${activeMindmap.materia})\nConceito Central: ${activeMindmap.conceitoCentral}\n\n` +
      activeMindmap.ramificacoes.map(r => `📌 ${r.titulo}:\n` + r.subtopicos.map(s => `  • ${s.conceito}: ${s.detalhes}`).join('\n')).join('\n\n');
    
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <GitBranch className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Visualização Cognitiva Inteligente
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                ⭐ Recurso PRO
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Gerador de Mapas Mentais do Edital
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>
        </div>
      </div>

      {/* Topic Selector Controls */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-2/3">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Selecione o Tópico do Edital para Gerar o Mapa Mental:</span>
          </label>
          <select
            value={selectedTopicName}
            onChange={(e) => {
              setSelectedTopicName(e.target.value);
              setSelectedBranch(null);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-extrabold text-amber-300 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
          >
            {catalogTopicsList.map((t, idx) => (
              <option key={idx} value={t.nome}>
                [{t.materia}] {t.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Mapeado com <strong className="text-white">4 Ramificações Principais</strong> & Conexões Lógicas.
        </div>
      </div>

      {/* DIAGRAM DISPLAY AREA */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-8">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

        {/* 1. CENTRAL CONCEPT NODE */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 rounded-3xl shadow-2xl shadow-amber-500/20 max-w-lg w-full border-2 border-white/50 relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-400 text-[10px] font-black uppercase px-3 py-0.5 rounded-full border border-amber-500/40">
              🧠 CONCEITO CENTRAL
            </div>
            <h3 className="text-lg sm:text-xl font-black mt-1 uppercase tracking-wide">
              {activeMindmap.topicoNome}
            </h3>
            <p className="text-xs font-extrabold text-slate-950/80 mt-1">
              {activeMindmap.conceitoCentral}
            </p>
          </motion.div>
        </div>

        {/* Connecting Lines */}
        <div className="hidden md:flex justify-center items-center relative z-0">
          <div className="w-3/4 h-0.5 bg-gradient-to-r from-amber-500/40 via-purple-500/60 to-emerald-500/40" />
        </div>

        {/* 2. RAMIFICATIONS GRID (3 to 4 Main Branches) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {activeMindmap.ramificacoes.map((ramifica, index) => {
            const isSelected = selectedBranch?.id === ramifica.id;

            return (
              <motion.div
                key={ramifica.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedBranch(isSelected ? null : ramifica)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  ramifica.bgGrad
                } ${ramifica.borderColor} ${
                  isSelected ? 'ring-2 ring-amber-400 scale-[1.02] shadow-2xl' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                      Ramificação {index + 1}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>

                  <h4 className="text-sm font-extrabold text-white">
                    {ramifica.titulo}
                  </h4>
                </div>

                {/* Subtopic keywords */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  {ramifica.subtopicos.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs space-y-0.5"
                    >
                      <span className="font-bold text-amber-300 block">
                        • {sub.conceito}
                      </span>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                        {sub.detalhes}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-amber-300 font-bold flex items-center justify-between pt-1">
                  <span>{isSelected ? 'Expandido' : 'Clique para ver detalhes'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
