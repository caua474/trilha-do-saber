import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  WifiOff,
  HardDrive,
  CheckCircle2,
  FolderOpen,
  ShieldCheck,
  Type
} from 'lucide-react';
import { StudyMaterial, Flashcard } from '../types';
import { FlashcardsDeck } from './FlashcardsDeck';
import { exportMaterialToPdf } from '../utils/pdfExport';
import { cacheSummaryInServiceWorker } from '../utils/serviceWorker';
import { saveMaterial, getAllMaterials } from '../utils/db';

interface BentoResultsProps {
  material: StudyMaterial;
  onNewText: () => void;
  onOpenFlashcardsModal: () => void;
  onSelectMaterial?: (material: StudyMaterial) => void;
}

export const BentoResults: React.FC<BentoResultsProps> = ({
  material,
  onNewText,
  onOpenFlashcardsModal,
  onSelectMaterial,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [showFlashcardsInline, setShowFlashcardsInline] = useState(true);

  // Offline Mode & Service Worker States
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [swCached, setSwCached] = useState<boolean>(false);
  const [showCacheToast, setShowCacheToast] = useState<boolean>(false);
  const [showOfflineDrawer, setShowOfflineDrawer] = useState<boolean>(false);
  const [savedMaterialsList, setSavedMaterialsList] = useState<StudyMaterial[]>([]);
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-cache material in Service Worker and IndexedDB whenever material changes
  useEffect(() => {
    if (material) {
      ensureOfflineCache(false);
    }
  }, [material.id]);

  // Load saved materials list for offline switching
  useEffect(() => {
    loadSavedMaterials();
  }, []);

  const loadSavedMaterials = async () => {
    try {
      const items = await getAllMaterials();
      setSavedMaterialsList(items);
    } catch (e) {
      console.warn('Erro ao carregar materiais do IndexedDB:', e);
    }
  };

  const ensureOfflineCache = async (userInitiated = false) => {
    try {
      // Save to IndexedDB
      await saveMaterial(material);
      // Send to Service Worker cache
      const cached = cacheSummaryInServiceWorker(material);
      setSwCached(true);

      if (userInitiated) {
        setShowCacheToast(true);
        setTimeout(() => setShowCacheToast(false), 3000);
      }
      loadSavedMaterials();
    } catch (err) {
      console.error('Erro ao salvar em cache offline:', err);
    }
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      exportMaterialToPdf(material);
    } catch (err) {
      console.error('Erro ao exportar PDF no BentoResults:', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 600);
    }
  };

  const toggleAnswer = (index: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopyAll = () => {
    const formatted = `⚡ RESUMO DIRETO:\n${material.resumoDireto}\n\n📌 PONTOS PRINCIPAIS:\n${material.pontosPrincipais
      .map((pt, i) => `${i + 1}. ${pt}`)
      .join('\n')}\n\n📝 3 PERGUNTAS DE TESTE:\n${material.perguntas
      .map((q, i) => `P${i + 1}: ${q.pergunta}\nR: ${q.resposta}`)
      .join('\n\n')}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta leitura de áudio.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToRead = `${material.resumoDireto}. Pontos principais: ${material.pontosPrincipais.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadTxt = () => {
    const formatted = `================================================
ASSISTENTE INTELIGENTE DE ESTUDOS - MATERIAL
================================================
Título: ${material.title}
Data: ${new Date(material.createdAt).toLocaleDateString('pt-BR')}
${material.focusTopic ? `Foco: ${material.focusTopic}\n` : ''}

⚡ RESUMO DIRETO:
${material.resumoDireto}

------------------------------------------------
📌 PONTOS PRINCIPAIS:
${material.pontosPrincipais.map((p, i) => `[0${i + 1}] ${p}`).join('\n\n')}

------------------------------------------------
📝 3 PERGUNTAS DE TESTE:
${material.perguntas
  .map(
    (q, i) => `Pergunta ${i + 1}: ${q.pergunta}\nResposta: ${q.resposta}`
  )
  .join('\n\n')}
================================================
`;

    const blob = new Blob([formatted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estudo_${material.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build flashcards if missing from older history items
  const activeFlashcards: Flashcard[] =
    material.flashcards && material.flashcards.length > 0
      ? material.flashcards
      : [
          ...material.perguntas.map((q) => ({ frente: q.pergunta, verso: q.resposta })),
          ...material.pontosPrincipais.map((p, idx) => ({
            frente: `Ponto Importante #${idx + 1}`,
            verso: p,
          })),
        ];

  const origWords = material.originalText.trim().split(/\s+/).length;
  const estimatedReadingTimeMin = Math.max(1, Math.round(origWords / 180));
  const timeSaved = Math.max(2, Math.round(estimatedReadingTimeMin * 0.8));

  const motivationalQuotes = [
    "\"O sucesso é a soma de pequenos esforços repetidos dia após dia.\"",
    "\"A mente que se abre a uma nova idéia jamais voltará ao seu tamanho original.\"",
    "\"Saber não é suficiente; devemos aplicar. Querer não é suficiente; devemos fazer.\"",
    "\"A melhor maneira de prever o futuro é criá-lo com estudo contínuo.\"",
  ];
  const randomQuote = motivationalQuotes[material.id.length % motivationalQuotes.length];

  return (
    <div className="space-y-6">
      {/* OFFLINE READING MODE BANNER & SERVICE WORKER STATUS */}
      <div className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-sm ${
        !isOnline
          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/50 text-amber-950 dark:text-amber-200'
          : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              !isOnline
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-emerald-600 text-white font-black'
            }`}>
              {!isOnline ? <WifiOff className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  {!isOnline ? 'Modo Leitura Offline Ativo (Service Worker)' : 'Modo Leitura Offline Habilitado'}
                </span>
                <span className="inline-flex items-center space-x-1 bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> SW + IndexedDB
                </span>
              </div>
              <p className="text-xs opacity-90 font-medium mt-0.5">
                {!isOnline
                  ? 'Você está sem conexão com a internet. Este resumo e todos os seus itens salvos continuam totalmente acessíveis offline!'
                  : 'Este resumo está automaticamente sincronizado e salvo no Service Worker para leitura offline contínua.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
            {/* Cache Button */}
            <button
              onClick={() => ensureOfflineCache(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/40 hover:border-emerald-500 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              title="Confirmar salvamento offline no Service Worker"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Garantir Cache Offline</span>
            </button>

            {/* Offline Saved Summaries Drawer Toggle */}
            <button
              onClick={() => setShowOfflineDrawer(!showOfflineDrawer)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Resumos Offline ({savedMaterialsList.length})</span>
            </button>

            {/* Font size adjuster for reader */}
            <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 space-x-1">
              <button
                onClick={() => setReaderFontSize('normal')}
                className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg transition ${
                  readerFontSize === 'normal' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-slate-500'
                }`}
                title="Tamanho de fonte normal"
              >
                A
              </button>
              <button
                onClick={() => setReaderFontSize('large')}
                className={`px-2 py-0.5 text-[11px] font-extrabold rounded-lg transition ${
                  readerFontSize === 'large' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-slate-500'
                }`}
                title="Tamanho de fonte grande"
              >
                A+
              </button>
              <button
                onClick={() => setReaderFontSize('xlarge')}
                className={`px-2 py-0.5 text-xs font-extrabold rounded-lg transition ${
                  readerFontSize === 'xlarge' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-slate-500'
                }`}
                title="Tamanho de fonte muito grande"
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* Cache Toast Feedback */}
        {showCacheToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Resumo "{material.title}" armazenado no Service Worker e pronto para leitura sem internet!
            </span>
            <span className="text-[10px] uppercase bg-emerald-700 px-2 py-0.5 rounded-md">Pronto Offline</span>
          </div>
        )}

        {/* Saved Offline Summaries Drawer Panel */}
        {showOfflineDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-indigo-500" />
                Sua Biblioteca de Resumos Salvos Offline ({savedMaterialsList.length})
              </h4>
              <button
                onClick={() => setShowOfflineDrawer(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Fechar ✕
              </button>
            </div>

            {savedMaterialsList.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium italic p-2">
                Nenhum resumo armazenado em cache ainda.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1">
                {savedMaterialsList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onSelectMaterial) {
                        onSelectMaterial(item);
                      }
                      setShowOfflineDrawer(false);
                    }}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between space-y-2 ${
                      item.id === material.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md block w-fit mb-1 ${
                        item.id === material.id ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {item.focusTopic || 'Resumo Geral'}
                      </span>
                      <h5 className="text-xs font-bold truncate">{item.title}</h5>
                    </div>
                    <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-white/20 dark:border-slate-800">
                      <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Offline
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Bar Action bar for generated material */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-900 p-4 sm:px-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
              {material.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sintetizado com sucesso • {origWords} palavras processadas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <button
            onClick={handleCopyAll}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Copiar tudo para a área de transferência"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Copiar Tudo</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            title="Baixar em formato .txt"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Baixar .TXT</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            title="Exportar resumo e pontos principais em PDF usando jsPDF para leitura offline"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isExportingPdf ? 'Gerando PDF...' : 'Exportar Resumo para PDF'}</span>
          </button>

          <button
            onClick={onNewText}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Novo Texto</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout (12 columns) */}
      <div className="grid grid-cols-12 gap-6">
        {/* CARD 1: ⚡ Resumo Direto (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                  ⚡ Resumo Direto
                </h2>
              </div>

              {/* Audio Reader Toggle */}
              <button
                onClick={handleSpeakSummary}
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isPlaying
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-transparent dark:border-indigo-800/60'
                }`}
                title="Ouvir resumo sintetizado em voz alta"
              >
                {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pausar Áudio' : 'Ouvir Resumo'}</span>
              </button>
            </div>

            <div className="bg-slate-50/60 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 mb-4">
              <p className={`font-medium leading-relaxed text-slate-800 dark:text-slate-100 transition-all ${
                readerFontSize === 'xlarge'
                  ? 'text-xl sm:text-2xl leading-loose'
                  : readerFontSize === 'large'
                  ? 'text-lg sm:text-xl leading-relaxed'
                  : 'text-base sm:text-lg leading-relaxed'
              }`}>
                {material.resumoDireto}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-medium">Máximo 3 frases diretas do tema central</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 inline-flex items-center space-x-1 cursor-pointer transition-colors"
                title="Baixar resumo e pontos principais em PDF para leitura offline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Exportando PDF...' : 'Baixar Resumo (PDF)'}</span>
              </button>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Síntese Concluída
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Progresso Atual & Dica Motivadora (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-indigo-600 dark:bg-indigo-950 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-indigo-200/50 dark:shadow-none min-h-[220px] border border-transparent dark:border-indigo-800">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Progresso & Eficiência
              </h2>
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                100% Concluído
              </span>
            </div>

            <div className="flex items-baseline space-x-2 my-2">
              <p className="text-4xl font-black">~{timeSaved} min</p>
              <span className="text-xs opacity-90 font-medium">economizados no estudo</span>
            </div>
            <p className="text-xs text-indigo-100">
              Leitura focada nos 4 aspectos críticos de retenção rápida.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-indigo-200">
              Dica Motivadora:
            </p>
            <p className="text-xs italic leading-tight text-white font-medium">
              {randomQuote}
            </p>
          </div>

          {/* Decorative blur elements */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-400 rounded-full blur-[60px] opacity-40 pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-indigo-800 rounded-full blur-[60px] opacity-40 pointer-events-none" />
        </div>

        {/* CARD 3: 📌 Pontos Principais (col-span-12 lg:col-span-6) */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                📌 Pontos Principais (Para Memorizar)
              </h2>
            </div>

            <div className="space-y-4">
              {material.pontosPrincipais.map((ponto, idx) => (
                <div key={idx} className="flex space-x-3.5 items-start">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                    0{idx + 1}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium pt-1">
                    {ponto}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>4 pilares fundamentais mapeados</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Foco na Retenção</span>
          </div>
        </div>

        {/* CARD 4: 📝 3 Perguntas de Teste (col-span-12 lg:col-span-6) */}
        <div className="col-span-12 lg:col-span-6 bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  📝 3 Perguntas de Teste Prático
                </h2>
              </div>

              <button
                onClick={onOpenFlashcardsModal}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold transition-colors border border-amber-200/60 dark:border-amber-800/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Modal Interativo</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {material.perguntas.map((q, idx) => {
                const isRevealed = !!revealedAnswers[idx];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isRevealed
                        ? 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/80'
                        : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                        {idx + 1}. {q.pergunta}
                      </p>
                      <button
                        onClick={() => toggleAnswer(idx)}
                        className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors inline-flex items-center space-x-1 ${
                          isRevealed
                            ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Ocultar</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Ver Resposta</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isRevealed && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-xs font-medium text-amber-900 dark:text-amber-200 leading-relaxed bg-white/60 dark:bg-slate-900/80 p-2.5 rounded-xl">
                        <span className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block text-[10px] mb-0.5">
                          Gabarito:
                        </span>
                        {q.resposta}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Teste de autoavaliação imediata</span>
            <button
              onClick={onOpenFlashcardsModal}
              className="bg-slate-900 dark:bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors inline-flex items-center space-x-1"
            >
              <span>Testar em Flashcards</span>
            </button>
          </div>
        </div>
      </div>

      {/* FLASHCARDS INTERATIVOS (DECK EMBEDDED) */}
      <div className="pt-2">
        <FlashcardsDeck flashcards={activeFlashcards} title={material.title} />
      </div>
    </div>
  );
};
