import { OFFLINE_QUESTION_BANK } from './offlineQuestionBank';

export interface SimuladoQuestion {
  id: string;
  area: 'Linguagens' | 'Ciências Humanas' | 'Ciências da Natureza' | 'Matemática';
  disciplina: string;
  dificuldade: 'Fácil' | 'Média' | 'Difícil';
  enunciado: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

const MAPA_MATERIA_AREA: Record<string, { area: SimuladoQuestion['area']; disciplina: string }> = {
  'Biologia & Meio Ambiente': { area: 'Ciências da Natureza', disciplina: 'Biologia' },
  'Matemática & Raciocínio': { area: 'Matemática', disciplina: 'Matemática' },
  'História do Brasil & Geral': { area: 'Ciências Humanas', disciplina: 'História' },
  'Química Orgânica & Geral': { area: 'Ciências da Natureza', disciplina: 'Química' },
  'Física & Mecânica': { area: 'Ciências da Natureza', disciplina: 'Física' },
  'Geografia & Geopolítica': { area: 'Ciências Humanas', disciplina: 'Geografia' },
  'Português & Literatura': { area: 'Linguagens', disciplina: 'Português' },
  'Ciências Humanas & Sociais': { area: 'Ciências Humanas', disciplina: 'Humanas & Sociedade' },
};

const OFFLINE_CONVERTIDAS: SimuladoQuestion[] = OFFLINE_QUESTION_BANK.map((q, idx) => {
  const mapeamento = MAPA_MATERIA_AREA[q.materia] || { area: 'Ciências da Natureza', disciplina: q.materia };
  const diffs: ('Fácil' | 'Média' | 'Difícil')[] = ['Fácil', 'Média', 'Difícil'];
  return {
    id: `off_${q.id || idx}`,
    area: mapeamento.area,
    disciplina: `${mapeamento.disciplina} • ${q.topico}`,
    dificuldade: diffs[idx % 3],
    enunciado: q.pergunta,
    opcoes: q.opcoes,
    correta: q.resposta_correta_index,
    explicacao: q.explicacao,
  };
});

export const BANCO_SIMULADOS_ENEM: SimuladoQuestion[] = [
  ...OFFLINE_CONVERTIDAS,
  // ==========================================
  // 1. LINGUAGENS E CÓDIGOS
  // ==========================================
  {
    id: 'ling_1',
    area: 'Linguagens',
    disciplina: 'Português & Interpretação',
    dificuldade: 'Fácil',
    enunciado: 'Em um anúncio institucional do Ministério da Saúde com o slogan: "Vacinação é um ato de amor coletivo. Proteja quem você ama e vacine-se!", a função da linguagem predominante no texto e a sua respectiva intenção comunicativa são:',
    opcoes: [
      'Função conativa (ou apelativa), pois busca persuadir e orientar o comportamento do interlocutor.',
      'Função metalinguística, pois tem o objetivo exclusivo de explicar a gramática da palavra vacina.',
      'Função fática, pois visa unicamente testar se o canal de comunicação sonora está ativo.',
      'Função poética, pois prioriza rimas ricas e métrica decassílaba sem apelo prático.',
      'Função referencial pura, pois descreve apenas dados estatísticos sem apelo emocional.'
    ],
    correta: 0,
    explicacao: 'A função conativa/apelativa centra-se no receptor (interlocutor) e utiliza verbos no imperativo ("Proteja", "vacine-se") com a finalidade de induzir a uma ação ou convencimento.'
  },
  {
    id: 'ling_2',
    area: 'Linguagens',
    disciplina: 'Literatura Brasileira',
    dificuldade: 'Média',
    enunciado: 'O romance "Memórias Póstumas de Brás Cubas" (1881), de Machado de Assis, inaugurou o Realismo no Brasil. Uma inovação narrativa crucial introduzida por Machado nessa obra foi:',
    opcoes: [
      'A criação do narrador defunto ("defunto autor"), que relata sua trajetória sem preocupação com julgamentos sociais e com tom irônico e cético.',
      'A exaltação do índio heroico como símbolo virtuoso e puro da identidade brasileira.',
      'A adesão estrita ao determinismo biológico em que o destino do protagonista é fruto de sua raça.',
      'O tom sentimentalista e idealizado do casamento como redenção moral dos indivíduos.',
      'O uso exclusivo de verso livre modernista rompendo com a prosa tradicional.'
    ],
    correta: 0,
    explicacao: 'Ao escrever já morto ("não um autor defunto, mas um defunto autor"), Brás Cubas ganha total liberdade para expor com ironia corrosiva e sem hipocrisia a frivolidade da elite carioca do século XIX.'
  },
  {
    id: 'ling_3',
    area: 'Linguagens',
    disciplina: 'Variação Linguística',
    dificuldade: 'Fácil',
    enunciado: 'Na letra da canção regional: "Nóis trupica mas num cai / O sertão me ensinou a labutar", os desvios da norma-padrão refletem:',
    opcoes: [
      'Uma variação diatópica e sociocultural legítima que preserva a identidade oral e cultural da comunidade de fala sertaneja.',
      'Uma incapacidade cognitiva dos falantes rurais de formular orações com sentido lógico.',
      'Um erro imperdoável que anula a comunicação e impede o entendimento do receptor.',
      'Uma degeneração inevitável e nociva da língua portuguesa que deve ser erradicada.',
      'Uma regra oficial introduzida pelo Novo Acordo Ortográfico para a poesia popular.'
    ],
    correta: 0,
    explicacao: 'A linguística moderna e a matriz do ENEM encaram as variedades regionais e populares como formas legítimas e expressivas de linguagem, rejeitando o preconceito linguístico.'
  },
  {
    id: 'ling_4',
    area: 'Linguagens',
    disciplina: 'Cultura Digital & Mídias',
    dificuldade: 'Média',
    enunciado: 'Com o advento dos algoritmos de recomendação em plataformas de redes sociais, observa-se o fenômeno das "bolhas de filtro" (filter bubbles). No contexto da formação da opinião pública contemporânea, esse fenômeno tem como impacto principal:',
    opcoes: [
      'A polarização social e a redução do contato com pontos de vista divergentes, reforçando crenças prévias dos usuários.',
      'A universalização do acesso democrático e equilibrado a todas as correntes filosóficas mundiais.',
      'A eliminação completa de desinformação (fake news) devido à moderação automática perfeita.',
      'O aumento da tolerância política através da exibição igualitária de todos os partidos.',
      'A extinção do interesse dos jovens por temas ligados à cidadania e aos direitos coletivos.'
    ],
    correta: 0,
    explicacao: 'As bolhas de filtro isolam o indivíduo em um ecossistema informacional feito sob medida para seu perfil, reforçando viés de confirmação e aprofundando a polarização ideológica.'
  },
  {
    id: 'ling_5',
    area: 'Linguagens',
    disciplina: 'Língua Inglesa / Interpretação',
    dificuldade: 'Média',
    enunciado: 'Leia o excerto em inglês: "Renewable energy is no longer a pledge for the future; it has become an economic imperative and our strongest hedge against climate disruptions." O autor argumenta fundamentalmente que a energia renovável:',
    opcoes: [
      'Deixou de ser apenas uma promessa e passou a ser uma necessidade econômica e proteção climática urgente.',
      'É excessivamente onerosa e deve ser adiada para as próximas gerações.',
      'Provocou o agravamento dos choques térmicos nos oceanos e geleiras.',
      'Deve ser abandonada em favor da ampliação do uso de carvão e petróleo.',
      'Depende exclusivamente de doações financeiras voluntárias de países em desenvolvimento.'
    ],
    correta: 0,
    explicacao: '"No longer a pledge for the future; it has become an economic imperative" afirma com clareza que a energia limpa já é um imperativo econômico e escudo contra crises do clima.'
  },

  // ==========================================
  // 2. CIÊNCIAS HUMANAS
  // ==========================================
  {
    id: 'hum_1',
    area: 'Ciências Humanas',
    disciplina: 'História do Brasil',
    dificuldade: 'Média',
    enunciado: 'A promulgação da Constituição de 1988, apelidada por Ulysses Guimarães de "Constituição Cidadã", representou um marco decisivo na história brasileira contemporânea porque:',
    opcoes: [
      'Institucionalizou a redemocratização, ampliou os direitos sociais, fundamentais e difusos, e consagrou a soberania popular.',
      'Restringiu o direito de voto aos cidadãos alfabetizados e proprietários de terras.',
      'Concentrou todos os poderes decisórios na Presidência da República extinguindo o Legislativo.',
      'Suprimiu as garantias trabalhistas da CLT para acelerar o plano de privatizações estatais.',
      'Implantou o parlamentarismo com mandato vitalício para o Primeiro-Ministro.'
    ],
    correta: 0,
    explicacao: 'A Carta Magna de 1988 coroou a transição democrática após 21 anos de ditadura militar, garantindo saúde como direito de todos e dever do Estado (criação do SUS), educação, demarcação de terras indígenas e sufrágio aos analfabetos.'
  },
  {
    id: 'hum_2',
    area: 'Ciências Humanas',
    disciplina: 'Geografia do Brasil',
    dificuldade: 'Fácil',
    enunciado: 'O avanço da fronteira agrícola brasileira rumo à região Centro-Oeste e ao MATOPIBA (Maranhão, Tocantins, Piauí e Bahia) a partir da década de 1970 foi viabilizado tecnicamente principalmente por:',
    opcoes: [
      'Correção química da acidez do solo do Cerrado (calagem) e desenvolvimento de sementes transgênicas adaptadas pela Embrapa.',
      'Irrigação natural por neve derretida e desvio de rios amazônicos para o semiárido.',
      'Uso exclusivo de tração animal e mão de obra de agricultura de subsistência tradicional.',
      'Construção de uma rede subterrânea de transporte ferroviário que atravessa o Pantanal.',
      'Proibição do cultivo de grãos para exportação em áreas de planalto.'
    ],
    correta: 0,
    explicacao: 'A calagem (neutralização do alumínio e acidez com calcário) somada à biotecnologia da Embrapa transformou o solo do Cerrado em um dos maiores celeiros mundiais de soja, milho e algodão.'
  },
  {
    id: 'hum_3',
    area: 'Ciências Humanas',
    disciplina: 'Filosofia',
    dificuldade: 'Difícil',
    enunciado: 'Para o filósofo iluminista Immanuel Kant, em "O que é o Iluminismo?" (1784), a "menoridade" humana consiste na:',
    opcoes: [
      'Incapacidade de se servir do próprio entendimento sem a tutela ou direção de outrem, causada por comodismo e falta de coragem (Sapere aude!).',
      'Falta de idade cronológica legal para exercer cargos públicos e votar em assembleias.',
      'Ausência de crença religiosa e recusa em aceitar dogmas sagrados indiscutíveis.',
      'Submissão biológica dos mais fracos diante dos mais fortes segundo as leis naturais.',
      'Ignorância absoluta das leis da matemática e da física clássica newtoniana.'
    ],
    correta: 0,
    explicacao: 'Kant define o Iluminismo como a saída do ser humano de sua menoridade autoculpada: a coragem de pensar por si mesmo ("Sapere aude!") em vez de aceitar passivamente o que autoridades mandam.'
  },
  {
    id: 'hum_4',
    area: 'Ciências Humanas',
    disciplina: 'Sociologia',
    dificuldade: 'Média',
    enunciado: 'O sociólogo brasileiro Gilberto Freyre, em "Casa-Grande & Senzala" (1933), ao analisar a formação social brasileira, popularizou uma interpretação que posteriormente foi criticada por intelectuais contemporâneos por:',
    opcoes: [
      'Sugerir uma suposta harmonia e plasticidade nas relações entre senhores e escravizados, originando o mito da "democracia racial".',
      'Negar completamente a contribuição dos povos africanos e indígenas na culinária e no vocabulário.',
      'Defender a superioridade pura da raça ariana em detrimento da mestiçagem tropical.',
      'Propor a extinção imediata do Estado brasileiro em favor de federações anarquistas.',
      'Ignorar as diferenças socioeconômicas do ciclo do café no estado de São Paulo.'
    ],
    correta: 0,
    explicacao: 'Embora Freyre tenha valorizado a mestiçagem contra o racismo científico da época, sua obra amaciou a brutalidade da escravidão, pavimentando a falácia de que no Brasil não existia discriminação racial.'
  },
  {
    id: 'hum_5',
    area: 'Ciências Humanas',
    disciplina: 'Geopolítica Global',
    dificuldade: 'Média',
    enunciado: 'No cenário geopolítico do século XXI, a transição para uma ordem internacional multipolar é evidenciada principalmente por:',
    opcoes: [
      'A ascensão econômica e tecnológica da China e o fortalecimento de blocos do Sul Global como o BRICS ampliado.',
      'O retorno ao confronto bipolar estrito e fechado entre EUA e União Soviética sob a Cortina de Ferro.',
      'O controle unilateral absoluto da economia global por parte de um único organismo da ONU.',
      'O fechamento completo das rotas marítimas internacionais no Oceano Índico e no Atlântico.',
      'A dissolução integral de todas as alianças militares e desarmamento nuclear universal.'
    ],
    correta: 0,
    explicacao: 'A emergência da China como potência produtiva/tecnológica e o protagonismo dos países emergentes (BRICS) descentralizaram a hegemonia outrora exclusiva do eixo ocidental.'
  },

  // ==========================================
  // 3. CIÊNCIAS DA NATUREZA
  // ==========================================
  {
    id: 'nat_1',
    area: 'Ciências da Natureza',
    disciplina: 'Biologia Celular & Genética',
    dificuldade: 'Fácil',
    enunciado: 'Na tecnologia do DNA recombinante, a ferramenta biológica utilizada pelos cientistas como uma "tesoura molecular" capaz de cortar segmentos específicos da cadeia de nucleotídeos é denominada:',
    opcoes: [
      'Enzima de restrição (ou endonuclease de restrição).',
      'DNA polimerase mitocondrial.',
      'Ribossomo mensageiro bacteriano.',
      'Fosfolipídio de membrana plasmática.',
      'Clorofila sintética de cadeia curta.'
    ],
    correta: 0,
    explicacao: 'As enzimas de restrição reconhecem sequências palindrômicas específicas no DNA e clivam a molécula com alta precisão, permitindo a inserção de genes de interesse em plasmídeos.'
  },
  {
    id: 'nat_2',
    area: 'Ciências da Natureza',
    disciplina: 'Física / Eletrodinâmica',
    dificuldade: 'Média',
    enunciado: 'Em uma residência com instalação monofásica de 110 V, um estudante liga simultaneamente um ferro de passar de 1.100 W e um secador de cabelo de 1.320 W em uma mesma tomada protegida por disjuntor de 20 A. O disjuntor irá:',
    opcoes: [
      'Desarmar, pois a corrente total exigida pelos aparelhos (22 A) supera a capacidade nominal do disjuntor (20 A).',
      'Permanecer ligado com segurança, pois a corrente consumida é de apenas 10 A.',
      'Aumentar automaticamente a voltagem da rede para 220 V para evitar o desligamento.',
      'Queimar instantaneamente o transformador do poste público da concessionária.',
      'Diminuir a resistência elétrica da fiação interna a zero pelo efeito Joule.'
    ],
    correta: 0,
    explicacao: 'P = U × i → Potência total = 1100 + 1320 = 2420 W. Corrente i = 2420 / 110 = 22 A. Como 22 A > 20 A, o disjuntor termomagnético desarma para proteger a rede contra sobreaquecimento e incêndio.'
  },
  {
    id: 'nat_3',
    area: 'Ciências da Natureza',
    disciplina: 'Química Geral & Estequiometria',
    dificuldade: 'Média',
    enunciado: 'A reação de fotossíntese pode ser representada simplificadamente pela equação não balanceada: CO₂ + H₂O → C₆H₁₂O₆ + O₂. Após balancear estequiometricamente a equação com os menores coeficientes inteiros, a quantidade de mols de gás oxigênio (O₂) produzida a partir do consumo de 12 mols de gás carbônico (CO₂) é:',
    opcoes: [
      '12 mols de O₂.',
      '6 mols de O₂.',
      '24 mols de O₂.',
      '3 mols de O₂.',
      '18 mols de O₂.'
    ],
    correta: 0,
    explicacao: 'Equação balanceada: 6 CO₂ + 6 H₂O → 1 C₆H₁₂O₆ + 6 O₂. A proporção estequiométrica entre CO₂ e O₂ é de 1:1 (6 para 6). Portanto, se consumirmos 12 mols de CO₂, produziremos exatamente 12 mols de O₂.'
  },
  {
    id: 'nat_4',
    area: 'Ciências da Natureza',
    disciplina: 'Física / Óptica & Ondulatória',
    dificuldade: 'Fácil',
    enunciado: 'A fibra óptica utilizada nas telecomunicações de alta velocidade transmite feixes de pulsos de luz laser ao longo de milhares de quilômetros com perdas mínimas. O princípio físico fundamental que mantém a luz confinada no interior do núcleo de vidro da fibra é a:',
    opcoes: [
      'Reflexão interna total, decorrente do ângulo de incidência ser superior ao ângulo limite.',
      'Difração da luz em fendas microscópicas ao longo da casca.',
      'Polarização magnética gravitacional dos fótons em movimento.',
      'Refração simples com aumento contínuo do comprimento de onda da luz.',
      'Absorção seletiva de raios ultravioleta pelos elétrons da sílica.'
    ],
    correta: 0,
    explicacao: 'Para ocorrer a reflexão total interna, a luz deve viajar do meio mais refringente (núcleo da fibra) para o menos refringente (casca) com ângulo de incidência maior que o ângulo crítico/limite.'
  },
  {
    id: 'nat_5',
    area: 'Ciências da Natureza',
    disciplina: 'Ecologia & Química Ambiental',
    dificuldade: 'Difícil',
    enunciado: 'O derramamento de petróleo no mar provoca a formação de uma mancha escura na superfície (maré negra). Além de intoxicar animais marinhos por ingestão direta, um dos efeitos biológicos mais graves desse desastre ecológico na base da teia trófica é:',
    opcoes: [
      'O bloqueio da penetração da radiação solar, inibindo drasticamente a taxa de fotossíntese do fitoplâncton produtor.',
      'A hiperoxigenação da água que causa embolia gasosa generalizada em corais.',
      'O aumento acelerado na taxa de reprodução de baleias e peixes pelágicos.',
      'A transformação imediata de toda a água salgada do oceano em água doce potável.',
      'A eliminação total de todas as bactérias anaeróbicas do leito submarino.'
    ],
    correta: 0,
    explicacao: 'A camada hidrofóbica e opaca de hidrocarbonetos na flor da água impede a passagem da luz solar, colapsando a fotossíntese do fitoplâncton marinho, base fundamental das cadeias alimentares marinhas.'
  },

  // ==========================================
  // 4. MATEMÁTICA E SUAS TECNOLOGIAS
  // ==========================================
  {
    id: 'mat_1',
    area: 'Matemática',
    disciplina: 'Matemática Financeira',
    dificuldade: 'Fácil',
    enunciado: 'Um televisor custa R$ 2.000,00 à vista. A loja oferece a opção de pagamento com acréscimo de 15% para parcelamento em 5 vezes iguais no carnê. Qual será o valor de cada parcela mensal para o comprador?',
    opcoes: [
      'R$ 460,00',
      'R$ 400,00',
      'R$ 430,00',
      'R$ 500,00',
      'R$ 480,00'
    ],
    correta: 0,
    explicacao: 'Valor total com acréscimo: R$ 2.000 × 1,15 = R$ 2.300,00. Dividindo em 5 parcelas iguais: R$ 2.300 / 5 = R$ 460,00 por parcela.'
  },
  {
    id: 'mat_2',
    area: 'Matemática',
    disciplina: 'Geometria Espacial',
    dificuldade: 'Média',
    enunciado: 'Uma caixa-d\'água em formato de paralelepípedo retângulo reto possui dimensões internas de 2 metros de comprimento, 1,5 metro de largura e 1 metro de profundidade. Considerando que 1 m³ equivale a 1.000 litros, a capacidade máxima dessa caixa em litros é de:',
    opcoes: [
      '3.000 litros',
      '4.500 litros',
      '2.000 litros',
      '3.500 litros',
      '1.500 litros'
    ],
    correta: 0,
    explicacao: 'Volume = comprimento × largura × altura = 2 × 1,5 × 1 = 3 m³. Como 1 m³ = 1.000 L, capacidade = 3 × 1.000 = 3.000 litros.'
  },
  {
    id: 'mat_3',
    area: 'Matemática',
    disciplina: 'Estatística Básica',
    dificuldade: 'Fácil',
    enunciado: 'Durante os sete dias de uma semana de outono, as temperaturas máximas registradas em uma cidade foram: 22°C, 24°C, 22°C, 28°C, 25°C, 22°C e 27°C. A moda e a média aritmética desse conjunto de temperaturas são, respectivamente:',
    opcoes: [
      'Moda: 22°C e Média: 24,57°C (aproximadamente 24,6°C).',
      'Moda: 24°C e Média: 22,0°C.',
      'Moda: 28°C e Média: 26,2°C.',
      'Moda: 25°C e Média: 23,8°C.',
      'Moda: 27°C e Média: 25,0°C.'
    ],
    correta: 0,
    explicacao: 'A Moda é o valor mais frequente: 22°C aparece 3 vezes. Soma das temperaturas = 22 + 24 + 22 + 28 + 25 + 22 + 27 = 172. Média = 172 / 7 ≈ 24,57°C.'
  },
  {
    id: 'mat_4',
    area: 'Matemática',
    disciplina: 'Funções e Álgebra',
    dificuldade: 'Média',
    enunciado: 'Uma empresa de transporte por aplicativo cobra uma taxa fixa de R$ 5,50 pela chamada mais R$ 2,20 por cada quilômetro rodado. Se um passageiro pagou R$ 49,50 por uma corrida, quantos quilômetros foram percorridos nessa viagem?',
    opcoes: [
      '20 km',
      '18 km',
      '22 km',
      '25 km',
      '15 km'
    ],
    correta: 0,
    explicacao: 'Equação: Preço = 5,50 + 2,20 · x → 49,50 = 5,50 + 2,20 · x → 2,20 · x = 44,00 → x = 44,00 / 2,20 = 20 quilômetros.'
  },
  {
    id: 'mat_5',
    area: 'Matemática',
    disciplina: 'Análise Combinatória & Probabilidade',
    dificuldade: 'Difícil',
    enunciado: 'Um grupo de estudos de medicina é composto por 4 homens e 6 mulheres. Deseja-se formar uma comissão de 3 estudantes para representar o grupo em um simpósio nacional. De quantas maneiras distintas essa comissão pode ser formada de modo que contenha pelo menos 1 mulher?',
    opcoes: [
      '116 maneiras',
      '120 maneiras',
      '96 maneiras',
      '104 maneiras',
      '84 maneiras'
    ],
    correta: 0,
    explicacao: 'Total de pessoas = 10. Total de comissões possíveis: C(10, 3) = (10 × 9 × 8) / (3 × 2 × 1) = 120. Comissões com NENHUMA mulher (apenas homens): C(4, 3) = 4. Pelo princípio complementar: Comissões com pelo menos 1 mulher = 120 - 4 = 116 maneiras.'
  }
];

export function getSimuladoQuestionsByFilter(
  area?: string,
  batchSize: number = 10,
  randomize: boolean = true
): SimuladoQuestion[] {
  let list = [...BANCO_SIMULADOS_ENEM];

  if (area && area !== 'Todas' && area !== 'Geral') {
    if (area.toLowerCase().includes('linguagen') || area.toLowerCase().includes('dia 1')) {
      list = list.filter((q) => q.area === 'Linguagens' || q.area === 'Ciências Humanas');
    } else if (area.toLowerCase().includes('natureza') || area.toLowerCase().includes('dia 2')) {
      list = list.filter((q) => q.area === 'Ciências da Natureza' || q.area === 'Matemática');
    } else {
      list = list.filter((q) => q.area.toLowerCase().includes(area.toLowerCase()));
    }
  }

  if (randomize) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  const selected = list.slice(0, Math.min(batchSize, list.length));

  // Embaralha dinamicamente as alternativas de cada questão para que a resposta correta nunca fique fixa (ex: sempre letra A)
  return selected.map((q) => {
    const rawOptions = q.opcoes.map((opt) => opt.replace(/^[A-E]\)\s*/, '').trim());
    const correctText = rawOptions[q.correta] || rawOptions[0];

    // Fisher-Yates shuffle nas alternativas
    const shuffled = [...rawOptions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const newCorrectIndex = shuffled.findIndex((opt) => opt === correctText);

    return {
      ...q,
      opcoes: shuffled,
      correta: newCorrectIndex !== -1 ? newCorrectIndex : 0,
    };
  });
}
