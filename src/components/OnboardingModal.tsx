import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Target,
  BookOpen,
  Clock,
  Building2,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSavedUserProfile, saveUserProfile } from './ProfileSettingsModal';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface OnboardingModalProps {
  onClose: () => void;
  onOpenProfile?: () => void;
  onSaveProfile?: (profile: UserProfile) => void;
}

const ONBOARDING_KEY = 'gabaritai_onboarding_seen_v1';

export const markOnboardingSeen = () => {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (e) {
    console.error('Erro ao salvar visualização do onboarding:', e);
  }
};

export const hasSeenOnboarding = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
};

const SUGGESTED_COURSES = [
  'Medicina',
  'Direito',
  'Engenharia de Software',
  'Ciência da Computação',
  'Psicologia',
  'Odontologia',
  'Administração',
  'Arquitetura'
];

const SUGGESTED_UNIVERSITIES = [
  'USP',
  'UFRJ',
  'UFMG',
  'UNICAMP',
  'UNESP',
  'UFRGS',
  'UNIFESP',
  'UFPE'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onClose,
  onOpenProfile,
  onSaveProfile
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>(() => getSavedUserProfile());

  // Form states
  const [selectedMeta, setSelectedMeta] = useState<string>(profile.targetExam || 'ENEM');
  const [targetCourse, setTargetCourse] = useState<string>(profile.targetCourse || 'Medicina');
  const [targetUniversity, setTargetUniversity] = useState<string>(profile.targetUniversity || 'USP');
  const [studyRoutine, setStudyRoutine] = useState<string>(profile.studyRoutine || '2 a 4 horas');

  const handleFinish = () => {
    playSuccessSound();
    markOnboardingSeen();

    // Map study routine to daily hours goal
    let hoursGoal = 4;
    if (studyRoutine === '1 hora') hoursGoal = 1;
    else if (studyRoutine === '2 a 4 horas') hoursGoal = 3;
    else if (studyRoutine === '5+ horas') hoursGoal = 6;

    const updatedProfile: UserProfile = {
      ...profile,
      targetExam: selectedMeta,
      targetCourse: targetCourse.trim() || 'Medicina',
      targetUniversity: targetUniversity.trim() || 'USP',
      studyRoutine: studyRoutine,
      dailyHoursGoal: hoursGoal,
      onboardingCompleted: true
    };

    saveUserProfile(updatedProfile);
    if (onSaveProfile) {
      onSaveProfile(updatedProfile);
    }
    onClose();
  };

  const handleNext = () => {
    playClickSound();
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    playClickSound();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative text-white my-auto max-h-[95vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Configuração Inicial GabaritaAí</h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Passo {currentStep} de 3 • Personalize seu painel de estudos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              markOnboardingSeen();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 flex shrink-0">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-full transition-all duration-300 ${
                step <= currentStep
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 flex-1'
                  : 'bg-transparent flex-1'
              }`}
            />
          ))}
        </div>

        {/* Step Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {/* PASSO 1: QUAL A SUA META? */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                    Passo 1 • Foco Principal
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Qual a sua meta de estudos?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Selecione o objetivo que direcionará seus simulados, redações e cronogramas diários:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  {/* Option 1: ENEM */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedMeta('ENEM');
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-4 group ${
                      selectedMeta === 'ENEM'
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl transition ${
                      selectedMeta === 'ENEM'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/80 text-slate-300 group-hover:text-white'
                    }`}>
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">ENEM (Exame Nacional do Ensino Médio)</h4>
                        {selectedMeta === 'ENEM' && (
                          <span className="bg-indigo-500 text-white rounded-full p-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Foco nas 4 áreas do conhecimento, TRI oficial, SISU, ProUni e Redação Nota 1000.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Vestibular Regional */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedMeta('Vestibular Regional');
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-4 group ${
                      selectedMeta === 'Vestibular Regional'
                        ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl transition ${
                      selectedMeta === 'Vestibular Regional'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700/80 text-slate-300 group-hover:text-white'
                    }`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">Vestibulares Regionais (FUVEST, UNICAMP, UERJ, etc.)</h4>
                        {selectedMeta === 'Vestibular Regional' && (
                          <span className="bg-amber-500 text-slate-950 rounded-full p-0.5 font-black">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Provas de 1ª e 2ª fase com questões discursivas, obras literárias e bancas estaduais.
                      </p>
                    </div>
                  </button>

                  {/* Option 3: Concurso / Reforço */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedMeta('Concurso / Reforço');
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-4 group ${
                      selectedMeta === 'Concurso / Reforço'
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl transition ${
                      selectedMeta === 'Concurso / Reforço'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700/80 text-slate-300 group-hover:text-white'
                    }`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">Concurso Público / Reforço Escolar</h4>
                        {selectedMeta === 'Concurso / Reforço' && (
                          <span className="bg-emerald-500 text-slate-950 rounded-full p-0.5 font-black">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Estudo dirigido por matéria, treino de disciplinas específicas e revisão teórica.
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* PASSO 2: QUAL CURSO E UNIVERSIDADE VOCÊ DESEJA? */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                    Passo 2 • Sonho Acadêmico
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Qual curso e universidade você deseja?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Defina seu objetivo para personalizar a contagem regressiva e os materiais no seu painel:
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  {/* Curso Input */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      <span>Curso Desejado</span>
                    </label>

                    <input
                      type="text"
                      value={targetCourse}
                      onChange={(e) => setTargetCourse(e.target.value)}
                      placeholder="Ex: Medicina, Direito, Engenharia..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />

                    {/* Chips for course */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Sugestões Rápidas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_COURSES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setTargetCourse(c);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              targetCourse === c
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-950 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Universidade Input */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                    <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Universidade ou Faculdade Alvo</span>
                    </label>

                    <input
                      type="text"
                      value={targetUniversity}
                      onChange={(e) => setTargetUniversity(e.target.value)}
                      placeholder="Ex: USP, UFRJ, UFMG, UNICAMP..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />

                    {/* Chips for university */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Sugestões Rápidas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_UNIVERSITIES.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setTargetUniversity(u);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                              targetUniversity === u
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'bg-slate-950 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASSO 3: QUAL SUA ROTINA DE ESTUDOS DIÁRIA? */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    Passo 3 • Rotina Diária
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Qual sua rotina de estudos diária?
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ajustaremos seu cronograma de estudo e metas com base no tempo que você tem disponível:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  {/* Option 1: 1 hora */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setStudyRoutine('1 hora');
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-4 group ${
                      studyRoutine === '1 hora'
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl transition ${
                      studyRoutine === '1 hora'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/80 text-slate-300 group-hover:text-white'
                    }`}>
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">1 hora por dia</h4>
                        {studyRoutine === '1 hora' && (
                          <span className="bg-indigo-500 text-white rounded-full p-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Foco essencial e resumos rápidos. Ideal para conciliar com escola ou trabalho.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: 2 a 4 horas */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setStudyRoutine('2 a 4 horas');
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-4 group ${
                      studyRoutine === '2 a 4 horas'
                        ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl transition ${
                      studyRoutine === '2 a 4 horas'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700/80 text-slate-300 group-hover:text-white'
                    }`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">2 a 4 horas por dia (Recomendado)</h4>
                        {studyRoutine === '2 a 4 horas' && (
                          <span className="bg-amber-500 text-slate-950 rounded-full p-0.5 font-black">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Equilíbrio ideal para teoria, simulados TRI, flashcards e redação quinzenal.
                      </p>
                    </div>
                  </button>

                  {/* Option 3: 5+ horas */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setStudyRoutine('5+ horas');
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-4 group ${
                      studyRoutine === '5+ horas'
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl transition ${
                      studyRoutine === '5+ horas'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700/80 text-slate-300 group-hover:text-white'
                    }`}>
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white">5+ horas por dia (Modo Intensivo)</h4>
                        {studyRoutine === '5+ horas' && (
                          <span className="bg-emerald-500 text-slate-950 rounded-full p-0.5 font-black">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Imersão total de estudos com alta performance para vestibulares concorridos.
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition cursor-pointer ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-slate-500'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Step Dots */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  playClickSound();
                  setCurrentStep(step);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  currentStep === step
                    ? 'w-6 bg-indigo-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Ir para o passo ${step}`}
              />
            ))}
          </div>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
            >
              <span>Salvar e Acessar Meu Painel 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
