import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DIGITAL_LIBRARY_BOOKS,
  DigitalBook,
  QuizQuestion,
  CapituloItem,
  PersonagemOuTema
} from '../data/digitalLibraryCatalog';
import {
  BookOpen,
  Search,
  Sparkles,
  Zap,
  Layers,
  Users,
  MessageSquare,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  Sliders,
  Type,
  Sun,
  Moon,
  BookMarked,
  Quote,
  ChevronRight,
  Bookmark,
  Check,
  Brain,
  X,
  HelpCircle,
  Eye
} from 'lucide-react';

interface DigitalLibrarySectionProps {
  onQuoteToEssay?: (quote: string) => void;
}

export const DigitalLibrarySection: React.FC<DigitalLibrarySectionProps> = ({ onQuoteToEssay }) => {
  // Navigation & Filtering State
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBook, setActiveBook] = useState<DigitalBook | null>(null);

  // Active Tab inside Book Detail View
  const [innerTab, setInnerTab] = useState<'resumo' | 'capitulos' | 'personagens' | 'chat' | 'quiz'>('resumo');

  // Reader Settings State
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [readerTheme, setReaderTheme] = useState<'escuro' | 'claro' | 'sepia'>('escuro');

  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Interactive Book Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ia'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Filter books list
  const filteredBooks = DIGITAL_LIBRARY_BOOKS.filter((book) => {
    const matchesCat =
      selectedCategory === 'todas' ||
      (selectedCategory === 'literatura' && book.categoria === 'literatura') ||
      (selectedCategory === 'historia' && book.categoria === 'historia') ||
      (selectedCategory === 'geografia' && book.categoria === 'geografia');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      book.titulo.toLowerCase().includes(q) ||
      book.autor.toLowerCase().includes(q) ||
      book.disciplina.toLowerCase().includes(q) ||
      book.resumoExpresso.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  // Handle opening a book modal
  const handleOpenBook = (book: DigitalBook) => {
    setActiveBook(book);
    setInnerTab('resumo');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setChatMessages([
      {
        sender: 'ia',
        text: `Olá! Sou o assistente especialista na obra "${book.titulo}". Faça qualquer pergunta sobre o enredo, contexto histórico, personagens ou como citar este livro na sua Redação!`
      }
    ]);
  };

  // Handle Chat submit
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !activeBook) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Contexto do livro/fichamento "${activeBook.titulo}" por ${activeBook.autor}: ${activeBook.faqIAContexto}. Pergunta do aluno: ${userText}`,
          history: []
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { sender: 'ia', text: data.reply || 'Desculpe, tente reformular sua dúvida.' }]);
      } else {
        // Fallback response if offline
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ia',
            text: `Excelente pergunta! Na obra "${activeBook.titulo}", esse ponto demonstra a visão do autor (${activeBook.autor}) sobre a sociedade de sua época. Recomendo analisar este conceito no resumo e nos capítulos chave.`
          }
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: `Na obra "${activeBook.titulo}", a visão de ${activeBook.autor} destaca os conflitos e temas centrais cobrados em provas do ENEM e vestibulares.`
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Calculate Quiz Score
  const getQuizScore = () => {
    if (!activeBook) return { correct: 0, total: 0, percent: 0 };
    let correct = 0;
    activeBook.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.respostaCorreta) correct += 1;
    });
    const total = activeBook.quiz.length;
    return { correct, total, percent: Math.round((correct / total) * 100) };
  };

  // Font size CSS class helper
  const getFontSizeClass = () => {
    if (fontSize === 'sm') return 'text-xs leading-relaxed';
    if (fontSize === 'lg') return 'text-base leading-loose';
    return 'text-sm leading-relaxed';
  };

  // Theme CSS class helper
  const getThemeContainerClass = () => {
    if (readerTheme === 'claro') return 'bg-slate-50 text-slate-900 border-slate-300';
    if (readerTheme === 'sepia') return 'bg-[#fbf0d9] text-[#433422] border-[#e6d3b3]';
    return 'bg-slate-950 text-slate-100 border-purple-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-purple-500/30 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <BookMarked className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Estante de Leitura Obrigatória
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                Biblioteca Digital GabaritaAí
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Biblioteca Digital & Fichamentos
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-md font-medium">
          Acesse análises completas, resumos expressos de 3 minutos, análises de capítulos, perguntas para IA e quizzes das obras do ENEM, Fuvest e Unicamp.
        </p>
      </div>

      {/* Bar de Pesquisa & Filtros de Categoria */}
      <div className="bg-slate-900 border border-purple-500/20 rounded-3xl p-5 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por livro, autor, disciplina ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categorias Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
          {[
            { id: 'todas', label: 'Todas as Obras' },
            { id: 'literatura', label: '📚 Literatura & Português' },
            { id: 'historia', label: '📜 História do Brasil' },
            { id: 'geografia', label: '🌐 Geografia & Geopolítica' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ESTANTE VISUAL DE LIVROS / CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleOpenBook(book)}
            className="bg-slate-900 border border-purple-500/20 rounded-3xl p-5 text-white shadow-xl hover:border-amber-500/50 cursor-pointer flex flex-col justify-between space-y-4 group transition relative overflow-hidden"
          >
            {/* Capa com Gradiente */}
            <div className={`h-48 rounded-2xl bg-gradient-to-br ${book.capaGradient} p-5 flex flex-col justify-between relative shadow-inner overflow-hidden border border-white/10`}>
              {/* Vestibulares Tags */}
              <div className="flex items-center space-x-1.5 z-10">
                {book.vestibularesTag.map((tag) => (
                  <span
                    key={tag}
                    className="bg-black/60 text-amber-300 font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-amber-400/30 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Ícone Gigante em Marca d'água */}
              <div className="absolute right-2 bottom-2 text-7xl opacity-20 select-none">
                {book.capaIcone}
              </div>

              {/* Título na Capa */}
              <div className="space-y-1 z-10">
                <span className="text-[10px] font-bold text-amber-200/80 uppercase tracking-wider block">
                  {book.anoOuEpoca}
                </span>
                <h3 className="text-lg font-black text-white leading-snug drop-shadow-md group-hover:text-amber-300 transition">
                  {book.titulo}
                </h3>
                <p className="text-xs font-semibold text-slate-200 opacity-90 line-clamp-1">
                  por {book.autor}
                </p>
              </div>
            </div>

            {/* Informações Resumidas do Card */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
                {book.disciplina}
              </span>
              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                {book.resumoExpresso}
              </p>
            </div>

            {/* Botão de Ação */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-black text-amber-400">
              <span>Acessar Fichamento Completo</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </motion.div>
        ))}

        {filteredBooks.length === 0 && (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum livro encontrado</h3>
            <p className="text-xs">Tente buscar por outros termos ou selecione uma categoria diferente.</p>
          </div>
        )}
      </div>

      {/* LEITOR DO LIVRO / FICHAMENTO COMPLETO (MODAL FULLSCREEN SLIDE) */}
      <AnimatePresence>
        {activeBook && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`w-full max-w-5xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto ${getThemeContainerClass()}`}
            >
              {/* Header do Leitor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center space-x-3.5">
                  <div className="text-4xl">{activeBook.capaIcone}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                        {activeBook.disciplina} • {activeBook.anoOuEpoca}
                      </span>
                      {activeBook.vestibularesTag.map((t) => (
                        <span key={t} className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black">{activeBook.titulo}</h2>
                    <p className="text-xs font-semibold opacity-80">Por {activeBook.autor}</p>
                  </div>
                </div>

                {/* Opções do Leitor & Botão Fechar */}
                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {/* Tamanho da Fonte */}
                  <div className="flex items-center space-x-1 bg-black/30 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setFontSize('sm')}
                      className={`px-2 py-1 text-[10px] font-black rounded ${fontSize === 'sm' ? 'bg-amber-500 text-slate-950' : 'opacity-60'}`}
                      title="Fonte Pequena"
                    >
                      P
                    </button>
                    <button
                      onClick={() => setFontSize('md')}
                      className={`px-2 py-1 text-[10px] font-black rounded ${fontSize === 'md' ? 'bg-amber-500 text-slate-950' : 'opacity-60'}`}
                      title="Fonte Média"
                    >
                      M
                    </button>
                    <button
                      onClick={() => setFontSize('lg')}
                      className={`px-2 py-1 text-[10px] font-black rounded ${fontSize === 'lg' ? 'bg-amber-500 text-slate-950' : 'opacity-60'}`}
                      title="Fonte Grande"
                    >
                      G
                    </button>
                  </div>

                  {/* Modo de Leitura (Escuro, Claro, Sépia) */}
                  <div className="flex items-center space-x-1 bg-black/30 p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setReaderTheme('escuro')}
                      className={`px-2 py-1 text-[10px] font-black rounded ${readerTheme === 'escuro' ? 'bg-amber-500 text-slate-950' : 'opacity-60'}`}
                      title="Modo Escuro"
                    >
                      🌙 Escuro
                    </button>
                    <button
                      onClick={() => setReaderTheme('claro')}
                      className={`px-2 py-1 text-[10px] font-black rounded ${readerTheme === 'claro' ? 'bg-amber-500 text-slate-950' : 'opacity-60'}`}
                      title="Modo Claro"
                    >
                      ☀️ Claro
                    </button>
                    <button
                      onClick={() => setReaderTheme('sepia')}
                      className={`px-2 py-1 text-[10px] font-black rounded ${readerTheme === 'sepia' ? 'bg-amber-500 text-slate-950' : 'opacity-60'}`}
                      title="Modo Sépia"
                    >
                      📜 Sépia
                    </button>
                  </div>

                  {/* Fechar Modal */}
                  <button
                    onClick={() => setActiveBook(null)}
                    className="p-2 rounded-xl bg-black/40 hover:bg-rose-600 text-white transition cursor-pointer border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ABAS INTERNAS DE CONTEÚDO */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
                {[
                  { id: 'resumo', label: '⚡ Resumo Expresso (3 min)', icon: Zap },
                  { id: 'capitulos', label: '📖 Capítulo por Capítulo', icon: Layers },
                  { id: 'personagens', label: '👥 Personagens & Temas', icon: Users },
                  { id: 'chat', label: '💬 Pergunte ao Livro (IA)', icon: MessageSquare },
                  { id: 'quiz', label: '📝 Quiz do Livro', icon: Award }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = innerTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInnerTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-black/30 hover:bg-black/50 opacity-80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CONTEÚDO DA ABA SELECIONADA */}
              <div className="py-2">
                {/* 1. RESUMO EXPRESSO */}
                {innerTab === 'resumo' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-amber-400">
                          Visão Geral da Obra em 3 Minutos
                        </h4>
                        <p className="text-xs opacity-90 font-medium">
                          {activeBook.subtitulo}
                        </p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl bg-black/20 border border-white/10 ${getFontSizeClass()}`}>
                      <p className="whitespace-pre-line font-medium leading-relaxed">
                        {activeBook.resumoExpresso}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2. CAPÍTULO POR CAPÍTULO */}
                {innerTab === 'capitulos' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {activeBook.capituloPorCapitulo.map((cap, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-amber-400">
                            {cap.capitulo}
                          </h4>
                          <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                            Seção {idx + 1}
                          </span>
                        </div>

                        <p className={`opacity-90 ${getFontSizeClass()}`}>
                          {cap.resumo}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                          <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">
                            Pontos Mais Cobrados:
                          </span>
                          {cap.pontosChave.map((pt, pIdx) => (
                            <span
                              key={pIdx}
                              className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30"
                            >
                              ✓ {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* 3. PERSONAGENS & TEMAS */}
                {innerTab === 'personagens' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeBook.personagensETemas.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                              {p.papel}
                            </span>
                            <h4 className="text-base font-black">{p.nome}</h4>
                            <p className="text-xs opacity-90 font-medium">{p.descricao}</p>
                          </div>

                          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                              <Quote className="w-3 h-3" />
                              <span>Como usar na Redação do ENEM:</span>
                            </span>
                            <p className="text-xs font-semibold text-slate-200">
                              "{p.citacaoRedacao}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 4. PERGUNTE AO LIVRO (IA) */}
                {innerTab === 'chat' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="h-80 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto space-y-3">
                      {chatMessages.map((msg, mIdx) => (
                        <div
                          key={mIdx}
                          className={`flex ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xl p-3.5 rounded-2xl text-xs font-semibold leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-900 border border-purple-500/30 text-white'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-900 border border-purple-500/30 text-amber-300 p-3 rounded-2xl text-xs font-bold animate-pulse flex items-center space-x-2">
                            <Brain className="w-4 h-4 animate-spin" />
                            <span>Analisando a obra "{activeBook.titulo}"...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Tire qualquer dúvida sobre "${activeBook.titulo}"...`}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSendChatMessage}
                        disabled={isChatLoading}
                        className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center space-x-1"
                      >
                        <Send className="w-4 h-4" />
                        <span>Perguntar</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 5. QUIZ DO LIVRO */}
                {innerTab === 'quiz' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center justify-between bg-black/30 p-4 rounded-2xl border border-white/10">
                      <div>
                        <h4 className="text-sm font-black text-amber-400">
                          Quiz Rápido de Fixação (5 Perguntas)
                        </h4>
                        <p className="text-xs opacity-80">
                          Teste se você absorveu os detalhes mais cobrados nos vestibulares.
                        </p>
                      </div>

                      {quizSubmitted && (
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-400">
                            {getQuizScore().correct} / {getQuizScore().total}
                          </span>
                          <span className="text-xs block opacity-80 font-bold">
                            ({getQuizScore().percent}% de Acertos)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quiz Questions List */}
                    <div className="space-y-5">
                      {activeBook.quiz.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3"
                        >
                          <h5 className="text-xs font-black text-white flex items-start gap-2">
                            <span className="bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded text-[10px] shrink-0">
                              Q{qIdx + 1}
                            </span>
                            <span>{q.pergunta}</span>
                          </h5>

                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {q.opcoes.map((opt, oIdx) => {
                              const isSelected = quizAnswers[qIdx] === oIdx;
                              const isCorrect = q.respostaCorreta === oIdx;

                              let btnStyle = 'bg-black/40 border-white/10 hover:border-amber-400/50';
                              if (quizSubmitted) {
                                if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                                else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                              } else if (isSelected) {
                                btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => {
                                    if (!quizSubmitted) {
                                      setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx });
                                    }
                                  }}
                                  className={`p-3 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                  {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation if submitted */}
                          {quizSubmitted && (
                            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 font-medium">
                              <strong className="text-amber-400 block mb-0.5">💡 Explicação:</strong>
                              {q.explicacao}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quiz Submit Bar */}
                    <div className="flex items-center justify-between pt-2">
                      {!quizSubmitted ? (
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          disabled={Object.keys(quizAnswers).length < activeBook.quiz.length}
                          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg ${
                            Object.keys(quizAnswers).length === activeBook.quiz.length
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Corrigir e Ver Resultado
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setQuizAnswers({});
                            setQuizSubmitted(false);
                          }}
                          className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Refazer Quiz</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
