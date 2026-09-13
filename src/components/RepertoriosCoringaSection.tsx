import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Quote,
  History,
  Film,
  Copy,
  Check,
  Search,
  Sparkles,
  Bookmark,
  ChevronRight,
  Lightbulb,
  Feather
} from 'lucide-react';

interface RepertorioItem {
  id: string;
  eixo: string;
  icone: string;
  citacao: {
    autor: string;
    texto: string;
    conceito: string;
  };
  alusaohistorica: {
    titulo: string;
    descricao: string;
  };
  obraCultural: {
    titulo: string;
    tipo: 'Filme' | 'Série' | 'Livro';
    resumo: string;
  };
  modeloEncaixe: string;
}

const REPERTORIOS_DATA: RepertorioItem[] = [
  {
    id: 'tec',
    eixo: 'Tecnologia e Redes Sociais',
    icone: '💻',
    citacao: {
      autor: 'Zygmunt Bauman (Sociólogo)',
      texto: 'As redes sociais não ensinam a dialogar, porque é muito fácil evitar a controvérsia.',
      conceito: 'Modernidade Líquida e fragilidade das relações virtuais',
    },
    alusaohistorica: {
      titulo: '4ª Revolução Industrial e Algoritmos',
      descricao: 'A transição para a era da inteligência artificial e controle de dados pessoais sem regulamentação ética prévia.',
    },
    obraCultural: {
      titulo: 'O Dilema das Redes (Documentário/Filme)',
      tipo: 'Filme',
      resumo: 'Demonstra como o design persuasivo das plataformas manipula a atenção e polariza o debate público.',
    },
    modeloEncaixe: 'Em primeira análise, cabe pontuar que a dependência tecnológica intensifica a bolha informacional. Sob a ótica do sociólogo Zygmunt Bauman, as redes sociais fragilizam o diálogo democrático. De maneira análoga, observa-se no Brasil que a falta de letramento digital expõe os cidadãos à manipulação de dados.',
  },
  {
    id: 'edu',
    eixo: 'Educação e Formação Cidadã',
    icone: '🎓',
    citacao: {
      autor: 'Paulo Freire (Educador)',
      texto: 'Se a educação sozinha não transforma a sociedade, sem ela tampouco a sociedade muda.',
      conceito: 'Educação Libertadora vs. Educação Bancária',
    },
    alusaohistorica: {
      titulo: 'Artigo 205 da Constituição Federal de 1988',
      descricao: 'Garante a educação como direito de todos e dever do Estado e da família, visando ao pleno desenvolvimento da pessoa.',
    },
    obraCultural: {
      titulo: 'Escritores da Liberdade (Filme)',
      tipo: 'Filme',
      resumo: 'Retrata como métodos pedagógicos inclusivos superam barreiras socioeconômicas e violência urbana.',
    },
    modeloEncaixe: 'De início, vale ressaltar que a precariedade educacional perpetua vulnerabilidades. Segundo o educador Paulo Freire, a transformação social depende intrinsecamente de uma formação emancipatória. Contudo, a realidade brasileira distancia-se desse ideal quando o investimento público em infraestrutura escolar permanece desigual.',
  },
  {
    id: 'sau',
    eixo: 'Saúde Física e Mental',
    icone: '🏥',
    citacao: {
      autor: 'Byung-Chul Han (Filósofo)',
      texto: 'A sociedade do século XXI não é mais uma sociedade disciplinar, mas uma sociedade do desempenho.',
      conceito: 'Sociedade do Cansaço e Síndrome de Burnout',
    },
    alusaohistorica: {
      titulo: 'Criação do SUS na Constituição de 1988 (Art. 196)',
      descricao: 'Universalização do acesso à saúde como direito fundamental inalienável.',
    },
    obraCultural: {
      titulo: 'Divertida Mente (Filme)',
      tipo: 'Filme',
      resumo: 'Ilustra a relevância de validar todas as emoções humanas, inclusive a tristeza e ansiedade, para a saúde psíquica.',
    },
    modeloEncaixe: 'Em primeiro plano, é imperioso destacar a negligência em torno da saúde mental na contemporaneidade. Na obra "A Sociedade do Cansaço", Byung-Chul Han elucida como a busca obsessiva por produtividade adoece o indivíduo. Paralelamente, no cenário nacional, a escassez de psicólogos na rede pública agrava os quadros de depressão.',
  },
  {
    id: 'amb',
    eixo: 'Meio Ambiente e Sustentabilidade',
    icone: '🌱',
    citacao: {
      autor: 'Ailton Krenak (Líder Indígena/Escritor)',
      texto: 'A terra não é um recurso a ser explorado, é nossa ancestral mãe viva.',
      conceito: 'Ideias para Adiar o Fim do Mundo e Crise Climática',
    },
    alusaohistorica: {
      titulo: 'Conferência de Estocolmo (1972) e Eco-92',
      descricao: 'Marcos globais da conscientização ambiental e transição para o Desenvolvimento Sustentável.',
    },
    obraCultural: {
      titulo: 'WALL-E (Animação/Filme)',
      tipo: 'Filme',
      resumo: 'Apresenta a Terra devastada pelo acúmulo descontrolado de lixo e consumismo predatório.',
    },
    modeloEncaixe: 'Em primeira instância, é preciso enfatizar a urgência do combate à degradação ambiental. De acordo com o pensamento de Ailton Krenak, a mercantilização da natureza compromete o futuro da humanidade. Todavia, a prática do descarte inadequado de resíduos no Brasil evidencia a prevalência do lucro sobre a preservação ecológica.',
  },
  {
    id: 'cul',
    eixo: 'Cultura, Arte e Patrimônio',
    icone: '🎭',
    citacao: {
      autor: 'Adorno e Horkheimer (Escola de Frankfurt)',
      texto: 'A Indústria Cultural padroniza os bens artísticos para transformar a cultura em mero bem de consumo.',
      conceito: 'Indústria Cultural e Passividade do Espectador',
    },
    alusaohistorica: {
      titulo: 'Semana de Arte Moderna de 1922',
      descricao: 'Ruptura artística em São Paulo que buscou valorizar a identidade genuinamente brasileira e antropofágica.',
    },
    obraCultural: {
      titulo: 'O Auto da Compadecida (Livro/Filme)',
      tipo: 'Livro',
      resumo: 'Obra de Ariano Suassuna que celebra a religiosidade popular e a astúcia do sertanejo nordestino.',
    },
    modeloEncaixe: 'Mormente, cabe salientar a democratização do acesso às artes como pilar cidadão. Segundo a teoria da Indústria Cultural formulada por Adorno e Horkheimer, a mercantilização da arte limita a fruição crítica. No contexto brasileiro, o encarecimento dos ingressos de cinema e teatro segrega o público de menor renda.',
  },
];

export const RepertoriosCoringaSection: React.FC = () => {
  const [eixoSelecionado, setEixoSelecionado] = useState<string>(REPERTORIOS_DATA[0].id);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const repertorioAtual = REPERTORIOS_DATA.find((r) => r.id === eixoSelecionado) || REPERTORIOS_DATA[0];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRepertorios = REPERTORIOS_DATA.filter((r) =>
    r.eixo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.citacao.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.obraCultural.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-purple-500/20 shrink-0">
            <Feather className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Redação Nota 1000 ENEM
              </span>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/40">
                Módulo nº 1
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Banco de Repertórios Coringa & Argumentos
            </h2>
          </div>
        </div>

        <p className="text-xs text-purple-200/80 max-w-md">
          Citacões filosóficas, alusões históricas, leis e obras culturais organizadas por eixos temáticos com modelos prontos para encaixar no seu D1 ou D2.
        </p>
      </div>

      {/* Search and Category Filter Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por filósofo, lei, filme ou eixo (ex: Bauman, Constituição, Educação)..."
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-purple-500/20 rounded-2xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {/* Eixo Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {REPERTORIOS_DATA.map((item) => {
            const isSelected = item.id === eixoSelecionado;
            return (
              <button
                key={item.id}
                onClick={() => setEixoSelecionado(item.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{item.icone}</span>
                <span>{item.eixo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Repertorio Card Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={repertorioAtual.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* 1. Citação Filosófica / Sociológica */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Quote className="w-4 h-4 text-amber-400" />
                  Citação Filosófica / Sociológica
                </span>
                <button
                  onClick={() => handleCopyText(`"${repertorioAtual.citacao.texto}" - ${repertorioAtual.citacao.autor}`, `cit-${repertorioAtual.id}`)}
                  className="text-xs font-bold text-slate-400 hover:text-amber-400 transition cursor-pointer flex items-center gap-1"
                >
                  {copiedId === `cit-${repertorioAtual.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-white">
                  {repertorioAtual.citacao.autor}
                </h4>
                <p className="text-xs italic text-amber-200/90 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-relaxed font-serif">
                  "{repertorioAtual.citacao.texto}"
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Conceito de Aplicação:
              </span>
              <p className="text-xs text-purple-300 font-semibold">
                {repertorioAtual.citacao.conceito}
              </p>
            </div>
          </div>

          {/* 2. Alusão Histórica / Legislação */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-400" />
                  Alusão Histórica / Legislação
                </span>
                <button
                  onClick={() => handleCopyText(`${repertorioAtual.alusaohistorica.titulo}: ${repertorioAtual.alusaohistorica.descricao}`, `his-${repertorioAtual.id}`)}
                  className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition cursor-pointer flex items-center gap-1"
                >
                  {copiedId === `his-${repertorioAtual.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-white">
                  {repertorioAtual.alusaohistorica.titulo}
                </h4>
                <p className="text-xs text-slate-300 bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 leading-relaxed">
                  {repertorioAtual.alusaohistorica.descricao}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-indigo-300 block mb-0.5">
                Uso Recomendado no ENEM:
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Perfeito para a Introdução ou Conectivo de Contextualização.
              </p>
            </div>
          </div>

          {/* 3. Obra Cultural (Filme / Série / Livro) */}
          <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-400" />
                  Obra Cultural ({repertorioAtual.obraCultural.tipo})
                </span>
                <button
                  onClick={() => handleCopyText(`${repertorioAtual.obraCultural.titulo}: ${repertorioAtual.obraCultural.resumo}`, `obr-${repertorioAtual.id}`)}
                  className="text-xs font-bold text-slate-400 hover:text-purple-400 transition cursor-pointer flex items-center gap-1"
                >
                  {copiedId === `obr-${repertorioAtual.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-white">
                  {repertorioAtual.obraCultural.titulo}
                </h4>
                <p className="text-xs text-purple-200 bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 leading-relaxed">
                  {repertorioAtual.obraCultural.resumo}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase text-purple-300 block mb-0.5">
                Por que usar este repertório:
              </span>
              <p className="text-xs text-slate-400 font-medium">
                Confere legitimidade cultural e originalidade à Competência 2.
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modelo de Encaixe no Texto (Parágrafo Exemplo Prático) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-3 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">
              Modelo "Como Encaixar no Texto" (Parágrafo de D1 ou D2)
            </h3>
          </div>

          <button
            onClick={() => handleCopyText(repertorioAtual.modeloEncaixe, `mod-${repertorioAtual.id}`)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer flex items-center space-x-1.5 shadow-md"
          >
            {copiedId === `mod-${repertorioAtual.id}` ? (
              <>
                <Check className="w-4 h-4" />
                <span>Modelo Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Modelo de Parágrafo</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
          {repertorioAtual.modeloEncaixe}
        </div>

        <p className="text-[11px] text-slate-400 italic">
          💡 <strong>Dica da Tutora Gabi:</strong> Adapte as palavras em negrito para dialogar diretamente com o tema específico cobrado na proposta da sua redação.
        </p>
      </div>
    </div>
  );
};
