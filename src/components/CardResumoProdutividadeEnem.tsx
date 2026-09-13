import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Flame,
  Layers,
  PenTool,
  BookOpen,
  Info,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

export type CompetenciasTab = 'redacao_c1_c5' | 'evolucao_diaria' | 'areas_enem';

interface CompetenciaItem {
  id: string;
  codigo: string;
  nome: string;
  descricaoCurta: string;
  semanaAnterior: number;
  semanaAtual: number;
  max: number;
  destaque?: boolean;
  dica: string;
}

const COMPETENCIAS_ENEM: CompetenciaItem[] = [
  {
    id: 'c1',
    codigo: 'C1',
    nome: 'Norma Culta',
    descricaoCurta: 'Gramática, concordância, regência e pontuação formal.',
    semanaAnterior: 150,
    semanaAtual: 170,
    max: 200,
    dica: 'Atenção aos desvios de crase e vírgula entre sujeito e predicado.',
  },
  {
    id: 'c2',
    codigo: 'C2',
    nome: 'Tema & Repertório',
    descricaoCurta: 'Compreensão da proposta e repertório sociocultural legitimado.',
    semanaAnterior: 170,
    semanaAtual: 190,
    max: 200,
    dica: 'Excelente articulação de dados históricos e pensadores sociológicos.',
  },
  {
    id: 'c3',
    codigo: 'C3',
    nome: 'Projeto de Texto',
    descricaoCurta: 'Planejamento prévio, seleção e organização dos argumentos.',
    semanaAnterior: 140,
    semanaAtual: 160,
    max: 200,
    destaque: true,
    dica: 'Reforce o encadeamento das causas e consequências entre os parágrafos D1 e D2.',
  },
  {
    id: 'c4',
    codigo: 'C4',
    nome: 'Coesão Textual',
    descricaoCurta: 'Uso diversificado de operadores argumentativos e conectivos.',
    semanaAnterior: 170,
    semanaAtual: 180,
    max: 200,
    dica: 'Varie os conectivos interparágrafos evitando repetições de "Além disso".',
  },
  {
    id: 'c5',
    codigo: 'C5',
    nome: 'Proposta Intervenção',
    descricaoCurta: 'Os 5 elementos: Agente, Ação, Modo/Meio, Efeito e Detalhe.',
    semanaAnterior: 160,
    semanaAtual: 190,
    max: 200,
    destaque: true,
    dica: 'Maior salto da semana (+30 pts)! Todos os 5 elementos bem validados.',
  },
];

interface DiaSemanaLog {
  dia: string;
  diaCurto: string;
  horas: number;
  questoes: number;
  notaSimulada: number;
  competenciaFoco: string;
}

const DADOS_SEMANA_DIARIA: DiaSemanaLog[] = [
  { dia: 'Segunda', diaCurto: 'Seg', horas: 3.5, questoes: 35, notaSimulada: 800, competenciaFoco: 'C1 & C2' },
  { dia: 'Terça', diaCurto: 'Ter', horas: 4.2, questoes: 42, notaSimulada: 820, competenciaFoco: 'C4 Coesão' },
  { dia: 'Quarta', diaCurto: 'Qua', horas: 3.0, questoes: 30, notaSimulada: 840, competenciaFoco: 'C3 Argumento' },
  { dia: 'Quinta', diaCurto: 'Qui', horas: 5.2, questoes: 55, notaSimulada: 870, competenciaFoco: 'C5 Intervenção' },
  { dia: 'Sexta', diaCurto: 'Sex', horas: 4.0, questoes: 40, notaSimulada: 880, competenciaFoco: 'Redação Geral' },
  { dia: 'Sábado', diaCurto: 'Sáb', horas: 6.0, questoes: 65, notaSimulada: 910, competenciaFoco: 'Simulado TRI' },
  { dia: 'Domingo', diaCurto: 'Dom', horas: 2.5, questoes: 25, notaSimulada: 890, competenciaFoco: 'Revisão Erros' },
];

interface AreaEnemMatriz {
  area: string;
  sigla: string;
  semanaAnterior: number;
  semanaAtual: number;
  cor: string;
}

const AREAS_ENEM: AreaEnemMatriz[] = [
  { area: 'Linguagens & Códigos', sigla: 'LC', semanaAnterior: 74, semanaAtual: 82, cor: '#818cf8' },
  { area: 'Ciências Humanas', sigla: 'CH', semanaAnterior: 78, semanaAtual: 86, cor: '#fbbf24' },
  { area: 'Ciências da Natureza', sigla: 'CN', semanaAnterior: 68, semanaAtual: 78, cor: '#34d399' },
  { area: 'Matemática', sigla: 'MT', semanaAnterior: 72, semanaAtual: 85, cor: '#38bdf8' },
];

export interface CardResumoProdutividadeEnemProps {
  onNavigateToRedacao?: () => void;
  onNavigateToSimulados?: () => void;
  className?: string;
}

export const CardResumoProdutividadeEnem: React.FC<CardResumoProdutividadeEnemProps> = ({
  onNavigateToRedacao,
  onNavigateToSimulados,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<CompetenciasTab>('redacao_c1_c5');
  const [selectedCompId, setSelectedCompId] = useState<string | null>('c5');

  // Cálculo dos totais
  const totalSemanaAtual = COMPETENCIAS_ENEM.reduce((acc, curr) => acc + curr.semanaAtual, 0);
  const totalSemanaAnterior = COMPETENCIAS_ENEM.reduce((acc, curr) => acc + curr.semanaAnterior, 0);
  const deltaTotal = totalSemanaAtual - totalSemanaAnterior;
  const horasTotais = DADOS_SEMANA_DIARIA.reduce((acc, d) => acc + d.horas, 0);
  const questoesTotais = DADOS_SEMANA_DIARIA.reduce((acc, d) => acc + d.questoes, 0);

  const handleTabChange = (tab: CompetenciasTab) => {
    playClickSound();
    setActiveTab(tab);
  };

  const selectedComp = COMPETENCIAS_ENEM.find((c) => c.id === selectedCompId) || COMPETENCIAS_ENEM[4];

  // Dados formatados para o gráfico de barras das competências
  const competenciasChartData = COMPETENCIAS_ENEM.map((c) => ({
    name: c.codigo,
    fullName: c.nome,
    'Semana Anterior': c.semanaAnterior,
    'Semana Atual': c.semanaAtual,
    ganho: c.semanaAtual - c.semanaAnterior,
  }));

  return (
    <div
      id="card-produtividade-enem"
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all ${className}`}
    >
      {/* Background Accent Subtle Glow */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER DO CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Resumo de Produtividade Semanal</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +{deltaTotal} pts
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Evolução nas competências oficiais do ENEM nos últimos 7 dias de estudo.
          </p>
        </div>

        {/* METAS RÁPIDAS (Top Right Badges) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Nota Média</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {totalSemanaAtual} <span className="text-[10px] text-slate-500">/ 1000</span>
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-2.5 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Horas Dedicadas</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {horasTotais.toFixed(1)}h
            </span>
          </div>
        </div>
      </div>

      {/* ABAS DO GRÁFICO / SELETOR DE MODO */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800/90 mb-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('redacao_c1_c5')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'redacao_c1_c5'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Competências C1–C5</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('evolucao_diaria')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'evolucao_diaria'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Últimos 7 Dias</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('areas_enem')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'areas_enem'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Áreas do Edital</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: COMPETÊNCIAS C1 A C5 */}
      {activeTab === 'redacao_c1_c5' && (
        <div>
          {/* Gráfico de Barras Duplas (Semana Anterior vs Semana Atual) */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Pontuação por Competência (Escala 0 a 200)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
                  Semana Anterior
                </span>
                <span className="flex items-center gap-1 text-indigo-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                  Semana Atual
                </span>
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={competenciasChartData}
                  margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    domain={[0, 200]}
                    ticks={[0, 50, 100, 150, 200]}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-2.5 shadow-xl text-xs">
                            <p className="font-bold text-indigo-300">
                              {data.name}: {data.fullName}
                            </p>
                            <p className="text-slate-300 mt-1">
                              Semana Atual:{' '}
                              <strong className="text-emerald-400">{data['Semana Atual']} pts</strong>
                            </p>
                            <p className="text-slate-400">
                              Semana Anterior: {data['Semana Anterior']} pts
                            </p>
                            <p className="text-xs text-amber-300 mt-1 font-semibold">
                              Evolução: +{data.ganho} pontos
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="Semana Anterior"
                    fill="#475569"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="Semana Atual"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LISTA DETALHADA E INTERATIVA DAS 5 COMPETÊNCIAS */}
          <div className="space-y-2 mb-4">
            {COMPETENCIAS_ENEM.map((comp) => {
              const ganho = comp.semanaAtual - comp.semanaAnterior;
              const percentual = Math.round((comp.semanaAtual / comp.max) * 100);
              const isSelected = selectedCompId === comp.id;

              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedCompId(comp.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 border-indigo-500/70 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-black text-xs flex items-center justify-center font-mono">
                        {comp.codigo}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-200">
                          {comp.nome}
                        </span>
                        {comp.destaque && (
                          <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                            🔥 Destaque
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-slate-100">
                        {comp.semanaAtual} / {comp.max}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        +{ganho}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentual}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {comp.descricaoCurta}
                  </p>
                </div>
              );
            })}
          </div>

          {/* DICA PEDAGÓGICA DA COMPETÊNCIA SELECIONADA */}
          <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-3 flex items-start gap-2.5">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div className="text-xs">
              <strong className="text-indigo-300 font-semibold block mb-0.5">
                Diagnóstico {selectedComp.codigo}: {selectedComp.nome}
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedComp.dica}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: EVOLUÇÃO DIÁRIA DOS ÚLTIMOS 7 DIAS */}
      {activeTab === 'evolucao_diaria' && (
        <div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Carga Horária e Nota Estimada nos Últimos 7 Dias
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                Média: {(horasTotais / 7).toFixed(1)}h / dia
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={DADOS_SEMANA_DIARIA}
                  margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHoras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="diaCurto"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    domain={[0, 8]}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DiaSemanaLog;
                        return (
                          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-2.5 shadow-xl text-xs">
                            <p className="font-bold text-emerald-300">{data.dia}</p>
                            <p className="text-slate-300 mt-1">
                              Horas estudadas: <strong className="text-emerald-400">{data.horas}h</strong>
                            </p>
                            <p className="text-slate-300">
                              Questões resolvidas: <strong>{data.questoes}</strong>
                            </p>
                            <p className="text-slate-300">
                              Nota simulada: <strong className="text-amber-300">{data.notaSimulada} pts</strong>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Foco principal: {data.competenciaFoco}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="horas"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHoras)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRID DE CARDS DIÁRIOS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Dias Ativos</span>
              <span className="text-sm font-bold text-white">6 / 7 dias</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Questões Feitas</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">{questoesTotais}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Melhor Dia</span>
              <span className="text-sm font-bold text-amber-400">Sábado (6h)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Consistência</span>
              <span className="text-sm font-bold text-emerald-400">92%</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: ÁREAS DO EDITAL ENEM */}
      {activeTab === 'areas_enem' && (
        <div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Taxa de Acertos nas 4 Áreas da Matriz ENEM
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">
                Média: 82.7%
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {AREAS_ENEM.map((item) => {
                const ganho = item.semanaAtual - item.semanaAnterior;
                return (
                  <div key={item.sigla} className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-md text-slate-950 font-black text-xs flex items-center justify-center font-mono"
                          style={{ backgroundColor: item.cor }}
                        >
                          {item.sigla}
                        </span>
                        <span className="font-bold text-slate-200">{item.area}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-slate-100">
                          {item.semanaAtual}%
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          +{ganho}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.semanaAtual}%`, backgroundColor: item.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER DO CARD COM BOTÕES DE AÇÃO */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-[11px]">
            Dados calculados com base nas correções e simulados da última semana.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onNavigateToRedacao && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onNavigateToRedacao();
              }}
              className="flex-1 sm:flex-none text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <PenTool className="w-3 h-3" />
              <span>Treinar Redação</span>
            </button>
          )}

          {onNavigateToSimulados && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onNavigateToSimulados();
              }}
              className="flex-1 sm:flex-none text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 border border-slate-700"
            >
              <Target className="w-3 h-3 text-emerald-400" />
              <span>Fazer Simulado</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
