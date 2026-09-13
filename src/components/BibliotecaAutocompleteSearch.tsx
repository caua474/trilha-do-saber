import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  BookOpen,
  Tag,
  Lightbulb,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  History,
  Check
} from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { StudyCardItem, MindMapItem, BibliotecaCategory } from './BibliotecaSection';

export interface AutocompleteSuggestion {
  id: string;
  label: string;
  type: 'material' | 'materia' | 'topico' | 'mapa';
  category: BibliotecaCategory;
  materia?: string;
  icon: string;
  description?: string;
  badge?: string;
  materialItem?: StudyCardItem;
  mindMapItem?: MindMapItem;
}

interface BibliotecaAutocompleteSearchProps {
  materials: StudyCardItem[];
  mindMaps: MindMapItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectMaterial: (material: StudyCardItem) => void;
  onSelectMindMap: (mindmap: MindMapItem) => void;
  onSelectCategory: (category: BibliotecaCategory) => void;
  selectedCategory: BibliotecaCategory;
}

const POPULAR_SEARCHES = [
  { label: 'Ecologia & Biomas', category: 'Natureza', icon: '🌿', type: 'topico' },
  { label: 'Funções & Vértice', category: 'Matemática', icon: '📈', type: 'topico' },
  { label: 'Segunda Guerra & Vargas', category: 'Humanas', icon: '🌍', type: 'topico' },
  { label: 'Cidadania & CF/88', category: 'Humanas', icon: '⚖️', type: 'topico' },
  { label: 'Termodinâmica & Carnot', category: 'Natureza', icon: '🔥', type: 'topico' },
  { label: 'Memórias Póstumas', category: 'Literatura', icon: '📖', type: 'topico' },
  { label: 'Figuras de Linguagem', category: 'Linguagens', icon: '✍️', type: 'topico' },
  { label: 'Genética & Mendel', category: 'Natureza', icon: '🧬', type: 'topico' }
];

export const BibliotecaAutocompleteSearch: React.FC<BibliotecaAutocompleteSearchProps> = ({
  materials,
  mindMaps,
  searchQuery,
  onSearchChange,
  onSelectMaterial,
  onSelectMindMap,
  onSelectCategory,
  selectedCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build the master suggestion pool
  const allSuggestions = useMemo<AutocompleteSuggestion[]>(() => {
    const list: AutocompleteSuggestion[] = [];

    // 1. Direct Materials
    materials.forEach((m) => {
      list.push({
        id: `mat_${m.id}`,
        label: m.titulo,
        type: 'material',
        category: m.categoria,
        materia: m.materia,
        icon: m.icone,
        description: m.resumoBreve,
        badge: `${m.materia} • ${m.tempoLeitura}`,
        materialItem: m
      });
    });

    // 2. Distinct Subjects / Disciplines
    const uniqueMaterias = Array.from(new Set(materials.map((m) => m.materia)));
    uniqueMaterias.forEach((materia) => {
      const match = materials.find((m) => m.materia === materia);
      const cat = match ? match.categoria : 'Tudo';
      list.push({
        id: `materia_${materia}`,
        label: materia,
        type: 'materia',
        category: cat,
        materia: materia,
        icon: '🏷️',
        description: `Ver todos os fichamentos e materiais de ${materia}`,
        badge: 'Disciplina'
      });
    });

    // 3. Key Topics & Concepts from materials points
    const topicsMap = new Map<string, { label: string; materia: string; category: BibliotecaCategory; icon: string; desc: string }>();

    materials.forEach((m) => {
      m.pontosChave.forEach((ponto) => {
        // Extract title part if has colon or short phrase
        const topicName = ponto.split(':')[0].trim();
        if (topicName && topicName.length > 3 && !topicsMap.has(topicName.toLowerCase())) {
          topicsMap.set(topicName.toLowerCase(), {
            label: topicName,
            materia: m.materia,
            category: m.categoria,
            icon: '💡',
            desc: ponto
          });
        }
      });
    });

    topicsMap.forEach((val, key) => {
      list.push({
        id: `topic_${key}`,
        label: val.label,
        type: 'topico',
        category: val.category,
        materia: val.materia,
        icon: val.icon,
        description: val.desc,
        badge: `Tópico • ${val.materia}`
      });
    });

    // 4. Mind Maps
    mindMaps.forEach((mm) => {
      list.push({
        id: `mm_${mm.id}`,
        label: mm.titulo,
        type: 'mapa',
        category: mm.categoria,
        materia: mm.materia,
        icon: '🗺️',
        description: `Mapa mental estruturado com ${mm.nos} nós conceituais`,
        badge: `Mapa Mental • ${mm.materia}`,
        mindMapItem: mm
      });
    });

    return list;
  }, [materials, mindMaps]);

  // Filtered suggestions based on user input
  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return [];
    }

    const matches = allSuggestions.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchMateria = item.materia?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchLabel || matchMateria || matchDesc || matchCategory;
    });

    // Sort order: exact starts-with first, then materials, then topics, then others
    return matches.sort((a, b) => {
      const aStarts = a.label.toLowerCase().startsWith(q);
      const bStarts = b.label.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Type priority: material > materia > topico > mapa
      const typeWeight = { material: 4, materia: 3, topico: 2, mapa: 1 };
      return (typeWeight[b.type] || 0) - (typeWeight[a.type] || 0);
    }).slice(0, 8);
  }, [allSuggestions, searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    const total = filteredSuggestions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < total) {
        handleSelectSuggestion(filteredSuggestions[selectedIndex]);
      } else if (filteredSuggestions.length > 0) {
        handleSelectSuggestion(filteredSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    playClickSound();
    setIsOpen(false);

    if (suggestion.type === 'material' && suggestion.materialItem) {
      onSearchChange(suggestion.label);
      onSelectMaterial(suggestion.materialItem);
    } else if (suggestion.type === 'mapa' && suggestion.mindMapItem) {
      onSelectMindMap(suggestion.mindMapItem);
    } else if (suggestion.type === 'materia') {
      onSearchChange(suggestion.label);
      if (suggestion.category && suggestion.category !== 'Tudo') {
        onSelectCategory(suggestion.category);
      }
    } else {
      onSearchChange(suggestion.label);
      if (suggestion.category && suggestion.category !== 'Tudo') {
        onSelectCategory(suggestion.category);
      }
    }
  };

  const handleSelectPopular = (popular: typeof POPULAR_SEARCHES[0]) => {
    playClickSound();
    onSearchChange(popular.label);
    if (popular.category && popular.category !== 'Tudo') {
      onSelectCategory(popular.category as BibliotecaCategory);
    }
    setIsOpen(false);
  };

  // Helper to highlight matching text
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, idx) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={idx}
              className="bg-amber-400/30 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold px-0.5 rounded-xs"
            >
              {part}
            </mark>
          ) : (
            <span key={idx}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Search Input Bar */}
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          id="biblioteca-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por título, matéria (ex: Biologia) ou tópico (ex: Ecologia, CF/88)..."
          className="w-full pl-11 pr-24 py-3.5 sm:py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
          autoComplete="off"
        />

        {/* Right action icons (Clear button + live count badge) */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onSearchChange('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title="Limpar busca"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 rounded-md border border-slate-300/40 dark:border-slate-600/40">
            <span>ESC</span>
          </span>
        </div>
      </div>

      {/* Autocomplete Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="biblioteca-autocomplete-dropdown"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800"
          >
            {/* If user is typing and we have matching suggestions */}
            {searchQuery.trim().length > 0 ? (
              filteredSuggestions.length > 0 ? (
                <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto">
                  <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Sugestões de Busca ({filteredSuggestions.length})
                    </span>
                    <span className="text-[10px] lowercase text-slate-400">Use ↑↓ e Enter</span>
                  </div>

                  {filteredSuggestions.map((item, idx) => {
                    const isSelected = selectedIndex === idx;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                            : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        {/* Icon Badge */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 font-bold mt-0.5 transition-transform group-hover:scale-110 ${
                            item.type === 'material'
                              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300'
                              : item.type === 'materia'
                              ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300'
                              : item.type === 'topico'
                              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300'
                          }`}
                        >
                          {item.icon}
                        </div>

                        {/* Text details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {renderHighlightedText(item.label, searchQuery)}
                            </h4>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                                  item.type === 'material'
                                    ? 'bg-indigo-100/80 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    : item.type === 'materia'
                                    ? 'bg-purple-100/80 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                    : item.type === 'topico'
                                    ? 'bg-amber-100/80 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                              {renderHighlightedText(item.description, searchQuery)}
                            </p>
                          )}
                        </div>

                        {/* Action arrow */}
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nenhuma sugestão encontrada para &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Tente termos mais amplos como <em>Funções</em>, <em>História</em>, <em>Ecologia</em> ou <em>Literatura</em>.
                  </p>
                </div>
              )
            ) : (
              /* When input is focused with empty text: Show Trending / Popular Topics */
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Tópicos de Alta Incidência no ENEM
                  </span>
                  <span className="text-[10px] text-slate-400 lowercase">Mais cobrados</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POPULAR_SEARCHES.map((pop) => (
                    <button
                      key={pop.label}
                      type="button"
                      onClick={() => handleSelectPopular(pop)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all group cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-base group-hover:scale-110 transition-transform shrink-0">
                        {pop.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                          {pop.label}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {pop.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Disciplines Filter Chips */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 px-1">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                    <Tag className="w-3 h-3" />
                    Matérias rápidas:
                  </span>
                  {['Matemática', 'Biologia', 'História', 'Física', 'Literatura', 'Sociologia'].map((materia) => (
                    <button
                      key={materia}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onSearchChange(materia);
                        setIsOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      {materia}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
