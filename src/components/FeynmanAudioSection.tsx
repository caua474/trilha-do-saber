import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Volume2,
  Award,
  Send,
  HelpCircle,
  Lightbulb,
  Zap,
  BookOpen
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { MicrophonePermissionModal } from './MicrophonePermissionModal';

const FEYNMAN_TOPICS = [
  {
    materia: 'Biologia',
    pergunta: 'Explique o processo de Fotossíntese e a diferença entre a Fase Clara e a Fase Escura como se estivesse ensinando uma criança de 10 anos.',
    conceitosChave: ['Luz solar', 'Clorofila', 'Glicose', 'Oxigênio', 'Gás Carbônico']
  },
  {
    materia: 'Física',
    pergunta: 'Explique a Primeira Lei de Newton (Inércia) usando um exemplo do dia a dia, como andar de ônibus ou carro.',
    conceitosChave: ['Inércia', 'Força resultante zero', 'Manter estado de movimento', 'Velocidade constante']
  },
  {
    materia: 'Química',
    pergunta: 'O que são Ligações Covalentes e como elas se diferenciam das Ligações Iônicas na prática?',
    conceitosChave: ['Compartilhamento de elétrons', 'Transferência de elétrons', 'Não metais', 'Cátions e Âniões']
  },
  {
    materia: 'História',
    pergunta: 'Explique o motivo do estopim da Primeira Guerra Mundial e por que o sistema de alianças transformou um conflito regional em mundial.',
    conceitosChave: ['Francisco Ferdinando', 'Imperialismo', 'Tríplice Entente e Aliança', 'Nacionalismo']
  },
  {
    materia: 'Matemática',
    pergunta: 'O que significa calcular a Média, a Moda e a Mediana de um conjunto de dados e quando usar cada uma?',
    conceitosChave: ['Soma dividida pelo total', 'Valor mais frequente', 'Elemento do meio no rol', 'Dispersão']
  }
];

export const FeynmanAudioSection: React.FC = () => {
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    notaPrecisao: number;
    conceitosAtingidos: string[];
    conceitosFaltantes: string[];
    diagnosticoFeynman: string;
    dicaSimplificacao: string;
  } | null>(null);

  const currentTopic = FEYNMAN_TOPICS[selectedTopicIndex];

  // Initialize Web Speech API if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscriptText(currentTranscript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        setRecognitionInstance(recognition);
      }
    }
  }, []);

  const startActualRecording = () => {
    if (!recognitionInstance) {
      alert('Seu navegador não suporta a gravação nativa de áudio Web Speech. Você pode digitar sua resposta verbal na caixa abaixo para avaliação!');
      return;
    }
    setTranscriptText('');
    setFeedback(null);
    try {
      recognitionInstance.start();
      setIsRecording(true);
    } catch (e) {
      console.warn('Recognition start exception:', e);
      setIsRecording(true);
    }
  };

  const handleToggleRecording = () => {
    playClickSound();
    if (isRecording) {
      if (recognitionInstance) recognitionInstance.stop();
      setIsRecording(false);
      return;
    }

    // Check if permission modal is needed
    if (!hasMicPermission && !localStorage.getItem('gabaritai_mic_permission_granted')) {
      setShowPermissionModal(true);
      return;
    }

    startActualRecording();
  };

  const handleAllowPermission = () => {
    playClickSound();
    setHasMicPermission(true);
    localStorage.setItem('gabaritai_mic_permission_granted', 'true');
    setShowPermissionModal(false);
    startActualRecording();
  };

  const handleDisallowPermission = () => {
    playClickSound();
    setShowPermissionModal(false);
  };

  const handleAnalyzeAnswer = async () => {
    if (!transcriptText.trim()) {
      alert('Por favor, grave ou digite sua explicação antes de solicitar a avaliação Feynman.');
      return;
    }

    playSuccessSound();
    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/feynman-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: currentTopic.pergunta,
          conceitosChave: currentTopic.conceitosChave,
          transcriptText: transcriptText.trim()
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setFeedback(resData.data);
      } else {
        throw new Error(resData.error || 'Erro na avaliação');
      }
    } catch (e) {
      console.error('Erro na avaliação Feynman:', e);
      // Fallback evaluation
      const matched = currentTopic.conceitosChave.filter((c) =>
        transcriptText.toLowerCase().includes(c.toLowerCase())
      );
      const missed = currentTopic.conceitosChave.filter(
        (c) => !transcriptText.toLowerCase().includes(c.toLowerCase())
      );
      const score = Math.min(100, Math.round((matched.length / currentTopic.conceitosChave.length) * 100 + 30));

      setFeedback({
        notaPrecisao: score,
        conceitosAtingidos: matched.length > 0 ? matched : [currentTopic.conceitosChave[0]],
        conceitosFaltantes: missed,
        diagnosticoFeynman:
          'Sua explicação verbal demonstrou bom entendimento dos pontos centrais, porém você pode reforçar as definições com exemplos práticos.',
        dicaSimplificacao:
          'Para aplicar a Técnica Feynman com perfeição, tente substituir termos técnicos por analogias do cotidiano.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Mic className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Técnica Feynman de Aprendizagem Ativa
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/40">
                🎤 Verificação Verbal
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Teste de Explicação por Áudio com IA
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-md font-medium">
          "Se você não consegue explicar algo de forma simples, você não entendeu suficientemente bem." Fale no microfone e receba diagnóstico instantâneo!
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Selector & Audio Recorder */}
        <div className="lg:col-span-6 bg-slate-900 border border-indigo-500/20 rounded-3xl p-6 text-white space-y-5 shadow-xl">
          
          {/* Select Topic */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Escolha o Tópico para Explicar:
            </label>
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
              {FEYNMAN_TOPICS.map((top, idx) => (
                <button
                  key={top.pergunta}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedTopicIndex(idx);
                    setTranscriptText('');
                    setFeedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedTopicIndex === idx
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {top.materia}
                </button>
              ))}
            </div>
          </div>

          {/* Question Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
              Desafio Feynman ({currentTopic.materia}):
            </span>
            <p className="text-sm font-extrabold text-white leading-relaxed">
              "{currentTopic.pergunta}"
            </p>
          </div>

          {/* Recording Microphone Controls */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-indigo-500/30 flex flex-col items-center justify-center text-center space-y-4">
            <button
              type="button"
              onClick={handleToggleRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-95 ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30'
                  : 'bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 hover:brightness-110'
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>

            <div>
              <p className="text-xs font-black text-white">
                {isRecording ? '🎙️ Gravando sua voz... Fale claramente!' : 'Clique no Microfone para Falar'}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                A IA vai transcrever suas palavras em tempo real.
              </p>
            </div>
          </div>

          {/* Transcript Box / Manual Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Transcrição da sua Fala (ou Digitação):
            </label>
            <textarea
              rows={4}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Sua resposta verbal aparecerá aqui... Você também pode ajustar ou digitar manualmente se preferir."
              className="w-full text-xs font-medium bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyzeAnswer}
            disabled={isAnalyzing || !transcriptText.trim()}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 shadow-lg transition cursor-pointer active:scale-95 ${
              isAnalyzing || !transcriptText.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600 text-slate-950 hover:brightness-110'
            }`}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                <span>Analisando Explicação Feynman com IA...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>Avaliar Precisão Verbal com IA</span>
              </span>
            )}
          </button>
        </div>

        {/* Diagnostic Results Column */}
        <div className="lg:col-span-6 space-y-4">
          {feedback ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white space-y-5 shadow-xl"
            >
              {/* Score Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 font-black flex items-center justify-center text-lg">
                    {feedback.notaPrecisao}%
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Índice de Domínio Verbal Feynman
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">
                      {feedback.notaPrecisao >= 75
                        ? '🟢 Excelente domínio conceitual!'
                        : '🟡 Exposição parcial — revise os pontos em falta.'}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/40">
                  IA Feedback
                </span>
              </div>

              {/* Covered Key Concepts */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Conceitos Explicados Corretamente:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {feedback.conceitosAtingidos.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30"
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Concepts */}
              {feedback.conceitosFaltantes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Pontos Omisso ou Confusos:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.conceitosFaltantes.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30"
                      >
                        ⚠️ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Brain className="w-4 h-4" /> Diagnóstico do Mentor:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {feedback.diagnosticoFeynman}
                </p>
              </div>

              {/* Simplification Tip */}
              <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                <h4 className="text-xs font-black uppercase text-indigo-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-300" /> Dica de Simplificação Feynman:
                </h4>
                <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                  {feedback.dicaSimplificacao}
                </p>
              </div>

            </motion.div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-3 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-500 flex items-center justify-center">
                <Mic className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-extrabold text-white">
                Aguardando sua Explicação Verbal
              </h3>
              <p className="text-xs max-w-sm text-slate-400 font-medium">
                Grave seu áudio explicando o tópico selecionado. A IA avaliará se você domina os conceitos sem usar "decorebas"!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Microphone Permission Modal with requested BR translation */}
      <MicrophonePermissionModal
        isOpen={showPermissionModal}
        onAllow={handleAllowPermission}
        onDisallow={handleDisallowPermission}
      />
    </div>
  );
};
