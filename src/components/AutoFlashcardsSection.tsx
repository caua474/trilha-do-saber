import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  BookOpen,
  Layers,
  Plus,
  CheckCircle2,
  RotateCw,
  Upload,
  Image as ImageIcon,
  Check,
  Clock,
  Flame,
  Brain,
  Filter,
  Calculator,
  Atom,
  Globe2,
  PenTool,
  Bookmark
} from 'lucide-react';
import { generateAutoFlashcards } from '../services/geminiService';

export interface SrsFlashcard {
  id: string;
  materia: 'Matemática' | 'Natureza' | 'Humanas' | 'Linguagens' | 'Redação';
  topico: string;
  frente: string;
  verso: string;
  nivel: 'Fácil' | 'Médio' | 'Difícil';
  caixa: 1 | 2 | 3 | 4; // 1 = Hoje, 2 = 3 dias, 3 = 7 dias, 4 = Dominado
  diasParaProxima: number;
}

const PRESET_SRS_FLASHCARDS: SrsFlashcard[] = [
  // Matemática
  {
    id: 'mat-1',
    materia: 'Matemática',
    topico: 'Geometria Espacial',
    frente: 'Como calcular o volume de uma Esfera e de um Cilindro?',
    verso: '• Esfera: V = (4/3) · π · r³\n• Cilindro: V = Ab · h = π · r² · h\nDica ENEM: O cilindro reto e a esfera são as figuras mais recorrentes.',
    nivel: 'Médio',
    caixa: 2,
    diasParaProxima: 3,
  },
  {
    id: 'mat-2',
    materia: 'Matemática',
    topico: 'Funções & Parábolas',
    frente: 'Quais são as coordenadas do Vértice da Parábola y = ax² + bx + c e o que indicam?',
    verso: 'Xv = -b / (2a) (tempo ou quantidade ótima)\nYv = -Δ / (4a) (valor máximo se a < 0 ou mínimo se a > 0)\nDica ENEM: Toda questão de lucro máximo ou altura máxima usa Yv!',
    nivel: 'Fácil',
    caixa: 3,
    diasParaProxima: 7,
  },
  {
    id: 'mat-3',
    materia: 'Matemática',
    topico: 'Estatística',
    frente: 'Qual a diferença entre Média, Mediana e Moda?',
    verso: '• Média: Soma dos valores dividida pelo total.\n• Mediana: Valor central após colocar os dados em rol (ordem crescente). Se for par, faz a média dos 2 do meio.\n• Moda: O valor mais frequente.',
    nivel: 'Fácil',
    caixa: 4,
    diasParaProxima: 14,
  },

  // Ciências da Natureza
  {
    id: 'nat-1',
    materia: 'Natureza',
    topico: 'Física - Ondulatória',
    frente: 'O que é o Efeito Doppler e qual a sua Equação Fundamental da Onda?',
    verso: '• Equação: v = λ · f (velocidade = comprimento de onda × frequência).\n• Efeito Doppler: Variação aparente da frequência quando a fonte e o observador estão em movimento relativo (aproximação = mais agudo; afastamento = mais grave).',
    nivel: 'Médio',
    caixa: 1,
    diasParaProxima: 0,
  },
  {
    id: 'nat-2',
    materia: 'Natureza',
    topico: 'Química - Equilíbrio',
    frente: 'Como o Princípio de Le Chatelier reage a variações de Pressão e Temperatura?',
    verso: '• Pressão: Aumentar a pressão desloca para o lado de MENOR volume gasoso (menos mols).\n• Temperatura: Aumentar a temperatura favorece a reação ENDOTÉRMICA (absorve calor).',
    nivel: 'Difícil',
    caixa: 2,
    diasParaProxima: 3,
  },
  {
    id: 'nat-3',
    materia: 'Natureza',
    topico: 'Biologia - Ecologia',
    frente: 'O que é Bioacumulação (Magnificação Trófica)?',
    verso: 'É o acúmulo progressivo de substâncias tóxicas não biodegradáveis (ex: mercúrio, DDT) ao longo dos níveis da cadeia alimentar. O topo da cadeia (ex: predador final ou ser humano) sofre a MAIOR concentração.',
    nivel: 'Fácil',
    caixa: 4,
    diasParaProxima: 14,
  },

  // Ciências Humanas
  {
    id: 'hum-1',
    materia: 'Humanas',
    topico: 'História do Brasil',
    frente: 'Quais as marcas da Era Vargas (1930–1945) mais cobradas no ENEM?',
    verso: '• Consolidação das Leis do Trabalho (CLT) e propaganda do trabalhismo.\n• Estado Novo (1937–45): Ditadura com censura (DIP) e forte industrialização de base (CSN, Vale).\n• Voto secreto e feminino instituídos em 1932.',
    nivel: 'Médio',
    caixa: 3,
    diasParaProxima: 7,
  },
  {
    id: 'hum-2',
    materia: 'Humanas',
    topico: 'Filosofia & Política',
    frente: 'Qual a diferença central do Contrato Social entre Hobbes, Locke e Rousseau?',
    verso: '• Hobbes: O homem é o lobo do homem; necessita de um Estado absolutista (Leviatã) para manter a ordem.\n• Locke: Direitos naturais inalienáveis (vida, liberdade, propriedade); Estado liberal limitado.\n• Rousseau: O homem nasce bom, a sociedade o corrompe; soberania da vontade geral.',
    nivel: 'Médio',
    caixa: 2,
    diasParaProxima: 3,
  },

  // Linguagens
  {
    id: 'ling-1',
    materia: 'Linguagens',
    topico: 'Figuras de Linguagem',
    frente: 'Qual a distinção entre Metonímia, Metáfora e Sinestesia?',
    verso: '• Metáfora: Comparação implícita direta ("seus olhos são faróis").\n• Metonímia: Substituição lógica da parte pelo todo ou autor pela obra ("leu Machado de Assis").\n• Sinestesia: Cruzamento de sentidos sensoriais ("voz doce", "olhar gélido").',
    nivel: 'Fácil',
    caixa: 3,
    diasParaProxima: 7,
  },
  {
    id: 'ling-2',
    materia: 'Linguagens',
    topico: 'Funções da Linguagem',
    frente: 'O que define a Função Conativa (ou Apelativa) e a Função Metalinguística?',
    verso: '• Conativa/Apelativa: Foco no receptor com verbos no imperativo para persuadir (propaganda, sermão).\n• Metalinguística: O código explicando o próprio código (dicionário, poema sobre o ato de escrever).',
    nivel: 'Fácil',
    caixa: 4,
    diasParaProxima: 14,
  },

  // Redação ENEM
  {
    id: 'red-1',
    materia: 'Redação',
    topico: 'Competência 4 - Coesão Interparágrafo',
    frente: 'Quais conectivos interparágrafos garantem nota máxima na C4?',
    verso: '• D1: "Em primeira análise...", "Nesse contexto primordial...", "De início..."\n• D2: "Ademais...", "Outrossim...", "Paralelamente a isso..."\n• Proposta: "Portanto...", "Infere-se, dessarte...", "Urge, por conseguinte..."\nRegra de Ouro: Sempre iniciar D1, D2 e Conclusão com conectivo com vírgula!',
    nivel: 'Médio',
    caixa: 3,
    diasParaProxima: 7,
  },
  {
    id: 'red-2',
    materia: 'Redação',
    topico: 'Competência 2 - Repertório Curinga',
    frente: 'Como articular o conceito de "Modernidade Líquida" de Zygmunt Bauman?',
    verso: 'Bauman argumenta que na contemporaneidade as relações, valores e compromissos institucionais perderam a solidez, tornando-se voláteis e individualistas. Aplica-se perfeitamente a temas de consumo, saúde mental, isolamento digital e descarte acelerado.',
    nivel: 'Médio',
    caixa: 4,
    diasParaProxima: 14,
  },
];

const DISCIPLINAS = [
  { id: 'Todas', nome: 'Todas as Disciplinas', icon: Layers, cor: 'from-slate-700 to-indigo-800' },
  { id: 'Matemática', nome: 'Matemática', icon: Calculator, cor: 'from-blue-600 to-cyan-700' },
  { id: 'Natureza', nome: 'Ciências da Natureza', icon: Atom, cor: 'from-emerald-600 to-teal-700' },
  { id: 'Humanas', nome: 'Ciências Humanas', icon: Globe2, cor: 'from-amber-600 to-orange-700' },
  { id: 'Linguagens', nome: 'Linguagens e Códigos', icon: BookOpen, cor: 'from-purple-600 to-indigo-700' },
  { id: 'Redação', nome: 'Redação Nota 1000', icon: PenTool, cor: 'from-rose-600 to-pink-700' },
];

export const AutoFlashcardsSection: React.FC<{ onAddXp?: (xp: number) => void }> = ({ onAddXp }) => {
  const [activeMateria, setActiveMateria] = useState<string>('Todas');
  const [filterBox, setFilterBox] = useState<'todas' | 1 | 2 | 3 | 4>('todas');
  const [cards, setCards] = useState<SrsFlashcard[]>(() => {
    try {
      const saved = localStorage.getItem('gabaritai_srs_flashcards');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return PRESET_SRS_FLASHCARDS;
  });

  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // AI Extraction Form State
  const [texto, setTexto] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAiCreator, setShowAiCreator] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('gabaritai_srs_flashcards', JSON.stringify(cards));
    } catch (e) {
      console.error(e);
    }
  }, [cards]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRateCard = (cardId: string, novaCaixa: 1 | 2 | 3 | 4) => {
    const diasMap = { 1: 0, 2: 3, 3: 7, 4: 14 };
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              caixa: novaCaixa,
              diasParaProxima: diasMap[novaCaixa],
            }
          : c
      )
    );
    setFlippedCardId(null);
    if (onAddXp) onAddXp(novaCaixa === 4 ? 20 : 10);
  };

  const handleGenerateFlashcards = async () => {
    if ((!texto.trim() && !selectedImage) || isLoading) return;
    setIsLoading(true);

    try {
      const materiaTarget = activeMateria === 'Todas' ? 'Matemática' : activeMateria;
      const data = await generateAutoFlashcards({
        texto: texto.trim(),
        imagemBase64: selectedImage,
        materia: materiaTarget,
      });

      const flashcardsList = data?.data?.flashcards || data?.flashcards;
      if (Array.isArray(flashcardsList) && flashcardsList.length) {
        const novosCards: SrsFlashcard[] = flashcardsList.map((fc: any, i: number) => ({
          id: `custom-${Date.now()}-${i}`,
          materia: (materiaTarget as any) || 'Matemática',
          topico: 'Extração Personalizada',
          frente: fc.frente,
          verso: fc.verso,
          nivel: fc.nivel || 'Médio',
          caixa: 1,
          diasParaProxima: 0,
        }));

        setCards((prev) => [...novosCards, ...prev]);
        setTexto('');
        setSelectedImage(null);
        setShowAiCreator(false);
        if (onAddXp) onAddXp(60);
      }
    } catch (e) {
      console.error('Erro ao gerar flashcards:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtragem dos cards
  const filteredCards = cards.filter((c) => {
    const matchMateria = activeMateria === 'Todas' || c.materia === activeMateria;
    const matchBox = filterBox === 'todas' || c.caixa === filterBox;
    return matchMateria && matchBox;
  });

  // Estatísticas SRS Leitner
  const totalCards = cards.length;
  const cardsParaRevisarHoje = cards.filter((c) => c.caixa === 1).length;
  const cardsDominados = cards.filter((c) => c.caixa === 4).length;
  const taxaDominio = totalCards > 0 ? Math.round((cardsDominados / totalCards) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER SRS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-indigo-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Brain className="w-3.5 h-3.5" /> Método Científico Leitner (SRS)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              🧠 Flashcards de Revisão Espaçada por Disciplina
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Memorize conceitos essenciais sem esquecer. O algoritmo de repetição espaçada agenda cada tópico no momento exato antes da curva de esquecimento cerebral.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAiCreator(!showAiCreator)}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{showAiCreator ? 'Fechar Criador IA' : '+ Criar Flashcards com IA / Foto'}</span>
          </button>
        </div>

        {/* METRICS BAR SRS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 mt-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Revisar Hoje (Caixa 1)</span>
                <span className="text-base font-black text-white">{cardsParaRevisarHoje} cartões</span>
              </div>
            </div>
            <button
              onClick={() => setFilterBox(filterBox === 1 ? 'todas' : 1)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                filterBox === 1 ? 'bg-rose-500 text-white border-rose-400' : 'text-slate-300 border-white/20 hover:bg-white/10'
              }`}
            >
              Filtrar
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Em Consolidação (2 e 3)</span>
                <span className="text-base font-black text-white">{totalCards - cardsParaRevisarHoje - cardsDominados} cartões</span>
              </div>
            </div>
            <button
              onClick={() => setFilterBox(filterBox === 2 ? 'todas' : 2)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                filterBox === 2 ? 'bg-amber-500 text-slate-950 border-amber-400' : 'text-slate-300 border-white/20 hover:bg-white/10'
              }`}
            >
              Filtrar
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dominados (Caixa 4)</span>
                <span className="text-base font-black text-emerald-400">{cardsDominados} ({taxaDominio}%)</span>
              </div>
            </div>
            <button
              onClick={() => setFilterBox(filterBox === 4 ? 'todas' : 4)}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                filterBox === 4 ? 'bg-emerald-500 text-white border-emerald-400' : 'text-slate-300 border-white/20 hover:bg-white/10'
              }`}
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* SELETOR DE DISCIPLINAS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DISCIPLINAS.map((disc) => {
          const Icon = disc.icon;
          const isSelected = activeMateria === disc.id;
          const count = disc.id === 'Todas' ? cards.length : cards.filter((c) => c.materia === disc.id).length;

          return (
            <button
              key={disc.id}
              onClick={() => setActiveMateria(disc.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{disc.nome}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI CREATOR ACCORDION */}
      {showAiCreator && (
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Extrair Novos Flashcards com IA da Professora Gabi
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cole anotações ou tire foto da apostila para a disciplina <strong>{activeMateria}</strong>
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-extrabold hover:bg-purple-100 transition cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>{selectedImage ? 'Foto Carregada ✓ (Trocar)' : 'Tirar Foto da Apostila 📷'}</span>
            </button>
          </div>

          {selectedImage && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedImage} alt="Foto" className="w-12 h-12 object-cover rounded-xl border border-purple-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Foto pronta para leitura e extração de conceitos!
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                Remover
              </button>
            </div>
          )}

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder="Ou digite/cole aqui um resumo, capítulo de livro ou fórmula para gerar o baralho..."
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
          />

          <button
            onClick={handleGenerateFlashcards}
            disabled={isLoading || (!texto.trim() && !selectedImage)}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Professora Gabi está gerando os Flashcards...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Gerar e Agendar no Sistema Espaçado (+60 XP)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* FLASHCARDS LIST DISPLAY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-600" />
            {activeMateria} ({filteredCards.length} Flashcards no baralho)
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Toque no cartão para girar • Avalie no verso para agendar
          </span>
        </div>

        {filteredCards.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
              🎉
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Nenhum flashcard pendente nesta categoria!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Você já revisou todos os cartões deste filtro ou pode criar novos clicando em "+ Criar Flashcards com IA / Foto".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const isFlipped = flippedCardId === card.id;

              return (
                <div
                  key={card.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-400 transition min-h-[220px] flex flex-col justify-between"
                >
                  {/* Card Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 rounded-md">
                        {card.materia}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        • {card.topico}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        card.caixa === 1
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                          : card.caixa === 2
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                          : card.caixa === 3
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                      }`}>
                        Caixa {card.caixa} ({card.diasParaProxima === 0 ? 'Hoje' : `em ${card.diasParaProxima}d`})
                      </span>
                      <button
                        type="button"
                        onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                        title="Girar Cartão"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content (Frente ou Verso) */}
                  <div
                    onClick={() => setFlippedCardId(isFlipped ? null : card.id)}
                    className="cursor-pointer space-y-2 py-2"
                  >
                    {!isFlipped ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                          🎯 FRENTE (CONCEITO / PERGUNTA):
                        </span>
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                          {card.frente}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 animate-in fade-in">
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 block">
                          💡 VERSO (RESPOSTA COMPLETA & DICA):
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 leading-relaxed whitespace-pre-line">
                          {card.verso}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Leitner Rating Actions if flipped, or Flip prompt */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {!isFlipped ? (
                      <button
                        type="button"
                        onClick={() => setFlippedCardId(card.id)}
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Girar e Ver Resposta</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">
                          Como foi a sua lembrança?
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRateCard(card.id, 1)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px] font-bold transition flex flex-col items-center cursor-pointer"
                            title="Volta para a Caixa 1 (Rever Hoje)"
                          >
                            <span>🔴 Esqueci</span>
                            <span className="text-[9px] opacity-80">Rever Hoje</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRateCard(card.id, 2)}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[11px] font-bold transition flex flex-col items-center cursor-pointer"
                            title="Caixa 2 (Revisar em 3 dias)"
                          >
                            <span>🟡 Difícil</span>
                            <span className="text-[9px] opacity-80">Em 3 dias</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRateCard(card.id, 4)}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[11px] font-bold transition flex flex-col items-center cursor-pointer"
                            title="Caixa 4 (Dominado, agendar para 14 dias)"
                          >
                            <span>🟢 Dominado!</span>
                            <span className="text-[9px] opacity-80">+14 dias</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
