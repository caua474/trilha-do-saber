import React, { useState, useEffect, useRef } from 'react';
import { Zap, Search, Volume2, CheckCircle2, Bookmark, Sparkles, Copy, Check, ArrowRight, BookOpen } from 'lucide-react';
import { DailyPersonalizedKnowledgePillSection } from './DailyPersonalizedKnowledgePillSection';

interface KnowledgePill {
  id: string;
  categoria: 'Redação' | 'Matemática' | 'Natureza' | 'Humanas' | 'Produtividade';
  titulo: string;
  duracaoLeitura: string; // e.g. "30 seg"
  resumoCurto: string;
  maceteOuro: string;
  exemploPratico?: string;
}

const PILLS_DATABASE: KnowledgePill[] = [
  {
    id: 'pill_1',
    categoria: 'Redação',
    titulo: 'Conectivo de Conclusão Sem Erro na Redação',
    duracaoLeitura: '30 seg',
    resumoCurto: 'Evite repetições de "Portanto" na proposta de intervenção.',
    maceteOuro: 'Use: "Destarte", "Dessa forma", "Infere-se, pois, que..." ou "Em suma".',
    exemploPratico: 'Exemplo: "Infere-se, pois, que o Poder Público deve atuar com celeridade..."',
  },
  {
    id: 'pill_2',
    categoria: 'Matemática',
    titulo: 'Macete da Porcentagem Rápida (Regra do Zero)',
    duracaoLeitura: '25 seg',
    resumoCurto: 'Como calcular 30% de 70 ou 40% de 90 de cabeça sem conta no papel.',
    maceteOuro: 'Corte os zeros e multiplique os números restantes! 3 × 7 = 21 (30% de 70).',
    exemploPratico: '40% de 90 -> Corte os dois zeros e faça 4 × 9 = 36.',
  },
  {
    id: 'pill_3',
    categoria: 'Natureza',
    titulo: 'Vacina vs Soro em 10 Segundos',
    duracaoLeitura: '20 seg',
    resumoCurto: 'Diferença essencial cobrada todo ano no ENEM.',
    maceteOuro: 'Vacina = PREVENÇÃO (estimula o corpo a criar anticorpos). Soro = EMERGÊNCIA (anticorpos prontos contra veneno).',
    exemploPratico: 'Picada de cobra -> Soro! Pré-matrícula escolar -> Vacina!',
  },
  {
    id: 'pill_4',
    categoria: 'Humanas',
    titulo: 'Linha do Tempo Vargas (1930 - 1945)',
    duracaoLeitura: '35 seg',
    resumoCurto: 'As três fases imperdíveis da Era Vargas no ENEM.',
    maceteOuro: '1. Governo Provisório (30-34) -> 2. Governo Constitucional (34-37) -> 3. Estado Novo (37-45, Ditadura + DIP + CLT).',
    exemploPratico: 'Lembre-se: A CLT foi criada em 1943 no Estado Novo!',
  },
  {
    id: 'pill_5',
    categoria: 'Produtividade',
    titulo: 'Técnica de Recuperação Ativa (Active Recall)',
    duracaoLeitura: '30 seg',
    resumoCurto: 'Reler a matéria não fixa o conteúdo no cérebro.',
    maceteOuro: 'Feche o livro e tente explicar a matéria em voz alta sem olhar a folha por 1 minuto!',
    exemploPratico: 'Se gaguejar no meio, abra a folha e revise exatamente a parte que esqueceu.',
  },
  {
    id: 'pill_6',
    categoria: 'Natureza',
    titulo: 'Chuveiro Elétrico: Quente vs Morno',
    duracaoLeitura: '30 seg',
    resumoCurto: 'Questão frequente de Física sobre Leis de Ohm.',
    maceteOuro: 'Para água mais QUENTE, você reduz a resistência R (encurta o fio) para AUMENTAR a corrente I e a potência P.',
    exemploPratico: 'P = U² / R -> Se R diminui, a Potência Térmica AUMENTA!',
  },
];

export const KnowledgePillsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Web Speech API
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleSpeakPill = (pill: KnowledgePill) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const textToSpeak = `${pill.titulo}. ${pill.resumoCurto}. Macete de ouro: ${pill.maceteOuro}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    synthRef.current.speak(utterance);
  };

  const handleToggleLearned = (id: string) => {
    setLearnedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyPill = (pill: KnowledgePill) => {
    const text = `💡 Pílula de Conhecimento - ${pill.titulo}\n\n${pill.resumoCurto}\n✨ Macete de Ouro: ${pill.maceteOuro}`;
    navigator.clipboard.writeText(text);
    setCopiedId(pill.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['Todas', 'Redação', 'Matemática', 'Natureza', 'Humanas', 'Produtividade'];

  const filteredPills = PILLS_DATABASE.filter((p) => {
    const matchCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    const matchSearch =
      p.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.maceteOuro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.resumoCurto.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. PERSONALIZED DAILY KNOWLEDGE PILL (BASED ON STUDY HISTORY) */}
      <DailyPersonalizedKnowledgePillSection />

      {/* 2. GENERAL PILLS GALLERY HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-slate-950" /> Biblioteca de Macetes
              </span>
              <span className="bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Hacks & Macetes de 30s
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ⚡ Acervo Geral de Pílulas do Conhecimento
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Explore o catálogo completo de macetes de prova por disciplina ou digite qualquer palavra-chave abaixo!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
              💡
            </div>
            <div>
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">Progresso</span>
              <span className="text-sm font-black text-white">
                {learnedIds.length} de {PILLS_DATABASE.length} Dominadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === c
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar macete ou fórmula..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* PILLS GALLERY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredPills.map((pill) => {
            const isLearned = learnedIds.includes(pill.id);
            return (
              <div
                key={pill.id}
                className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                  isLearned
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-400'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-400 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-full">
                      {pill.categoria}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      ⏱️ {pill.duracaoLeitura}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {pill.titulo}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {pill.resumoCurto}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-amber-100/60 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800/60 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-200 block">
                      ✨ Macete de Ouro:
                    </span>
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-100 leading-snug">
                      {pill.maceteOuro}
                    </p>
                  </div>

                  {pill.exemploPratico && (
                    <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
                      {pill.exemploPratico}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSpeakPill(pill)}
                    className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
                    title="Ouvir Pílula"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyPill(pill)}
                    className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
                    title="Copiar Macete"
                  >
                    {copiedId === pill.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleToggleLearned(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                      isLearned
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isLearned ? 'Aprendido' : 'Marcar Aprendido'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
