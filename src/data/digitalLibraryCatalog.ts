export interface QuizQuestion {
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
}

export interface CapituloItem {
  capitulo: string;
  resumo: string;
  pontosChave: string[];
}

export interface PersonagemOuTema {
  nome: string;
  papel: string;
  descricao: string;
  citacaoRedacao: string;
}

export interface DigitalBook {
  id: string;
  titulo: string;
  subtitulo?: string;
  autor: string;
  categoria: 'literatura' | 'historia' | 'geografia';
  disciplina: string;
  vestibularesTag: string[]; // e.g. ['ENEM', 'FUVEST', 'UNICAMP']
  capaGradient: string;
  capaIcone: string;
  anoOuEpoca: string;
  
  // 5 Inner Core Features
  resumoExpresso: string;
  capituloPorCapitulo: CapituloItem[];
  personagensETemas: PersonagemOuTema[];
  quiz: QuizQuestion[];
  faqIAContexto: string; // Context for "Pergunte ao Livro (IA)"
}

export const DIGITAL_LIBRARY_BOOKS: DigitalBook[] = [
  // 1. LÍNGUA PORTUGUESA & LITERATURA
  {
    id: 'bras_cubas',
    titulo: 'Memórias Póstumas de Brás Cubas',
    subtitulo: 'A obra-prima do Realismo Brasileiro e da ironia machadiana',
    autor: 'Machado de Assis',
    categoria: 'literatura',
    disciplina: 'Literatura & Língua Portuguesa',
    vestibularesTag: ['ENEM', 'FUVEST', 'UNICAMP'],
    capaGradient: 'from-amber-700 via-yellow-800 to-stone-900',
    capaIcone: '💀',
    anoOuEpoca: '1881 (Realismo)',
    resumoExpresso: `Narrado do além por Brás Cubas, um "defunto autor", o romance rompe com a tradição romântica do século XIX. Com um tom pessimista e profundamente irônico, o protagonista narra sua vida sem triunfos: não se casou, não teve filhos e não deixou herança. A obra faz uma crítica mordaz à elite aristocrática carioca, à hipocrisia das relações sociais e ao casamento como contrato de conveniência.`,
    capituloPorCapitulo: [
      {
        capitulo: 'Capítulo 1 a 10 - Óbito e Delírio',
        resumo: 'Brás Cubas descreve seu funeral e sua causa mortis (uma pneumonia por causa de uma ideia fixa: o emplasto definitivo). Antes de morrer, tem um delírio em que viaja no tempo sobre as costas de um hipopótamo.',
        pontosChave: ['Quebra da cronologia linear', 'Defunto autor', 'Emplasto anti-melancolia']
      },
      {
        capitulo: 'Capítulo 11 a 50 - Juventude com Marcela e Estudos em Coimbra',
        resumo: 'Brás lembra de sua paixão jovem por Marcela ("Marcela amou-me durante quinze meses e onze contos de réis"). Seu pai o envia para Portugal para estudar Direito e se afastar da paixão dispendiosa.',
        pontosChave: ['Interesse financeiro no amor', 'Capricho juvenil e elite fútil']
      },
      {
        capitulo: 'Capítulo 51 a 100 - O Caso com Virgília e o Humanitismo',
        resumo: 'De volta ao Brasil, Brás se torna amante de Virgília, agora casada com Lobo Neves por ambição política. Reencontra Quincas Borba, filósofo louco que inventou o Humanitismo ("Ao vencedor, as batatas!").',
        pontosChave: ['Adulério tolerado socialmente', 'Satira ao Positivismo e Darwinismo Social']
      },
      {
        capitulo: 'Capítulo 101 ao Fim - O Negativo da Vida',
        resumo: 'Tentativas fracassadas de ser deputado e de inventar um remédio revolucionário. Termina a vida solitário, concluindo que não sofreu a extrema miséria e teve o saldo positivo de não transmitir a nenhuma criatura o legado da nossa miséria.',
        pontosChave: ['Pessimismo machadiano', 'Fracasso existencial', 'Aforismo final antagônico']
      }
    ],
    personagensETemas: [
      {
        nome: 'Brás Cubas',
        papel: 'Protagonista e Defunto Autor',
        descricao: 'Homem rico, ocioso e egoísta que personifica a elite proprietária do século XIX.',
        citacaoRedacao: 'Ideal para abordar individualismo, falta de propósito social e a hipocrisia do status social.'
      },
      {
        nome: 'Virgília',
        papel: 'Amante de Brás Cubas',
        descricao: 'Mulher ambiciosa que troca a paixão sincera pela estabilidade política de Lobo Neves.',
        citacaoRedacao: 'Útil em redações sobre a mercantilização dos afetos e casamentos por interesse.'
      },
      {
        nome: 'Quincas Borba',
        papel: 'Filósofo e amigo de infância',
        descricao: 'Criador do Humanitismo, uma paródia da sobrevivência dos mais aptos e do cientificismo da época.',
        citacaoRedacao: 'Excelente repertório para criticar a frieza utilitarista e a competição desumana na sociedade.'
      }
    ],
    quiz: [
      {
        pergunta: 'Por que Brás Cubas se intitula um "defunto autor" e não um "autor defunto"?',
        opcoes: [
          'Porque ele escreveu o livro enquanto estava gravemente doente na cama.',
          'Porque ele é um homem já falecido que decidiu narrar suas memórias do além-túmulo.',
          'Porque usou um pseudônimo para não ser perseguido politicamente.',
          'Porque a história é inteiramente inventada por um médico psiquiatra.'
        ],
        respostaCorreta: 1,
        explicacao: 'O "defunto autor" é aquele para quem a morte veio primeiro e a escrita depois. Isso lhe dá a liberdade absoluta de dizer verdades cruas sem medo do julgamento dos vivos.'
      },
      {
        pergunta: 'Qual é o famoso lema do filósofo Quincas Borba em sua teoria do Humanitismo?',
        opcoes: [
          'Aos perdedores, a justiça!',
          'Ao vencedor, as batatas!',
          'Penso, logo existo!',
          'O homem é o lobo do homem!'
        ],
        respostaCorreta: 1,
        explicacao: '"Ao vencedor, as batatas!" sintetiza a sátira machadiana às teorias de competição social e Darwinismo Social do século XIX.'
      },
      {
        pergunta: 'Qual foi o saldo final da vida de Brás Cubas no último capítulo do livro?',
        opcoes: [
          'Ele comemora ter acumulado uma grande fortuna para seus herdeiros.',
          'Ele lamenta ter sido rejeitado pela sociedade carioca.',
          'Ele conclui que não transmitiu a nenhuma criatura o legado da nossa miséria.',
          'Ele se arrepende de não ter terminado a faculdade em Coimbra.'
        ],
        respostaCorreta: 2,
        explicacao: 'O saldo "positivo" do protagonista é de um pessimismo trágico: o único benefício foi não ter tido filhos para sofrer a miséria humana.'
      },
      {
        pergunta: 'A célebre frase "Marcela amou-me durante quinze meses e onze contos de réis" exemplifica qual recurso estilístico de Machado?',
        opcoes: [
          'Eufemismo dramático',
          'Ironia e crítica à mercantilização do amor',
          'Metáfora romântica idealizada',
          'Hipérbole ufanista'
        ],
        respostaCorreta: 1,
        explicacao: 'A junção do tempo afetivo com a quantia em dinheiro escancara o caráter interesseiro da relação amorosa.'
      },
      {
        pergunta: 'A qual movimento literário pertence "Memórias Póstumas de Brás Cubas"?',
        opcoes: ['Romantismo', 'Realismo', 'Modernismo de 1922', 'Arcadismo'],
        respostaCorreta: 1,
        explicacao: 'A obra lançada em 1881 é o marco inicial do Realismo na literatura brasileira.'
      }
    ],
    faqIAContexto: 'Você é um assistente especialista na obra "Memórias Póstumas de Brás Cubas" de Machado de Assis. Responda dúvidas sobre enredo, ironia, análise sociológica, personagens e contexto histórico.'
  },
  {
    id: 'vidas_secas',
    titulo: 'Vidas Secas',
    subtitulo: 'O retrato cru do sertão nordestino e da opressão social',
    autor: 'Graciliano Ramos',
    categoria: 'literatura',
    disciplina: 'Literatura & Língua Portuguesa',
    vestibularesTag: ['ENEM', 'FUVEST'],
    capaGradient: 'from-amber-800 via-orange-900 to-stone-950',
    capaIcone: '🌵',
    anoOuEpoca: '1938 (Modernismo - 2ª Fase)',
    resumoExpresso: `Acompanha a saga de uma família de retirantes (Fabiano, Sinhá Vitória, o Menino Mais Novo, o Menino Mais Velho e a cadela Baleia) fugindo da seca no sertão nordestino. A narrativa em estrutura desmontável mostra a desumanização causada pela miséria extrema e pelo analfabetismo funcional. As personagens são animalizadas enquanto a cadela ganha traços humanizados.`,
    capituloPorCapitulo: [
      {
        capitulo: 'Capítulo 1 - Mudança',
        resumo: 'A família caminha pela caatinga esturricada em busca de abrigo. Matam o papagaio de estimação para não morrerem de fome.',
        pontosChave: ['Luta pela sobrevivência', 'A aridez do ambiente e da linguagem']
      },
      {
        capitulo: 'Capítulo 3 a 8 - Fabiano, Sinhá Vitória e a Cadela Baleia',
        resumo: 'Retrata os sonhos modestos da família: Sinhá Vitória quer uma cama de lastro de couro igual à do Tomás da Bolandeira. Fabiano se sente inferiorizado por não saber falar difícil.',
        pontosChave: ['Incapacidade de articulação verbal', 'Humanização da cadela Baleia']
      },
      {
        capitulo: 'Capítulo 9 - Baleia',
        resumo: 'Um dos capítulos mais emocionantes da literatura brasileira. Baleia fica doente e Fabiano decide sacrificá-la. Em seus momentos finais, a cadela sonha com um paraíso cheio de preás.',
        pontosChave: ['Empatia e sensibilidade animal', 'Contraste com a dureza humana']
      },
      {
        capitulo: 'Capítulo 13 - Fuga',
        resumo: 'A seca retorna e obriga a família a abandonar a fazenda novamente. Caminham rumo à cidade grande na esperança de um futuro com escolas para os filhos.',
        pontosChave: ['Estrutura circular (sombra da seca perpétua)', 'Esperança melancólica']
      }
    ],
    personagensETemas: [
      {
        nome: 'Fabiano',
        papel: 'Vaqueiro e Pai de Família',
        descricao: 'Homem bronco, explorado pelo patrão e pelo Soldado Amarelo. Define a si mesmo como "bicho".',
        citacaoRedacao: 'Repertório perfeito sobre vulnerabilidade social, analfabetismo e exclusão de direitos básicos.'
      },
      {
        nome: 'Cadela Baleia',
        papel: 'Membro da família',
        descricao: 'Animal extremamente humanizado que nutre afeto e sonhos pelos integrantes do grupo.',
        citacaoRedacao: 'Utilizada para discutir empatia, dignidade e a desumanização das populações vulneráveis.'
      }
    ],
    quiz: [
      {
        pergunta: 'Por que a estrutura de "Vidas Secas" é considerada desmontável ou de "capítulos-contos"?',
        opcoes: [
          'Porque os capítulos foram publicados como jornais independentes antes do livro.',
          'Porque cada capítulo é focado em uma personagem ou tema e pode ser lido de forma autônoma.',
          'Porque o autor perdeu os originais e refez a obra de memória.',
          'Porque o livro não tem ordem cronológica definida.'
        ],
        respostaCorreta: 1,
        explicacao: 'Os capítulos funcionam quase como contos autônomos que se somam na narrativa do cotidiano da família.'
      },
      {
        pergunta: 'Qual o desejo de consumo de Sinhá Vitória que simboliza sua busca por dignidade?',
        opcoes: [
          'Um vestido de seda da capital',
          'Uma cama de lastro de couro',
          'Um rádio a pilha',
          'Um fogão a gás'
        ],
        respostaCorreta: 1,
        explicacao: 'A cama de couro do Tomás da Bolandeira representa para Sinhá Vitória o símbolo de uma vida civilizada e confortável.'
      },
      {
        pergunta: 'Qual figura de autoridade abusa do seu poder e prende Fabiano injustamente?',
        opcoes: ['O Patrão', 'O Soldado Amarelo', 'O Prefeito', 'O Padre'],
        respostaCorreta: 1,
        explicacao: 'O Soldado Amarelo representa a arbitrariedade do estado e da polícia contra os sertanejos desamparados.'
      },
      {
        pergunta: 'Em qual fase do Modernismo brasileiro se enquadra "Vidas Secas"?',
        opcoes: ['1ª Fase (1922 - Destruição)', '2ª Fase (1930 - Romance Regionalista e Social)', '3ª Fase (1945 - Neoconcretismo)', 'Parnasianismo'],
        respostaCorreta: 1,
        explicacao: 'Faz parte da Geração de 30, marcada pelo romance de denúncia social e regionalista do Nordeste.'
      },
      {
        pergunta: 'O que o sacrifício do papagaio no início do livro simboliza?',
        opcoes: [
          'A superstição religiosa da família',
          'A mudez forçada e a extrema privação alimentar em situação de seca',
          'A rejeição à natureza',
          'A raiva do Menino Mais Velho'
        ],
        respostaCorreta: 1,
        explicacao: 'O papagaio não falava (mudez) e precisou ser comido para salvar a família da fome fatal.'
      }
    ],
    faqIAContexto: 'Você é um assistente especialista na obra "Vidas Secas" de Graciliano Ramos. Responda dúvidas sobre enredo, regionalismo de 30, desumanização, linguagem seca e questões dos vestibulares.'
  },

  // 2. HISTÓRIA
  {
    id: 'historia_ditadura',
    titulo: 'Guia de Leitura: A Ditadura Militar no Brasil (1964-1985)',
    subtitulo: 'Fichamento sintético dos governos militares, AI-5, milagre econômico e redemocratização',
    autor: 'Prof. GabaritaAí (Série História do Brasil)',
    categoria: 'historia',
    disciplina: 'História do Brasil',
    vestibularesTag: ['ENEM', 'UNICAMP', 'FUVEST'],
    capaGradient: 'from-slate-800 via-stone-900 to-emerald-950',
    capaIcone: '📜',
    anoOuEpoca: '1964 - 1985',
    resumoExpresso: `Analisa os 21 anos do regime militar brasileiro instaurado após o golpe de 1964 contra João Goulart. Aborda as fases do regime: o endurecimento com o AI-5 em 1968 durante o governo Médici, a propaganda e o "Milagre Econômico", a doutrina de segurança nacional, os movimentos de resistência cultural/armada e o processo de abertura gradual (Geisel e Figueiredo) até a campanha das Diretas Já.`,
    capituloPorCapitulo: [
      {
        capitulo: 'Seção 1 - O Golpe de 1964 e o Contexto da Guerra Fria',
        resumo: 'Deposição de Jango sob pretexto de "ameaça comunista" e reformas de base. Apoio de setores civis, empresariais e dos EUA (Operação Brother Sam).',
        pontosChave: ['Guerra Fria', 'Reformas de Base de Jango', 'IPES e IBAD']
      },
      {
        capitulo: 'Seção 2 - O AI-5 e os Anos de Chumbo (1968-1974)',
        resumo: 'Decreto do Ato Institucional nº 5 pelo marechal Costa e Silva: fechamento do Congresso, cassação de direitos políticos, censura prévia e institucionalização da tortura.',
        pontosChave: ['Censura à imprensa e arte', 'DOI-CODENI', 'Slogan "Brasil: Ame-o ou Deixe-o"']
      },
      {
        capitulo: 'Seção 3 - O Milagre Econômico e o Endividamento',
        resumo: 'Crescimento do PIB a taxas de 10% ao ano, mas com explosão da dívida externa e concentração de renda ("fazer o bolo crescer para depois dividir").',
        pontosChave: ['Grandes obras ufanistas (Itaipu, Transamazônica)', 'Inflação e desigualdade']
      },
      {
        capitulo: 'Seção 4 - Abertura Lenta, Gradual e Segura (1974-1985)',
        resumo: 'Governos Geisel e Figueiredo. Revogação do AI-5, Lei da Anistia de 1979 e a transição para o governo civil com o Colégio Eleitoral e Tancredo Neves.',
        pontosChave: ['Lei da Anistia', 'Movimento Diretas Já (1984)', 'Constituição Cidadã de 1988']
      }
    ],
    personagensETemas: [
      {
        nome: 'Ato Institucional nº 5 (AI-5)',
        papel: 'Marco jurídico da ditadura',
        descricao: 'Decreto que suspendeu o habeas corpus para crimes políticos e autorizou o fechamento do poder legislativo.',
        citacaoRedacao: 'Essencial em redações sobre autoritarismo, liberdade de expressão e preservação da democracia.'
      },
      {
        nome: 'Movimento Diretas Já',
        papel: 'Mobilização popular de massa',
        descricao: 'Campanha de 1983-1984 exigindo eleições diretas para a presidência da República através da Emenda Dante de Oliveira.',
        citacaoRedacao: 'Excelente exemplo de engajamento cidadão e soberania popular.'
      }
    ],
    quiz: [
      {
        pergunta: 'Qual ato institucional decretado em 1968 marcou o início da fase mais repressiva da ditadura militar brasileira?',
        opcoes: ['AI-1', 'AI-2', 'AI-5', 'AI-13'],
        respostaCorreta: 2,
        explicacao: 'O AI-5 suspendeu o habeas corpus e deu poderes absolutos ao presidente para fechar o Congresso e cassar mandatos.'
      },
      {
        pergunta: 'O que caracterizou o chamado "Milagre Econômico" no início da década de 1970?',
        opcoes: [
          'Redução da dívida externa e distribuição imediata de renda',
          'Alto crescimento do PIB acompanhado de forte concentração de renda e endividamento',
          'Privatização de todas as estatais brasileiras',
          'Fim da inflação através do Plano Real'
        ],
        respostaCorreta: 1,
        explicacao: 'O país cresceu em ritmo acelerado, mas às custas do arrocho salarial e do aumento exponencial da dívida externa.'
      },
      {
        pergunta: 'Qual foi o objetivo da Lei da Anistia sancionada em 1979 durante o governo Geisel?',
        opcoes: [
          'Perdoar apenas os crimes cometidos pelos agentes do estado',
          'Perdoar os perseguidos políticos e perdoar também os agentes estatais acusados de tortura',
          'Convocar eleições diretas imediatas para 1980',
          'Criar uma nova moeda nacional'
        ],
        respostaCorreta: 1,
        explicacao: 'A lei teve caráter recíproco, permitindo o retorno dos exilados, mas também protegendo os militares de punição.'
      },
      {
        pergunta: 'A Emenda Dante de Oliveira esteve no centro de qual grande mobilização popular brasileira?',
        opcoes: ['Revolta da Vacina', 'Caras-Pintadas', 'Diretas Já', 'Marcha da Família com Deus'],
        respostaCorreta: 2,
        explicacao: 'A emenda propunha o restabelecimento de eleições diretas para Presidente em 1985.'
      },
      {
        pergunta: 'Como o setor da cultura resistiu ao regime militar durante o AI-5?',
        opcoes: [
          'Através da Tropicália, do teatro engajado (Opinião, Oficina) e da MPB com linguagem metafórica',
          'Fechando todos os teatros e cinemas do país por tempo indeterminado',
          'Apoiando irrestritamente a censura prévia',
          'Escrevendo apenas hinos ufanistas'
        ],
        respostaCorreta: 0,
        explicacao: 'Artistas usaram metáforas, duplos sentidos e manifestações de contracultura para driblar os censores.'
      }
    ],
    faqIAContexto: 'Você é um professor historiador especialista no período da Ditadura Militar no Brasil (1964-1985). Tire dúvidas sobre governos militares, censura, movimentos sociais e o processo de redemocratização.'
  },

  // 3. GEOGRAFIA
  {
    id: 'geo_globalizacao',
    titulo: 'E-book Sintético: Globalização, DIT e Redes Mundiais',
    subtitulo: 'Análise geográfica das corporações transnacionais, fluxos e Divisão Internacional do Trabalho',
    autor: 'Prof. GabaritaAí (Série Geografia Geral)',
    categoria: 'geografia',
    disciplina: 'Geografia Humana & Geopolítica',
    vestibularesTag: ['ENEM', 'UNICAMP', 'FUVEST'],
    capaGradient: 'from-blue-900 via-indigo-950 to-slate-900',
    capaIcone: '🌐',
    anoOuEpoca: 'Século XXI',
    resumoExpresso: `Examina o processo de integração econômica, cultural e tecnológica do espaço geográfico global. Aborda a evolução da Divisão Internacional do Trabalho (DIT), a atuação das empresas multinacionais/transnacionais, a compressão do tempo-espaço (Milton Santos) e os paradoxos da globalização, como a exclusão digital e a precarização das relações de trabalho.`,
    capituloPorCapitulo: [
      {
        capitulo: 'Módulo 1 - O Meio Técnico-Científico-Informacional',
        resumo: 'Conceito criado por Milton Santos. A ciência e a informação passam a ser o motor de transformação do espaço geográfico e do sistema produtivo.',
        pontosChave: ['Compressão tempo-espaço', 'Cidades Globais e Tecnopolos']
      },
      {
        capitulo: 'Módulo 2 - A Evolução da DIT (Divisão Internacional do Trabalho)',
        resumo: 'Da DIT Clássica (Colônia fornece matéria-prima e Metrópole industrializados) à Nova DIT (Países emergentes produzem manufaturados com mão de obra barata para sedes nos países ricos).',
        pontosChave: ['Deslocalização industrial', 'Remessa de lucros']
      },
      {
        capitulo: 'Módulo 3 - Blocos Econômicos e Fluxos Globais',
        resumo: 'Integração regional (União Europeia, Mercosul, USMCA) para competir no mercado globalizado. Fluxos de capitais, mercadorias e a barreira aos fluxos migratórios.',
        pontosChave: ['Livre comércio vs. Barreiras alfandegárias', 'Crise dos refugiados']
      },
      {
        capitulo: 'Módulo 4 - A Globalização Perversa e a Resistência',
        resumo: 'Como a globalização aprofunda desigualdades sociais e produz homogeneização cultural, gerando movimentos de alterglobalização e defesa de saberes locais.',
        pontosChave: ['Milton Santos: Por uma outra globalização', 'Uberização e cadeias globais de valor']
      }
    ],
    personagensETemas: [
      {
        nome: 'Milton Santos',
        papel: 'Geógrafo brasileiro de renome internacional',
        descricao: 'Autor do livro "Por uma outra globalização". Conceituou a globalização em três aspectos: como fábula, como perversidade e como possibilidade.',
        citacaoRedacao: 'Repertório coringa para redações sobre desigualdade digital, consumo consciente e impactos da tecnologia na sociedade.'
      },
      {
        nome: 'Compressão Tempo-Espaço',
        papel: 'Conceito geográfico (David Harvey)',
        descricao: 'Encurtamento das distâncias virtuais através do avanço dos transportes e das telecomunicações.',
        citacaoRedacao: 'Ideal para introduzir discussões sobre redes sociais, imediatismo e relações humanas no século XXI.'
      }
    ],
    quiz: [
      {
        pergunta: 'O que caracteriza a fase do "Meio Técnico-Científico-Informacional" segundo o geógrafo Milton Santos?',
        opcoes: [
          'Uso exclusivo da tração animal e energia a vapor nas indústrias',
          'Inseparabilidade entre a ciência, a tecnologia e a informação na estruturação do território',
          'Isolamento completo entre os mercados financeiros globais',
          'Abandono total da produção agrícola em prol do setor de serviços'
        ],
        respostaCorreta: 1,
        explicacao: 'Nesta fase contemporânea, o espaço geográfico é impregnado por ciência e redes digitais de informação.'
      },
      {
        pergunta: 'Na Nova Divisão Internacional do Trabalho (DIT), qual o papel frequente dos países emergentes?',
        opcoes: [
          'Importar apenas matérias-primas brutas dos países desenvolvidos',
          'Exportar manufaturados e commodites atraindo fábricas em busca de custos de produção menores',
          'Centralizar todas as decisões de P&D (Pesquisa e Desenvolvimento)',
          'Financiar inteiramente a dívida externa europeia'
        ],
        respostaCorreta: 1,
        explicacao: 'Empresas transnacionais transferem etapas fabris para emergentes aproveitando isenções fiscais e mão de obra barata.'
      },
      {
        pergunta: 'Quais são as três faces da globalização descritas por Milton Santos em sua obra de crítica social?',
        opcoes: [
          'A globalização como fábula, como perversidade e como possibilidade',
          'A globalização como guerra, como paz e como religião',
          'A globalização como império, como colônia e como estado',
          'A globalização como utopia, como realidade e como ficção'
        ],
        respostaCorreta: 0,
        explicacao: 'Como fábula (o mundo que nos fazem ver), como perversidade (o mundo como é) e como possibilidade (o mundo como pode ser).'
      },
      {
        pergunta: 'Qual o principal contraste entre os fluxos de mercadorias/capitais e os fluxos de pessoas na globalização atual?',
        opcoes: [
          'Capitais encontram fronteiras fechadas, enquanto pessoas circulam livremente sem visto',
          'Capitais e mercadorias circulam quase instantaneamente, enquanto o trânsito de trabalhadores refugiados sofre rígidas restrições',
          'Não há qualquer tipo de controle em nenhum dos fluxos',
          'Apenas produtos agrícolas possuem livre trânsito'
        ],
        respostaCorreta: 1,
        explicacao: 'Há livre circulação financeira e de bens, mas forte controle de fronteiras e políticas anti-imigração contra pessoas vulneráveis.'
      },
      {
        pergunta: 'O termo "Deslocalização Industrial" (ou Offshoring) refere-se a qual fenômeno?',
        opcoes: [
          'Fechamento definitivo de todas as fábricas no mundo',
          'Transferência de unidades fabris de países desenvolvidos para países com custos de produção mais baixos',
          'Proibição de vendas via e-commerce',
          'Estatização das multinacionais por governos locais'
        ],
        respostaCorreta: 1,
        explicacao: 'As empresas movem suas linhas de montagem para locais onde impostos e custos trabalhistas são menores.'
      }
    ],
    faqIAContexto: 'Você é um professor especialista em Geografia Humana, Geopolítica e Globalização. Tire dúvidas sobre DIT, redes mundiais, Milton Santos, blocos econômicos e impactos socioambientais do capitalismo global.'
  }
];
