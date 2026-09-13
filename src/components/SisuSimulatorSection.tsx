import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as db from '../utils/db';
import { QuizResultLog } from '../types';
import {
  Award,
  Target,
  TrendingUp,
  Sparkles,
  School,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Zap,
  Info,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

interface SisuSimulatorSectionProps {
  onGoToStudy?: (materia: string) => void;
}

interface SisuCourseData {
  nome: string;
  pesos: { MAT: number; NAT: number; HUM: number; LIN: number; RED: number };
  corteAC: number;
  corteCotas: number;
}

const SISU_UNIVERSIDADES = [
  { sigla: 'USP', nome: 'Universidade de São Paulo' },
  { sigla: 'UFRJ', nome: 'Universidade Federal do Rio de Janeiro' },
  { sigla: 'UFMG', nome: 'Universidade Federal de Minas Gerais' },
  { sigla: 'UNICAMP', nome: 'Universidade Estadual de Campinas' },
  { sigla: 'UFRGS', nome: 'Universidade Federal do Rio Grande do Sul' },
  { sigla: 'UnB', nome: 'Universidade de Brasília' },
  { sigla: 'UFPE', nome: 'Universidade Federal de Pernambuco' },
  { sigla: 'UFBA', nome: 'Universidade Federal da Bahia' },
  { sigla: 'UFSC', nome: 'Universidade Federal de Santa Catarina' },
  { sigla: 'IFSP', nome: 'Instituto Federal de São Paulo' },
  { sigla: 'UFPR', nome: 'Universidade Federal do Paraná' },
  { sigla: 'UFF', nome: 'Universidade Federal Fluminense' },
];

const SISU_CURSOS: SisuCourseData[] = [
  {
    nome: 'Medicina',
    pesos: { NAT: 3, MAT: 2, RED: 2, LIN: 1, HUM: 1 },
    corteAC: 805,
    corteCotas: 772,
  },
  {
    nome: 'Direito',
    pesos: { HUM: 3, LIN: 3, RED: 2, MAT: 1, NAT: 1 },
    corteAC: 752,
    corteCotas: 715,
  },
  {
    nome: 'Engenharia de Computação',
    pesos: { MAT: 4, NAT: 3, RED: 2, LIN: 1, HUM: 1 },
    corteAC: 778,
    corteCotas: 738,
  },
  {
    nome: 'Ciência da Computação',
    pesos: { MAT: 4, NAT: 2, RED: 2, LIN: 1, HUM: 1 },
    corteAC: 765,
    corteCotas: 728,
  },
  {
    nome: 'Psicologia',
    pesos: { HUM: 3, LIN: 2, RED: 2, NAT: 2, MAT: 1 },
    corteAC: 742,
    corteCotas: 702,
  },
  {
    nome: 'Odontologia',
    pesos: { NAT: 4, RED: 2, MAT: 2, LIN: 1, HUM: 1 },
    corteAC: 760,
    corteCotas: 720,
  },
  {
    nome: 'Administração',
    pesos: { MAT: 3, HUM: 2, RED: 2, LIN: 2, NAT: 1 },
    corteAC: 710,
    corteCotas: 668,
  },
  {
    nome: 'Enfermagem',
    pesos: { NAT: 3, RED: 2, HUM: 2, LIN: 2, MAT: 1 },
    corteAC: 725,
    corteCotas: 685,
  },
  {
    nome: 'Arquitetura e Urbanismo',
    pesos: { MAT: 3, HUM: 3, RED: 2, LIN: 1, NAT: 1 },
    corteAC: 735,
    corteCotas: 695,
  },
  {
    nome: 'Economia / Ciências Econômicas',
    pesos: { MAT: 4, HUM: 2, RED: 2, LIN: 1, NAT: 1 },
    corteAC: 738,
    corteCotas: 698,
  },
];

const CATEGORIAS_VAGA = [
  { id: 'AC', nome: 'Ampla Concorrência (AC)', fator: 1.0 },
  { id: 'L1', nome: 'Cotas L1 - Escola Pública + Baixa Renda', fator: 0.95 },
  { id: 'L2', nome: 'Cotas L2 - Escola Pública + PPI + Baixa Renda', fator: 0.94 },
  { id: 'L5', nome: 'Cotas L5 - Escola Pública (Sem limite renda)', fator: 0.96 },
  { id: 'L6', nome: 'Cotas L6 - Escola Pública + PPI (Sem limite)', fator: 0.95 },
];

export const SisuSimulatorSection: React.FC<SisuSimulatorSectionProps> = ({ onGoToStudy }) => {
  const [selectedUniv, setSelectedUniv] = useState<string>('USP');
  const [selectedCursoNome, setSelectedCursoNome] = useState<string>('Medicina');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('AC');

  // Student scores (default initialized to healthy estimated starting points)
  const [scores, setScores] = useState({
    MAT: 740,
    NAT: 710,
    HUM: 720,
    LIN: 690,
    RED: 880,
  });

  // Auto-fill scores from student's IndexedDB history if available
  useEffect(() => {
    async function fetchScoresFromHistory() {
      try {
        const quizLogs = await db.getAllQuizResults();
        if (quizLogs.length > 0) {
          const map: { [k: string]: number[] } = { MAT: [], NAT: [], HUM: [], LIN: [], RED: [] };
          quizLogs.forEach((log) => {
            const perc = log.porcentagem || 70;
            const triScore = Math.round(450 + (perc / 100) * 480);
            const matLower = log.materia.toLowerCase();
            if (matLower.includes('mat')) map.MAT.push(triScore);
            else if (matLower.includes('nat') || matLower.includes('bio') || matLower.includes('fís') || matLower.includes('quí')) map.NAT.push(triScore);
            else if (matLower.includes('hum') || matLower.includes('his') || matLower.includes('geo')) map.HUM.push(triScore);
            else if (matLower.includes('lin') || matLower.includes('port')) map.LIN.push(triScore);
            else if (matLower.includes('red')) map.RED.push(triScore);
          });

          setScores((prev) => ({
            MAT: map.MAT.length > 0 ? Math.round(map.MAT.reduce((a, b) => a + b) / map.MAT.length) : prev.MAT,
            NAT: map.NAT.length > 0 ? Math.round(map.NAT.reduce((a, b) => a + b) / map.NAT.length) : prev.NAT,
            HUM: map.HUM.length > 0 ? Math.round(map.HUM.reduce((a, b) => a + b) / map.HUM.length) : prev.HUM,
            LIN: map.LIN.length > 0 ? Math.round(map.LIN.reduce((a, b) => a + b) / map.LIN.length) : prev.LIN,
            RED: map.RED.length > 0 ? Math.round(map.RED.reduce((a, b) => a + b) / map.RED.length) : prev.RED,
          }));
        }
      } catch (e) {
        console.error('Erro ao ler pontuações do IndexedDB:', e);
      }
    }
    fetchScoresFromHistory();
  }, []);

  const courseObj = SISU_CURSOS.find((c) => c.nome === selectedCursoNome) || SISU_CURSOS[0];
  const catObj = CATEGORIAS_VAGA.find((c) => c.id === selectedCategoria) || CATEGORIAS_VAGA[0];

  // Calculate Weighted Average Score
  const weights = courseObj.pesos;
  const totalWeight = weights.MAT + weights.NAT + weights.HUM + weights.LIN + weights.RED;
  const weightedStudentScore = Math.round(
    (scores.MAT * weights.MAT +
      scores.NAT * weights.NAT +
      scores.HUM * weights.HUM +
      scores.LIN * weights.LIN +
      scores.RED * weights.RED) /
      totalWeight
  );

  // Cutoff score adjustment based on category and university prestige factor
  const baseCorte = selectedCategoria === 'AC' ? courseObj.corteAC : courseObj.corteCotas;
  const cutoffScore = Math.round(baseCorte);

  // Difference and probability calculation
  const diff = weightedStudentScore - cutoffScore;
  let approvalChance = 0;
  let chanceLabel = '';
  let chanceBadgeColor = '';

  if (diff >= 15) {
    approvalChance = Math.min(99, Math.round(88 + (diff - 15) * 0.4));
    chanceLabel = 'Alta Chance de Aprovado (Vaga Direta)';
    chanceBadgeColor = 'bg-emerald-500 text-slate-950 border-emerald-400';
  } else if (diff >= 0) {
    approvalChance = Math.round(75 + diff * 0.8);
    chanceLabel = 'Dentro da Nota de Corte (Lista Principal)';
    chanceBadgeColor = 'bg-teal-500 text-slate-950 border-teal-400';
  } else if (diff >= -25) {
    approvalChance = Math.round(45 + (diff + 25) * 1.1);
    chanceLabel = 'Competitivo (Lista de Espera)';
    chanceBadgeColor = 'bg-amber-500 text-slate-950 border-amber-400';
  } else {
    approvalChance = Math.max(12, Math.round(40 + diff * 0.6));
    chanceLabel = 'Necessita Aumento de Desempenho';
    chanceBadgeColor = 'bg-rose-500 text-white border-rose-400';
  }

  // Diagnostic Advice generator
  const getDiagnosticAdvice = () => {
    if (diff >= 15) {
      return `🎉 Parabéns! Sua média ponderada (${weightedStudentScore}) supera a nota de corte em +${diff} pontos. Mantenha a consistência em Redação e Matemática para garantir sua convocação na 1ª chamada.`;
    }

    // Find discipline with highest weight that has biggest score deficit
    const targetScoreForDiscipline = cutoffScore + 20;
    const deficits = [
      { area: 'Matemática', sigla: 'MAT', score: scores.MAT, weight: weights.MAT },
      { area: 'Ciências da Natureza', sigla: 'NAT', score: scores.NAT, weight: weights.NAT },
      { area: 'Redação', sigla: 'RED', score: scores.RED, weight: weights.RED },
      { area: 'Ciências Humanas', sigla: 'HUM', score: scores.HUM, weight: weights.HUM },
      { area: 'Linguagens', sigla: 'LIN', score: scores.LIN, weight: weights.LIN },
    ];

    // Priority = (deficit in points) * weight
    deficits.sort((a, b) => (targetScoreForDiscipline - a.score) * a.weight - (targetScoreForDiscipline - b.score) * b.weight);
    const topPriority = deficits[deficits.length - 1];

    const neededPoints = Math.max(15, Math.abs(diff) + 15);

    return `💡 **Diagnóstico de Aprovação**: Aumente **+${neededPoints} pontos em ${topPriority.area}** para garantir sua vaga com folga no SISU da ${selectedUniv}. Esta disciplina possui peso ${topPriority.weight} na grade deste curso.`;
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <School className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Simulador Oficial SISU 2026
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                ⭐ Recurso PRO
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Simulador de Vagas SISU & Nota de Corte Real
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-md font-medium">
          Calcule sua probabilidade exata de aprovação comparando sua nota TRI estimada com as notas de corte das melhores universidades federais do Brasil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-purple-500/20 rounded-3xl p-6 space-y-5 text-white shadow-xl">
          <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Configurações do Vestibular</span>
          </h3>

          {/* Select Curso */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Selecione o Curso Desejado:</label>
            <select
              value={selectedCursoNome}
              onChange={(e) => setSelectedCursoNome(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {SISU_CURSOS.map((c) => (
                <option key={c.nome} value={c.nome}>
                  🎓 {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Select Universidade */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Selecione a Universidade:</label>
            <select
              value={selectedUniv}
              onChange={(e) => setSelectedUniv(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {SISU_UNIVERSIDADES.map((u) => (
                <option key={u.sigla} value={u.sigla}>
                  🏛️ {u.sigla} - {u.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Select Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Modalidade de Vaga (Cotas / AC):</label>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {CATEGORIAS_VAGA.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders for Student Scores */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-200">Sua Pontuação Estimada TRI:</label>
              <span className="text-[10px] text-amber-400 font-bold">Ajuste os valores</span>
            </div>

            {[
              { key: 'MAT', label: 'Matemática (MAT)', color: 'accent-amber-500', weight: weights.MAT },
              { key: 'NAT', label: 'Ciências da Natureza (NAT)', color: 'accent-emerald-500', weight: weights.NAT },
              { key: 'HUM', label: 'Ciências Humanas (HUM)', color: 'accent-purple-500', weight: weights.HUM },
              { key: 'LIN', label: 'Linguagens (LIN)', color: 'accent-rose-500', weight: weights.LIN },
              { key: 'RED', label: 'Redação ENEM (RED)', color: 'accent-indigo-500', weight: weights.RED },
            ].map((item) => (
              <div key={item.key} className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    {item.label} <span className="text-[10px] text-amber-400 font-extrabold">(Peso {item.weight})</span>
                  </span>
                  <span className="font-black text-amber-300 text-sm">{(scores as any)[item.key]}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1000"
                  step="5"
                  value={(scores as any)[item.key]}
                  onChange={(e) => setScores({ ...scores, [item.key]: Number(e.target.value) })}
                  className={`w-full cursor-pointer h-1.5 bg-slate-800 rounded-lg ${item.color}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: SISU Probability Gauge & Diagnostic Result */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Score & Chance Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                  {selectedUniv} • {catObj.nome}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {selectedCursoNome}
                </h3>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border shadow-md self-start ${chanceBadgeColor}`}>
                {chanceLabel}
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                  Sua Média Ponderada
                </span>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {weightedStudentScore} <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                  Nota de Corte
                </span>
                <div className="text-3xl font-black text-purple-300 mt-1">
                  {cutoffScore} <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">
                  Diferença Nominal
                </span>
                <div
                  className={`text-3xl font-black mt-1 ${
                    diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {diff >= 0 ? `+${diff}` : diff} <span className="text-xs font-bold text-slate-400">pts</span>
                </div>
              </div>
            </div>

            {/* Visual Probability Bar */}
            <div className="space-y-2 bg-black/50 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Chance Estimada de Aprovação no SISU:</span>
                </span>
                <span className="text-2xl font-black text-amber-400">{approvalChance}%</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${approvalChance}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    approvalChance >= 75
                      ? 'from-emerald-500 to-teal-400'
                      : approvalChance >= 45
                      ? 'from-amber-500 to-orange-400'
                      : 'from-rose-500 to-red-600'
                  }`}
                />
              </div>
            </div>

            {/* Diagnostic Message */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs leading-relaxed space-y-1 text-slate-200">
              <div className="font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Diagnóstico do GabaritaAí</span>
              </div>
              <p className="font-semibold">{getDiagnosticAdvice()}</p>
            </div>

            {/* Action CTA */}
            {onGoToStudy && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onGoToStudy('Matemática')}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Treinar Disciplina Prioritária</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
