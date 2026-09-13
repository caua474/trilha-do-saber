import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Sparkles,
  ChevronRight,
  Brain,
  Layers,
  Zap,
  Bookmark,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  MessageSquare,
  HelpCircle,
  Share2,
  FileText,
  Lightbulb,
  Tag,
  Target,
  Calendar,
  Compass,
  LayoutGrid,
  Filter,
  Check,
  ListOrdered,
  BookMarked
} from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { BibliotecaAutocompleteSearch } from './BibliotecaAutocompleteSearch';

export type BibliotecaCategory =
  | 'Tudo'
  | 'Linguagens'
  | 'Humanas'
  | 'Natureza'
  | 'Matemática'
  | 'Literatura';

export type DisciplinaNome =
  | 'Todas'
  | 'Matemática'
  | 'Biologia'
  | 'História'
  | 'Física'
  | 'Química'
  | 'Geografia'
  | 'Filosofia & Sociologia'
  | 'Língua Portuguesa & Literatura';

export interface StudyCardItem {
  id: string;
  titulo: string;
  categoria: 'Linguagens' | 'Humanas' | 'Natureza' | 'Matemática' | 'Literatura';
  materia: string;
  disciplina: DisciplinaNome;
  icone: string;
  tempoLeitura: string;
  incidencia: 'Mais Cai' | 'Médio' | 'Frequente';
  resumoBreve: string;
  pontosChave: string[];
  dicaEnem: string;
  corTheme: {
    bg: string;
    border: string;
    badge: string;
    text: string;
    glow: string;
  };
}

export interface StudyPlanStep {
  etapa: string;
  descricao: string;
  metaExercicios: number;
}

export interface StudyPlanItem {
  id: string;
  titulo: string;
  disciplina: DisciplinaNome;
  categoria: 'Linguagens' | 'Humanas' | 'Natureza' | 'Matemática' | 'Literatura';
  icone: string;
  duracaoEstimada: string;
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Intensivo ENEM';
  objetivoPrincipal: string;
  passosSemanais: StudyPlanStep[];
  habilidadesEnem: string[];
  corTheme: {
    bg: string;
    border: string;
    badge: string;
    text: string;
    glow: string;
  };
}

export interface MindMapItem {
  id: string;
  titulo: string;
  materia: string;
  disciplina: DisciplinaNome;
  nos: number;
  categoria: 'Linguagens' | 'Humanas' | 'Natureza' | 'Matemática' | 'Literatura';
  corTheme: string;
  dataSalva: string;
  icone: string;
  conceitosPrincipais: string[];
}

export const DISCIPLINAS_CONFIG: {
  id: DisciplinaNome;
  nome: string;
  icone: string;
  descricao: string;
  area: BibliotecaCategory;
  badgeCor: string;
}[] = [
  {
    id: 'Todas',
    nome: 'Todas as Disciplinas',
    icone: '🌟',
    descricao: 'Todos os resumos e planos de estudo da plataforma',
    area: 'Tudo',
    badgeCor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'Matemática',
    nome: 'Matemática',
    icone: '📐',
    descricao: 'Funções, Geometria, Análise Combinatória, Estatística e Álgebra',
    area: 'Matemática',
    badgeCor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
  },
  {
    id: 'Biologia',
    nome: 'Biologia',
    icone: '🌿',
    descricao: 'Ecologia, Genética, Citologia, Fisiologia Humana e Evolução',
    area: 'Natureza',
    badgeCor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'História',
    nome: 'História',
    icone: '🏛️',
    descricao: 'Brasil Colônia, Era Vargas, Ditadura Militar e História Geral',
    area: 'Humanas',
    badgeCor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
  },
  {
    id: 'Física',
    nome: 'Física',
    icone: '⚡',
    descricao: 'Mecânica Clássica, Termodinâmica, Eletrodinâmica e Ondulatória',
    area: 'Natureza',
    badgeCor: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
  },
  {
    id: 'Química',
    nome: 'Química',
    icone: '🧪',
    descricao: 'Estequiometria, Química Orgânica, Eletroquímica e Soluções',
    area: 'Natureza',
    badgeCor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
  },
  {
    id: 'Geografia',
    nome: 'Geografia',
    icone: '🌍',
    descricao: 'Geopolítica, Climatologia, Agronegócio, Urbanização e Meio Ambiente',
    area: 'Humanas',
    badgeCor: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
  },
  {
    id: 'Filosofia & Sociologia',
    nome: 'Filosofia & Sociologia',
    icone: '⚖️',
    descricao: 'Cidadania, Direitos Humanos, Contratualismo e Pensamento Crítico',
    area: 'Humanas',
    badgeCor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
  },
  {
    id: 'Língua Portuguesa & Literatura',
    nome: 'Língua Portuguesa & Literatura',
    icone: '✍️',
    descricao: 'Figuras de Linguagem, Interpretação de Texto, Realismo e Modernismo',
    area: 'Linguagens',
    badgeCor: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30'
  }
];

const STUDY_MATERIALS: StudyCardItem[] = [
  // 1. MATEMÁTICA
  {
    id: 'mat_funcoes',
    titulo: 'Funções de 1º e 2º Grau & Gráficos',
    categoria: 'Matemática',
    materia: 'Matemática',
    disciplina: 'Matemática',
    icone: '📈',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Análise de coeficientes lineares e angulares, raízes, vértice da parábola (máximo e mínimo) e interpretação de gráficos aplicados.',
    pontosChave: [
      'Função Afim: f(x) = ax + b (taxa constante de variação)',
      'Função Quadrática: f(x) = ax² + bx + c',
      'Vértice da Parábola: Xv = -b/(2a) e Yv = -Δ/(4a) para otimização',
      'Interpretação de lucro máximo, custo mínimo e trajetórias parabólicas'
    ],
    dicaEnem: 'O ENEM quase sempre cobra o vértice da parábola contextualizado como lucro máximo de uma empresa ou altura máxima de um projétil.',
    corTheme: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'hover:shadow-amber-500/10'
    }
  },
  {
    id: 'mat_geometria',
    titulo: 'Geometria Plana & Espacial (Áreas e Volumes)',
    categoria: 'Matemática',
    materia: 'Matemática',
    disciplina: 'Matemática',
    icone: '📐',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Cálculo de áreas de polígonos, círculos, volumes de prismas, cilindros, cones e esferas aplicados a caixas d’água e embalagens.',
    pontosChave: [
      'Área do Círculo: A = π·r² | Comprimento da Circunferência: C = 2·π·r',
      'Volume do Cilindro e Prisma: V = Área da Base × Altura',
      'Volume do Cone e Pirâmide: V = (1/3) × Área da Base × Altura',
      'Conversão essencial: 1 m³ = 1.000 Litros | 1 cm³ = 1 mL'
    ],
    dicaEnem: 'A pegadinha clássica é a conversão de unidades (dm³ para Litros ou cm para m) em problemas de reservatórios e caminhões-pipa!',
    corTheme: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'hover:shadow-amber-500/10'
    }
  },
  {
    id: 'mat_probabilidade',
    titulo: 'Análise Combinatória & Probabilidade Condicional',
    categoria: 'Matemática',
    materia: 'Matemática',
    disciplina: 'Matemática',
    icone: '🎲',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Princípio fundamental da contagem, permutações, combinações simples e cálculo de probabilidades com restrição amostral.',
    pontosChave: [
      'Arranjo vs Combinação: a ordem importa no agrupamento? (Sim = Arranjo, Não = Combinação)',
      'Combinação Simples: C(n, p) = n! / [p!(n - p)!]',
      'Probabilidade Básica: P = Casos Favoráveis / Casos Possíveis',
      'Probabilidade Condicional: P(A|B) = P(A ∩ B) / P(B)'
    ],
    dicaEnem: 'Para senhas e pódios a ordem importa (Arranjo/PFC); para comissões e sorteios de grupos a ordem não importa (Combinação).',
    corTheme: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'hover:shadow-amber-500/10'
    }
  },
  {
    id: 'mat_estatistica',
    titulo: 'Estatística: Média, Mediana, Moda e Desvio Padrão',
    categoria: 'Matemática',
    materia: 'Matemática',
    disciplina: 'Matemática',
    icone: '📊',
    tempoLeitura: '4 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Interpretação de medidas de tendência central e dispersão em gráficos de colunas, tabelas e dados amostrais.',
    pontosChave: [
      'Média Aritmética Ponderada: soma dos produtos valores×pesos dividida pela soma dos pesos',
      'Mediana: valor central após ordenar os dados em rol (média dos dois centrais se par)',
      'Moda: elemento que aparece com maior frequência',
      'Desvio Padrão: mede a regularidade e homogeneidade de um atleta ou conjunto de notas'
    ],
    dicaEnem: 'Quando o ENEM perguntar qual candidato foi mais "regular" ou "constante", procure quem tem o menor desvio padrão!',
    corTheme: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'hover:shadow-amber-500/10'
    }
  },

  // 2. BIOLOGIA
  {
    id: 'nat_ecologia',
    titulo: 'Ecologia, Biomas & Impactos Ambientais',
    categoria: 'Natureza',
    materia: 'Biologia',
    disciplina: 'Biologia',
    icone: '🌿',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Cadeias e teias tróficas, ciclos biogeoquímicos (carbono, nitrogênio e água), bioacumulação, eutrofização e conservação da biodiversidade.',
    pontosChave: [
      'Fluxo de energia é unidirecional e decrescente ao longo dos níveis tróficos',
      'Magnificação trófica: poluentes se concentram nos níveis tróficos superiores (topo da cadeia)',
      'Eutrofização artificial: excesso de nutrientes causa floração de algas e anóxia aquática',
      'Principais biomas: Cerrado (berço das águas), Mata Atlântica e Caatinga'
    ],
    dicaEnem: 'A prova do ENEM adora cobrar soluções sustentáveis: biorremediação, controle biológico de pragas e recuperação de matas ciliares.',
    corTheme: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'hover:shadow-emerald-500/10'
    }
  },
  {
    id: 'nat_genetica',
    titulo: 'Genética, Hereditariedade & Biotecnologia',
    categoria: 'Natureza',
    materia: 'Biologia',
    disciplina: 'Biologia',
    icone: '🧬',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: '1ª e 2ª Leis de Mendel, sistema ABO/Rh, herança ligada ao sexo, tecnologia do DNA recombinante, CRISPR e organismos transgênicos.',
    pontosChave: [
      '1ª Lei de Mendel: segregação dos fatores com proporção fenotípica 3:1 em heterozigotos',
      'Sistema ABO: codominância entre IA e IB, ambos dominantes sobre o alelo i recessivo',
      'Transgênicos possuem genes de outras espécies inseridos (diferente de organismos cisgênicos)',
      'Terapia gênica, células-tronco e edição precisa com CRISPR-Cas9'
    ],
    dicaEnem: 'Cálculo de probabilidade genética combinada (regra do "E" multiplica, regra do "OU" soma) é questão garantida em Ciências da Natureza.',
    corTheme: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'hover:shadow-emerald-500/10'
    }
  },
  {
    id: 'nat_fisiologia',
    titulo: 'Fisiologia Humana: Imunidade, Vacinas & Soros',
    categoria: 'Natureza',
    materia: 'Biologia',
    disciplina: 'Biologia',
    icone: '🫀',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Diferença entre imunização ativa e passiva, anticorpos, antígenos, sistema circulatório e controle hormonal da glicose (insulina/glucagon).',
    pontosChave: [
      'Vacina = Imunização Ativa (antígeno atenuado gera memória imunológica duradoura)',
      'Soro = Imunização Passiva (anticorpos prontos para ação curativa e emergencial)',
      'Insulina: hormônio hipoglicemiante que estimula entrada de glicose nas células',
      'Glucagon: hormônio hiperglicemiante que quebra glicogênio hepático'
    ],
    dicaEnem: 'Memorize: Picada de cobra/escorpião = SORO (anticorpos imediatos). Prevenção contra sarampo/gripe = VACINA (criação de memória pelos linfócitos).',
    corTheme: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'hover:shadow-emerald-500/10'
    }
  },

  // 3. HISTÓRIA
  {
    id: 'hum_segunda_guerra',
    titulo: 'Segunda Guerra Mundial & Era Vargas',
    categoria: 'Humanas',
    materia: 'História',
    disciplina: 'História',
    icone: '🌍',
    tempoLeitura: '7 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Ascensão dos regimes totalitários, alianças do Eixo e Aliados, Holocausto, participação da FEB e impactos na geopolítica do Estado Novo no Brasil.',
    pontosChave: [
      'Tratado de Versalhes e Crise de 1929 como raízes do conflito europeu',
      'Totalitarismos: Fascismo italiano e Nazismo alemão',
      'Participação brasileira: Envio da Força Expedicionária Brasileira (FEB)',
      'Desfecho: Criação da ONU, início da Guerra Fria e conferências de paz'
    ],
    dicaEnem: 'Relacione o envio de tropas brasileiras para combater regimes autoritários na Europa com a contradição da ditadura interna de Vargas (Estado Novo), acelerando sua queda em 1945.',
    corTheme: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      glow: 'hover:shadow-indigo-500/10'
    }
  },
  {
    id: 'hum_brasil_colonia',
    titulo: 'Brasil Colônia: Ciclo do Açúcar, Ouro & Escravidão',
    categoria: 'Humanas',
    materia: 'História',
    disciplina: 'História',
    icone: '⛵',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Pacto colonial, plantation açucareira no Nordeste, interiorização com a mineração nas Gerais e resistência escrava nos quilombos.',
    pontosChave: [
      'Plantation: Latifúndio monocultor voltado para exportação com mão de obra escravizada',
      'Ciclo do Ouro: Transferência da capital para o Rio de Janeiro (1763) e urbanização',
      'Impostos coloniais: Quinto, Derrama e Revoltas Emancipacionistas (Inconfidência Mineira)',
      'Quilombos e resistências culturais africanas e indígenas'
    ],
    dicaEnem: 'O ENEM analisa a escravidão não apenas pelo viés da opressão, mas enfatizando o protagonismo, a resistência e as trocas culturais dos povos afro-brasileiros.',
    corTheme: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      glow: 'hover:shadow-indigo-500/10'
    }
  },
  {
    id: 'hum_ditadura_militar',
    titulo: 'Ditadura Militar (1964-1985) & Redemocratização',
    categoria: 'Humanas',
    materia: 'História',
    disciplina: 'História',
    icone: '🏛️',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Atos Institucionais (AI-5), censura à imprensa, Milagre Econômico, dívida externa, campanha das Diretas Já e anistia política.',
    pontosChave: [
      'AI-5 (1968): endurecimento do regime, fechamento do Congresso e suspensão do habeas corpus',
      'Milagre Econômico: crescimento do PIB com arrocho salarial e concentração de renda',
      'Abertura "lenta, gradual e segura" sob Geisel e Figueiredo',
      'Movimento Diretas Já e promulgação da Constituição Cidadã de 1988'
    ],
    dicaEnem: 'Conecte as manifestações culturais (música de protesto, Tropicália e cinema novo) às estratégias de contestação à censura da época.',
    corTheme: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      glow: 'hover:shadow-indigo-500/10'
    }
  },

  // 4. FÍSICA
  {
    id: 'nat_termodinamica',
    titulo: 'Termodinâmica, Calorimetria & Gases',
    categoria: 'Natureza',
    materia: 'Física',
    disciplina: 'Física',
    icone: '🔥',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Calor sensível (Q=m·c·ΔT), calor latente (Q=m·L), 1ª e 2ª Leis da Termodinâmica, ciclos térmicos e rendimento de máquinas térmicas.',
    pontosChave: [
      '1ª Lei da Termodinâmica: ΔU = Q - W (conservação de energia)',
      'Trabalho de um gás: W = P·ΔV (em transformações isobáricas)',
      '2ª Lei: O calor não flui espontaneamente de um corpo frio para um quente',
      'Nenhuma máquina térmica opera com 100% de rendimento (Ciclo de Carnot)'
    ],
    dicaEnem: 'Preste muita atenção nos sinais: Gás expande (W > 0), gás recebe calor (Q > 0), gás comprime (W < 0).',
    corTheme: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-950/30',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      glow: 'hover:shadow-cyan-500/10'
    }
  },
  {
    id: 'nat_eletrodinamica',
    titulo: 'Eletrodinâmica: Circuitos, Potência & Leis de Ohm',
    categoria: 'Natureza',
    materia: 'Física',
    disciplina: 'Física',
    icone: '⚡',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Cálculo de consumo elétrico residencial (kWh), resistores em série e paralelo, 1ª Lei de Ohm (U = R·i) e efeito Joule.',
    pontosChave: [
      'Potência Elétrica: P = U·i = R·i² = U²/R',
      'Consumo de Energia: E = P × Δt (usar Potência em kW e tempo em horas para obter kWh)',
      'Resistores em Série: corrente é igual, resistências somam (Req = R1 + R2)',
      'Resistores em Paralelo: tensão U é igual para todos os aparelhos na rede doméstica'
    ],
    dicaEnem: 'A conta de luz é cobrada em quilowatts-hora (kWh). Exemplo: Chuveiro de 5000 W (5 kW) ligado por 30 min (0,5 h) gasta 2,5 kWh.',
    corTheme: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-950/30',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      glow: 'hover:shadow-cyan-500/10'
    }
  },

  // 5. QUÍMICA
  {
    id: 'nat_estequiometria',
    titulo: 'Estequiometria, Pureza & Rendimento de Reações',
    categoria: 'Natureza',
    materia: 'Química',
    disciplina: 'Química',
    icone: '⚖️',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Balanceamento de equações, relações molares (1 mol = 6·10²³ partículas = 22,4 L na CNTP), reagente limitante e excesso.',
    pontosChave: [
      '1º Passo: Sempre balancear a equação química antes de qualquer cálculo',
      'Conversão molar: Massa Molar (g/mol) relaciona gramas com mols',
      'Grau de Pureza: multiplicar a massa inicial do reagente pela porcentagem pura',
      'Rendimento: aplicar o percentual de rendimento sobre o produto teórico esperado'
    ],
    dicaEnem: 'Se o exercício der a quantidade de dois reagentes diferentes, desconfie na hora: haverá um reagente limitante que determina o produto!',
    corTheme: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-500/40 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      glow: 'hover:shadow-rose-500/10'
    }
  },
  {
    id: 'nat_quimica_organica',
    titulo: 'Química Orgânica: Funções Oxigenadas & Isomeria',
    categoria: 'Natureza',
    materia: 'Química',
    disciplina: 'Química',
    icone: '🧪',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Reconhecimento de álcoois, fenóis, aldeídos, cetonas, ácidos carboxílicos, ésteres e aminas em fármacos e biocombustíveis.',
    pontosChave: [
      'Álcool (-OH em carbono saturado) vs Fenol (-OH ligado ao anel aromático)',
      'Éster (-COO-): essências de frutas e biodiesel por transesterificação',
      'Ácido Carboxílico (-COOH): acidez orgânica e formação de sabões (saponificação)',
      'Isomeria Óptica: presença de carbono quiral/assimétrico (4 ligantes distintos)'
    ],
    dicaEnem: 'Biodiesel e sabão são temas clássicos: a reação de transesterificação entre óleos vegetais e álcool produz biodiesel e glicerol.',
    corTheme: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-500/40 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      glow: 'hover:shadow-rose-500/10'
    }
  },

  // 6. GEOGRAFIA
  {
    id: 'hum_revolucao_industrial',
    titulo: 'Revolução Industrial, Urbanização & Globalização',
    categoria: 'Humanas',
    materia: 'Geografia',
    disciplina: 'Geografia',
    icone: '🏭',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Fases da industrialização, divisão internacional do trabalho, modelos produtivos (Fordismo vs Toyotismo) e segregação socioespacial.',
    pontosChave: [
      'Fordismo: produção em massa e trabalho repetitivo vs Toyotismo: produção flexível (just-in-time)',
      'Macrocefalia urbana, conurbação, gentrificação e favelização nas metrópoles',
      'Divisão Internacional do Trabalho (DIT): países do Sul exportando commodities agrícolas/minerais',
      'Globalização assimétrica e fluxos de capital especulativo'
    ],
    dicaEnem: 'O ENEM costuma contrastar a agilidade dos fluxos de dados e mercadorias com as barreiras físicas impostas a imigrantes refugiados.',
    corTheme: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/30',
      border: 'border-blue-500/40 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      glow: 'hover:shadow-blue-500/10'
    }
  },
  {
    id: 'hum_clima_agro',
    titulo: 'Climatologia, Bacias Hidrográficas & Agropecuária',
    categoria: 'Humanas',
    materia: 'Geografia',
    disciplina: 'Geografia',
    icone: '🌦️',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Rios voadores da Amazônia, expansão da fronteira agrícola (Matopiba), El Niño/La Niña e matriz de geração hidrelétrica brasileira.',
    pontosChave: [
      'Rios Voadores: evapotranspiração amazônica que irriga o Centro-Oeste e Sudeste',
      'El Niño: aquecimento anormal do Pacífico (secas no Nordeste e chuvas fortes no Sul)',
      'Agronegócio moderno: alta produtividade e tecnologia ao lado de concentração de terras',
      'Uso da água: a irrigação agrícola consome cerca de 70% da água doce captada no Brasil'
    ],
    dicaEnem: 'Relacione o desmatamento da Amazônia e do Cerrado com a crise hídrica e energética nas grandes capitais do Sudeste.',
    corTheme: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/30',
      border: 'border-blue-500/40 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      glow: 'hover:shadow-blue-500/10'
    }
  },

  // 7. FILOSOFIA & SOCIOLOGIA
  {
    id: 'hum_cidadania',
    titulo: 'Cidadania, Direitos Humanos & Constituição de 1988',
    categoria: 'Humanas',
    materia: 'Sociologia',
    disciplina: 'Filosofia & Sociologia',
    icone: '⚖️',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Evolução dos direitos civis, políticos e sociais (T.H. Marshall), Declaração Universal dos Direitos Humanos (1948) e a Constituição Cidadã.',
    pontosChave: [
      'Gerações de direitos: 1ª (Liberdade), 2ª (Igualdade/Sociais), 3ª (Fraternidade/Ambiente)',
      'Artigo 5º da CF/88: Inviolabilidade do direito à vida, liberdade, igualdade e segurança',
      'Artigo 6º: Direitos sociais essenciais (educação, saúde, trabalho, moradia, transporte)',
      'Cidadania ativa e a teoria do "Cidadão de Papel" de Gilberto Dimenstein'
    ],
    dicaEnem: 'O Artigo 6º da Constituição é o maior repertório coringa da Redação Nota 1000 para fundamentar omissões estatais em serviços básicos.',
    corTheme: {
      bg: 'bg-purple-500/10 dark:bg-purple-950/30',
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      glow: 'hover:shadow-purple-500/10'
    }
  },
  {
    id: 'hum_contratualismo',
    titulo: 'Contratualismo & Poder: Hobbes, Locke e Rousseau',
    categoria: 'Humanas',
    materia: 'Filosofia',
    disciplina: 'Filosofia & Sociologia',
    icone: '📜',
    tempoLeitura: '5 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Estado de natureza, pacto social, defesa do absolutismo (Hobbes), propriedade privada (Locke) e vontade geral democrática (Rousseau).',
    pontosChave: [
      'Hobbes: O homem é o lobo do homem; o Estado absolutista (Leviatã) garante a paz',
      'Locke: Direitos naturais inalienáveis (vida, liberdade e propriedade privada)',
      'Rousseau: O homem nasce bom, a sociedade o corrompe; soberania popular e bem comum',
      'Habermas e a Ação Comunicativa na esfera pública contemporânea'
    ],
    dicaEnem: 'Use John Locke para debater a responsabilidade do Estado em garantir condições para o exercício pleno da liberdade individual.',
    corTheme: {
      bg: 'bg-purple-500/10 dark:bg-purple-950/30',
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      glow: 'hover:shadow-purple-500/10'
    }
  },

  // 8. LÍNGUA PORTUGUESA & LITERATURA
  {
    id: 'ling_figuras',
    titulo: 'Figuras de Linguagem & Funções do Texto',
    categoria: 'Linguagens',
    materia: 'Português',
    disciplina: 'Língua Portuguesa & Literatura',
    icone: '✍️',
    tempoLeitura: '4 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Metáfora, metonímia, paradoxo, antítese, ironia, hipérbole e as 6 funções da linguagem de Roman Jakobson em anúncios e poemas.',
    pontosChave: [
      'Função Conativa/Apelativa: foco no receptor (verbos no imperativo, campanhas publicitárias)',
      'Função Emotiva: foco no emissor (expressão de sentimentos em 1ª pessoa)',
      'Função Metalinguística: o código explica o próprio código (dicionários, poemas sobre poesia)',
      'Antítese (ideias opostas harmonizadas) vs Paradoxo (ideias aparentemente contraditórias e ilógicas)'
    ],
    dicaEnem: 'O ENEM foca no efeito de sentido das figuras dentro de campanhas de vacinação, charges sociais e tirinhas da Mafalda/Calvin.',
    corTheme: {
      bg: 'bg-pink-500/10 dark:bg-pink-950/30',
      border: 'border-pink-500/40 hover:border-pink-400',
      badge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      text: 'text-pink-600 dark:text-pink-400',
      glow: 'hover:shadow-pink-500/10'
    }
  },
  {
    id: 'lit_memorias_postumas',
    titulo: 'Memórias Póstumas de Brás Cubas (Machado de Assis)',
    categoria: 'Literatura',
    materia: 'Literatura',
    disciplina: 'Língua Portuguesa & Literatura',
    icone: '📖',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Marco do Realismo brasileiro (1881). Narrador defunto, ironia machadiana, pessimismo e crítica ácida à hipocrisia da elite carioca.',
    pontosChave: [
      'Narrador em primeira pessoa póstumo ("defunto autor" livre de convenções sociais)',
      'Capítulos curtos, digressões metalinguísticas e diálogo direto com o leitor',
      'Filosofia do Humanitismo de Quincas Borba como sátira ao Positivismo e Darwinismo Social',
      'Epílogo célebre: "Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria."'
    ],
    dicaEnem: 'Excelente repertório coringa na Redação para discutir a indiferença da elite perante as desigualdades sociais e a vaidade fútil.',
    corTheme: {
      bg: 'bg-pink-500/10 dark:bg-pink-950/30',
      border: 'border-pink-500/40 hover:border-pink-400',
      badge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      text: 'text-pink-600 dark:text-pink-400',
      glow: 'hover:shadow-pink-500/10'
    }
  },
  {
    id: 'lit_o_cortico',
    titulo: 'O Cortiço (Aluísio Azevedo) & Naturalismo',
    categoria: 'Literatura',
    materia: 'Literatura',
    disciplina: 'Língua Portuguesa & Literatura',
    icone: '🏘️',
    tempoLeitura: '6 min',
    incidencia: 'Mais Cai',
    resumoBreve: 'Romance ápice do Naturalismo no Brasil (1890). Zoomorfização de personagens, determinismo do meio, raça e momento histórico.',
    pontosChave: [
      'O cortiço atua como um organismo vivo e personagem coletivo que molda os indivíduos',
      'Personagens-chave: João Romão (acumulação primitiva), Jerônimo (abrasileiramento) e Rita Baiana',
      'Zoomorfização: comparação constante de seres humanos a animais e insetos',
      'Contraste espacial entre a habitação coletiva periférica e o sobrado aristocrático'
    ],
    dicaEnem: 'Use para exemplificar a segregação socioespacial urbana, a higienização das cidades e a exploração da mão de obra periférica.',
    corTheme: {
      bg: 'bg-pink-500/10 dark:bg-pink-950/30',
      border: 'border-pink-500/40 hover:border-pink-400',
      badge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      text: 'text-pink-600 dark:text-pink-400',
      glow: 'hover:shadow-pink-500/10'
    }
  }
];

const STUDY_PLANS: StudyPlanItem[] = [
  {
    id: 'plano_mat_30d',
    titulo: 'Cronograma 30 Dias: Da Matemática Básica aos 800+ no ENEM',
    disciplina: 'Matemática',
    categoria: 'Matemática',
    icone: '📐',
    duracaoEstimada: '4 Semanas (30 Horas)',
    nivel: 'Intensivo ENEM',
    objetivoPrincipal: 'Dominar os tópicos com maior peso na TRI (Matemática Básica, Geometria e Funções) para garantir mais de 800 pontos.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Fundações & Aritmética',
        descricao: 'Frações, porcentagens, razão/proporção, regra de três simples e composta, conversões métricas.',
        metaExercicios: 45
      },
      {
        etapa: 'Semana 2: Estatística & Probabilidade',
        descricao: 'Leitura de gráficos, cálculo de médias ponderadas, mediana, desvio padrão e PFC/Combinações.',
        metaExercicios: 50
      },
      {
        etapa: 'Semana 3: Geometria Plana e Espacial',
        descricao: 'Áreas de figuras planas, Teorema de Pitágoras, volumes de prismas, cilindros e conversão de m³ para litros.',
        metaExercicios: 55
      },
      {
        etapa: 'Semana 4: Funções & Simulado TRI',
        descricao: 'Funções de 1º e 2º grau (máximo/mínimo), função exponencial e resolução de prova cronometrada.',
        metaExercicios: 60
      }
    ],
    habilidadesEnem: [
      'H21: Utilizar modelos de variação para resolver problemas práticos',
      'H12: Resolver situações-problema que envolvam cálculos de grandezas e unidades',
      'H28: Analisar informações de tabelas e gráficos estatísticos'
    ],
    corTheme: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      text: 'text-amber-600 dark:text-amber-400',
      glow: 'hover:shadow-amber-500/10'
    }
  },
  {
    id: 'plano_bio_reta_final',
    titulo: 'Plano Tático de Ecologia & Fisiologia Humana para Natureza',
    disciplina: 'Biologia',
    categoria: 'Natureza',
    icone: '🌿',
    duracaoEstimada: '3 Semanas (22 Horas)',
    nivel: 'Avançado',
    objetivoPrincipal: 'Garantir acertos nos 2 eixos mais recorrentes de Biologia: Desequilíbrios Ecológicos e Sistema Imunológico.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Ecologia e Biomas Brasileiros',
        descricao: 'Cadeias tróficas, ciclos do nitrogênio e carbono, eutrofização, biorremediação e características do Cerrado e Mata Atlântica.',
        metaExercicios: 40
      },
      {
        etapa: 'Semana 2: Fisiologia & Imunologia',
        descricao: 'Mecanismo de ação de vacinas vs soros, controle hormonal da glicemia, sistema circulatório e excreção.',
        metaExercicios: 45
      },
      {
        etapa: 'Semana 3: Genética & Biotecnologia',
        descricao: 'Cruzamentos mendelianos, probabilidade genética, sistema ABO/Rh, transgênicos e tecnologia do DNA recombinante.',
        metaExercicios: 50
      }
    ],
    habilidadesEnem: [
      'H10: Analisar perturbações ambientais e propor medidas sustentáveis',
      'H14: Identificar a relação entre avanços biotecnológicos e impactos na saúde humana'
    ],
    corTheme: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'hover:shadow-emerald-500/10'
    }
  },
  {
    id: 'plano_hist_cronologico',
    titulo: 'Trilha Cronológica de História do Brasil: Da Colônia à Redemocratização',
    disciplina: 'História',
    categoria: 'Humanas',
    icone: '🏛️',
    duracaoEstimada: '4 Semanas (25 Horas)',
    nivel: 'Intermediário',
    objetivoPrincipal: 'Compreender as transformações políticas, econômicas e sociais do Brasil para responder questões de Humanas e embasar a Redação.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Brasil Colonial & Escravidão',
        descricao: 'Plantation açucareira, economia mineradora no século XVIII, revoltas nativistas e movimentos emancipacionistas.',
        metaExercicios: 35
      },
      {
        etapa: 'Semana 2: Império Brasileiro',
        descricao: 'Processo de independência, Primeiro Reinado, Período Regencial, Segundo Reinado e Guerra do Paraguai.',
        metaExercicios: 40
      },
      {
        etapa: 'Semana 3: República Velha & Era Vargas',
        descricao: 'Coronelismo e política café-com-leite, Revolução de 1930, Estado Novo, DIP e direitos trabalhistas da CLT.',
        metaExercicios: 45
      },
      {
        etapa: 'Semana 4: Ditadura Militar & Nova República',
        descricao: 'Golpe de 1964, Atos Institucionais, Milagre Econômico, Diretas Já e a Constituição Cidadã de 1988.',
        metaExercicios: 50
      }
    ],
    habilidadesEnem: [
      'H08: Analisar a ação dos movimentos sociais nas transformações políticas do Brasil',
      'H02: Comparar processos de formação e consolidação da cidadania'
    ],
    corTheme: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
      border: 'border-indigo-500/40 hover:border-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      glow: 'hover:shadow-indigo-500/10'
    }
  },
  {
    id: 'plano_fisica_pratica',
    titulo: 'Roteiro Prático de Física: Eletrodinâmica & Termologia Descomplicadas',
    disciplina: 'Física',
    categoria: 'Natureza',
    icone: '⚡',
    duracaoEstimada: '3 Semanas (20 Horas)',
    nivel: 'Intermediário',
    objetivoPrincipal: 'Dominar o cálculo de consumo elétrico diário, circuitos mistos e conservação de energia térmica.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Circuitos Elétricos & Consumo Residencial',
        descricao: '1ª e 2ª Leis de Ohm, resistores em série e paralelo, cálculo de potência (P=U·i) e consumo em kWh.',
        metaExercicios: 40
      },
      {
        etapa: 'Semana 2: Calorimetria & Mudanças de Estado',
        descricao: 'Calor sensível (Q=m·c·ΔT), calor latente de fusão/vaporização e equilíbrio térmico entre corpos.',
        metaExercicios: 45
      },
      {
        etapa: 'Semana 3: Leis de Newton & Energia Mecânica',
        descricao: 'Forças de atrito, tração e normal, conservação da energia mecânica (cinética e potencial).',
        metaExercicios: 45
      }
    ],
    habilidadesEnem: [
      'H05: Dimensionar circuitos elétricos e calcular o uso sustentável de energia',
      'H06: Avaliar propostas de intervenção tecnológica em conservação térmica'
    ],
    corTheme: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-950/30',
      border: 'border-cyan-500/40 hover:border-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      glow: 'hover:shadow-cyan-500/10'
    }
  },
  {
    id: 'plano_quimica_reacoes',
    titulo: 'Checklist de Química Orgânica & Físico-Química para o ENEM',
    disciplina: 'Química',
    categoria: 'Natureza',
    icone: '🧪',
    duracaoEstimada: '3 Semanas (20 Horas)',
    nivel: 'Avançado',
    objetivoPrincipal: 'Reconhecer funções orgânicas em fármacos e acertar cálculos estequiométricos com pureza e rendimento.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Estequiometria & Soluções',
        descricao: 'Relações molares, balanceamento químico, reagente limitante, grau de pureza e cálculo de concentração em g/L e mol/L.',
        metaExercicios: 45
      },
      {
        etapa: 'Semana 2: Funções Oxigenadas & Nitrogenadas',
        descricao: 'Identificação estrutural de álcool, fenol, éster, amina, amida e reações de esterificação e saponificação.',
        metaExercicios: 40
      },
      {
        etapa: 'Semana 3: Pilhas, Eletrólise & pH',
        descricao: 'Potenciais de redução, identificação de ânodo/cátodo, corrosão metálica e cálculo de escala de pH.',
        metaExercicios: 45
      }
    ],
    habilidadesEnem: [
      'H17: Relacionar propriedades dos materiais às suas estruturas moleculares',
      'H18: Quantificar reagentes e produtos em processos industriais e biológicos'
    ],
    corTheme: {
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-500/40 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      glow: 'hover:shadow-rose-500/10'
    }
  },
  {
    id: 'plano_humanas_repertorios',
    titulo: 'Plano de Repertórios Sociológicos e Filosóficos para Nota 1000',
    disciplina: 'Filosofia & Sociologia',
    categoria: 'Humanas',
    icone: '⚖️',
    duracaoEstimada: '2 Semanas (15 Horas)',
    nivel: 'Intensivo ENEM',
    objetivoPrincipal: 'Conectar conceitos de pensadores clássicos e contemporâneos aos 5 eixos temáticos mais cotados da Redação.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Cidadania, Omissão Estatal e Contratualismo',
        descricao: 'Aplicação prática do Artigo 6º da CF/88, Gilberto Dimenstein (Cidadão de Papel) e John Locke.',
        metaExercicios: 30
      },
      {
        etapa: 'Semana 2: Sociedade de Consumo & Modernidade Líquida',
        descricao: 'Zygmunt Bauman, Indústria Cultural de Theodor Adorno e Byung-Chul Han (Sociedade do Cansaço).',
        metaExercicios: 35
      }
    ],
    habilidadesEnem: [
      'H23: Analisar a importância dos valores éticos na vida em sociedade',
      'Competência 2 da Redação: Desenvolver o tema a partir de conhecimentos socioculturais'
    ],
    corTheme: {
      bg: 'bg-purple-500/10 dark:bg-purple-950/30',
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      glow: 'hover:shadow-purple-500/10'
    }
  },
  {
    id: 'plano_ling_literatura',
    titulo: 'Guia de Obras Clássicas & Interpretação Textual Crítica',
    disciplina: 'Língua Portuguesa & Literatura',
    categoria: 'Linguagens',
    icone: '✍️',
    duracaoEstimada: '3 Semanas (18 Horas)',
    nivel: 'Intermediário',
    objetivoPrincipal: 'Analisar as obras de maior incidência no ENEM/vestibulares e dominar a identificação de funções e figuras de linguagem.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Funções da Linguagem & Gêneros Textuais',
        descricao: 'Função emotiva, referencial, conativa e metalinguística em charges, crônicas e campanhas públicas.',
        metaExercicios: 35
      },
      {
        etapa: 'Semana 2: Realismo & Naturalismo Brasileiro',
        descricao: 'Machado de Assis (Memórias Póstumas e Dom Casmurro) e Aluísio Azevedo (O Cortiço).',
        metaExercicios: 40
      },
      {
        etapa: 'Semana 3: Modernismo de 1922 & Poesia Social de 30',
        descricao: 'Mário de Andrade, Oswald de Andrade (Antropofagia), Carlos Drummond de Andrade e Graciliano Ramos (Vidas Secas).',
        metaExercicios: 45
      }
    ],
    habilidadesEnem: [
      'H15: Estabelecer relações entre o texto literário e o momento histórico de sua produção',
      'H18: Identificar os elementos que concorrem para a progressão temática do texto'
    ],
    corTheme: {
      bg: 'bg-pink-500/10 dark:bg-pink-950/30',
      border: 'border-pink-500/40 hover:border-pink-400',
      badge: 'bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      text: 'text-pink-600 dark:text-pink-400',
      glow: 'hover:shadow-pink-500/10'
    }
  },
  {
    id: 'plano_geo_atualidades',
    titulo: 'Cronograma Temático de Geografia Humana & Meio Ambiente no ENEM',
    disciplina: 'Geografia',
    categoria: 'Humanas',
    icone: '🌍',
    duracaoEstimada: '3 Semanas (20 Horas)',
    nivel: 'Intermediário',
    objetivoPrincipal: 'Compreender a dinâmica do agronegócio, matriz energética brasileira, bacias hidrográficas e urbanização desigual.',
    passosSemanais: [
      {
        etapa: 'Semana 1: Urbanização, População & Migrações',
        descricao: 'Conurbação, gentrificação, pirâmides etárias brasileiras e fluxos migratórios contemporâneos.',
        metaExercicios: 35
      },
      {
        etapa: 'Semana 2: Agropecuária & Questão Agrária',
        descricao: 'Expansão do Matopiba, estrutura fundiária brasileira, transgênicos e impactos nos biomas Cerrado e Amazônia.',
        metaExercicios: 40
      },
      {
        etapa: 'Semana 3: Climatologia & Geopolítica Energética',
        descricao: 'Rios voadores, matriz hidrelétrica/solar/eólica brasileira e transição energética global.',
        metaExercicios: 45
      }
    ],
    habilidadesEnem: [
      'H26: Relacionar o uso de recursos naturais com os impactos socioambientais',
      'H27: Analisar a dinâmica espacial do agronegócio e da indústria no território brasileiro'
    ],
    corTheme: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/30',
      border: 'border-blue-500/40 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      glow: 'hover:shadow-blue-500/10'
    }
  }
];

const SAVED_MIND_MAPS: MindMapItem[] = [
  {
    id: 'mm_ecologia',
    titulo: 'Ecologia & Teias Tróficas',
    materia: 'Biologia',
    disciplina: 'Biologia',
    nos: 14,
    categoria: 'Natureza',
    corTheme: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    dataSalva: 'Hoje',
    icone: '🌿',
    conceitosPrincipais: ['Produtores', 'Consumidores', 'Bioacumulação', 'Eutrofização', 'Ciclo do Nitrogênio']
  },
  {
    id: 'mm_segunda_guerra',
    titulo: 'Segunda Guerra Mundial & Era Vargas',
    materia: 'História',
    disciplina: 'História',
    nos: 18,
    categoria: 'Humanas',
    corTheme: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
    dataSalva: 'Ontem',
    icone: '🌍',
    conceitosPrincipais: ['Crise de 1929', 'Eixo vs Aliados', 'FEB no Brasil', 'Holocausto', 'Criação da ONU']
  },
  {
    id: 'mm_funcoes',
    titulo: 'Funções & Parábolas',
    materia: 'Matemática',
    disciplina: 'Matemática',
    nos: 12,
    categoria: 'Matemática',
    corTheme: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    dataSalva: 'Há 2 dias',
    icone: '📈',
    conceitosPrincipais: ['Função Afim', 'Vértice (Xv, Yv)', 'Raízes / Bhaskara', 'Interpretação Gráfica']
  },
  {
    id: 'mm_modernismo',
    titulo: 'Modernismo Brasileiro & Vanguardas',
    materia: 'Literatura',
    disciplina: 'Língua Portuguesa & Literatura',
    nos: 16,
    categoria: 'Literatura',
    corTheme: 'border-rose-500/40 bg-rose-500/10 text-rose-400',
    dataSalva: 'Há 3 dias',
    icone: '🎨',
    conceitosPrincipais: ['Semana de 22', 'Antropofagia', '1ª Fase (Destrutiva)', '2ª Fase (Regionalista)']
  },
  {
    id: 'mm_cidadania',
    titulo: 'Cidadania & CF/88',
    materia: 'Sociologia',
    disciplina: 'Filosofia & Sociologia',
    nos: 11,
    categoria: 'Humanas',
    corTheme: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
    dataSalva: 'Há 4 dias',
    icone: '⚖️',
    conceitosPrincipais: ['Artigo 5º', 'Artigo 6º (Sociais)', 'Gerações de Direitos', 'Cidadania Ativa']
  },
  {
    id: 'mm_termodinamica',
    titulo: 'Termodinâmica & Carnot',
    materia: 'Física',
    disciplina: 'Física',
    nos: 13,
    categoria: 'Natureza',
    corTheme: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    dataSalva: 'Há 5 dias',
    icone: '🔥',
    conceitosPrincipais: ['1ª Lei (ΔU=Q-W)', 'Trabalho de Gás', 'Ciclo de Carnot', 'Rendimento Térmico']
  }
];

export type TipoConteudoFiltro = 'todos' | 'resumos' | 'planos' | 'mapas';

interface BibliotecaSectionProps {
  onAskGabi?: (prompt: string) => void;
  onOpenMindmapTab?: () => void;
}

export const BibliotecaSection: React.FC<BibliotecaSectionProps> = ({
  onAskGabi,
  onOpenMindmapTab
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDisciplina, setSelectedDisciplina] = useState<DisciplinaNome>('Todas');
  const [tipoFiltro, setTipoFiltro] = useState<TipoConteudoFiltro>('todos');
  const [viewMode, setViewMode] = useState<'agrupado' | 'grade'>('agrupado');
  const [collapsedDisciplinas, setCollapsedDisciplinas] = useState<Record<string, boolean>>({});

  const [activeStudyModal, setActiveStudyModal] = useState<StudyCardItem | null>(null);
  const [activePlanModal, setActivePlanModal] = useState<StudyPlanItem | null>(null);
  const [activeMindmapModal, setActiveMindmapModal] = useState<MindMapItem | null>(null);

  // Toggle discipline collapse in grouped mode
  const toggleCollapse = (disciplina: string) => {
    setCollapsedDisciplinas((prev) => ({
      ...prev,
      [disciplina]: !prev[disciplina]
    }));
  };

  // Filtered Study Materials
  const filteredMaterials = useMemo(() => {
    return STUDY_MATERIALS.filter((item) => {
      const matchDisciplina =
        selectedDisciplina === 'Todas' || item.disciplina === selectedDisciplina;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.titulo.toLowerCase().includes(q) ||
        item.materia.toLowerCase().includes(q) ||
        item.disciplina.toLowerCase().includes(q) ||
        item.categoria.toLowerCase().includes(q) ||
        item.resumoBreve.toLowerCase().includes(q) ||
        item.dicaEnem.toLowerCase().includes(q);

      return matchDisciplina && matchSearch;
    });
  }, [searchQuery, selectedDisciplina]);

  // Filtered Study Plans
  const filteredPlans = useMemo(() => {
    return STUDY_PLANS.filter((plan) => {
      const matchDisciplina =
        selectedDisciplina === 'Todas' || plan.disciplina === selectedDisciplina;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        plan.titulo.toLowerCase().includes(q) ||
        plan.disciplina.toLowerCase().includes(q) ||
        plan.objetivoPrincipal.toLowerCase().includes(q) ||
        plan.passosSemanais.some((p) =>
          p.etapa.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q)
        );

      return matchDisciplina && matchSearch;
    });
  }, [searchQuery, selectedDisciplina]);

  // Filtered Mind Maps
  const filteredMindMaps = useMemo(() => {
    return SAVED_MIND_MAPS.filter((mm) => {
      const matchDisciplina =
        selectedDisciplina === 'Todas' || mm.disciplina === selectedDisciplina;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        mm.titulo.toLowerCase().includes(q) ||
        mm.materia.toLowerCase().includes(q) ||
        mm.disciplina.toLowerCase().includes(q) ||
        mm.conceitosPrincipais.some((c) => c.toLowerCase().includes(q));

      return matchDisciplina && matchSearch;
    });
  }, [searchQuery, selectedDisciplina]);

  // Grouped Disciplines for 'agrupado' view
  const activeDisciplinasList = useMemo(() => {
    const list = DISCIPLINAS_CONFIG.filter((d) => d.id !== 'Todas');
    if (selectedDisciplina !== 'Todas') {
      return list.filter((d) => d.id === selectedDisciplina);
    }
    return list;
  }, [selectedDisciplina]);

  // Total counts for badges
  const totalResumos = STUDY_MATERIALS.length;
  const totalPlanos = STUDY_PLANS.length;
  const totalMapas = SAVED_MIND_MAPS.length;

  return (
    <div id="biblioteca-conteudos-section" className="BibliotecaSection space-y-8 pb-12">
      {/* 1. CABEÇALHO & ESTRUTURA PRINCIPAL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl sm:text-4xl">📚</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Biblioteca & Planos de Estudo
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              Explore resumos essenciais, cronogramas guiados de estudo e mapas mentais organizados por disciplina para o ENEM e vestibulares.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{totalResumos} Resumos</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>{totalPlanos} Planos Guiados</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <Brain className="w-3.5 h-3.5" />
              <span>{totalMapas} Mapas Mentais</span>
            </div>
          </div>
        </div>

        {/* Autocomplete Search Bar */}
        <BibliotecaAutocompleteSearch
          materials={STUDY_MATERIALS}
          mindMaps={SAVED_MIND_MAPS}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onSelectMaterial={(item) => setActiveStudyModal(item)}
          onSelectMindMap={(mm) => setActiveMindmapModal(mm)}
          onSelectCategory={() => {}}
          selectedCategory="Tudo"
        />

        {/* 2. BARRA DE FILTRO POR DISCIPLINA (CARROSSEL HORIZONTAL) */}
        <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-0.5">
            <span className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Filtrar por Disciplina</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">Deslize para ver todas as matérias</span>
          </div>

          <div
            id="biblioteca-disciplinas-bar"
            className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap' }}
          >
            {DISCIPLINAS_CONFIG.map((d) => {
              const isSelected = selectedDisciplina === d.id;
              const countMateriais =
                d.id === 'Todas'
                  ? STUDY_MATERIALS.length + STUDY_PLANS.length
                  : STUDY_MATERIALS.filter((m) => m.disciplina === d.id).length +
                    STUDY_PLANS.filter((p) => p.disciplina === d.id).length;

              return (
                <motion.button
                  key={d.id}
                  id={`filter-disciplina-${d.id.toLowerCase().replace(/\s+/g, '-')}`}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    playClickSound();
                    setSelectedDisciplina(d.id);
                  }}
                  className={`relative px-3.5 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/30'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-base">{d.icone}</span>
                  <span className="font-bold">{d.nome}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {countMateriais}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 3. TABS DE TIPO DE CONTEÚDO & ALTERNÂNCIA DE MODO DE VISUALIZAÇÃO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Sub-Filter: Tipo de Conteúdo */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
            <button
              onClick={() => {
                playClickSound();
                setTipoFiltro('todos');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tipoFiltro === 'todos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌟 Todos ({filteredMaterials.length + filteredPlans.length + filteredMindMaps.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setTipoFiltro('resumos');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tipoFiltro === 'resumos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resumos ({filteredMaterials.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setTipoFiltro('planos');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tipoFiltro === 'planos'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Planos Guiados ({filteredPlans.length})</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setTipoFiltro('mapas');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                tipoFiltro === 'mapas'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Mapas Mentais ({filteredMindMaps.length})</span>
            </button>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Modo:</span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  playClickSound();
                  setViewMode('agrupado');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'agrupado'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visualizar conteúdos agrupados por disciplina"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Agrupado</span>
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setViewMode('grade');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grade'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Visualizar em grade unificada"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grade Geral</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTEÚDO PRINCIPAL (AGRUPADO POR DISCIPLINA OU GRADE GERAL) */}
      {viewMode === 'agrupado' ? (
        /* MODO AGRUPADO POR DISCIPLINA */
        <div className="space-y-10">
          {activeDisciplinasList.map((disc) => {
            const discMaterials = filteredMaterials.filter((m) => m.disciplina === disc.id);
            const discPlans = filteredPlans.filter((p) => p.disciplina === disc.id);
            const discMindMaps = filteredMindMaps.filter((mm) => mm.disciplina === disc.id);

            const showResumos = tipoFiltro === 'todos' || tipoFiltro === 'resumos';
            const showPlanos = tipoFiltro === 'todos' || tipoFiltro === 'planos';
            const showMapas = tipoFiltro === 'todos' || tipoFiltro === 'mapas';

            const totalItemDisciplina =
              (showResumos ? discMaterials.length : 0) +
              (showPlanos ? discPlans.length : 0) +
              (showMapas ? discMindMaps.length : 0);

            if (totalItemDisciplina === 0) return null;

            const isCollapsed = !!collapsedDisciplinas[disc.id];

            return (
              <motion.section
                key={disc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-6"
              >
                {/* Header da Disciplina com Ícone, Nome, Contador e Botão Expandir/Recolher */}
                <div
                  onClick={() => toggleCollapse(disc.id)}
                  className="flex items-center justify-between cursor-pointer group select-none pb-2 border-b border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/80 text-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {disc.icone}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {disc.nome}
                        </h2>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${disc.badgeCor} uppercase`}>
                          {disc.area}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {disc.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                      {totalItemDisciplina} {totalItemDisciplina === 1 ? 'item' : 'itens'}
                    </span>
                    <button
                      type="button"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      aria-label={isCollapsed ? 'Expandir' : 'Recolher'}
                    >
                      <ChevronRight
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isCollapsed ? 'rotate-0' : 'rotate-90'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-6 pt-1">
                    {/* Subseção A: Planos de Estudo Guiados da Disciplina */}
                    {showPlanos && discPlans.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          <Compass className="w-4 h-4" />
                          <span>Planos de Estudo Guiados ({discPlans.length})</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {discPlans.map((plan) => (
                            <motion.div
                              key={plan.id}
                              whileHover={{ y: -3, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                playClickSound();
                                setActivePlanModal(plan);
                              }}
                              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900/60 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-wider">
                                    {plan.nivel}
                                  </span>
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{plan.duracaoEstimada}</span>
                                  </div>
                                </div>

                                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {plan.titulo}
                                </h3>

                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {plan.objetivoPrincipal}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
                                <div className="flex items-center gap-1.5">
                                  <ListOrdered className="w-3.5 h-3.5" />
                                  <span>{plan.passosSemanais.length} Etapas Estruturadas</span>
                                </div>
                                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  Ver Roteiro <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subseção B: Resumos e Fichamentos da Disciplina */}
                    {showResumos && discMaterials.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                          <span>Resumos & Fichamentos Express ({discMaterials.length})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {discMaterials.map((item) => (
                            <motion.div
                              key={item.id}
                              whileHover={{ y: -3, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                playClickSound();
                                setActiveStudyModal(item);
                              }}
                              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${item.corTheme.border} ${item.corTheme.glow} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group relative overflow-hidden`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-2xl group-hover:scale-110 transition-transform">
                                    {item.icone}
                                  </span>
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                                    {item.incidencia}
                                  </span>
                                </div>

                                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {item.titulo}
                                </h4>

                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {item.resumoBreve}
                                </p>
                              </div>

                              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{item.tempoLeitura}</span>
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  Ler Resumo <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            );
          })}
        </div>
      ) : (
        /* MODO GRADE GERAL */
        <div className="space-y-8">
          {/* Planos de Estudo Grid */}
          {(tipoFiltro === 'todos' || tipoFiltro === 'planos') && filteredPlans.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Planos de Estudo Guiados
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {filteredPlans.length} {filteredPlans.length === 1 ? 'plano' : 'planos'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      playClickSound();
                      setActivePlanModal(plan);
                    }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase">
                          {plan.disciplina}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {plan.duracaoEstimada}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {plan.titulo}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {plan.objetivoPrincipal}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
                      <span>{plan.passosSemanais.length} Etapas de Estudo</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Acessar Plano <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Resumos & Fichamentos Grid */}
          {(tipoFiltro === 'todos' || tipoFiltro === 'resumos') && filteredMaterials.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Resumos & Fichamentos Express
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {filteredMaterials.length} {filteredMaterials.length === 1 ? 'tópico' : 'tópicos'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredMaterials.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      playClickSound();
                      setActiveStudyModal(item);
                    }}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${item.corTheme.border} ${item.corTheme.glow} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {item.icone}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${item.corTheme.badge} uppercase truncate max-w-[90px]`}>
                          {item.disciplina}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.titulo}
                      </h4>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.resumoBreve}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span>{item.tempoLeitura}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Ler <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 5. SEÇÃO MAPAS MENTAIS */}
      {(tipoFiltro === 'todos' || tipoFiltro === 'mapas') && (
        <section className="bg-slate-900 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Mapas Mentais por Disciplina
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Conexões visuais e diagramas ramificados para fixação acelerada.
              </p>
            </div>

            {onOpenMindmapTab && (
              <button
                onClick={onOpenMindmapTab}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Gerador de Mapas IA</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div
            id="biblioteca-mindmaps-carousel"
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredMindMaps.map((map) => (
              <div
                key={map.id}
                id={`card-mindmap-${map.id}`}
                onClick={() => setActiveMindmapModal(map)}
                className="w-64 sm:w-72 shrink-0 p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 flex flex-col justify-between space-y-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {map.icone}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 border border-slate-600">
                      {map.nos} ramificações
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-snug group-hover:text-indigo-300 transition-colors">
                      {map.titulo}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {map.disciplina}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {map.conceitosPrincipais.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-900/80 text-slate-300 font-medium border border-slate-700/50 truncate max-w-[120px]"
                      >
                        {c}
                      </span>
                    ))}
                    {map.conceitosPrincipais.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-900/80 text-slate-400 font-medium">
                        +{map.conceitosPrincipais.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Salvo {map.dataSalva}</span>
                  <span className="text-indigo-400 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver Diagrama ➔
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. MODAL DETALHE: FICHA DE ESTUDO COMPLETA */}
      <AnimatePresence>
        {activeStudyModal && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/80 shrink-0">
                    {activeStudyModal.icone}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${activeStudyModal.corTheme.badge} uppercase`}>
                        {activeStudyModal.disciplina}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {activeStudyModal.incidencia} no ENEM
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                      {activeStudyModal.titulo}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStudyModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Fechar resumo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Visão Geral do Tópico
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {activeStudyModal.resumoBreve}
                </p>
              </div>

              {/* Key Points */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Pontos Fundamentais para Lembrar</span>
                </h4>
                <div className="space-y-2">
                  {activeStudyModal.pontosChave.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key ENEM Tip */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 space-y-1 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-black text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Dica de Ouro no ENEM</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {activeStudyModal.dicaEnem}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {onAskGabi && (
                  <button
                    onClick={() => {
                      const topic = activeStudyModal.titulo;
                      const disc = activeStudyModal.disciplina;
                      setActiveStudyModal(null);
                      onAskGabi(
                        `Professora Gabi, estou estudando o resumo de "${topic}" (${disc}) na Biblioteca. Pode me explicar os conceitos mais cobrados e fazer 2 perguntas de teste no estilo ENEM?`
                      );
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Tirar Dúvidas com Gabi IA</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveStudyModal(null)}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL DETALHE: PLANO DE ESTUDO GUIADO */}
      <AnimatePresence>
        {activePlanModal && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/80 shrink-0">
                    {activePlanModal.icone}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase">
                        {activePlanModal.disciplina}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {activePlanModal.duracaoEstimada}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                      {activePlanModal.titulo}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActivePlanModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Fechar plano"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Objetivo Principal */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" /> Objetivo de Aprendizagem
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {activePlanModal.objetivoPrincipal}
                </p>
              </div>

              {/* Passos / Semanas Estruturadas */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Cronograma Passo a Passo</span>
                </h4>

                <div className="space-y-3">
                  {activePlanModal.passosSemanais.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {step.etapa}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          🎯 Meta: {step.metaExercicios} questões
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {step.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habilidades do ENEM Trabalhadas */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Habilidades da Matriz ENEM
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activePlanModal.habilidadesEnem.map((hab, hIdx) => (
                    <span
                      key={hIdx}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {hab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {onAskGabi && (
                  <button
                    onClick={() => {
                      const pTitle = activePlanModal.titulo;
                      const disc = activePlanModal.disciplina;
                      setActivePlanModal(null);
                      onAskGabi(
                        `Gabi, quero seguir o plano de estudos "${pTitle}" (${disc}). Pode me gerar um cronograma diário de 7 dias com metas e exercícios sugeridos?`
                      );
                    }}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Iniciar Plano com Professora Gabi IA</span>
                  </button>
                )}
                <button
                  onClick={() => setActivePlanModal(null)}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. MODAL DETALHE: MAPA MENTAL */}
      <AnimatePresence>
        {activeMindmapModal && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeMindmapModal.icone}</span>
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {activeMindmapModal.disciplina}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                      {activeMindmapModal.titulo}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMindmapModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Fechar mapa mental"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Nós & Conexões do Mapa Mental ({activeMindmapModal.nos} nós)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeMindmapModal.conceitosPrincipais.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-2 text-xs font-bold text-slate-200"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => {
                    setActiveMindmapModal(null);
                    if (onOpenMindmapTab) {
                      onOpenMindmapTab();
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Brain className="w-4 h-4" />
                  <span>Abrir no Estúdio de Mapas Mentais</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
