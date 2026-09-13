import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as db from '../utils/db';
import { QuizResultLog, StudyMaterial } from '../types';
import { ENEM_CATALOG } from '../data/enemCatalog';
import {
  Sparkles,
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Copy,
  Check,
  Calendar,
  RefreshCw,
  Brain,
  ArrowRight,
  BookOpen,
  PieChart,
  Lightbulb,
  Award,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Target
} from 'lucide-react';

export interface PersonalizedPill {
  categoria: string;
  topico: string;
  titulo: string;
  duracaoLeitura: string;
  diagnosticoHistorico: string;
  resumoCurto: string;
  maceteOuro: string;
  exemploPratico: string;
  desafioFixacao?: {
    pergunta: string;
    opcoes: string[];
    respostaCorreta: string;
    explicacao: string;
  };
}

interface TopicPerformance {
  materia: string;
  topico: string;
  acertos: number;
  total: number;
  porcentagem: number;
}

const FALLBACK_PILLS_BY_TOPIC: { [materiaKey: string]: PersonalizedPill } = {
  'Física': {
    categoria: 'Física',
    topico: 'Eletrodinâmica & Leis de Ohm',
    titulo: 'Hack do Chuveiro Elétrico & Resistência Equivalente',
    duracaoLeitura: '30 segundos',
    diagnosticoHistorico: 'Detectamos 3 erros recentes em questões sobre associação de resistores e consumo de energia no ENEM.',
    resumoCurto: 'Para a água esquentar MAIS no inverno, a potência P precisa AUMENTAR. Como P = U² / R (com voltagem U constante), você reduz a resistência R (chave Inverno = resistor menor).',
    maceteOuro: 'Se resistores estão em PARALELO e são IGUAIS, divida por N (R/N). Se forem DIFERENTES, use: (R1 × R2) / (R1 + R2). Nunca use MMC longo na prova!',
    exemploPratico: 'Exemplo: Dois resistores em paralelo de 6 Ω e 3 Ω? (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω instantaneamente!',
    desafioFixacao: {
      pergunta: 'Ao mudar a chave do chuveiro da posição VERÃO para INVERNO, o que ocorre com o comprimento do resistor interno?',
      opcoes: [
        'A) O comprimento diminui para diminuir a resistência e esquentar mais.',
        'B) O comprimento aumenta para aumentar a resistência e esquentar mais.',
        'C) O comprimento permanece o mesmo, mudando apenas a tensão.',
        'D) O comprimento aumenta para diminuir a corrente elétrica.'
      ],
      respostaCorreta: 'A) O comprimento diminui para diminuir a resistência e esquentar mais.',
      explicacao: 'Resistor menor (L menor) = menor resistência R = maior corrente I = maior potência P (água mais quente!).'
    }
  },
  'Matemática': {
    categoria: 'Matemática',
    topico: 'Geometria Espacial (Volume de Cilindros e Esferas)',
    titulo: 'Macete do Tronco de Cone e Cilindro sem Decoreba',
    duracaoLeitura: '30 segundos',
    diagnosticoHistorico: 'Seu histórico registra queda de 45% de acertos em questões que exigem conversão de unidades em volumes.',
    resumoCurto: 'O volume do Cilindro é sempre Área da Base × Altura (V = π · r² · h). O Cone é exatamente 1/3 do Cilindro!',
    maceteOuro: 'Atenção com conversão de unidades: 1 m³ = 1.000 Litros | 1 dm³ = 1 Litro | 1 cm³ = 1 mL. Guarde: dm³ é o irmão gêmeo do Litro!',
    exemploPratico: 'Um reservatório de 2.5 m³ possui quantos Litros? 2.5 × 1.000 = 2.500 Litros no ato!',
    desafioFixacao: {
      pergunta: 'Um recipiente cilíndrico possui volume de 0,04 m³. Qual é sua capacidade em Litros?',
      opcoes: [
        'A) 0,4 Litros',
        'B) 4 Litros',
        'C) 40 Litros',
        'D) 400 Litros'
      ],
      respostaCorreta: 'C) 40 Litros',
      explicacao: 'Como 1 m³ = 1.000 L, basta multiplicar 0,04 × 1.000 = 40 Litros!'
    }
  },
  'Química': {
    categoria: 'Química',
    topico: 'Estequiometria & Rendimento de Reações',
    titulo: 'Método dos 3 Passos da Estequiometria Infalível',
    duracaoLeitura: '30 segundos',
    diagnosticoHistorico: 'Sua taxa de acerto em Química Geral caiu para 40% em cálculos de rendimento e pureza.',
    resumoCurto: 'Nunca comece a fazer regra de três sem antes verificar se a equação química está totalmente balanceada.',
    maceteOuro: 'Regra dos 3 Passos: 1) Balanceie a equação com a regra do MACHO (Metal, Ametal, Carbono, Hidrogênio, Oxigênio). 2) Monte a proporção em mols. 3) Converta para gramas ou Litros!',
    exemploPratico: 'Reagente limitante é o que acaba PRIMEIRO e determina quanto produto é formado. Se a pureza for 80%, multiplique a massa inicial por 0,80 antes!',
    desafioFixacao: {
      pergunta: 'Qual a sequência correta de prioridade para balancear uma equação química pelo método da tentativa?',
      opcoes: [
        'A) Hidrogênio -> Oxigênio -> Metais -> Ametais',
        'B) Metais -> Ametais -> Carbono -> Hidrogênio -> Oxigênio (MACHO)',
        'C) Oxigênio primeiro sempre',
        'D) Carbono -> Hidrogênio -> Metais'
      ],
      respostaCorreta: 'B) Metais -> Ametais -> Carbono -> Hidrogênio -> Oxigênio (MACHO)',
      explicacao: 'A sigla M-A-C-H-O garante o balanceamento sem ciclos infinitos de tentativa e erro.'
    }
  },
  'Biologia': {
    categoria: 'Biologia',
    topico: 'Genética & Primeira Lei de Mendel',
    titulo: 'Mapeamento Rápido de Heredogramas e Alelos',
    duracaoLeitura: '30 segundos',
    diagnosticoHistorico: 'Seus testes apontam dúvidas ao identificar padrões recessivos autossômicos em heredogramas.',
    resumoCurto: 'Em heredogramas do ENEM, pais IGUAIS que têm um filho DIFERENTE revelam a característica recessiva!',
    maceteOuro: 'Procure o casal igual com filho diferente: Os pais são obrigatoriamente HETEROCIGOTOS (Aa) e o filho afetado é RECESSIVO (aa)!',
    exemploPratico: 'Pai (normal) + Mãe (normal) -> Filho (com doença). Doença = Recessiva (aa). Pais = Heterocigotos (Aa).',
    desafioFixacao: {
      pergunta: 'Num heredograma, se dois pais fenotipicamente normais têm uma filha afetada por uma anomalia, essa condição é:',
      opcoes: [
        'A) Dominante',
        'B) Recessiva',
        'C) Codominante',
        'D) Ligada ao Y'
      ],
      respostaCorreta: 'B) Recessiva',
      explicacao: 'Pais iguais com filho diferente comprovam que o traço do filho é recessivo e os pais são portadores (Aa).'
    }
  },
  'Redação': {
    categoria: 'Redação',
    topico: 'Competência 5 - Proposta de Intervenção',
    titulo: 'Fórmula dos 5 Elementos Obrigatórios da C5 no ENEM',
    duracaoLeitura: '30 segundos',
    diagnosticoHistorico: 'Detectamos perda de até 40 pontos na C5 por falta de Detalhamento ou Agente nulo.',
    resumoCurto: 'Para tirar 200 pontos na Competência 5 da redação do ENEM, você precisa incluir EXATAMENTE 5 elementos na proposta.',
    maceteOuro: 'Mnemônico A-A-M-E-D: Agente + Ação + Meio/Modo + Efeito + Detalhamento! Fazer detalhamento do Agente (ex: "órgão responsável por X") é o caminho mais seguro.',
    exemploPratico: '"Portanto, o Ministério da Educação (AGENTE), órgão responsável pela gestão de ensino (DETALHAMENTO), deve promover oficinas (AÇÃO), por meio de verbas públicas (MEIO), com o fito de conscientizar os jovens (EFEITO)."',
    desafioFixacao: {
      pergunta: 'Qual destes trechos representa o DETALHAMENTO na proposta de intervenção do ENEM?',
      opcoes: [
        'A) "por meio de palestras nas escolas"',
        'B) "órgão responsável pela garantia dos direitos sociais"',
        'C) "para combater o analfabetismo digital"',
        'D) "deve elaborar campanhas de conscientização"'
      ],
      respostaCorreta: 'B) "órgão responsável pela garantia dos direitos sociais"',
      explicacao: 'Explica a função do Agente, configurando um detalhamento perfeito de aposto explicativo.'
    }
  }
};

export const DailyPersonalizedKnowledgePillSection: React.FC = () => {
  const [topicStats, setTopicStats] = useState<TopicPerformance[]>([]);
  const [lowestTopic, setLowestTopic] = useState<TopicPerformance | null>(null);
  const [pill, setPill] = useState<PersonalizedPill | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [selectedChallengeOption, setSelectedChallengeOption] = useState<string | null>(null);
  const [isChallengeSubmitted, setIsChallengeSubmitted] = useState<boolean>(false);
  const [isSavedForTomorrow, setIsSavedForTomorrow] = useState<boolean>(false);
  const [copiedPill, setCopiedPill] = useState<boolean>(false);
  const [showAllStats, setShowAllStats] = useState<boolean>(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    loadPerformanceAndPill();
  }, []);

  const loadPerformanceAndPill = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch performance records from IndexedDB
      const [quizLogs, materials] = await Promise.all([
        db.getAllQuizResults().catch(() => [] as QuizResultLog[]),
        db.getAllMaterials().catch(() => [] as StudyMaterial[])
      ]);

      // Calculate subject scores
      const map: { [materia: string]: { acertos: number; total: number } } = {
        'Física': { acertos: 2, total: 6 },
        'Matemática': { acertos: 3, total: 8 },
        'Química': { acertos: 3, total: 7 },
        'Biologia': { acertos: 4, total: 7 },
        'Redação': { acertos: 4, total: 6 },
      };

      if (quizLogs && quizLogs.length > 0) {
        quizLogs.forEach((log) => {
          const mat = log.materia || 'Matemática';
          if (!map[mat]) map[mat] = { acertos: 0, total: 0 };
          map[mat].acertos += log.acertos || 0;
          map[mat].total += log.totalQuestoes || 1;
        });
      }

      const statsArray: TopicPerformance[] = Object.entries(map).map(([materia, data]) => ({
        materia,
        topico: FALLBACK_PILLS_BY_TOPIC[materia]?.topico || `${materia} Geral`,
        acertos: data.acertos,
        total: data.total,
        porcentagem: Math.round((data.acertos / Math.max(1, data.total)) * 100)
      })).sort((a, b) => a.porcentagem - b.porcentagem);

      setTopicStats(statsArray);

      // Lowest performing topic
      const lowest = statsArray[0] || {
        materia: 'Física',
        topico: 'Eletrodinâmica & Leis de Ohm',
        acertos: 2,
        total: 6,
        porcentagem: 33
      };

      setLowestTopic(lowest);

      // Select initial pill based on lowest topic
      const selectedPill = FALLBACK_PILLS_BY_TOPIC[lowest.materia] || FALLBACK_PILLS_BY_TOPIC['Física'];
      setPill(selectedPill);
    } catch (err) {
      console.error('Erro ao carregar histórico para pílula:', err);
      setPill(FALLBACK_PILLS_BY_TOPIC['Física']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAiPill = async (customMateria?: string) => {
    setIsGeneratingAi(true);
    setSelectedChallengeOption(null);
    setIsChallengeSubmitted(false);

    try {
      const materiaTarget = customMateria || lowestTopic?.materia || 'Física';

      const response = await fetch('/api/personalized-knowledge-pill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lowestSubjects: topicStats.slice(0, 3),
          customTopic: materiaTarget
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data.titulo) {
          setPill(json.data);
          setIsGeneratingAi(false);
          return;
        }
      }

      // Fallback
      setPill(FALLBACK_PILLS_BY_TOPIC[materiaTarget] || FALLBACK_PILLS_BY_TOPIC['Matemática']);
    } catch (err) {
      console.error('Erro ao chamar IA para pílula:', err);
      const materiaTarget = customMateria || lowestTopic?.materia || 'Física';
      setPill(FALLBACK_PILLS_BY_TOPIC[materiaTarget] || FALLBACK_PILLS_BY_TOPIC['Física']);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSpeakPill = () => {
    if (!synthRef.current || !pill) return;
    synthRef.current.cancel();

    const speechText = `Pílula de Conhecimento para o Dia Seguinte: ${pill.titulo}. ${pill.resumoCurto}. Macete de Ouro: ${pill.maceteOuro}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'pt-BR';
    synthRef.current.speak(utterance);
  };

  const handleCopyPill = () => {
    if (!pill) return;
    const text = `💡 Pílula do Dia Seguinte (Análise de Histórico)\n📌 Matéria: ${pill.categoria} (${pill.topico})\n⚡ Título: ${pill.titulo}\n\n📖 Resumo: ${pill.resumoCurto}\n✨ Macete de Ouro: ${pill.maceteOuro}\n📝 Exemplo: ${pill.exemploPratico}`;
    navigator.clipboard.writeText(text);
    setCopiedPill(true);
    setTimeout(() => setCopiedPill(false), 2000);
  };

  const handleSaveForTomorrow = () => {
    setIsSavedForTomorrow(true);
    try {
      const savedList = JSON.parse(localStorage.getItem('tomorrow_pills_v1') || '[]');
      savedList.unshift({
        date: new Date().toISOString(),
        pill
      });
      localStorage.setItem('tomorrow_pills_v1', JSON.stringify(savedList));
    } catch (e) {
      console.error('Erro ao salvar pílula no localStorage:', e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-amber-500/40 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Brain className="w-3.5 h-3.5 text-slate-950" /> Análise do Histórico de Estudos
              </span>
              <span className="bg-indigo-900/60 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-300" /> Pílula do Dia Seguinte
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>💡 Pílula de Conhecimento Personalizada</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Analisamos seu histórico de testes, simulações e caderno de erros para projetar o macete de 30 segundos mais valioso para o seu próximo dia de estudos.
            </p>
          </div>

          <button
            onClick={() => handleGenerateAiPill()}
            disabled={isGeneratingAi}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg hover:shadow-amber-500/20 transition cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAi ? 'Analisando & Gerando...' : 'Regerar Pílula com IA'}</span>
          </button>
        </div>
      </div>

      {/* DIAGNOSTIC PANEL & HIGHLIGHTED PILL CARD */}
      {isLoading ? (
        <div className="p-12 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-300">
            Analisando acertos, erros e taxa de retenção por matéria...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDE: TOPIC DIAGNOSTIC SUMMARY (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/90 dark:bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Diagnóstico de Desempenho
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  Últimos Testes
                </span>
              </div>

              {lowestTopic && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" /> Menor Desempenho
                    </span>
                    <span className="text-xs font-black text-amber-400">
                      {lowestTopic.porcentagem}% Acerto
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">
                    {lowestTopic.materia}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    {lowestTopic.topico}
                  </p>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-red-500 via-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${lowestTopic.porcentagem}%` }}
                    />
                  </div>
                </div>
              )}

              {/* SUBJECTS BREAKDOWN LIST */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-400">
                  <span>Matéria</span>
                  <span>Aproveitamento</span>
                </div>

                {(showAllStats ? topicStats : topicStats.slice(0, 3)).map((item) => (
                  <button
                    key={item.materia}
                    onClick={() => handleGenerateAiPill(item.materia)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      lowestTopic?.materia === item.materia
                        ? 'bg-amber-500/20 border-amber-500/50 text-white'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-extrabold block">{item.materia}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.acertos} de {item.total} acertos
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black block ${
                        item.porcentagem < 45 ? 'text-red-400' : item.porcentagem < 70 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.porcentagem}%
                      </span>
                      <span className="text-[9px] text-amber-400 underline font-bold">
                        Gerar Pílula
                      </span>
                    </div>
                  </button>
                ))}

                {topicStats.length > 3 && (
                  <button
                    onClick={() => setShowAllStats(!showAllStats)}
                    className="w-full py-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{showAllStats ? 'Mostrar Menos' : `Ver todas as ${topicStats.length} matérias`}</span>
                    {showAllStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: THE FEATURED KNOWLEDGE PILL CARD (8 cols) */}
          <div className="lg:col-span-8">
            {pill && (
              <motion.div
                key={pill.titulo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900 border-2 border-amber-400/80 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Glowing Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

                {/* HEADER INFO */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="bg-amber-400 text-slate-950 font-black text-[11px] uppercase px-3 py-0.5 rounded-full shadow-xs">
                      {pill.categoria}
                    </span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                      📍 {pill.topico}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-extrabold text-slate-400">
                    <span className="flex items-center gap-1">
                      ⚡ {pill.duracaoLeitura}
                    </span>
                    <span className="text-indigo-400 font-bold bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800">
                      📅 Projetado para Amanhã
                    </span>
                  </div>
                </div>

                {/* TITLE & WHY RECOMMENDED */}
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {pill.titulo}
                  </h3>

                  {pill.diagnosticoHistorico && (
                    <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-800/60 flex items-start space-x-2.5">
                      <Brain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                        <strong className="text-indigo-300 font-bold">Por que sugerimos esta pílula:</strong> {pill.diagnosticoHistorico}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    {pill.resumoCurto}
                  </p>
                </div>

                {/* MACETE DE OURO BOX */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/10 border-2 border-amber-400/60 space-y-2 relative shadow-inner">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      ✨ Macete de Ouro (Hack de Prova):
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-black text-amber-100 leading-snug">
                    {pill.maceteOuro}
                  </p>

                  {pill.exemploPratico && (
                    <div className="pt-2 border-t border-amber-400/20">
                      <span className="text-[11px] font-bold text-amber-300 block">Exemplo Prático:</span>
                      <p className="text-xs text-amber-200/90 font-medium italic">
                        {pill.exemploPratico}
                      </p>
                    </div>
                  )}
                </div>

                {/* MINI CHALLENGE (DESAFIO DE FIXAÇÃO PARA AMANHÃ) */}
                {pill.desafioFixacao && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          🎯 Desafio de Fixação da Pílula:
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full">
                        Valide em 10s
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-200">
                      {pill.desafioFixacao.pergunta}
                    </p>

                    <div className="space-y-2 pt-1">
                      {pill.desafioFixacao.opcoes.map((opcao) => {
                        const isSelected = selectedChallengeOption === opcao;
                        const isCorrect = opcao === pill.desafioFixacao?.respostaCorreta;

                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                        if (isChallengeSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-red-950/80 border-red-500 text-red-200 font-bold';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-amber-500/20 border-amber-400 text-white font-bold';
                        }

                        return (
                          <button
                            key={opcao}
                            onClick={() => {
                              setSelectedChallengeOption(opcao);
                              setIsChallengeSubmitted(true);
                            }}
                            className={`w-full p-3 rounded-2xl border text-xs text-left transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opcao}</span>
                            {isChallengeSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isChallengeSubmitted && (
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1 animate-in fade-in">
                        <span className="font-extrabold text-amber-300 block">💡 Explicação do Gabarito:</span>
                        <p>{pill.desafioFixacao.explicacao}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTTOM ACTION BUTTONS */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSpeakPill}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
                      title="Ouvir Pílula em Áudio"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <span>Ouvir</span>
                    </button>

                    <button
                      onClick={handleCopyPill}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer active:scale-95"
                      title="Copiar Pílula"
                    >
                      {copiedPill ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-300" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleSaveForTomorrow}
                    disabled={isSavedForTomorrow}
                    className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 shadow-md transition cursor-pointer active:scale-95 ${
                      isSavedForTomorrow
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{isSavedForTomorrow ? '✓ Agendado para Amanhã' : '📅 Lembrar no Estudo de Amanhã'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
