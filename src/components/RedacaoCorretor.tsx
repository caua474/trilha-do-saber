import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  Copy,
  Check,
  Download,
  BookOpen,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  KeyRound,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import PdfThemeSelectorModal from './PdfThemeSelectorModal';
import { exportEssayCorrectionToPdf, PdfVisualTheme } from '../utils/pdfExport';
import { EnemEssayFullAnalysis, EssayCompetencyDetail } from '../types';
import { useGeminiError } from '../context/GeminiErrorContext';
import { classifyGeminiError, ClassifiedGeminiError } from '../utils/geminiErrorHandler';

interface RedacaoCorretorProps {
  onOpenSettings?: () => void;
}

const TEMAS_ENEM_SUGESTOES = [
  'Invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
  'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
  'Democratização do acesso ao cinema no Brasil',
  'Manipulação do comportamento do usuário pelo controle de dados na internet',
  'Caminhos para combater a intolerância religiosa no Brasil',
  'Impactos da inteligência artificial na educação e no mercado de trabalho',
];

const EXEMPLO_REDACAO_NOTA_1000 = {
  tema: 'Invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
  texto: `Na obra "Modernidade Líquida", o sociólogo Zygmunt Bauman argumenta que a contemporaneidade é marcada pela fragilização dos laços humanos e pela mercantilização da vida, o que leva à desvalorização de atividades essenciais que não geram lucro imediato. Nesse contexto, a invisibilidade do trabalho de cuidado realizado pela mulher no Brasil exemplifica de forma contundente essa tese, haja vista a histórica atribuição doméstica que sobrecarrega a figura feminina. Com efeito, torna-se imperioso analisar tanto a herança patriarcal quanto a ausência de amparo estatal que perpetuam essa problemática no tecido social.

Em primeira análise, cabe destacar que a estrutura patriarcal brasileira naturaliza as tarefas de cuidado como exclusividade feminina. Sob a ótica da filósofa Simone de Beauvoir, "não se nasce mulher, torna-se mulher", evidenciando que os papéis sociais são construções culturais e não imposições biológicas. Contudo, ao longo dos séculos, a sociedade consolidou a falsa premissa de que a maternidade e a assistência a enfermos e idosos devem recair unicamente sobre as mulheres, privando-as de ascensão profissional e descanso digno.

Ademais, a inoperância do Poder Público agrava a sobrecarga das cuidadoras. Conforme preconiza a Constituição Federal de 1988, a dignidade da pessoa humana e a igualdade entre homens e mulheres constituem fundamentos da República. Entretanto, a escassez de creches em período integral e de centros comunitários de apoio ao idoso força milhões de brasileiras a abandonarem os estudos e o mercado formal de trabalho, aprofundando o ciclo de vulnerabilidade econômica e invisibilidade estatística.

Portanto, medidas urgentes são necessárias para reverter esse panorama. Cabe ao Ministério da Educação (MEC), em articulação com o Ministério das Mulheres, instituir campanhas e oficinas pedagógicas nas escolas públicas e privadas, por meio da reformulação curricular e da realização de debates com especialistas, com o objetivo de desconstruir estereótipos de gênero e promover a divisão equitativa das tarefas domésticas desde a infância. Além disso, compete ao Ministério do Desenvolvimento Social ampliar a rede de creches públicas e centros diurnos de acolhimento, mediante o direcionamento de verbas orçamentárias prioritárias, a fim de desonerar as cuidadoras e assegurar-lhes plena cidadania e autonomia.`,
};

export default function RedacaoCorretor({ onOpenSettings }: RedacaoCorretorProps) {
  const { showError } = useGeminiError();
  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');
  const [isAvaliando, setIsAvaliando] = useState(false);
  const [analise, setAnalise] = useState<EnemEssayFullAnalysis | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<ClassifiedGeminiError | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Contador de palavras e parágrafos
  const totalPalavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
  const paragrafos = texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const totalParagrafos = paragrafos.length;

  const handleCarregarExemplo = () => {
    setTema(EXEMPLO_REDACAO_NOTA_1000.tema);
    setTexto(EXEMPLO_REDACAO_NOTA_1000.texto);
    setErro(null);
    setFallbackActive(false);
    setFallbackReason(null);
  };

  const handleLimpar = () => {
    setTema('');
    setTexto('');
    setAnalise(null);
    setErro(null);
    setFallbackActive(false);
    setFallbackReason(null);
  };

  const handleAvaliar = async () => {
    if (!texto.trim()) {
      setErro('Por favor, digite ou cole sua redação para iniciar a correção.');
      return;
    }

    if (totalPalavras < 40) {
      setErro('Sua redação possui poucas palavras. Para uma análise completa das 5 competências do ENEM, envie um texto mais desenvolvido.');
      return;
    }

    setIsAvaliando(true);
    setErro(null);

    try {
      const res = await fetch('/api/analyze-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: tema.trim() || undefined,
          texto: texto.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setAnalise(json.data);
        setFallbackActive(false);
        setFallbackReason(null);
      } else {
        throw new Error(json.error || 'Falha ao processar correção com o servidor.');
      }
    } catch (err: any) {
      console.warn('Falha na chamada da API. Executando correção de contingência:', err);
      const classified = classifyGeminiError(err);
      showError(err, {
        componentName: 'Corretor de Redação',
        retryAction: () => handleAvaliar(),
      });
      setFallbackActive(true);
      setFallbackReason(classified);
      // Fallback local seguro para que o estudante continue estudando mesmo com instabilidades
      setAnalise(gerarAnaliseLocal(texto, tema));
    } finally {
      setIsAvaliando(false);
    }
  };

  const handleConfirmPdfExport = (theme: PdfVisualTheme) => {
    if (!analise) return;
    exportEssayCorrectionToPdf(analise, texto, tema, theme);
  };

  const handleCopiarResultado = () => {
    if (!analise) return;
    const comps = analise.competencias || [];
    const textoCopiado = `📊 GABARITOU • CORREÇÃO OFICIAL DE REDAÇÃO ENEM
Tema: ${analise.tema_detectado || tema || 'Geral'}
🏆 NOTA FINAL (0 a 1000): ${analise.nota_final} PONTOS

DETALHAMENTO POR COMPETÊNCIA (0 a 200 pts cada):
• C1 (Norma Culta): ${comps.find((c) => c.numero === 1)?.nota || 0} pts - ${comps.find((c) => c.numero === 1)?.feedback || ''}
• C2 (Tema & Repertório): ${comps.find((c) => c.numero === 2)?.nota || 0} pts - ${comps.find((c) => c.numero === 2)?.feedback || ''}
• C3 (Projeto & Argumentos): ${comps.find((c) => c.numero === 3)?.nota || 0} pts - ${comps.find((c) => c.numero === 3)?.feedback || ''}
• C4 (Coesão & Conectivos): ${comps.find((c) => c.numero === 4)?.nota || 0} pts - ${comps.find((c) => c.numero === 4)?.feedback || ''}
• C5 (Proposta de Intervenção): ${comps.find((c) => c.numero === 5)?.nota || 0} pts - ${comps.find((c) => c.numero === 5)?.feedback || ''}

PONTOS FORTES:
${(analise.pontos_fortes || []).map((pf) => `✓ ${pf}`).join('\n')}

O QUE PRECISA SER CORRIGIDO / MELHORADO:
${(analise.pontos_melhoria || analise.pontos_a_melhorar || []).map((pm) => `! ${pm}`).join('\n')}

DICA DE OURO:
${analise.sugestao_reescrita || analise.dica_de_ouro || ''}`;

    navigator.clipboard.writeText(textoCopiado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cores dinâmicas de nota total
  const getNotaColor = (nota: number) => {
    if (nota >= 900) return { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300', label: 'Excelente (Faixa 900+)' };
    if (nota >= 800) return { bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300', label: 'Muito Bom (800 a 880)' };
    if (nota >= 680) return { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300', label: 'Bom Potencial (680 a 780)' };
    return { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300', label: 'Atenção aos Fundamentos' };
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 text-indigo-200 text-xs font-bold mb-3">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Padrão Oficial INEP • ENEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Corretor de Redação Completo (0 a 1000)
            </h1>
            <p className="text-indigo-100/90 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Avaliação completa somando as 5 competências (0 a 200 pontos cada), com diagnóstico de pontos fortes, pontos de melhoria e exportação em PDF em 3 temas visuais.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCarregarExemplo}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Carregar Exemplo Nota 1000</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Tema */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tema da Redação (Opcional ou selecione um tema oficial):
          </label>
          <input
            type="text"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Ex: Invisibilidade do trabalho de cuidado realizado pela mulher no Brasil..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />

          {/* Temas Sugeridos Pills */}
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
              Temas ENEM:
            </span>
            {TEMAS_ENEM_SUGESTOES.slice(0, 3).map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTema(t)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer text-left truncate max-w-[260px]"
                title={t}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Texto da Redação:
            </label>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3">
              <span>{totalParagrafos} {totalParagrafos === 1 ? 'parágrafo' : 'parágrafos'}</span>
              <span>•</span>
              <span className={totalPalavras < 150 ? 'text-amber-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                {totalPalavras} palavras
              </span>
            </div>
          </div>

          <textarea
            rows={12}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole ou digite aqui sua redação dissertativo-argumentativa completa (com Introdução, Desenvolvimento 1, Desenvolvimento 2 e Proposta de Intervenção)..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-normal"
          />
        </div>

        {/* Erro */}
        {erro && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleLimpar}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Limpar
          </button>

          <button
            type="button"
            onClick={handleAvaliar}
            disabled={isAvaliando}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            {isAvaliando ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                <span>Analisando 5 Competências...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Calcular Nota & Corrigir (0 a 1000)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultados da Correção */}
      {analise && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Alerta Amigável de Contingência / Fallback */}
          {fallbackActive && fallbackReason && (
            <div
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
                fallbackReason.isAuthError
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : fallbackReason.isOfflineError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {fallbackReason.isAuthError ? (
                  <KeyRound className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                ) : fallbackReason.isOfflineError ? (
                  <WifiOff className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-sm">{fallbackReason.title}</p>
                  <p className="mt-0.5 opacity-90 leading-relaxed">
                    {fallbackReason.message} Apresentamos uma avaliação preliminar local baseada nos critérios oficiais do ENEM para você continuar produzindo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {fallbackReason.isAuthError && onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Configurar Chave</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAvaliar}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reavaliar com IA</span>
                </button>
              </div>
            </div>
          )}

          {/* Card Principal: Nota Total (0 a 1000) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Nota Final Calculada (C1 + C2 + C3 + C4 + C5)
                </span>
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                    {analise.nota_final}
                  </span>
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                    / 1000 pontos
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getNotaColor(analise.nota_final).badge} ${getNotaColor(analise.nota_final).text}`}>
                    {getNotaColor(analise.nota_final).label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tema: <strong>{analise.tema_detectado || tema || 'Tema ENEM'}</strong>
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCopiarResultado}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Parecer</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Relatório PDF</span>
                </button>
              </div>
            </div>

            {/* Barra de Progresso Visual da Nota Total */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>0 pontos</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
                <span className="font-bold text-slate-900 dark:text-white">1000 pontos (Nota Máxima)</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getNotaColor(analise.nota_final).bg}`}
                  style={{ width: `${Math.min(100, (analise.nota_final / 1000) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detalhamento por Competência (C1 a C5) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Detalhamento por Competência (0 a 200 pontos cada)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cada competência é rigorosamente avaliada em múltiplos de 40 pontos segundo a matriz oficial do ENEM.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {(analise.competencias || []).map((comp: EssayCompetencyDetail) => {
                const percent = (comp.nota / 200) * 100;
                let colorClass = 'bg-indigo-600';
                if (comp.nota >= 180) colorClass = 'bg-emerald-500';
                else if (comp.nota < 120) colorClass = 'bg-amber-500';

                return (
                  <div
                    key={comp.numero}
                    className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center">
                          C{comp.numero}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {comp.nome}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {comp.nota}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {' '}/ 200 pts
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar da Competência */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-2.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Feedback Específico */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {comp.feedback}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid de Feedback Estruturado: Pontos Fortes e O que precisa ser corrigido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pontos Fortes */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-300">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-extrabold">Pontos Fortes do Texto</h3>
              </div>

              <ul className="space-y-2 mt-2">
                {(analise.pontos_fortes || []).map((pf, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-emerald-900 dark:text-emerald-200 flex items-start space-x-2 leading-relaxed"
                  >
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{pf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* O que precisa ser corrigido / melhorado */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-5 sm:p-6 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-amber-800 dark:text-amber-300">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-extrabold">O Que Precisa Ser Corrigido / Melhorado</h3>
              </div>

              <ul className="space-y-2 mt-2">
                {(analise.pontos_melhoria || analise.pontos_a_melhorar || []).map((pm, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2 leading-relaxed"
                  >
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{pm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dica de Ouro / Sugestão Prática de Reescrita */}
          {(analise.sugestao_reescrita || analise.dica_de_ouro) && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 rounded-2xl p-5 sm:p-6 border border-indigo-200/80 dark:border-indigo-900/40">
              <div className="flex items-center space-x-2.5 text-indigo-900 dark:text-indigo-200 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h4 className="text-sm font-extrabold">
                  Sugestão Prática de Reescrita / Dica de Ouro para a Nota 1000
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "{analise.sugestao_reescrita || analise.dica_de_ouro}"
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal de Exportação com 3 Temas Visuais */}
      <PdfThemeSelectorModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onConfirmExport={handleConfirmPdfExport}
        documentTitle={`Redação ENEM - ${analise?.nota_final || 0} pontos`}
        documentType="redacao"
      />
    </div>
  );
}

// Fallback didático offline caso ocorra indisponibilidade momentânea da rede
function gerarAnaliseLocal(texto: string, tema?: string): EnemEssayFullAnalysis {
  const lower = texto.toLowerCase();
  const totalWords = texto.trim().split(/\s+/).length;
  const paragraphs = texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  // C1
  let c1 = 160;
  let c1Feed = 'Bom domínio da norma padrão com registro formal e sintaxe coesa.';
  if (totalWords < 120) { c1 = 120; c1Feed = 'Texto curto para avaliação sintática plena da norma culta.'; }
  else if (paragraphs.length >= 4 && totalWords > 240) { c1 = 200; c1Feed = 'Excelente domínio da norma padrão, estrutura sintática impecável e pontuação correta.'; }

  // C2
  let c2 = 160;
  let c2Feed = 'Tema abordado com consistência e repertório sociocultural aplicado de forma pertinente.';
  if (lower.includes('bauman') || lower.includes('constituição') || lower.includes('filósofo') || lower.includes('século')) {
    c2 = 200;
    c2Feed = 'Repertório sociocultural legitimado e produtivo perfeitamente articulado à tese da redação.';
  }

  // C3
  let c3 = 160;
  let c3Feed = 'Projeto de texto com defesa clara de ponto de vista e seleção de argumentos sólidos.';
  if (paragraphs.length >= 4 && (lower.includes('em primeiro lugar') || lower.includes('ademais') || lower.includes('sob essa ótica'))) {
    c3 = 200;
    c3Feed = 'Projeto de texto estratégico, autoria marcante e relações de causa-efeito aprofundadas.';
  }

  // C4
  let c4 = 160;
  let c4Feed = 'Emprego variado de conectivos e operadores argumentativos entre os parágrafos.';
  if (lower.includes('portanto') && (lower.includes('além disso') || lower.includes('ademais')) && lower.includes('contudo')) {
    c4 = 200;
    c4Feed = 'Amplo repertório de recursos coesivos sem repetições viciosas, com transições fluídas.';
  }

  // C5
  const temAgente = lower.includes('ministério') || lower.includes('governo') || lower.includes('mec') || lower.includes('escola') || lower.includes('cabe ao');
  const temAcao = lower.includes('promover') || lower.includes('criar') || lower.includes('desenvolver') || lower.includes('implementar') || lower.includes('garantir');
  const temMeio = lower.includes('por meio') || lower.includes('através de') || lower.includes('mediante');
  const temEfeito = lower.includes('a fim de') || lower.includes('para que') || lower.includes('com o intuito');
  const temDetalhamento = texto.includes('(') || (texto.includes(',') && (lower.includes('como') || lower.includes('em parceria')));
  const countC5 = [temAgente, temAcao, temMeio, temEfeito, temDetalhamento].filter(Boolean).length;
  const c5 = countC5 * 40;
  const c5Feed = countC5 === 5
    ? 'Proposta completa com os 5 elementos obrigatórios: Agente, Ação, Meio/Modo, Efeito e Detalhamento.'
    : `Proposta identificou ${countC5} dos 5 elementos da intervenção. Para atingir 200 pontos, garanta Agente, Ação, Meio, Efeito e Detalhamento.`;

  const total = c1 + c2 + c3 + c4 + c5;

  return {
    tipo_resposta: 'correcao_redacao_enem',
    tema_detectado: tema || 'Tema Geral ENEM',
    nota_final: total,
    competencias: [
      { numero: 1, nome: 'Domínio da Norma Culta', nota: c1, feedback: c1Feed },
      { numero: 2, nome: 'Compreensão do Tema e Repertório', nota: c2, feedback: c2Feed },
      { numero: 3, nome: 'Projeto de Texto e Argumentação', nota: c3, feedback: c3Feed },
      { numero: 4, nome: 'Coesão Textual e Conectivos', nota: c4, feedback: c4Feed },
      { numero: 5, nome: 'Proposta de Intervenção', nota: c5, feedback: c5Feed },
    ],
    pontos_fortes: [
      'Estrutura dissertativo-argumentativa clara em introdução, desenvolvimento e proposta de intervenção.',
      'Respeito irrestrito aos direitos humanos em todas as etapas da argumentação.',
      'Abordagem focada na tese central sem tangenciamento.',
    ],
    pontos_melhoria: [
      'Garantir todos os 5 elementos da proposta de intervenção para cravar 200 pontos na Competência 5.',
      'Diversificar ainda mais os operadores argumentativos no início dos parágrafos de desenvolvimento.',
    ],
    sugestao_reescrita: 'Para atingir a nota máxima, utilize no parágrafo final a estrutura: "Portanto, cabe ao [Agente], por meio de [Meio/Modo], [Ação], a fim de [Finalidade/Impacto], [Detalhamento Explicativo]."',
  };
}

export { RedacaoCorretor };
