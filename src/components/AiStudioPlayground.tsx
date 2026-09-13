import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  Paperclip,
  Trash2,
  FileText,
  Loader2,
  X,
  Sparkles,
  Settings,
  Key,
  AlertCircle
} from 'lucide-react';

export interface AttachedFile {
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: AttachedFile[];
}

export interface AiStudioPlaygroundProps {
  apiKey?: string;
  model?: string;
  temperature?: number;
  systemInstruction?: string;
  onOpenSettings?: () => void;
  onOpenApiKeyModal?: () => void;
}

export const AiStudioPlayground: React.FC<AiStudioPlaygroundProps> = ({
  apiKey = '',
  model = 'gemini-3.8-flash',
  temperature = 0.7,
  systemInstruction = '',
  onOpenSettings,
  onOpenApiKeyModal
}) => {
  const effectiveModel = (!model || model === 'gemini-2.5-flash' || model === 'gemini-3.6-flash') ? 'gemini-3.8-flash' : model;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Olá! Sou o seu assistente de estudos no AI Studio Playground powered by Gemini 3.8 Flash. Como posso te ajudar hoje? Você pode enviar dúvidas, pedir explicações passo a passo, resumos ou anexar imagens e documentos.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const showNotification = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => {
      setBannerNotice(null);
    }, 4000);
  };

  const handleTriggerSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else if (onOpenApiKeyModal) {
      onOpenApiKeyModal();
    }
  };

  const hasSettingsHandler = Boolean(onOpenSettings || onOpenApiKeyModal);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // 1. Copiar mensagem
  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      showNotification('Não foi possível copiar o texto automaticamente.');
    }
  };

  // 2. Leitura de voz (Text-to-Speech)
  const handleToggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showNotification('A síntese de voz não é suportada neste navegador.');
      return;
    }

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // 3. Exportação do Histórico em TXT
  const handleExportHistory = () => {
    if (messages.length === 0) {
      showNotification('Nenhuma mensagem para exportar.');
      return;
    }

    let exportContent = `=== HISTÓRICO DE CONVERSA - AI STUDIO PLAYGROUND ===\n`;
    exportContent += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
    exportContent += `Modelo: ${model} | Temperatura: ${temperature}\n\n`;

    messages.forEach((msg) => {
      const author = msg.role === 'user' ? 'USUÁRIO' : 'ASSISTENTE IA';
      exportContent += `[${msg.timestamp}] ${author}:\n`;
      if (msg.attachments && msg.attachments.length > 0) {
        exportContent += `Anexos: ${msg.attachments.map((a) => a.name).join(', ')}\n`;
      }
      exportContent += `${msg.content}\n\n`;
      exportContent += `------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_ai_playground_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Histórico exportado com sucesso!');
  };

  // 4. Anexos de Arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        showNotification(`O arquivo "${file.name}" ultrapassa o limite de 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newAttachment: AttachedFile = {
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          base64: base64,
          previewUrl: file.type.startsWith('image/') ? base64 : undefined,
        };

        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Histórico limpo. Como posso te ajudar agora?',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setShowClearConfirm(false);
    showNotification('Histórico de mensagens redefinido.');
  };

  // 5. Envio de Mensagem (com fallback inteligente client-side e backend)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputPrompt.trim() && attachments.length === 0) || isLoading) return;

    const currentPrompt = inputPrompt.trim();
    const currentAttachments = [...attachments];

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: currentPrompt || (currentAttachments.length > 0 ? 'Analise os arquivos em anexo, por favor.' : ''),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setAttachments([]);
    setIsLoading(true);

    try {
      let aiReply = '';

      // Tenta prioritariamente o endpoint do servidor com Gemini 3.8 Flash
      const fileParts = currentAttachments.map((att) => ({
        inlineData: {
          mimeType: att.type,
          data: att.base64.split(',')[1] || att.base64,
        },
      }));

      try {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage.content,
            fileParts: fileParts,
            apiKey: apiKey,
            model: effectiveModel,
            temperature: temperature,
            systemInstruction: systemInstruction,
            history: messages.slice(-8).map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiReply = data.reply || 'Sem resposta gerada pelo assistente.';
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Erro do servidor (${response.status})`);
        }
      } catch (backendErr: any) {
        // Fallback direto se houver chave configurada e o backend falhar
        const cleanApiKey = apiKey.trim();
        if (cleanApiKey) {
          const parts: any[] = [];
          for (const att of currentAttachments) {
            const pureBase64 = att.base64.split(',')[1] || att.base64;
            parts.push({
              inline_data: {
                mime_type: att.type,
                data: pureBase64,
              },
            });
          }
          if (userMessage.content) {
            parts.push({ text: userMessage.content });
          }

          const contents = [
            ...messages.slice(-8).map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
            {
              role: 'user',
              parts: parts,
            },
          ];

          const bodyPayload: any = {
            contents: contents,
            generationConfig: {
              temperature: temperature,
            },
          };

          if (systemInstruction && systemInstruction.trim()) {
            bodyPayload.system_instruction = {
              parts: [{ text: systemInstruction.trim() }],
            };
          }

          const directResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${cleanApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bodyPayload),
            }
          );

          if (directResponse.ok) {
            const data = await directResponse.json();
            aiReply =
              data.candidates?.[0]?.content?.parts?.[0]?.text ||
              'Não foi possível extrair a resposta do modelo.';
          } else {
            throw backendErr;
          }
        } else {
          throw backendErr;
        }
      }

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Erro no processamento da IA:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Não foi possível obter a resposta: ${err.message || 'Verifique sua chave de API ou conexão de rede.'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100 relative">
      {/* Toast / Notificação Integrada */}
      {bannerNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{bannerNotice}</span>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Confirmação de Limpar Histórico */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl">
            <Trash2 className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">Limpar histórico de mensagens?</h3>
            <p className="text-xs text-slate-400 mb-4">Essa ação apagará todas as mensagens atuais da conversa.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-4 py-2 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors font-medium cursor-pointer"
              >
                Sim, limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AI Studio Playground</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> {effectiveModel}
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                Temp: {temperature}
              </span>
            </div>
            <p className="text-xs text-slate-400">Ambiente multimodal com texto, anexos e áudio</p>
          </div>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2">
          {hasSettingsHandler && (
            <button
              type="button"
              onClick={handleTriggerSettings}
              title="Configurações do Modelo e Chave de API"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Configurações</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportHistory}
            title="Exportar conversa em arquivo .txt"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar .txt</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            title="Limpar histórico"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de Status da Chave de API */}
      {hasSettingsHandler && (
        <div className="px-5 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              Chave de API:{' '}
              {apiKey ? (
                <span className="text-emerald-400 font-mono font-medium">Chave ativa configurada</span>
              ) : (
                <span className="text-slate-400 font-mono">Padrão do servidor (ou insira sua chave nas configs)</span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={handleTriggerSettings}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 shrink-0 ml-2 cursor-pointer"
          >
            Alterar chave/modelo
          </button>
        </div>
      )}

      {/* Lista de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user' ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`group relative rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] sm:max-w-[75%] border ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white border-indigo-500/50 rounded-tr-none'
                  : 'bg-slate-900 text-slate-200 border-slate-800 rounded-tl-none shadow-md'
              }`}
            >
              {/* Anexos */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-2.5 flex flex-wrap gap-2">
                  {msg.attachments.map((att, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-1.5 bg-slate-950/40 border border-white/10 rounded-lg text-xs"
                    >
                      {att.previewUrl ? (
                        <img src={att.previewUrl} alt={att.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <FileText className="w-5 h-5 text-indigo-300" />
                      )}
                      <div className="max-w-[140px] truncate">
                        <p className="font-medium truncate">{att.name}</p>
                        <span className="text-[10px] opacity-70">{(att.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Conteúdo */}
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Rodapé e Ferramentas */}
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 gap-4">
                <span>{msg.timestamp}</span>

                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copiar resposta"
                      className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSpeak(msg.id, msg.content)}
                      title={speakingMessageId === msg.id ? 'Parar leitura' : 'Ouvir resposta'}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        speakingMessageId === msg.id
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {speakingMessageId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Gerando resposta no AI Studio...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Entrada */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {attachments.map((att, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
              >
                {att.previewUrl ? (
                  <img src={att.previewUrl} alt={att.name} className="w-7 h-7 object-cover rounded" />
                ) : (
                  <FileText className="w-4 h-4 text-indigo-400" />
                )}
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar Imagem ou Documento (PDF/TXT)"
            className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 shrink-0 cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Envie sua mensagem ou pergunta sobre os anexos..."
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          <button
            type="submit"
            disabled={isLoading || (!inputPrompt.trim() && attachments.length === 0)}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiStudioPlayground;
