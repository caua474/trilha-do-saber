import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Send, CheckCircle2, HelpCircle, Code, Clock, Zap } from 'lucide-react';

export interface DayNightResponse {
  modo_ativo: 'modo_dia' | 'modo_noite';
  saudacao: string;
  meta_do_dia?: string;
  plano_estudo?: string[];
  resumo_noturno?: string;
  perguntas_revisao?: string[];
}

export interface DayNightModeSectionProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onSetTheme?: (theme: 'light' | 'dark') => void;
}

export const DayNightModeSection: React.FC<DayNightModeSectionProps> = ({ theme, onToggleTheme, onSetTheme }) => {
  const [mensagem, setMensagem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DayNightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const inputMessage = textToSend || mensagem;
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/day-night-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem: inputMessage }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Erro ao comunicar com o motor GabaritaAí.');
      }

      setResult(resData.data);
      if (!textToSend) {
        setMensagem('');
      }
    } catch (err: any) {
      console.error('Erro no modo dia/noite:', err);
      setError(err.message || 'Falha ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                GabaritaAí AI Engine
              </span>
              <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                Modo Dia & Noite
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Assistente Inteligente: Planejamento & Revisão Noturna
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-xs text-indigo-200/80 max-w-xs hidden md:block">
            A IA analisa sua intenção ("dia", "manhã", "planejamento" vs "noite", "revisão") para alternar o modo.
          </p>
          {onToggleTheme && (
            <div className="flex items-center bg-indigo-950/80 p-1 rounded-2xl border border-indigo-700/60 shrink-0">
              <button
                type="button"
                onClick={() => onSetTheme ? onSetTheme('light') : (theme === 'dark' && onToggleTheme())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer pointer-events-auto ${
                  theme === 'light'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
                }`}
                title="Modo Dia (Tema Claro)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>☀️ Dia</span>
              </button>
              <button
                type="button"
                onClick={() => onSetTheme ? onSetTheme('dark') : (theme === 'light' && onToggleTheme())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer pointer-events-auto ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
                }`}
                title="Modo Noite (Tema Escuro)"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>🌙 Noite</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-indigo-300 mr-1">Exemplos rápidos:</span>
        <button
          onClick={() => {
            if (onSetTheme) onSetTheme('light');
            setMensagem('Quero o meu planejamento do dia e o que estudar hoje');
            handleSend('Quero o meu planejamento do dia e o que estudar hoje');
          }}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer pointer-events-auto"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>☀️ MODO DIA ("o que estudar hoje")</span>
        </button>

        <button
          onClick={() => {
            if (onSetTheme) onSetTheme('dark');
            setMensagem('Quero meu resumo do dia e perguntas para revisão da noite');
            handleSend('Quero meu resumo do dia e perguntas para revisão da noite');
          }}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer pointer-events-auto"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>🌙 MODO NOITE ("revisão do dia")</span>
        </button>
      </div>

      {/* Custom Message Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem (ex: 'Planejamento para o dia' ou 'Revisão noturna de hoje')..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !mensagem.trim()}
          className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl font-extrabold text-sm flex items-center space-x-2 shadow-md transition shrink-0"
        >
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Enviar</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Display Output */}
      {result && (
        <div className="space-y-4 pt-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center space-x-1.5 ${
                  result.modo_ativo === 'modo_dia'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {result.modo_ativo === 'modo_dia' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>MODO DIA ATIVO</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>MODO NOITE ATIVO</span>
                  </>
                )}
              </span>
            </div>

            <button
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center space-x-1 underline"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showJsonRaw ? 'Ocultar JSON Bruto' : 'Ver JSON Backend'}</span>
            </button>
          </div>

          {/* JSON Raw Inspection */}
          {showJsonRaw && (
            <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          {/* Formatted Output Card */}
          {result.modo_ativo === 'modo_dia' ? (
            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-black text-base">
                <Sun className="w-5 h-5 text-amber-400" />
                <h4>{result.saudacao}</h4>
              </div>

              {result.meta_do_dia && (
                <div className="bg-amber-900/30 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200">
                  <strong className="text-amber-400">🎯 Meta do Dia:</strong> {result.meta_do_dia}
                </div>
              )}

              {result.plano_estudo && result.plano_estudo.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    📋 Plano de Estudos de Hoje:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.plano_estudo.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-amber-500/20 p-3 rounded-xl text-xs font-medium text-slate-200 flex items-start space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-300 font-black text-base">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h4>{result.saudacao}</h4>
              </div>

              {result.resumo_noturno && (
                <div className="bg-indigo-900/30 border border-indigo-500/20 p-3 rounded-xl text-xs text-indigo-200">
                  <strong className="text-indigo-300">🌙 Resumo Noturno:</strong> {result.resumo_noturno}
                </div>
              )}

              {result.perguntas_revisao && result.perguntas_revisao.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                    ❓ Perguntas de Revisão Noturna:
                  </h5>
                  <div className="space-y-2">
                    {result.perguntas_revisao.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-indigo-500/20 p-3 rounded-xl text-xs font-medium text-slate-200 flex items-start space-x-2"
                      >
                        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
