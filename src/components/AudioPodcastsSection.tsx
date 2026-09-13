import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Sparkles, Headphones, Radio, Download, Zap, RotateCcw } from 'lucide-react';

interface PodcastTrack {
  id: string;
  materia: string;
  titulo: string;
  duracaoTexto: string;
  topicoPrincipal: string;
  resumoAudioTexto: string;
  corTheme: string;
}

const PODCAST_CATALOG: PodcastTrack[] = [
  {
    id: 'pod_1',
    materia: 'História do Brasil',
    titulo: 'Era Vargas em 4 Minutos: CLT, Estado Novo e Industrialização',
    duracaoTexto: '3:45',
    topicoPrincipal: 'Era Vargas, propaganda política do DIP e leis trabalhistas.',
    resumoAudioTexto: 'Olá estudante! Bem-vindo ao Resumo em Áudio sobre a Era Vargas. De 1930 a 1945, Getúlio Vargas revolucionou o Brasil. Destaque total para a CLT criada em 1943, a industrialização de base com a CSN e o controle de mídia promovido pelo DIP no Estado Novo. Lembre-se no ENEM: Vargas conciliou populismo e direitos trabalhistas!',
    corTheme: 'from-amber-600 to-orange-700',
  },
  {
    id: 'pod_2',
    materia: 'Biologia',
    titulo: 'Ecologia Express: Ciclo do Nitrogênio e Eutrofização',
    duracaoTexto: '4:10',
    topicoPrincipal: 'Fixação de nitrogênio por nitrosomonas e fases da eutrofização.',
    resumoAudioTexto: 'Atenção vestibulando! Ecologia é o tema mais cobrado em Ciências da Natureza. Entenda a Eutrofização em 4 etapas simples: excesso de esgoto rico em fósforo e nitrogênio atrai algas na superfície. As algas impedem a luz solar de passar. Plantas do fundo morrem e bactérias consomem todo o oxigênio da água, sufocando os peixes!',
    corTheme: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'pod_3',
    materia: 'Filosofia',
    titulo: 'Modernidade Líquida de Zygmunt Bauman e Redação ENEM',
    duracaoTexto: '3:20',
    topicoPrincipal: 'Relações fluídas, consumismo e repertório sociológico coringa.',
    resumoAudioTexto: 'Procurando um repertório coringa para a Redação do ENEM? Bauman definiu a Modernidade Líquida como a era das relações frágeis, onde nada é feito para durar. Você pode citar a Modernidade Líquida para temas de consumismo desenfreado, vícios em redes sociais, fragilização das redes de apoio e individualismo contemporâneo.',
    corTheme: 'from-purple-600 to-indigo-700',
  },
  {
    id: 'pod_4',
    materia: 'Geografia',
    titulo: 'Geopolítica da Globalização e Fluxos Migratórios',
    duracaoTexto: '4:30',
    topicoPrincipal: 'Divisão Internacional do Trabalho e crise de refugiados.',
    resumoAudioTexto: 'Neste podcast rápido de Geografia, analisamos a Globalização. Ela acelera o trânsito de mercadorias, capitais e informações pela internet, porém impõe barreiras físicas e leis migratórias rigorosas para os trabalhadores vulneráveis e refugiados.',
    corTheme: 'from-blue-600 to-cyan-700',
  },
  {
    id: 'pod_5',
    materia: 'Química',
    titulo: 'Físico-Química: Entenda a Escala de pH e Calagem do Solo',
    duracaoTexto: '3:50',
    topicoPrincipal: 'Soluções ácidas, básicas e correção do Cerrado.',
    resumoAudioTexto: 'Em Físico-Química, lembre-se: pH menor que 7 é ácido, igual a 7 é neutro e maior que 7 é básico. O solo do Cerrado é ácido com pH por volta de 5. Para plantar soja e milho, adiciona-se calcário (carbonato de cálcio) na reação chamada calagem.',
    corTheme: 'from-rose-600 to-pink-700',
  },
  {
    id: 'pod_6',
    materia: 'Matemática',
    titulo: 'Estatística e Média, Moda e Mediana Sem Pegadinhas',
    duracaoTexto: '3:15',
    topicoPrincipal: 'Cálculo de mediana em rol par e ímpar.',
    resumoAudioTexto: 'Para gabaritar estatística no ENEM: Moda é o número que MAIS SE REPETE. Média é a soma dividida pela quantidade. E para a Mediana, a regra de ouro é organizar o ROL em ordem crescente PRIMEIRO! Se o número de termos for par, tire a média dos dois do meio.',
    corTheme: 'from-amber-500 to-yellow-600',
  },
];

export const AudioPodcastsSection: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<PodcastTrack>(PODCAST_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Web Speech API Ref
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        startSpeech(selectedTrack.resumoAudioTexto);
      }
    }
  };

  const startSpeech = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = playbackRate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setProgress(0);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const handleChangeTrack = (track: PodcastTrack) => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setSelectedTrack(track);
    setIsPlaying(false);
    setProgress(0);
  };

  const handleChangeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying && utteranceRef.current && synthRef.current) {
      synthRef.current.cancel();
      startSpeech(selectedTrack.resumoAudioTexto);
    }
  };

  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-purple-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Headphones className="w-3 h-3 text-slate-950" /> Modo Áudio & Podcasts
              </span>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                Estudo Hands-Free
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              🎧 Resumos em Som de 3 a 5 Minutos
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Ouça os conteúdos essenciais do ENEM e dos maiores vestibulares enquanto se desloca ou relaxa. Inclui sintonia de áudio e aceleração (1x a 2x).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center space-x-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-purple-300 font-bold uppercase tracking-wider block">Formato</span>
              <span className="text-base font-black text-white">Sintetizador Integrado</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE PLAYER CARD */}
      <div className={`bg-gradient-to-br ${selectedTrack.corTheme} text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden border border-white/20`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="bg-black/30 text-amber-300 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full border border-amber-300/30">
              {selectedTrack.materia} • {selectedTrack.duracaoTexto}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {selectedTrack.titulo}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 font-medium max-w-2xl">
              {selectedTrack.topicoPrincipal}
            </p>
          </div>

          {/* PLAY / SPEED CONTROLS */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full bg-white text-slate-950 hover:bg-amber-300 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center cursor-pointer"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-slate-950" /> : <Play className="w-8 h-8 fill-slate-950 ml-1" />}
            </button>
          </div>
        </div>

        {/* SPEED SELECTOR BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/20 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase text-white/80">Velocidade:</span>
            {[1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleChangeSpeed(rate)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-black/30 hover:bg-black/50 text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              setIsPlaying(false);
              startSpeech(selectedTrack.resumoAudioTexto);
            }}
            className="px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Áudio</span>
          </button>
        </div>

        {/* TRANSCRIPT TEXT DISPLAY */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/10 text-xs text-white/90 font-medium leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
          <span className="text-[10px] font-black uppercase text-amber-300 block mb-1">Transcrição do Podcast:</span>
          {selectedTrack.resumoAudioTexto}
        </div>
      </div>

      {/* PODCAST CATALOG GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Catálogo de Resumos em Áudio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecione qualquer episódio para tocar instantaneamente
            </p>
          </div>
          <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
            {PODCAST_CATALOG.length} Episódios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PODCAST_CATALOG.map((track) => {
            const isCurrent = selectedTrack.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => handleChangeTrack(track)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isCurrent
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 shadow-md ring-2 ring-purple-400/30'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-md">
                    {track.materia}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    ⏱️ {track.duracaoTexto}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {track.titulo}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {track.topicoPrincipal}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    {isCurrent && isPlaying ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ouvindo Agora
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Reproduzir
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
