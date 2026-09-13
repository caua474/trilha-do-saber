import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ENEM_CATALOG,
  EnemArea,
  EnemDisciplina,
  EnemTopic
} from '../data/enemCatalog';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  Flame,
  Zap,
  Target,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  HelpCircle,
  FileText,
  ChevronRight,
  Compass,
  Layers,
  Award
} from 'lucide-react';

interface SubjectCatalogSectionProps {
  onSelectTopicAction?: (materia: string, topicoNome: string, acao: 'flashcard' | 'duvida' | 'simulado') => void;
}

export const SubjectCatalogSection: React.FC<SubjectCatalogSectionProps> = ({
  onSelectTopicAction,
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>(ENEM_CATALOG[0].id);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>(
    ENEM_CATALOG[0].disciplinas[0].id
  );
  const [selectedTopic, setSelectedTopic] = useState<EnemTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [incidenciaFilter, setIncidenciaFilter] = useState<'todos' | 'Mais Cai' | 'Médio' | 'Básico'>('todos');

  // Active Area & Discipline references
  const currentArea = ENEM_CATALOG.find((a) => a.id === selectedAreaId) || ENEM_CATALOG[0];
  const currentDisciplina =
    currentArea.disciplinas.find((d) => d.id === selectedDisciplinaId) ||
    currentArea.disciplinas[0];

  const handleSelectArea = (area: EnemArea) => {
    setSelectedAreaId(area.id);
    setSelectedDisciplinaId(area.disciplinas[0].id);
    setSelectedTopic(null);
  };

  // Filter topics based on search term and incidence badge
  const filteredTopics = currentDisciplina.topicos.filter((t) => {
    const matchesSearch =
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.dicaChave.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIncidencia =
      incidenciaFilter === 'todos' || t.incidencia === incidenciaFilter;
    return matchesSearch && matchesIncidencia;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Catálogo do Edital ENEM
              </span>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                4 Áreas do Conhecimento
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Guia Completo de Disciplinas & Incidência de Tópicos
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-md font-medium">
          Explore o edital oficial do ENEM organizado com marcadores de peso (<strong>Mais Cai</strong>, <strong>Médio</strong>, <strong>Básico</strong>). Clique em qualquer tópico para estudar com IA.
        </p>
      </div>

      {/* 1. SELETOR VISUAL DE ÁREAS DO CONHECIMENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ENEM_CATALOG.map((area) => {
          const isSelected = area.id === selectedAreaId;
          return (
            <button
              key={area.id}
              onClick={() => handleSelectArea(area)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between relative overflow-hidden ${
                isSelected
                  ? `bg-gradient-to-r ${area.gradient} text-white font-black shadow-lg shadow-purple-600/20 border-white/40 scale-[1.02]`
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {area.sigla}
                </div>
                <div>
                  <div className="text-xs font-black">{area.areaNome}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {area.disciplinas.map((d) => d.nome).join(', ')}
                  </div>
                </div>
              </div>
              {isSelected && <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* 2. DISCIPLINAS SUB-TABS & SEARCH FILTER BAR */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          {/* Disciplinas Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
            <span className="text-xs font-black uppercase text-amber-400 mr-1 shrink-0">
              Disciplinas de {currentArea.sigla}:
            </span>
            {currentArea.disciplinas.map((disc) => {
              const isSelectedDisc = disc.id === selectedDisciplinaId;
              return (
                <button
                  key={disc.id}
                  onClick={() => {
                    setSelectedDisciplinaId(disc.id);
                    setSelectedTopic(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
                    isSelectedDisc
                      ? 'bg-purple-600 text-white shadow-md border border-purple-400'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{disc.icone}</span>
                  <span>{disc.nome}</span>
                  <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full font-bold">
                    {disc.topicos.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Incidence Filter Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 text-[11px] font-bold">
            <button
              onClick={() => setIncidenciaFilter('todos')}
              className={`px-2.5 py-1 rounded-lg transition ${
                incidenciaFilter === 'todos'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setIncidenciaFilter('Mais Cai')}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                incidenciaFilter === 'Mais Cai'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              🔥 Mais Cai
            </button>
            <button
              onClick={() => setIncidenciaFilter('Médio')}
              className={`px-2.5 py-1 rounded-lg transition ${
                incidenciaFilter === 'Médio'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Médio
            </button>
          </div>
        </div>

        {/* Search input inside section */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar tópico ou conceito em ${currentDisciplina.nome} (ex: Ecologia, Ohm, Pitágoras, Vértice)...`}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* TOPICS LIST GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {filteredTopics.map((topico) => {
            const isTopicSelected = selectedTopic?.id === topico.id;

            return (
              <div
                key={topico.id}
                onClick={() => setSelectedTopic(isTopicSelected ? null : topico)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isTopicSelected
                    ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 border-amber-500/50 shadow-xl ring-2 ring-amber-500/40'
                    : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-white">
                        {topico.nome}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-2">
                      {topico.descricao}
                    </p>
                  </div>

                  {/* Weight / Incidence Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap shrink-0 border ${
                      topico.incidencia === 'Mais Cai'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : topico.incidencia === 'Médio'
                        ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {topico.incidencia === 'Mais Cai' ? '🔥 Mais Cai' : topico.incidencia}
                  </span>
                </div>

                {/* Quick Hint Footer */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
                  <span className="text-amber-400 font-bold flex items-center gap-1 truncate max-w-[85%]">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{topico.dicaChave}</span>
                  </span>

                  <span className="text-purple-300 font-extrabold hover:underline shrink-0 flex items-center gap-0.5">
                    {isTopicSelected ? 'Fechar' : 'Estudar'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED TOPIC DETAILED ACTIONS MODAL / PANEL */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-3 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    {selectedTopic.incidencia === 'Mais Cai' ? '🔥 Tópico de Altíssima Incidência' : selectedTopic.incidencia}
                  </span>
                  <span className="text-xs text-purple-300 font-bold">
                    {currentDisciplina.nome} • {currentArea.areaNome}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {selectedTopic.nome}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTopic(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold transition cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Description & Key Tip */}
              <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase font-black text-amber-400 block">
                  💡 Dica-Chave do GabaritaAí
                </span>
                <p className="text-xs text-amber-200 font-semibold leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  "{selectedTopic.dicaChave}"
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {selectedTopic.descricao}
                </p>
              </div>

              {/* Right Column: Real-world example */}
              <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] uppercase font-black text-purple-400 block">
                  📝 Como o ENEM cobra este conceito
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  {selectedTopic.exemploPratico}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (onSelectTopicAction) {
                    onSelectTopicAction(currentDisciplina.nome, selectedTopic.nome, 'flashcard');
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Gerar Flashcards deste Tópico</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectTopicAction) {
                    onSelectTopicAction(currentDisciplina.nome, selectedTopic.nome, 'duvida');
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Tirar Dúvida com Scanner IA</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectTopicAction) {
                    onSelectTopicAction(currentDisciplina.nome, selectedTopic.nome, 'simulado');
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Praticar Questão TRI</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
