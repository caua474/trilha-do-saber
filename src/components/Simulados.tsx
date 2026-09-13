import React, { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle2, AlertTriangle, ArrowLeft, Award, RotateCcw, Zap } from 'lucide-react';

interface Prova {
  id: string;
  titulo: string;
  questoes: number;
  tempoMinutos: number;
  status: string;
  cor: string;
  badgeBg: string;
  disciplinas: string;
}

interface QuestaoSimulado {
  id: number;
  area: string;
  dificuldade: 'Fácil' | 'Média' | 'Difícil';
  enunciado: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

const PROVAS_LISTA: Prova[] = [
  {
    id: 'enem-2025-dia1',
    titulo: 'ENEM 2025 - Dia 1',
    questoes: 90,
    tempoMinutos: 330,
    status: 'Disponível',
    cor: 'border-indigo-500/50',
    badgeBg: 'bg-indigo-500/20 text-indigo-300',
    disciplinas: 'Linguagens, Códigos e Ciências Humanas + Redação',
  },
  {
    id: 'enem-2025-dia2',
    titulo: 'ENEM 2025 - Dia 2',
    questoes: 90,
    tempoMinutos: 300,
    status: 'Disponível',
    cor: 'border-indigo-500/50',
    badgeBg: 'bg-indigo-500/20 text-indigo-300',
    disciplinas: 'Matemática e Ciências da Natureza (Física, Química, Biologia)',
  },
  {
    id: 'simulado-exatas',
    titulo: 'Simulado Inédito - Exatas',
    questoes: 45,
    tempoMinutos: 150,
    status: 'Recomendado',
    cor: 'border-amber-500/50',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    disciplinas: 'Matemática, Física e Química Focada no Padrão TRI',
  },
];

const QUESTOES_EXATAS: QuestaoSimulado[] = [
  {
    id: 1,
    area: 'Matemática',
    dificuldade: 'Fácil',
    enunciado: 'Um reservatório cilíndrico tem capacidade de 10.000 litros e está com 35% de seu volume preenchido. Quantos litros de água faltam para enchê-lo completamente?',
    opcoes: ['3.500 litros', '6.500 litros', '7.000 litros', '5.500 litros', '6.000 litros'],
    correta: 1,
    explicacao: 'Volume restante = 100% - 35% = 65%. 65% de 10.000 = 0,65 × 10.000 = 6.500 litros.',
  },
  {
    id: 2,
    area: 'Física',
    dificuldade: 'Média',
    enunciado: 'Um automóvel trafega em linha reta com velocidade escalar constante de 72 km/h. Ao avistar um obstáculo, o motorista freia uniformemente até parar em 4 segundos. A distância percorrida durante a frenagem é de:',
    opcoes: ['80 m', '40 m', '20 m', '60 m', '100 m'],
    correta: 1,
    explicacao: 'v₀ = 72 km/h = 20 m/s, v = 0, t = 4 s. ΔS = ((v₀ + v) / 2) × t = ((20 + 0) / 2) × 4 = 10 × 4 = 40 metros.',
  },
  {
    id: 3,
    area: 'Química',
    dificuldade: 'Média',
    enunciado: 'A combustão completa do gás metano (CH₄) em presença de oxigênio em excesso produz exclusivamente:',
    opcoes: [
      'Monóxido de carbono e água.',
      'Dióxido de carbono e vapor de água.',
      'Carbono sólido (fuligem) e hidrogênio gasoso.',
      'Ácido carbônico e gás oxigênio.',
      'Metanol e gás ozônio.',
    ],
    correta: 1,
    explicacao: 'Equação balanceada: CH₄(g) + 2 O₂(g) → CO₂(g) + 2 H₂O(g). Combustão completa produz CO₂ e H₂O.',
  },
  {
    id: 4,
    area: 'Matemática',
    dificuldade: 'Difícil',
    enunciado: 'Em uma progressão geométrica crescente com 5 termos positivos, o primeiro termo é 2 e o quinto termo é 162. A soma de todos os termos dessa progressão é:',
    opcoes: ['242', '240', '182', '254', '200'],
    correta: 0,
    explicacao: 'a₅ = a₁ · q⁴ → 162 = 2 · q⁴ → q⁴ = 81 → q = 3. S₅ = a₁(q⁵ - 1)/(q - 1) = 2(243 - 1)/(3 - 1) = 2(242)/2 = 242.',
  },
];

export default function Simulados() {
  const [provaAtiva, setProvaAtiva] = useState<Prova | null>(null);
  const [tempoRestanteSegundos, setTempoRestanteSegundos] = useState<number>(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [finalizado, setFinalizado] = useState(false);

  // Timer effect
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

  const iniciarProva = (prova: Prova) => {
    setProvaAtiva(prova);
    setTempoRestanteSegundos(prova.tempoMinutos * 60);
    setRespostas({});
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

  // Cálculo TRI estimado
  const calcularResultado = () => {
    let acertos = 0;
    let faceisAcertos = 0;
    let mediasAcertos = 0;
    let dificeisAcertos = 0;

    QUESTOES_EXATAS.forEach((q, i) => {
      if (respostas[i] === q.correta) {
        acertos++;
        if (q.dificuldade === 'Fácil') faceisAcertos++;
        if (q.dificuldade === 'Média') mediasAcertos++;
        if (q.dificuldade === 'Difícil') dificeisAcertos++;
      }
    });

    // Coerência pedagógica: penaliza acerto no difícil se errou fácil
    let coerencia = 'Alta';
    let notaEstimada = 450 + acertos * 85;
    if (dificeisAcertos > 0 && faceisAcertos === 0) {
      coerencia = 'Baixa (Padrão de Chute detectado)';
      notaEstimada -= 60;
    } else if (faceisAcertos > 0 && mediasAcertos > 0) {
      coerencia = 'Excelente (Curva Progressiva TRI)';
      notaEstimada += 40;
    }

    return {
      acertos,
      total: QUESTOES_EXATAS.length,
      notaEstimada: Math.min(980, Math.max(300, Math.round(notaEstimada))),
      coerencia,
    };
  };

  // TELA DE EXECUÇÃO DO SIMULADO
  if (provaAtiva) {
    const resultado = finalizado ? calcularResultado() : null;

    return (
      <div id="simulado-execucao" className="p-4 bg-slate-950 text-white min-h-screen pb-28 max-w-3xl mx-auto">
        {/* Cabeçalho do Simulado em Execução */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-lg sticky top-2 z-20">
          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja sair do simulado? O progresso será encerrado.')) {
                setProvaAtiva(null);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="text-center">
            <h3 className="text-xs font-bold text-slate-200">{provaAtiva.titulo}</h3>
            <span className="text-[10px] text-slate-500">Padrão Oficial INEP</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-400 font-mono text-xs font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatarTempo(tempoRestanteSegundos)}</span>
          </div>
        </div>

        {/* TELA DE RESULTADOS TRI QUANDO FINALIZADO */}
        {finalizado && resultado && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 mb-6 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400">Resultado Oficial TRI</span>
                <h4 className="text-xl font-black text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span>{resultado.notaEstimada} Pontos</span>
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Acertos:</span>
                <div className="text-base font-bold text-emerald-400">
                  {resultado.acertos} / {resultado.total}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">Coerência Pedagógica TRI:</span>
              <span className="font-bold text-indigo-300">{resultado.coerencia}</span>
            </div>

            <button
              type="button"
              onClick={() => iniciarProva(provaAtiva)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refazer este Simulado</span>
            </button>
          </div>
        )}

        {/* LISTA DE QUESTÕES */}
        <div className="space-y-4">
          {QUESTOES_EXATAS.map((q, qIndex) => {
            const respondida = respostas[qIndex] !== undefined;
            const acertou = respostas[qIndex] === q.correta;

            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-400">
                    Questão {qIndex + 1} • <span className="text-slate-400">{q.area}</span>
                  </span>
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

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{q.enunciado}</p>

                {/* Opções de Resposta */}
                <div className="space-y-1.5 pt-1">
                  {q.opcoes.map((opcao, optIndex) => {
                    const isSelected = respostas[qIndex] === optIndex;
                    let opcaoEstilo = 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80';

                    if (finalizado) {
                      if (optIndex === q.correta) {
                        opcaoEstilo = 'bg-emerald-950/50 border-emerald-600 text-emerald-200 font-bold';
                      } else if (isSelected && !acertou) {
                        opcaoEstilo = 'bg-rose-950/50 border-rose-600 text-rose-200';
                      } else {
                        opcaoEstilo = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60';
                      }
                    } else if (isSelected) {
                      opcaoEstilo = 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-semibold shadow-sm';
                    }

                    return (
                      <button
                        key={optIndex}
                        type="button"
                        disabled={finalizado}
                        onClick={() => setRespostas((prev) => ({ ...prev, [qIndex]: optIndex }))}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${opcaoEstilo}`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="leading-snug pt-0.5">{opcao}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Comentário TRI pós-finalização */}
                {finalizado && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-300 space-y-1">
                    <span className="font-bold text-amber-400">Gabarito Comentado:</span>
                    <p>{q.explicacao}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão de Finalizar */}
        {!finalizado && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                const totalRespondidas = Object.keys(respostas).length;
                if (totalRespondidas < QUESTOES_EXATAS.length) {
                  if (!confirm(`Você respondeu ${totalRespondidas} de ${QUESTOES_EXATAS.length} questões. Deseja finalizar o simulado mesmo assim?`)) {
                    return;
                  }
                }
                setFinalizado(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar e Calcular Nota TRI</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // TELA PRINCIPAL DO COMPONENTE SIMULADOS
  return (
    <div id="simulados-container" className="p-4 bg-slate-950 text-white min-h-screen pb-28 max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <span>📝</span> Simulados & Provas
        </h2>
        <p className="text-xs text-slate-400">
          Treine com tempo cronometrado e correção no padrão TRI
        </p>
      </div>

      <div className="space-y-3">
        {PROVAS_LISTA.map((prova, index) => (
          <div
            key={index}
            className={`bg-slate-900 border ${prova.cor} rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-amber-500/60 transition-all`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">{prova.titulo}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${prova.badgeBg}`}>
                  {prova.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>{prova.questoes} questões</span>
                <span>•</span>
                <span>Cronometrado ({prova.tempoMinutos} min)</span>
              </p>
              <p className="text-[11px] text-slate-500">{prova.disciplinas}</p>
            </div>

            <button
              type="button"
              onClick={() => iniciarProva(prova)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Iniciar</span>
            </button>
          </div>
        ))}
      </div>

      {/* DICA DE ESTRATÉGIA TRI */}
      <div className="mt-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-amber-300">Regra de Ouro da TRI:</span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Acerte primeiro as questões fáceis e médias para calibrar sua régua de proficiência. Chutar e acertar uma questão difícil sem base nas fáceis faz o algoritmo do INEP desvalorizar seus pontos.
          </p>
        </div>
      </div>
    </div>
  );
}

export { Simulados };
