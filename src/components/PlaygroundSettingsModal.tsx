import React, { useState } from 'react';
import { X, Sparkles, Key, Cpu, Sliders, FileCode, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GabiAvatar } from './GabiAvatar';

interface PlaygroundSettingsModalProps {
  apiKey: string;
  model: string;
  temperature: number;
  systemInstruction: string;
  onSave: (settings: {
    apiKey: string;
    model: string;
    temperature: number;
    systemInstruction: string;
  }) => void;
  onClose: () => void;
}

export const PlaygroundSettingsModal: React.FC<PlaygroundSettingsModalProps> = ({
  apiKey: initialKey,
  model: initialModel,
  temperature: initialTemp,
  systemInstruction: initialInstruction,
  onSave,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState(initialKey);
  const [model, setModel] = useState(initialModel);
  const [temperature, setTemperature] = useState(initialTemp);
  const [systemInstruction, setSystemInstruction] = useState(initialInstruction);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados de validação da API Key
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>(
    initialKey.trim() ? 'valid' : 'idle'
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const availableModels = [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Padrão e Recomendado - Mais rápido, inteligente e preciso)' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Raciocínio Complexo e Profundo)' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Ultrarrápido)' },
  ];

  // Função de validação leve da API Key
  const verifyApiKey = async (keyToTest: string): Promise<boolean> => {
    const cleanKey = keyToTest.trim();
    if (!cleanKey) {
      setValidationState('idle');
      setValidationMessage(null);
      return true; // Chave vazia é permitida (usa chave padrão do servidor)
    }

    setIsValidating(true);
    setValidationMessage(null);

    try {
      // Requisição leve para verificar a validade da chave sem consumir tokens de geração
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`
      );

      if (response.ok) {
        setValidationState('valid');
        setValidationMessage('Chave de API válida e autenticada com sucesso!');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message ||
          `Chave inválida ou não autorizada (HTTP ${response.status}). Verifique no Google AI Studio.`;
        setValidationState('invalid');
        setValidationMessage(errorMessage);
        return false;
      }
    } catch (err: any) {
      setValidationState('invalid');
      setValidationMessage('Falha ao conectar com a API do Google Gemini. Verifique sua conexão.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualVerify = async () => {
    await verifyApiKey(apiKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanKey = apiKey.trim();

    // Se houver uma chave informada e ainda não foi validada ou está inválida
    if (cleanKey) {
      const isValid = await verifyApiKey(cleanKey);
      if (!isValid) {
        return; // Bloqueia o salvamento se a chave for inválida
      }
    }

    onSave({
      apiKey: cleanKey,
      model,
      temperature,
      systemInstruction,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GabiAvatar size={36} showOnlineStatus={true} statusBadgeSize={9} alt="Professora Gabi" />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Configurações do Tira-Dúvidas Gabaritou AI
              </h3>
              <p className="text-xs text-slate-400">Personalize o modelo de IA e preferências da Professora Gabi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-200 text-sm">
          {/* API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Chave da API Gemini (Opcional)
              </label>

              {apiKey.trim() && (
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={isValidating}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-2 disabled:opacity-50 cursor-pointer"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <span>Testar Chave</span>
                  )}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValidationState('idle');
                  setValidationMessage(null);
                }}
                placeholder="Deixe em branco para usar a chave padrão do Gabaritou"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none font-mono transition-colors ${
                  validationState === 'valid'
                    ? 'border-emerald-500/60 focus:border-emerald-500'
                    : validationState === 'invalid'
                    ? 'border-rose-500/60 focus:border-rose-500'
                    : 'border-slate-800 focus:border-purple-500'
                }`}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isValidating && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                {!isValidating && validationState === 'valid' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                {!isValidating && validationState === 'invalid' && (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            </div>

            {/* Mensagem de Feedback da Validação */}
            {validationMessage && (
              <div
                className={`text-xs p-2.5 rounded-xl border flex items-start gap-2 ${
                  validationState === 'valid'
                    ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
                }`}
              >
                {validationState === 'valid' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-tight">{validationMessage}</span>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              Caso você queira utilizar uma chave própria do Gemini, insira aqui. O Gabaritou fará uma validação leve antes de salvar.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Modelo de Linguagem
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Temperatura (Criatividade)
              </label>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                {temperature}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0.0 (Preciso / Focado)</span>
              <span>1.0 (Balanceado)</span>
              <span>2.0 (Mais Criativo)</span>
            </div>
          </div>

          {/* System Instructions */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              Instruções do Sistema (System Instruction)
            </label>
            <textarea
              rows={3}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Ex: Instrua a Professora Gabi a responder com foco pedagógico no ENEM e vestibulares em etapas claras..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isValidating}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Chave...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PlaygroundSettingsModal;
