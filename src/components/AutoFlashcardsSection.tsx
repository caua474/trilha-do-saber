import React, { useState, useRef } from 'react';
import { Camera, Sparkles, BookOpen, Layers, Plus, CheckCircle2, RotateCw, Upload, Image as ImageIcon } from 'lucide-react';

interface Flashcard {
  frente: string;
  verso: string;
  nivel: 'Fácil' | 'Médio' | 'Difícil';
}

export const AutoFlashcardsSection: React.FC<{ onAddXp?: (xp: number) => void }> = ({ onAddXp }) => {
  const [texto, setTexto] = useState<string>('');
  const [materia, setMateria] = useState<string>('Geral ENEM');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateFlashcards = async () => {
    if ((!texto.trim() && !selectedImage) || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auto-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: texto.trim(),
          imagemBase64: selectedImage,
          materia,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.flashcards?.length) {
        setCards(data.data.flashcards);
        if (onAddXp) onAddXp(50);
      }
    } catch (e) {
      console.error('Erro ao gerar flashcards:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-indigo-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Layers className="w-3.5 h-3.5" /> Extração Automática com IA
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🎴 Gerador de Flashcards por Texto ou Foto
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Cole anotações ou tire uma foto de uma página da sua apostila para a IA extrair automaticamente os conceitos fundamentais em um baralho de estudo ativo.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-xl">
              📸
            </div>
            <div>
              <span className="text-xs text-indigo-200 font-bold block uppercase tracking-wider">Foto ou Texto</span>
              <span className="text-sm font-black text-white">Flashcards Instantâneos</span>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Cole o texto ou tire foto da apostila:
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-extrabold hover:bg-purple-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-purple-600" />
            <span>{selectedImage ? 'Foto Carregada ✓ (Trocar)' : 'Anexar Foto da Apostila 📷'}</span>
          </button>
        </div>

        {selectedImage && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selectedImage} alt="Foto" className="w-12 h-12 object-cover rounded-xl border border-purple-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Foto anexada pronta para extração de conceitos!
              </span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-xs font-bold text-rose-500 hover:underline"
            >
              Remover
            </button>
          </div>
        )}

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Ou cole aqui um resumo, capítulo de livro ou anotação de aula..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
        />

        <button
          onClick={handleGenerateFlashcards}
          disabled={isLoading || (!texto.trim() && !selectedImage)}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Sintetizando Baralho de Flashcards...</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4" />
              <span>Gerar Baralho de Flashcards (+50 XP)</span>
            </>
          )}
        </button>
      </div>

      {/* GENERATED FLASHCARDS DISPLAY */}
      {cards.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Baralho Gerado ({cards.length} Flashcards)
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Clique no cartão para girar e ver o verso
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setFlippedIndex(isFlipped ? null : idx)}
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer space-y-4 hover:border-indigo-400 transition min-h-[160px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-md">
                      Flashcard #{idx + 1} • {card.nivel}
                    </span>
                    <RotateCw className="w-4 h-4 text-slate-400" />
                  </div>

                  {!isFlipped ? (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-slate-400 block">
                        FRENTE (CONCEITO / PERGUNTA):
                      </span>
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                        {card.frente}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 animate-in fade-in">
                      <span className="text-[10px] uppercase font-black text-emerald-600 block">
                        VERSO (RESPOSTA / EXPLICAÇÃO):
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 leading-relaxed">
                        {card.verso}
                      </p>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-bold block text-right">
                    {isFlipped ? 'Toque para esconder' : 'Toque para revelar a resposta'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
