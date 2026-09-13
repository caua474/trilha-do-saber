import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Lightbulb,
  AlertCircle,
  Copy,
  Check,
  Flame,
  ThumbsUp,
  Meh,
  Frown,
  RefreshCw,
  Trash2,
  Layers,
  Award,
} from 'lucide-react';

interface Flashcard {
  id: number;
  frente: string;
  verso: string;
  dica?: string;
  materia?: string;
  topico?: string;
  difficulty?: 'facil' | 'medio' | 'dificil';
}

interface FlashcardGeneratorModalProps {
  onClose: () => void;
}

const POPULAR_TOPICS = [
  { materia: 'Biologia', topico: 'Citologia & Fotossíntese' },
  { materia: 'História', topico: 'Era Vargas & Segunda Guerra' },
  { materia: 'Física', topico: 'Leis de Newton & Cinemática' },
  { materia: 'Química', topico: 'Estequiometria & Funções Orgânicas' },
  { materia: 'Matemática', topico: 'Função do 2º Grau & Geometria' },
  { materia: 'Filosofia', topico: 'Sócrates, Platão e Aristóteles' },
];

const HARD_CARDS_STORAGE_KEY = 'gabaritai_hard_flashcards_v1';

export const FlashcardGeneratorModal: React.FC<FlashcardGeneratorModalProps> = ({ onClose }) => {
  const [materia, setMateria] = useState('');
  const [topico, setTopico] = useState('');
  const [quantidade, setQuantidade] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modes: 'generate' (or standard cards) vs 'review' (Sessão de Revisão de Difíceis)
  const [activeMode, setActiveMode] = useState<'all' | 'review'>('all');

  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([]);
  const [hardCards, setHardCards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(HARD_CARDS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDica, setShowDica] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userRatings, setUserRatings] = useState<Record<string, 'facil' | 'medio' | 'dificil'>>({});

  // Save hard cards to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(HARD_CARDS_STORAGE_KEY, JSON.stringify(hardCards));
    } catch (e) {
      console.error('Erro ao salvar cards difíceis:', e);
    }
  }, [hardCards]);

  const activeCardsList = activeMode === 'review' ? hardCards : generatedFlashcards;
  const currentCard = activeCardsList[currentIndex];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!materia.trim() || !topico.trim()) {
      setError('Por favor, preencha a matéria e o tópico de estudo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowDica(false);
    setActiveMode('all');

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: materia.trim(),
          topico: topico.trim(),
          quantidade,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Erro ao gerar flashcards.');
      }

      const cards: Flashcard[] = (json.data?.flashcards || []).map((c: any, index: number) => ({
        ...c,
        id: c.id || Date.now() + index,
        materia: materia.trim(),
        topico: topico.trim(),
      }));

      if (cards.length === 0) {
        throw new Error('Nenhum flashcard foi gerado. Tente outro tópico.');
      }

      setGeneratedFlashcards(cards);
    } catch (err: any) {
      console.error('Erro na geração de flashcards:', err);
      setError(err.message || 'Ocorreu um erro ao gerar os flashcards com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTopicSelect = (item: { materia: string; topico: string }) => {
    setMateria(item.materia);
    setTopico(item.topico);
  };

  const handleSetCardDifficulty = (card: Flashcard, level: 'facil' | 'medio' | 'dificil') => {
    const cardKey = `${card.materia || materia}_${card.topico || topico}_${card.id}_${card.frente.slice(0, 15)}`;
    
    setUserRatings((prev) => ({ ...prev, [cardKey]: level }));

    if (level === 'dificil') {
      // Add to hardCards if not already there
      setHardCards((prev) => {
        const exists = prev.some((item) => item.frente === card.frente && item.verso === card.verso);
        if (exists) return prev;
        return [
          ...prev,
          {
            ...card,
            materia: card.materia || materia || 'Geral',
            topico: card.topico || topico || 'Revisão',
            difficulty: 'dificil',
          },
        ];
      });
    } else {
      // If marked as easy/medium in review mode, option to remove from hard list or downgrade
      if (activeMode === 'review') {
        setHardCards((prev) => prev.filter((item) => item.frente !== card.frente));
        if (currentIndex >= hardCards.length - 1 && currentIndex > 0) {
          setCurrentIndex((p) => p - 1);
        }
      }
    }
  };

  const handleRemoveFromHard = (card: Flashcard) => {
    setHardCards((prev) => prev.filter((item) => item.frente !== card.frente));
    if (currentIndex >= hardCards.length - 1 && currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowDica(false);
    if (activeCardsList.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeCardsList.length);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowDica(false);
    if (activeCardsList.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activeCardsList.length) % activeCardsList.length);
    }
  };

  const handleCopyCard = () => {
    if (!currentCard) return;
    const text = `🎴 Flashcard GabaritaAí [${currentCard.materia || materia} - ${currentCard.topico || topico}]\n\n❓ FRENTE: ${currentCard.frente}\n💡 RESPOSTA: ${currentCard.verso}\n📌 DICA: ${currentCard.dica || 'Sem dica'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl shadow-inner shrink-0">
              🎴
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                  GabaritaAí AI
                </span>
                <span className="text-xs font-bold text-amber-200">Repetição Espaçada</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Gerador de Flashcards & Revisão Intensiva
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODE SWITCH TABS BAR */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-2 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveMode('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Gerar / Todos os Cards</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('review');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer relative ${
                activeMode === 'review'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Sessão de Revisão (Difíceis)</span>
              {hardCards.length > 0 && (
                <span className="ml-1 text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                  {hardCards.length}
                </span>
              )}
            </button>
          </div>

          {activeMode === 'review' && hardCards.length > 0 && (
            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 hidden sm:inline-block">
              🔥 Foco Intensivo nos PONTOS FRACOS
            </span>
          )}
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* SESSÃO DE REVISÃO INTENSIVA MODE VIEW */}
          {activeMode === 'review' ? (
            <div className="space-y-6">
              {hardCards.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-4 bg-slate-50 dark:bg-slate-950/60 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    🔥
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Nenhum flashcard marcado como "Difícil" ainda!
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Para usar a <strong>Sessão de Revisão Intensiva</strong>, gere cartões de estudo na aba principal e marque os cards que você achou desafiadores com o botão <strong className="text-rose-500">"🔥 Difícil"</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMode('all')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Gerar Novos Flashcards Agora</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                        <Flame className="w-3.5 h-3.5 fill-rose-500" />
                        Revisão Intensiva • Card {currentIndex + 1} de {hardCards.length}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCard}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Card'}</span>
                    </button>
                  </div>

                  {/* FLIP CARD AREA (REVIEW) */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[230px] bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border-2 border-rose-500/50 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-amber-400"
                  >
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        {isFlipped ? 'VERSO (RESPOSTA EXATA)' : 'FRENTE (DESAFIO)'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        <RotateCw className="w-3 h-3 text-amber-400" /> Clique para virar
                      </span>
                    </div>

                    {/* Card Main Text */}
                    <div className="py-6 text-center space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        {currentCard.materia || materia} • {currentCard.topico || topico}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isFlipped ? 'verso' : 'frente'}
                          initial={{ rotateX: 90, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          exit={{ rotateX: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-base sm:text-lg font-extrabold leading-relaxed text-white">
                            {isFlipped ? currentCard.verso : currentCard.frente}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Optional Hint Trigger */}
                    {currentCard.dica && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        {showDica ? (
                          <p className="text-amber-300 font-semibold italic flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Gatílho de Memória: {currentCard.dica}</span>
                          </p>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDica(true);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Mostrar Dica / Palavra-Chave</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DIFFICULTY FEEDBACK BUTTONS FOR REPEATED SPACING */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center">
                      Como foi sua retenção desse cartão agora?
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSetCardDifficulty(currentCard, 'facil')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Fácil (Apendi!)</span>
                      </button>

                      <button
                        onClick={() => handleSetCardDifficulty(currentCard, 'medio')}
                        className="py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Meh className="w-3.5 h-3.5 text-amber-500" />
                        <span>Médio (Manter)</span>
                      </button>

                      <button
                        onClick={() => handleRemoveFromHard(currentCard)}
                        className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Remover deste conjunto de revisão"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>

                  {/* Slider Navigation Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handlePrev}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>

                    {/* Dots indicator */}
                    <div className="flex items-center space-x-1.5">
                      {hardCards.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsFlipped(false);
                            setShowDica(false);
                            setCurrentIndex(idx);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentIndex ? 'w-6 bg-rose-500' : 'w-2 bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 font-black text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                    >
                      Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STANDARD GENERATOR & ALL CARDS MODE */
            <>
              {/* Top Generator Form */}
              <form onSubmit={handleGenerate} className="space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Matéria / Disciplina
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Biologia, Química, História..."
                      value={materia}
                      onChange={(e) => setMateria(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tópico ou Assunto Específico
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Fotossíntese, Leis de Newton..."
                      value={topico}
                      onChange={(e) => setTopico(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Quick topics tags */}
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                    Sugestões Rápidas para o ENEM:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TOPICS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickTopicSelect(item)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-500 transition cursor-pointer"
                      >
                        {item.materia}: {item.topico}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Gerando Flashcards com Inteligência Artificial...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Gerar Cartões Virtuais de Memorização (+50 XP)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center space-x-3 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* GENERATED FLASHCARDS DISPLAY INTERACTIVE SLIDER */}
              {generatedFlashcards.length > 0 && currentCard && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase text-amber-500">
                        {materia} • {topico}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">
                        ({currentIndex + 1} de {generatedFlashcards.length})
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCard}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Card'}</span>
                    </button>
                  </div>

                  {/* FLIP CARD AREA */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[220px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 border-2 border-indigo-500/40 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-amber-400/60"
                  >
                    {/* Status Indicator */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                        {isFlipped ? 'VERSO (RESPOSTA)' : 'FRENTE (PERGUNTA)'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                        <RotateCw className="w-3 h-3 text-amber-400" /> Clique para virar o card
                      </span>
                    </div>

                    {/* Card Main Text */}
                    <div className="py-6 text-center space-y-2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isFlipped ? 'verso' : 'frente'}
                          initial={{ rotateX: 90, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          exit={{ rotateX: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <p className="text-base sm:text-lg font-extrabold leading-relaxed text-white">
                            {isFlipped ? currentCard.verso : currentCard.frente}
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Optional Hint Trigger */}
                    {currentCard.dica && (
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        {showDica ? (
                          <p className="text-amber-300 font-semibold italic flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Gatílho de Memória: {currentCard.dica}</span>
                          </p>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDica(true);
                            }}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Mostrar Dica / Palavra-Chave</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DIFFICULTY FEEDBACK BUTTONS FOR REPEATED SPACING */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block text-center">
                      Avalie sua facilidade com este cartão para a Repetição Espaçada:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleSetCardDifficulty(currentCard, 'facil')}
                        className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Fácil</span>
                      </button>

                      <button
                        onClick={() => handleSetCardDifficulty(currentCard, 'medio')}
                        className="py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Meh className="w-3.5 h-3.5 text-amber-500" />
                        <span>Médio</span>
                      </button>

                      <button
                        onClick={() => handleSetCardDifficulty(currentCard, 'dificil')}
                        className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Adiciona este card à Sessão de Revisão Intensiva"
                      >
                        <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>🔥 Difícil</span>
                      </button>
                    </div>
                  </div>

                  {/* Slider Navigation Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handlePrev}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>

                    {/* Dots indicator */}
                    <div className="flex items-center space-x-1.5">
                      {generatedFlashcards.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsFlipped(false);
                            setShowDica(false);
                            setCurrentIndex(idx);
                          }}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentIndex ? 'w-6 bg-amber-400' : 'w-2 bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-600 font-black text-xs flex items-center gap-1 transition cursor-pointer shadow-md"
                    >
                      Próximo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
