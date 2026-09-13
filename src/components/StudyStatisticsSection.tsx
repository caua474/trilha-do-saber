import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
  Calendar,
  Zap,
  Sparkles,
  Plus,
  Edit3,
  Download,
  Award,
  Flame,
  Filter,
  PieChart,
  HelpCircle,
  X,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { CardResumoProdutividadeEnem } from './CardResumoProdutividadeEnem';

export interface DailyStudyLog {
  id: string;
  diaSemana: string;
  dataCurta: string;
  horasEstudadas: number; // e.g. 3.5
  questoesResolvidas: number; // e.g. 40
  acertos: number; // e.g. 34
  materiasFoco: string[];
}

export interface AreaPerformance {
  area: string;
  acertos: number;
  total: number;
  percentual: number;
  cor: string;
}

const INITIAL_WEEKLY_DATA: DailyStudyLog[] = [
  {
    id: 'day-1',
    diaSemana: 'Segunda',
    dataCurta: 'Seg, 07/Ago',
    horasEstudadas: 3.5,
    questoesResolvidas: 35,
    acertos: 29,
    materiasFoco: ['Matemática', 'Física'],
  },
  {
    id: 'day-2',
    diaSemana: 'Terça',
    dataCurta: 'Ter, 08/Ago',
    horasEstudadas: 4.2,
    questoesResolvidas: 45,
    acertos: 39,
    materiasFoco: ['Redação', 'Biologia'],
  },
  {
    id: 'day-3',
    diaSemana: 'Quarta',
    dataCurta: 'Qua, 09/Ago',
    horasEstudadas: 2.8,
    questoesResolvidas: 30,
    acertos: 24,
    materiasFoco: ['História', 'Química'],
  },
  {
    id: 'day-4',
    diaSemana: 'Quinta',
    dataCurta: 'Qui, 10/Ago',
    horasEstudadas: 5.0,
    questoesResolvidas: 50,
    acertos: 44,
    materiasFoco: ['Matemática', 'Geografia'],
  },
  {
    id: 'day-5',
    diaSemana: 'Sexta',
    dataCurta: 'Sex, 11/Ago',
    horasEstudadas: 3.8,
    questoesResolvidas: 40,
    acertos: 33,
    materiasFoco: ['Linguagens', 'Filosofia'],
  },
  {
    id: 'day-6',
    diaSemana: 'Sábado',
    dataCurta: 'Sáb, 12/Ago',
    horasEstudadas: 6.0,
    questoesResolvidas: 60,
    acertos: 53,
    materiasFoco: ['Simulado TRI Geral'],
  },
  {
    id: 'day-7',
    diaSemana: 'Domingo',
    dataCurta: 'Dom, 13/Ago',
    horasEstudadas: 4.5,
    questoesResolvidas: 40,
    acertos: 36,
    materiasFoco: ['Revisão Espaçada', 'Redação'],
  },
];

const INITIAL_AREA_PERFORMANCE: AreaPerformance[] = [
  { area: 'Matemática & Tec.', acertos: 78, total: 90, percentual: 86.6, cor: '#6366f1' },
  { area: 'Ciências da Natureza', acertos: 65, total: 80, percentual: 81.2, cor: '#10b981' },
  { area: 'Ciências Humanas', acertos: 58, total: 65, percentual: 89.2, cor: '#f59e0b' },
  { area: 'Linguagens & Códigos', acertos: 57, total: 65, percentual: 87.6, cor: '#ec4899' },
];

export const StudyStatisticsSection: React.FC = () => {
  // State for study logs
  const [studyLogs, setStudyLogs] = useState<DailyStudyLog[]>(() => {
    try {
      const saved = localStorage.getItem('gabarita_enem_study_stats_logs');
      return saved ? JSON.parse(saved) : INITIAL_WEEKLY_DATA;
    } catch {
      return INITIAL_WEEKLY_DATA;
    }
  });

  // State for filter period
  const [period, setPeriod] = useState<'semana' | 'duas_semanas' | 'mes'>('semana');

  // Metric line visibility toggles
  const [showHoras, setShowHoras] = useState<boolean>(true);
  const [showAcertos, setShowAcertos] = useState<boolean>(true);
  const [showPrecisao, setShowPrecisao] = useState<boolean>(true);

  // Edit/Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [selectedDayId, setSelectedDayId] = useState<string>('day-7');
  const [formHoras, setFormHoras] = useState<number>(4.5);
  const [formQuestoes, setFormQuestoes] = useState<number>(40);
  const [formAcertos, setFormAcertos] = useState<number>(36);
  const [formMaterias, setFormMaterias] = useState<string>('Matemática, Redação');

  // AI Diagnosis Modal/State
  const [isAiDiagnosisLoading, setIsAiDiagnosisLoading] = useState<boolean>(false);
  const [aiDiagnosisResult, setAiDiagnosisResult] = useState<string | null>(null);

  // PDF Export State
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Save logs to localStorage
  const saveLogs = (newLogs: DailyStudyLog[]) => {
    setStudyLogs(newLogs);
    try {
      localStorage.setItem('gabarita_enem_study_stats_logs', JSON.stringify(newLogs));
    } catch {
      // ignore
    }
  };

  // Compute stats
  const totals = useMemo(() => {
    let totalHoras = 0;
    let totalQuestoes = 0;
    let totalAcertos = 0;

    studyLogs.forEach((log) => {
      totalHoras += log.horasEstudadas;
      totalQuestoes += log.questoesResolvidas;
      totalAcertos += log.acertos;
    });

    const taxaPrecisaoGeral = totalQuestoes > 0 ? (totalAcertos / totalQuestoes) * 100 : 0;
    const mediaHorasDiarias = studyLogs.length > 0 ? totalHoras / studyLogs.length : 0;

    return {
      totalHoras: Number(totalHoras.toFixed(1)),
      totalQuestoes,
      totalAcertos,
      taxaPrecisaoGeral: Number(taxaPrecisaoGeral.toFixed(1)),
      mediaHorasDiarias: Number(mediaHorasDiarias.toFixed(1)),
      metaHorasSemana: 28,
      percentualMeta: Math.min(100, Math.round((totalHoras / 28) * 100)),
    };
  }, [studyLogs]);

  // Chart formatted data
  const chartData = useMemo(() => {
    return studyLogs.map((log) => {
      const precisao = log.questoesResolvidas > 0 ? Math.round((log.acertos / log.questoesResolvidas) * 100) : 0;
      return {
        dia: log.diaSemana.slice(0, 3),
        diaCompleto: log.diaSemana,
        data: log.dataCurta,
        'Horas Estudadas (h)': log.horasEstudadas,
        'Acertos (questões)': log.acertos,
        'Precisão (%)': precisao,
        questoesTotais: log.questoesResolvidas,
      };
    });
  }, [studyLogs]);

  // Handle open modal for editing or adding
  const handleOpenEditLog = (log: DailyStudyLog) => {
    setSelectedDayId(log.id);
    setFormHoras(log.horasEstudadas);
    setFormQuestoes(log.questoesResolvidas);
    setFormAcertos(log.acertos);
    setFormMaterias(log.materiasFoco.join(', '));
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = studyLogs.map((log) => {
      if (log.id === selectedDayId) {
        const materiasArray = formMaterias.split(',').map((m) => m.trim()).filter(Boolean);
        return {
          ...log,
          horasEstudadas: Math.max(0, Number(formHoras)),
          questoesResolvidas: Math.max(0, Number(formQuestoes)),
          acertos: Math.min(Math.max(0, Number(formAcertos)), Math.max(0, Number(formQuestoes))),
          materiasFoco: materiasArray.length > 0 ? materiasArray : log.materiasFoco,
        };
      }
      return log;
    });

    saveLogs(updated);
    setIsLogModalOpen(false);
  };

  const handleResetData = () => {
    saveLogs(INITIAL_WEEKLY_DATA);
    setAiDiagnosisResult(null);
  };

  // Generate AI Diagnosis
  const handleGenerateAiDiagnosis = () => {
    setIsAiDiagnosisLoading(true);
    setAiDiagnosisResult(null);

    setTimeout(() => {
      const peakDay = [...studyLogs].sort((a, b) => b.acertos - a.acertos)[0];
      const lowestDay = [...studyLogs].sort((a, b) => a.horasEstudadas - b.horasEstudadas)[0];

      const diagnosis = `📊 **Diagnóstico IA de Rendimento Semanal:**
      
• **Pico de Alta Performance:** Seu melhor desempenho ocorreu na **${peakDay?.diaSemana}**, registrando **${peakDay?.acertos} acertos** com **${peakDay?.horasEstudadas}h** de estudo concentrado (${peakDay?.materiasFoco.join(', ')}).
• **Consistência Diária:** Sua média semanal é de **${totals.mediaHorasDiarias}h/dia** com uma taxa geral de precisão em questões de **${totals.taxaPrecisaoGeral}%** (excelente para o patamar TRI de 800+).
• **Ponto de Atenção:** Na **${lowestDay?.diaSemana}**, o tempo total de estudo ficou em **${lowestDay?.horasEstudadas}h**. Sugerimos utilizar o *Modo Pomodoro* para manter a régua de regularidade.
• **Recomendação Tática:** Mantenha blocos de simulado aos sábados (onde seu volume de questões atinge o ápice de 60 questões/dia).`;

      setAiDiagnosisResult(diagnosis);
      setIsAiDiagnosisLoading(false);
    }, 1200);
  };

  // Export Weekly Progress to PDF using jsPDF
  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let currentY = 15;

      // Header Background Accent
      doc.setFillColor(30, 27, 75); // Indigo 950
      doc.rect(0, 0, pageWidth, 32, 'F');

      // Header Title & Metadata
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('GABARITA ENEM - RELATÓRIO DE PROGRESSO SEMANAL', 14, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(199, 210, 254);
      doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 21);
      doc.text('Acompanhamento do progresso diário de horas estudadas e acertos em questões ENEM', 14, 26);

      currentY = 40;

      // Executive Summary Metrics Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, pageWidth - 28, 28, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text('MÉTRICAS CONSOLIDADAS DA SEMANA', 18, currentY + 7);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const col1 = 18;
      const col2 = 78;
      const col3 = 138;

      doc.text(`Total Estudado: ${totals.totalHoras}h (${totals.percentualMeta}% da meta de 28h)`, col1, currentY + 15);
      doc.text(`Média Diária: ${totals.mediaHorasDiarias}h / dia`, col1, currentY + 21);

      doc.text(`Questões Resolvidas: ${totals.totalQuestoes}`, col2, currentY + 15);
      doc.text(`Acertos Obtidos: ${totals.totalAcertos}`, col2, currentY + 21);

      doc.text(`Precisão Geral: ${totals.taxaPrecisaoGeral}%`, col3, currentY + 15);
      doc.text(`Rendimento TRI: Alta Performance`, col3, currentY + 21);

      currentY += 36;

      // Daily Logs Table Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('HISTÓRICO DIÁRIO DE PROGRESSO', 14, currentY);

      currentY += 6;

      const headers = ['Dia', 'Data', 'Horas', 'Questões', 'Acertos', 'Precisão', 'Disciplinas Foco'];
      const colWidths = [24, 24, 18, 22, 20, 22, 52];

      // Table Header Row
      doc.setFillColor(79, 70, 229); // Indigo 600
      doc.rect(14, currentY, pageWidth - 28, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);

      let xPos = 16;
      headers.forEach((h, idx) => {
        doc.text(h, xPos, currentY + 5.5);
        xPos += colWidths[idx];
      });

      currentY += 8;

      // Table Data Rows
      studyLogs.forEach((log, index) => {
        const isEven = index % 2 === 0;
        if (isEven) {
          doc.setFillColor(241, 245, 249);
          doc.rect(14, currentY, pageWidth - 28, 7.5, 'F');
        }

        const perc = log.questoesResolvidas > 0 ? Math.round((log.acertos / log.questoesResolvidas) * 100) : 0;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);

        let rowX = 16;
        doc.text(log.diaSemana, rowX, currentY + 5);
        rowX += colWidths[0];

        doc.text(log.dataCurta, rowX, currentY + 5);
        rowX += colWidths[1];

        doc.text(`${log.horasEstudadas}h`, rowX, currentY + 5);
        rowX += colWidths[2];

        doc.text(`${log.questoesResolvidas}`, rowX, currentY + 5);
        rowX += colWidths[3];

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Emerald 500
        doc.text(`${log.acertos}`, rowX, currentY + 5);
        rowX += colWidths[4];

        doc.setTextColor(124, 58, 237); // Purple
        doc.text(`${perc}%`, rowX, currentY + 5);
        rowX += colWidths[5];

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const materiasStr = log.materiasFoco.join(', ');
        const truncatedMaterias = materiasStr.length > 32 ? materiasStr.substring(0, 30) + '...' : materiasStr;
        doc.text(truncatedMaterias, rowX, currentY + 5);

        currentY += 7.5;
      });

      currentY += 10;

      // Performance by Knowledge Area
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('RENDIMENTO POR ÁREA DO CONHECIMENTO (ENEM)', 14, currentY);

      currentY += 6;

      INITIAL_AREA_PERFORMANCE.forEach((area) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, currentY, pageWidth - 28, 8, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(area.area, 18, currentY + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`Acertos: ${area.acertos} / ${area.total} questões`, 110, currentY + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`Aproveitamento: ${area.percentual}%`, 155, currentY + 5.5);

        currentY += 10;
      });

      currentY += 4;

      // Footer Callout
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(67, 56, 202);
      doc.text('Recomendação GabaritaAí:', 18, currentY + 5);
      doc.text('Mantenha a régua de resolução diária de questões para consolidar sua nota na TRI.', 18, currentY + 9.5);

      // Save PDF
      doc.save(`Relatorio_Progresso_Estudos_ENEM_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Painel Analítico de Desempenho ENEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
              <span>Estatísticas de Estudo</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitore sua evolução diária em horas dedicadas e acertos em questões. Visualize métricas em tempo real para otimizar sua preparação para a aprovação no SISU.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => {
                const todayLog = studyLogs[studyLogs.length - 1];
                handleOpenEditLog(todayLog);
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Estudo de Hoje</span>
            </button>

            <button
              onClick={handleGenerateAiDiagnosis}
              disabled={isAiDiagnosisLoading}
              className="px-4 py-3 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs transition flex items-center space-x-2 border border-indigo-400/30 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isAiDiagnosisLoading ? 'Analisando...' : 'Diagnóstico IA'}</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center space-x-2 border border-slate-700 cursor-pointer shrink-0 shadow-sm"
              title="Exportar gráfico e dados de progresso semanal em PDF"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>{isExportingPdf ? 'Gerando PDF...' : 'Exportar PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Horas Estudadas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Horas Estudadas
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totals.totalHoras}h
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {totals.percentualMeta}% da meta
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${totals.percentualMeta}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Meta semanal: <strong>{totals.metaHorasSemana}h</strong> • Média de <strong>{totals.mediaHorasDiarias}h/dia</strong>
          </p>
        </div>

        {/* KPI 2: Acertos Totais */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Acertos em Questões
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totals.totalAcertos}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              / {totals.totalQuestoes} questões
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${totals.taxaPrecisaoGeral}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Taxa de precisão TRI: <strong className="text-emerald-600 dark:text-emerald-400">{totals.taxaPrecisaoGeral}% de acertos</strong>
          </p>
        </div>

        {/* KPI 3: Ritmo Diário */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ofensiva de Estudo
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              7 Dias
            </span>
            <span className="text-xs font-bold text-amber-500">
              Semana Ativa 100%
            </span>
          </div>
          <div className="flex items-center space-x-1.5 pt-1">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => (
              <div
                key={d}
                className="flex-1 py-1 rounded-md text-[10px] font-bold text-center bg-emerald-500 text-slate-950"
              >
                {d[0]}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sequência ininterrupta mantida com sucesso!
          </p>
        </div>

        {/* KPI 4: Diagnóstico Simplificado */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nível do Ritmo
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              Alta Performance
            </span>
          </div>
          <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
            Simulado TRI Recomendado
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Ritmo ideal para alcançar corte de Medicina / Engenharias no SISU.
          </p>
        </div>
      </div>

      {/* CARD DE RESUMO DE PRODUTIVIDADE NAS COMPETÊNCIAS ENEM */}
      <CardResumoProdutividadeEnem />

      {/* AI DIAGNOSIS BANNER RESULT */}
      {aiDiagnosisResult && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500 rounded-3xl p-6 text-white shadow-xl relative space-y-3">
          <button
            onClick={() => setAiDiagnosisResult(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              Diagnóstico de Inteligência Artificial
            </span>
          </div>
          <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-medium">
            {aiDiagnosisResult}
          </div>
        </div>
      )}

      {/* MAIN LINE CHART SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Controls & Period Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Evolução Diária de Acertos e Horas Estudadas</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhe a curva de rendimento ao longo dos dias da semana
            </p>
          </div>

          {/* Metric Toggles & Period Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Checkboxes/Chips */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setShowHoras(!showHoras)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  showHoras
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${showHoras ? 'bg-slate-950' : 'bg-cyan-500'}`} />
                <span>Horas</span>
              </button>

              <button
                onClick={() => setShowAcertos(!showAcertos)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  showAcertos
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${showAcertos ? 'bg-slate-950' : 'bg-emerald-500'}`} />
                <span>Acertos</span>
              </button>

              <button
                onClick={() => setShowPrecisao(!showPrecisao)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                  showPrecisao
                    ? 'bg-purple-500 text-white font-black shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${showPrecisao ? 'bg-white' : 'bg-purple-500'}`} />
                <span>Precisão %</span>
              </button>
            </div>

            {/* Period Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setPeriod('semana')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  period === 'semana'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Esta Semana
              </button>
              <button
                onClick={() => setPeriod('duas_semanas')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  period === 'duas_semanas'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                14 Dias
              </button>
            </div>

            {/* Export PDF Button for Chart */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm shrink-0"
              title="Baixar dados e métricas do gráfico em arquivo PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exportando...' : 'Exportar PDF'}</span>
            </button>
          </div>
        </div>

        {/* RECHARTS LINE CHART CONTAINER */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis
                dataKey="dia"
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#475569', opacity: 0.3 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#475569', opacity: 0.3 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: '#a855f7', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataObj = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white space-y-2 text-xs">
                        <p className="font-black text-indigo-400 border-b border-slate-800 pb-1 text-sm">
                          {dataObj.diaCompleto} ({dataObj.data})
                        </p>
                        <div className="space-y-1">
                          <p className="flex items-center justify-between space-x-4">
                            <span className="text-cyan-400 font-semibold">⏱️ Horas Estudadas:</span>
                            <strong className="text-white">{dataObj['Horas Estudadas (h)']} hrs</strong>
                          </p>
                          <p className="flex items-center justify-between space-x-4">
                            <span className="text-emerald-400 font-semibold">🎯 Acertos:</span>
                            <strong className="text-white">
                              {dataObj['Acertos (questões)']} / {dataObj.questoesTotais} questões
                            </strong>
                          </p>
                          <p className="flex items-center justify-between space-x-4">
                            <span className="text-purple-400 font-semibold">📈 Taxa de Precisão:</span>
                            <strong className="text-purple-300 font-black">{dataObj['Precisão (%)']}%</strong>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />

              {showHoras && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Horas Estudadas (h)"
                  stroke="#06b6d4"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#083344' }}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#ffffff' }}
                />
              )}

              {showAcertos && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="Acertos (questões)"
                  stroke="#10b981"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#022c22' }}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: '#ffffff' }}
                />
              )}

              {showPrecisao && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Precisão (%)"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#a855f7' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECONDARY SECTION: DESEMPENHO POR ÁREA DO CONHECIMENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART: ACERTOS POR ÁREA ENEM */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                <span>Rendimento por Área do Conhecimento ENEM</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aproveitamento percentual de acertos por grandes áreas do edital
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={INITIAL_AREA_PERFORMANCE}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="area"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as AreaPerformance;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1 shadow-lg border border-slate-700">
                          <p className="font-bold text-indigo-300">{data.area}</p>
                          <p>
                            Acertos: <strong>{data.acertos} / {data.total}</strong>
                          </p>
                          <p className="text-emerald-400 font-bold">
                            Precisão: {data.percentual}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="percentual" radius={[10, 10, 0, 0]}>
                  {INITIAL_AREA_PERFORMANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DICAS DE METAS & RECOMENDAÇÕES */}
        <div className="bg-gradient-to-br from-indigo-900/10 via-slate-900 to-purple-900/10 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
              <h4 className="text-sm font-black uppercase tracking-wider">
                Estratégia de Metas TRI
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              O algoritmo do ENEM valoriza a coerência pedagógica. Manter a régua de acertos constante aciona pontuações mais altas na escala TRI.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">🎯 Meta de Questões Diárias</span>
                <p className="text-slate-500 dark:text-slate-400">Recomendado: Mínimo 30 questões/dia durante a semana.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">⏱️ Ciclo de Estudo Ideal</span>
                <p className="text-slate-500 dark:text-slate-400">Blocos de 50min com 10min de descanso (Pomodoro).</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer mt-4"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Dados Iniciais</span>
          </button>
        </div>
      </div>

      {/* DETAILED DAILY LOGS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Histórico Detalhado por Dia da Semana</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clique para editar ou atualizar manualmente o tempo e os acertos registrados em cada dia
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Dia da Semana</th>
                <th className="py-3 px-4">Horas Estudadas</th>
                <th className="py-3 px-4">Questões / Acertos</th>
                <th className="py-3 px-4">Precisão %</th>
                <th className="py-3 px-4">Foco Principal</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {studyLogs.map((log) => {
                const perc = log.questoesResolvidas > 0 ? Math.round((log.acertos / log.questoesResolvidas) * 100) : 0;
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-slate-800 dark:text-slate-200"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {log.diaSemana}
                      <span className="block text-[10px] text-slate-400 font-normal">{log.dataCurta}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{log.horasEstudadas}h</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-emerald-600 dark:text-emerald-400">{log.acertos}</strong> / {log.questoesResolvidas} acertos
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          perc >= 85
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : perc >= 70
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {perc}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {log.materiasFoco.map((mat, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditLog(log)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center space-x-1 ml-auto cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT LOG MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600 text-white rounded-2xl">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Lançamento de Estudo Diário
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atualize suas estatísticas para atualizar os gráficos
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Horas Estudadas (ex: 3.5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="24"
                  value={formHoras}
                  onChange={(e) => setFormHoras(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Questões Resolvidas
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formQuestoes}
                    onChange={(e) => setFormQuestoes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Acertos Obtidos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formQuestoes}
                    value={formAcertos}
                    onChange={(e) => setFormAcertos(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Disciplinas Focadas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formMaterias}
                  onChange={(e) => setFormMaterias(e.target.value)}
                  placeholder="Ex: Matemática, Física, Redação"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Salvar Dados</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
