import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Check,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
  Target,
  Trophy,
  Award,
  X,
  Zap,
  FileText
} from 'lucide-react';
import { TutorPlan, UserProgressResponse } from '../types';
import { exportTutorPlanToPdf } from '../utils/pdfExport';
import { shuffleQuestionOptions } from '../utils/questionShuffle';

interface TutorPlanSectionProps {
  onGeneratePlan: (materia: string, serieAno: string, objetivo: string, tempoDisponivel: string) => void;
  isLoading: boolean;
  currentPlan: TutorPlan | null;
}

export const TutorPlanSection: React.FC<TutorPlanSectionProps> = ({
  onGeneratePlan,
  isLoading,
  currentPlan,
}) => {
  const [materia, setMateria] = useState('');
  const [serieAno, setSerieAno] = useState('');
  const [objetivo, setObjetivo] = useState('ENEM');
  const [tempoDisponivel, setTempoDisponivel] = useState('30 minutos');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [progressData, setProgressData] = useState<UserProgressResponse | null>(null);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [currentXp, setCurrentXp] = useState(1450);
  const [streakCount, setStreakCount] = useState(9);

  // Dynamic shuffle for tutor plan questions
  const shuffledPlanQuestions = useMemo(() => {
    if (!currentPlan?.questoes) return [];
    return currentPlan.questoes.map((q) => {
      const shuffled = shuffleQuestionOptions(q.opcoes, q.respostaCorreta);
      return {
        ...q,
        shuffledOptions: shuffled.options,
        shuffledCorrectText: shuffled.correctOptionWithPrefix,
        shuffledCorrectRaw: shuffled.correctRawText,
        correctIndex: shuffled.correctIndex,
      };
    });
  }, [currentPlan]);

  // Reset selections when a new plan is loaded
  useEffect(() => {
    setSelectedAnswers({});
    setRevealedAnswers({});
  }, [currentPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materia.trim() || isLoading) return;
    onGeneratePlan(materia, serieAno, objetivo, tempoDisponivel);
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSelectOption = async (questionIdx: number, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: option }));
    
    // Automatically call progress update API
    try {
      setIsUpdatingProgress(true);
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'responder_questao',
          acertosSeguidos: streakCount,
          xpAtual: currentXp,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProgressData(data.data);
        if (data.data.novo_total_xp) {
          setCurrentXp(data.data.novo_total_xp);
        }
        setStreakCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Erro ao registrar progresso do usuário:', err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleCompleteCycle = async () => {
    try {
      setIsUpdatingProgress(true);
      const res = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'concluir_ciclo',
          acertosSeguidos: streakCount,
          xpAtual: currentXp,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProgressData(data.data);
        if (data.data.novo_total_xp) {
          setCurrentXp(data.data.novo_total_xp);
        }
      }
    } catch (err) {
      console.error('Erro ao concluir ciclo de estudo:', err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const quickMaterias = [
    'Matemática (Geometria)',
    'Biologia (Genética)',
    'História do Brasil',
    'Física (Cinemática)',
    'Química (Tabela Periódica)',
    'Português (Gramática)',
  ];

  return (
    <div className="space-y-8">
      {/* Input Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Coach e Tutor Pessoal de Estudos
          </h2>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
          Preencha seus dados de estudo para gerar um cronograma personalizado por etapas, aula didática e questões com gabarito!
        </p>

        {/* Quick Materia Chips */}
        <div className="mb-6">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Ou escolha uma matéria de exemplo:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickMaterias.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMateria(m)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  materia === m
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Matéria / Conteúdo *
            </label>
            <input
              type="text"
              required
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              placeholder="Ex: Física - Leis de Newton, Matemática - Equações 2º Grau"
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Série / Ano de Ensino
            </label>
            <input
              type="text"
              value={serieAno}
              onChange={(e) => setSerieAno(e.target.value)}
              placeholder="Ex: 3º Ano do Ensino Médio, 9º Ano, Faculdade..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Objetivo Principal *
            </label>
            <select
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              <option value="ENEM">ENEM</option>
              <option value="Vestibular">Vestibular (FUVEST, UNICAMP, etc.)</option>
              <option value="Prova Escolar">Prova da Escola / Colégio</option>
              <option value="Concurso Público">Concurso Público</option>
              <option value="Aprender por Curiosidade">Aprender por Curiosidade</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tempo Disponível por Dia *
            </label>
            <select
              value={tempoDisponivel}
              onChange={(e) => setTempoDisponivel(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              <option value="15 minutos">15 minutos (Rápido)</option>
              <option value="30 minutos">30 minutos (Recomendado)</option>
              <option value="45 minutos">45 minutos (Aprofundado)</option>
              <option value="1 hora">1 hora (Completo)</option>
              <option value="2 horas">2 horas (Intensivo)</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!materia.trim() || isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all cursor-pointer ${
                !materia.trim() || isLoading
                  ? 'bg-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200 dark:shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Montando Seu Cronograma e Aula...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Gerar Cronograma & Aula do Tutor</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Plan Output Display */}
      {currentPlan && (
        <div className="space-y-6">
          {/* Header Badge */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:px-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Plano Personalizado: {currentPlan.materia}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Foco: {currentPlan.objetivo} • Tempo: {currentPlan.tempoDisponivel} por dia
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => exportTutorPlanToPdf(currentPlan)}
                className="bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                title="Exportar cronograma, aula e questões para PDF impresso"
              >
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Exportar PDF</span>
              </button>

              <button
                onClick={handleCompleteCycle}
                disabled={isUpdatingProgress}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
              >
                <CheckCircle className="w-4 h-4 text-emerald-200" />
                <span>Concluir Ciclo (+100 XP)</span>
              </button>
            </div>
          </div>

          {/* Bento Grid layout for plan */}
          <div className="grid grid-cols-12 gap-6">
            {/* 1. 📅 Cronograma Sugerido (col-span-12 lg:col-span-5) */}
            <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                    📅 Cronograma Sugerido
                  </h2>
                </div>

                <div className="space-y-4">
                  {currentPlan.cronograma.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100/80 dark:border-slate-800 flex items-start space-x-3"
                    >
                      <span className="bg-indigo-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shrink-0">
                        {item.duracao}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.etapa}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Ritmado em blocos curtos</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Produtividade Máxima</span>
              </div>
            </div>

            {/* 2. 📚 Aula e Resumo Prático (col-span-12 lg:col-span-7) */}
            <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    📚 Aula e Resumo Prático (Primeiro Tópico)
                  </h2>
                </div>

                <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100/60 dark:border-emerald-800/40 leading-relaxed text-sm text-slate-800 dark:text-slate-200 space-y-3">
                  {currentPlan.aulaResumo.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="font-medium text-slate-700 dark:text-slate-200">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Conceito essencial direto ao ponto</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Didática Sem Complicação</span>
              </div>
            </div>

            {/* 3. 📝 3 Questões Práticas & Gabarito Comentado (col-span-12) */}
            <div className="col-span-12 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                    📝 3 Questões Práticas no Estilo {currentPlan.objetivo}
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  Responda para ganhar XP e desbloquear conquistas!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {shuffledPlanQuestions.map((q, idx) => {
                  const isRevealed = !!revealedAnswers[idx];
                  const selectedOpt = selectedAnswers[idx];

                  return (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                            Questão #{idx + 1}
                          </span>
                          {selectedOpt && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Respondida (+50 XP)</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug mb-3">
                          {q.pergunta}
                        </p>

                        {q.shuffledOptions && q.shuffledOptions.length > 0 && (
                          <div className="space-y-1.5 mb-4">
                            {q.shuffledOptions.map((opt, oIdx) => {
                              const isSelected = selectedOpt === opt;
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleSelectOption(idx, opt)}
                                  className={`w-full text-left text-xs p-2.5 rounded-xl border font-medium transition cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => toggleAnswer(idx)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                            isRevealed
                              ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'Ocultar Gabarito' : 'Ver Gabarito Comentado'}</span>
                        </button>

                        {isRevealed && (
                          <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1 text-slate-800 dark:text-slate-200">
                            <p className="font-bold text-emerald-700 dark:text-emerald-400">
                              ✅ Correta: {q.shuffledCorrectText || q.respostaCorreta}
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                              {q.explicacaoGabarito}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Gabarito Comentado */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-indigo-700 dark:text-indigo-400 block">
                  ✅ Visão Geral & Gabarito Comentado pelo Tutor:
                </span>
                <p className="leading-relaxed font-medium">
                  {currentPlan.gabaritoComentado}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAMIFICATION / PROGRESS & ACHIEVEMENTS MODAL */}
      <AnimatePresence>
        {progressData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 text-white border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Top Accent Light */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
                    {progressData.conquista_desbloqueada?.icone || '🎯'}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      Atualização de Progresso
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {progressData.conquista_desbloqueada?.teve_desbloqueio
                        ? `Conquista: ${progressData.conquista_desbloqueada.titulo}`
                        : 'XP Adicionado ao Perfil!'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setProgressData(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Incentive Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 to-purple-950 border border-indigo-800/60 text-xs text-indigo-100 font-medium leading-relaxed">
                <p className="font-bold text-amber-300 text-sm mb-1">
                  ⚡ {progressData.mensagem_incentivo}
                </p>
                {progressData.conquista_desbloqueada?.teve_desbloqueio && (
                  <p className="text-slate-300 pt-1">
                    "{progressData.conquista_desbloqueada.descricao}"
                  </p>
                )}
              </div>

              {/* XP Stats Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">XP Ganho</span>
                  <span className="text-xl font-black text-amber-400">+{progressData.xp_ganho} XP</span>
                </div>

                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 text-center">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Novo Total XP</span>
                  <span className="text-xl font-black text-emerald-400">{progressData.novo_total_xp} XP</span>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => setProgressData(null)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                Continuar Estudando
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
