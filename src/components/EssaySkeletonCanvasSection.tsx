import React, { useState } from 'react';
import { PenTool, CheckCircle2, AlertTriangle, Copy, Sparkles, Send, ArrowRight, ShieldCheck, FileText, Check } from 'lucide-react';

interface EssaySkeletonData {
  tema: string;
  tese: string;
  arg1Topico: string;
  arg1Repertorio: string;
  arg1Impacto: string;
  arg2Topico: string;
  arg2Repertorio: string;
  arg2Impacto: string;
  propAgente: string;
  propAcao: string;
  propMeioModo: string;
  propEfeito: string;
  propDetalhamento: string;
}

const PRESET_TEMAS = [
  'Democratização do acesso aos meios digitais e inclusão social',
  'Desafios para o combate ao etarismo e valorização do idoso no Brasil',
  'Impactos da inteligência artificial na educação e mercado de trabalho',
  'Caminhos para combater a insegurança alimentar e a fome no Brasil',
];

export const EssaySkeletonCanvasSection: React.FC<{
  onSendToAnalyzer?: (skeletonText: string) => void;
}> = ({ onSendToAnalyzer }) => {
  const [data, setData] = useState<EssaySkeletonData>({
    tema: PRESET_TEMAS[0],
    tese: 'A omissão governamental associada à passividade social perpetua a problemática em questão.',
    arg1Topico: 'Sob essa ótica, a falta de investimentos em infraestrutura pública atua como motor do entrave.',
    arg1Repertorio: 'Teoria da Cidadania Mutilada de Milton Santos',
    arg1Impacto: 'Isso gera a exclusão sistemática de parcelas vulneráveis da população.',
    arg2Topico: 'Ademais, a ausência de debates no meio escolar fomenta a banalização da pauta.',
    arg2Repertorio: 'Conceito de Banalidade do Mal de Hannah Arendt',
    arg2Impacto: 'Dessa forma, a sociedade acostuma-se com o problema sem buscar transformações.',
    propAgente: 'O Ministério da Educação (MEC), em parceria com o Ministério da Tecnologia,',
    propAcao: 'deve implementar oficinas e laboratórios digitais gratuitos nas escolas públicas,',
    propMeioModo: 'por meio do direcionamento de recursos do Fundo Nacional de Desenvolvimento da Educação (FNDE),',
    propEfeito: 'com o fito de promover a inclusão digital e democratizar o aprendizado,',
    propDetalhamento: 'detalhando a capacitação continuada de professores e disponibilização de internet fibra de alta velocidade.',
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Validate the 5 mandatory elements of the Intervention Proposal
  const hasAgente = data.propAgente.trim().length > 3;
  const hasAcao = data.propAcao.trim().length > 3;
  const hasMeioModo = data.propMeioModo.trim().length > 3;
  const hasEfeito = data.propEfeito.trim().length > 3;
  const hasDetalhamento = data.propDetalhamento.trim().length > 3;

  const elementsCount = [hasAgente, hasAcao, hasMeioModo, hasEfeito, hasDetalhamento].filter(Boolean).length;
  const proposalScore = Math.round((elementsCount / 5) * 100);

  const formatSkeletonText = (): string => {
    return `=== ESQUELETO GUIADO DE REDAÇÃO ===
TEMA: ${data.tema}

1. TESE & PROBLEMATIZAÇÃO:
${data.tese}

2. DESENVOLVIMENTO 1 (ARGUMENTO 1):
• Tópico Frasal: ${data.arg1Topico}
• Repertório Sociocultural: ${data.arg1Repertorio}
• Desdobramento/Impacto: ${data.arg1Impacto}

3. DESENVOLVIMENTO 2 (ARGUMENTO 2):
• Tópico Frasal: ${data.arg2Topico}
• Repertório Sociocultural: ${data.arg2Repertorio}
• Desdobramento/Impacto: ${data.arg2Impacto}

4. PROPOSTA DE INTERVENÇÃO (5 ELEMENTOS OBRIGATÓRIOS):
• Agente: ${data.propAgente}
• Ação: ${data.propAcao}
• Meio/Modo: ${data.propMeioModo}
• Efeito/Finalidade: ${data.propEfeito}
• Detalhamento: ${data.propDetalhamento}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatSkeletonText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-rose-500 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <PenTool className="w-3 h-3" /> Canvas de Estrutura
              </span>
              <span className="bg-rose-500/30 text-rose-200 border border-rose-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Planejamento Pré-Escrita
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ✍️ Esqueleto Guiado de Redação (Canvas)
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Monte os 4 pilares da sua redação antes de escrever o texto final. A IA verifica automaticamente se os 5 elementos obrigatórios da Proposta de Intervenção estão presentes!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              {proposalScore}%
            </div>
            <div>
              <span className="text-xs text-rose-300 font-bold uppercase tracking-wider block">Validação Competência 5</span>
              <span className="text-sm font-black text-white">
                {elementsCount}/5 Elementos Presentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PRESET TEMA SELECTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 block">
          🎯 Escolha ou digite o Tema da Redação:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_TEMAS.map((t) => (
            <button
              key={t}
              onClick={() => setData({ ...data, tema: t })}
              className={`p-3 rounded-2xl border text-xs font-bold text-left transition cursor-pointer ${
                data.tema === t
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-rose-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={data.tema}
          onChange={(e) => setData({ ...data, tema: e.target.value })}
          placeholder="Ou digite o tema desejado..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
        />
      </div>

      {/* CANVAS STEPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STEP 1: TESE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-black text-sm uppercase">
            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-xs">1</span>
            <h3>Tese & Problematização (Introdução)</h3>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Qual o seu Ponto de Vista Principal (Tese)?</label>
            <textarea
              rows={3}
              value={data.tese}
              onChange={(e) => setData({ ...data, tese: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* STEP 2: ARGUMENTO 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs">2</span>
            <h3>Desenvolvimento 1 (Causa / Negligência)</h3>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Tópico Frasal (Afirmação):</label>
              <input
                type="text"
                value={data.arg1Topico}
                onChange={(e) => setData({ ...data, arg1Topico: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Repertório Sociocultural Legitimado:</label>
              <input
                type="text"
                value={data.arg1Repertorio}
                onChange={(e) => setData({ ...data, arg1Repertorio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: ARGUMENTO 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-black text-sm uppercase">
            <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-xs">3</span>
            <h3>Desenvolvimento 2 (Consequência / Ausência de Debate)</h3>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Tópico Frasal (Afirmação):</label>
              <input
                type="text"
                value={data.arg2Topico}
                onChange={(e) => setData({ ...data, arg2Topico: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Repertório Sociocultural Legitimado:</label>
              <input
                type="text"
                value={data.arg2Repertorio}
                onChange={(e) => setData({ ...data, arg2Repertorio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* STEP 4: PROPOSTA DE INTERVENÇÃO (5 ELEMENTOS) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xs">4</span>
              <h3>Proposta de Intervenção (Os 5 Elementos Obrigatórios)</h3>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
              {proposalScore}% Completo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>1. Agente (Quem faz?)</span>
                {hasAgente ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              </label>
              <input
                type="text"
                value={data.propAgente}
                onChange={(e) => setData({ ...data, propAgente: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>2. Ação (O que faz?)</span>
                {hasAcao ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              </label>
              <input
                type="text"
                value={data.propAcao}
                onChange={(e) => setData({ ...data, propAcao: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>3. Meio/Modo (Como faz?)</span>
                {hasMeioModo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              </label>
              <input
                type="text"
                value={data.propMeioModo}
                onChange={(e) => setData({ ...data, propMeioModo: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>4. Efeito/Finalidade (Para que?)</span>
                {hasEfeito ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              </label>
              <input
                type="text"
                value={data.propEfeito}
                onChange={(e) => setData({ ...data, propEfeito: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
              <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>5. Detalhamento (Exemplo/Especificação)</span>
                {hasDetalhamento ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              </label>
              <input
                type="text"
                value={data.propDetalhamento}
                onChange={(e) => setData({ ...data, propDetalhamento: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
              />
            </div>
          </div>

          {/* MISSING ELEMENT WARNING BANNER */}
          {elementsCount < 5 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Atenção: A sua proposta de intervenção está incompleta! Preencha todos os 5 elementos obrigatórios para garantir a pontuação máxima na Competência 5 (200 pontos).
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          <span>{copied ? 'Copiado para a Área de Transferência! ✅' : 'Copiar Esqueleto Formatado'}</span>
        </button>

        {onSendToAnalyzer && (
          <button
            onClick={() => onSendToAnalyzer(formatSkeletonText())}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer transform hover:scale-105"
          >
            <span>Enviar Estrutura para o Corretor IA</span>
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
