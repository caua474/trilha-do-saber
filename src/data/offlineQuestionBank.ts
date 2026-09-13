export interface OfflineQuestion {
  id: string;
  materia: string;
  topico: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta_index: number;
  explicacao: string;
}

export const OFFLINE_QUESTION_BANK: OfflineQuestion[] = [
  // Biologia
  {
    id: 'bio_1',
    materia: 'Biologia & Meio Ambiente',
    topico: 'Ecologia e Eutrofização',
    pergunta: 'Em um lago urbano que recebe despejo contínuo de esgoto doméstico sem tratamento, observa-se o aumento repentino de algas na superfície. Qual é a sequência correta de eventos que leva à mortandade dos peixes nesse processo de eutrofização?',
    opcoes: [
      'Bloqueio da luz solar -> Redução da fotossíntese profunda -> Aumento de bactérias decompositoras -> Queda do O₂ dissolvido',
      'Aumento imediato do O₂ -> Proliferação de peixes predadores -> Falta de alimento -> Morte em massa',
      'Diminuição de nitratos e fosfatos -> Queda na temperatura da água -> Congelamento do O₂ -> Asfixia',
      'Aumento da fotossíntese em todas as profundidades -> Excesso de O₂ tóxico para peixes -> Alcalinidade extrema'
    ],
    resposta_correta_index: 0,
    explicacao: 'O excesso de nutrientes (nitrogênio e fósforo) gera floração de algas. A camada de algas bloqueia a passagem da luz solar, impedindo a fotossíntese de plantas submersas. Bactérias decompositoras proliferam consorciando todo o O₂ dissolvido na água, sufocando os peixes.'
  },
  {
    id: 'bio_2',
    materia: 'Biologia & Meio Ambiente',
    topico: 'Imunologia - Vacina vs Soro',
    pergunta: 'Após ser picado por um escorpião-amarelo no sertão, um agricultor foi levado ao posto de saúde urgente. O protocolo médico correto exige a aplicação imediata de:',
    opcoes: [
      'Soro antiescorpiônico, pois fornece anticorpos prontos para neutralizar o veneno (imunização passiva).',
      'Vacina antiescorpiônica, pois estimula o corpo a produzir anticorpos próprios no longo prazo.',
      'Antibiótico de amplo espectro para destruir as proteínas do veneno no sangue.',
      'Soro fisiológico com vitamina C para ativar os linfócitos T de memória.'
    ],
    resposta_correta_index: 0,
    explicacao: 'O soro é um imunizador PASSIVO contendo anticorpos pré-formados prontos para ação imediata em emergências com venenos ou toxinas letais. Vacinas são usadas para prevenção ativa prévia.'
  },
  // Matemática
  {
    id: 'mat_1',
    materia: 'Matemática & Raciocínio',
    topico: 'Porcentagem e Aumentos Sucessivos',
    pergunta: 'Um produto em uma loja de e-commerce teve dois aumentos sucessivos de preço: o primeiro de 10% no mês de maio e o segundo de 20% no mês de junho. Em relação ao preço original antes dos aumentos, o aumento percentual total acumulado foi de:',
    opcoes: [
      '32%',
      '30%',
      '28%',
      '35%'
    ],
    resposta_correta_index: 0,
    explicacao: 'Aumentos sucessivos são multiplicativos: (1 + 0,10) × (1 + 0,20) = 1,10 × 1,20 = 1,32. Isso equivale a um valor final de 132%, ou seja, um aumento total de 32%.'
  },
  {
    id: 'mat_2',
    materia: 'Matemática & Raciocínio',
    topico: 'Estatística - Mediana',
    pergunta: 'As notas de um aluno nas 5 avaliações do semestre foram: 8, 4, 9, 5, 7. A mediana dessas notas é igual a:',
    opcoes: [
      '7',
      '6.6',
      '8',
      '5'
    ],
    resposta_correta_index: 0,
    explicacao: 'Para encontrar a Mediana, primeiro organizamos o Rol em ordem crescente: 4, 5, 7, 8, 9. O elemento central (3º termo) é exatamente o número 7.'
  },
  // História
  {
    id: 'his_1',
    materia: 'História do Brasil & Geral',
    topico: 'Era Vargas (1930-1945)',
    pergunta: 'Durante o Estado Novo (1937-1945), o governo de Getúlio Vargas utilizou o DIP (Departamento de Imprensa e Propaganda) principalmente para:',
    opcoes: [
      'Construir a imagem de Vargas como "Pai dos Pobres", censurar oposições e difundir o civismo e a brasilidade.',
      'Estimular a liberdade de imprensa e o debate multipartidário democrático no rádio.',
      'Promover a privatização das empresas estatais de siderurgia para atração de capital americano.',
      'Organizar as eleições diretas para a Assembleia Constituinte de 1938.'
    ],
    resposta_correta_index: 0,
    explicacao: 'O DIP exercia censura rigorosa sobre jornais, rádio e cinema, ao mesmo tempo que produzia a propaganda oficial exaltando os feitos de Getúlio Vargas e o sentimento de identidade nacional.'
  },
  {
    id: 'his_2',
    materia: 'História do Brasil & Geral',
    topico: 'Segunda Revolução Industrial',
    pergunta: 'A Segunda Revolução Industrial (final do séc. XIX) distinguiu-se da Primeira Revolução Industrial principalmente pela introdução de quais novas fontes de energia e setores produtivos?',
    opcoes: [
      'Eletricidade e Petróleo / Setor Químico e Siderúrgico.',
      'Carvão mineral e Vapor / Teatros e Indústria Têxtil.',
      'Energia Nuclear e Eólica / Microeletrônica e Robótica.',
      'Gás Natural e Madeira / Indústria Naval e Marítima.'
    ],
    resposta_correta_index: 0,
    explicacao: 'Enquanto a 1ª Revolução baseou-se na máquina a vapor e no carvão mineral na Inglaterra, a 2ª Revolução utilizou a Eletricidade e o Petróleo (motor a combustão), dinamizando a química e o aço.'
  },
  // Química
  {
    id: 'qui_1',
    materia: 'Química Orgânica & Geral',
    topico: 'Funções Orgânicas e Essências',
    pergunta: 'Os compostos orgânicos responsáveis pelos aromas sintéticos de frutas em balas e refrigerantes pertencem predominantemente à função orgânica resultante da reação entre um ácido carboxílico e um álcool. Essa função é denominada:',
    opcoes: [
      'Éster',
      'Éter',
      'Cetona',
      'Aldeído'
    ],
    resposta_correta_index: 0,
    explicacao: 'Reações de esterificação (Ácido Carboxílico + Álcool -> Éster + Água) produzem ésteres, amplamente utilizados na indústria alimentícia como aromatizantes e flavorizantes.'
  },
  {
    id: 'qui_2',
    materia: 'Química Orgânica & Geral',
    topico: 'pH e Solo Agrícola',
    pergunta: 'O solo do bioma Cerrado brasileiro é naturalmente ácido (pH em torno de 4,5 a 5,2). Para neutralizar a acidez do solo e possibilitar a grande agricultura de grãos, adiciona-se ao solo:',
    opcoes: [
      'Calcário (CaCO₃) ou Cal Extinta, em um processo chamado calagem.',
      'Vinagre (Ácido Acético) dissolvido em irrigação.',
      'Sal de Cozinha (NaCl) refinado.',
      'Dióxido de Enxofre (SO₂) concentrado.'
    ],
    resposta_correta_index: 0,
    explicacao: 'A calagem consiste na adição de calcário (básico), cujos íons carbonato (CO₃²⁻) reagem com os íons H⁺ do solo ácido, elevando o pH para níveis neutros e favoráveis ao plantio.'
  },
  // Física
  {
    id: 'fis_1',
    materia: 'Física & Mecânica',
    topico: 'Eletrodinâmica - Chuveiro Elétrico',
    pergunta: 'Um morador deseja alterar a chave do seu chuveiro elétrico de "Morno/Verão" para "Quente/Inverno". Do ponto de vista da física e da Lei de Ohm, o que acontece no circuito interno do chuveiro?',
    opcoes: [
      'Diminui-se o comprimento do resistor, reduzindo a resistência e AUMENTANDO a corrente e a potência dissipation.',
      'Aumenta-se a resistência elétrica para acumular mais calor na água.',
      'Muda-se a voltagem da tomada de 110V para 220V automaticamente.',
      'O resistor é desligado e o calor vem do atrito da água nas tubulações.'
    ],
    resposta_correta_index: 0,
    explicacao: 'Como P = U² / R, para AUMENTAR a potência dissipada (água mais quente) mantendo a mesma tensão U, é necessário REDUZIR a resistência R diminuindo o tamanho útil da resistência do chuveiro.'
  },
  {
    id: 'fis_2',
    materia: 'Física & Mecânica',
    topico: 'Ondulatória e Fenômenos',
    pergunta: 'Quando uma ambulância com a sirene ligada se aproxima de um pedestre parado, o som percebido pelo pedestre fica mais agudo (frequência aparente maior). Esse fenômeno ondulatório é conhecido como:',
    opcoes: [
      'Efeito Doppler',
      'Ressonância Harmônica',
      'Polarização Acústica',
      'Difração Sonora'
    ],
    resposta_correta_index: 0,
    explicacao: 'O Efeito Doppler é a alteração aparente na frequência de uma onda causada pelo movimento relativo entre a fonte emissora e o observador.'
  },
  // Geografia
  {
    id: 'geo_1',
    materia: 'Geografia & Geopolítica',
    topico: 'Biomas Brasileiros - Cerrado',
    pergunta: 'O Cerrado, segundo maior bioma do Brasil, possui vegetação adaptada ao clima tropical típico (uma estação chuvosa e outra bem seca). Suas árvores apresentam como características marcantes:',
    opcoes: [
      'Troncos tortuosos, casca grossa e raízes profundas para buscar água no lençol freático.',
      'Folhas largas e gigantescas que nunca caem durante todo o ano.',
      'Raízes aéreas do tipo pneumatóforos para respirar em solos alagados.',
      'Ausência total de plantas herbáceas ou rasteiras.'
    ],
    resposta_correta_index: 0,
    explicacao: 'A vegetação do Cerrado é tropófila e esclerófila: troncos tortuosos, casca espessa (proteção contra queimadas naturais e perda de água) e raízes profundas.'
  },
  // Português
  {
    id: 'port_1',
    materia: 'Português & Literatura',
    topico: 'Sintaxe - Verbo Haver',
    pergunta: 'Assinale a alternativa que apresenta a regência do verbo HAVER empregada de acordo com a norma-padrão da língua portuguesa:',
    opcoes: [
      'Havia muitos alunos interessados no Simulado ENEM.',
      'Haviam muitos alunos interessados no Simulado ENEM.',
      'Houveram graves divergências entre os candidatos na reunião.',
      'Haviam poucas dúvidas sobre o conteúdo da prova.'
    ],
    resposta_correta_index: 0,
    explicacao: 'O verbo HAVER no sentido de "existir" ou "ocorrer" é IMPESSOAL, devendo permanecer sempre no singular (3ª pessoa do singular), independente do complemento estar no plural.'
  },
  {
    id: 'port_2',
    materia: 'Português & Literatura',
    topico: 'Modernismo Brasileiro - Semana de 22',
    pergunta: 'O Movimento Modernista de 1922 em São Paulo buscou romper com o academicismo e o parnasianismo. Uma de suas principais características estéticas foi:',
    opcoes: [
      'A valorização da linguagem coloquial brasileira, verso livre e liberdade formal.',
      'O retorno rigoroso à métrica clássica camoniana e sonetos decassílabos perfeitos.',
      'A exaltação do sentimentalismo ultrarromântico e escapismo na morte.',
      'A proibição de temas nacionais e a cópia exclusiva dos autores parisienses.'
    ],
    resposta_correta_index: 0,
    explicacao: 'O Modernismo da 1ª Fase pregava a ruptura com as formas fixas, incorporação do falar cotidiano brasileiro e renovação da identidade cultural nacional (antropofagia).'
  },
  // Filosofia e Sociologia
  {
    id: 'fil_1',
    materia: 'Ciências Humanas & Sociais',
    topico: 'Filosofia Política - Contratualismo',
    pergunta: 'Para Thomas Hobbes, em "Leviatã", a passagem do estado de natureza para a sociedade civil torna-se imperativa porque o estado de natureza é caracterizado por:',
    opcoes: [
      'Uma guerra de todos contra todos ("o homem é o lobo do homem"), movida pelo medo constante da morte violenta.',
      'Uma harmonia espontânea onde os homens preservam naturalmente seus direitos fundamentais sem governantes.',
      'Um estado de bondade original corrompido unicamente pela instituição da propriedade privada.',
      'Uma monarquia teocrática sagrada governada pela moral religiosa cristã.'
    ],
    resposta_correta_index: 0,
    explicacao: 'Hobbes sustenta que, sem um poder soberano forte (o Estado Leviatã) para impor a ordem, os seres humanos viveriam em perpétua insegurança e conflito destrutivo.'
  },
  {
    id: 'soc_1',
    materia: 'Ciências Humanas & Sociais',
    topico: 'Sociologia - Zygmunt Bauman',
    pergunta: 'O conceito sociológico de "Modernidade Líquida", formulado por Zygmunt Bauman, descreve a sociedade contemporânea como marcada por:',
    opcoes: [
      'Relações humanas, identidades e instituições fluídas, frágeis, efêmeras e marcadas pelo individualismo e consumo rápido.',
      'Vínculos comunitários inquebráveis e permanência definitiva nos postos de trabalho.',
      'O fim definitivo das tecnologias digitais em favor da cooperação mútua.',
      'A solidificação dos costumes tradicionais e dos dogmas morais familiares.'
    ],
    resposta_correta_index: 0,
    explicacao: 'Para Bauman, a modernidade líquida dissolve a solidez das relações e certezas anteriores: laços afetivos e profissionais tornam-se voláteis, descartáveis e imediatistas.'
  },
  // Matemática Adicional
  {
    id: 'mat_3',
    materia: 'Matemática & Raciocínio',
    topico: 'Probabilidade Básica',
    pergunta: 'Ao lançar simultaneamente dois dados cúbicos perfeitos e não viciados, qual a probabilidade de a soma das faces superiores ser igual a 7?',
    opcoes: [
      '1/6 (aproximadamente 16,6%)',
      '1/12 (aproximadamente 8,3%)',
      '1/4 (aproximadamente 25%)',
      '7/36 (aproximadamente 19,4%)'
    ],
    resposta_correta_index: 0,
    explicacao: 'O espaço amostral tem 6 × 6 = 36 pares possíveis. Os pares cuja soma dá 7 são (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — exatamente 6 pares favoráveis. Probabilidade = 6/36 = 1/6.'
  },
  // Física Adicional
  {
    id: 'fis_3',
    materia: 'Física & Mecânica',
    topico: 'Termodinâmica - Calorimetria',
    pergunta: 'Duas barras de massas iguais, uma de ferro e outra de água líquida, recebem a mesma quantidade de calor. Sabendo que o calor específico da água é bem maior que o do ferro, o que ocorre?',
    opcoes: [
      'A barra de ferro sofre uma elevação de temperatura muito maior do que a água.',
      'A água aquece muito mais rápido e atinge temperatura superior à do ferro.',
      'Ambas sofrem rigorosamente a mesma variação de temperatura (ΔT).',
      'O ferro perde calor espontaneamente para o meio ambiente sem mudar de temperatura.'
    ],
    resposta_correta_index: 0,
    explicacao: 'Pela equação Q = m · c · ΔT, a variação de temperatura é inversamente proporcional ao calor específico (c). Como a água tem alto calor específico, ela resiste à mudança térmica; o ferro, com c menor, aquece muito mais depressa.'
  }
];

export type Question = OfflineQuestion;

export const offlineQuestionBank = OFFLINE_QUESTION_BANK;

export function getRandomOfflineQuestions(materia?: string, count: number = 5): OfflineQuestion[] {
  let list = [...OFFLINE_QUESTION_BANK];
  if (materia && materia !== 'Todas') {
    const filtered = list.filter((q) => 
      q.materia.toLowerCase().includes(materia.toLowerCase()) || 
      materia.toLowerCase().includes(q.materia.toLowerCase())
    );
    if (filtered.length >= 3) {
      list = filtered;
    }
  }

  // Fisher-Yates shuffle com offset aleatório
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Random starting offset
  const offset = Math.floor(Math.random() * shuffled.length);
  const rotated = [...shuffled.slice(offset), ...shuffled.slice(0, offset)];

  return rotated.slice(0, count);
}

export default OFFLINE_QUESTION_BANK;

