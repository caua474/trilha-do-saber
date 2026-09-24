import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as db from '../utils/db';
import { shuffleQuestionOptions, prepareQuestionsWithFullShuffle } from '../utils/questionShuffle';
import { generateSimuladoTri, evaluateSimuladoTri } from '../services/geminiService';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BarChart3,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Check,
  Zap,
  BookOpen,
  Shuffle,
  Clock,
  Play,
  Pause,
  Timer,
  Volume2
} from 'lucide-react';

interface QuestionTRI {
  id: number;
  dificuldade: 'Fácil' | 'Média' | 'Difícil';
  enunciado: string;
  opcoes: string[];
  resposta_correta_index: number;
  explicacao: string;
}

interface EvaluationTRI {
  nota_oficial_estimada: number;
  total_acertos: number;
  total_questoes: number;
  desempenho_dificuldade: {
    faceis: { acertos: number; total: number };
    medias: { acertos: number; total: number };
    dificeis: { acertos: number; total: number };
  };
  coerencia_pedagogica: {
    status: string;
    descricao: string;
  };
  conselho_estrategico: string;
}

const SAMPLE_AREAS = [
  'Matemática e suas Tecnologias',
  'Ciências da Natureza (Física, Química, Biologia)',
  'Ciências Humanas (História, Geografia, Filosofia)',
  'Linguagens e Códigos',
];

const PRESET_SIMULADO: QuestionTRI[] = [
  {
    id: 1,
    dificuldade: 'Fácil',
    enunciado: 'Um estudante deseja calcular a velocidade média de um ônibus que percorreu 180 km em exatamente 3 horas. Qual a velocidade média do ônibus?',
    opcoes: [
      'A) 50 km/h',
      'B) 60 km/h',
      'C) 70 km/h',
      'D) 90 km/h',
      'E) 120 km/h',
    ],
    resposta_correta_index: 1,
    explicacao: 'Velocidade Média = Distância / Tempo = 180 km / 3 h = 60 km/h.',
  },
  {
    id: 2,
    dificuldade: 'Fácil',
    enunciado: 'Na Biologia Celular, qual organela é amplamente reconhecida como a "usina de energia" da célula por sintetizar ATP através da respiração celular?',
    opcoes: [
      'A) Ribossomo',
      'B) Complexo de Golgi',
      'C) Mitocôndria',
      'D) Lisossomo',
      'E) Retículo Endoplasmático Liso',
    ],
    resposta_correta_index: 2,
    explicacao: 'A mitocôndria é responsável pela respiração celular aeróbica e produção da molécula energética ATP.',
  },
  {
    id: 3,
    dificuldade: 'Média',
    enunciado: 'Durante a Era Vargas (1930-1945), o Estado Novo (1937-1945) se caracterizou por forte centralização política e criação do DIP (Departamento de Imprensa e Propaganda). Qual era o principal objetivo do DIP?',
    opcoes: [
      'A) Promover eleições diretas e incentivar a liberdade de imprensa.',
      'B) Controlar a censura nos meios de comunicação e construir a propaganda ideológica do regime.',
      'C) Financiar apenas jornais estrangeiros de oposição.',
      'D) Organizar os sindicatos operários de forma autônoma e descentralizada.',
      'E) Acabar com o culto à personalidade de Getúlio Vargas.',
    ],
    resposta_correta_index: 1,
    explicacao: 'O DIP exercia a censura e produzia a propaganda oficial do regime autoritário do Estado Novo.',
  },
  {
    id: 4,
    dificuldade: 'Média',
    enunciado: 'Um investidor aplicou R$ 1.000,00 a juros simples a uma taxa de 2% ao mês durante 5 meses. Qual o montante final resgatado pelo investidor?',
    opcoes: [
      'A) R$ 1.050,00',
      'B) R$ 1.080,00',
      'C) R$ 1.100,00',
      'D) R$ 1.120,00',
      'E) R$ 1.200,00',
    ],
    resposta_correta_index: 2,
    explicacao: 'Juros = P * i * t = 1000 * 0,02 * 5 = R$ 100,00. Montante = 1000 + 100 = R$ 1.100,00.',
  },
  {
    id: 5,
    dificuldade: 'Difícil',
    enunciado: 'Em uma reação química reversível em equilíbrio A + B ⇌ C + D, se aumentarmos a concentração do reagente A, o que acontece com a posição do equilíbrio segundo o Princípio de Le Chatelier?',
    opcoes: [
      'A) O equilíbrio se desloca no sentido direto (formação de produtos C e D).',
      'B) O equilíbrio se desloca no sentido inverso (formação de reagentes A e B).',
      'C) A constante de equilíbrio K c aumenta significativamente.',
      'D) A reação para imediatamente.',
      'E) O equilíbrio não sofre qualquer alteração.',
    ],
    resposta_correta_index: 0,
    explicacao: 'Ao aumentar a concentração de um reagente, o sistema se desloca no sentido de consumi-lo (sentido direto, formando mais produtos C e D).',
  },
  {
    id: 6,
    dificuldade: 'Difícil',
    enunciado: 'Um projétil é lançado obliquamente com velocidade v₀ sob um ângulo de 45° em relação à horizontal em um local onde a aceleração da gravidade é g. Desprezando o atrito do ar, qual a relação entre o alcance máximo horizontal e a altura máxima atingida?',
    opcoes: [
      'A) O alcance horizontal é 2 vezes a altura máxima.',
      'B) O alcance horizontal é 4 vezes a altura máxima.',
      'C) O alcance horizontal é igual à altura máxima.',
      'D) O alcance horizontal é a metade da altura máxima.',
      'E) A relação depende da massa do projétil.',
    ],
    resposta_correta_index: 1,
    explicacao: 'Para lançamento a 45°, Alcance = (v₀² sin 90°)/g = v₀²/g. Altura máx = (v₀² sin² 45°)/(2g) = v₀²/(4g). Logo, Alcance = 4 * H_máx.',
  },
];

const prepareQuestionsWithShuffle = (list: QuestionTRI[]): QuestionTRI[] => {
  return prepareQuestionsWithFullShuffle(list, {
    randomizeListOrder: true,
    randomizeStart: true,
    shuffleOptions: true,
  });
};

export const SimuladoTriSection: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState<string>(SAMPLE_AREAS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [questoes, setQuestoes] = useState<QuestionTRI[]>(() => prepareQuestionsWithShuffle(PRESET_SIMULADO));
  const [respostasAluno, setRespostasAluno] = useState<{ [key: number]: number }>({});
  const [resultadoTRI, setResultadoTRI] = useState<EvaluationTRI | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cronômetro Oficial ENEM (3 minutos por questão = ritmo oficial do exame)
  const SECONDS_PER_QUESTION = 180;
  const [totalTimerDuration, setTotalTimerDuration] = useState<number>(PRESET_SIMULADO.length * SECONDS_PER_QUESTION);
  const [timeLeft, setTimeLeft] = useState<number>(PRESET_SIMULADO.length * SECONDS_PER_QUESTION);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Efeito do Cronômetro Oficial
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0 && !resultadoTRI && !isLoading) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, resultadoTRI, isLoading]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReshuffleQuestions = () => {
    setQuestoes((prev) => prepareQuestionsWithShuffle(prev));
    setRespostasAluno({});
    setResultadoTRI(null);
    const dur = questoes.length * SECONDS_PER_QUESTION;
    setTotalTimerDuration(dur);
    setTimeLeft(dur);
    setIsTimerActive(true);
  };

  const handleGenerateSimulado = async (areaName: string) => {
    setSelectedArea(areaName);
    setIsLoading(true);
    setError(null);
    setResultadoTRI(null);
    setRespostasAluno({});

    try {
      const data = await generateSimuladoTri({ area: areaName });
      const questoesArray = data?.questoes || data?.data?.questoes;
      if (Array.isArray(questoesArray) && questoesArray.length > 0) {
        const qList = prepareQuestionsWithShuffle(questoesArray);
        setQuestoes(qList);
        const dur = qList.length * SECONDS_PER_QUESTION;
        setTotalTimerDuration(dur);
        setTimeLeft(dur);
      } else {
        const qList = prepareQuestionsWithShuffle(PRESET_SIMULADO);
        setQuestoes(qList);
        const dur = qList.length * SECONDS_PER_QUESTION;
        setTotalTimerDuration(dur);
        setTimeLeft(dur);
      }
      setIsTimerActive(true);
    } catch (err: any) {
      console.error('Erro ao gerar simulado TRI:', err);
      const qList = prepareQuestionsWithShuffle(PRESET_SIMULADO);
      setQuestoes(qList);
      const dur = qList.length * SECONDS_PER_QUESTION;
      setTotalTimerDuration(dur);
      setTimeLeft(dur);
      setIsTimerActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (questaoId: number, opcaoIndex: number) => {
    if (resultadoTRI) return; // Locked after submission
    setRespostasAluno((prev) => ({
      ...prev,
      [questaoId]: opcaoIndex,
    }));
  };

  const handleCalculateTRI = async () => {
    const respondidasCount = Object.keys(respostasAluno).length;
    if (respondidasCount < questoes.length) {
      if (!confirm(`Você respondeu ${respondidasCount} de ${questoes.length} questões. Deseja finalizar e calcular sua nota TRI mesmo assim?`)) {
        return;
      }
    }

    setIsEvaluating(true);
    setIsTimerActive(false); // Pausa cronômetro na entrega
    setError(null);

    // Prepare payload for TRI evaluation
    const arrayRespostas = questoes.map((q) => {
      const selectedIndex = respostasAluno[q.id];
      const acertou = selectedIndex === q.resposta_correta_index;
      return {
        id: q.id,
        dificuldade: q.dificuldade,
        acertou,
      };
    });

    try {
      const data = await evaluateSimuladoTri({
        area: selectedArea,
        respostas: arrayRespostas,
      });

      const triResult = data?.data || data;
      setResultadoTRI(triResult);

      // Save to IndexedDB for performance tracking
      db.saveQuizResult({
        id: 'simulado_' + Date.now(),
        materia: selectedArea,
        topico: 'Simulado TRI de ' + selectedArea,
        acertos: triResult.total_acertos,
        totalQuestoes: triResult.total_questoes,
        porcentagem: Math.round((triResult.total_acertos / (triResult.total_questoes || 1)) * 100),
        createdAt: new Date().toISOString()
      }).catch(err => console.error('Erro ao salvar no IndexedDB:', err));
    } catch (err: any) {
      console.error('Erro na avaliação TRI:', err);
      setError(err.message || 'Erro ao processar modelo TRI.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRestart = () => {
    setResultadoTRI(null);
    setRespostasAluno({});
    const qList = prepareQuestionsWithShuffle(questoes);
    setQuestoes(qList);
    const dur = qList.length * SECONDS_PER_QUESTION;
    setTotalTimerDuration(dur);
    setTimeLeft(dur);
    setIsTimerActive(true);
  };

  const getDifficultyBadge = (dif: string) => {
    if (dif.includes('Fác') || dif.includes('Fac')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    if (dif.includes('Méd') || dif.includes('Med')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
  };

  return (
    <div className="space-y-8">
      {/* Banner Intro */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Motor PRO nº 2
              </span>
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Modelo Estatístico TRI (ENEM)
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Simulados com Nota TRI Estimada & Coerência
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          A TRI avalia não apenas a quantidade de acertos, mas a <strong>coerência pedagógica</strong> entre questões fáceis, médias e difíceis para calcular sua nota oficial.
        </p>
      </div>

      {/* Select Area Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Área do Conhecimento:
          </span>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {SAMPLE_AREAS.map((area) => (
            <button
              key={area}
              onClick={() => handleGenerateSimulado(area)}
              disabled={isLoading || isEvaluating}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                selectedArea === area
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {area}
            </button>
          ))}
          <button
            onClick={handleReshuffleQuestions}
            disabled={isLoading || isEvaluating}
            title="Embaralhar ordem das questões e alternar ponto de início"
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Misturar & Novo Início</span>
          </button>
        </div>
      </div>

      {/* Main Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Questions List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cronômetro Oficial ENEM Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                  timeLeft <= 180 ? 'bg-rose-500 animate-pulse' : timeLeft <= 420 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}>
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Cronômetro Oficial ENEM
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      3 min / questão
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black font-mono tracking-tight ${
                      timeLeft <= 180 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatTimer(timeLeft)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      ({Object.keys(respostasAluno).length} de {questoes.length} preenchidas)
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles do Cronômetro */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  disabled={!!resultadoTRI}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                    isTimerActive
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                  }`}
                  title={isTimerActive ? 'Pausar Cronômetro' : 'Continuar Cronômetro'}
                >
                  {isTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerActive ? 'Pausar' : 'Iniciar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeLeft((prev) => prev + 300);
                    setTotalTimerDuration((prev) => prev + 300);
                  }}
                  disabled={!!resultadoTRI}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Adicionar 5 minutos ao tempo"
                >
                  +5m
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dur = questoes.length * SECONDS_PER_QUESTION;
                    setTimeLeft(dur);
                    setTotalTimerDuration(dur);
                    setIsTimerActive(true);
                  }}
                  disabled={!!resultadoTRI}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Reiniciar Cronômetro"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Barra de Progresso do Tempo Restante */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  timeLeft <= 180 ? 'bg-rose-500' : timeLeft <= 420 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, (timeLeft / (totalTimerDuration || 1)) * 100)}%` }}
              />
            </div>

            {timeLeft === 0 && !resultadoTRI && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Tempo oficial expirado! Conclua o preenchimento para receber sua nota.
                </span>
                <button
                  type="button"
                  onClick={handleCalculateTRI}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-black transition cursor-pointer"
                >
                  Finalizar Agora
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Gerando Simulado Inédito TRI no Modelo ENEM...
              </p>
              <p className="text-xs text-slate-500">
                Classificando questões por padrão de peso e dificuldade.
              </p>
            </div>
          ) : (
            questoes.map((q, qIndex) => {
              const selectedOpt = respostasAluno[q.id];
              const isLocked = !!resultadoTRI;
              const isCorrect = selectedOpt === q.resposta_correta_index;

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-black flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Questão {q.id}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getDifficultyBadge(
                        q.dificuldade
                      )}`}
                    >
                      Dificuldade: {q.dificuldade}
                    </span>
                  </div>

                  {/* Enunciado */}
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                    {q.enunciado}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {q.opcoes.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      const isOptionRight = q.resposta_correta_index === optIdx;

                      let btnStyle =
                        'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80';

                      if (isOptionSelected) {
                        btnStyle =
                          'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20';
                      }

                      if (isLocked) {
                        if (isOptionRight) {
                          btnStyle =
                            'bg-emerald-500 text-white border-emerald-500 font-bold';
                        } else if (isOptionSelected && !isOptionRight) {
                          btnStyle =
                            'bg-rose-500 text-white border-rose-500 font-bold opacity-80';
                        } else {
                          btnStyle =
                            'bg-slate-100 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isLocked}
                          onClick={() => handleOptionSelect(q.id, optIdx)}
                          className={`w-full p-3.5 rounded-2xl border text-xs font-medium text-left transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isLocked && isOptionRight && (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                          )}
                          {isLocked && isOptionSelected && !isOptionRight && (
                            <XCircle className="w-4 h-4 shrink-0 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isLocked && (
                    <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <strong className="text-amber-600 dark:text-amber-400 font-bold block">
                        💡 Explicação Gabarito:
                      </strong>
                      <p>{q.explicacao}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            {resultadoTRI ? (
              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase flex items-center space-x-2 hover:bg-slate-800 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refazer Simulado</span>
              </button>
            ) : (
              <button
                onClick={handleCalculateTRI}
                disabled={isEvaluating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Calculando Padrão TRI do ENEM...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    <span>Finalizar & Calcular Nota TRI Oficial</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right 4 Columns: TRI Score Results Panel */}
        <div className="lg:col-span-4">
          {resultadoTRI ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 sticky top-24"
            >
              {/* Score Display Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-amber-500/30 text-center space-y-3 relative overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Resultado TRI Oficial Estimado
                </span>

                <div className="text-5xl font-black text-amber-400 tracking-tight">
                  {resultadoTRI.nota_oficial_estimada}
                </div>

                <div className="text-xs text-slate-300 font-bold bg-white/10 py-1 px-3 rounded-full inline-block">
                  {resultadoTRI.total_acertos} de {resultadoTRI.total_questoes} questões acertadas
                </div>

                <div className="pt-2 border-t border-white/10 text-left space-y-2">
                  <div className="text-[10px] uppercase font-bold text-amber-300">
                    Coerência Pedagógica TRI:
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-semibold leading-relaxed">
                    <strong className="text-emerald-400 font-bold block mb-1">
                      {resultadoTRI.coerencia_pedagogica?.status}
                    </strong>
                    <span>{resultadoTRI.coerencia_pedagogica?.descricao}</span>
                  </div>
                </div>
              </div>

              {/* Performance by Difficulty */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Desempenho por Dificuldade</span>
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Fáceis */}
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      🟢 Questões Fáceis
                    </span>
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                      {resultadoTRI.desempenho_dificuldade?.faceis?.acertos} /{' '}
                      {resultadoTRI.desempenho_dificuldade?.faceis?.total}
                    </span>
                  </div>

                  {/* Médias */}
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      🟡 Questões Médias
                    </span>
                    <span className="font-extrabold text-amber-800 dark:text-amber-300">
                      {resultadoTRI.desempenho_dificuldade?.medias?.acertos} /{' '}
                      {resultadoTRI.desempenho_dificuldade?.medias?.total}
                    </span>
                  </div>

                  {/* Difíceis */}
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                    <span className="font-bold text-rose-900 dark:text-rose-200">
                      🔴 Questões Difíceis
                    </span>
                    <span className="font-extrabold text-rose-800 dark:text-rose-300">
                      {resultadoTRI.desempenho_dificuldade?.dificeis?.acertos} /{' '}
                      {resultadoTRI.desempenho_dificuldade?.dificeis?.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Projeção de Cortes SISU */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Projeção de Cortes SISU (Estimativa TRI)</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Ampla Concorrência (600 pts)</span>
                      <span className={resultadoTRI.nota_oficial_estimada >= 600 ? 'text-emerald-500' : 'text-slate-400'}>
                        {resultadoTRI.nota_oficial_estimada >= 600 ? '✓ Aprovado' : 'Atingir'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (resultadoTRI.nota_oficial_estimada / 600) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Direito / Engenharias (720 pts)</span>
                      <span className={resultadoTRI.nota_oficial_estimada >= 720 ? 'text-emerald-500' : 'text-amber-500'}>
                        {resultadoTRI.nota_oficial_estimada >= 720 ? '✓ Competitivo' : 'Faltam ' + Math.max(0, 720 - resultadoTRI.nota_oficial_estimada) + ' pts'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (resultadoTRI.nota_oficial_estimada / 720) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">Medicina / Top Federais (790 pts)</span>
                      <span className={resultadoTRI.nota_oficial_estimada >= 790 ? 'text-emerald-500' : 'text-rose-500'}>
                        {resultadoTRI.nota_oficial_estimada >= 790 ? '✓ Excelência Top 1%' : 'Faltam ' + Math.max(0, 790 - resultadoTRI.nota_oficial_estimada) + ' pts'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (resultadoTRI.nota_oficial_estimada / 790) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Conselho Estratégico */}
              <div className="bg-amber-500 text-slate-950 rounded-3xl p-5 shadow-sm space-y-2">
                <h5 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-slate-950" />
                  <span>Conselho Estratégico de Estudo</span>
                </h5>
                <p className="text-xs font-semibold leading-relaxed">
                  {resultadoTRI.conselho_estrategico}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-6 text-center space-y-3 sticky top-24">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mx-auto">
                📊
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Calculadora TRI
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Responda às questões ao lado e clique em <strong>Finalizar & Calcular Nota TRI Oficial</strong> para receber a separação por dificuldade, coerência e conselho estratégico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
