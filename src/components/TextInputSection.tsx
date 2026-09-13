import React, { useState, useRef } from 'react';
import { Sparkles, FileText, Upload, Target, X, Check, ArrowRight, Lightbulb } from 'lucide-react';
import { SAMPLE_TEXTS } from '../data/sampleTexts';
import { SampleText } from '../types';

interface TextInputSectionProps {
  onSummarize: (text: string, focusTopic?: string) => void;
  isLoading: boolean;
}

export const TextInputSection: React.FC<TextInputSectionProps> = ({
  onSummarize,
  isLoading,
}) => {
  const [text, setText] = useState('');
  const [focusTopic, setFocusTopic] = useState('');
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = (sample: SampleText) => {
    setText(sample.content);
    setSelectedSample(sample.title);
  };

  const handleClear = () => {
    setText('');
    setSelectedSample(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
        setSelectedSample(`Arquivo: ${file.name}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSummarize(text, focusTopic.trim() || undefined);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 transition-all">
      {/* Header section of card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-2 h-5 bg-indigo-600 rounded-full" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Cole ou Selecione o Conteúdo
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Envie artigos, capítulos de livros, anotações ou aulas para sintetizar em segundos.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.text,.csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border border-transparent dark:border-slate-700"
            title="Upload de arquivo .txt ou .md"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Carregar .TXT</span>
          </button>

          {text && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors border border-transparent dark:border-slate-700"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Sample texts pills */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Ou escolha um exemplo rápido para testar:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEXTS.map((sample) => {
            const isSelected = selectedSample === sample.title;
            return (
              <button
                key={sample.title}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="opacity-70 font-normal">[{sample.category}]</span>
                <span>{sample.title}</span>
                {isSelected && <Check className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Textarea Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSelectedSample(null);
            }}
            placeholder="Cole aqui seu texto longo, anotações de aula, artigo acadêmico ou resumo de capítulo..."
            rows={7}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/60 resize-y min-h-[160px] font-sans leading-relaxed"
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span>{wordCount} palavras</span>
            <span>•</span>
            <span>{charCount} caracteres</span>
          </div>
        </div>

        {/* Focus Topic Input (Optional) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 shrink-0">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Foco Específico (Opcional):</span>
          </div>
          <input
            type="text"
            value={focusTopic}
            onChange={(e) => setFocusTopic(e.target.value)}
            placeholder="Ex: Focar nas causas históricas, Focar em fórmulas físicas, Destaque para exames..."
            className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
              !text.trim() || isLoading
                ? 'bg-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analisando e Estruturando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Material de Estudos Bento</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
