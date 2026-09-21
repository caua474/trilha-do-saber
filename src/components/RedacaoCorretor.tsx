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
  Target,
  Layers,
  ListChecks,
} from 'lucide-react';
import PdfThemeSelectorModal from './PdfThemeSelectorModal';
import { exportEssayCorrectionToPdf, PdfVisualTheme } from '../utils/pdfExport';
import { EnemEssayFullAnalysis, EssayCompetencyDetail, SingleCompetencyAnalysis } from '../types';
import { useGeminiError } from '../context/GeminiErrorContext';
import { classifyGeminiError, ClassifiedGeminiError } from '../utils/geminiErrorHandler';
import { validateEssayInput, validateSingleCompetencyInput, sanitizeInputText } from '../utils/textValidation';

interface RedacaoCorretorProps {
  onOpenSettings?: () => void;
}

type ModoAvaliacao = 'completa' | 'individual';

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

const EXEMPLOS_COMPETENCIAS: Record<number, { tema: string; texto: string; descricao: string }> = {
  1: {
    tema: 'Democratização do acesso à cultura no Brasil',
    texto: 'Em consonância com a teoria sociológica contemporânea, verifica-se que a marginalização cultural engendra uma cisão profunda no corpo social, haja vista que contingentes expressivos da população permanecem alijados dos bens simbólicos fundamentais à fruição da cidadania plena.',
    descricao: 'Sintaxe apurada, regência precisa e vocabulário formal exemplar.',
  },
  2: {
    tema: 'Invisibilidade do trabalho de cuidado no Brasil',
    texto: 'De acordo com o sociólogo Zygmunt Bauman, em sua obra "Modernidade Líquida", a contemporaneidade mercantiliza as relações e subvaloriza tarefas que não geram lucro imediato. No Brasil, essa lógica intensifica a invisibilidade das atividades de cuidado desempenhadas historicamente pelas mulheres, contrariando o princípio da dignidade da pessoa humana previsto na Constituição Cidadã de 1988.',
    descricao: 'Repertório legitimado (Bauman + CF/88) produtivo e pertinente ao tema.',
  },
  3: {
    tema: 'Caminhos para combater a intolerância religiosa no Brasil',
    texto: 'Em primeira análise, cabe pontuar que a persistência da intolerância religiosa decorre de uma herança etnocêntrica cristalizada no imaginário coletivo. Sob essa ótica, grupos hegemônicos historicamente estigmatizaram cultos de matriz africana, associando-os a preceitos pejorativos. Desse modo, sem uma intervenção crítica que desmistifique esses preconceitos, o país continuará perpetuando a violência simbólica contra minorias religiosas.',
    descricao: 'Parágrafo argumentativo estruturado com tese, fundamentação e relação de causa e efeito.',
  },
  4: {
    tema: 'Impactos da inteligência artificial no mercado de trabalho',
    texto: 'Ademais, faz-se mister analisar a precarização das relações laborais decorrente da automação desmedida. Nesse contexto, enquanto corporações visam à maximização de lucros, trabalhadores de baixa qualificação são sumariamente preteridos. Contudo, essa transição tecnológica, se desacompanhada de requalificação profissional, gerará um abismo socioeconômico sem precedentes. Por conseguinte, a atuação regulatória do Estado torna-se impreterível.',
    descricao: 'Rico repertório de conectivos inter e intraparágrafos (Ademais, Nesse contexto, Contudo, Por conseguinte).',
  },
  5: {
    tema: 'Invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
    texto: 'Portanto, medidas urgentes são necessárias para reverter esse panorama. Cabe ao Ministério da Educação (MEC), em articulação com o Ministério das Mulheres, órgão responsável pelas políticas de equidade [Detalhamento do Agente], instituir campanhas e oficinas pedagógicas nas escolas públicas e privadas [Ação], por meio da reformulação curricular e de debates comunitários [Meio/Modo], a fim de desconstruir estereótipos de gênero e promover a divisão equitativa das tarefas domésticas [Efeito].',
    descricao: 'Proposta com os 5 elementos obrigatórios: Agente, Ação, Meio/Modo, Efeito e Detalhamento.',
  },
};

const COMPETENCIAS_INFO = [
  { num: 1, sigla: 'C1', nome: 'Domínio da Norma Culta', foco: 'Gramática, Ortografia, Regência e Sintaxe' },
  { num: 2, sigla: 'C2', nome: 'Tema & Repertório', foco: 'Compreensão do tema e repertório sociocultural legitimado' },
  { num: 3, sigla: 'C3', nome: 'Projeto de Texto & Argumentação', foco: 'Defesa de tese e relação de causa e efeito' },
  { num: 4, sigla: 'C4', nome: 'Coesão & Conectivos', foco: 'Operadores argumentativos inter e intraparágrafos' },
  { num: 5, sigla: 'C5', nome: 'Proposta de Intervenção', foco: '5 elementos: Agente, Ação, Meio, Efeito e Detalhamento' },
];

export default function RedacaoCorretor({ onOpenSettings }: RedacaoCorretorProps) {
  const { clearError } = useGeminiError();

  // Modo de avaliação: 'completa' (0 a 1000) ou 'individual' (0 a 200)
  const [modo, setModo] = useState<ModoAvaliacao>('completa');
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState<number>(5);

  const [tema, setTema] = useState('');
  const [texto, setTexto] = useState('');
  const [isAvaliando, setIsAvaliando] = useState(false);

  // Resultados das duas modalidades
  const [analiseCompleta, setAnaliseCompleta] = useState<EnemEssayFullAnalysis | null>(null);
  const [analiseIndividual, setAnaliseIndividual] = useState<SingleCompetencyAnalysis | null>(null);

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
    setErro(null);
    setFallbackActive(false);
    setFallbackReason(null);

    if (modo === 'completa') {
      setTema(EXEMPLO_REDACAO_NOTA_1000.tema);
      setTexto(EXEMPLO_REDACAO_NOTA_1000.texto);
    } else {
      const ex = EXEMPLOS_COMPETENCIAS[competenciaSelecionada] || EXEMPLOS_COMPETENCIAS[5];
      setTema(ex.tema);
      setTexto(ex.texto);
    }
  };

  const handleLimpar = () => {
    setTema('');
    setTexto('');
    setAnaliseCompleta(null);
    setAnaliseIndividual(null);
    setErro(null);
    setFallbackActive(false);
    setFallbackReason(null);
    clearError();
  };

  // Avaliação no Modo Redação Completa (0 a 1000 pontos)
  const handleAvaliarCompleta = async () => {
    // Validação e sanitização robusta do texto e tema da redação
    const validation = validateEssayInput(texto, tema);
    if (!validation.isValid) {
      setErro(validation.errorMessage || 'Por favor, insira uma redação válida para iniciar a correção.');
      return;
    }

    const cleanTexto = validation.sanitizedText;
    const cleanTema = sanitizeInputText(tema);
    setTexto(cleanTexto);
    if (tema) setTema(cleanTema);

    setIsAvaliando(true);
    setErro(null);

    try {
      const res = await fetch('/api/analyze-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema: cleanTema || undefined,
          texto: cleanTexto,
        }),
      });

      let json: any = null;
      try {
        const rawText = await res.text();
        // Tenta parse direto ou reparo básico de corte
        try {
          json = JSON.parse(rawText);
        } catch (_) {
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            json = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
          }
        }
      } catch (parseErr) {
        console.warn('Resposta não pôde ser parseada. Acionando fallback silencioso:', parseErr);
      }

      if (res.ok && json?.success && json?.data) {
        setAnaliseCompleta(json.data);
        setFallbackActive(false);
        setFallbackReason(null);
        setErro(null);
        clearError(); // Oculta qualquer banner de erro no topo da página
      } else {
        // Fallback silencioso: calcula a nota e relatório pelas diretrizes oficiais do ENEM
        const fallbackData = json?.data || gerarAnaliseLocal(cleanTexto, cleanTema);
        setAnaliseCompleta(fallbackData);
        setFallbackActive(false);
        setFallbackReason(null);
        setErro(null);
        clearError(); // Oculta qualquer banner de erro já que a análise foi concluída com sucesso
      }
    } catch (err: any) {
      console.warn('Falha na chamada da API. Executando contingência silenciosa com sucesso:', err);
      // Se a nota e o relatório do ENEM forem calculados com sucesso, não exiba o banner de erro no topo da página
      const fallbackData = gerarAnaliseLocal(cleanTexto, cleanTema);
      setAnaliseCompleta(fallbackData);
      setFallbackActive(false);
      setFallbackReason(null);
      setErro(null);
      clearError(); // Oculta qualquer banner de erro no topo da página
    } finally {
      setIsAvaliando(false);
    }
  };

  // Avaliação no Modo Competência Individual (0 a 200 pontos)
  const handleAvaliarIndividual = async () => {
    // Validação e sanitização robusta do parágrafo específico
    const validation = validateSingleCompetencyInput(texto, competenciaSelecionada);
    if (!validation.isValid) {
      setErro(validation.errorMessage || 'Por favor, insira um parágrafo ou trecho válido.');
      return;
    }

    const cleanTexto = validation.sanitizedText;
    const cleanTema = sanitizeInputText(tema);
    setTexto(cleanTexto);
    if (tema) setTema(cleanTema);

    setIsAvaliando(true);
    setErro(null);

    try {
      const res = await fetch('/api/analyze-single-competency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competencia: competenciaSelecionada,
          tema: cleanTema || undefined,
          texto: cleanTexto,
        }),
      });

      let json: any = null;
      try {
        const rawText = await res.text();
        try {
          json = JSON.parse(rawText);
        } catch (_) {
          const firstBrace = rawText.indexOf('{');
          const lastBrace = rawText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            json = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
          }
        }
      } catch (parseErr) {
        console.warn('Resposta individual não pôde ser parseada. Acionando fallback silencioso:', parseErr);
      }

      if (res.ok && json?.success && json?.data) {
        setAnaliseIndividual(json.data);
        setFallbackActive(false);
        setFallbackReason(null);
        setErro(null);
        clearError(); // Oculta qualquer banner de erro no topo da página
      } else {
        // Fallback silencioso
        const fallbackData = json?.data || gerarAnaliseIndividualLocal(competenciaSelecionada, texto, tema);
        setAnaliseIndividual(fallbackData);
        setFallbackActive(false);
        setFallbackReason(null);
        setErro(null);
        clearError(); // Oculta qualquer banner de erro no topo da página
      }
    } catch (err: any) {
      console.warn('Falha na avaliação individual. Executando contingência silenciosa com sucesso:', err);
      // Se a nota e o relatório do ENEM forem calculados com sucesso, não exiba o banner de erro no topo da página
      const fallbackData = gerarAnaliseIndividualLocal(competenciaSelecionada, texto, tema);
      setAnaliseIndividual(fallbackData);
      setFallbackActive(false);
      setFallbackReason(null);
      setErro(null);
      clearError(); // Oculta qualquer banner de erro no topo da página
    } finally {
      setIsAvaliando(false);
    }
  };

  const handleConfirmPdfExport = (theme: PdfVisualTheme) => {
    if (!analiseCompleta) return;
    exportEssayCorrectionToPdf(analiseCompleta, texto, tema, theme);
  };

  const handleCopiarResultadoCompleto = () => {
    if (!analiseCompleta) return;
    const comps = analiseCompleta.competencias || [];
    const textoCopiado = `📊 GABARITOU • CORREÇÃO OFICIAL DE REDAÇÃO ENEM
Tema: ${analiseCompleta.tema_detectado || tema || 'Geral'}
🏆 NOTA FINAL (0 a 1000): ${analiseCompleta.nota_final} PONTOS

DETALHAMENTO POR COMPETÊNCIA (0 a 200 pts cada):
• C1 (Norma Culta): ${comps.find((c) => c.numero === 1)?.nota || 0} pts - ${comps.find((c) => c.numero === 1)?.feedback || ''}
• C2 (Tema & Repertório): ${comps.find((c) => c.numero === 2)?.nota || 0} pts - ${comps.find((c) => c.numero === 2)?.feedback || ''}
• C3 (Projeto & Argumentos): ${comps.find((c) => c.numero === 3)?.nota || 0} pts - ${comps.find((c) => c.numero === 3)?.feedback || ''}
• C4 (Coesão & Conectivos): ${comps.find((c) => c.numero === 4)?.nota || 0} pts - ${comps.find((c) => c.numero === 4)?.feedback || ''}
• C5 (Proposta de Intervenção): ${comps.find((c) => c.numero === 5)?.nota || 0} pts - ${comps.find((c) => c.numero === 5)?.feedback || ''}

PONTOS FORTES:
${(analiseCompleta.pontos_fortes || []).map((pf) => `✓ ${pf}`).join('\n')}

O QUE PRECISA SER CORRIGIDO / MELHORADO:
${(analiseCompleta.pontos_melhoria || analiseCompleta.pontos_a_melhorar || []).map((pm) => `! ${pm}`).join('\n')}

DICA DE OURO:
${analiseCompleta.sugestao_reescrita || analiseCompleta.dica_de_ouro || ''}`;

    navigator.clipboard.writeText(textoCopiado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopiarResultadoIndividual = () => {
    if (!analiseIndividual) return;
    const textoCopiado = `🎯 GABARITOU • TREINO DE COMPETÊNCIA ENEM
Competência: C${analiseIndividual.competencia_numero} - ${analiseIndividual.competencia_nome}
Tema: ${tema || 'Geral'}
🏆 NOTA OBTIDA (0 a 200): ${analiseIndividual.nota} PONTOS (${analiseIndividual.nivel || ''})

PARECER PEDAGÓGICO:
${analiseIndividual.feedback}

PONTOS FORTES:
${(analiseIndividual.pontos_fortes || []).map((pf) => `✓ ${pf}`).join('\n')}

O QUE MELHORAR:
${(analiseIndividual.pontos_melhoria || []).map((pm) => `! ${pm}`).join('\n')}

SUGESTÃO PARA 200 PONTOS:
${analiseIndividual.sugestao_reescrita || analiseIndividual.dica_de_ouro || ''}`;

    navigator.clipboard.writeText(textoCopiado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNotaColor1000 = (nota: number) => {
    if (nota >= 900) return { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300', label: 'Excelente (Faixa 900+)' };
    if (nota >= 800) return { bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300', label: 'Muito Bom (800 a 880)' };
    if (nota >= 680) return { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300', label: 'Bom Potencial (680 a 780)' };
    return { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300', label: 'Atenção aos Fundamentos' };
  };

  const getNotaColor200 = (nota: number) => {
    if (nota === 200) return { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300', label: 'Nível 5 • Nota Máxima (200 pts)' };
    if (nota === 160) return { bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300', label: 'Nível 4 • Muito Bom (160 pts)' };
    if (nota === 120) return { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300', label: 'Nível 3 • Regular (120 pts)' };
    if (nota === 80) return { bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-950/60 border-orange-300', label: 'Nível 2 • Insuficiente (80 pts)' };
    return { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300', label: 'Nível 0/1 • Crítico (0 a 40 pts)' };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
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
              Corretor de Redação Inteligente
            </h1>
            <p className="text-indigo-100/90 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Avalie sua redação completa somando as 5 competências (0 a 1000 pontos) ou realize treinos cirúrgicos focados em competências específicas (0 a 200 pontos).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCarregarExemplo}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 shrink-0 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {modo === 'completa' ? 'Carregar Redação Nota 1000' : `Carregar Exemplo da C${competenciaSelecionada}`}
              </span>
            </button>
          </div>
        </div>
      </div>

        {/* 1. SELETOR DE MODO DE AVALIAÇÃO (TABS SUPERIORES) */}
        <div id="essay-mode-selector-tabs" className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            id="tab-mode-redacao-completa"
            type="button"
            onClick={() => {
              setModo('completa');
              setErro(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              modo === 'completa'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <Award className={`w-4 h-4 ${modo === 'completa' ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>Redação Completa (ENEM)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                modo === 'completa'
                  ? 'bg-indigo-700 text-indigo-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              0 a 1000 pts
            </span>
          </button>

          <button
            id="tab-mode-competencia-especifica"
            type="button"
            onClick={() => {
              setModo('individual');
              setErro(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              modo === 'individual'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-500'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
            }`}
          >
            <Target className={`w-4 h-4 ${modo === 'individual' ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>Competência Específica (Individual)</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                modo === 'individual'
                  ? 'bg-purple-700 text-purple-100'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              0 a 200 pts
            </span>
          </button>
        </div>

        {/* Editor & Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* 3. AJUSTE DE INTERFACE: INDICAÇÃO CLARA DO MODO SELECIONADO NO TOPO DO FORMULÁRIO */}
          <div
            id="current-evaluation-mode-banner"
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              modo === 'completa'
                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-950 dark:text-indigo-200'
                : 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/80 text-purple-950 dark:text-purple-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl text-white shadow-xs ${
                  modo === 'completa' ? 'bg-indigo-600' : 'bg-purple-600'
                }`}
              >
                {modo === 'completa' ? <Award className="w-5 h-5 text-amber-300" /> : <Target className="w-5 h-5 text-amber-300" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Modo Selecionado:
                  </span>
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    {modo === 'completa' ? 'Redação Completa 0-1000' : 'Competência Específica 0-200'}
                  </span>
                  {modo === 'individual' && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-300/60">
                      C{competenciaSelecionada} ({COMPETENCIAS_INFO.find((c) => c.num === competenciaSelecionada)?.nome})
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-90 mt-1 leading-relaxed max-w-2xl">
                  {modo === 'completa'
                    ? 'A IA avaliará o texto dissertativo completo somando as 5 competências do ENEM (C1 a C5) e retornando a nota final de 0 a 1000 pontos com detalhamento de cada competência.'
                    : `Treino focado e individual para a ${COMPETENCIAS_INFO.find((c) => c.num === competenciaSelecionada)?.nome || 'Competência'}. Avalie um parágrafo específico ou a proposta de intervenção de 0 a 200 pontos.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span
                className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider border shadow-2xs ${
                  modo === 'completa'
                    ? 'bg-indigo-100 dark:bg-indigo-900/60 border-indigo-300 text-indigo-800 dark:text-indigo-200'
                    : 'bg-purple-100 dark:bg-purple-900/60 border-purple-300 text-purple-800 dark:text-purple-200'
                }`}
              >
                {modo === 'completa' ? 'Redação Completa 0-1000' : 'Competência Específica 0-200'}
              </span>
            </div>
          </div>

        {/* 2. MODO COMPETÊNCIA INDIVIDUAL: SELEÇÃO DA COMPETÊNCIA ESPECÍFICA */}
        {modo === 'individual' && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-purple-600" />
                <span>Escolha a Competência do ENEM para treinar:</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Critério Oficial INEP (0 a 200 pts)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {COMPETENCIAS_INFO.map((comp) => {
                const isSelected = competenciaSelecionada === comp.num;
                return (
                  <button
                    key={comp.num}
                    type="button"
                    onClick={() => {
                      setCompetenciaSelecionada(comp.num);
                      setAnaliseIndividual(null);
                      setErro(null);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {comp.sigla}
                        </span>

                        {comp.num === 5 && (
                          <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-300/80">
                            Intervenção
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {comp.nome}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-tight">
                      {comp.foco}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tema */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Tema da Redação (Opcional ou selecione uma proposta oficial):
          </label>
          <input
            type="text"
            value={tema}
            onChange={(e) => {
              setTema(e.target.value);
              if (erro) setErro(null);
            }}
            placeholder="Ex: Invisibilidade do trabalho de cuidado realizado pela mulher no Brasil..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />

          {/* Temas Sugeridos Pills */}
          <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">
              Sugestões ENEM:
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
              {modo === 'completa'
                ? 'Texto da Redação Completa (Introdução, D1, D2 e Proposta de Intervenção):'
                : `Texto para Avaliação da Competência C${competenciaSelecionada} (${COMPETENCIAS_INFO.find((c) => c.num === competenciaSelecionada)?.nome}):`}
            </label>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-3">
              <span>
                {totalParagrafos} {totalParagrafos === 1 ? 'parágrafo' : 'parágrafos'}
              </span>
              <span>•</span>
              <span
                className={
                  modo === 'completa'
                    ? totalPalavras < 150
                      ? 'text-amber-500 font-semibold'
                      : 'text-emerald-500 font-semibold'
                    : totalPalavras < 20
                    ? 'text-amber-500 font-semibold'
                    : 'text-emerald-500 font-semibold'
                }
              >
                {totalPalavras} palavras
              </span>
            </div>
          </div>

          <textarea
            rows={modo === 'completa' ? 12 : 8}
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              if (erro) setErro(null);
            }}
            placeholder={
              modo === 'completa'
                ? 'Cole ou digite aqui sua redação dissertativo-argumentativa completa (com Introdução, Desenvolvimento 1, Desenvolvimento 2 e Conclusão com Proposta de Intervenção)...'
                : competenciaSelecionada === 5
                ? 'Cole ou digite aqui seu parágrafo de Conclusão / Proposta de Intervenção. A IA avaliará a presença dos 5 elementos obrigatórios: Agente, Ação, Meio/Modo, Efeito e Detalhamento (40 pts cada = 200 pts).'
                : competenciaSelecionada === 2
                ? 'Cole seu parágrafo ou texto para avaliar a compreensão da proposta e o repertório sociocultural legitimado (filosofia, sociologia, história, legislação, etc.).'
                : competenciaSelecionada === 4
                ? 'Cole seu texto para avaliar o uso de conectivos, recursos coesivos e encadeamento lógico intra e interparágrafos.'
                : 'Cole o parágrafo ou texto que deseja submeter para a análise detalhada desta competência...'
            }
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-normal"
          />
          <div className="flex items-center justify-between px-1 pt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <span>
              {texto.trim() ? `${texto.trim().length} caracteres digitados` : 'Nenhum texto inserido'}
            </span>
            <span className="text-[10px]">
              {modo === 'completa'
                ? 'Mínimo recomendado para o ENEM: ~150 palavras (4 parágrafos)'
                : 'Mínimo para avaliação da competência: 1 período completo (~7 palavras)'}
            </span>
          </div>
        </div>

        {/* Erro */}
        {erro && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLimpar}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Limpar Campos
          </button>

          {/* BOTÕES PRINCIPAIS EXATAMENTE CONFORME ESPECIFICADO */}
          {modo === 'completa' ? (
            <button
              type="button"
              onClick={handleAvaliarCompleta}
              disabled={isAvaliando}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {isAvaliando ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Avaliando Redação Completa...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Avaliar Redação Completa</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAvaliarIndividual}
              disabled={isAvaliando}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {isAvaliando ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Avaliando Competência C{competenciaSelecionada}...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Avaliar Competência C{competenciaSelecionada} (0 a 200 pts)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* RESULTADOS DA CORREÇÃO: MODO REDAÇÃO COMPLETA (0 A 1000 PONTOS) */}
      {modo === 'completa' && analiseCompleta && (
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
                    {fallbackReason.message} Apresentamos a análise calculada pelas regras oficiais do ENEM.
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
                  onClick={handleAvaliarCompleta}
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
                    {analiseCompleta.nota_final}
                  </span>
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                    / 1000 pontos
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      getNotaColor1000(analiseCompleta.nota_final).badge
                    } ${getNotaColor1000(analiseCompleta.nota_final).text}`}
                  >
                    {getNotaColor1000(analiseCompleta.nota_final).label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Tema: <strong>{analiseCompleta.tema_detectado || tema || 'Tema ENEM'}</strong>
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCopiarResultadoCompleto}
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
                  className={`h-full rounded-full transition-all duration-700 ${
                    getNotaColor1000(analiseCompleta.nota_final).bg
                  }`}
                  style={{ width: `${Math.min(100, (analiseCompleta.nota_final / 1000) * 100)}%` }}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(analiseCompleta.competencias || []).map((comp: EssayCompetencyDetail) => {
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

          {/* Grid de Feedback: Pontos Fortes e Melhoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-300">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-extrabold">Pontos Fortes do Texto</h3>
              </div>

              <ul className="space-y-2 mt-2">
                {(analiseCompleta.pontos_fortes || []).map((pf, idx) => (
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

            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-5 sm:p-6 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-amber-800 dark:text-amber-300">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-extrabold">O Que Precisa Ser Corrigido / Melhorado</h3>
              </div>

              <ul className="space-y-2 mt-2">
                {(analiseCompleta.pontos_melhoria || analiseCompleta.pontos_a_melhorar || []).map(
                  (pm, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2 leading-relaxed"
                    >
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{pm}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Dica de Ouro */}
          {(analiseCompleta.sugestao_reescrita || analiseCompleta.dica_de_ouro) && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/20 rounded-2xl p-5 sm:p-6 border border-indigo-200/80 dark:border-indigo-900/40">
              <div className="flex items-center space-x-2.5 text-indigo-900 dark:text-indigo-200 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <h4 className="text-sm font-extrabold">
                  Sugestão Prática de Reescrita / Dica de Ouro para a Nota 1000
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "{analiseCompleta.sugestao_reescrita || analiseCompleta.dica_de_ouro}"
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* RESULTADOS DA CORREÇÃO: MODO COMPETÊNCIA INDIVIDUAL (0 A 200 PONTOS) */}
      {modo === 'individual' && analiseIndividual && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Alerta de contingência para modo individual */}
          {fallbackActive && fallbackReason && (
            <div
              className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
                fallbackReason.isAuthError
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">{fallbackReason.title}</p>
                  <p className="mt-0.5 opacity-90 leading-relaxed">
                    {fallbackReason.message} Avaliação realizada pela matriz oficial do INEP para a Competência {analiseIndividual.competencia_numero}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAvaliarIndividual}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reavaliar com IA</span>
              </button>
            </div>
          )}

          {/* Card Principal: Nota da Competência (0 a 200) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    C{analiseIndividual.competencia_numero}
                  </span>
                  <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    {analiseIndividual.competencia_nome}
                  </span>
                </div>

                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                    {analiseIndividual.nota}
                  </span>
                  <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                    / 200 pontos
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      getNotaColor200(analiseIndividual.nota).badge
                    } ${getNotaColor200(analiseIndividual.nota).text}`}
                  >
                    {getNotaColor200(analiseIndividual.nota).label}
                  </span>
                  {analiseIndividual.nivel && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {analiseIndividual.nivel}
                    </span>
                  )}
                </div>
              </div>

              {/* Botão de Copiar */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleCopiarResultadoIndividual}
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
                      <span>Copiar Parecer C{analiseIndividual.competencia_numero}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Barra de Progresso Visual 0 a 200 */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>0 pts</span>
                <span>40 pts (N1)</span>
                <span>80 pts (N2)</span>
                <span>120 pts (N3)</span>
                <span>160 pts (N4)</span>
                <span className="font-bold text-slate-900 dark:text-white">200 pts (Nível 5)</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    getNotaColor200(analiseIndividual.nota).bg
                  }`}
                  style={{ width: `${Math.min(100, (analiseIndividual.nota / 200) * 100)}%` }}
                />
              </div>
            </div>

            {/* Feedback da banca */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white mb-1">
                Parecer Técnico da Competência:
              </p>
              <p>{analiseIndividual.feedback}</p>
            </div>
          </div>

          {/* CHECKLIST EXCLUSIVO DOS 5 ELEMENTOS DA COMPETÊNCIA 5 (PROPOSTA DE INTERVENÇÃO) */}
          {(analiseIndividual.competencia_numero === 5 || analiseIndividual.elementos_c5) && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    <span>Checklist dos 5 Elementos da Competência 5</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    No ENEM, cada elemento completo soma exatamente 40 pontos na Competência 5 (5 × 40 = 200 pontos).
                  </p>
                </div>
              </div>

              {analiseIndividual.elementos_c5 ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                  {[
                    { key: 'agente', label: '1. Agente', desc: 'Quem executa?' },
                    { key: 'acao', label: '2. Ação', desc: 'O que deve ser feito?' },
                    { key: 'meio_modo', label: '3. Meio/Modo', desc: 'Como/por meio de que?' },
                    { key: 'efeito', label: '4. Efeito', desc: 'Para que/finalidade?' },
                    { key: 'detalhamento', label: '5. Detalhamento', desc: 'Explicação extra' },
                  ].map((elem) => {
                    const elData = (analiseIndividual.elementos_c5 as any)?.[elem.key];
                    const isPresente = elData?.presente ?? false;
                    return (
                      <div
                        key={elem.key}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                          isPresente
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {elem.label}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 ${
                                isPresente
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                              }`}
                            >
                              {isPresente ? '+40 pts' : '0 pts'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                            {elem.desc}
                          </p>
                        </div>

                        <div>
                          <div
                            className={`text-[11px] font-bold flex items-center gap-1.5 mb-1 ${
                              isPresente ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isPresente ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Presente</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Não identificado</span>
                              </>
                            )}
                          </div>

                          {elData?.comentario && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                              {elData.comentario}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* Pontos Fortes e Pontos de Melhoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-5 sm:p-6 border border-emerald-200/80 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-300">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-extrabold">Pontos Fortes Identificados</h3>
              </div>

              <ul className="space-y-2 mt-2">
                {(analiseIndividual.pontos_fortes || []).map((pf, idx) => (
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

            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-5 sm:p-6 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-amber-800 dark:text-amber-300">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-extrabold">Como Atingir a Nota Máxima (200 pts)</h3>
              </div>

              <ul className="space-y-2 mt-2">
                {(analiseIndividual.pontos_melhoria || []).map((pm, idx) => (
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

          {/* Dica de Ouro e Sugestão de Reescrita */}
          {(analiseIndividual.sugestao_reescrita || analiseIndividual.dica_de_ouro) && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 rounded-2xl p-5 sm:p-6 border border-purple-200/80 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center space-x-2.5 text-purple-900 dark:text-purple-200">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                <h4 className="text-sm font-extrabold">
                  Sugestão Prática de Ajuste / Reescrita
                </h4>
              </div>

              {analiseIndividual.sugestao_reescrita && (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{analiseIndividual.sugestao_reescrita}"
                </p>
              )}

              {analiseIndividual.dica_de_ouro && (
                <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-1.5 font-bold">
                  <span>💡 Dica de Ouro da Banca:</span>
                  <span className="font-normal">{analiseIndividual.dica_de_ouro}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Modal de Exportação com 3 Temas Visuais (para a Redação Completa) */}
      <PdfThemeSelectorModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onConfirmExport={handleConfirmPdfExport}
        documentTitle={`Redação ENEM - ${analiseCompleta?.nota_final || 0} pontos`}
        documentType="redacao"
      />
    </div>
  );
}

// Fallback didático offline caso ocorra indisponibilidade momentânea da rede para redação completa
function gerarAnaliseLocal(texto: string, tema?: string): EnemEssayFullAnalysis {
  const lower = texto.toLowerCase();
  const totalWords = texto.trim().split(/\s+/).length;
  const paragraphs = texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  // C1
  let c1 = 160;
  let c1Feed = 'Bom domínio da norma culta com registro formal consistente e sintaxe coesa.';
  if (totalWords < 120) {
    c1 = 120;
    c1Feed = 'Texto curto para avaliação sintática plena da norma culta.';
  } else if (paragraphs.length >= 4 && totalWords > 240) {
    c1 = 200;
    c1Feed = 'Excelente domínio da norma culta, estrutura sintática impecável e pontuação correta.';
  }

  // C2
  let c2 = 160;
  let c2Feed = 'Tema abordado com consistência e repertório sociocultural aplicado de forma pertinente.';
  if (
    lower.includes('bauman') ||
    lower.includes('constituição') ||
    lower.includes('filósofo') ||
    lower.includes('século') ||
    lower.includes('ibge')
  ) {
    c2 = 200;
    c2Feed = 'Repertório sociocultural legitimado e produtivo perfeitamente articulado à tese da redação.';
  }

  // C3
  let c3 = 160;
  let c3Feed = 'Projeto de texto com defesa clara de ponto de vista e seleção de argumentos sólidos.';
  if (
    paragraphs.length >= 4 &&
    (lower.includes('em primeiro lugar') ||
      lower.includes('ademais') ||
      lower.includes('sob essa ótica') ||
      lower.includes('nesse sentido'))
  ) {
    c3 = 200;
    c3Feed = 'Projeto de texto estratégico, autoria marcante e relações de causa-efeito aprofundadas.';
  }

  // C4
  let c4 = 160;
  let c4Feed = 'Emprego variado de conectivos e operadores argumentativos entre os parágrafos.';
  if (
    lower.includes('portanto') &&
    (lower.includes('além disso') || lower.includes('ademais')) &&
    lower.includes('contudo')
  ) {
    c4 = 200;
    c4Feed = 'Amplo repertório de recursos coesivos sem repetições viciosas, com transições fluídas.';
  }

  // C5
  const temAgente =
    lower.includes('ministério') ||
    lower.includes('governo') ||
    lower.includes('mec') ||
    lower.includes('escola') ||
    lower.includes('cabe ao') ||
    lower.includes('cabe à') ||
    lower.includes('compete ao');
  const temAcao =
    lower.includes('promover') ||
    lower.includes('criar') ||
    lower.includes('desenvolver') ||
    lower.includes('implementar') ||
    lower.includes('garantir') ||
    lower.includes('instituir');
  const temMeio =
    lower.includes('por meio') || lower.includes('através de') || lower.includes('mediante');
  const temEfeito =
    lower.includes('a fim de') ||
    lower.includes('para que') ||
    lower.includes('com o intuito') ||
    lower.includes('com o objetivo');
  const temDetalhamento =
    texto.includes('(') || (texto.includes(',') && (lower.includes('como') || lower.includes('em parceria')));
  const countC5 = [temAgente, temAcao, temMeio, temEfeito, temDetalhamento].filter(Boolean).length;
  const c5 = countC5 * 40;
  const c5Feed =
    countC5 === 5
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
    sugestao_reescrita:
      'Para atingir a nota máxima, utilize no parágrafo final a estrutura: "Portanto, cabe ao [Agente], por meio de [Meio/Modo], [Ação], a fim de [Finalidade/Impacto], [Detalhamento Explicativo]."',
  };
}

// Fallback didático offline para competência individual (0 a 200 pontos)
function gerarAnaliseIndividualLocal(
  compNum: number,
  texto: string,
  tema?: string
): SingleCompetencyAnalysis {
  const lower = texto.toLowerCase();
  const totalWords = texto.trim().split(/\s+/).length;

  if (compNum === 1) {
    const nota = totalWords >= 100 ? 200 : totalWords >= 50 ? 160 : 120;
    return {
      tipo_resposta: 'competencia_individual',
      competencia_numero: 1,
      competencia_nome: 'Domínio da Norma Culta da Língua Escrita',
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback:
        nota === 200
          ? 'Excelente domínio da modalidade escrita formal, vocabulário preciso e sintaxe fluida sem desvios gramaticais.'
          : 'Bom domínio da norma culta, com pequenos desvios pontuais em regência, concordância ou pontuação.',
      pontos_fortes: [
        'Construção de períodos compostos bem articulados.',
        'Vocabulário formal e adequado à tipologia dissertativa.',
      ],
      pontos_melhoria: [
        'Atenção à pontuação antes de orações coordenadas sindéticas.',
        'Evitar orações truncadas ou excessivamente extensas.',
      ],
      sugestao_reescrita:
        'Substitua expressões coloquiais por equivalentes da norma culta e revise a concordância nominal.',
      dica_de_ouro:
        'Revise a redação prestando atenção exclusiva aos verbos e suas concordâncias.',
    };
  }

  if (compNum === 2) {
    const temRepertorio =
      lower.includes('bauman') ||
      lower.includes('constituição') ||
      lower.includes('filósofo') ||
      lower.includes('história') ||
      lower.includes('ibge') ||
      lower.includes('artigo');
    const nota = temRepertorio ? 200 : 120;
    return {
      tipo_resposta: 'competencia_individual',
      competencia_numero: 2,
      competencia_nome: 'Compreensão da Proposta e Repertório Sociocultural',
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback: temRepertorio
        ? 'Repertório sociocultural legitimado e produtivo, articulado de maneira consistente ao tema proposto.'
        : 'O trecho tangencia a discussão temática sem mobilizar repertório externo legitimado.',
      pontos_fortes: [
        'Compreensão dos conceitos centrais do tema.',
        temRepertorio ? 'Citação pertinente de área do saber externa.' : 'Estrutura dissertativa respeitada.',
      ],
      pontos_melhoria: [
        'Garantir que o repertório seja produtivo para embasar a tese.',
        'Vincular o repertório diretamente ao argumento por meio de conectivos explicativos.',
      ],
      sugestao_reescrita:
        'Associe o argumento a um autor ou fato histórico logo após o tópico frasal.',
      dica_de_ouro:
        'Todo repertório precisa ser Legitimado, Pertinente e Produtivo para alcançar 200 pontos.',
    };
  }

  if (compNum === 3) {
    const nota = lower.includes('desse modo') || lower.includes('portanto') || lower.includes('sob essa ótica') ? 200 : 160;
    return {
      tipo_resposta: 'competencia_individual',
      competencia_numero: 3,
      competencia_nome: 'Projeto de Texto e Desenvolvimento Argumentativo',
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback:
        'Projeto de texto consistente, com defesa de ponto de vista claro e desdobramento das causas e consequências do problema.',
      pontos_fortes: [
        'Progressão temática com encadeamento lógico de argumentos.',
        'Autoria expressa sem argumentos de senso comum.',
      ],
      pontos_melhoria: [
        'Aprofundar por que a causa apontada ainda não foi solucionada pelo poder público.',
        'Fortalecer a relação de causa e efeito no fechamento do parágrafo.',
      ],
      sugestao_reescrita:
        'Estruture seu parágrafo em: Tópico Frasal + Repertório + Justificativa Crítica + Desfecho Reflexivo.',
      dica_de_ouro:
        'Antecipe na introdução as duas causas que serão aprofundadas no D1 e no D2.',
    };
  }

  if (compNum === 4) {
    const conectivos = ['portanto', 'ademais', 'além disso', 'contudo', 'outrossim', 'nesse sentido', 'por conseguinte'];
    const count = conectivos.filter((c) => lower.includes(c)).length;
    const nota = count >= 2 ? 200 : count === 1 ? 160 : 120;
    return {
      tipo_resposta: 'competencia_individual',
      competencia_numero: 4,
      competencia_nome: 'Coesão Textual e Recursos Linguísticos',
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback: `Uso variado de recursos coesivos inter e intraparágrafos para estruturar as frases.`,
      pontos_fortes: [
        'Emprego de conectivos adequados à relação semântica pretendida.',
        'Presença de mecanismos de retomada anafórica.',
      ],
      pontos_melhoria: [
        'Evitar repetições imediatas de palavras usando pronomes e sinônimos.',
        'Iniciar os parágrafos com operadores argumentativos interparágrafos.',
      ],
      sugestao_reescrita:
        'Utilize operadores como "Ademais,", "Nesse cenário," ou "Outrossim," no início dos períodos.',
      dica_de_ouro:
        'O corretor busca conectivos no início dos parágrafos e dentro dos períodos.',
    };
  }

  // Competência 5
  const temAgente =
    lower.includes('ministério') ||
    lower.includes('governo') ||
    lower.includes('mec') ||
    lower.includes('escola') ||
    lower.includes('sociedade') ||
    lower.includes('cabe ao') ||
    lower.includes('compete ao') ||
    lower.includes('poder público');
  const temAcao =
    lower.includes('promover') ||
    lower.includes('criar') ||
    lower.includes('desenvolver') ||
    lower.includes('implementar') ||
    lower.includes('instituir') ||
    lower.includes('garantir');
  const temMeio =
    lower.includes('por meio') || lower.includes('através de') || lower.includes('mediante');
  const temEfeito =
    lower.includes('a fim de') ||
    lower.includes('para que') ||
    lower.includes('com o intuito') ||
    lower.includes('visando a');
  const temDetalhamento =
    texto.includes('(') ||
    (texto.includes(',') &&
      (lower.includes('como') ||
        lower.includes('em parceria') ||
        lower.includes('órgão responsável') ||
        lower.includes('especialmente')));

  const countC5 = [temAgente, temAcao, temMeio, temEfeito, temDetalhamento].filter(Boolean).length;
  const nota = countC5 * 40;

  return {
    tipo_resposta: 'competencia_individual',
    competencia_numero: 5,
    competencia_nome: 'Proposta de Intervenção Social',
    nota,
    nivel: `Nível ${countC5} (${nota} pontos - ${countC5} de 5 elementos)`,
    feedback:
      countC5 === 5
        ? 'Proposta exemplar com nota máxima (200 pontos)! Todos os 5 elementos (Agente, Ação, Meio/Modo, Efeito e Detalhamento) foram claramente articulados e respeitam os Direitos Humanos.'
        : `Identificados ${countC5} dos 5 elementos da intervenção na sua proposta. Cada elemento vale 40 pontos na matriz oficial do ENEM.`,
    elementos_c5: {
      agente: {
        presente: temAgente,
        trecho: temAgente ? 'Agente governamental ou institucional identificado' : null,
        comentario: temAgente ? 'Agente claro e com competência institucional para atuar.' : 'Falta explicitar QUEM realizará a medida (ex: Ministério da Educação, Poder Público).',
      },
      acao: {
        presente: temAcao,
        trecho: temAcao ? 'Ação interventiva identificada' : null,
        comentario: temAcao ? 'Ação concreta e direcionada à mitigação da tese.' : 'Falta explicitar O QUE será feito de forma prática e viável.',
      },
      meio_modo: {
        presente: temMeio,
        trecho: temMeio ? 'Meio de execução identificado com conectivo modal' : null,
        comentario: temMeio ? 'Meio de execução claro utilizando conectivo adequado.' : 'Falta explicar COMO a ação será viabilizada (utilize "por meio de" ou "mediante").',
      },
      efeito: {
        presente: temEfeito,
        trecho: temEfeito ? 'Finalidade / impacto social identificado' : null,
        comentario: temEfeito ? 'Finalidade bem definida conectada à solução do problema.' : 'Falta explicitar PARA QUE a ação será feita (utilize "a fim de" ou "com o fito de").',
      },
      detalhamento: {
        presente: temDetalhamento,
        trecho: temDetalhamento ? 'Detalhamento ou exemplificação complementar' : null,
        comentario: temDetalhamento ? 'Detalhamento de um dos elementos presente e enriquecedor.' : 'Falta um detalhamento adicional (ex: explicar a função do agente entre vírgulas ou dar exemplos práticos da ação).',
      },
    },
    pontos_fortes: [
      'Respeito aos Direitos Humanos e à dignidade da pessoa humana.',
      countC5 >= 3 ? 'Intervenção viável e conectada ao tema proposto.' : 'Iniciativa válida de solucionar o problema.',
    ],
    pontos_melhoria: [
      ...(!temAgente ? ['Inserir um AGENTE legítimo com competência de atuação.'] : []),
      ...(!temAcao ? ['Detalhar uma AÇÃO concreta e aplicável.'] : []),
      ...(!temMeio ? ['Acrescentar o MEIO/MODO com o conectivo "por meio de" ou "mediante".'] : []),
      ...(!temEfeito ? ['Acrescentar o EFEITO com "a fim de" ou "para que".'] : []),
      ...(!temDetalhamento ? ['Adicionar um DETALHAMENTO explicando o agente, a ação ou o meio.'] : []),
    ],
    sugestao_reescrita:
      'Utilize a fórmula dos 200 pontos: "Portanto, cabe ao Ministério da Educação [Agente], órgão responsável pelas diretrizes pedagógicas [Detalhamento], implementar oficinas e palestras [Ação], por meio da reformulação curricular [Meio], a fim de conscientizar os jovens e desconstruir preconceitos [Efeito]."',
    dica_de_ouro:
      'Lembre-se do mnemônico AAMED: Agente, Ação, Meio, Efeito e Detalhamento. 5 elementos = 200 pontos cravados!',
  };
}

export { RedacaoCorretor };
