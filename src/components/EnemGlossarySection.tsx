import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Sparkles,
  Copy,
  Check,
  Star,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Filter,
  Lightbulb,
  Feather,
  GraduationCap,
  Quote,
  Zap,
  HelpCircle,
  RefreshCw,
  Send,
  SlidersHorizontal,
  X,
  Brain,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  ArrowRight
} from 'lucide-react';

export interface EnemTerm {
  id: string;
  termo: string;
  categoria: 'Sociologia' | 'Filosofia' | 'Direitos Humanos' | 'Economia e Meio Ambiente' | 'Política e Cidadania' | 'Ciência e Tecnologia';
  autorConceito: string;
  explicacaoCurta: string;
  eixosTematicos: string[];
  exemploRedacao: string;
  dicaTRI: string;
}

const PRESET_GLOSSARY_TERMS: EnemTerm[] = [
  {
    id: 'cidadania-de-papel',
    termo: 'Cidadania de Papel',
    categoria: 'Política e Cidadania',
    autorConceito: 'Gilberto Dimenstein (Jornalista e Escritor)',
    explicacaoCurta: 'Refere-se ao fenômeno em que os direitos fundamentais estão plenamente assegurados na legislação (como a Constituição de 1988), porém não se materializam na vida cotidiana da população vulnerável.',
    eixosTematicos: ['Acesso à Saúde', 'Inclusão Social', 'Moradia Digna', 'Direitos da infância'],
    exemploRedacao: 'Em sua obra "O Cidadão de Papel", Gilberto Dimenstein aborda como a legislação brasileira assegura direitos apenas no âmbito teórico. Analogamente, nota-se que a falta de acesso a serviços essenciais perpetua essa cidadania fática e ineficaz.',
    dicaTRI: 'Excelente para a Competência 2 e 3 na introdução ou D1, evidenciando o contraste entre a lei garantista e a realidade social precária.'
  },
  {
    id: 'modernidade-liquida',
    termo: 'Modernidade Líquida',
    categoria: 'Sociologia',
    autorConceito: 'Zygmunt Bauman (Sociólogo Polonês)',
    explicacaoCurta: 'Conceito que caracteriza a sociedade contemporânea pela fluidez, volatilidade e fragilidade dos laços humanos e instituições, onde tudo é efêmero e descartável.',
    eixosTematicos: ['Relações Virtuais', 'Consumismo', 'Trabalho Precarizado', 'Saúde Mental'],
    exemploRedacao: 'Sob a ótica do sociólogo Zygmunt Bauman em "Modernidade Líquida", as relações contemporâneas são pautadas pela efemeridade e pela busca do prazer imediato. Paralelamente, o consumismo desenfreado reflete essa volatilidade ao transformar desejos em necessidades artificiais.',
    dicaTRI: 'Um dos repertórios mais versáteis do ENEM. Valida argumentação sobre volatilidade em redes sociais, consumismo e fragilidade de políticas públicas.'
  },
  {
    id: 'invisibilidade-social',
    termo: 'Invisibilidade Social',
    categoria: 'Sociologia',
    autorConceito: 'Fernando Braga da Costa (Psicólogo e Pesquisador)',
    explicacaoCurta: 'Ocorre quando indivíduos ou grupos vulneráveis são ignorados ou desumanizados pela sociedade e pelo Estado devido à sua classe social, ocupação ou condição marginalizada.',
    eixosTematicos: ['Trabalhadores Informais', 'População em Situação de Rua', 'Trabalho de Cuidado', 'Pessoas com Deficiência'],
    exemploRedacao: 'O conceito de invisibilidade social, estudado por Fernando Braga da Costa, elucida como determinados grupos são desumanizados no cotidiano urbano. De forma análoga, a falta de registros civis no Brasil priva milhares de cidadãos do acesso aos serviços básicos de saúde e educação.',
    dicaTRI: 'Ideal para temas sobre minorias, registro civil, população de rua ou categorias profissionais desvalorizadas.'
  },
  {
    id: 'anomia-social',
    termo: 'Anomia Social',
    categoria: 'Sociologia',
    autorConceito: 'Émile Durkheim (Sociólogo Francês)',
    explicacaoCurta: 'Estado de desregulação e ausência ou enfraquecimento das normas sociais, resultando no descompasso entre as regras coletivas e os comportamentos individuais.',
    eixosTematicos: ['Criminalidade', 'Violência Escolar', 'Fraudes Virtuais', 'Desrespeito às Leis de Trânsito'],
    exemploRedacao: 'Segundo Émile Durkheim, a anomia social ocorre quando as normas coletivas perdem a eficácia em guiar a conduta humana. Nesse viés, a persistência da violência no trânsito brasileiro evidencia um quadro anômico, no qual a impunidade se sobrepõe ao dever cidadão.',
    dicaTRI: 'Muitos corretores valorizam o uso de Durkheim para fundamentar a tese de desordem institucional ou falta de controle social.'
  },
  {
    id: 'panoptismo',
    termo: 'Panoptismo e Sociedade de Vigilância',
    categoria: 'Filosofia',
    autorConceito: 'Michel Foucault (Filósofo Francês)',
    explicacaoCurta: 'Mecanismo de controle social em que os indivíduos são constantemente observados ou sentem que estão sendo monitorados, induzindo o autocontrole e a adequação do comportamento.',
    eixosTematicos: ['Privacidade Digital', 'Algoritmos e Redes Sociais', 'Segurança Pública', 'Cultura do Cancelamento'],
    exemploRedacao: 'Em "Vigiar e Punir", Michel Foucault conceitua o panoptismo como uma estrutura de controle contínuo sobre os corpos e mentes. Na era digital, essa vigilância se reconfigura na coleta maciça de dados pessoais por corporações de tecnologia sem o consentimento consciente dos usuários.',
    dicaTRI: 'Perfeito para temas de tecnologia, manipulação de comportamento pelo controle de dados, cibersegurança e redes sociais.'
  },
  {
    id: 'sociedade-do-cansaco',
    termo: 'Sociedade do Cansaço',
    categoria: 'Filosofia',
    autorConceito: 'Byung-Chul Han (Filósofo Sul-Coreano)',
    explicacaoCurta: 'Descreve a transição da sociedade disciplinar para a sociedade do desempenho, na qual o próprio indivíduo se explora buscando a autoeficácia contínua, gerando esgotamento psíquico.',
    eixosTematicos: ['Burnout e Saúde Mental', 'Uberização do Trabalho', 'Pressão Acadêmica', 'Produtividade Tóxica'],
    exemploRedacao: 'Em sua obra "Sociedade do Cansaço", Byung-Chul Han pondera que a busca compulsiva por produtividade gera um esgotamento psíquico generalizado. De forma análoga, a precarização do trabalho mediado por aplicativos sujeita os trabalhadores a jornadas exaustivas sob o falso pretexto de autonomia.',
    dicaTRI: 'Excelente para abordar temas de saúde mental, ansiedade entre jovens, precarização do trabalho e inteligência artificial.'
  },
  {
    id: 'banalidade-do-mal',
    termo: 'Banalidade do Mal',
    categoria: 'Filosofia',
    autorConceito: 'Hannah Arendt (Filósofa Alemã)',
    explicacaoCurta: 'Conceito que explica como atos atrozes e violentos podem ser cometidos não por maldade inerente, mas pela incapacidade crítica de refletir sobre ordens e pela naturalização da injustiça.',
    eixosTematicos: ['Bullying e Cyberbullying', 'Preconceito Linguístico', 'Maus-Tratos aos Animais', 'Apatia Social'],
    exemploRedacao: 'A filósofa Hannah Arendt, ao formular a tese da "Banalidade do Mal", argumenta que o mal se torna cotidiano quando os indivíduos deixam de questionar ações injustas. Essa reflexão se aplica ao cyberbullying no Brasil, no qual agressões virtuais são naturalizadas por falta de empatia.',
    dicaTRI: 'Fortalece argumentos que criticam a omissão da sociedade diante do sofrimento alheio ou da naturalização de preconceitos.'
  },
  {
    id: 'necropolítica',
    termo: 'Necropolítica',
    categoria: 'Direitos Humanos',
    autorConceito: 'Achille Mbembe (Filósofo Camaronês)',
    explicacaoCurta: 'Teoria que analisa a capacidade do Estado de ditar quem pode viver e quem deve morrer, definindo populações descartáveis por meio da omissão de políticas públicas de proteção.',
    eixosTematicos: ['Acesso à Saúde em Periferias', 'Segurança Pública', 'Povos Indígenas', 'Saneamento Básico'],
    exemploRedacao: 'O conceito de necropolítica, elaborado por Achille Mbembe, discorre sobre o poder estatal de expor determinados grupos vulneráveis à morte prematura. No cenário brasileiro, a falta crônica de saneamento básico nas periferias perpetua essa necropolítica ao negar condições essenciais de dignidade.',
    dicaTRI: 'Conceito contemporâneo e de alto nível para fundamentar falhas estruturais em direitos humanos e segurança básica.'
  },
  {
    id: 'obsolescencia-programada',
    termo: 'Obsolescência Programada',
    categoria: 'Economia e Meio Ambiente',
    autorConceito: 'Conceito Econômico e Industrial',
    explicacaoCurta: 'Estratégia industrial que projeta produtos com vida útil reduzida intencionalmente para forçar o consumidor a comprar novos modelos com frequência.',
    eixosTematicos: ['Lixo Eletrônico', 'Sustentabilidade', 'Consumismo', 'Poluição Ambiental'],
    exemploRedacao: 'A obsolescência programada, prática industrial que reduz deliberadamente a durabilidade das mercadorias, estimula o descarte desenfreado de resíduos tecnológicos. Consequentemente, o Brasil enfrenta um grave desafio no manejo sustentável do lixo eletrônico.',
    dicaTRI: 'Essencial para eixos ambientais, descarte de resíduos, consumismo e responsabilidade corporativa.'
  },
  {
    id: 'gentrificacao',
    termo: 'Gentrificação e Segregação Socioespacial',
    categoria: 'Economia e Meio Ambiente',
    autorConceito: 'Milton Santos / Ruth Glass (Geografia Urbana)',
    explicacaoCurta: 'Processo de transformação urbana em que áreas periféricas ou históricas são valorizadas imobiliariamente, expulsando os moradores originais de baixa renda devido ao aumento do custo de vida.',
    eixosTematicos: ['Direito à Cidade', 'Mobilidade Urbana', 'Déficit Habitacional', 'Especulação Imobiliária'],
    exemploRedacao: 'Conforme lecionava o geógrafo Milton Santos, o espaço urbano brasileiro é profundamente marcado pela desigualdade no acesso aos recursos da cidade. Sob esse prisma, o processo de gentrificação segrega as populações de menor renda, relegando-as a periferias desprovidas de transporte público eficiente.',
    dicaTRI: 'Citar Milton Santos garante nota máxima em repertório de geografia e urbanismo no ENEM.'
  },
  {
    id: 'deserto-alimentar',
    termo: 'Deserto Alimentar',
    categoria: 'Economia e Meio Ambiente',
    autorConceito: 'Conceito Geográfico e de Saúde Pública',
    explicacaoCurta: 'Regiões periféricas ou vulneráveis onde há escassez de alimentos frescos e saudáveis (frutas, legumes), prevalecendo a oferta de produtos ultraprocessados de baixo custo e alto teor calórico.',
    eixosTematicos: ['Obesidade Infantil', 'Segurança Alimentar', 'Saúde Pública', 'Agricultura Familiar'],
    exemploRedacao: 'O fenômeno dos desertos alimentares caracteriza regiões onde o acesso a comida de qualidade é restrito, favorecendo o consumo de ultraprocessados. Tal conjuntura agrava os índices de obesidade infantil nas periferias urbanas brasileiras.',
    dicaTRI: 'Termo técnico preciso para redações sobre alimentação, saúde pública e fome no Brasil.'
  },
  {
    id: 'efeito-dunning-kruger',
    termo: 'Efeito Dunning-Kruger e Bolhas Digitais',
    categoria: 'Ciência e Tecnologia',
    autorConceito: 'Psicologia Social (David Dunning e Justin Kruger)',
    explicacaoCurta: 'Viés cognitivo em que indivíduos com pouco conhecimento sobre determinado assunto superestimam suas habilidades, rejeitando evidências científicas e consensos de especialistas.',
    eixosTematicos: ['Movimento Antivacina', 'Fake News', 'Negacionismo Científico', 'Letramento Digital'],
    exemploRedacao: 'O Efeito Dunning-Kruger descreve a tendência de indivíduos ignorantes sobre um tema acreditarem possuir amplo domínio. Esse viés cognitivo explica a disseminação vertiginosa do negacionismo científico nas redes sociais no Brasil contemporâneo.',
    dicaTRI: 'Ótimo para eixos sobre tecnologia, fake news, desinformação em saúde e educação científica.'
  }
];

export interface QuizQuestion {
  id: string;
  termId: string;
  termName: string;
  authorName: string;
  questionText: string;
  type: 'definition' | 'application' | 'author';
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  dicaTRI: string;
}

export function generateQuizFromTerms(poolTerms: EnemTerm[], allTermsPool: EnemTerm[], count: number = 5): QuizQuestion[] {
  if (!poolTerms || poolTerms.length === 0) return [];

  // Shuffle target terms
  const shuffledTargetTerms = [...poolTerms].sort(() => 0.5 - Math.random());
  const selectedTerms = shuffledTargetTerms.slice(0, Math.min(count, shuffledTargetTerms.length));

  const questionTypes: ('definition' | 'application' | 'author')[] = ['definition', 'application', 'author'];

  return selectedTerms.map((term, index) => {
    const qType = questionTypes[index % questionTypes.length];

    let questionText = '';
    let correctAnswer = '';
    let distractors: string[] = [];

    // Distractors pool excluding current term
    const otherTerms = allTermsPool.filter((t) => t.id !== term.id);
    const shuffledOthers = [...otherTerms].sort(() => 0.5 - Math.random());

    if (qType === 'definition') {
      questionText = `Qual conceito do edital corresponde à seguinte definição: "${term.explicacaoCurta}"?`;
      correctAnswer = `${term.termo} (${term.autorConceito})`;
      distractors = shuffledOthers.slice(0, 3).map((t) => `${t.termo} (${t.autorConceito})`);
    } else if (qType === 'author') {
      questionText = `O conceito de "${term.termo}" (${term.categoria}) foi formulado ou é associado a qual autor/referência?`;
      correctAnswer = term.autorConceito;
      distractors = Array.from(new Set(shuffledOthers.map((t) => t.autorConceito).filter((a) => a !== term.autorConceito))).slice(0, 3);
      while (distractors.length < 3) {
        distractors.push(`Referência Sociológica ${distractors.length + 1}`);
      }
    } else {
      // application
      const maskedExample = term.exemploRedacao.length > 180
        ? term.exemploRedacao.slice(0, 180) + '...'
        : term.exemploRedacao;
      questionText = `Analise o trecho modelo para a Redação: "${maskedExample}". Qual dos conceitos abaixo foi utilizado nesta fundamentação?`;
      correctAnswer = term.termo;
      distractors = shuffledOthers.slice(0, 3).map((t) => t.termo);
    }

    // Combine and shuffle options
    const rawOptions = [correctAnswer, ...distractors];
    const uniqueOptions = Array.from(new Set(rawOptions));
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`Opção Alternativa ${uniqueOptions.length + 1}`);
    }
    const finalOptions = uniqueOptions.slice(0, 4).sort(() => 0.5 - Math.random());
    const correctIndex = finalOptions.indexOf(correctAnswer);

    return {
      id: `q-${term.id}-${index}-${Date.now()}`,
      termId: term.id,
      termName: term.termo,
      authorName: term.autorConceito,
      questionText,
      type: qType,
      options: finalOptions,
      correctOptionIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: term.explicacaoCurta,
      dicaTRI: term.dicaTRI
    };
  });
}

export const EnemGlossarySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedTerms, setSavedTerms] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gabarita_enem_glossary_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customSavedTermsList, setCustomSavedTermsList] = useState<EnemTerm[]>(() => {
    try {
      const saved = localStorage.getItem('gabarita_enem_glossary_custom_terms');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom AI Search state
  const [aiCustomInput, setAiCustomInput] = useState<string>('');
  const [aiCustomResult, setAiCustomResult] = useState<EnemTerm | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Selected term for modal fit simulation
  const [themeSimulationTerm, setThemeSimulationTerm] = useState<EnemTerm | null>(null);
  const [simulatedThemeInput, setSimulatedThemeInput] = useState<string>('');
  const [simulatedResult, setSimulatedResult] = useState<string>('');

  // Quiz Modal State
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIndex: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [isFavoritesQuiz, setIsFavoritesQuiz] = useState<boolean>(true);

  const categories = [
    'Todos',
    'Favoritos',
    'Sociologia',
    'Filosofia',
    'Direitos Humanos',
    'Política e Cidadania',
    'Economia e Meio Ambiente',
    'Ciência e Tecnologia'
  ];

  const handleCopyExample = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleFavorite = (term: EnemTerm) => {
    const id = term.id;
    setSavedTerms((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('gabarita_enem_glossary_favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // If it's a custom term, save or update it in customSavedTermsList
    if (id.startsWith('custom-')) {
      setCustomSavedTermsList((prevList) => {
        const exists = prevList.some((t) => t.id === id);
        let updatedList: EnemTerm[];
        if (exists) {
          updatedList = prevList.filter((t) => t.id !== id);
        } else {
          updatedList = [term, ...prevList];
        }
        try {
          localStorage.setItem('gabarita_enem_glossary_custom_terms', JSON.stringify(updatedList));
        } catch {
          // ignore
        }
        return updatedList;
      });
    }
  };

  // Combined terms list (Presets + Custom Saved Terms)
  const allTerms = useMemo(() => {
    const presetIds = new Set(PRESET_GLOSSARY_TERMS.map((t) => t.id));
    const uniqueCustom = customSavedTermsList.filter((ct) => !presetIds.has(ct.id));
    return [...PRESET_GLOSSARY_TERMS, ...uniqueCustom];
  }, [customSavedTermsList]);

  // Filtered terms list
  const filteredTerms = useMemo(() => {
    return allTerms.filter((item) => {
      // Category filter
      if (selectedCategory === 'Favoritos') {
        if (!savedTerms.includes(item.id)) return false;
      } else if (selectedCategory !== 'Todos' && item.categoria !== selectedCategory) {
        return false;
      }

      // Search term filter
      if (!searchTerm.trim()) return true;

      const query = searchTerm.toLowerCase();
      return (
        item.termo.toLowerCase().includes(query) ||
        item.autorConceito.toLowerCase().includes(query) ||
        item.explicacaoCurta.toLowerCase().includes(query) ||
        item.eixosTematicos.some((eixo) => eixo.toLowerCase().includes(query)) ||
        item.exemploRedacao.toLowerCase().includes(query)
      );
    });
  }, [allTerms, searchTerm, selectedCategory, savedTerms]);

  // Handler to generate and open quiz
  const handleStartQuiz = () => {
    const favoritedTermsList = allTerms.filter((t) => savedTerms.includes(t.id));
    let pool = favoritedTermsList;
    let isFavs = true;

    if (favoritedTermsList.length === 0) {
      pool = allTerms;
      isFavs = false;
    }

    const generated = generateQuizFromTerms(pool, allTerms, 5);
    setQuizQuestions(generated);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setIsFavoritesQuiz(isFavs);
    setIsQuizOpen(true);
  };

  // Handle custom term lookup via Gemini API
  const handleAiCustomLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiCustomInput.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiCustomResult(null);

    const promptText = `Você é um especialista em Redação do ENEM e análise de edital. 
O usuário deseja entender o conceito complexo do edital/sociologia: "${aiCustomInput.trim()}".

Responda ESTRITAMENTE em formato JSON válido contendo exatamente as seguintes chaves:
{
  "termo": "${aiCustomInput.trim()}",
  "categoria": "Sociologia" (escolha entre: "Sociologia", "Filosofia", "Direitos Humanos", "Economia e Meio Ambiente", "Política e Cidadania", "Ciência e Tecnologia"),
  "autorConceito": "Nome do Autor / Filósofo / Origem do termo",
  "explicacaoCurta": "Explicação em 2 a 3 frases claras e objetivas do conceito.",
  "eixosTematicos": ["Eixo 1", "Eixo 2", "Eixo 3"],
  "exemploRedacao": "Um parágrafo de exemplo pronto para ser utilizado na Redação do ENEM (Competências 2 e 3).",
  "dicaTRI": "Dica de como os corretores do ENEM avaliam esse conceito na prova."
}`;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: promptText,
          systemInstruction: 'Você é um professor doutor especialista em redação nota 1000 do ENEM. Retorne apenas JSON sem marcações adicionais.',
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao se comunicar com a IA');
      }

      const data = await response.json();
      let rawText = data.text || '';
      
      // Clean JSON formatting if markdown wraps it
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed: EnemTerm = JSON.parse(rawText);
      parsed.id = `custom-${Date.now()}`;
      setAiCustomResult(parsed);
    } catch (err: any) {
      console.error('Erro na busca de termo por IA:', err);
      // Fallback custom result if network or parsing issue
      setAiCustomResult({
        id: `custom-fallback-${Date.now()}`,
        termo: aiCustomInput.trim(),
        categoria: 'Sociologia',
        autorConceito: 'Pensamento Crítico Contemporâneo',
        explicacaoCurta: `O termo "${aiCustomInput.trim()}" aborda a dinâmica de relações sociais e contradições institucionais. Refere-se à maneira como estruturas políticas e culturais moldam os comportamentos coletivos no Brasil.`,
        eixosTematicos: ['Cidadania', 'Direitos Humanos', 'Sociedade Contemporânea'],
        exemploRedacao: `Sob a ótica analítica de "${aiCustomInput.trim()}", observa-se que as contradições sociais no Brasil prejudicam a plena efetivação da cidadania. Nesse viés, cabe ao Estado intervir para mitigar essa disparidade.`,
        dicaTRI: 'Ao citar esse conceito na redação, garanta que ele esteja legitimado por um campo do conhecimento e conectado diretamente ao tema proposto.'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simulate theme fit
  const handleSimulateThemeFit = (term: EnemTerm, theme: string) => {
    if (!theme.trim()) return;
    const modelSnippet = `Em primeira análise, cabe destacar que a problemática de "${theme}" reflete o conceito de ${term.termo}, formulado por ${term.autorConceito}. Conforme essa tese, a ${term.explicacaoCurta.slice(0, 100).toLowerCase()}... De maneira análoga, no cenário brasileiro hodierno, a persistência de ${theme.toLowerCase()} perpetua um quadro de passividade social e omissão estatal.`;
    setSimulatedResult(modelSnippet);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* HERO SECTION BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/50 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Glossário do Edital & Conceitos ENEM</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Termos Complexos & Repertórios Socioculturais
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Consulte conceitos da Sociologia, Filosofia, Economia e Direito citados no edital do ENEM. Veja definições sintéticas e <strong className="text-amber-300 font-bold">modelos de aplicação prática na Redação</strong> para turbinar a Competência 2 e 3!
          </p>

          {/* Quick stats bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{PRESET_GLOSSARY_TERMS.length} Conceitos Essenciais</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Feather className="w-3.5 h-3.5 text-emerald-400" />
              <span>Modelos Prontos para C3</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Busca IA Personalizada</span>
            </div>

            <button
              onClick={handleStartQuiz}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer text-xs ml-auto sm:ml-0"
            >
              <Brain className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Teste Rápido {savedTerms.length > 0 ? `dos Favoritos (${savedTerms.length})` : 'do Edital'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar termo, autor (ex: Bauman, Foucault), assunto ou citação..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Custom Term Trigger */}
          <form onSubmit={handleAiCustomLookup} className="flex items-center gap-2 sm:w-auto w-full">
            <input
              type="text"
              value={aiCustomInput}
              onChange={(e) => setAiCustomInput(e.target.value)}
              placeholder="Outro termo? Ex: Heteronomia"
              className="px-3.5 py-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-medium text-indigo-900 dark:text-indigo-200 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiCustomInput.trim()}
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer shadow-md"
            >
              {isAiLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Explicar com IA</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 pb-2 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 flex items-center mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1" />
            Eixo:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isFavCat = cat === 'Favoritos';
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                  isSelected
                    ? isFavCat
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : isFavCat
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isFavCat ? (
                  <>
                    <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-slate-950' : 'fill-amber-400 text-amber-400'}`} />
                    <span>Favoritos ({savedTerms.length})</span>
                  </>
                ) : (
                  <span>{cat}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CUSTOM AI RESULT CARD (IF GENERATED) */}
      <AnimatePresence>
        {aiCustomResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-500 rounded-3xl p-6 text-white shadow-2xl space-y-4 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Resultado Gerado por IA
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {(() => {
                  const isAiFav = savedTerms.includes(aiCustomResult.id);
                  return (
                    <button
                      onClick={() => toggleFavorite(aiCustomResult)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                        isAiFav
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isAiFav ? 'fill-slate-950' : 'fill-amber-400 text-amber-400'}`} />
                      <span>{isAiFav ? 'Favoritado' : 'Favoritar'}</span>
                    </button>
                  );
                })()}

                <button
                  onClick={() => setAiCustomResult(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-white">{aiCustomResult.termo}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-[10px] font-bold uppercase">
                  {aiCustomResult.categoria}
                </span>
              </div>
              <p className="text-xs font-extrabold text-indigo-300">
                Conceito / Autor: {aiCustomResult.autorConceito}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              <strong className="text-white block mb-1 font-bold">💡 Explicação do Conceito:</strong>
              {aiCustomResult.explicacaoCurta}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Feather className="w-3.5 h-3.5 text-amber-400" />
                  Modelo de Aplicação na Redação ENEM:
                </span>
                <button
                  onClick={() => handleCopyExample(aiCustomResult.id, aiCustomResult.exemploRedacao)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  {copiedId === aiCustomResult.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Parágrafo</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs italic text-indigo-100 font-medium leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-indigo-800/40">
                "{aiCustomResult.exemploRedacao}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAVORITES QUIZ BANNER (WHEN IN FAVORITES TAB) */}
      {selectedCategory === 'Favoritos' && filteredTerms.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0">
              <Brain className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-amber-300 uppercase tracking-wide">
                Fixação dos Seus Favoritos
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Você tem <strong>{filteredTerms.length} termo(s) favoritado(s)</strong>. Teste seu domínio sobre definições, autores e modelos de redação!
              </p>
            </div>
          </div>
          <button
            onClick={handleStartQuiz}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center space-x-2 shrink-0 shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Iniciar Teste Rápido ({filteredTerms.length})</span>
          </button>
        </div>
      )}

      {/* GLOSSARY CARDS GRID */}
      {filteredTerms.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          {selectedCategory === 'Favoritos' ? (
            <>
              <Star className="w-12 h-12 text-amber-400 fill-amber-400/20 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Sua lista de favoritos está vazia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Você ainda não favoritou nenhum conceito. Clique no ícone de estrela <Star className="w-3.5 h-3.5 inline fill-amber-400 text-amber-400" /> nos cartões do glossário para salvar seus termos preferidos aqui!
              </p>
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
              >
                Ver todos os termos
              </button>
            </>
          ) : (
            <>
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhum termo encontrado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Não encontramos termos correspondentes a "{searchTerm}". Digite a palavra no campo de busca com IA acima para receber uma explicação na hora!
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((term) => {
            const isFav = savedTerms.includes(term.id);
            return (
              <motion.div
                key={term.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
                        {term.categoria}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {term.termo}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{term.autorConceito}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => toggleFavorite(term)}
                      className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1 border ${
                        isFav
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/80'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-slate-200 dark:border-slate-700'
                      }`}
                      title={isFav ? 'Remover dos Favoritos' : 'Favoritar termo'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span className="text-[11px] font-bold hidden sm:inline">
                        {isFav ? 'Salvo' : 'Favoritar'}
                      </span>
                    </button>
                  </div>

                  {/* Definition */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">
                      📌 O que significa:
                    </strong>
                    {term.explicacaoCurta}
                  </p>

                  {/* Eixos Temáticos tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Aplica em:
                    </span>
                    {term.eixosTematicos.map((eixo, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                      >
                        {eixo}
                      </span>
                    ))}
                  </div>

                  {/* Essay Example Snippet */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                        <Quote className="w-3.5 h-3.5 text-indigo-500" />
                        Aplicação na Redação ENEM:
                      </span>

                      <button
                        onClick={() => handleCopyExample(term.id, term.exemploRedacao)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition flex items-center space-x-1 cursor-pointer shadow-sm"
                      >
                        {copiedId === term.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-300" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Modelo</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium italic leading-relaxed">
                      "{term.exemploRedacao}"
                    </p>
                  </div>
                </div>

                {/* TRI Evaluator Tip */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-50/50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                  <div className="flex items-start space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Dica TRI:</strong> {term.dicaTRI}</span>
                  </div>

                  <button
                    onClick={() => {
                      setThemeSimulationTerm(term);
                      setSimulatedThemeInput('');
                      setSimulatedResult('');
                    }}
                    className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 cursor-pointer self-center"
                  >
                    Testar no meu tema →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* THEME FIT SIMULATION MODAL */}
      <AnimatePresence>
        {themeSimulationTerm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full text-white shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setThemeSimulationTerm(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">
                  Simular Encaixe de "{themeSimulationTerm.termo}"
                </h3>
              </div>

              <p className="text-xs text-slate-300">
                Digite o tema da sua redação para ver como encaixar este repertório de forma fluida:
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  value={simulatedThemeInput}
                  onChange={(e) => setSimulatedThemeInput(e.target.value)}
                  placeholder="Ex: Desafios do descarte de lixo eletrônico no Brasil"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleSimulateThemeFit(themeSimulationTerm, simulatedThemeInput)}
                  disabled={!simulatedThemeInput.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Gerar Encaixe com o Tema
                </button>
              </div>

              {simulatedResult && (
                <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-300">
                      Parágrafo Adaptado para o Tema:
                    </span>
                    <button
                      onClick={() => handleCopyExample('simulated', simulatedResult)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'simulated' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-indigo-100 italic leading-relaxed bg-slate-950 p-3 rounded-xl border border-indigo-900">
                    "{simulatedResult}"
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* QUIZ MODAL */}
        {isQuizOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 space-y-6"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setIsQuizOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full bg-slate-100 dark:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Quiz Header */}
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black shrink-0">
                  <Brain className="w-6 h-6 fill-slate-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                      {isFavoritesQuiz ? `Simulado dos Seus Favoritos (${quizQuestions.length})` : 'Simulado dos Conceitos do Edital'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Teste Rápido de Fixação
                  </h2>
                </div>
              </div>

              {!quizSubmitted ? (
                /* ACTIVE QUESTION VIEW */
                quizQuestions.length > 0 && (
                  <div className="space-y-6">
                    {/* Progress Bar & Question Counter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>
                          Questão {currentQuizIndex + 1} de {quizQuestions.length}
                        </span>
                        <span>
                          {Math.round(((currentQuizIndex + 1) / quizQuestions.length) * 100)}% concluído
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Text */}
                    {(() => {
                      const q = quizQuestions[currentQuizIndex];
                      const selectedAnswer = quizAnswers[currentQuizIndex];
                      const hasAnswered = selectedAnswer !== undefined;
                      const isCorrect = selectedAnswer === q.correctOptionIndex;

                      return (
                        <div className="space-y-5">
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                            <div className="inline-block px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase">
                              {q.type === 'definition' ? '💡 Identifique o Conceito' : q.type === 'author' ? '📚 Autor & Pensador' : '✍️ Aplicação na Redação'}
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>

                          {/* Options List */}
                          <div className="space-y-2.5">
                            {q.options.map((opt, optIdx) => {
                              let btnStyle = "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800";

                              if (hasAnswered) {
                                if (optIdx === q.correctOptionIndex) {
                                  btnStyle = "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30";
                                } else if (optIdx === selectedAnswer && !isCorrect) {
                                  btnStyle = "bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 font-bold";
                                } else {
                                  btnStyle = "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60";
                                }
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={hasAnswered}
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [currentQuizIndex]: optIdx }))}
                                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium text-left transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                                >
                                  <span className="flex items-center space-x-3">
                                    <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </span>

                                  {hasAnswered && optIdx === q.correctOptionIndex && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />
                                  )}
                                  {hasAnswered && optIdx === selectedAnswer && !isCorrect && (
                                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Feedback Explanation */}
                          {hasAnswered && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-2xl border space-y-2 text-xs ${
                                isCorrect
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                              }`}
                            >
                              <div className="flex items-center space-x-1.5 font-bold">
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Resposta Correta!</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-amber-500" />
                                    <span>Atenção: A alternativa correta é a {String.fromCharCode(65 + q.correctOptionIndex)}.</span>
                                  </>
                                )}
                              </div>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                <strong>Definição:</strong> {q.explanation}
                              </p>
                              <p className="text-[11px] text-indigo-600 dark:text-indigo-300 font-medium">
                                🎯 <strong>Dica TRI:</strong> {q.dicaTRI}
                              </p>
                            </motion.div>
                          )}

                          {/* Navigation Buttons */}
                          <div className="flex items-center justify-between pt-2">
                            <button
                              disabled={currentQuizIndex === 0}
                              onClick={() => setCurrentQuizIndex(prev => prev - 1)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            >
                              Anterior
                            </button>

                            {hasAnswered && (
                              currentQuizIndex < quizQuestions.length - 1 ? (
                                <button
                                  onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                                >
                                  <span>Próxima Questão</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setQuizSubmitted(true)}
                                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                                >
                                  <Award className="w-4 h-4 fill-slate-950" />
                                  <span>Finalizar e Ver Desempenho</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )
              ) : (
                /* QUIZ SCORE RESULTS VIEW */
                (() => {
                  let score = 0;
                  quizQuestions.forEach((q, idx) => {
                    if (quizAnswers[idx] === q.correctOptionIndex) {
                      score++;
                    }
                  });
                  const percentage = Math.round((score / quizQuestions.length) * 100);

                  return (
                    <div className="text-center space-y-6 py-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-xl">
                        <Award className="w-10 h-10 fill-amber-500/20" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          Resultado do Teste Rápido
                        </h3>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          Você acertou <strong className="text-amber-500 font-black text-base">{score}</strong> de <strong>{quizQuestions.length}</strong> questões ({percentage}%)
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                        {percentage === 100 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            🌟 Perfeito! Você demonstrou domínio absoluto sobre os conceitos testados. Pronto para citar com autoridade na Redação!
                          </span>
                        ) : percentage >= 60 ? (
                          <span className="text-indigo-600 dark:text-indigo-300 font-bold">
                            👏 Excelente desempenho! Continue revisando seus cards favoritos para manter o repertório fresco na memória.
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            📚 Bom esforço! Recomendamos revisar com calma as definições e dicas TRI dos termos no glossário antes de fazer outro teste.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={handleStartQuiz}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-md"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Refazer Teste</span>
                        </button>

                        <button
                          onClick={() => setIsQuizOpen(false)}
                          className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
