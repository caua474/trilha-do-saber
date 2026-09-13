import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, AlertCircle, RefreshCw, Award, Copy, Check } from 'lucide-react';

interface ElementoStatus {
  nome: string;
  identificado: boolean;
  trecho?: string;
  feedback?: string;
  pontos: number;
}

interface AvaliacaoC5 {
  notaC5: number;
  elementos: {
    agente: ElementoStatus;
    acao: ElementoStatus;
    meioModo: ElementoStatus;
    efeito: ElementoStatus;
    detalhamento: ElementoStatus;
  };
  analiseGeral: string;
  sugestaoAprimoramento: string;
}

export default function RedacaoCorretor() {
  const [texto, setTexto] = useState('');
  const [isAvaliando, setIsAvaliando] = useState(false);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoC5 | null>(null);
  const [copied, setCopied] = useState(false);

  const exemploPadrao =
    'Portanto, cabe ao Ministério da Educação (MEC), em parceria com as secretarias estaduais, promover oficinas de letramento digital e conscientização crítica nas escolas públicas, por meio da contratação de especialistas em segurança da informação e da distribuição de materiais didáticos interativos, a fim de capacitar os jovens a identificarem notícias falsas e combaterem a desinformação, garantindo um ambiente democrático e seguro para toda a comunidade escolar.';

  const handleCarregarExemplo = () => {
    setTexto(exemploPadrao);
    setAvaliacao(null);
  };

  const handleAvaliar = () => {
    if (!texto.trim()) return;

    setIsAvaliando(true);
    setTimeout(() => {
      const lower = texto.toLowerCase();

      // Heurísticas de detecção dos 5 elementos da C5
      const temAgente =
        lower.includes('ministério') ||
        lower.includes('governo') ||
        lower.includes('mec') ||
        lower.includes('escola') ||
        lower.includes('família') ||
        lower.includes('sociedade') ||
        lower.includes('ong') ||
        lower.includes('mídia') ||
        lower.includes('cabe a') ||
        lower.includes('compete a') ||
        lower.includes('deve o') ||
        lower.includes('cabe ao');

      const temAcao =
        lower.includes('promover') ||
        lower.includes('criar') ||
        lower.includes('desenvolver') ||
        lower.includes('implementar') ||
        lower.includes('realizar') ||
        lower.includes('garantir') ||
        lower.includes('oferecer') ||
        lower.includes('fiscalizar') ||
        lower.includes('investir') ||
        lower.includes('deve');

      const temMeioModo =
        lower.includes('por meio') ||
        lower.includes('através de') ||
        lower.includes('mediante') ||
        lower.includes('com o auxílio') ||
        lower.includes('por intermédio') ||
        lower.includes('pela criação') ||
        lower.includes('pelo incentivo');

      const temEfeito =
        lower.includes('a fim de') ||
        lower.includes('com o fito de') ||
        lower.includes('para que') ||
        lower.includes('com o intuito') ||
        lower.includes('com o objetivo') ||
        lower.includes('visando a') ||
        lower.includes('visando ao') ||
        lower.includes('de modo a');

      const temDetalhamento =
        texto.includes('(') ||
        texto.includes(',') && (lower.includes('como') || lower.includes('em especial') || lower.includes('garantindo') || lower.includes('especialmente') || lower.includes('em parceria'));

      const count = [temAgente, temAcao, temMeioModo, temEfeito, temDetalhamento].filter(Boolean).length;
      const nota = count * 40;

      setAvaliacao({
        notaC5: nota,
        elementos: {
          agente: {
            nome: '1. Agente (Quem?)',
            identificado: temAgente,
            trecho: temAgente ? 'Órgão / Entidade identificada com legitimidade.' : undefined,
            feedback: temAgente
              ? 'Agente bem definido e claro.'
              : 'Falta especificar claramente quem executará a intervenção (Ex: Ministério da Educação, Ministério da Saúde).',
            pontos: temAgente ? 40 : 0,
          },
          acao: {
            nome: '2. Ação (O que?)',
            identificado: temAcao,
            trecho: temAcao ? 'Ação interventiva clara.' : undefined,
            feedback: temAcao
              ? 'Ação afirmativa e concreta expressa com clareza.'
              : 'Falta indicar uma ação prática realizável com verbo afirmativo (Ex: "promover oficinas", "implementar diretrizes").',
            pontos: temAcao ? 40 : 0,
          },
          meioModo: {
            nome: '3. Meio/Modo (Como?)',
            identificado: temMeioModo,
            trecho: temMeioModo ? 'Mecanismo de execução articulado.' : undefined,
            feedback: temMeioModo
              ? 'Conector modal utilizado corretamente (Ex: "por meio de", "mediante").'
              : 'Utilize conectivos como "por meio de" ou "mediante" para explicar a forma de execução da ação.',
            pontos: temMeioModo ? 40 : 0,
          },
          efeito: {
            nome: '4. Efeito/Finalidade (Para quê?)',
            identificado: temEfeito,
            trecho: temEfeito ? 'Finalidade e impacto esperados identificados.' : undefined,
            feedback: temEfeito
              ? 'Finalidade social delimitada com clareza (Ex: "a fim de", "com o fito de").'
              : 'Indique a finalidade social com "a fim de que" ou "com o objetivo de combater/reduzir".',
            pontos: temEfeito ? 40 : 0,
          },
          detalhamento: {
            nome: '5. Detalhamento (Explicação adicional)',
            identificado: temDetalhamento,
            trecho: temDetalhamento ? 'Desdobramento ou exemplificação adicionados.' : undefined,
            feedback: temDetalhamento
              ? 'Detalhamento presente, enriquecendo um dos 4 pilares anteriores.'
              : 'Adicione uma oração explicativa, exemplificativa ou justificativa a mais para garantir a nota 200.',
            pontos: temDetalhamento ? 40 : 0,
          },
        },
        analiseGeral:
          count === 5
            ? 'Excelente! Sua proposta atende com perfeição todos os 5 elementos obrigatórios da grade do INEP.'
            : count >= 3
            ? 'Bom caminho! Você já possui a maioria dos elementos, mas precisa ajustar os pontos destacados para cravar os 200 pontos.'
            : 'Atenção! Sua proposta precisa incorporar mais elementos formais para evitar perda de pontos na C5.',
        sugestaoAprimoramento:
          count === 5
            ? 'Mantenha essa fórmula: [Agente + Detalhamento do Agente] + [Ação] + [Por meio de...] + [A fim de...] + [Detalhamento do Efeito].'
            : 'Fórmula 200 pontos: "Portanto, cabe ao [AGENTE], em parceria com [DETALHAMENTO], [AÇÃO], por meio de [MEIO/MODO], a fim de [EFEITO]."',
      });

      setIsAvaliando(false);
    }, 600);
  };

  const handleCopiar = () => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="redacao-corretor-container" className="p-4 bg-slate-950 text-white min-h-screen pb-24 max-w-4xl mx-auto">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <span>✍️</span> Corretor de Redação
          </h2>
          <p className="text-xs text-slate-400">Análise focada na Competência 5 do ENEM (0 a 200 pontos)</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCarregarExemplo}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Carregar Exemplo Nota 200
          </button>
          {texto && (
            <button
              type="button"
              onClick={handleCopiar}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Copiar texto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cole seu texto ou proposta de intervenção aqui..."
        className="w-full h-48 bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none mb-4 leading-relaxed font-sans placeholder:text-slate-500"
      />

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button
          type="button"
          onClick={handleAvaliar}
          disabled={!texto.trim() || isAvaliando}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isAvaliando ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>Avaliando os 5 Elementos...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Avaliar Competência 5</span>
            </>
          )}
        </button>

        {texto && (
          <button
            type="button"
            onClick={() => {
              setTexto('');
              setAvaliacao(null);
            }}
            className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-sm transition-all cursor-pointer font-medium"
          >
            Limpar
          </button>
        )}
      </div>

      {/* RESULTADO DA AVALIAÇÃO */}
      {avaliacao && (
        <div className="mb-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-xl animate-in fade-in slide-in-from-top-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Pontuação C5</div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <span>{avaliacao.notaC5} / 200 Pontos</span>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                avaliacao.notaC5 === 200
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : avaliacao.notaC5 >= 120
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {avaliacao.notaC5 === 200 ? 'Nota Máxima C5' : `${Math.round(avaliacao.notaC5 / 40)} de 5 Elementos`}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{avaliacao.analiseGeral}</p>

          {/* LISTA DETALHADA DOS ELEMENTOS COM STATUS */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detalhamento dos 5 Elementos:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(avaliacao.elementos).map(([key, elem]) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-1.5 ${
                    elem.identificado
                      ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-800/50 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {elem.identificado ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{elem.nome}</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${elem.identificado ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                      +{elem.pontos} pts
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-tight">{elem.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DICA DE APRIMORAMENTO */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300">Fórmula de Sucesso para C5:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">{avaliacao.sugestaoAprimoramento}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card da Estrutura dos 5 Elementos */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
          <span>Elementos da C5:</span>
          <span className="text-[10px] text-slate-500">40 pontos cada</span>
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold">1.</span> Agente <span className="text-[10px] opacity-60">(Quem faz?)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold">2.</span> Ação <span className="text-[10px] opacity-60">(O que faz?)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold">3.</span> Meio/Modo <span className="text-[10px] opacity-60">(Como faz?)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold">4.</span> Efeito <span className="text-[10px] opacity-60">(Para quê?)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400 col-span-2 flex items-center gap-1.5">
            <span className="text-indigo-400 font-bold">5.</span> Detalhamento <span className="text-[10px] opacity-60">(Informação ou desdobramento a mais)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RedacaoCorretor };
