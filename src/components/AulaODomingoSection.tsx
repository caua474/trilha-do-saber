import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Clock,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Award,
  Sparkles,
  BarChart2,
  Flame,
  Zap,
  Globe
} from 'lucide-react';
import { shuffleQuestionOptions } from '../utils/questionShuffle';

interface QuestionSimulado {
  id: number;
  area: string;
  enunciado: string;
  opcoes: string[];
  correta: number;
}

const AULAO_QUESTIONS: QuestionSimulado[] = [
  {
    id: 1,
    area: 'Matemática',
    enunciado: 'Em uma fábrica, 8 operários produzem 120 peças em 5 dias. Quantas peças serão produzidas por 12 operários em 8 dias?',
    opcoes: ['A) 240 peças', 'B) 288 peças', 'C) 300 peças', 'D) 320 peças', 'E) 360 peças'],
    correta: 1, // 288
  },
  {
    id: 2,
    area: 'Física',
    enunciado: 'Qual a potência consumida por um chuveiro elétrico ligado em 220 V que é percorrido por uma corrente de 20 A?',
    opcoes: ['A) 2200 W', 'B) 3300 W', 'C) 4400 W', 'D) 5500 W', 'E) 6600 W'],
    correta: 2, // 4400 W
  },
  {
    id: 3,
    area: 'Química',
    enunciado: 'Qual o valor do pH de uma solução aquosa neutra a 25 °C?',
    opcoes: ['A) 0', 'B) 5', 'C) 7', 'D) 10', 'E) 14'],
    correta: 2, // 7
  },
  {
    id: 4,
    area: 'Biologia',
    enunciado: 'Qual o processo celular em que uma célula diplomátera se divide produzindo 4 células haploides?',
    opcoes: ['A) Mitose', 'B) Meiose', 'C) Citocinese', 'D) Apoptose', 'E) Fissão Binária'],
    correta: 1, // Meiose
  },
  {
    id: 5,
    area: 'História',
    enunciado: 'Em que ano foi promulgada a atual Constituição da República Federativa do Brasil, conhecida como "Constituição Cidadã"?',
    opcoes: ['A) 1934', 'B) 1964', 'C) 1985', 'D) 1988', 'E) 1992'],
    correta: 3, // 1988
  },
];

const shuffleAulaoQuestions = (): QuestionSimulado[] => {
  return AULAO_QUESTIONS.map((q) => {
    const shuffled = shuffleQuestionOptions(q.opcoes, q.correta);
    return {
      ...q,
      opcoes: shuffled.options,
      correta: shuffled.correctIndex,
    };
  });
};

const CANDIDATOS_RANKING = [
  { posicao: 1, nome: 'Lucas Mendonça (SP)', pontuacao: 980.5, acertos: '5/5', estado: '🟢 São Paulo' },
  { posicao: 2, nome: 'Beatriz Vasconcelos (RJ)', pontuacao: 965.0, acertos: '5/5', estado: '🔵 Rio de Janeiro' },
  { posicao: 3, nome: 'Matheus Oliveira (MG)', pontuacao: 942.0, acertos: '5/5', estado: '🔴 Minas Gerais' },
  { posicao: 4, nome: 'Você (GabaritaAí Student)', pontuacao: 0, acertos: '0/5', estado: '⚡ Seu Desempenho' },
  { posicao: 5, nome: 'Camila Ferreira (CE)', pontuacao: 880.0, acertos: '4/5', estado: '🟡 Ceará' },
  { posicao: 6, nome: 'Gabriel Santos (PR)', pontuacao: 855.5, acertos: '4/5', estado: '🟢 Paraná' },
];

export const AulaODomingoSection: React.FC = () => {
  const [activeQuestions, setActiveQuestions] = useState<QuestionSimulado[]>(() => shuffleAulaoQuestions());
  const [iniciado, setIniciado] = useState<boolean>(false);
  const [questaoAtualIndex, setQuestaoAtualIndex] = useState<number>(0);
  const [respostas, setRespostas] = useState<{ [key: number]: number }>({});
  const [finalizado, setFinalizado] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ dias: number; horas: number; minutos: number; segundos: number }>({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  const handleStartSimulado = () => {
    setActiveQuestions(shuffleAulaoQuestions());
    setIniciado(true);
    setQuestaoAtualIndex(0);
    setRespostas({});
    setFinalizado(false);
  };

  // Calculate countdown to next Sunday at 13:00
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7));
      nextSunday.setHours(13, 0, 0, 0);

      if (nextSunday.getTime() <= now.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const diff = nextSunday.getTime() - now.getTime();
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diff / (1000 * 60)) % 60);
      const segundos = Math.floor((diff / 1000) % 60);

      setTimeLeft({ dias, horas, minutos, segundos });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectOpcao = (opcaoIndex: number) => {
    setRespostas((prev) => ({
      ...prev,
      [AULAO_QUESTIONS[questaoAtualIndex].id]: opcaoIndex,
    }));
  };

  const handleProximaQuestao = () => {
    if (questaoAtualIndex < AULAO_QUESTIONS.length - 1) {
      setQuestaoAtualIndex((prev) => prev + 1);
    } else {
      setFinalizado(true);
    }
  };

  const calculateScore = () => {
    let acertosCount = 0;
    AULAO_QUESTIONS.forEach((q) => {
      if (respostas[q.id] === q.correta) {
        acertosCount++;
      }
    });

    const nota = Math.round(350 + (acertosCount / AULAO_QUESTIONS.length) * 610);
    return { acertosCount, nota };
  };

  const { acertosCount, nota } = calculateScore();

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-purple-950 border border-red-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-black flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-rose-500 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full tracking-wider animate-bounce">
                🔴 Ao Vivo
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Simulado Nacional nº 3
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Simulado Aulão de Domingo (Ao Vivo)
            </h2>
          </div>
        </div>

        {/* Live Timer Clock */}
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3 px-5 flex items-center space-x-3 text-center">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex items-center space-x-2 text-xs font-black text-amber-300">
            <div>
              <span className="text-base">{timeLeft.dias}d</span>
            </div>
            <span>:</span>
            <div>
              <span className="text-base">{String(timeLeft.horas).padStart(2, '0')}h</span>
            </div>
            <span>:</span>
            <div>
              <span className="text-base">{String(timeLeft.minutos).padStart(2, '0')}m</span>
            </div>
            <span>:</span>
            <div>
              <span className="text-base">{String(timeLeft.segundos).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!iniciado ? (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center text-3xl mx-auto shadow-xl">
            🏆
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-white">
              Pronto para encarar o Aulão Nacional do GabaritaAí?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Todos os domingos, às 13h, milhares de estudantes do Brasil inteiro realizam o mesmo simulado cronometrado. Ao terminar, você visualiza sua posição no <strong>Ranking Nacional em Tempo Real</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-black text-amber-400 block">⚡ 5 Questões Inéditas</span>
              <p className="text-[11px] text-slate-400">Seleção das matérias de maior peso no ENEM.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-black text-purple-400 block">📊 Algoritmo TRI</span>
              <p className="text-[11px] text-slate-400">Pontuação calculada pela Teoria de Resposta ao Item.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-black text-emerald-400 block">🇧🇷 Ranking Nacional</span>
              <p className="text-[11px] text-slate-400">Compare seu resultado com candidatos do país inteiro.</p>
            </div>
          </div>

          <button
            onClick={() => setIniciado(true)}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl transition transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2 mx-auto"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Iniciar Simulado Aulão de Domingo Agora</span>
          </button>
        </div>
      ) : !finalizado ? (
        <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Questão {questaoAtualIndex + 1} de {AULAO_QUESTIONS.length}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Matéria: {AULAO_QUESTIONS[questaoAtualIndex].area}
              </span>
            </div>

            <span className="text-xs font-extrabold text-rose-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Cronômetro Ativo</span>
            </span>
          </div>

          {/* Question Display */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white leading-relaxed">
              {AULAO_QUESTIONS[questaoAtualIndex].enunciado}
            </h3>

            <div className="space-y-2 pt-2">
              {AULAO_QUESTIONS[questaoAtualIndex].opcoes.map((opcao, idx) => {
                const isSelected = respostas[AULAO_QUESTIONS[questaoAtualIndex].id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOpcao(idx)}
                    className={`w-full p-4 rounded-2xl border text-xs font-semibold text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{opcao}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleProximaQuestao}
              disabled={respostas[AULAO_QUESTIONS[questaoAtualIndex].id] === undefined}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-2 shadow-lg"
            >
              <span>{questaoAtualIndex === AULAO_QUESTIONS.length - 1 ? 'Finalizar & Ver Ranking' : 'Próxima Questão'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Final Results & National Leaderboard */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Score Header */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-3xl mx-auto shadow-lg">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Resultado do Aulão Nacional
              </span>
              <h2 className="text-4xl font-black text-white">
                Nota TRI: {nota}
              </h2>
              <p className="text-xs text-slate-300 font-bold">
                Você acertou {acertosCount} de {AULAO_QUESTIONS.length} questões!
              </p>
            </div>
          </div>

          {/* Dynamic National Leaderboard */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Ranking Nacional em Tempo Real (Aulão de Domingo)
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                12.840 Candidatos Ativos
              </span>
            </div>

            <div className="space-y-2">
              {CANDIDATOS_RANKING.map((c, idx) => {
                const isUser = c.nome.includes('Você');
                const userScore = isUser ? nota : c.pontuacao;
                const userAcertos = isUser ? `${acertosCount}/5` : c.acertos;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition ${
                      isUser
                        ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-slate-950 font-black border-amber-400 shadow-lg scale-[1.02]'
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ${
                        c.posicao === 1 ? 'bg-amber-400 text-slate-950' : isUser ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{c.posicao}
                      </span>
                      <div>
                        <div className="font-extrabold">{isUser ? '⚡ Você (Seu Desempenho)' : c.nome}</div>
                        <div className="text-[10px] opacity-80">{c.estado}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm">{userScore} pts</div>
                      <div className="text-[10px] opacity-80">{userAcertos} acertos</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIniciado(false);
                setFinalizado(false);
                setQuestaoAtualIndex(0);
                setRespostas({});
              }}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refazer Simulado Aulão</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
