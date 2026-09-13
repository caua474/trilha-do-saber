import React, { useState } from 'react';
import { Sparkles, TrendingUp, BookOpen, ArrowRight, Zap, Target, Flame, Compass, CheckCircle2 } from 'lucide-react';

export interface PopularTopic {
  id: string;
  title: string;
  materia: string;
  categoria: 'enem' | 'exatas' | 'biologicas' | 'humanas' | 'linguagens';
  relevancia: 'Muito Alta' | 'Alta' | 'Média';
  descricao: string;
  dicaRapida: string;
}

const POPULAR_TOPICS: PopularTopic[] = [
  {
    id: '1',
    title: 'Geometria Espacial (Prismas e Pirâmides)',
    materia: 'Matemática',
    categoria: 'enem',
    relevancia: 'Muito Alta',
    descricao: 'Cálculo de volume, área de superfície e vistas ortogonais em questões práticas do ENEM.',
    dicaRapida: 'Volume do prisma = Área da base × altura.',
  },
  {
    id: '2',
    title: 'Redação ENEM: Estrutura da Tese e Proposta',
    materia: 'Linguagens',
    categoria: 'enem',
    relevancia: 'Muito Alta',
    descricao: 'Como estruturar os 5 elementos obrigatórios na Proposta de Intervenção (Agente, Ação, Meio, Efeito, Detalhamento).',
    dicaRapida: 'Lembre do acrônimo AAMED para garantir os 200 pontos na Competência 5.',
  },
  {
    id: '3',
    title: 'Ecologia e Impactos Ambientais',
    materia: 'Biologia',
    categoria: 'biologicas',
    relevancia: 'Muito Alta',
    descricao: 'Cadeias alimentares, ciclos biogeoquímicos, aquecimento global e eutrofização das águas.',
    dicaRapida: 'Eutrofização é o excesso de nutrientes que gera proliferação de algas e falta de O2.',
  },
  {
    id: '4',
    title: 'Equações do 2º Grau & Fórmula de Bhaskara',
    materia: 'Matemática',
    categoria: 'exatas',
    relevancia: 'Alta',
    descricao: 'Resolução de vértices de parábola, raízes reais e problemas de maximização de lucro ou área.',
    dicaRapida: 'Se Delta (Δ) > 0, temos duas raízes reais distintas; se Δ = 0, raiz única.',
  },
  {
    id: '5',
    title: 'Revolução Francesa & Era Napoleônica',
    materia: 'História',
    categoria: 'humanas',
    relevancia: 'Alta',
    descricao: 'A transição do Antigo Regime para a Idade Contemporânea, Declaração dos Direitos do Homem e Queda da Bastilha.',
    dicaRapida: 'Dividida em 3 fases: Assembléia Nacional, Convenção Nacional e Diretório.',
  },
  {
    id: '6',
    title: 'Leis de Newton & Dinâmica',
    materia: 'Física',
    categoria: 'exatas',
    relevancia: 'Muito Alta',
    descricao: 'Inércia, F = m.a e Ação e Reação aplicados a blocos, planos inclinados e atrito.',
    dicaRapida: 'A Força Normal nem sempre é igual à Força Peso! Cuidado em superfícies inclinadas.',
  },
  {
    id: '7',
    title: 'Sintaxe: Análise Sintática e Regência Verbal',
    materia: 'Português',
    categoria: 'linguagens',
    relevancia: 'Alta',
    descricao: 'Sujeito, predicado, objetos direto e indireto e regência de verbos frequentes em provas.',
    dicaRapida: 'O verbo "assistir" no sentido de ver exige a preposição "a" (Assistiu ao jogo).',
  },
  {
    id: '8',
    title: 'Tabela Periódica & Ligações Químicas',
    materia: 'Química',
    categoria: 'biologicas',
    relevancia: 'Alta',
    descricao: 'Electronegatividade, raio atômico e diferença entre ligação iônica, covalente e metálica.',
    dicaRapida: 'Ligação Iônica ocorre por transferência de elétrons entre metal e não-metal.',
  },
];

interface PopularTopicsSectionProps {
  onSelectTopic: (materia: string, objetivo: string, tema: string) => void;
  onSelectELI5Topic: (duvida: string) => void;
}

export const PopularTopicsSection: React.FC<PopularTopicsSectionProps> = ({
  onSelectTopic,
  onSelectELI5Topic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const filteredTopics = selectedCategory === 'todos'
    ? POPULAR_TOPICS
    : POPULAR_TOPICS.filter((t) => t.categoria === selectedCategory);

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Mais Pesquisados & Currículo Atual
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Top ENEM 2026
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              🔥 Tópicos Populares de Estudo
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Clique em qualquer assunto em alta para gerar um <strong>plano de estudos completo</strong> ou tirar dúvidas instantaneamente.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'todos', label: '✨ Todos em Alta' },
          { id: 'enem', label: '🎯 ENEM & Vestibulares' },
          { id: 'exatas', label: '📐 Exatas & Física' },
          { id: 'biologicas', label: '🧬 Biologia & Química' },
          { id: 'humanas', label: '📜 Humanas' },
          { id: 'linguagens', label: '✍️ Linguagens' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Topics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="group bg-slate-50/80 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {topic.materia}
                </span>
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {topic.relevancia}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {topic.title}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {topic.descricao}
              </p>

              <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="italic line-clamp-2">{topic.dicaRapida}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectTopic(topic.materia, 'ENEM e Vestibular', topic.title)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-extrabold py-1.5 px-2.5 rounded-xl transition flex items-center justify-center space-x-1 shadow-sm"
              >
                <BookOpen className="w-3 h-3" />
                <span>Gerar Plano</span>
              </button>

              <button
                onClick={() => onSelectELI5Topic(`Me explica de forma simples o conceito de: ${topic.title} em ${topic.materia}`)}
                className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[11px] font-extrabold py-1.5 px-2.5 rounded-xl transition flex items-center space-x-1"
                title="Tirar dúvida ELI5 deste tema"
              >
                <span>💡 ELI5</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
