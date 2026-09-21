import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Brain,
  Lightbulb,
  ArrowRight,
  Image as ImageIcon,
  X,
  Zap,
  BookOpen,
  FileText,
  Mic,
  MicOff,
  Radio,
  Volume2,
  Download,
  Check,
  KeyRound,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import {
  solveQuestionWithClientGemini,
  isGreetingOrInformal,
  type QuestionSolution3Passos
} from '../services/geminiScannerService';
import { GabiAvatar } from './GabiAvatar';
import { exportQuestionSolutionToPdf, PdfVisualTheme } from '../utils/pdfExport';
import PdfThemeSelectorModal from './PdfThemeSelectorModal';
import { useGeminiError } from '../context/GeminiErrorContext';
import { classifyGeminiError } from '../utils/geminiErrorHandler';
import { GeminiApiErrorInfo } from '../types';
import { validateScannerInput, sanitizeInputText } from '../utils/textValidation';

interface QuestionScannerSectionProps {
  onOpenSettings?: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SAMPLE_QUESTIONS = [
  'Por que o céu fica avermelhado durante o pôr do sol?',
  'Qual a diferença prática entre vacina e soro antiofídico?',
  'Um carro viaja a 72 km/h e freia com aceleração constante de -4 m/s². Qual o tempo até parar?',
  'Como o Modernismo de 1922 revolucionou a literatura brasileira?',
];

export const QuestionScannerSection: React.FC<QuestionScannerSectionProps> = ({ onOpenSettings }) => {
  const { showError } = useGeminiError();
  const [duvida, setDuvida] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [solution, setSolution] = useState<QuestionSolution3Passos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<GeminiApiErrorInfo | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [pdfExported, setPdfExported] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleExportPdf = () => {
    if (!solution) return;
    setIsPdfModalOpen(true);
  };

  const handleConfirmPdfExport = (theme: PdfVisualTheme) => {
    if (!solution) return;
    try {
      exportQuestionSolutionToPdf(solution, duvida, theme);
      setPdfExported(true);
      setTimeout(() => setPdfExported(false), 3000);
    } catch (err) {
      console.error('Erro ao exportar PDF do Scanner:', err);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Reconhecimento de voz não é suportado no seu navegador. Digite sua dúvida manualmente.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      setVoiceStatusText('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setVoiceStatusText('Ouvindo microfone... Fale o enunciado ou sua dúvida.');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const newText = finalTranscript || interimTranscript;
        if (newText) {
          setDuvida((prev) => {
            if (!prev) return newText;
            // Avoid duplicate appends if interim
            if (prev.endsWith(newText)) return prev;
            return `${prev} ${newText}`.replace(/\s+/g, ' ');
          });
          setVoiceStatusText(`Ditado recebido: "${newText.slice(0, 40)}..."`);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Erro de reconhecimento de voz:', event.error);
        setIsListening(false);
        setVoiceStatusText('');
        if (event.error === 'not-allowed') {
          setError('Acesso ao microfone negado. Permita a gravação nas permissões do navegador.');
        } else if (event.error === 'no-speech') {
          setVoiceStatusText('Nenhum som detectado. Tente falar mais perto do microfone.');
        } else {
          setError(`Erro no reconhecimento de voz (${event.error}).`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceStatusText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Erro ao iniciar gravação de voz:', err);
      setIsListening(false);
      setVoiceStatusText('');
      setError('Não foi possível ativar o microfone.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSimulateCameraScan = () => {
    // Generate a mock question image scan simulation
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 600, 300);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('⚡ app inteligente • Scanner de Questão', 30, 50);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Questão: Um bloco de 5 kg é puxado por uma força F = 20 N em superfície lisa.', 30, 110);
      ctx.fillText('Determine a aceleração do bloco (a = F/m).', 30, 140);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('[Foto Capturada da Prova / Caderno]', 30, 220);
      setSelectedImage(canvas.toDataURL('image/jpeg'));
      setDuvida('Determine a aceleração do bloco de 5 kg puxado por uma força de 20 N.');
    }
  };

  const handleSolveQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validação e sanitização rigorosa do texto e imagem
    const validation = validateScannerInput(duvida, !!selectedImage);
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Por favor, informe uma questão com enunciado válido.');
      return;
    }

    const cleanDuvida = validation.sanitizedText;
    setDuvida(cleanDuvida);

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    try {
      const data = await solveQuestionWithClientGemini(cleanDuvida, selectedImage);

      if (!data) {
        throw new Error('Não foi possível obter a resolução da questão.');
      }

      if (data.foto_ilegivel && data.mensagem_erro_ilegivel) {
        setError(data.mensagem_erro_ilegivel);
      }

      setSolution(data);
    } catch (err: any) {
      console.error('Erro na resolução do Scanner Tira-Dúvidas:', err);
      const info = showError(err, {
        componentName: 'Scanner Tira-Dúvidas',
        retryAction: () => handleSolveQuestion(),
      });
      setError(info.message);
      setErrorDetails(info);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Motor PRO nº 3
              </span>
              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" /> Gemini 3.8 Flash • Resolução Passo a Passo
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Scanner Tira-Dúvidas de Questões
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
          Faça qualquer pergunta livre (curiosidades, conhecimentos gerais, fatos do dia a dia) ou envie fotos de exercícios escolares e de provas.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Scanner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            {/* Quick samples */}
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                💡 Teste uma questão comum de prova:
              </span>
              <div className="flex flex-col gap-1.5">
                {SAMPLE_QUESTIONS.map((sq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDuvida(sq);
                      handleRemoveImage();
                    }}
                    className="text-[11px] font-semibold text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition truncate"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input */}
            <form onSubmit={handleSolveQuestion} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    1. Enunciado ou Dúvida da Questão
                  </label>

                  {/* Voice dictation toggle button */}
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}
                    title={isListening ? 'Parar gravação de voz' : 'Ditar questão por voz'}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-white" />
                        <span>Parar Ditado</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Ditar por Voz 🎤</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Animated Voice Dictation Banner */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider">
                            Modo Reconhecimento de Voz Ativo
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <motion.div
                            animate={{ height: ['4px', '16px', '4px'] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="w-1 bg-rose-500 rounded-full"
                          />
                          <motion.div
                            animate={{ height: ['8px', '22px', '8px'] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                            className="w-1 bg-rose-500 rounded-full"
                          />
                          <motion.div
                            animate={{ height: ['4px', '18px', '4px'] }}
                            transition={{ repeat: Infinity, duration: 0.7, delay: 0.2 }}
                            className="w-1 bg-rose-500 rounded-full"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] font-medium leading-tight">
                        {voiceStatusText || 'Fale pausadamente. As palavras ditadas aparecerão na caixa de texto abaixo...'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <textarea
                  value={duvida}
                  onChange={(e) => {
                    setDuvida(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Cole aqui o texto da questão, dite por voz usando o microfone ou envie uma foto..."
                  rows={4}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-2xl p-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition resize-none ${
                    isListening
                      ? 'border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>
                    {duvida.trim() ? `${duvida.trim().length} caracteres` : 'Nenhum texto inserido'}
                  </span>
                  {selectedImage && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Imagem anexada
                    </span>
                  )}
                </div>
              </div>

              {/* Photo Upload / Camera Scan / Voice Buttons */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
                  2. Entrada Multimodal (Foto ou Microfone)
                </label>

                {selectedImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 group">
                    <img
                      src={selectedImage}
                      alt="Questão digitalizada"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                      title="Remover Imagem"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-amber-300 px-2 py-0.5 rounded-md">
                      ✓ Imagem anexada para o Scanner
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={toggleVoiceDictation}
                      className={`py-3 px-2 rounded-2xl border border-dashed text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer ${
                        isListening
                          ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Mic className="w-4 h-4 text-rose-500" />
                      <span className="truncate">{isListening ? 'Ouvindo...' : 'Gravar Voz'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-2 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-dashed border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-amber-500" />
                      <span className="truncate">Anexar Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSimulateCameraScan}
                      className="py-3 px-2 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-dashed border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-indigo-500" />
                      <span className="truncate">Escanear</span>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {error && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-3 transition-all ${
                    errorDetails?.type === 'AUTH_ERROR'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                      : errorDetails?.type === 'OFFLINE_ERROR'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {errorDetails?.type === 'AUTH_ERROR' ? (
                      <KeyRound className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : errorDetails?.type === 'OFFLINE_ERROR' ? (
                      <WifiOff className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>{errorDetails?.title || 'Atenção'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setErrorDetails(null);
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                          title="Dispensar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="leading-relaxed font-medium">{error}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                    {errorDetails?.type === 'AUTH_ERROR' && onOpenSettings && (
                      <button
                        type="button"
                        onClick={onOpenSettings}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Configurar VITE_GEMINI_API_KEY</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSolveQuestion()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tentar Novamente</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || (!duvida.trim() && !selectedImage)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Processando em 3 Passos...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Resolver em 3 Passos Agora</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: 3 Steps Solution Output */}
        <div className="lg:col-span-7">
          {solution ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {solution.foto_ilegivel ? (
                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-2xl">
                    <span>📸</span>
                    <h3 className="text-base font-extrabold">Atenção na Foto Enviada</h3>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed">
                    {solution.mensagem_erro_ilegivel || 'Ops! Não consegui ler bem o enunciado. Tente tirar outra foto mais de perto e em um ambiente iluminado! 📸'}
                  </p>
                  <button
                    onClick={() => {
                      setSolution(null);
                      handleRemoveImage();
                    }}
                    className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
                  >
                    Tirar Nova Foto 📷
                  </button>
                </div>
              ) : (() => {
                const isGreeting =
                  solution.categoria === 'cumprimento' ||
                  solution.tipo_resposta === 'conversacional' ||
                  isGreetingOrInformal(solution.transcricao_enunciado || duvida);
                const isExercicio =
                  !isGreeting &&
                  (solution.categoria === 'exercicio' || solution.categoria === 'duvida_complexa');

                if (isGreeting) {
                  const cleanedGreetingText = (solution.resposta_direta || '')
                    .replace(/^Aqui est[aá] a explica[cç][aã]o sobre sua d[uú]vida:?\s*['"]?[^'"]*['"]?:?\s*/i, '')
                    .trim();

                  return (
                    <div className="space-y-4">
                      {/* Header Badge para Conversa */}
                      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                          <GabiAvatar size={44} showOnlineStatus={true} />
                          <div>
                            <span className="text-[10px] font-black uppercase text-purple-300 tracking-widest block">
                              Tira-Dúvidas Gabaritou AI • Professora Gabi
                            </span>
                            <h3 className="text-base font-extrabold text-white">
                              Atendimento & Orientação de Estudos
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Online agora
                          </span>
                        </div>
                      </div>

                      {/* Resposta Conversacional Direta */}
                      <div className="bg-white dark:bg-slate-900 border border-purple-500/20 dark:border-purple-500/30 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-start gap-3.5">
                          <GabiAvatar size={40} className="shrink-0 mt-0.5" />
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-900 dark:text-white">
                                Professora Gabi
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Mentora Gabaritou
                              </span>
                            </div>
                            <div className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal bg-purple-50/60 dark:bg-purple-950/30 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 whitespace-pre-line shadow-2xs">
                              {cleanedGreetingText ||
                                'Olá! Sou a Professora Gabi, sua assistente de estudos do Gabaritou! Como posso te ajudar hoje? Envie suas dúvidas, exercícios escolares, redações ou a foto de uma questão para estudarmos juntos!'}
                            </div>
                          </div>
                        </div>

                        {/* Atalhos rápidos para o estudante */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Sugestões para praticar agora:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDuvida('Como resolver uma equação do 2º grau por Bhaskara?');
                              }}
                              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group cursor-pointer"
                            >
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 block">
                                📐 Questão com Cálculo
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Bhaskara, física e fórmulas
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDuvida('Quais são as 5 competências avaliadas na redação do ENEM?');
                              }}
                              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group cursor-pointer"
                            >
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 block">
                                📝 Redação & Português
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Dúvidas do ENEM e vestibulares
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDuvida('Qual a diferença entre mitose e meiose na biologia?');
                              }}
                              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group cursor-pointer"
                            >
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 block">
                                🧪 Ciências & Natureza
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Biologia, química e conceitos
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                fileInputRef.current?.click();
                              }}
                              className="p-3 text-left rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 transition group cursor-pointer"
                            >
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 group-hover:text-amber-800 block">
                                📸 Anexar Foto da Apostila
                              </span>
                              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                                Envie fotos de exercícios ou provas
                              </span>
                            </button>
                          </div>
                        </div>

                        {solution.dica_rapida && (
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3.5 rounded-2xl text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                            <span>💡 {solution.dica_rapida}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Header Badge */}
                    <div className="bg-slate-900 text-white p-5 rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                          Tira-Dúvidas Gabaritou AI • Scanner IA Vision
                        </span>
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <span>Matéria: {solution.materia || 'Geral'}</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Salvar resolução em PDF estilizado para leitura offline"
                        >
                          {pdfExported ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-slate-950" />
                              <span>PDF Salvo!</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Exportar PDF</span>
                            </>
                          )}
                        </button>

                        <div className="bg-slate-800 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                          {isExercicio ? '✓ Resolução em 3 Passos' : '✓ Resposta Direta & Concisa'}
                        </div>
                      </div>
                    </div>

                    {/* 📌 ENUNCIADO / PERGUNTA IDENTIFICADA */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">📌</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          {isExercicio ? 'Enunciado Identificado (Passo 1: Compreensão)' : 'Pergunta / Consulta'}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {solution.transcricao_enunciado || solution.passo1_compreensao}
                      </p>
                    </div>

                    {/* SE FOR EXERCÍCIO: MOSTRA PASSO 2 E PASSO 3. SE FOR GERAL: RESPOSTA DIRETA */}
                    {isExercicio ? (
                      <>
                        {/* 💡 CONCEITO-CHAVE / FÓRMULA (Passo 2) */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">💡</span>
                            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Passo 2: Fórmula, Lei ou Conceito-Chave
                            </h4>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-bold bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                            {solution.conceito_chave || `${solution.materia} • ${solution.passo2_formula_conceito}`}
                          </p>
                        </div>

                        {/* 📝 RESOLUÇÃO GUIADA (Passo 3) */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">📝</span>
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Passo 3: Resolução Guiada e Aplicação
                            </h4>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 whitespace-pre-line">
                            {solution.resolucao_passo_a_passo || solution.passo3_resolucao_guiada}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/30 rounded-3xl p-5 shadow-sm space-y-2 bg-gradient-to-br from-amber-500/5 to-transparent">
                        <div className="flex items-center space-x-2">
                          <span className="text-base">⚡</span>
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Resposta Direta & Didática
                          </h4>
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-semibold bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 whitespace-pre-line">
                          {solution.resposta_direta || solution.resolucao_passo_a_passo || solution.passo3_resolucao_guiada}
                        </p>
                      </div>
                    )}

                    {/* ✅ GABARITO / RESPOSTA FINAL */}
                    <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200 block flex items-center gap-1">
                          {isExercicio ? '✅ Gabarito / Resposta Final:' : '✅ Conclusão / Síntese:'}
                        </span>
                        <span className="text-base font-black text-amber-300">
                          {solution.gabarito_resposta_final || solution.gabarito_final || 'Esclarecido com sucesso.'}
                        </span>
                      </div>

                      {solution.dica_rapida && (
                        <div className="bg-black/30 p-2.5 rounded-2xl border border-white/10 text-xs font-bold text-amber-200 max-w-sm">
                          💡 Dica Rápida: {solution.dica_rapida}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-inner">
                🔍
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Resolução de Questão em 3 Passos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Digite o enunciado ou envie uma foto para receber a explicação estruturada em 3 passos para não travar em nenhuma questão na hora da prova.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  1. Compreensão do Enunciado
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  2. Fórmula / Conceito-Chave
                </span>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  3. Resolução Guiada
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <PdfThemeSelectorModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        onConfirmExport={handleConfirmPdfExport}
        documentTitle={`Resolução de Questão - ${solution?.materia || 'ENEM'}`}
        documentType="scanner"
      />
    </div>
  );
};
