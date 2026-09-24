import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  MessageSquare,
  Bot,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Camera,
  Upload,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  Brain,
  Copy,
  Check,
} from 'lucide-react';
import { GabiAvatar } from './GabiAvatar';
import { chatWithGabi, solveQuestion } from '../services/geminiService';

export interface GabiResponse {
  resposta_suporte: string;
  botao_atalho: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gabi';
  text: string;
  botaoAtalho?: string;
  timestamp: string;
}

interface GabiAssistantModalProps {
  onClose: () => void;
  onNavigateShortcut?: (atalho: string) => void;
  initialPrompt?: string | null;
  onTypingChange?: (isTyping: boolean) => void;
  apiKey?: string;
  onOpenSettings?: () => void;
}

const FAQ_SUGGESTIONS = [
  'Me explica a 1ª Lei de Newton com exemplos?',
  'Dica de ouro para a Competência 3 da Redação ENEM',
  'Como resolver equações do 2º grau por Bhaskara?',
  'Como calcular a área de um trapézio e de um círculo?',
  'Como funciona o Caderno de Erros do app?',
  'Quais as vantagens do Plano PRO?',
];

export const GabiAssistantModal: React.FC<GabiAssistantModalProps> = ({
  onClose,
  onNavigateShortcut,
  initialPrompt,
  onTypingChange,
  apiKey,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gabi',
      text: 'Oii! 👋 Eu sou a Professora Gabi, sua mentora inteligente no Gabaritou / Gabaritou! Estou aqui para responder qualquer dúvida de estudos, cálculos, curiosidades ou te guiar pelo app de forma direta e natural. O que vamos aprender hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Estado para visualização do Mapa Mental / Esquema
  const [mindMapData, setMindMapData] = useState<{
    titulo: string;
    ramos: { emoji: string; titulo: string; itens: string[] }[];
    conclusao: string;
  } | null>(null);
  const [copiedMindMap, setCopiedMindMap] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedPromptRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll imediato sempre que novas mensagens chegarem ou quando estiver digitando
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      onTypingChange?.(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [onTypingChange]);

  const speakMessage = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingMsgId === msgId) {
      setSpeakingMsgId(null);
      return;
    }

    const cleanText = text
      .replace(/[*_~`]/g, '')
      .replace(/[📌💡📝✅⚡⚠️⭐]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results?.[0]?.[0]?.transcript;
        if (spoken && spoken.trim()) {
          setInputQuestion(spoken.trim());
          // Dispara a pergunta automaticamente logo após falar
          handleAskGabi(spoken.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
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

  const handleAskGabi = async (questionText?: string) => {
    const query = (questionText !== undefined ? questionText : inputQuestion).trim();
    if ((!query && !selectedImage) || isLoading) return;

    const userText = selectedImage
      ? query
        ? `[📷 Foto da Questão] ${query}`
        : '[📷 Foto da Questão Enviada]'
      : query;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);
    onTypingChange?.(true);

    try {
      let gabiText = '';
      let atalho = 'nenhum';

      if (currentImg) {
        // Envio com visão multimodal para resolução de questão via serviço centralizado
        const resData = await solveQuestion({
          duvida: query || 'Resolva a questão desta imagem com gabarito e explicação.',
          imagemBase64: currentImg,
          apiKey: apiKey || undefined,
        });

        if (resData) {
          const d = resData;
          if (d.foto_ilegivel) {
            gabiText =
              d.mensagem_erro_ilegivel ||
              'Ops! Não consegui ler bem o enunciado. Tente tirar outra foto mais nítida e iluminada! 📸';
          } else {
            gabiText = `📌 *Enunciado Identificado:* ${d.transcricao_enunciado || d.passo1_compreensao}\n\n💡 *Conceito-Chave:* ${d.conceito_chave || d.materia}\n\n📝 *Resolução:* ${d.resolucao_passo_a_passo || d.passo3_resolucao_guiada}\n\n✅ *Gabarito:* ${d.gabarito_resposta_final || d.gabarito_final}`;
          }
        } else {
          gabiText =
            'Identifiquei a imagem enviada! Posso te explicar qualquer dúvida sobre os conceitos desta questão se você me indicar o assunto.';
        }
      } else {
        const gabiData = await chatWithGabi({
          pergunta: query,
          apiKey: apiKey || undefined,
        });

        if (gabiData) {
          gabiText = gabiData.resposta_suporte || 'Aqui está a sua resposta!';
          atalho = gabiData.botao_atalho || 'nenhum';
        } else {
          throw new Error('Sem dados na resposta da Gabi.');
        }
      }

      const gabiMsgId = (Date.now() + 1).toString();
      const gabiMsg: ChatMessage = {
        id: gabiMsgId,
        sender: 'gabi',
        text: gabiText,
        botaoAtalho: atalho,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, gabiMsg]);

      // Fala automaticamente a resposta se a voz estiver ativada
      if (autoSpeak) {
        speakMessage(gabiText, gabiMsgId);
      }
    } catch (error: any) {
      console.error('Erro no atendimento da Professora Gabi:', error);

      // Resolução matemática direta caso o erro ocorra
      const p = query.toLowerCase().trim();
      const mathQuery = p.replace(/^(quanto\s+[eé]|quanto\s+fica|calcule|resolva|qual\s+(é|e)\s+o\s+resultado\s+de|qual\s+(o\s+)?valor\s+de)\s+/i, '').replace(/[?!=]/g, '').trim();
      const simpleCalc = mathQuery.match(/^(\d+(?:[.,]\d+)?)\s*([x*+\-\/÷])\s*(\d+(?:[.,]\d+)?)$/i);

      let fallbackText = '';
      let fallbackAtalho = 'nenhum';

      if (simpleCalc) {
        const n1 = parseFloat(simpleCalc[1].replace(',', '.'));
        const op = simpleCalc[2].toLowerCase();
        const n2 = parseFloat(simpleCalc[3].replace(',', '.'));
        let resNum: number | string = 0;
        if (op === 'x' || op === '*') resNum = n1 * n2;
        else if (op === '+') resNum = n1 + n2;
        else if (op === '-') resNum = n1 - n2;
        else if (op === '/' || op === '÷') resNum = n2 !== 0 ? (n1 / n2) : 'indefinido (divisão por zero)';
        const displayOp = (op === '*' || op === 'x') ? 'x' : op;
        fallbackText = `${n1} ${displayOp} ${n2} = **${resNum}**.`;
      } else {
        fallbackText = `⚠️ Não foi possível obter uma resposta em tempo real da IA no momento. Por favor, verifique ou configure a sua chave de API nas Configurações.`;
        fallbackAtalho = 'tela_perfil';
      }

      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'gabi',
        text: fallbackText,
        botaoAtalho: fallbackAtalho,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      onTypingChange?.(false);
    }
  };

  // Gerador de Mapa Mental e Esquema Conceitual baseado na resposta
  const handleGenerateMindMap = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || 'Conceito Central';
    const cleanTitle = firstLine.replace(/^[#*•\-\d.\s📌💡📝✅]+/, '').slice(0, 50) || 'Mapa Mental do Conceito';

    const ramos: { emoji: string; titulo: string; itens: string[] }[] = [];
    let currentRamo: { emoji: string; titulo: string; itens: string[] } = {
      emoji: '💡',
      titulo: 'Ideia Central & Fundamento',
      itens: [],
    };

    const emojis = ['⚡', '📐', '🔬', '🎯', '📝', '✨', '📌'];
    let emojiIdx = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('#') || line.startsWith('**') || (line.includes(':') && line.length < 50)) {
        if (currentRamo.itens.length > 0) {
          ramos.push(currentRamo);
        }
        currentRamo = {
          emoji: emojis[emojiIdx % emojis.length],
          titulo: line.replace(/[#*:]/g, '').trim(),
          itens: [],
        };
        emojiIdx++;
      } else {
        const itemText = line.replace(/^[•\-\*]\s*/, '').trim();
        if (itemText && !itemText.startsWith('---')) {
          currentRamo.itens.push(itemText);
        }
      }
    }

    if (currentRamo.itens.length > 0 || ramos.length === 0) {
      ramos.push(currentRamo);
    }

    setMindMapData({
      titulo: cleanTitle,
      ramos: ramos.slice(0, 5),
      conclusao: lines[lines.length - 1] || 'Memorize esses pontos-chave para gabaritar na sua prova.',
    });
  };

  // Dispara automaticamente quando a Gabi é aberta com uma pergunta inicial
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && lastProcessedPromptRef.current !== initialPrompt.trim()) {
      lastProcessedPromptRef.current = initialPrompt.trim();
      handleAskGabi(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const renderShortcutButton = (atalho?: string) => {
    if (!atalho || atalho === 'nenhum') return null;

    let label = 'Ir para a tela';
    let icon = <ArrowRight className="w-3.5 h-3.5" />;

    if (atalho === 'tela_assinatura') {
      label = '⭐ Conhecer o Plano PRO (R$ 5,00/mês)';
      icon = <Zap className="w-3.5 h-3.5 text-amber-400" />;
    } else if (atalho === 'tela_perfil') {
      label = '⚙️ Alterar Matéria nas Configurações';
      icon = <ArrowRight className="w-3.5 h-3.5" />;
    } else if (atalho === 'tela_caderno_erros') {
      label = '📓 Ver Caderno de Erros';
      icon = <ArrowRight className="w-3.5 h-3.5" />;
    }

    return (
      <button
        onClick={() => onNavigateShortcut && onNavigateShortcut(atalho)}
        className="mt-2.5 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
      >
        <span>{label}</span>
        {icon}
      </button>
    );
  };

  return (
    <div
      id="gabi-assistant-modal-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="gabi-assistant-modal-container"
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] w-full max-w-lg sm:max-w-xl md:max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[94vh] sm:h-[660px] max-h-[98vh] relative z-[10000]"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-purple-800/40 shrink-0">
          <div className="flex items-center space-x-3">
            <GabiAvatar size={42} showOnlineStatus={true} statusBadgeSize={10} />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">Professora Gabi IA</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Resposta Automática
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-purple-200/80 font-medium line-clamp-1 sm:line-clamp-none">
                Responde na hora qualquer dúvida de matéria ou do app
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Botão de voz automática da Gabi */}
            <button
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                autoSpeak
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={autoSpeak ? 'Voz da Gabi ativada' : 'Ativar leitura em voz alta'}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-amber-300" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{autoSpeak ? 'Voz On' : 'Voz Off'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-2 sm:px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] sm:text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              title="Minimizar Assistente"
            >
              Minimizar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick FAQ Chips - Clicar responde automaticamente */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Perguntas Rápidas (Clique para resposta imediata):
            </p>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {FAQ_SUGGESTIONS.map((faq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskGabi(faq)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:border-purple-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap transition shadow-xs cursor-pointer active:scale-95"
              >
                {faq}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/50 dark:bg-slate-950/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-1.5 text-[11px] font-medium max-w-[85%] ${
                  msg.sender === 'user' ? 'justify-end text-slate-400' : 'justify-between text-slate-500 dark:text-slate-400'
                }`}
              >
                {msg.sender === 'gabi' ? (
                  <div className="flex items-center justify-between w-full gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <GabiAvatar size={18} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Professora Gabi
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal">
                        {msg.timestamp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakMessage(msg.text, msg.id)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer shrink-0 text-[10px] font-bold border border-purple-200/60 dark:border-purple-800/40"
                      title={speakingMsgId === msg.id ? 'Parar áudio' : 'Ouvir resposta da Gabi'}
                      aria-label="Ouvir resposta em áudio"
                    >
                      {speakingMsgId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                          <span className="text-rose-500">Parar</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span>Ouvir</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Você</span>
                    <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
                    <span className="text-slate-400 font-normal">{msg.timestamp}</span>
                  </div>
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed font-medium shadow-xs break-words overflow-hidden ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.sender === 'gabi' && renderShortcutButton(msg.botaoAtalho)}

                {msg.sender === 'gabi' && msg.id !== 'welcome' && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateMindMap(msg.text)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 text-[11px] font-bold transition border border-purple-200/70 dark:border-purple-800/60 cursor-pointer shadow-xs active:scale-95"
                      title="Gerar Mapa Mental / Esquema deste conteúdo"
                    >
                      <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>🧠 Gerar Mapa Mental / Esquema</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2 animate-in fade-in duration-150">
              <GabiAvatar size={24} />
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-purple-200 dark:border-purple-800/50 text-xs text-purple-600 dark:text-purple-300 flex items-center space-x-2 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin text-purple-600" />
                <span className="font-semibold">Professora Gabi está formulando a explicação...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview if Attached */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-10 h-10 object-cover rounded-lg border border-purple-400"
              />
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Foto da Questão Anexada 📷
                </span>
                <span className="text-[10px] text-slate-400">
                  A Gabi vai ler e resolver automaticamente
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500 transition cursor-pointer"
              title="Remover foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskGabi();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center space-x-2 shrink-0"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2.5 rounded-xl font-bold transition flex items-center justify-center shrink-0 cursor-pointer"
            title="Tirar foto ou anexar imagem da questão"
          >
            <Camera className="w-4 h-4 text-purple-500" />
          </button>

          {/* Microfone para falar e responder automaticamente */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center shrink-0 cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title={isListening ? 'Ouvindo... Fale sua pergunta' : 'Falar pergunta por voz'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-500" />}
          </button>

          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              isListening
                ? 'Ouvindo você falar... Pode fazer sua pergunta!'
                : 'Digite sua dúvida de matéria ou envie uma foto...'
            }
            disabled={isLoading}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <button
            type="submit"
            disabled={isLoading || (!inputQuestion.trim() && !selectedImage)}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-2.5 rounded-xl font-bold transition flex items-center justify-center shrink-0 cursor-pointer shadow-sm active:scale-95"
            title="Enviar para a Professora Gabi responder"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Mind Map / Schema Modal Overlay */}
        {mindMapData && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm p-4 sm:p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-500 flex items-center justify-center">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                      Esquema Visual de Síntese
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1">
                      {mindMapData.titulo}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const textToCopy = `🧠 ESQUEMA: ${mindMapData.titulo}\n\n` +
                        mindMapData.ramos.map((r) => `${r.emoji} ${r.titulo}:\n` + r.itens.map((it) => `  • ${it}`).join('\n')).join('\n\n') +
                        `\n\n📌 Conclusão: ${mindMapData.conclusao}`;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedMindMap(true);
                      setTimeout(() => setCopiedMindMap(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMindMap ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMindMap ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMindMapData(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-thin">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 text-center">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-300 tracking-wider">🎯 Núcleo Central</span>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{mindMapData.titulo}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mindMapData.ramos.map((ramo, rIdx) => (
                    <div key={rIdx} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-base">{ramo.emoji}</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{ramo.titulo}</h5>
                      </div>
                      <ul className="space-y-1 pl-1">
                        {ramo.itens.map((it, itIdx) => (
                          <li key={itIdx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-snug">
                            <span className="text-purple-500 font-bold mt-0.5">•</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {mindMapData.conclusao && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">✅ Aplicação & Dica de Ouro</span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">{mindMapData.conclusao}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setMindMapData(null)}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Fechar Esquema
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
