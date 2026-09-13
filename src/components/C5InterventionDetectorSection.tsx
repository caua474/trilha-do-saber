import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Sparkles, AlertCircle, Award, BookOpen, ChevronRight } from 'lucide-react';

interface ElementoAnalysis {
  presente: boolean;
  trecho: string | null;
  comentario: string;
}

interface C5Data {
  nota_c5: number;
  elementos: {
    agente: ElementoAnalysis;
    acao: ElementoAnalysis;
    meio_modo: ElementoAnalysis;
    efeito: ElementoAnalysis;
    detalhamento: ElementoAnalysis;
  };
  sugestao_para_200_pontos: string;
}

export const C5InterventionDetectorSection: React.FC = () => {
  const [textoConclusao, setTextoConclusao] = useState<string>(
    'Portanto, cabe ao Ministério da Educação, em parceria com as secretarias estaduais, promover palestras sobre saúde mental nas escolas públicas, por meio de contratações de psicólogos qualificados, a fim de conscientizar os jovens e reduzir o avanço da depressão na juventude, garantindo o bem-estar social.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultado, setResultado] = useState<C5Data | null>({
    nota_c5: 200,
    elementos: {
      agente: { presente: true, trecho: 'Ministério da Educação, em parceria com as secretarias estaduais', comentario: 'Agente governamental legítimo e específico.' },
      acao: { presente: true, trecho: 'promover palestras sobre saúde mental nas escolas públicas', comentario: 'Ação afirmativa e concreta.' },
      meio_modo: { presente: true, trecho: 'por meio de contratações de psicólogos qualificados', comentario: 'Mecanismo de execução claro com conector "por meio de".' },
      efeito: { presente: true, trecho: 'a fim de conscientizar os jovens e reduzir o avanço da depressão na juventude', comentario: 'Objetivo final social bem delimitado.' },
      detalhamento: { presente: true, trecho: 'garantindo o bem-estar social', comentario: 'Detalhamento do efeito/impacto gerado.' },
    },
    sugestao_para_200_pontos: 'Sua proposta de intervenção contempla com perfeição os 5 elementos obrigatórios da C5 no ENEM! Nota Máxima de 200 Pontos Garantida.',
  });

  const handleAnalyzeC5 = async () => {
    if (!textoConclusao.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/detect-c5-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoConclusao: textoConclusao.trim() }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResultado(data.data);
      }
    } catch (e) {
      console.error('Erro na análise C5:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const ELEMENT_LABELS: Record<string, { title: string; subtitle: string; icon: string }> = {
    agente: { title: '1. Agente', subtitle: 'Quem executa a ação?', icon: '🏛️' },
    acao: { title: '2. Ação', subtitle: 'O que deve ser feito?', icon: '⚡' },
    meio_modo: { title: '3. Meio / Modo', subtitle: 'Como ou por qual mecanismo?', icon: '⚙️' },
    efeito: { title: '4. Efeito', subtitle: 'Para que serve/Qual a finalidade?', icon: '🎯' },
    detalhamento: { title: '5. Detalhamento', subtitle: 'Exemplo ou detalhe explicativo', icon: '🔍' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> Análise C5 do ENEM (Proposta de Intervenção)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🔍 Detector dos 5 Elementos da C5 (Redação 200 Pontos)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Cole o parágrafo de conclusão da sua redação. A IA mapeia instantaneamente Agente, Ação, Meio/Modo, Efeito e Detalhamento, calculando sua nota de Competência 5!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black text-xl">
              200
            </div>
            <div>
              <span className="text-xs text-emerald-200 font-bold block uppercase tracking-wider">Competência 5 ENEM</span>
              <span className="text-sm font-black text-white">Validação Automática</span>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
          Cole o parágrafo de Conclusão (Proposta de Intervenção):
        </label>

        <textarea
          value={textoConclusao}
          onChange={(e) => setTextoConclusao(e.target.value)}
          rows={4}
          placeholder="Portanto, cabe ao Ministério da..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white leading-relaxed"
        />

        <button
          onClick={handleAnalyzeC5}
          disabled={isLoading || !textoConclusao.trim()}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Verificando os 5 Elementos da C5...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Analisar Elementos e Calcular Nota C5 (0 a 200)</span>
            </>
          )}
        </button>
      </div>

      {/* ANALYSIS RESULTS */}
      {resultado && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                Resultado da Competência 5
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Nota C5 Calculada: {resultado.nota_c5} de 200 Pontos
              </h3>
            </div>

            <div className={`px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 ${
              resultado.nota_c5 === 200
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              <Award className="w-4 h-4" />
              <span>{resultado.nota_c5 === 200 ? 'Proposta Completa (200 pts)' : 'Proposta Incompleta'}</span>
            </div>
          </div>

          {/* 5 ELEMENTS CHECKLIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(resultado.elementos).map(([key, item]) => {
              const meta = ELEMENT_LABELS[key] || { title: key, subtitle: '', icon: '📌' };
              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition space-y-2 ${
                    item.presente
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{meta.icon}</span>
                      <span>{meta.title}</span>
                    </span>

                    {item.presente ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500 font-bold block">{meta.subtitle}</span>

                  {item.trecho ? (
                    <p className="text-[11px] font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{item.trecho}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-rose-600 font-bold italic">
                      ❌ Elemento Ausente no texto.
                    </p>
                  )}

                  <p className="text-[10px] text-slate-500 font-medium">
                    {item.comentario}
                  </p>
                </div>
              );
            })}
          </div>

          {/* REWRITE RECOMMENDATION */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
            <span className="text-[10px] uppercase font-black text-indigo-700 dark:text-indigo-300 block">
              💡 Orientação para Garantir 200 Pontos:
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              {resultado.sugestao_para_200_pontos}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
