import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Award,
  RotateCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Layers,
  BarChart3,
  BookOpen,
  Shuffle,
  Eye,
  ListOrdered
} from 'lucide-react';
import {
  BANCO_SIMULADOS_ENEM,
  getSimuladoQuestionsByFilter,
  SimuladoQuestion
} from '../data/simuladoQuestions';

interface ProvaDef {
  id: string;
  titulo: string;
  descricao: string;
  areaFiltro?: string;
  tempoMinutosPadrao: number;
  badge: string;
  corBorder: string;
  badgeBg: string;
  disciplinas: string;
}

const PROVAS_CATALOGO: ProvaDef[] = [
  {
    id: 'simulado-tri-oficial',
    titulo: 'Simulado TRI Oficial Completo',
    descricao: 'Simulado balanceado contemplando as 4 grandes áreas do ENEM com calibragem paramétrica TRI.',
    areaFiltro: 'Geral',
    tempoMinutosPadrao: 60,
    badge: 'Oficial INEP',
    corBorder: 'border-amber-500/60',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    disciplinas: 'Linguagens, Ciências Humanas, Ciências da Natureza e Matemática',
  },
  {
    id: 'enem-dia1',
    titulo: 'ENEM - 1º Dia (Linguagens & Humanas)',
    descricao: 'Simulação especializada em Interpretação, Língua Portuguesa, Literatura, História, Geografia e Filosofia.',
    areaFiltro: 'dia 1',
    tempoMinutosPadrao: 45,
    badge: 'Dia 1',
    corBorder: 'border-indigo-500/50',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    disciplinas: 'Linguagens, Códigos, Literatura & Ciências Humanas',
  },
  {
    id: 'enem-dia2',
    titulo: 'ENEM - 2º Dia (Natureza & Matemática)',
    descricao: 'Resolução intensiva de Matemática, Física, Química e Biologia aplicada com raciocínio lógico.',
    areaFiltro: 'dia 2',
    tempoMinutosPadrao: 45,
    badge: 'Dia 2',
    corBorder: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    disciplinas: 'Matemática, Física, Química e Biologia',
  },
  {
    id: 'simulado-expresso',
    titulo: 'Simulado Expresso Diário (Lote Rápido)',
    descricao: 'Treino ágil de 5 a 10 questões interdisciplinares para manter o ritmo de prova nos intervalos de estudo.',
    areaFiltro: 'Geral',
    tempoMinutosPadrao: 15,
    badge: 'Treino Rápido',
    corBorder: 'border-cyan-500/50',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    disciplinas: 'Questões sortidas das 4 áreas do exame',
  },
];

export default function Simulados() {
  // Configuração da prova selecionada
  const [provaAtiva, setProvaAtiva] = useState<ProvaDef | null>(null);
  const [questoesAtuais, setQuestoesAtuais] = useState<SimuladoQuestion[]>([]);
  const [tamanhoLote, setTamanhoLote] = useState<number>(10);
  const [tempoRestanteSegundos, setTempoRestanteSegundos] = useState<number>(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [marcadasRevisao, setMarcadasRevisao] = useState<Record<number, boolean>>({});
  const [indiceAtual, setIndiceAtual] = useState<number>(0);
  const [modoVisualizacao, setModoVisualizacao] = useState<'individual' | 'lista'>('individual');
  const [finalizado, setFinalizado] = useState(false);

  // Filtro na tela inicial
  const [filtroArea, setFiltroArea] = useState<string>('Todas');

  // Estatísticas do Banco de Questões
  const estatisticasBanco = useMemo(() => {
    const total = BANCO_SIMULADOS_ENEM.length;
    const ling = BANCO_SIMULADOS_ENEM.filter((q) => q.area === 'Linguagens').length;
    const hum = BANCO_SIMULADOS_ENEM.filter((q) => q.area === 'Ciências Humanas').length;
    const nat = BANCO_SIMULADOS_ENEM.filter((q) => q.area === 'Ciências da Natureza').length;
    const mat = BANCO_SIMULADOS_ENEM.filter((q) => q.area === 'Matemática').length;
    return { total, ling, hum, nat, mat };
  }, []);

  // Timer do Simulado
  useEffect(() => {
    if (!provaAtiva || finalizado) return;

    const timer = setInterval(() => {
      setTempoRestanteSegundos((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinalizado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [provaAtiva, finalizado]);

  // Iniciar Prova com Lote Amplo e Variado
  const iniciarProva = (prova: ProvaDef, novoLote?: number) => {
    const batchSize = novoLote || tamanhoLote;
    const questions = getSimuladoQuestionsByFilter(
      filtroArea !== 'Todas' ? filtroArea : prova.areaFiltro,
      batchSize,
      true
    );

    setProvaAtiva(prova);
    setQuestoesAtuais(questions);
    setTempoRestanteSegundos(Math.min(prova.tempoMinutosPadrao, Math.max(5, batchSize * 3)) * 60);
    setRespostas({});
    setMarcadasRevisao({});
    setIndiceAtual(0);
    setFinalizado(false);
  };

  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cálculo TRI com Distribuição por Área e Coerência Pedagógica
  const calcularResultado = () => {
    let acertosTotal = 0;
    let faceisAcertos = 0;
    let faceisTotal = 0;
    let mediasAcertos = 0;
    let mediasTotal = 0;
    let dificeisAcertos = 0;
    let dificeisTotal = 0;

    const acertosPorArea: Record<string, { acertos: number; total: number }> = {
      'Linguagens': { acertos: 0, total: 0 },
      'Ciências Humanas': { acertos: 0, total: 0 },
      'Ciências da Natureza': { acertos: 0, total: 0 },
      'Matemática': { acertos: 0, total: 0 },
    };

    questoesAtuais.forEach((q, i) => {
      const areaKey = q.area;
      if (!acertosPorArea[areaKey]) {
        acertosPorArea[areaKey] = { acertos: 0, total: 0 };
      }
      acertosPorArea[areaKey].total++;

      if (q.dificuldade === 'Fácil') faceisTotal++;
      if (q.dificuldade === 'Média') mediasTotal++;
      if (q.dificuldade === 'Difícil') dificeisTotal++;

      if (respostas[i] === q.correta) {
        acertosTotal++;
        acertosPorArea[areaKey].acertos++;
        if (q.dificuldade === 'Fácil') faceisAcertos++;
        if (q.dificuldade === 'Média') mediasAcertos++;
        if (q.dificuldade === 'Difícil') dificeisAcertos++;
      }
    });

    const taxaAcertoGeral = questoesAtuais.length > 0 ? acertosTotal / questoesAtuais.length : 0;

    // Cálculo da nota TRI estimada calibrada (300 a 1000)
    let notaBase = 350 + (taxaAcertoGeral * 500);

    let coerencia = 'Padrão Consistente';
    if (dificeisAcertos > 0 && faceisAcertos === 0 && faceisTotal > 0) {
      coerencia = 'Baixa Coerência (Acertos esporádicos em difíceis sem base em fáceis)';
      notaBase -= 45;
    } else if (faceisAcertos === faceisTotal && faceisTotal > 0) {
      coerencia = 'Excelente Coerência Pedagógica (Domínio da base consolidado)';
      notaBase += 35;
    } else if (taxaAcertoGeral > 0.7) {
      coerencia = 'Alta Proficiência TRI';
      notaBase += 40;
    }

    const notaFinal = Math.min(985, Math.max(320, Math.round(notaBase)));

    return {
      acertosTotal,
      total: questoesAtuais.length,
      notaEstimada: notaFinal,
      coerencia,
      acertosPorArea,
      faceis: { acertos: faceisAcertos, total: faceisTotal },
      medias: { acertos: mediasAcertos, total: mediasTotal },
      dificeis: { acertos: dificeisAcertos, total: dificeisTotal },
    };
  };

  const getAreaBadgeColor = (area: string) => {
    switch (area) {
      case 'Linguagens':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Ciências Humanas':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Ciências da Natureza':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Matemática':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // ==========================================
  // TELA DE EXECUÇÃO DO SIMULADO
  // ==========================================
  if (provaAtiva && questoesAtuais.length > 0) {
    const resultado = finalizado ? calcularResultado() : null;
    const totalRespondidas = Object.keys(respostas).length;
    const questaoAtual = questoesAtuais[indiceAtual] || questoesAtuais[0];

    return (
      <div id="simulado-execucao-container" className="p-3 sm:p-4 bg-slate-950 text-white min-h-screen pb-32 max-w-4xl mx-auto">
        {/* BARRA SUPERIOR STICKY */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 mb-4 shadow-xl sticky top-2 z-30">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => {
                if (finalizado || confirm('Deseja realmente sair do simulado? Seu progresso atual será encerrado.')) {
                  setProvaAtiva(null);
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Encerrar</span>
            </button>

            <div className="text-center truncate px-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{provaAtiva.titulo}</h3>
              <span className="text-[10px] text-amber-400 font-mono">
                {totalRespondidas}/{questoesAtuais.length} respondidas
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/50 px-3 py-1.5 rounded-xl text-amber-400 font-mono text-xs font-bold shadow-inner">
              <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{formatarTempo(tempoRestanteSegundos)}</span>
            </div>
          </div>

          {/* MAPA FLUIDO DE NAVEGAÇÃO POR QUESTÕES */}
          <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {questoesAtuais.map((q, qIdx) => {
                const isRespondida = respostas[qIdx] !== undefined;
                const isAtual = indiceAtual === qIdx;
                const isMarcada = marcadasRevisao[qIdx];

                let buttonClass = 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600';
                if (isRespondida) {
                  buttonClass = 'bg-indigo-600 border-indigo-500 text-white font-bold';
                }
                if (isMarcada && !isRespondida) {
                  buttonClass = 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold';
                }
                if (isAtual) {
                  buttonClass += ' ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900';
                }

                return (
                  <button
                    key={q.id || qIdx}
                    type="button"
                    onClick={() => {
                      setIndiceAtual(qIdx);
                      if (modoVisualizacao === 'lista') {
                        const el = document.getElementById(`questao-item-${qIdx}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`w-7 h-7 rounded-lg border text-xs flex items-center justify-center shrink-0 transition-all cursor-pointer ${buttonClass}`}
                    title={`Questão ${qIdx + 1}: ${q.area}`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Alternar modo de visualização */}
            <div className="shrink-0 flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setModoVisualizacao('individual')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  modoVisualizacao === 'individual' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Fluida</span>
              </button>
              <button
                type="button"
                onClick={() => setModoVisualizacao('lista')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  modoVisualizacao === 'lista' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-3 h-3" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* RELATÓRIO OFICIAL TRI QUANDO FINALIZADO */}
        {finalizado && resultado && (
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 mb-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Boletim Oficial de Desempenho TRI
                </span>
                <h4 className="text-3xl font-black text-white flex items-center gap-2 mt-1">
                  <Award className="w-8 h-8 text-amber-400" />
                  <span>{resultado.notaEstimada}</span>
                  <span className="text-sm font-medium text-slate-400">/ 1000 pontos</span>
                </h4>
              </div>
              <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-left sm:text-right">
                <span className="text-xs text-slate-400">Total de Acertos:</span>
                <div className="text-xl font-black text-emerald-400">
                  {resultado.acertosTotal} de {resultado.total} ({Math.round((resultado.acertosTotal / resultado.total) * 100)}%)
                </div>
              </div>
            </div>

            {/* Diagnóstico de Coerência TRI */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-slate-400 font-semibold">Análise de Coerência Pedagógica TRI:</span>
              <span className="font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/40 px-3 py-1 rounded-lg">
                {resultado.coerencia}
              </span>
            </div>

            {/* Desempenho por Grande Área do ENEM */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Desempenho por Área de Conhecimento:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(resultado.acertosPorArea).map(([area, dados]) => (
                  <div key={area} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 block truncate font-medium">{area}</span>
                    <div className="text-sm font-bold text-slate-100 mt-1">
                      {dados.acertos} / {dados.total}
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${dados.total > 0 ? (dados.acertos / dados.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações pós-simulado */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => iniciarProva(provaAtiva)}
                className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98"
              >
                <Shuffle className="w-4 h-4" />
                <span>Gerar Novo Lote de Questões</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvaAtiva(null);
                }}
                className="w-full sm:w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Menu de Simulados</span>
              </button>
            </div>
          </div>
        )}

        {/* EXIBIÇÃO DE QUESTÕES: MODO INDIVIDUAL (NAVEGAÇÃO FLUIDA) */}
        {modoVisualizacao === 'individual' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
              {/* Header da questão */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400 text-sm">
                    Questão {indiceAtual + 1} de {questoesAtuais.length}
                  </span>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getAreaBadgeColor(questaoAtual.area)}`}>
                    {questaoAtual.area}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{questaoAtual.disciplina}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      questaoAtual.dificuldade === 'Fácil'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : questaoAtual.dificuldade === 'Média'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    TRI: {questaoAtual.dificuldade}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMarcadasRevisao((prev) => ({ ...prev, [indiceAtual]: !prev[indiceAtual] }))}
                    className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                      marcadasRevisao[indiceAtual]
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Marcar questão para revisar depois"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Enunciado */}
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
                {questaoAtual.enunciado}
              </p>

              {/* Opções */}
              <div className="space-y-2 pt-1">
                {questaoAtual.opcoes.map((opcao, optIndex) => {
                  const isSelected = respostas[indiceAtual] === optIndex;
                  const acertou = respostas[indiceAtual] === questaoAtual.correta;

                  let opcaoEstilo = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';

                  if (finalizado) {
                    if (optIndex === questaoAtual.correta) {
                      opcaoEstilo = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !acertou) {
                      opcaoEstilo = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      opcaoEstilo = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
                    }
                  } else if (isSelected) {
                    opcaoEstilo = 'bg-indigo-950/70 border-indigo-500 text-indigo-200 font-semibold shadow-md';
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={finalizado}
                      onClick={() => setRespostas((prev) => ({ ...prev, [indiceAtual]: optIndex }))}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${opcaoEstilo}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold flex items-center justify-center shrink-0 text-slate-200">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="leading-snug pt-0.5">{opcao.replace(/^[A-E]\)\s*/, '')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Comentário TRI pós-finalização */}
              {finalizado && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Gabarito Comentado e Justificativa Pedagógica:</span>
                  </div>
                  <p>{questaoAtual.explicacao}</p>
                </div>
              )}
            </div>

            {/* CONTROLES DE NAVEGAÇÃO FLUIDA */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={indiceAtual === 0}
                onClick={() => setIndiceAtual((prev) => Math.max(0, prev - 1))}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <span className="text-xs text-slate-500 font-mono">
                {indiceAtual + 1} / {questoesAtuais.length}
              </span>

              {indiceAtual < questoesAtuais.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setIndiceAtual((prev) => Math.min(questoesAtuais.length - 1, prev + 1))}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                !finalizado && (
                  <button
                    type="button"
                    onClick={() => {
                      if (totalRespondidas < questoesAtuais.length) {
                        if (!confirm(`Você respondeu ${totalRespondidas} de ${questoesAtuais.length} questões. Deseja finalizar agora e receber sua nota TRI?`)) {
                          return;
                        }
                      }
                      setFinalizado(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir e Ver Nota TRI</span>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* EXIBIÇÃO DE QUESTÕES: MODO LISTA COMPLETA */}
        {modoVisualizacao === 'lista' && (
          <div className="space-y-4">
            {questoesAtuais.map((q, qIndex) => {
              const respondida = respostas[qIndex] !== undefined;
              const acertou = respostas[qIndex] === q.correta;

              return (
                <div
                  id={`questao-item-${qIndex}`}
                  key={q.id || qIndex}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">
                        Questão {qIndex + 1}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getAreaBadgeColor(q.area)}`}>
                        {q.area}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        q.dificuldade === 'Fácil'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : q.dificuldade === 'Média'
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      TRI: {q.dificuldade}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">{q.enunciado}</p>

                  <div className="space-y-2 pt-1">
                    {q.opcoes.map((opcao, optIndex) => {
                      const isSelected = respostas[qIndex] === optIndex;
                      let opcaoEstilo = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80';

                      if (finalizado) {
                        if (optIndex === q.correta) {
                          opcaoEstilo = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                        } else if (isSelected && !acertou) {
                          opcaoEstilo = 'bg-rose-950/60 border-rose-500 text-rose-200';
                        } else {
                          opcaoEstilo = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
                        }
                      } else if (isSelected) {
                        opcaoEstilo = 'bg-indigo-950/70 border-indigo-500 text-indigo-200 font-semibold shadow-sm';
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          disabled={finalizado}
                          onClick={() => setRespostas((prev) => ({ ...prev, [qIndex]: optIndex }))}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${opcaoEstilo}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0 text-slate-200">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className="leading-snug pt-0.5">{opcao.replace(/^[A-E]\)\s*/, '')}</span>
                        </button>
                      );
                    })}
                  </div>

                  {finalizado && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1">
                      <span className="font-bold text-amber-400">Gabarito Comentado:</span>
                      <p>{q.explicacao}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BOTÃO FLUTUANTE DE FINALIZAR NO MODO LISTA */}
        {!finalizado && modoVisualizacao === 'lista' && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                if (totalRespondidas < questoesAtuais.length) {
                  if (!confirm(`Você respondeu ${totalRespondidas} de ${questoesAtuais.length} questões. Deseja finalizar o simulado agora?`)) {
                    return;
                  }
                }
                setFinalizado(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Finalizar e Calcular Nota Oficial TRI</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TELA PRINCIPAL: SELEÇÃO DE SIMULADOS & CONFIGURAÇÃO DE LOTE
  // ==========================================
  return (
    <div id="simulados-hub-container" className="p-3 sm:p-4 bg-slate-950 text-white min-h-screen pb-28 max-w-4xl mx-auto">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-black text-amber-400 tracking-wide">
              Simulado TRI Oficial & Banco ENEM
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Treine com questões inéditas das 4 áreas do exame e algoritmo paramétrico TRI do INEP
          </p>
        </div>

        {/* ESTATÍSTICA DO BANCO DE DADOS */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-300 font-semibold">{estatisticasBanco.total} questões disponíveis</span>
        </div>
      </div>

      {/* CONTROLE DE LOTE & FILTROS DE ÁREA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5 shadow-md space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tamanho do Lote por Simulado:
            </span>
            <span className="text-[11px] text-slate-400">Escolha a quantidade de questões a serem carregadas:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[5, 10, 15, 20].map((qtd) => (
              <button
                key={qtd}
                type="button"
                onClick={() => setTamanhoLote(qtd)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tamanhoLote === qtd
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {qtd} questões
              </button>
            ))}
          </div>
        </div>

        {/* FILTROS POR ÁREA DE CONHECIMENTO */}
        <div className="border-t border-slate-800/80 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Filtro de Área Específica:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'Todas', label: `Todas as 4 Áreas (${estatisticasBanco.total})` },
              { id: 'Linguagens', label: `Linguagens (${estatisticasBanco.ling})` },
              { id: 'Ciências Humanas', label: `Humanas (${estatisticasBanco.hum})` },
              { id: 'Ciências da Natureza', label: `Natureza (${estatisticasBanco.nat})` },
              { id: 'Matemática', label: `Matemática (${estatisticasBanco.mat})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroArea(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  filtroArea === f.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTA DE SIMULADOS DISPONÍVEIS */}
      <div className="space-y-3">
        {PROVAS_CATALOGO.map((prova) => (
          <div
            key={prova.id}
            className={`bg-slate-900 border ${prova.corBorder} rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:border-amber-500 transition-all`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">{prova.titulo}</h3>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${prova.badgeBg}`}>
                  {prova.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">{prova.descricao}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap pt-0.5">
                <span className="text-indigo-400 font-semibold">{tamanhoLote} questões neste lote</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">
                  ~{Math.min(prova.tempoMinutosPadrao, Math.max(5, tamanhoLote * 3))} min sugeridos
                </span>
                <span>•</span>
                <span className="text-slate-500">{prova.disciplinas}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => iniciarProva(prova)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Iniciar Simulado</span>
            </button>
          </div>
        ))}
      </div>

      {/* DICA DE ESTRATÉGIA TRI DO INEP */}
      <div className="mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-amber-300">Como funciona o cálculo da nota TRI no ENEM:</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            A Teoria de Resposta ao Item não premia apenas o número bruto de acertos, mas sim a <strong>coerência pedagógica</strong>. Acertar as questões fáceis e médias consolida sua nota básica acima de 650 pontos; já os acertos em questões difíceis só somam pontuação máxima se o candidato não tiver errado as questões elementares da mesma área.
          </p>
        </div>
      </div>
    </div>
  );
}

export { Simulados };
