import React, { useState } from 'react';
import { ShieldAlert, MessageSquare, Send, Sparkles, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Flame, User } from 'lucide-react';

interface ChatTurn {
  autor: 'aluno' | 'advogado';
  texto: string;
  perguntaDesafio?: string;
  repertorioProvocativo?: string;
  statusDefesa?: 'fraca' | 'em_construcao' | 'solida';
}

export const DevilAdvocateSection: React.FC = () => {
  const [tema, setTema] = useState<string>('Desafios para a preservação da saúde mental na era digital');
  const [tese, setTese] = useState<string>('O uso excessivo de redes sociais amplia a ansiedade e a alienação social entre os jovens.');
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [inputResposta, setInputResposta] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<ChatTurn[]>([]);

  const handleStartDebate = async () => {
    if (!tema.trim() || !tese.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/devil-advocate-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, tese }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setChat([
          { autor: 'aluno', texto: `Entendi o tema "${tema}". Minha tese é: ${tese}` },
          {
            autor: 'advogado',
            texto: d.contestacao_principal || 'Discordo parcialmente! As redes sociais também conectam pessoas e geram redes de apoio psicológico.',
            perguntaDesafio: d.pergunta_desafio || 'Como você prova que a tecnologia é a causa principal e não apenas um sintoma da solidão moderna?',
            repertorioProvocativo: d.repertorio_provocativo || 'Considere a visão de Manuel Castells em "A Sociedade em Rede".',
            statusDefesa: d.status_defesa || 'fraca',
          },
        ]);
        setIsStarted(true);
      }
    } catch (e) {
      console.error('Erro ao iniciar debate:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!inputResposta.trim() || isLoading) return;
    const currentInput = inputResposta.trim();
    setInputResposta('');

    const newChat: ChatTurn[] = [...chat, { autor: 'aluno', texto: currentInput }];
    setChat(newChat);
    setIsLoading(true);

    try {
      const res = await fetch('/api/devil-advocate-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tema,
          tese,
          historico: newChat,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setChat((prev) => [
          ...prev,
          {
            autor: 'advogado',
            texto: d.contestacao_principal,
            perguntaDesafio: d.pergunta_desafio,
            repertorioProvocativo: d.repertorio_provocativo,
            statusDefesa: d.status_defesa || 'em_construcao',
          },
        ]);
      }
    } catch (e) {
      console.error('Erro no debate:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const lastTurn = chat[chat.length - 1];
  const isDefesaSolida = lastTurn?.statusDefesa === 'solida';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-rose-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <ShieldAlert className="w-3.5 h-3.5" /> Arena Socrática de Redação
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              😈 Modo Advogado do Diabo
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Enfrente a IA em um debate crítico antes de escrever sua redação. A IA contesta sua tese e força você a defender seu ponto com repertórios socioculturais imbatíveis!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-xl">
              ⚔️
            </div>
            <div>
              <span className="text-xs text-rose-200 font-bold block uppercase tracking-wider">Debate Argumentativo</span>
              <span className="text-sm font-black text-white">Defenda sua Tese</span>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: INITIAL TEMA & TESE SETUP */}
      {!isStarted ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-rose-600" />
            Defina o Tema e a Tese que Você Pretende Defender:
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Tema da Redação:
              </label>
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="Ex: Os desafios da alfabetização financeira no Brasil..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Sua Tese Principal (Ponto de Vista):
              </label>
              <textarea
                value={tese}
                onChange={(e) => setTese(e.target.value)}
                rows={2}
                placeholder="Ex: A omissão escolar aliada ao consumismo exacerbado gera endividamento precoce."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={handleStartDebate}
            disabled={isLoading || !tema.trim() || !tese.trim()}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black transition cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>O Advogado do Diabo está preparando os contra-argumentos...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                <span>Iniciar Arena de Debate Argumentativo 🔥</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* STEP 2: ACTIVE DEBATE CHAT */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 block">
                Tema: {tema}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Tese: "{tese}"
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                isDefesaSolida
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isDefesaSolida ? 'Defesa Sólida! ✅' : 'Em Debate ⚔️'}
              </span>
            </div>
          </div>

          {/* CHAT MESSAGES STREAM */}
          <div className="space-y-4 max-h-[450px] overflow-y-auto p-2 scrollbar-none">
            {chat.map((msg, idx) => {
              const isAdvogado = msg.autor === 'advogado';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isAdvogado ? 'justify-start' : 'justify-end'}`}
                >
                  {isAdvogado && (
                    <div className="w-8 h-8 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                      😈
                    </div>
                  )}

                  <div
                    className={`max-w-xl p-4 rounded-3xl text-xs space-y-2 ${
                      isAdvogado
                        ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-slate-900 dark:text-slate-100'
                        : 'bg-indigo-600 text-white font-bold'
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{msg.texto}</p>

                    {msg.perguntaDesafio && (
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 font-bold text-rose-900 dark:text-rose-200 space-y-1">
                        <span className="text-[10px] uppercase font-black text-rose-600 block">
                          ❓ Desafio da IA:
                        </span>
                        <p>{msg.perguntaDesafio}</p>
                      </div>
                    )}

                    {msg.repertorioProvocativo && (
                      <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                        💡 Contraponto: {msg.repertorioProvocativo}
                      </div>
                    )}
                  </div>

                  {!isAdvogado && (
                    <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* INPUT FOR NEXT RESPONSE */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputResposta}
              onChange={(e) => setInputResposta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendResponse()}
              disabled={isLoading}
              placeholder="Defenda seu ponto citado autores, leis ou repertórios..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            />

            <button
              onClick={handleSendResponse}
              disabled={isLoading || !inputResposta.trim()}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Defender</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
