import React, { useState } from 'react';
import { Flame, BookOpen, Copy, Check, Sparkles, ArrowRight, Lightbulb, ShieldAlert, Award } from 'lucide-react';

interface RadarTopic {
  id: string;
  titulo: string;
  eixo: string;
  probabilidade: string;
  contextualizacao: string;
  teses: string[];
  repertorios: {
    categoria: string;
    titulo: string;
    explicacao: string;
  }[];
}

const HOT_TOPICS: RadarTopic[] = [
  {
    id: 'tema1',
    titulo: 'Inteligência Artificial, Algoritmos e a Precarização do Trabalho na Sociedade Digital',
    eixo: 'Tecnologia & Sociedade',
    probabilidade: 'Alta 🔥',
    contextualizacao: 'A rápida expansão de ferramentas generativas e automatização algorítmica redefiniu postos de trabalho e levantou debates éticos sobre substituição de mão de obra e vigilância nas plataformas.',
    teses: [
      'Tese 1: A ausência de regulamentação ética sólida sobre algoritmos aprofunda a instabilidade trabalhista e a pejotização forçada.',
      'Tese 2: O letramento digital insuficiente impede que a população trabalhadora transicione com segurança para a nova economia da informação.',
    ],
    repertorios: [
      {
        categoria: 'Sociologia',
        titulo: 'Byung-Chul Han - "Sociedade do Cansaço"',
        explicacao: 'Conceitua o indivíduo moderno como um "sujeito do desempenho", autoexplorado pelo excesso de produtividade digital.',
      },
      {
        categoria: 'Legislação',
        titulo: 'Constituição Federal de 1988 - Art. 7º',
        explicacao: 'Garante o direito social ao trabalho digno e à proteção frente à automação tecnológica.',
      },
      {
        categoria: 'Cultura / Filosofia',
        titulo: 'Zygmunt Bauman - "Modernidade Líquida"',
        explicacao: 'Descreve a fragilidade dos vínculos profissionais e sociais na era hiperconectada.',
      },
    ],
  },
  {
    id: 'tema2',
    titulo: 'Os Desafios do Envelhecimento Populacional e a Garantia de Cuidado à Pessoa Idosa',
    eixo: 'Demografia & Direitos Humanos',
    probabilidade: 'Muito Alta 🔥🔥',
    contextualizacao: 'O Brasil vive uma transição demográfica acelerada com o aumento da expectativa de vida. No entanto, faltam políticas públicas integradas de apoio, cuidadores e acessibilidade urbana.',
    teses: [
      'Tese 1: A invisibilidade social do idoso no ambiente urbano gera isolamento e negligência familiar e estatal.',
      'Tese 2: A sobrecarga desproporcional sobre as mulheres na economia do cuidado informal perpetua desigualdades de gênero e renda.',
    ],
    repertorios: [
      {
        categoria: 'Legislação',
        titulo: 'Estatuto da Pessoa Idosa (Lei nº 10.741/2003)',
        explicacao: 'Assegura prioridade absoluta e responsabilidade compartilhada entre família, sociedade e Estado.',
      },
      {
        categoria: 'Sociologia',
        titulo: 'Simone de Beauvoir - "A Velhice"',
        explicacao: 'Critica como a sociedade ocidental descarta o indivíduo que deixa de produzir capital ativo.',
      },
      {
        categoria: 'Filosofia',
        titulo: 'Norbert Elias - "A Solidão dos Moribundos"',
        explicacao: 'Analisa o afastamento afetivo e institucional sofrido pelos mais velhos no mundo contemporâneo.',
      },
    ],
  },
  {
    id: 'tema3',
    titulo: 'Preservação Ambiental, Justiça Climática e Resiliência em Comunidades Vulneráveis',
    eixo: 'Meio Ambiente & Sociedade',
    probabilidade: 'Altíssima 🔥🔥🔥',
    contextualizacao: 'Eventos climáticos extremos (secas e enchentes) atingem com mais força populações periféricas e tradicionais, evidenciando o conceito de racismo e injustiça ambiental.',
    teses: [
      'Tese 1: A omissão governamental na infraestrutura básica agrava a vulnerabilidade das comunidades a desastres naturais.',
      'Tese 2: O modelo econômico predatório prioriza o lucro imediato em detrimento da sustentabilidade e preservação biológica.',
    ],
    repertorios: [
      {
        categoria: 'Sociologia / Geografia',
        titulo: 'Henri Acselrad - "Justiça Ambiental e Cidadania"',
        explicacao: 'Demonstra como os impactos da degradação ecológica afetam desproporcionalmente os grupos vulneráveis.',
      },
      {
        categoria: 'Literatura',
        titulo: 'Ailton Krenak - "Ideias para Adiar o Fim do Mundo"',
        explicacao: 'Propõe a reconexão ancestral com a terra contra a visão mercantilista do meio ambiente.',
      },
      {
        categoria: 'Legislação',
        titulo: 'Artigo 225 da Constituição Federal',
        explicacao: 'Determina o direito de todos ao meio ambiente ecologicamente equilibrado para as presentes e futuras gerações.',
      },
    ],
  },
];

export const HotEssayRadarSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<RadarTopic>(HOT_TOPICS[0]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 border border-rose-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-rose-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Flame className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Apostas de Redação ENEM 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🔥 Radar de Temas Quentes de Redação
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Mapeamento de eixos temáticos prioritários com Contextualização, Teses Sugeridas e Repertórios Coringa prontos para fundamentar sua redação nota 1000.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-xl">
              ✍️
            </div>
            <div>
              <span className="text-xs text-rose-200 font-bold block uppercase tracking-wider">3 Eixos Atualizados</span>
              <span className="text-xs font-bold text-white">Teses + Repertórios Válidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOPICS SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {HOT_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className={`px-4 py-3 rounded-2xl text-xs font-black transition cursor-pointer shrink-0 flex items-center gap-2 ${
              selectedTopic.id === topic.id
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{topic.eixo}</span>
            <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full">{topic.probabilidade}</span>
          </button>
        ))}
      </div>

      {/* SELECTED TOPIC DETAILS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-3 py-1 rounded-full">
              {selectedTopic.eixo}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Aposta de Alta Relevância
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
            "{selectedTopic.titulo}"
          </h3>
        </div>

        {/* 📌 CONTEXTUALIZAÇÃO */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 block flex items-center gap-1.5">
            📌 Contextualização do Tema:
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {selectedTopic.contextualizacao}
          </p>
        </div>

        {/* 💡 2 TESES SUGERIDAS */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            2 Teses Sugeridas para o Desenvolvimento:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedTopic.teses.map((tese, tIdx) => {
              const copyKey = `tese-${selectedTopic.id}-${tIdx}`;
              return (
                <div
                  key={tIdx}
                  className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-3 flex flex-col justify-between"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {tese}
                  </p>

                  <button
                    onClick={() => handleCopyText(tese, copyKey)}
                    className="self-end text-[10px] font-black uppercase px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedId === copyKey ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Tese</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📚 3 REPERTÓRIOS VÁLIDOS */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            3 Repertórios Socioculturais Válidos e Produtivos:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedTopic.repertorios.map((rep, rIdx) => (
              <div
                key={rIdx}
                className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2"
              >
                <span className="text-[10px] font-black uppercase bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-md">
                  {rep.categoria}
                </span>
                <h5 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                  {rep.titulo}
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {rep.explicacao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
