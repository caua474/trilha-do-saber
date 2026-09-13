import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Sparkles, Clock, Brain, RefreshCw, CheckCircle2, Bookmark, Share2 } from 'lucide-react';

export interface StudyTechnique {
  id: string;
  nome: string;
  emoji: string;
  categoria: string;
  resumo: string;
  passoAPasso: string[];
  beneficio: string;
  exemploPratico: string;
}

const STUDY_TECHNIQUES: StudyTechnique[] = [
  {
    id: 'feynman',
    nome: 'Técnica Feynman',
    emoji: '🧠',
    categoria: 'Aprendizado Profundo',
    resumo: 'Aprenda qualquer assunto complexo tentando explicá-lo de forma simples para uma criança de 10 anos.',
    passoAPasso: [
      '1. Escolha o conceito que quer dominar.',
      '2. Escreva uma explicação simplificada como se estivesse ensinando um iniciante.',
      '3. Identifique onde travou ou usou jargões e volte ao material original.',
      '4. Refaça a explicação usando frases curtas e analogias simples.'
    ],
    beneficio: 'Elimina a falsa sensação de conhecimento e consolida o conteúdo na memória de longo prazo.',
    exemploPratico: 'Em vez de memorizar "Fotossíntese é a conversão da energia luminosa em energia química", explique: "A planta usa a luz do sol como ingrediente para cozinhar o próprio alimento."'
  },
  {
    id: 'pomodoro',
    nome: 'Técnica Pomodoro',
    emoji: '⏱️',
    categoria: 'Gestão de Tempo & Foco',
    resumo: 'Divida o tempo de estudo em blocos curtos de hiperfoco seguidos por pausas estratégicas para descanso mental.',
    passoAPasso: [
      '1. Estude com 100% de atenção por 25 minutos (1 Pomodoro).',
      '2. Faça uma pausa curta de 5 minutos (estique as pernas, beba água).',
      '3. Repita o ciclo 4 vezes.',
      '4. Após 4 blocos, faça uma pausa longa de 15 a 30 minutos.'
    ],
    beneficio: 'Evita a fadiga mental, combate a procrastinação e mantém o cérebro altamente alerta.',
    exemploPratico: 'Defina um alarme de 25min, desligue as notificações do celular e resolva questões de Matemática até o sinal tocar.'
  },
  {
    id: 'repeticao_espacada',
    nome: 'Repetição Espaçada (Spaced Repetition)',
    emoji: '📈',
    categoria: 'Retenção & Memória',
    resumo: 'Revise o conteúdo em intervalos crescentes para vencer a Curva do Esquecimento de Ebbinghaus.',
    passoAPasso: [
      '1. Estude o conteúdo novo hoje (Dia 1).',
      '2. Faça a 1ª revisão rápida em 24 horas (Dia 2).',
      '3. Faça a 2ª revisão em 7 dias.',
      '4. Faça a 3ª revisão em 30 dias.'
    ],
    beneficio: 'Garante que você lembre da matéria até a data do ENEM ou Vestibular sem precisar "decorar de véspera".',
    exemploPratico: 'Use os Flashcards do GabaritaAí para revisar termos errados 1 dia depois, 3 dias depois e 1 semana depois.'
  },
  {
    id: 'active_recall',
    nome: 'Evocação Ativa (Active Recall)',
    emoji: '⚡',
    categoria: 'Prática de Testes',
    resumo: 'Force seu cérebro a resgatar a informação da memória sem olhar para as anotações.',
    passoAPasso: [
      '1. Feche os livros e cadernos após estudar um tópico.',
      '2. Escreva em uma folha em branco tudo o que lembra.',
      '3. Responda a 5 questões sobre o assunto sem consultar o gabarito.',
      '4. Confira o que errou e ajuste apenas os pontos falhos.'
    ],
    beneficio: 'Fortalece as conexões neurais muito mais do que a leitura passiva de resumos.',
    exemploPratico: 'Pergunte a si mesmo: "Quais são as 3 Leis de Newton e o que cada uma significa?" antes de abrir a apostila.'
  },
  {
    id: 'cornell',
    nome: 'Método Cornell de Anotações',
    emoji: '📝',
    categoria: 'Organização de Caderno',
    resumo: 'Divida sua folha de anotação em 3 seções: Tópicos Principais, Notas de Aula e Resumo Final.',
    passoAPasso: [
      '1. Coluna Esquerda (Palavras-chave e Perguntas).',
      '2. Coluna Direita Maior (Anotações e detalhes da aula).',
      '3. Rodapé (Resumo de 2 linhas em suas próprias palavras).'
    ],
    beneficio: 'Transforma suas anotações brutas em um material de revisão pronto e extremamente visual.',
    exemploPratico: 'Na coluna esquerda coloque "Efeito Estufa", na direita a definição, e no rodapé a consequência principal.'
  },
  {
    id: 'estudo_intercalado',
    nome: 'Estudo Intercalado (Interleaving)',
    emoji: '🔀',
    categoria: 'Estratégia de Estudo',
    resumo: 'Alterne entre diferentes matérias ou tipos de problemas durante o mesmo dia em vez de estudar só uma matéria por horas.',
    passoAPasso: [
      '1. Estude 45 min de Matemática.',
      '2. Faça uma pausa de 10 min.',
      '3. Troque para 45 min de História ou Português.',
      '4. Volte para questões mistas no final do dia.'
    ],
    beneficio: 'Melhora a capacidade do cérebro de categorizar problemas e distinguir diferentes padrões.',
    exemploPratico: 'Em vez de fazer 50 exercícios só de Geometria Plana, faça 15 de Geometria, 15 de Álgebra e 15 de Estatística.'
  }
];

export const DailyStudyTipModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<StudyTechnique | null>(null);

  useEffect(() => {
    // Check if user has already seen the daily tip today or on first load
    const storageKey = 'gabaritaai_daily_tip_seen_v1';
    const hasSeen = localStorage.getItem(storageKey);

    if (!hasSeen) {
      // Pick a random tip
      const randomIndex = Math.floor(Math.random() * STUDY_TECHNIQUES.length);
      setSelectedTip(STUDY_TECHNIQUES[randomIndex]);
      setIsOpen(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, []);

  const handleNextRandomTip = () => {
    if (!selectedTip) return;
    const available = STUDY_TECHNIQUES.filter((t) => t.id !== selectedTip.id);
    const randomIndex = Math.floor(Math.random() * available.length);
    setSelectedTip(available[randomIndex]);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !selectedTip) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-5"
        >
          {/* Top Decorative Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-sm shrink-0">
                {selectedTip.emoji}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    💡 Dica do Dia • GabaritaAí
                  </span>
                  <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {selectedTip.categoria}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedTip.nome}
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resumo */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>O que é:</span>
            </p>
            {selectedTip.resumo}
          </div>

          {/* Passo a Passo */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Como Aplicar na Prática:</span>
            </h4>
            <div className="space-y-1.5">
              {selectedTip.passoAPasso.map((step, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 font-medium"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Exemplo Prático */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-900 dark:text-amber-200">
            <strong className="font-bold text-amber-700 dark:text-amber-300 block text-[10px] uppercase mb-0.5">
              🎯 Exemplo Prático de Hoje:
            </strong>
            <span>{selectedTip.exemploPratico}</span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleNextRandomTip}
              className="w-full sm:w-auto text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ver Outra Técnica</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Começar a Estudar Agora</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
