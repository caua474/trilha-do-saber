import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenTool,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Lightbulb,
  AlignLeft,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Check,
  Zap,
  GraduationCap,
  Printer,
  Share2
} from 'lucide-react';
import { EnemEssayAnalysis } from '../types';
import { ConnectiveTipsCarousel } from './ConnectiveTipsCarousel';

interface EssayAnalyzerSectionProps {
  onOpenPrintableSheet?: () => void;
  onOpenSocialStory?: (type: 'redacao' | 'mascote' | 'streak', data?: any) => void;
}

const SAMPLE_THEMES = [
  'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
  'Caminhos para combater a manipulação do comportamento do usuário pelo controle de dados na internet',
  'A importância da preservação da saúde mental entre os jovens brasileiros',
  'Impactos e desafios da inteligência artificial no mercado de trabalho e na educação',
  'Desafios do combate à insegurança alimentar e ao desperdício de alimentos no Brasil',
];

const SAMPLE_ESSAYS = {
  theme: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
  text: `No livro "Utopia", do escritor inglês Thomas More, é retratada uma sociedade perfeita, na qual os indivíduos vivem em harmonia e sem sobressaltos sociais. Contudo, fora da ficção, a realidade brasileira dista do mito utópico, haja vista os percalços enfrentados no tocante à valorização das comunidades e povos tradicionais. Nesse contexto, percebe-se a urgência de mitigar a invisibilidade histórica e a falta de fiscalização estatal acerca desses territórios.

Em primeiro lugar, cabe ressaltar que a invisibilidade histórica atua como um grande entrave. Conforme o sociólogo Zygmunt Bauman, a sociedade contemporânea é marcada pelo individualismo e pela perda da empatia. De maneira análoga, os povos indígenas e quilombolas frequentemente têm seus direitos negligenciados, visto que a população urbana desconhece sua contribuição cultural e ecológica. Dessa forma, sem o devido reconhecimento, esses grupos permanecem às margens das políticas públicas.

Ademais, a fragilidade na fiscalização territorial agrava essa problemática. O filósofo John Locke defendia que o Estado deve garantir os direitos fundamentais dos cidadãos, incluindo a segurança e a propriedade. Entretanto, a invasão de terras demarcadas por garimpeiros e desmatadores ilegais evidencia a omissão do poder público. Consequentemente, a subsistência das populações tradicionais é severamente ameaçada, gerando conflitos fundiários e degradação ambiental.

Portanto, medidas interventivas são necessárias para superar esse óbice. Para tanto, cabe ao Ministério do Meio Ambiente, em parceria com o Ministério da Educação, promover campanhas de conscientização nacional e intensificar a fiscalização nas reservas ambientais. Essa ação deve ser realizada por meio de palestras nas escolas e ampliação do contingente de agentes da FUNAI e do IBAMA, a fim de garantir a proteção desses povos e a preservação de sua cultura. Assim, o Brasil aproximar-se-á do ideal de More.`
};

interface EnemTip {
  id: number;
  categoria: string;
  titulo: string;
  descricao: string;
  exemplo: string;
  tagColor: string;
}

const ENEM_DAILY_TIPS: EnemTip[] = [
  {
    id: 1,
    categoria: 'Conectivos de Transição (C4)',
    titulo: 'Conectivos Interparágrafos Essenciais',
    descricao: 'Inicie os parágrafos de desenvolvimento (D1 e D2) e conclusão utilizando operadores argumentativos variados. Nunca repita o mesmo operador!',
    exemplo: 'D1: "Em primeira análise,", "Sob essa ótica," | D2: "Ademais,", "Outrossim,", "Paralelamente," | Conclusão: "Portanto,", "Infere-se, portanto, que..."',
    tagColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 2,
    categoria: 'Regra Gramatical (C1)',
    titulo: 'Crase Sem Mistério no ENEM',
    descricao: 'Nunca use crase antes de verbos, pronomes masculinos ou palavras no plural ("a pessoas"). Use antes de horas exatas e expressões femininas.',
    exemplo: 'Troque por uma palavra masculina: "Vou à escola" -> "Vou ao colégio" (A + A = À). "À medida que", "À vista disso".',
    tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 3,
    categoria: 'Fórmula C5 (Nota 200)',
    titulo: 'Regra AAMED para Proposta de Intervenção',
    descricao: 'A conclusão precisa obrigatoriamente dos 5 elementos completos para garantir os 200 pontos na Competência 5.',
    exemplo: '1. AGENTE (Quem?) + 2. AÇÃO (O quê?) + 3. MEIO/MODO (Como?) + 4. EFEITO (Para quê?) + 5. DETALHAMENTO (Exemplo do Agente ou Ação).',
    tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 4,
    categoria: 'Pontuação & Sintaxe (C1)',
    titulo: 'A Regra de Ouro da Vírgula',
    descricao: 'NUNCA separe o sujeito do verbo principal com vírgula, mesmo se o sujeito for muito longo!',
    exemplo: 'ERRADO: "A falta de investimentos em saúde, gera problemas." | CERTO: "A falta de investimentos em saúde gera problemas."',
    tagColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  {
    id: 5,
    categoria: 'Repertório Sociocultural (C2)',
    titulo: 'Como Legitimar o Repertório',
    descricao: 'O repertório (filósofos, livros, filmes, leis) só ganha nota máxima se for LEGÍTIMO, PRODUTIVO e articulado com a tese.',
    exemplo: 'Ex: Citar a Constituição de 1988 ou Zygmunt Bauman (Modernidade Líquida) conectando diretamente ao tema proposto.',
    tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
];

export const EssayAnalyzerSection: React.FC<EssayAnalyzerSectionProps> = ({
  onOpenPrintableSheet,
  onOpenSocialStory
}) => {
  const [tema, setTema] = useState<string>(SAMPLE_THEMES[0]);
  const [texto, setTexto] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<EnemEssayAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [copiedTip, setCopiedTip] = useState<boolean>(false);

  const currentTip = ENEM_DAILY_TIPS[tipIndex];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % ENEM_DAILY_TIPS.length);
  };

  const handlePrevTip = () => {
    setTipIndex((prev) => (prev - 1 + ENEM_DAILY_TIPS.length) % ENEM_DAILY_TIPS.length);
  };

  const handleCopyTip = () => {
    const content = `${currentTip.titulo}\n${currentTip.descricao}\nExemplo: ${currentTip.exemplo}`;
    navigator.clipboard.writeText(content);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2000);
  };

  const wordCount = texto.trim() ? texto.trim().split(/\s+/).length : 0;
  const paragraphCount = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  const handleAnalyze = async () => {
    if (!texto.trim() || texto.trim().length < 50) {
      setError('Por favor, digite ou cole sua redação com pelo menos 50 caracteres para realizar a análise.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, texto }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Não foi possível analisar sua redação no momento.');
      }

      setAnalysis(resData.data);
    } catch (err: any) {
      console.error('Erro na análise de redação:', err);
      setError(err.message || 'Falha na conexão com a IA de correção do ENEM.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    setTema(SAMPLE_ESSAYS.theme);
    setTexto(SAMPLE_ESSAYS.text);
    setError(null);
  };

  const getCompetencyBadgeColor = (nota: number) => {
    if (nota >= 180) return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
    if (nota >= 140) return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800';
    if (nota >= 100) return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800';
    return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                Corretor Especialista GabaritaAí
              </span>
              <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Modelo Oficial ENEM 2026
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Análise Estrutural & Coesão da Redação
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Cole sua redação. A IA avalia a <strong>norma culta, repertório, argumentação, coesão/conectivos e os 5 elementos da proposta de intervenção</strong> do ENEM.
        </p>
      </div>

      {/* CARROSSEL DE DICAS RÁPIDAS DE CONECTIVOS (C4 ENEM) */}
      <ConnectiveTipsCarousel />

      {/* CARD DE DICA DO DIA (REDAÇÃO & GRAMÁTICA ENEM) */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-purple-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                GabaritaAí Redação
              </span>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>📌 Card de Dica do Dia: Regras & Conectivos Fundamentais</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${currentTip.tagColor}`}>
              {currentTip.categoria}
            </span>
            <span className="text-[10px] text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded-md">
              {tipIndex + 1} / {ENEM_DAILY_TIPS.length}
            </span>
          </div>
        </div>

        {/* Tip Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="py-4 space-y-2"
          >
            <h4 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{currentTip.titulo}</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {currentTip.descricao}
            </p>
            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 text-xs text-indigo-100 font-mono">
              <span className="text-amber-400 font-sans font-bold block text-[10px] uppercase mb-1">
                Exemplo / Aplicação Prática:
              </span>
              <span>{currentTip.exemplo}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Tip Navigation Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
          <button
            onClick={handleCopyTip}
            className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            {copiedTip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-300" />}
            <span>{copiedTip ? 'Copiado para Revisão!' : 'Salvar / Copiar Dica'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevTip}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Dica Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextTip}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-[11px] flex items-center gap-1 transition shadow-sm cursor-pointer"
            >
              <span>Próxima Dica</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Theme Selector */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
                <span>1. Tema da Redação</span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Carregar Exemplo</span>
                </button>
              </label>

              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Desafios do saneamento básico no Brasil..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition mb-2"
              />

              {/* Suggestions */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold">Temas Frequentes do ENEM:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_THEMES.slice(0, 3).map((st, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTema(st)}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-600 dark:text-slate-300 transition text-left truncate max-w-full"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Essay Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <AlignLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>2. Digite ou Cole o Texto</span>
                </label>

                {/* Word Counters */}
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                  <span>{wordCount} palavras</span>
                  <span>•</span>
                  <span>{paragraphCount} parágrafos</span>
                </div>
              </div>

              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={13}
                placeholder="Cole sua redação completa aqui (Introdução, Desenvolvimento 1, Desenvolvimento 2 e Conclusão)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-sans leading-relaxed text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !texto.trim()}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Corrigindo nos Critérios Oficiais ENEM...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4" />
                  <span>Analisar Redação Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Results or Empty State */}
        <div className="lg:col-span-7">
          {analysis ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Score Banner Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                        Diagnóstico GabaritaAí
                      </span>
                      <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                        {analysis.tema_detectado || 'Tema Identificado'}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      Pontuação Estimada ENEM
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shrink-0 min-w-[120px]">
                      <span className="text-[10px] uppercase font-bold text-indigo-200">Nota Total</span>
                      <div className="text-4xl font-black text-amber-400 tracking-tight">
                        {analysis.nota_estimada_total}
                      </div>
                      <span className="text-[10px] text-slate-300 font-semibold">de 1000 pontos</span>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {onOpenSocialStory && (
                        <button
                          type="button"
                          onClick={() => onOpenSocialStory('redacao', { score: analysis.nota_estimada_total })}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 shadow-md transition cursor-pointer active:scale-95"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Compartilhar Stories</span>
                        </button>
                      )}

                      {onOpenPrintableSheet && (
                        <button
                          type="button"
                          onClick={onOpenPrintableSheet}
                          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 border border-white/20 transition cursor-pointer active:scale-95"
                        >
                          <Printer className="w-4 h-4 text-amber-300" />
                          <span>Imprimir Folha ENEM</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Golden Tip Box */}
                {analysis.dica_de_ouro && (
                  <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 flex items-start space-x-2.5">
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 font-bold">💡 Dica de Ouro:</strong>{' '}
                      <span>{analysis.dica_de_ouro}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5 Competencies Cards */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>5 Competências Oficiais do ENEM</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'c1_gramatica', num: 1, title: 'C1: Norma Culta e Gramática', data: analysis.competencias?.c1_gramatica },
                    { key: 'c2_repertorio', num: 2, title: 'C2: Compreensão e Repertório', data: analysis.competencias?.c2_repertorio },
                    { key: 'c3_argumentacao', num: 3, title: 'C3: Projeto de Texto e Argumentos', data: analysis.competencias?.c3_argumentacao },
                    { key: 'c4_coesao', num: 4, title: 'C4: Coesão Textual e Conectivos', data: analysis.competencias?.c4_coesao },
                    { key: 'c5_proposta_intervencao', num: 5, title: 'C5: Proposta de Intervenção (5 Elementos)', data: analysis.competencias?.c5_proposta_intervencao },
                  ].map((compItem) => (
                    <div
                      key={compItem.key}
                      className={`bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2 ${
                        compItem.num === 5 ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                            Competência {compItem.num}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {compItem.title}
                          </h5>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-xl border shrink-0 ${getCompetencyBadgeColor(compItem.data?.nota || 0)}`}>
                          {compItem.data?.nota || 0} / 200
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {compItem.data?.feedback || 'Análise realizada.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sugestão Prática de Reescrita da Proposta de Intervenção */}
              {(analysis.sugestao_reescrita || analysis.dica_de_ouro) && (
                <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-purple-500/30 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                    <h5 className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Sugestão Prática de Reescrita da Proposta de Intervenção (Competência 5)
                    </h5>
                  </div>
                  <p className="text-xs font-medium text-slate-200 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-white/10 font-sans italic">
                    "{analysis.sugestao_reescrita || analysis.dica_de_ouro}"
                  </p>
                </div>
              )}

              {/* Strengths and Points to Improve */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pontos Fortes */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Pontos Fortes da Sua Redação</span>
                  </h5>
                  <ul className="space-y-2">
                    {analysis.pontos_fortes?.map((pf, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{pf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pontos a Melhorar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>O Que Corrigir Primeiro</span>
                  </h5>
                  <ul className="space-y-2">
                    {analysis.pontos_a_melhorar?.map((pm, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{pm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Legal Notice */}
              {analysis.aviso_legal && (
                <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>{analysis.aviso_legal}</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-inner">
                📝
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Sua Correção ENEM Aparecerá Aqui
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Digite ou cole sua redação na caixa ao lado e clique em <strong>Analisar Redação Agora</strong> para receber a nota estimada, avaliação das 5 competências, pontos fortes e fracos.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ Nota de 0 a 1000
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ 5 Competências Oficiais ENEM
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ✓ Proposta de Intervenção
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
