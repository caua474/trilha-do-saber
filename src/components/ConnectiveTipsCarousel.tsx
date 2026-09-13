import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Pause,
  Play,
  Zap,
  BookOpen,
} from 'lucide-react';

export interface ConnectiveTip {
  id: number;
  categoria: string;
  funcao: string;
  conectivos: string[];
  exemplo: string;
  ondeUsar: string;
  gradient: string;
}

const CONNECTIVE_TIPS: ConnectiveTip[] = [
  {
    id: 1,
    categoria: 'Adição & Continuidade',
    funcao: 'Somar novos argumentos no mesmo sentido no D1 ou D2 sem repetir palavras.',
    conectivos: ['Ademais,', 'Outrossim,', 'Além disso,', 'Paralelamente a isso,', 'Em adição,'],
    exemplo: '"Ademais, cabe ressaltar que a falta de investimentos estatais agrava o quadro social."',
    ondeUsar: 'Início do Desenvolvimento 2 (D2) ou ligando orações de mesma relevância.',
    gradient: 'from-indigo-900 via-purple-900 to-slate-900',
  },
  {
    id: 2,
    categoria: 'Oposição & Contradição',
    funcao: 'Contraste entre o direito garantido por lei e a realidade brasileira.',
    conectivos: ['Contudo,', 'Entretanto,', 'Não obstante,', 'Em contrapartida,', 'Todavia,'],
    exemplo: '"Entretanto, fora da ficção, a realidade brasileira dista do ideal constitucional."',
    ondeUsar: 'Após a citação do repertório (Introdução ou D1) para expor a problemática.',
    gradient: 'from-purple-900 via-rose-900 to-slate-900',
  },
  {
    id: 3,
    categoria: 'Causa & Explicação',
    funcao: 'Explicar a origem ou justificativa do problema abordado.',
    conectivos: ['Haja vista', 'Em virtude de', 'Dado que', 'Tendo em vista', 'Pelo fato de que'],
    exemplo: '"Nesse contexto, a omissão estatal persiste, haja vista a escassez de políticas públicas eficientes."',
    ondeUsar: 'No meio dos parágrafos de desenvolvimento para fundamentar a tese.',
    gradient: 'from-slate-900 via-indigo-950 to-blue-900',
  },
  {
    id: 4,
    categoria: 'Consequência & Efeito',
    funcao: 'Mostrar os impactos sociais resultantes da causa apresentada.',
    conectivos: ['Por conseguinte,', 'Como consequência,', 'De modo que', 'Em decorrência disso,', 'Por subseqüência,'],
    exemplo: '"Por conseguinte, milhares de cidadãos permanecem invisibilizados perante a sociedade."',
    ondeUsar: 'Fechamento dos parágrafos de desenvolvimento (D1 e D2).',
    gradient: 'from-indigo-950 via-slate-900 to-purple-950',
  },
  {
    id: 5,
    categoria: 'Conclusão & Proposta (C5)',
    funcao: 'Iniciar o parágrafo de conclusão amarrando a proposta de intervenção.',
    conectivos: ['Portanto,', 'Infere-se, portanto, que', 'Dessarte,', 'Depreende-se, pois, que', 'Assim,'],
    exemplo: '"Portanto, medidas interventivas são necessárias para mitigar esse entrave histórico."',
    ondeUsar: 'Primeira palavra do parágrafo de Conclusão (Proposta de Intervenção).',
    gradient: 'from-emerald-950 via-teal-950 to-slate-900',
  },
  {
    id: 6,
    categoria: 'Conformidade & Citação',
    funcao: 'Legitimar citações filosóficas, leis, livros e sociólogos.',
    conectivos: ['Conforme preconiza', 'Segundo o pensamento de', 'De acordo com', 'Em consonância com', 'Sob a ótica de'],
    exemplo: '"Conforme preconiza o sociólogo Zygmunt Bauman, a sociedade atual vive uma liquidez das relações."',
    ondeUsar: 'No momento de introduzir o Repertório Sociocultural Legítimo.',
    gradient: 'from-amber-950 via-purple-950 to-slate-900',
  },
];

export const ConnectiveTipsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const currentTip = CONNECTIVE_TIPS[currentIndex];

  // Auto-rotate every 4.5 seconds when not paused
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CONNECTIVE_TIPS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CONNECTIVE_TIPS.length) % CONNECTIVE_TIPS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CONNECTIVE_TIPS.length);
  };

  const handleCopyConectivos = (conectivosList: string[], idx: number) => {
    const text = conectivosList.join(', ');
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden space-y-4"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Coesão & Operadores (C4)
              </span>
              <span className="bg-indigo-500/30 text-indigo-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                Rotação Automática
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>Carrossel de Dicas Rápidas de Conectivos ENEM</span>
            </h3>
          </div>
        </div>

        {/* Status controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer text-xs flex items-center gap-1 px-2.5 font-bold"
            title={isPaused ? 'Retomar Rotação Automática' : 'Pausar Rotação'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="text-[10px]">{isPaused ? 'Pausado' : 'Auto'}</span>
          </button>

          <span className="text-[10px] text-slate-300 font-bold bg-white/10 px-2.5 py-1 rounded-lg">
            {currentIndex + 1} / {CONNECTIVE_TIPS.length}
          </span>
        </div>
      </div>

      {/* Auto timer bar */}
      {!isPaused && (
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4.5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-amber-400 to-indigo-400"
          />
        </div>
      )}

      {/* Slide Content with Framer Motion / Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTip.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-3"
        >
          {/* Category badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-xl">
              {currentTip.categoria}
            </span>

            <button
              onClick={() => handleCopyConectivos(currentTip.conectivos, currentTip.id)}
              className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              {copiedIndex === currentTip.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copiar Conectivos</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            <strong>Função Principal:</strong> {currentTip.funcao}
          </p>

          {/* Chips of conectivos */}
          <div className="flex flex-wrap gap-1.5 py-1">
            {currentTip.conectivos.map((conn, idx) => (
              <span
                key={idx}
                className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 shadow-sm"
              >
                {conn}
              </span>
            ))}
          </div>

          {/* Example Box */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              💡 Exemplo de Aplicação na Redação:
            </span>
            <p className="font-serif italic text-slate-100">{currentTip.exemplo}</p>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            📍 <strong>Onde Usar:</strong> {currentTip.ondeUsar}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-white/10">
        {/* Dot indicators */}
        <div className="flex items-center space-x-1.5">
          {CONNECTIVE_TIPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-amber-400'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Ir para dica ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Conectivo Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 transition cursor-pointer font-bold"
            title="Próximo Conectivo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
