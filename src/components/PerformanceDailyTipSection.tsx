import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as db from '../utils/db';
import { StudyMaterial, TutorPlan, ELI5Explanation, QuizResultLog } from '../types';
import { ENEM_CATALOG, EnemTopic } from '../data/enemCatalog';
import {
  Sparkles,
  TrendingDown,
  Target,
  Brain,
  Zap,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  Award,
  ChevronRight,
  PieChart,
  Layers,
  Flame,
  Share2,
  Check
} from 'lucide-react';

interface PerformanceDailyTipSectionProps {
  onActionSelect: (materia: string, topico: string, acao: 'flashcards' | 'cronograma' | 'simulado') => void;
}

interface PerformanceDiagnostic {
  recommendedMateria: string;
  recommendedTopico: EnemTopic;
  areaSigla: string;
  areaGradient: string;
  motivoDefasagem: string;
  dicaEstrategica: string;
  materiastats: { [materiaName: string]: { count: number; errCount: number; successRate: number } };
  totalEstudos: number;
  totalErros: number;
}

export const PerformanceDailyTipSection: React.FC<PerformanceDailyTipSectionProps> = ({
  onActionSelect
}) => {
  const [diagnostic, setDiagnostic] = useState<PerformanceDiagnostic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  const handleShareTip = async () => {
    if (!diagnostic) return;
    const shareTitle = `💡 Dica do Dia GabaritaAí: ${diagnostic.recommendedMateria} - ${diagnostic.recommendedTopico.nome}`;
    const shareText = `📌 *${diagnostic.recommendedMateria}* (${diagnostic.recommendedTopico.nome})\n\n✨ *Dica de Ouro TRI:* "${diagnostic.recommendedTopico.dicaChave}"\n\n💡 *Estratégia:* ${diagnostic.dicaEstrategica}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareTitle}\n\n${shareText}\n\n${shareUrl}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch (err) {
        console.error('Erro ao copiar dica:', err);
      }
    }
  };

  const runPerformanceAnalysis = async () => {
    setLoading(true);
    try {
      // 1. Fetch all IndexedDB data stores concurrently
      const [materials, tutorPlans, eli5List, quizLogs] = await Promise.all([
        db.getAllMaterials().catch(() => [] as StudyMaterial[]),
        db.getAllTutorPlans().catch(() => [] as TutorPlan[]),
        db.getAllELI5Explanations().catch(() => [] as ELI5Explanation[]),
        db.getAllQuizResults().catch(() => [] as QuizResultLog[])
      ]);

      // Count study records per subject name
      const statsMap: { [materiaName: string]: { count: number; errCount: number; totalQuestions: number } } = {};

      // Initialize all main ENEM catalog disciplines with default zeros
      ENEM_CATALOG.forEach((area) => {
        area.disciplinas.forEach((disc) => {
          statsMap[disc.nome] = { count: 0, errCount: 0, totalQuestions: 0 };
        });
      });

      // Analyze materials from IndexedDB
      materials.forEach((mat) => {
        const textLower = (mat.title + ' ' + (mat.focusTopic || '') + ' ' + mat.rawText).toLowerCase();
        
        let foundMatch = false;
        ENEM_CATALOG.forEach((area) => {
          area.disciplinas.forEach((disc) => {
            if (textLower.includes(disc.nome.toLowerCase())) {
              statsMap[disc.nome].count += 1;
              foundMatch = true;
            }
          });
        });

        if (!foundMatch) {
          // If title contains keywords like "matemática" or "física"
          if (textLower.includes('matemática') || textLower.includes('álgebra') || textLower.includes('geometria')) {
            statsMap['Matemática'].count += 1;
          } else if (textLower.includes('biologia') || textLower.includes('celular') || textLower.includes('ecologia')) {
            statsMap['Biologia'].count += 1;
          } else if (textLower.includes('física') || textLower.includes('mecânica') || textLower.includes('ohm')) {
            statsMap['Física'].count += 1;
          } else if (textLower.includes('química') || textLower.includes('ph') || textLower.includes('orgânica')) {
            statsMap['Química'].count += 1;
          } else if (textLower.includes('história') || textLower.includes('vargas') || textLower.includes('brasil')) {
            statsMap['História'].count += 1;
          } else if (textLower.includes('geografia') || textLower.includes('clima') || textLower.includes('cerrado')) {
            statsMap['Geografia'].count += 1;
          } else if (textLower.includes('redação') || textLower.includes('dissertativo')) {
            statsMap['Redação ENEM'].count += 1;
          } else if (textLower.includes('português') || textLower.includes('gramática')) {
            statsMap['Língua Portuguesa'].count += 1;
          }
        }
      });

      // Analyze tutor plans
      tutorPlans.forEach((plan) => {
        const matName = plan.materia;
        if (statsMap[matName]) {
          statsMap[matName].count += 2;
        } else {
          statsMap['Matemática'].count += 1;
        }
      });

      // Analyze quiz logs from IndexedDB
      quizLogs.forEach((log) => {
        if (statsMap[log.materia]) {
          statsMap[log.materia].totalQuestions += log.totalQuestoes;
          statsMap[log.materia].errCount += log.totalQuestoes - log.acertos;
        }
      });

      // Calculate total study interactions
      const totalEstudos = Object.values(statsMap).reduce((acc, curr) => acc + curr.count, 0);
      const totalErros = Object.values(statsMap).reduce((acc, curr) => acc + curr.errCount, 0);

      // Find subject with highest deficiency (lowest count OR highest error rate)
      let candidateMateria = 'Matemática';
      let minStudyScore = 9999;
      let reasonText = '';

      Object.entries(statsMap).forEach(([materiaName, data]) => {
        // Weighted score: fewer study sessions + penalty for error count
        const deficiencyScore = data.count * 2 - data.errCount * 3;
        if (deficiencyScore < minStudyScore) {
          minStudyScore = deficiencyScore;
          candidateMateria = materiaName;

          if (data.errCount > 0) {
            reasonText = `Você teve ${data.errCount} erros recentes registrados no banco de questões desta disciplina.`;
          } else if (data.count === 0) {
            reasonText = `Ainda não há resumos ou revisões registradas no seu histórico para esta disciplina.`;
          } else {
            reasonText = `Possui apenas ${data.count} resumos/estudos registrados nos últimos ciclos de estudo.`;
          }
        }
      });

      // Find the area & top topic for the recommended candidate materia from catalog
      let selectedArea = ENEM_CATALOG[0];
      let selectedDisc = selectedArea.disciplinas[0];

      let foundDisc = false;
      for (const area of ENEM_CATALOG) {
        for (const disc of area.disciplinas) {
          if (disc.nome.toLowerCase().includes(candidateMateria.toLowerCase()) || candidateMateria.toLowerCase().includes(disc.nome.toLowerCase())) {
            selectedArea = area;
            selectedDisc = disc;
            foundDisc = true;
            break;
          }
        }
        if (foundDisc) break;
      }

      // Find top topic with 'Mais Cai' priority
      const topTopic =
        selectedDisc.topicos.find((t) => t.incidencia === 'Mais Cai') ||
        selectedDisc.topicos[0];

      // Format final stats map
      const finalStats: { [materiaName: string]: { count: number; errCount: number; successRate: number } } = {};
      Object.entries(statsMap).forEach(([m, d]) => {
        const totalQ = d.totalQuestions || 1;
        const rate = Math.round(((totalQ - d.errCount) / totalQ) * 100);
        finalStats[m] = {
          count: d.count,
          errCount: d.errCount,
          successRate: rate
        };
      });

      // Strategic recommendation text
      const estrategia =
        topTopic.incidencia === 'Mais Cai'
          ? `O tópico "${topTopic.nome}" possui recorrência alta na prova TRI do ENEM. Focar 30 minutos neste assunto hoje vai elevar seu índice de acertos!`
          : `Revise a dica chave: "${topTopic.dicaChave}" para garantir pontos decisivos na prova.`;

      setDiagnostic({
        recommendedMateria: selectedDisc.nome,
        recommendedTopico: topTopic,
        areaSigla: selectedArea.sigla,
        areaGradient: selectedArea.gradient,
        motivoDefasagem: reasonText || 'Sugerido com base na incidência alta do edital do ENEM.',
        dicaEstrategica: estrategia,
        materiastats: finalStats,
        totalEstudos,
        totalErros
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao calcular diagnóstico de desempenho:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPerformanceAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-6 text-slate-300 animate-pulse flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-900/50" />
          <div className="space-y-2">
            <div className="w-48 h-4 bg-slate-800 rounded" />
            <div className="w-64 h-3 bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="w-24 h-8 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!diagnostic) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/90 border border-purple-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-white space-y-6"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Target className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Análise Inteligente de Histórico (IndexedDB)
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                {diagnostic.totalEstudos} Estudos Analisados
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white leading-tight">
              🎯 Dica do Dia baseada no seu desempenho
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleShareTip}
            className="text-xs font-extrabold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition cursor-pointer flex items-center space-x-1.5"
            title="Compartilhar Dica do Dia"
          >
            {shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Compartilhar</span>
              </>
            )}
          </button>

          <button
            onClick={runPerformanceAnalysis}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 transition cursor-pointer flex items-center space-x-1.5"
            title="Recalcular análise do histórico"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Main Recommendation Banner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Focus Box */}
        <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-amber-400" />
                <span>Foco Sugerido para Hoje:</span>
              </span>
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                🔥 {diagnostic.recommendedTopico.incidencia} no ENEM
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <h4 className="text-xl sm:text-2xl font-black text-amber-300">
                {diagnostic.recommendedMateria}
              </h4>
              <span className="text-xs font-bold text-slate-300">
                • {diagnostic.areaSigla}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-semibold text-slate-200">
              <span className="text-amber-400 font-bold block text-[11px] uppercase mb-0.5">
                📌 Tópico Prioritário: {diagnostic.recommendedTopico.nome}
              </span>
              <p className="text-slate-300 font-medium">
                {diagnostic.recommendedTopico.descricao}
              </p>
            </div>
          </div>

          {/* Diagnostic Reason */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
            <span className="font-bold text-amber-400 block text-[10px] uppercase flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Por que esta disciplina hoje?</span>
            </span>
            <p className="font-medium text-slate-200">
              {diagnostic.motivoDefasagem}
            </p>
          </div>
        </div>

        {/* Right Strategy Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 block mb-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Dica de Ouro TRI</span>
            </span>
            <p className="text-xs font-semibold text-white leading-relaxed bg-black/30 p-3 rounded-xl border border-white/10">
              "{diagnostic.recommendedTopico.dicaChave}"
            </p>
          </div>

          {/* Practical Application Example */}
          <div className="space-y-1 text-xs text-slate-300 font-medium">
            <span className="text-[10px] font-bold uppercase text-purple-400 block">
              💡 Dica de Estudo:
            </span>
            <p className="text-slate-300 line-clamp-3">
              {diagnostic.dicaEstrategica}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() =>
                onActionSelect(
                  diagnostic.recommendedMateria,
                  diagnostic.recommendedTopico.nome,
                  'flashcards'
                )
              }
              className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Resumo</span>
            </button>

            <button
              onClick={() =>
                onActionSelect(
                  diagnostic.recommendedMateria,
                  diagnostic.recommendedTopico.nome,
                  'simulado'
                )
              }
              className="px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Questões</span>
            </button>

            <button
              onClick={handleShareTip}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-amber-300 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center space-x-1"
              title="Compartilhar Dica do Dia nas redes sociais"
            >
              {shareSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compartilhar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mini Performance Breakdown bar by Disciplines */}
      <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-amber-400">
            <PieChart className="w-4 h-4" />
            <span>Raio-X de Atividade por Disciplina</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Histórico Armazenado no Navegador
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {Object.entries(diagnostic.materiastats).slice(0, 8).map(([materiaName, stats]) => {
            const isTarget = materiaName === diagnostic.recommendedMateria;
            return (
              <div
                key={materiaName}
                className={`p-2 rounded-xl text-center border transition ${
                  isTarget
                    ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="text-[10px] font-extrabold truncate text-slate-300">
                  {materiaName}
                </div>
                <div
                  className={`text-xs font-black mt-0.5 ${
                    isTarget ? 'text-amber-400' : 'text-slate-100'
                  }`}
                >
                  {stats.count} {stats.count === 1 ? 'estudo' : 'estudos'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
