import React, { useState } from 'react';
import { Sparkles, BookOpen, Layers, CheckCircle2, RotateCw, Copy, Check, ArrowRight, HelpCircle } from 'lucide-react';

interface BentoKit {
  topico: string;
  resumo: string;
  pontosPrincipais: string[];
  perguntas: Array<{
    pergunta: string;
    opcoes: string[];
    respostaCorreta: number;
    gabaritoComentado: string;
  }>;
  flashcards: Array<{
    frente: string;
    verso: string;
  }>;
}

const KITS_DATABASE: Record<string, BentoKit> = {
  ecologia: {
    topico: 'Ecologia (Relações Ecológicas e Impactos)',
    resumo:
      'A ecologia estuda as interações entre os seres vivos e o ambiente, sendo o conteúdo mais frequente em Ciências da Natureza no ENEM. O foco principal da prova está na conservação da biodiversidade, ciclos biogeoquímicos e desequilíbrios ecológicos causados pela ação antrópica. Compreender as cadeias tróficas e a bioacumulação é indispensável para resolver as questões contextualizadas.',
    pontosPrincipais: [
      'Relações Ecológicas: harmônicas (mutualismo, protocooperação, comensalismo) vs. desarmônicas (predação, parasitismo, competição).',
      'Bioacumulação e Magnificação Trófica: acúmulo crescente de poluentes não biodegradáveis ao longo dos níveis tróficos.',
      'Ciclos Biogeoquímicos: dinâmica do Carbono, Nitrogênio (fixação por bactérias) e da Água com foco no efeito estufa e eutrofização.',
      'Sucessão Ecológica e Biomas Brasileiros: dinâmica do Cerrado, Caatinga, Amazônia e Mata Atlântica diante do desmatamento e queimadas.',
    ],
    perguntas: [
      {
        pergunta: 'No processo de eutrofização de corpos d\'água causado por esgoto orgânico ou fertilizantes agrícolas, qual é o evento biológico imediato que causa a morte de peixes por asfixia?',
        opcoes: [
          'Aumento repentino da temperatura da água provocado pela luz solar.',
          'Proliferação descontrolada de bactérias anaeróbias que liberam oxigênio.',
          'Consumo excessivo de oxigênio dissolvido pela decomposição aeróbia da matéria orgânica.',
          'Neutralização do pH da água gerada pela absorção de fósforo.',
        ],
        respostaCorreta: 2,
        gabaritoComentado:
          'Gabarito: C. O excesso de matéria orgânica provoca a proliferação de algas e, em seguida, a decomposição aeróbia massiva, que consome o oxigênio dissolvido da água (alta DBO), asfixiando os peixes.',
      },
      {
        pergunta: 'Em uma cadeia alimentar aquática contaminada por metais pesados (ex: mercúrio), qual nível trófico apresentará a maior concentração desse poluente tóxico?',
        opcoes: [
          'Os produtores primários (fitoplâncton).',
          'Os consumidores primários (zooplâncton).',
          'Os consumidores secundários (pequenos peixes).',
          'Os consumidores do topo da cadeia (grandes predadores/aves piscívoras).',
        ],
        respostaCorreta: 3,
        gabaritoComentado:
          'Gabarito: D. Pelo fenômeno da magnificação trófica (biomagnificação), toxinas persistentes não biodegradáveis se acumulam progressivamente, atingindo a concentração máxima no predador do topo da cadeia.',
      },
      {
        pergunta: 'A relação ecológica estabelecida entre leguminosas e bactérias do gênero Rhizobium, que fixam nitrogênio atmosférico em troca de carboidratos, classifica-se como:',
        opcoes: [
          'Mutualismo obrigatório interespecífico.',
          'Comensalismo alimentar.',
          'Inquilinismo vegetal.',
          'Competição intraespecífica.',
        ],
        respostaCorreta: 0,
        gabaritoComentado:
          'Gabarito: A. É uma relação harmônica interespecífica de mutualismo, onde ambas as espécies se beneficiam e estabelecem uma dependência funcional indispensável para o ciclo do nitrogênio.',
      },
    ],
    flashcards: [
      {
        frente: 'Qual a diferença crucial entre Bioacumulação e Magnificação Trófica?',
        verso: 'Bioacumulação ocorre dentro de um ÚNICO organismo ao longo do tempo de vida; Magnificação Trófica é o aumento da concentração do poluente ao longo de TODOS os níveis da cadeia alimentar.',
      },
      {
        frente: 'O que caracteriza a Eutrofização e qual a sua sequência?',
        verso: '1. Excesso de nutrientes (N e P) → 2. Proliferação de algas (bloom) → 3. Bloqueio da luz solar → 4. Morte de algas e decomposição aeróbia → 5. Queda drástica do O2 dissolvido → 6. Morte de animais aquáticos.',
      },
    ],
  },
  'geometria plana': {
    topico: 'Geometria Plana (Áreas, Trigonometria e Proporções)',
    resumo:
      'A Geometria Plana no ENEM foca no cálculo de áreas de figuras planas, ladrilhamento de superfícies e relações métricas em triângulos e círculos. A contextualização geralmente envolve reformas residenciais, economia de materiais de embalagem ou divisão de terrenos. O domínio do Teorema de Pitágoras e das fórmulas básicas de área garante pontos cruciais na prova de Matemática.',
    pontosPrincipais: [
      'Áreas Fundamentais: Triângulo (b·h/2), Retângulo/Quadrado (b·h, L²), Trapézio ((B+b)·h/2) e Círculo (π·r²).',
      'Teorema de Pitágoras e Triângulos Notáveis: aplicação prática em rampas de acessibilidade e diagonais.',
      'Semelhança de Triângulos e Razões Trigonométricas: Seno, Cosseno e Tangente no triângulo retângulo (SOH CAH TOA).',
      'Setores Circulares e Escala de Áreas: a razão entre áreas de figuras semelhantes é o quadrado da razão de semelhança (k²).',
    ],
    perguntas: [
      {
        pergunta: 'Se a escala linear de um mapa arquitetônico é 1:100, qual é a razão entre a área do desenho e a área real do imóvel?',
        opcoes: [
          '1 : 100',
          '1 : 1.000',
          '1 : 10.000',
          '1 : 100.000',
        ],
        respostaCorreta: 2,
        gabaritoComentado:
          'Gabarito: C. A escala de área é o quadrado da escala linear: (1/100)² = 1 / 10.000. Regra fundamental e recorrente no ENEM!',
      },
      {
        pergunta: 'Um fazendeiro precisa cercar um canteiro triangular com lados medindo 6 m e 8 m, que formam entre si um ângulo reto de 90°. Qual é a área e a hipotenusa desse terreno?',
        opcoes: [
          'Área = 24 m² | Hipotenusa = 10 m',
          'Área = 48 m² | Hipotenusa = 14 m',
          'Área = 24 m² | Hipotenusa = 14 m',
          'Área = 12 m² | Hipotenusa = 10 m',
        ],
        respostaCorreta: 0,
        gabaritoComentado:
          'Gabarito: A. Triângulo retângulo 6-8-10 (múltiplo do 3-4-5). Hipotenusa = √(6² + 8²) = 10 m. Área = (6 × 8) / 2 = 24 m².',
      },
      {
        pergunta: 'A área de uma pizza circular com raio R é duplicada quando o novo raio passa a ser:',
        opcoes: [
          '2R',
          'R · √2',
          '4R',
          'R / 2',
        ],
        respostaCorreta: 1,
        gabaritoComentado:
          'Gabarito: B. A nova área A\' = 2(πR²) = π(R\')². Logo, (R\')² = 2R² → R\' = R√2 (aproximadamente 1,41R).',
      },
    ],
    flashcards: [
      {
        frente: 'Como calcular a área de um triângulo equilátero de lado L?',
        verso: 'Área = (L² · √3) / 4. Dica: A altura do triângulo equilátero é h = (L · √3) / 2.',
      },
      {
        frente: 'Qual é a fórmula da área do Trapézio e do Círculo?',
        verso: 'Trapézio: [(Base Maior + Base Menor) · Altura] / 2  |  Círculo: A = π · r²  (e Comprimento = 2 · π · r).',
      },
    ],
  },
};

export default function ConteudosBentoIA() {
  const [topico, setTopico] = useState('');
  const [isGerando, setIsGerando] = useState(false);
  const [kitGerado, setKitGerado] = useState<BentoKit | null>(null);
  const [respostasUsuario, setRespostasUsuario] = useState<Record<number, number>>({});
  const [flashcardFlipped, setFlashcardFlipped] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const sugestoes = [
    'Ecologia',
    'Geometria Plana',
    'Termoquímica',
    'Brasil Colônia',
    'Estatística',
    'Funções de 1º e 2º Grau',
    'Revolução Industrial',
  ];

  const handleGerarKit = (termoParaGerar?: string) => {
    const busca = (termoParaGerar || topico).trim();
    if (!busca) return;

    setIsGerando(true);
    setRespostasUsuario({});
    setFlashcardFlipped({});

    setTimeout(() => {
      const lower = busca.toLowerCase();
      let match: BentoKit | undefined;

      if (lower.includes('ecolog') || lower.includes('ambient') || lower.includes('bioma')) {
        match = KITS_DATABASE['ecologia'];
      } else if (lower.includes('geometr') || lower.includes('area') || lower.includes('triang')) {
        match = KITS_DATABASE['geometria plana'];
      } else {
        // Geração dinâmica inteligente para qualquer termo inserido
        match = {
          topico: busca,
          resumo: `O estudo de ${busca} para o ENEM exige domínio conceitual integrado com resolução de situações-problema. A prova prioriza aplicações práticas, causas e consequências sociais ou científicas e análise crítica de dados e gráficos relacionados ao tema. Dominar a definição central e seus desdobramentos garante segurança e rapidez na resolução da prova.`,
          pontosPrincipais: [
            `Conceito Estrutural: definição fundamental de ${busca} e como se relaciona com a matriz de referência do ENEM.`,
            `Mecanismos e Fórmulas/Fatos: principais processos, leis ou eventos históricos associados ao tema.`,
            `Aplicações no Cotidiano: impactos diretos no meio ambiente, na tecnologia ou na sociedade brasileira contemporânea.`,
            `Pegadinhas Frequentes: distinções entre conceitos análogos que costumam confundir os vestibulandos.`,
          ],
          perguntas: [
            {
              pergunta: `Em relação aos princípios fundamentais de ${busca}, qual alternativa apresenta a análise mais consistente com os padrões cobrados no ENEM?`,
              opcoes: [
                `O tema opera de forma isolada, sem correlação com fenômenos ambientais ou sociais.`,
                `Sua compreensão requer análise multidisciplinar aliando teoria, gráficos e impacto no cotidiano.`,
                `Trata-se de uma regra empírica sem fundamentação teórica aplicável.`,
                `É cobrado exclusivamente através de decoreba direta de definições formais.`,
              ],
              respostaCorreta: 1,
              gabaritoComentado: `Gabarito: B. O ENEM cobra ${busca} sempre contextualizado com problemas do cotidiano, gráficos ou leitura de fenômenos integrados.`,
            },
            {
              pergunta: `Ao analisar uma situação-problema envolvendo ${busca}, o primeiro passo recomendado para evitar distratores é:`,
              opcoes: [
                `Ignorar os dados do enunciado e tentar adivinhar a alternativa.`,
                `Identificar o comando central da questão e as grandezas/conceitos-chave envolvidos.`,
                `Descartar todas as opções que mencionem termos técnicos.`,
                `Buscar a alternativa mais longa sem ler o texto de apoio.`,
              ],
              respostaCorreta: 1,
              gabaritoComentado: `Gabarito: B. A identificação clara do comando da questão e das variáveis de ${busca} elimina distratores com rapidez.`,
            },
            {
              pergunta: `Qual a melhor estratégia para fixar os conteúdos de ${busca} a longo prazo na sua rotina de estudos?`,
              opcoes: [
                `Apenas ler o resumo uma única vez na véspera da prova.`,
                `Prática ativa de questões do ENEM com repetição espaçada por flashcards.`,
                `Copiar o livro inteiro à mão sem resolver exercícios.`,
                `Evitar resolver simulados para não identificar lacunas de aprendizado.`,
              ],
              respostaCorreta: 1,
              gabaritoComentado: `Gabarito: B. A prática ativa combinada com recuperação espaçada (flashcards e questões) consolida a memória de longo prazo.`,
            },
          ],
          flashcards: [
            {
              frente: `Qual é o núcleo conceitual de "${busca}" mais cobrado no ENEM?`,
              verso: `A aplicação prática do conceito em problemas reais, relacionando causa, efeito e interpretação crítica de dados.`,
            },
            {
              frente: `Qual o principal cuidado ao resolver questões de "${busca}"?`,
              verso: `Atenção rigorosa ao comando da questão para não cair em distratores que trazem fatos verdadeiros, mas que não respondem à pergunta.`,
            },
          ],
        };
      }

      setKitGerado(match);
      setIsGerando(false);
    }, 450);
  };

  const handleCopiarKit = () => {
    if (!kitGerado) return;
    const textoFormatado = `=== KIT DE ESTUDOS BENTO IA: ${kitGerado.topico} ===\n\n` +
      `[RESUMO DIRETO]\n${kitGerado.resumo}\n\n` +
      `[4 PONTOS PRINCIPAIS]\n${kitGerado.pontosPrincipais.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
      `[FLASHCARDS]\n1. ${kitGerado.flashcards[0]?.frente} -> ${kitGerado.flashcards[0]?.verso}\n2. ${kitGerado.flashcards[1]?.frente} -> ${kitGerado.flashcards[1]?.verso}`;

    navigator.clipboard.writeText(textoFormatado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="bento-ia-container" className="p-4 bg-slate-950 text-white min-h-screen pb-28 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <span>🍱</span> Bento IA - Gerador de Estudos
        </h2>
        <p className="text-xs text-slate-400">
          Digite um assunto para gerar resumos, pontos-chave e flashcards instantâneos.
        </p>
      </div>

      {/* Input de Assunto */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 shadow-lg">
        <label htmlFor="bento-input-topico" className="text-xs font-semibold text-slate-300 block mb-2">
          O que você quer estudar agora?
        </label>
        <div className="space-y-3">
          <input
            id="bento-input-topico"
            type="text"
            value={topico}
            onChange={(e) => setTopico(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGerarKit();
            }}
            placeholder="Ex: Ecologia, Geometria Plana, Termoquímica, Brasil Colônia..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
          />

          <button
            id="btn-gerar-bento"
            type="button"
            onClick={() => handleGerarKit()}
            disabled={!topico.trim() || isGerando}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isGerando ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Gerando Kit Bento IA...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Gerar Kit de Estudos com Bento IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sugestões de Tópicos do ENEM */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🔥</span> Mais Cobrados no ENEM
        </h3>
        <div className="flex flex-wrap gap-2">
          {sugestoes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTopico(item);
                handleGerarKit(item);
              }}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-indigo-300 px-3 py-1.5 rounded-full border border-slate-700/50 transition-all cursor-pointer hover:border-amber-500/50 flex items-center gap-1"
            >
              <span>+</span>
              <span>{item}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RESULTADO GERADO (BENTO GRID DO KIT DE ESTUDOS) */}
      {kitGerado && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Kit de Estudos Gerado</span>
                <h3 className="text-base font-bold text-white">{kitGerado.topico}</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopiarKit}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Kit'}</span>
            </button>
          </div>

          {/* 1. RESUMO DIRETO (MÁXIMO 3 FRASES) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📌</span> Resumo Direto (Visão Rápida)
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">{kitGerado.resumo}</p>
          </div>

          {/* 2. 4 PONTOS PRINCIPAIS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🎯</span> 4 Pontos Principais para o ENEM
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {kitGerado.pontosPrincipais.map((ponto, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <p className="text-slate-300 leading-relaxed">{ponto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 3 PERGUNTAS DE TESTE COM GABARITO COMENTADO */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>✍️</span> 3 Perguntas de Teste & Fixação
            </h4>
            <div className="space-y-4">
              {kitGerado.perguntas.map((q, qIndex) => {
                const foiRespondida = respostasUsuario[qIndex] !== undefined;
                const acertou = respostasUsuario[qIndex] === q.respostaCorreta;

                return (
                  <div key={qIndex} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs space-y-2.5">
                    <p className="font-semibold text-slate-200 leading-relaxed">
                      <span className="text-amber-400 font-bold mr-1.5">Q{qIndex + 1}.</span>
                      {q.pergunta}
                    </p>

                    {/* OPÇÕES */}
                    <div className="space-y-1.5">
                      {q.opcoes.map((opcao, optIndex) => {
                        const isSelected = respostasUsuario[qIndex] === optIndex;
                        const isCorreta = optIndex === q.respostaCorreta;

                        let styleClass = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80';
                        if (foiRespondida) {
                          if (isCorreta) {
                            styleClass = 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-medium';
                          } else if (isSelected && !isCorreta) {
                            styleClass = 'bg-rose-950/40 border-rose-600 text-rose-200';
                          } else {
                            styleClass = 'bg-slate-900/40 border-slate-800/50 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => {
                              if (!foiRespondida) {
                                setRespostasUsuario((prev) => ({ ...prev, [qIndex]: optIndex }));
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 cursor-pointer ${styleClass}`}
                          >
                            <span className="font-bold text-[11px] opacity-70 shrink-0">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            <span className="leading-snug">{opcao}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* GABARITO COMENTADO */}
                    {foiRespondida && (
                      <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed mt-2 ${
                        acertou ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                      }`}>
                        <div className="font-bold mb-1 flex items-center gap-1">
                          {acertou ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{acertou ? 'Parabéns, você acertou!' : 'Comentário & Explicação do Gabarito:'}</span>
                        </div>
                        <p>{q.gabaritoComentado}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. 2 FLASHCARDS INTERATIVOS (FRENTE / VERSO) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 2 Flashcards Rápidos
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Toque no card para virar</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kitGerado.flashcards.map((fc, fcIdx) => {
                const isFlipped = !!flashcardFlipped[fcIdx];

                return (
                  <div
                    key={fcIdx}
                    onClick={() => setFlashcardFlipped((prev) => ({ ...prev, [fcIdx]: !prev[fcIdx] }))}
                    className={`min-h-[140px] p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                      isFlipped
                        ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-500/50 shadow-indigo-500/10'
                        : 'bg-slate-950 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFlipped ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {isFlipped ? 'VERSO (RESPOSTA)' : 'FRENTE (PERGUNTA)'}
                        </span>
                        <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <p className="text-xs text-slate-100 font-medium leading-relaxed">
                        {isFlipped ? fc.verso : fc.frente}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-2 flex items-center gap-1">
                      <span>Clique para ver {isFlipped ? 'a pergunta' : 'o verso'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ConteudosBentoIA };
