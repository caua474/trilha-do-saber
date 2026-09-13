export interface EnemTopic {
  id: string;
  nome: string;
  incidencia: 'Mais Cai' | 'Médio' | 'Básico';
  descricao: string;
  dicaChave: string;
  exemploPratico: string;
}

export interface EnemDisciplina {
  id: string;
  nome: string;
  icone: string;
  topicos: EnemTopic[];
}

export interface EnemArea {
  id: string;
  areaNome: string;
  sigla: string;
  corTheme: string;
  gradient: string;
  borderColor: string;
  bgGlow: string;
  disciplinas: EnemDisciplina[];
}

export const ENEM_CATALOG: EnemArea[] = [
  {
    id: 'matematica',
    areaNome: 'Matemática e suas Tecnologias',
    sigla: 'MAT',
    corTheme: 'amber',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    borderColor: 'border-amber-500/40',
    bgGlow: 'bg-amber-500/10',
    disciplinas: [
      {
        id: 'mat_geral',
        nome: 'Matemática',
        icone: '📐',
        topicos: [
          {
            id: 'mat_alg',
            nome: 'Álgebra, Razão e Proporção',
            incidencia: 'Mais Cai',
            descricao: 'Regra de três simples e composta, porcentagem, escalas numéricas e proporcionalidade em gráficos.',
            dicaChave: 'Em escala cartográfica, Escala = Distância no Mapa / Distância Real. Fique atento às unidades (cm para km)!',
            exemploPratico: 'Se 1 cm no mapa representa 5 km no terreno real, a escala é de 1:500.000.',
          },
          {
            id: 'mat_geo_plana',
            nome: 'Geometria Plana',
            incidencia: 'Mais Cai',
            descricao: 'Áreas de triângulos, círculos, quadriláteros e Teorema de Pitágoras em situações cotidianas.',
            dicaChave: 'A área do círculo é π·r² e o comprimento da circunferência é 2·π·r.',
            exemploPratico: 'Cálculo do custo para piso em uma sala retangular ou irrigação em pivô central circular.',
          },
          {
            id: 'mat_geo_esp',
            nome: 'Geometria Espacial',
            incidencia: 'Mais Cai',
            descricao: 'Cálculo de volume de prismas, cilindros, pirâmides, cones, esferas e projeções ortogonais.',
            dicaChave: 'Volume de prisma e cilindro = Área da Base × Altura. Para pirâmide e cone, divida por 3!',
            exemploPratico: 'Descobrir a capacidade em litros de um reservatório cilíndrico de água (1 m³ = 1000 Litros).',
          },
          {
            id: 'mat_geo_ana',
            nome: 'Geometria Analítica',
            incidencia: 'Médio',
            descricao: 'Distância entre dois pontos, equação da reta, coeficiente angular e equação da circunferência.',
            dicaChave: 'O coeficiente angular (m) representa a inclinação da reta: m = (y₂ - y₁) / (x₂ - x₁).',
            exemploPratico: 'Determinar o ponto de encontro de duas trajetórias retilíneas em um plano cartesiano.',
          },
          {
            id: 'mat_estat',
            nome: 'Estatística (Média, Moda e Mediana)',
            incidencia: 'Mais Cai',
            descricao: 'Análise de dados de tabelas e gráficos, média aritmética simples e ponderada, moda e mediana.',
            dicaChave: 'Para achar a Mediana, organize TODOS os valores em ordem crescente (Rol) primeiro!',
            exemploPratico: 'Encontrar a nota média de um candidato em um concurso com pesos diferentes em cada prova.',
          },
          {
            id: 'mat_prob',
            nome: 'Probabilidade & Análise Combinatória',
            incidencia: 'Mais Cai',
            descricao: 'Probabilidade simples e condicional, princípio fundamental da contagem, arranjos e combinações.',
            dicaChave: 'Probabilidade = Casos Favoráveis / Casos Totais. Se a ordem importa, use Arranjo; se não importa, Combinação.',
            exemploPratico: 'Calcular a chance de tirar um ás vermelho em um baralho comum de 52 cartas.',
          },
          {
            id: 'mat_trigo',
            nome: 'Trigonometria',
            incidencia: 'Médio',
            descricao: 'Seno, cosseno e tangente no triângulo retângulo e no círculo trigonométrico, Lei dos Senos/Cossenos.',
            dicaChave: 'Lembre do SOH-CAH-TOA: Seno = Oposto/Hipo, Cosseno = Adj/Hipo, Tangente = Oposto/Adj.',
            exemploPratico: 'Calcular a altura de um prédio a partir da sombra projetada no chão e o ângulo do sol.',
          },
          {
            id: 'mat_fin',
            nome: 'Matemática Financeira & Porcentagem',
            incidencia: 'Mais Cai',
            descricao: 'Juros simples, juros compostos, descontos, acréscimos sucessivos e inflação.',
            dicaChave: 'Juros Compostos: M = C·(1 + i)ᵗ. Dois aumentos sucessivos de 10% resultam em 21% acumulado (1,1 × 1,1).',
            exemploPratico: 'Comparar compras à vista com desconto versus parcelamento com taxa de juros ao mês.',
          },
          {
            id: 'mat_func',
            nome: 'Funções (1º e 2º Grau, Exponencial e Log)',
            incidencia: 'Mais Cai',
            descricao: 'Interpretação de gráficos, Vértice da Parábola (máximos e mínimos), crescimento exponencial e logaritmos.',
            dicaChave: 'O ponto de máximo ou mínimo da parábola ocorre no Vértice: Xv = -b / (2a) e Yv = -Δ / (4a).',
            exemploPratico: 'Achar o preço do ingresso que gera o maior faturamento possível em um show.',
          },
        ],
      },
    ],
  },
  {
    id: 'natureza',
    areaNome: 'Ciências da Natureza e suas Tecnologias',
    sigla: 'NAT',
    corTheme: 'emerald',
    gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    borderColor: 'border-emerald-500/40',
    bgGlow: 'bg-emerald-500/10',
    disciplinas: [
      {
        id: 'bio',
        nome: 'Biologia',
        icone: '🧬',
        topicos: [
          {
            id: 'bio_eco',
            nome: 'Ecologia e Impactos Ambientais',
            incidencia: 'Mais Cai',
            descricao: 'Cadeias e teias alimentares, ciclos biogeoquímicos (Carbono, Nitrogênio), eutrofização e poluição.',
            dicaChave: 'Eutrofização: excesso de nutrientes → proliferação de algas → bloqueio da luz → queda de O₂ dissolvido.',
            exemploPratico: 'Analise da bioacumulação de metais pesados (como mercúrio) nos topo da cadeia alimentar.',
          },
          {
            id: 'bio_cito',
            nome: 'Citologia e Bioquímica Celular',
            incidencia: 'Mais Cai',
            descricao: 'Organelas celulares, transporte de membrana (osmose e difusão), respiração celular, fotossíntese e síntese de proteínas.',
            dicaChave: 'Na osmose a água vai do meio HIPOTÔNICO (menos concentrado) para o HIPERTÔNICO (mais concentrado).',
            exemploPratico: 'Efeito do sal jogado em lesmas ou preservação de alimentos em salmoura (desidratação osmótica).',
          },
          {
            id: 'bio_gen',
            nome: 'Genética e Biotecnologia',
            incidencia: 'Mais Cai',
            descricao: 'Leis de Mendel, hereditariedade, tipos sanguíneos (Sistema ABO e Rh), transgênicos, CRISPR e clonagem.',
            dicaChave: 'Sangue Tipo O- é o doador universal (sem aglutinogênios A/B e sem fator Rh).',
            exemploPratico: 'Previsão de tipo sanguíneo dos filhos através do quadro de Punnett.',
          },
          {
            id: 'bio_evo',
            nome: 'Evolução e Seleção Natural',
            incidencia: 'Médio',
            descricao: 'Lamarckismo vs. Darwinismo, Neodarwinismo, mutações, especiação e resistência a antibióticos.',
            dicaChave: 'A seleção natural NÃO cria mutações; ela SELECIONA os indivíduos com mutações já existentes favoráveis ao meio.',
            exemploPratico: 'Surgimento de superbactérias pelo uso indiscriminado de antibióticos.',
          },
          {
            id: 'bio_fisio',
            nome: 'Fisiologia Humana e Saúde',
            incidencia: 'Mais Cai',
            descricao: 'Sistemas digestório, circulatório, respiratório, excretor, imunológico (Vacinas vs. Soros) e hormônios.',
            dicaChave: 'Vacina previne (imunização ativa, produz anticorpos). Soro cura em emergências (imunização passiva, anticorpos prontos).',
            exemploPratico: 'Tratamento de picada de cobra peçonhenta com soro antiofídico.',
          },
          {
            id: 'bio_bot',
            nome: 'Botânica',
            incidencia: 'Médio',
            descricao: 'Grupos vegetais (Briófitas, Pteridófitas, Gimnospermas e Angiospermas), hormônios vegetais e transpiração.',
            dicaChave: 'Angiospermas são os únicos vegetais com FLORES e FRUTOS verdadeiros.',
            exemploPratico: 'O hormônio Etileno acelerando o amadurecimento das bananas em saco fechado.',
          },
          {
            id: 'bio_zoo',
            nome: 'Zoologia e Parasitoses',
            incidencia: 'Médio',
            descricao: 'Principais verminoses (Esquistossomose, Teníase, Ascaridíase) e arboviroses (Dengue, Zika, Chikungunya).',
            dicaChave: 'Dengue e Febre Amarela são causadas por VÍRUS e transmitidas pelo mosquito Aedes aegypti.',
            exemploPratico: 'Medidas profiláticas para combater a reprodução do mosquito vetor em água parada.',
          },
        ],
      },
      {
        id: 'fis',
        nome: 'Física',
        icone: '⚡',
        topicos: [
          {
            id: 'fis_mec',
            nome: 'Mecânica (Cinemática, Leis de Newton e Energia)',
            incidencia: 'Mais Cai',
            descricao: 'MRU, MRUV, Forças de Atrito, Conservação da Energia Mecânica (Cinética e Potencial) e Impulso/Quantidade de Movimento.',
            dicaChave: 'Energia Mecânica Total = Energia Cinética (m·v²/2) + Energia Potencial (m·g·h).',
            exemploPratico: 'Cálculo da velocidade de um carrinho de montanha-russa na base do loop.',
          },
          {
            id: 'fis_eletro',
            nome: 'Eletromagnetismo & Circuitos Elétricos',
            incidencia: 'Mais Cai',
            descricao: 'Corrente elétrica, Leis de Ohm, associação de resistores em série e paralelo, potência elétrica e consumo em kWh.',
            dicaChave: 'A potência é P = U · i. Aparelhos em casas brasileiras são ligados sempre em PARALELO (mesma voltagem U).',
            exemploPratico: 'Descobrir qual disjuntor instalar ao ligar um chuveiro de 5500 W em uma rede de 220 V.',
          },
          {
            id: 'fis_ond',
            nome: 'Ondulatória & Acústica',
            incidencia: 'Mais Cai',
            descricao: 'Equação fundamental das ondas (v = λ · f), fenômenos ondulatórios (reflexão, refração, difração, interferência e Efeito Doppler).',
            dicaChave: 'Na refração da onda, a FREQUÊNCIA NUNCA MUDA! Mudar de meio altera velocidade e comprimento de onda.',
            exemploPratico: 'Alteração no tom da sirene de uma ambulância se aproximando ou se afastando de um pedestre.',
          },
          {
            id: 'fis_termo',
            nome: 'Termologia e Calorimetria',
            incidencia: 'Mais Cai',
            descricao: 'Calor sensível (Q = m·c·ΔT), calor latente (mudança de estado), propagação do calor (condução, convecção e irradiação) e gases.',
            dicaChave: 'Convecção ocorre em fluídos (líquidos/gases): o ar quente sobe (menos denso) e o frio desce (mais denso).',
            exemploPratico: 'Explicação de por que o ar-condicionado é instalado no alto da parede da sala.',
          },
          {
            id: 'fis_opt',
            nome: 'Óptica',
            incidencia: 'Médio',
            descricao: 'Espelhos planos e esféricos, refração da luz, índice de refração, lentes corretivas e defeitos da visão (miopia e hipermetropia).',
            dicaChave: 'Miopia: o olho é muito longo, a imagem forma ANTES da retina. Corrige-se com Lente Divergente!',
            exemploPratico: 'Formação de arco-íris pela dispersão da luz do sol em gotículas de chuva.',
          },
          {
            id: 'fis_mod',
            nome: 'Física Moderna',
            incidencia: 'Básico',
            descricao: 'Efeito fotoelétrico, dualidade onda-partícula, relatividade restrita e radioatividade.',
            dicaChave: 'No efeito fotoelétrico, a emissão de elétrons depende da FREQUÊNCIA da luz incidente, não da intensidade.',
            exemploPratico: 'Funcionamento de placas solares fotovoltaicas e sensores de portas automáticas.',
          },
        ],
      },
      {
        id: 'qui',
        nome: 'Química',
        icone: '🧪',
        topicos: [
          {
            id: 'qui_fis',
            nome: 'Físico-Química (Estequiometria, Soluções e pH)',
            incidencia: 'Mais Cai',
            descricao: 'Cálculos estequiométricos, concentração de soluções, termoquímica (ΔH), cinética, equilíbrio químico e escala de pH.',
            dicaChave: 'pH < 7 é Ácido (alto H⁺); pH = 7 é Neutro; pH > 7 é Básico/Alcalino (baixo H⁺ e alto OH⁻).',
            exemploPratico: 'Uso de cal agrícola (CaO) para neutralizar o solo ácido do Cerrado.',
          },
          {
            id: 'qui_org',
            nome: 'Química Orgânica',
            incidencia: 'Mais Cai',
            descricao: 'Cadeias carbônicas, funções orgânicas (álcool, fenol, éster, amina, amida, ácido carboxílico), isomeria e reações orgânicas.',
            dicaChave: 'Reação de Esterificação: Ácido Carboxílico + Álcool → Éster + Água (aroma e sabor sintético de frutas).',
            exemploPratico: 'Identificação de compostos ativos de medicamentos e produção de biodiesel.',
          },
          {
            id: 'qui_geral',
            nome: 'Química Geral & Ligações Químicas',
            incidencia: 'Mais Cai',
            descricao: 'Estados físicos, misturas e métodos de separação (destilação, catação, decantação), ligações iônica, covalente e metálica.',
            dicaChave: 'A Destilação Fracionada separa misturas homogêneas de líquidos com pontos de ebulição diferentes (ex: petróleo).',
            exemploPratico: 'Separação dos componentes do petróleo na refinaria ou dessalinização de água salgada.',
          },
          {
            id: 'qui_ato',
            nome: 'Atomística & Tabela Periódica',
            incidencia: 'Médio',
            descricao: 'Modelos atômicos (Dalton, Thomson, Rutherford, Bohr), distribuição eletrônica, raio atômico e eletronegatividade.',
            dicaChave: 'O modelo de Bohr explica o teste de chama: ao saltar de nível e voltar, o elétron emite energia sob forma de luz.',
            exemploPratico: 'Cores vibrantes nos fogos de artifício causadas por sais de estrôncio, sódio e bário.',
          },
          {
            id: 'qui_amb',
            nome: 'Meio Ambiente & Impactos Químicos',
            incidencia: 'Mais Cai',
            descricao: 'Chuva ácida (SO₂ e NOₓ), destruição da camada de ozônio (CFCs), efeito estufa e tratamento de água/esgoto.',
            dicaChave: 'A Etapa de Floculação no tratamento de água usa Sulfato de Alumínio para aglutinar sujeiras suspensas.',
            exemploPratico: 'Como funcionam os catalisadores automotivos na conversão de gases tóxicos em CO₂ e N₂.',
          },
        ],
      },
    ],
  },
  {
    id: 'humanas',
    areaNome: 'Ciências Humanas e suas Tecnologias',
    sigla: 'HUM',
    corTheme: 'purple',
    gradient: 'from-purple-600 via-indigo-600 to-purple-700',
    borderColor: 'border-purple-500/40',
    bgGlow: 'bg-purple-500/10',
    disciplinas: [
      {
        id: 'his',
        nome: 'História',
        icone: '🏛️',
        topicos: [
          {
            id: 'his_br',
            nome: 'História do Brasil',
            incidencia: 'Mais Cai',
            descricao: 'Brasil Colônia (Ciclo do Açúcar e Ouro), Império (1º e 2º Reinos, Abolição), República Velha, Era Vargas e Ditadura Militar.',
            dicaChave: 'Era Vargas (1930-1945): criação da CLT, industrialização de base e fortalecimento do Estado Nacional.',
            exemploPratico: 'Consolidação das leis trabalhistas e o simbolismo da propaganda política no DIP de Vargas.',
          },
          {
            id: 'his_geral',
            nome: 'História Geral',
            incidencia: 'Mais Cai',
            descricao: 'Grécia e Roma Antiga, Feudalismo, Absolutismo, Revolução Industrial, Guerras Mundiais, Guerra Fria e Neocolonialismo.',
            dicaChave: 'A Segunda Revolução Industrial teve como combustível o Petróleo e a Eletricidade, impulsionando a linha de montagem (Fordismo).',
            exemploPratico: 'Partilha da África na Conferência de Berlim (1884) e suas consequências para o século XX.',
          },
        ],
      },
      {
        id: 'geo',
        nome: 'Geografia',
        icone: '🌍',
        topicos: [
          {
            id: 'geo_fis',
            nome: 'Geografia Física & Meio Ambiente',
            incidencia: 'Mais Cai',
            descricao: 'Relevo, Clima, Tectônica de Placas, Biomas Brasileiros (Cerrado, Caatinga, Amazônia, Mata Atlântica) e Bacias Hidrográficas.',
            dicaChave: 'O Cerrado possui vegetação tropófila (casca grossa e raízes profundas) e solo naturalmente ácido.',
            exemploPratico: 'Fenômeno da Inversão Térmica em grandes metrópoles durante as manhãs frias de inverno.',
          },
          {
            id: 'geo_hum',
            nome: 'Geografia Humana & Demografia',
            incidencia: 'Mais Cai',
            descricao: 'Crescimento populacional, pirâmides etárias, fluxos migratórios (êxodo rural, transumância) e urbanização.',
            dicaChave: 'O envelhecimento da população brasileira exige reformas na previdência e maiores investimentos em saúde pública.',
            exemploPratico: 'Transição demográfica e redução da taxa de fecundidade no Brasil.',
          },
          {
            id: 'geo_br',
            nome: 'Geografia do Brasil & Agronegócio',
            incidencia: 'Mais Cai',
            descricao: 'Matriz energética brasileira, agronegócio, fronteiras agrícolas (MATOPIBA) e estrutura fundiária.',
            dicaChave: 'A matriz elétrica do Brasil é predominantemente Limpa/Renovável devido às Usinas Hidrelétricas (>60%).',
            exemploPratico: 'Expansão da soja e pecuária no bioma Cerrado na região do MATOPIBA.',
          },
          {
            id: 'geo_politica',
            nome: 'Geopolítica & Globalização',
            incidencia: 'Mais Cai',
            descricao: 'Blocos econômicos, conflitos internacionais contemporâneos, Nova Ordem Mundial e Divisão Internacional do Trabalho (DIT).',
            dicaChave: 'Na Globalização, há um fluxo intenso de informações e capitais, mas restrição ao livre trânsito de trabalhadores refugiados.',
            exemploPratico: 'Disputas territoriais e energéticas no Leste Europeu e no Oriente Médio.',
          },
        ],
      },
      {
        id: 'filo',
        nome: 'Filosofia',
        icone: '📜',
        topicos: [
          {
            id: 'fil_ant',
            nome: 'Filosofia Antiga',
            incidencia: 'Mais Cai',
            descricao: 'Socráticos e Pré-socráticos, Platão (Mito da Caverna e Mundo das Idéias) e Aristóteles (Ética e Eudaimonia).',
            dicaChave: 'O Mito da Caverna de Platão critica o senso comum (doxa) e propõe a busca pela verdade racional (episteme).',
            exemploPratico: 'Análise de bolhas virtuais de redes sociais comparadas às sombras projetadas dentro da caverna platônica.',
          },
          {
            id: 'fil_med',
            nome: 'Filosofia Medieval',
            incidencia: 'Médio',
            descricao: 'Patrística (Santo Agostinho: fé e razão) e Escolástica (São Tomás de Aquino: 5 vias de prova de Deus).',
            dicaChave: 'Santo Agostinho uniu o platonismo ao cristianismo; Tomás de Aquino conciliou o aristotelismo com o dogma católico.',
            exemploPratico: 'Debate medieval sobre o livre-arbítrio e a origem do mal no mundo.',
          },
          {
            id: 'fil_mod',
            nome: 'Filosofia Moderna',
            incidencia: 'Mais Cai',
            descricao: 'Racionalismo (Descartes: Cogito ergo sum), Empirismo (Locke/Hume), Iluminismo e Contratualismo (Hobbes, Locke, Rousseau).',
            dicaChave: 'Hobbes defendia Estado Forte ("O homem é o lobo do homem"); Rousseau defendia que a sociedade corrompe o homem.',
            exemploPratico: 'A divisão dos três poderes (Montesquieu) na estruturação das democracias ocidentais.',
          },
          {
            id: 'fil_cont',
            nome: 'Filosofia Contemporânea, Ética e Política',
            incidencia: 'Mais Cai',
            descricao: 'Hannah Arendt (Banalidade do Mal), Nietzsche, Foucault (Biopolítica) e Bauman (Modernidade Líquida).',
            dicaChave: 'Hannah Arendt cunhou "Banalidade do Mal" observando que atrocidades são cometidas por burocratas que deixam de pensar criticamente.',
            exemploPratico: 'Uso de câmeras de monitoramento e controle de dados pessoais sob o conceito do Panóptico de Foucault.',
          },
        ],
      },
      {
        id: 'soc',
        nome: 'Sociologia',
        icone: '👥',
        topicos: [
          {
            id: 'soc_cul',
            nome: 'Cultura & Patrimônio',
            incidencia: 'Mais Cai',
            descricao: 'Etnocentrismo vs. Relativismo Cultural, Indústria Cultural (Adorno/Horkheimer) e patrimônio material/imaterial.',
            dicaChave: 'Etnocentrismo é julgar a cultura alheia como inferior usando os padrões da sua própria cultura como superiores.',
            exemploPratico: 'Preservação de saberes tradicionais, como o modo artesanal de fazer queijo de Minas ou a capoeira.',
          },
          {
            id: 'soc_trab',
            nome: 'Trabalho, Produção e Consumo',
            incidencia: 'Mais Cai',
            descricao: 'Modelos de produção (Taylorismo, Fordismo, Toyotismo), precarização do trabalho (Uberização) e mais-valia.',
            dicaChave: 'Toyotismo funciona no sistema "Just in Time" (produção sob demanda flexível, sem estoques volumosos).',
            exemploPratico: 'A flexibilização das jornadas de trabalho através de aplicativos de entrega na economia gig.',
          },
          {
            id: 'soc_dir',
            nome: 'Direitos Humanos & Cidadania',
            incidencia: 'Mais Cai',
            descricao: 'Evolução dos direitos (civis, políticos, sociais), minorias sociais, racismo estrutural e desigualdade de gênero.',
            dicaChave: 'Cidadania plena combina Direitos Civis (liberdade), Políticos (voto) e Sociais (saúde/educação de qualidade).',
            exemploPratico: 'Ações afirmativas (cotas sociais e raciais) nas universidades públicas brasileiras.',
          },
          {
            id: 'soc_pod',
            nome: 'Poder, Estado e Movimentos Sociais',
            incidencia: 'Mais Cai',
            descricao: 'Conceitos de Estado (Max Weber: monopólio do uso legítimo da força), dominação e papel dos movimentos sociais organizados.',
            dicaChave: 'Para Max Weber, a dominação pode ser Tradicional, Carismática ou Racional-Legal (Burocrática).',
            exemploPratico: 'Atuação das redes sociais como vetor de mobilização para manifestações populares globais.',
          },
        ],
      },
    ],
  },
  {
    id: 'linguagens',
    areaNome: 'Linguagens, Códigos e suas Tecnologias',
    sigla: 'LIN',
    corTheme: 'rose',
    gradient: 'from-rose-500 via-pink-600 to-rose-600',
    borderColor: 'border-rose-500/40',
    bgGlow: 'bg-rose-500/10',
    disciplinas: [
      {
        id: 'port',
        nome: 'Língua Portuguesa',
        icone: '📚',
        topicos: [
          {
            id: 'port_interp',
            nome: 'Interpretação de Texto & Gêneros Textuais',
            incidencia: 'Mais Cai',
            descricao: 'Leitura crítica, funções da linguagem (Referencial, Emotiva, Conativa, Poética), coesão, coerência e tipologias.',
            dicaChave: 'Gêneros textuais são dinâmicos (memes, crônicas, notícias); tipos textuais são fixos (narrativo, dissertativo, descritivo).',
            exemploPratico: 'Identificação da intenção persuasiva em anúncios publicitários ou tirinhas de humor.',
          },
          {
            id: 'port_sintaxe',
            nome: 'Sintaxe & Concordância/Regência',
            incidencia: 'Mais Cai',
            descricao: 'Concordância verbal e nominal, regência verbal, uso da crase e colocação pronominal (próclise, ênclise e mesóclise).',
            dicaChave: 'Haver no sentido de existir é IMPESSOAL (fica no singular! Ex: "Havia muitas pessoas", nunca "Haviam").',
            exemploPratico: 'Emprego correto da crase antes de horas determinadas e nomes femininos regidos pela preposição A.',
          },
          {
            id: 'port_seman',
            nome: 'Semântica & Variação Linguística',
            incidencia: 'Mais Cai',
            descricao: 'Ambiguidade, conotação vs. denotação, figuras de linguagem (metáfora, ironia, metonímia) e variedades regionais/sociais.',
            dicaChave: 'A variação linguística NÃO é erro; no ENEM ela é reconhecida como riqueza cultural e adequação de contexto!',
            exemploPratico: 'Uso de gírias da internet em contraste com o registro formal exigido na redação acadêmica.',
          },
        ],
      },
      {
        id: 'lit',
        nome: 'Literatura',
        icone: '🎭',
        topicos: [
          {
            id: 'lit_br',
            nome: 'Escolas Literárias Brasileiras',
            incidencia: 'Mais Cai',
            descricao: 'Barroco, Arcadismo, Romantismo (gerações indianista, ultrarromântica e condoreira), Realismo (Machado de Assis), Parnasianismo, Simbolismo e Modernismo (1922, 1930 e 1945).',
            dicaChave: 'Machado de Assis inaugurou o Realismo no Brasil com "Memórias Póstumas de Brás Cubas" em 1881, usando ironia mordaz.',
            exemploPratico: 'A crítica à seca e à opressão no sertão nordestino em "Vidas Secas" de Graciliano Ramos (Geração de 30).',
          },
          {
            id: 'lit_contemp',
            nome: 'Literatura Contemporânea & Leitura Crítica',
            incidencia: 'Mais Cai',
            descricao: 'Poesia marginal, prosa afro-brasileira (Carolina Maria de Jesus, Conceição Evaristo) e hibridismo de linguagens.',
            dicaChave: 'Carolina Maria de Jesus escreveu "Quarto de Despejo" relatando a vivência real na favela do Canindé nos anos 1950.',
            exemploPratico: 'Analise da linguagem poética urbana nas batalhas de rima e saraus periféricos.',
          },
        ],
      },
      {
        id: 'red',
        nome: 'Redação ENEM',
        icone: '✍️',
        topicos: [
          {
            id: 'red_estrit',
            nome: 'Estruturação do Texto Dissertativo-Argumentativo',
            incidencia: 'Mais Cai',
            descricao: 'Construção da Tese na Introdução, Desenvolvimento com D1 e D2 e Conclusão com Proposta de Intervenção.',
            dicaChave: 'A tese deve conter 2 argumentos claros (A1 e A2) que serão detalhados respectivamente no D1 e no D2.',
            exemploPratico: 'Elaboração de um parágrafo introdutório perfeito com alusão histórica inicial.',
          },
          {
            id: 'red_comp5',
            nome: 'Proposta de Intervenção & As 5 Competências',
            incidencia: 'Mais Cai',
            descricao: 'Os 5 elementos obrigatórios: Agente, Ação, Meio/Modo, Efeito e Detalhamento para atingir os 200 pontos na Competência 5.',
            dicaChave: 'Lembre do modelo AAMED: "O Ministério da Educação [Agente] deve criar oficinas [Ação], por meio de verbas públicas [Meio], a fim de democratizar o saber [Efeito], com palestrantes renomados [Detalhamento]".',
            exemploPratico: 'Garantir a nota máxima na C5 sem deixar nenhum elemento de fora.',
          },
        ],
      },
      {
        id: 'ling_estran',
        nome: 'Língua Estrangeira (Inglês e Espanhol)',
        icone: '🌐',
        topicos: [
          {
            id: 'ing_interp',
            nome: 'Inglês (Interpretação e Vocabulário)',
            incidencia: 'Mais Cai',
            descricao: 'Leitura de tirinhas, letras de música, poemas e notícias em inglês; conectivos de oposição (however, subtle, whereas) e cognatos.',
            dicaChave: 'Cuidado com Falsos Cognatos: "Pretend" significa fingir (não pretender); "Push" significa empurrar (não puxar)!',
            exemploPratico: 'Compreender a crítica social presente na letra de uma música pop em língua inglesa.',
          },
          {
            id: 'esp_interp',
            nome: 'Espanhol (Interpretação e Falsos Amigos)',
            incidencia: 'Mais Cai',
            descricao: 'Heterotônicos, heterosemânticos (Falsos Amigos: todavia, embarazada, exquisito) e interpretação de textos jornalísticos/literários.',
            dicaChave: '"Todavía" em espanhol significa AINDA (não todavia/contudo); "Embarazada" significa grávida (não envergonhada)!',
            exemploPratico: 'Interpretar crônicas e tirinhas do personagem Mafalda de Quino.',
          },
        ],
      },
      {
        id: 'artes_ef',
        nome: 'Artes e Educação Física',
        icone: '🎨',
        topicos: [
          {
            id: 'artes_hist',
            nome: 'História da Arte & Vanguardas Europeias',
            incidencia: 'Mais Cai',
            descricao: 'Cubismo, Futurismo, Dadaísmo, Surrealismo, Expressionismo e a transição da Arte Clássica para a Moderna.',
            dicaChave: 'O Cubismo (Picasso) fragmenta as formas geométricamente para mostrar múltiplos ângulos do objeto ao mesmo tempo.',
            exemploPratico: 'Analise da obra "Guernica" de Picasso como denúncia aos horrores da guerra.',
          },
          {
            id: 'ef_saude',
            nome: 'Cultura Corporal, Saúde e Sociedade',
            incidencia: 'Mais Cai',
            descricao: 'Padrões de beleza e mídia, esporte de rendimento vs. esporte de lazer, sedentarismo e inclusão através do corpo.',
            dicaChave: 'A Educação Física no ENEM aborda o corpo sob a perspectiva social, cultural e de saúde coletiva, não apenas biomecânica.',
            exemploPratico: 'Discussão sobre a influência das redes sociais nos transtornos de imagem corporal.',
          },
        ],
      },
    ],
  },
];

export type SubjectArea = EnemArea;
export const enemCatalog = ENEM_CATALOG;
export default ENEM_CATALOG;
