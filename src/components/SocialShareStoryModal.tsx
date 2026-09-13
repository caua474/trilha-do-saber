import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Sparkles,
  Download,
  Copy,
  Check,
  Award,
  Flame,
  Trophy,
  PenTool,
  Rocket,
  Zap,
  Star
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface SocialShareStoryModalProps {
  type: 'redacao' | 'mascote' | 'streak' | 'quiz';
  data: {
    score?: number; // e.g., 960 for redacao
    mascotName?: string; // e.g., "Gabaritão"
    mascotLevel?: number; // e.g., 6
    mascotXp?: number; // e.g., 1250
    streakDays?: number; // e.g., 14
    courseTarget?: string; // e.g., "Medicina USP"
    quizScore?: number; // e.g., 3
    quizTotal?: number; // e.g., 3
    quizTopic?: string; // e.g., "Fotossíntese & Bioenergética"
    quizPercent?: number; // e.g., 100
  };
  onClose: () => void;
}

export const SocialShareStoryModal: React.FC<SocialShareStoryModalProps> = ({
  type,
  data,
  onClose
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'cyberpunk' | 'golden' | 'emerald' | 'sunset' | 'midnight'>('cyberpunk');
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getThemeClasses = () => {
    switch (selectedTheme) {
      case 'golden':
        return {
          bg: 'bg-gradient-to-b from-amber-500 via-amber-700 to-slate-950 text-white',
          badge: 'bg-amber-400 text-slate-950',
          border: 'border-amber-400/40',
          accentText: 'text-amber-300'
        };
      case 'emerald':
        return {
          bg: 'bg-gradient-to-b from-emerald-600 via-teal-800 to-slate-950 text-white',
          badge: 'bg-emerald-400 text-slate-950',
          border: 'border-emerald-400/40',
          accentText: 'text-emerald-300'
        };
      case 'sunset':
        return {
          bg: 'bg-gradient-to-b from-rose-500 via-purple-800 to-slate-950 text-white',
          badge: 'bg-rose-400 text-slate-950',
          border: 'border-rose-400/40',
          accentText: 'text-rose-300'
        };
      case 'midnight':
        return {
          bg: 'bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white',
          badge: 'bg-amber-400 text-slate-950',
          border: 'border-slate-700',
          accentText: 'text-amber-400'
        };
      default: // cyberpunk
        return {
          bg: 'bg-gradient-to-b from-indigo-600 via-purple-900 to-slate-950 text-white',
          badge: 'bg-amber-400 text-slate-950',
          border: 'border-indigo-400/40',
          accentText: 'text-amber-300'
        };
    }
  };

  const themeStyle = getThemeClasses();

  const handleCopyText = () => {
    playSuccessSound();
    let text = '';
    if (type === 'redacao') {
      text = `🔥 Tirei ${data.score || 920}/1000 na Redação ENEM treinando no GabaritaAí! 🚀 Rumo à aprovação em ${data.courseTarget || 'Medicina'}! #GabaritaAi #ENEM2026 #Redacao1000`;
    } else if (type === 'mascote') {
      text = `⭐ Meu mascote ${data.mascotName || 'Gabaritão'} atingiu o Nível ${data.mascotLevel || 5} com ${data.mascotXp || 1200} XP no GabaritaAí! Rumo ao ENEM! 🚀 #GabaritaAi #MascoteGabaritão`;
    } else if (type === 'quiz') {
      text = `⚡ Gabaritei o Quiz Rápido da Professora Gabi no GabaritaAí! 🎯 ${data.quizScore || 3}/${data.quizTotal || 3} acertos (${data.quizPercent || 100}%) no tema "${data.quizTopic || 'Revisão Rápida ENEM'}". Rumo à nota máxima no ENEM! 🚀 #GabaritaAi #ENEM2026 #ProfessoraGabi #QuizENEM`;
    } else {
      text = `🔥 Consegui ${data.streakDays || 14} Dias Seguidos de Ofensiva Diária no GabaritaAí! Foco total na aprovação! 🎓 #Streak #GabaritaAi #FocoENEM`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getShareText = () => {
    if (type === 'redacao') {
      return `🔥 Tirei ${data.score || 920}/1000 na Redação ENEM treinando no GabaritaAí! 🚀 Rumo à aprovação em ${data.courseTarget || 'Medicina'}! #GabaritaAi #ENEM2026 #Redacao1000`;
    } else if (type === 'mascote') {
      return `⭐ Meu mascote ${data.mascotName || 'Gabaritão'} atingiu o Nível ${data.mascotLevel || 5} com ${data.mascotXp || 1200} XP no GabaritaAí! Rumo ao ENEM! 🚀 #GabaritaAi #MascoteGabaritão`;
    } else if (type === 'quiz') {
      return `⚡ Gabaritei o Quiz Rápido da Professora Gabi no GabaritaAí! 🎯 ${data.quizScore || 3}/${data.quizTotal || 3} acertos (${data.quizPercent || 100}%) no tema "${data.quizTopic || 'Revisão Rápida ENEM'}". Rumo à nota máxima no ENEM! 🚀 #GabaritaAi #ENEM2026 #ProfessoraGabi #QuizENEM`;
    } else {
      return `🔥 Consegui ${data.streakDays || 14} Dias Seguidos de Ofensiva Diária no GabaritaAí! Foco total na aprovação! 🎓 #Streak #GabaritaAi #FocoENEM`;
    }
  };

  const handleShareWhatsApp = () => {
    playSuccessSound();
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    playSuccessSound();
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Desempenho no GabaritaAí',
          text: getShareText(),
          url: 'https://gabaritaai.app',
        });
        playSuccessSound();
      } catch {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  const handleDownloadCard = () => {
    playSuccessSound();
    // Simulate image creation notification or download
    alert('📸 Imagem em alta resolução para Stories gerada! Salve e compartilhe no Instagram, WhatsApp ou TikTok Stories.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl flex flex-col my-auto max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 text-slate-950 flex items-center justify-center font-black">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Card para Stories & Social</h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Compartilhe sua evolução com amigos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">Tema:</span>
          {(['cyberpunk', 'golden', 'emerald', 'sunset', 'midnight'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                playClickSound();
                setSelectedTheme(t);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black capitalize transition cursor-pointer ${
                selectedTheme === t
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* VERTICAL 9:16 STORIES CARD CONTAINER */}
        <div className="p-6 flex-1 overflow-y-auto flex items-center justify-center">
          <div
            ref={cardRef}
            className={`w-full aspect-[9/16] max-w-[280px] rounded-[2rem] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border ${themeStyle.bg} ${themeStyle.border}`}
          >
            {/* Top Brand Tag */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                  G
                </span>
                <span className="font-black text-xs tracking-wider uppercase text-white">
                  GABARITA AÍ
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${themeStyle.badge}`}>
                PRO CONQUISTA
              </span>
            </div>

            {/* Middle Main Metric Display */}
            <div className="my-auto text-center space-y-4 py-4">
              {type === 'redacao' && (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20 shadow-lg">
                    <PenTool className="w-8 h-8 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-extrabold">
                      Nota Redação ENEM
                    </span>
                    <h1 className="text-5xl font-black text-amber-300 drop-shadow-md">
                      {data.score || 960}
                    </h1>
                    <p className="text-xs text-slate-200 font-bold mt-1">
                      de 1000 Pontos Possíveis 🎯
                    </p>
                  </div>
                </>
              )}

              {type === 'mascote' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-indigo-600 mx-auto flex items-center justify-center border-2 border-white/30 shadow-xl text-3xl animate-bounce">
                    🦁
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-extrabold">
                      Evolução do Mascote
                    </span>
                    <h1 className="text-3xl font-black text-white">
                      {data.mascotName || 'Gabaritão'}
                    </h1>
                    <div className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                      Nível {data.mascotLevel || 6} • {data.mascotXp || 1450} XP
                    </div>
                  </div>
                </>
              )}

              {type === 'streak' && (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 backdrop-blur-md mx-auto flex items-center justify-center border border-amber-400/30 shadow-lg">
                    <Flame className="w-10 h-10 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-extrabold">
                      Ofensiva Diária de Estudos
                    </span>
                    <h1 className="text-5xl font-black text-amber-300">
                      {data.streakDays || 14} <span className="text-2xl">Dias</span>
                    </h1>
                    <p className="text-xs text-slate-200 font-bold mt-1">
                      🔥 Foco Imparável Rumo ao ENEM!
                    </p>
                  </div>
                </>
              )}

              {type === 'quiz' && (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 backdrop-blur-md mx-auto flex items-center justify-center border border-amber-400/30 shadow-lg">
                    <Zap className="w-9 h-9 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-extrabold">
                      Quiz da Professora Gabi
                    </span>
                    <h1 className="text-4xl font-black text-amber-300 drop-shadow-md mt-1">
                      {data.quizScore || 3}/{data.quizTotal || 3}
                    </h1>
                    <p className="text-xs text-slate-200 font-bold mt-0.5">
                      {data.quizPercent || 100}% de Aproveitamento ⚡
                    </p>
                    <div className="mt-2 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] line-clamp-1">
                      📚 {data.quizTopic || 'Revisão Rápida ENEM'}
                    </div>
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-300 font-medium italic">
                Meta: {data.courseTarget || 'Aprovação no Curso dos Sonhos'} 🎓
              </div>
            </div>

            {/* Bottom Callout Tag */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[9px] font-bold text-slate-300">
              <span>Acesse: gabaritaai.app</span>
              <span className="flex items-center gap-0.5 text-amber-300">
                <Sparkles className="w-3 h-3 inline" /> IA nos Estudos
              </span>
            </div>
          </div>
        </div>

        {/* Social Quick Share Bar */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">Publicar direto:</span>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-black transition flex items-center gap-1 cursor-pointer"
            title="Compartilhar no WhatsApp"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleShareTwitter}
            className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-black transition flex items-center gap-1 cursor-pointer"
            title="Compartilhar no X (Twitter)"
          >
            <span>𝕏</span>
            <span>Twitter / X</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-black transition flex items-center gap-1 cursor-pointer"
              title="Mais redes sociais"
            >
              <Share2 className="w-3 h-3" />
              <span>Outros</span>
            </button>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Legenda Copiada!' : 'Copiar Legenda para Post'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-lg transition cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Imagem Stories</span>
          </button>
        </div>

      </div>
    </div>
  );
};
