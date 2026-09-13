import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { NavigationTabs, AbaAtiva } from './components/NavigationTabs';
import { BottomNavigationBar, PrimaryTab } from './components/BottomNavigationBar';
import DashboardPrincipal from './components/DashboardPrincipal';
import { ArenaX1Section } from './components/ArenaX1Section';
import ConteudosBentoIA from './components/ConteudosBentoIA';
import { BibliotecaSection } from './components/BibliotecaSection';
import { SubjectCatalogSection } from './components/SubjectCatalogSection';
import { EnemGlossarySection } from './components/EnemGlossarySection';
import { MindmapGeneratorSection } from './components/MindmapGeneratorSection';
import { FeynmanAudioSection } from './components/FeynmanAudioSection';
import { KnowledgePillsSection } from './components/KnowledgePillsSection';
import { AudioPodcastsSection } from './components/AudioPodcastsSection';
import { AutoFlashcardsSection } from './components/AutoFlashcardsSection';
import { QuestionScannerSection } from './components/QuestionScannerSection';
import RedacaoCorretor from './components/RedacaoCorretor';
import { C5InterventionDetectorSection } from './components/C5InterventionDetectorSection';
import { RepertoriosCoringaSection } from './components/RepertoriosCoringaSection';
import { EssaySkeletonCanvasSection } from './components/EssaySkeletonCanvasSection';
import { HotEssayRadarSection } from './components/HotEssayRadarSection';
import { DevilAdvocateSection } from './components/DevilAdvocateSection';
import Simulados from './components/Simulados';
import { AdaptiveSimuladoSection } from './components/AdaptiveSimuladoSection';
import { ReelsQuestionFeedSection } from './components/ReelsQuestionFeedSection';
import { QuizBattleSection } from './components/QuizBattleSection';
import { CadernoDeErrosSection } from './components/CadernoDeErrosSection';
import { OpticalAnswerSheetScannerSection } from './components/OpticalAnswerSheetScannerSection';
import { TestStrategyGabaritoSection } from './components/TestStrategyGabaritoSection';
import { ExamAmbientSoundPlayer } from './components/ExamAmbientSoundPlayer';
import PerfilXP from './components/PerfilXP';
import { StudyStatisticsSection } from './components/StudyStatisticsSection';
import { WeeklyRankingSection } from './components/WeeklyRankingSection';
import { EmergencyFinal30DaysSection } from './components/EmergencyFinal30DaysSection';
import { WeeklyRoutinePlannerSection } from './components/WeeklyRoutinePlannerSection';
import { SisuSimulatorSection } from './components/SisuSimulatorSection';
import { CheatSheetGeneratorSection } from './components/CheatSheetGeneratorSection';
import { CentralDeOpcoesSection } from './components/CentralDeOpcoesSection';
import { OfflineStatusBanner } from './components/OfflineStatusBanner';
import { HomeHubCategories } from './components/HomeHubCategories';
import { AiStudioPlayground } from './components/AiStudioPlayground';

// Modals
import { ProfileSettingsModal, getSavedUserProfile } from './components/ProfileSettingsModal';
import { PlaygroundSettingsModal } from './components/PlaygroundSettingsModal';
import { ProSubscriptionModal } from './components/ProSubscriptionModal';
import { GabiAssistantModal } from './components/GabiAssistantModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HistoryModal } from './components/HistoryModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { DailyStudyTipModal } from './components/DailyStudyTipModal';
import { StudyCalendarModal } from './components/StudyCalendarModal';
import { BancaPersonalitySelectorModal } from './components/BancaPersonalitySelectorModal';
import { InteractiveQuizModal } from './components/InteractiveQuizModal';
import { SocialShareStoryModal } from './components/SocialShareStoryModal';
import { EnemPrintableSheetModal } from './components/EnemPrintableSheetModal';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { OpcoesGeraisModal } from './components/OpcoesGeraisModal';

// Utilities & Data
import { StudyMaterial, TutorPlan, ELI5Explanation, UserProfile } from './types';

// Audio feedback utilities (self-contained Web Audio API)
function playClickSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {}
}

function playSuccessSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch {}
}

// IndexedDB storage helper (self-contained, robust fallback)
const DB_NAME = 'AssistenteEstudosDB';
const DB_VERSION = 3;

async function fetchFromIndexedDB<T>(storeName: string): Promise<T[]> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return [];
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve([]);
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(storeName)) {
          database.close();
          return resolve([]);
        }
        const tx = database.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const getAllReq = store.getAll();
        getAllReq.onsuccess = () => {
          database.close();
          resolve(getAllReq.result || []);
        };
        getAllReq.onerror = () => {
          database.close();
          resolve([]);
        };
      };
    } catch {
      resolve([]);
    }
  });
}

async function deleteFromIndexedDB(storeName: string, id: string): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve();
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(storeName)) {
          database.close();
          return resolve();
        }
        const tx = database.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => {
          database.close();
          resolve();
        };
        tx.onerror = () => {
          database.close();
          resolve();
        };
      };
    } catch {
      resolve();
    }
  });
}

async function clearIndexedDBStore(storeName: string): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => resolve();
      request.onsuccess = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(storeName)) {
          database.close();
          return resolve();
        }
        const tx = database.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => {
          database.close();
          resolve();
        };
        tx.onerror = () => {
          database.close();
          resolve();
        };
      };
    } catch {
      resolve();
    }
  });
}

async function clearEntireIndexedDB(): Promise<void> {
  await Promise.all([
    clearIndexedDBStore('materials'),
    clearIndexedDBStore('tutor_plans'),
    clearIndexedDBStore('eli5_explanations'),
  ]);
}

export default function App() {
  // Navigation States
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('home');
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('flashcards');

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('gabaritai_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'dark';
  });

  // User Gamification & Profile States
  const [studyStreak, setStudyStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gabaritai_study_streak_v1');
      if (saved) return parseInt(saved, 10);
    } catch (e) {
      console.error(e);
    }
    return 7;
  });

  const [userXP, setUserXP] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gabaritai_xp_v1');
      if (saved) return parseInt(saved, 10);
    } catch (e) {
      console.error(e);
    }
    return 1250;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => getSavedUserProfile());

  // IndexedDB Data Cache
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [tutorPlans, setTutorPlans] = useState<TutorPlan[]>([]);
  const [eli5Explanations, setEli5Explanations] = useState<ELI5Explanation[]>([]);

  // Modal States
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [socialStoryData, setSocialStoryData] = useState<{
    type: 'redacao' | 'mascote' | 'streak' | 'quiz';
    data: any;
  } | null>(null);
  const [printSheetTheme, setPrintSheetTheme] = useState<string>('');
  const [gabiInitialPrompt, setGabiInitialPrompt] = useState<string | null>(null);

  // Gemini AI Studio Playground States
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gabaritai_gemini_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [geminiModel, setGeminiModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gabaritai_gemini_model');
      if (saved && saved !== 'gemini-2.5-flash' && saved !== 'gemini-3.6-flash' && saved !== 'gemini-1.5-flash') {
        return saved;
      }
      return 'gemini-3.8-flash';
    } catch (e) {
      return 'gemini-3.8-flash';
    }
  });
  const [geminiTemperature, setGeminiTemperature] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('gabaritai_gemini_temp');
      return saved ? parseFloat(saved) : 0.7;
    } catch (e) {
      return 0.7;
    }
  });
  const [geminiSystemInstruction, setGeminiSystemInstruction] = useState<string>(() => {
    try {
      return localStorage.getItem('gabaritai_gemini_sys_instruction') || '';
    } catch (e) {
      return '';
    }
  });

  // Sync Theme with DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('gabaritai_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Load Saved Materials from IndexedDB
  const loadDatabaseItems = useCallback(async () => {
    try {
      const [mats, plans, eli5s] = await Promise.all([
        fetchFromIndexedDB<StudyMaterial>('materials'),
        fetchFromIndexedDB<TutorPlan>('tutor_plans'),
        fetchFromIndexedDB<ELI5Explanation>('eli5_explanations'),
      ]);
      setMaterials(mats);
      setTutorPlans(plans);
      setEli5Explanations(eli5s);
    } catch (e) {
      console.error('Erro ao carregar banco de dados:', e);
    }
  }, []);

  useEffect(() => {
    loadDatabaseItems();
  }, [loadDatabaseItems]);

  // Handle XP addition
  const handleAddXP = (amount: number) => {
    setUserXP((prev) => {
      const updated = prev + amount;
      try {
        localStorage.setItem('gabaritai_xp_v1', updated.toString());
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    playSuccessSound();
  };

  // Toggle Theme Handler
  const handleToggleTheme = () => {
    playClickSound();
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Tab Navigation Handling
  const handleSelectPrimaryTab = (tab: PrimaryTab) => {
    playClickSound();
    setPrimaryTab(tab);

    // Set recommended default subtab for each category
    if (tab === 'conteudos' && !['flashcards', 'biblioteca', 'catalogo', 'glossario_enem', 'mapas_mentais', 'feynman_audio', 'pilulas_conhecimento', 'audio_podcasts', 'auto_flashcards', 'duvidas', 'ai_playground'].includes(abaAtiva)) {
      setAbaAtiva('flashcards');
    } else if (tab === 'redacao_ia' && !['redacao', 'c5_intervencao', 'repertorio', 'esquema_redacao', 'radar_redacao', 'advogado_diabo'].includes(abaAtiva)) {
      setAbaAtiva('redacao');
    } else if (tab === 'simulados_treino' && !['simulado_tri', 'simulado_adaptativo', 'reels_feed', 'desafios', 'caderno_erros', 'corretor_gabarito', 'estratégia_chute', 'som_ambiente'].includes(abaAtiva)) {
      setAbaAtiva('simulado_tri');
    } else if (tab === 'perfil_gamificacao' && !['mascote_xp', 'estatisticas_estudo', 'ranking', 'reta_final', 'planner_rotina', 'sisu_simulator', 'folha_vespera'].includes(abaAtiva)) {
      setAbaAtiva('mascote_xp');
    } else if (tab === 'arena') {
      setAbaAtiva('arena_x1');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Offline Status Indicator */}
      <OfflineStatusBanner />

      {/* Daily Study Tip (Auto-prompts if not seen today) */}
      <DailyStudyTipModal />

      {/* Application Header */}
      <Header
        historyCount={materials.length + tutorPlans.length + eli5Explanations.length}
        studyStreak={studyStreak}
        theme={theme}
        canGoBack={primaryTab !== 'home'}
        onGoBack={() => setPrimaryTab('home')}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => setActiveModal('history')}
        onOpenHelp={() => setActiveModal('how_it_works')}
        onOpenGabi={() => setActiveModal('gabi')}
        onOpenPro={() => setActiveModal('pro')}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenRanking={() => {
          setPrimaryTab('perfil_gamificacao');
          setAbaAtiva('ranking');
        }}
        onOpenFlashcards={() => {
          setPrimaryTab('conteudos');
          setAbaAtiva('flashcards');
        }}
        onOpenCalendar={() => setActiveModal('calendar')}
        onOpenBanca={() => setActiveModal('banca')}
        onOpenGraficosTri={() => {
          setPrimaryTab('simulados_treino');
          setAbaAtiva('simulado_tri');
        }}
        onOpenOnboarding={() => setActiveModal('onboarding')}
        onOpenOpcoesPage={() => setPrimaryTab('opcoes_hub')}
        onResetView={() => {
          setPrimaryTab('home');
          setAbaAtiva('flashcards');
        }}
        materials={materials}
        tutorPlans={tutorPlans}
        eli5Explanations={eli5Explanations}
        onSelectMaterial={(mat) => {
          setSelectedMaterial(mat);
          setActiveModal('interactive_quiz');
        }}
        onSelectTutorPlan={() => {
          setPrimaryTab('conteudos');
          setAbaAtiva('catalogo');
        }}
        onSelectELI5={() => {
          setPrimaryTab('conteudos');
          setAbaAtiva('duvidas');
        }}
        onNavigate={(targetPrimary, targetSub) => {
          setPrimaryTab(targetPrimary);
          if (targetSub) {
            setAbaAtiva(targetSub);
          }
        }}
        onOpenModal={(modalName) => {
          if (modalName === 'gabi') setActiveModal('gabi');
          else if (modalName === 'banca') setActiveModal('banca');
          else if (modalName === 'calendar') setActiveModal('calendar');
          else if (modalName === 'profile') setActiveModal('profile');
          else if (modalName === 'pro') setActiveModal('pro');
          else if (modalName === 'history') setActiveModal('history');
          else if (modalName === 'onboarding') setActiveModal('onboarding');
        }}
        onSelectFlashcardTopic={(_topic) => {
          setPrimaryTab('conteudos');
          setAbaAtiva('flashcards');
        }}
      />

      {/* Top Feature Sub-Navigation Tabs (Active on specific modules, hidden on home/opcoes to keep home clean) */}
      {primaryTab !== 'opcoes_hub' && primaryTab !== 'home' && (
        <NavigationTabs
          primaryTab={primaryTab}
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
          onTabChange={(tab) => setAbaAtiva(tab)}
        />
      )}

      {/* Main Content Area */}
      <div id="tab-content-area" className="flex-1 w-full">
        {/* 1. HOME TAB */}
        {primaryTab === 'home' && (
          <DashboardPrincipal
            onOpenGabi={() => setActiveModal('gabi')}
            onSelectDisciplina={(materia) => {
              setPrimaryTab('conteudos');
              setAbaAtiva('biblioteca');
            }}
            onNavigateTab={(tab) => {
              if (tab === 'arena_x1') {
                setPrimaryTab('arena');
                setAbaAtiva('arena_x1');
              } else if (['flashcards', 'biblioteca', 'catalogo', 'glossario_enem', 'mapas_mentais', 'feynman_audio', 'pilulas_conhecimento', 'audio_podcasts', 'auto_flashcards', 'duvidas', 'ai_playground'].includes(tab)) {
                setPrimaryTab('conteudos');
                setAbaAtiva(tab as any);
              } else if (['redacao', 'c5_intervencao', 'repertorio', 'esquema_redacao', 'radar_redacao', 'advogado_diabo'].includes(tab)) {
                setPrimaryTab('redacao_ia');
                setAbaAtiva(tab as any);
              } else if (['simulado_tri', 'simulado_adaptativo', 'reels_feed', 'desafios', 'caderno_erros', 'corretor_gabarito', 'estratégia_chute', 'som_ambiente'].includes(tab)) {
                setPrimaryTab('simulados_treino');
                setAbaAtiva(tab as any);
              } else if (['mascote_xp', 'estatisticas_estudo', 'ranking', 'reta_final', 'planner_rotina', 'sisu_simulator', 'folha_vespera'].includes(tab)) {
                setPrimaryTab('perfil_gamificacao');
                setAbaAtiva(tab as any);
              } else {
                setAbaAtiva(tab as any);
              }
            }}
          >
            <div className="max-w-7xl mx-auto px-4 pb-20">
              {/* Organized Category Cards & Quick Access Hub */}
              <HomeHubCategories
                onNavigate={(targetPrimary, targetSub) => {
                  setPrimaryTab(targetPrimary);
                  setAbaAtiva(targetSub);
                }}
              />
            </div>
          </DashboardPrincipal>
        )}

        {/* 2. ARENA TAB */}
        {primaryTab === 'arena' && (
          <main className="max-w-7xl mx-auto px-4 pb-28 pt-2">
            <ArenaX1Section onAddXP={handleAddXP} />
          </main>
        )}

        {/* 3. CONTEÚDOS TAB */}
        {primaryTab === 'conteudos' && (
          <main className="max-w-7xl mx-auto px-4 pb-28 pt-2">
            {abaAtiva === 'flashcards' && <ConteudosBentoIA />}
            {abaAtiva === 'biblioteca' && (
              <BibliotecaSection
                onAskGabi={(prompt) => {
                  setGabiInitialPrompt(prompt);
                  setActiveModal('gabi');
                }}
                onOpenMindmapTab={() => setAbaAtiva('mapas_mentais')}
              />
            )}
            {abaAtiva === 'catalogo' && (
              <SubjectCatalogSection
                onSelectTopicAction={(materia, topicoNome, acao) => {
                  if (acao === 'flashcard') {
                    setAbaAtiva('flashcards');
                  } else if (acao === 'duvida') {
                    setAbaAtiva('duvidas');
                  } else {
                    setPrimaryTab('simulados_treino');
                    setAbaAtiva('simulado_tri');
                  }
                }}
              />
            )}
            {abaAtiva === 'glossario_enem' && <EnemGlossarySection />}
            {abaAtiva === 'mapas_mentais' && (
              <MindmapGeneratorSection
                onStudyTopic={() => {
                  setAbaAtiva('biblioteca');
                }}
              />
            )}
            {abaAtiva === 'feynman_audio' && <FeynmanAudioSection />}
            {abaAtiva === 'pilulas_conhecimento' && <KnowledgePillsSection />}
            {abaAtiva === 'audio_podcasts' && <AudioPodcastsSection />}
            {abaAtiva === 'auto_flashcards' && <AutoFlashcardsSection onAddXp={handleAddXP} />}
            {abaAtiva === 'duvidas' && <QuestionScannerSection />}
            {abaAtiva === 'ai_playground' && (
              <AiStudioPlayground
                apiKey={geminiApiKey}
                model={geminiModel}
                temperature={geminiTemperature}
                systemInstruction={geminiSystemInstruction}
                onOpenSettings={() => setActiveModal('playground_settings')}
              />
            )}
            {![
              'flashcards',
              'biblioteca',
              'catalogo',
              'glossario_enem',
              'mapas_mentais',
              'feynman_audio',
              'pilulas_conhecimento',
              'audio_podcasts',
              'auto_flashcards',
              'duvidas',
              'ai_playground',
            ].includes(abaAtiva) && <ConteudosBentoIA />}
          </main>
        )}

        {/* 4. REDAÇÃO & IA TAB */}
        {primaryTab === 'redacao_ia' && (
          <main className="max-w-7xl mx-auto px-4 pb-28 pt-2">
            {abaAtiva === 'redacao' && <RedacaoCorretor />}
            {abaAtiva === 'c5_intervencao' && <C5InterventionDetectorSection />}
            {abaAtiva === 'repertorio' && <RepertoriosCoringaSection />}
            {abaAtiva === 'esquema_redacao' && (
              <EssaySkeletonCanvasSection
                onSendToAnalyzer={(skeleton) => {
                  setAbaAtiva('redacao');
                }}
              />
            )}
            {abaAtiva === 'radar_redacao' && <HotEssayRadarSection />}
            {abaAtiva === 'advogado_diabo' && <DevilAdvocateSection />}
            {![
              'redacao',
              'c5_intervencao',
              'repertorio',
              'esquema_redacao',
              'radar_redacao',
              'advogado_diabo',
            ].includes(abaAtiva) && <RedacaoCorretor />}
          </main>
        )}

        {/* 5. SIMULADOS & TREINO TAB */}
        {primaryTab === 'simulados_treino' && (
          <main className="max-w-7xl mx-auto px-4 pb-28 pt-2">
            {abaAtiva === 'simulado_tri' && <Simulados />}
            {abaAtiva === 'simulado_adaptativo' && <AdaptiveSimuladoSection onAddXp={handleAddXP} />}
            {abaAtiva === 'reels_feed' && <ReelsQuestionFeedSection onAddXp={handleAddXP} />}
            {abaAtiva === 'desafios' && <QuizBattleSection onAddXP={handleAddXP} />}
            {abaAtiva === 'caderno_erros' && <CadernoDeErrosSection onAddXp={handleAddXP} />}
            {abaAtiva === 'corretor_gabarito' && <OpticalAnswerSheetScannerSection />}
            {abaAtiva === 'estratégia_chute' && <TestStrategyGabaritoSection />}
            {abaAtiva === 'som_ambiente' && <ExamAmbientSoundPlayer />}
            {![
              'simulado_tri',
              'simulado_adaptativo',
              'reels_feed',
              'desafios',
              'caderno_erros',
              'corretor_gabarito',
              'estratégia_chute',
              'som_ambiente',
            ].includes(abaAtiva) && <Simulados />}
          </main>
        )}

        {/* 6. PERFIL & GAMIFICAÇÃO TAB */}
        {primaryTab === 'perfil_gamificacao' && (
          <main className="max-w-7xl mx-auto px-4 pb-28 pt-2">
            {abaAtiva === 'mascote_xp' && (
              <PerfilXP
                userName={userProfile?.name || 'Estudante ENEM'}
                userXP={userXP}
                level={Math.min(10, Math.floor(userXP / 350) + 1)}
                levelTitle="Mestre dos Simulados"
                streakDays={studyStreak || 7}
                onOpenSettings={() => setActiveModal('profile')}
                onNavigateToRedacao={() => {
                  setPrimaryTab('redacao_ia');
                  setAbaAtiva('redacao');
                }}
                onNavigateToSimulados={() => {
                  setPrimaryTab('simulados_treino');
                  setAbaAtiva('simulado_tri');
                }}
                onIncrementStreak={() => {
                  setStudyStreak((prev) => {
                    const updated = prev + 1;
                    try {
                      localStorage.setItem('gabaritai_study_streak_v1', updated.toString());
                    } catch (e) {
                      console.error(e);
                    }
                    return updated;
                  });
                }}
                onAddXPBonus={(amount) => {
                  handleAddXP(amount);
                }}
              />
            )}
            {abaAtiva === 'estatisticas_estudo' && <StudyStatisticsSection />}
            {abaAtiva === 'ranking' && (
              <WeeklyRankingSection
                onStudyClick={() => {
                  setPrimaryTab('conteudos');
                  setAbaAtiva('flashcards');
                }}
              />
            )}
            {abaAtiva === 'reta_final' && <EmergencyFinal30DaysSection />}
            {abaAtiva === 'planner_rotina' && <WeeklyRoutinePlannerSection />}
            {abaAtiva === 'sisu_simulator' && (
              <SisuSimulatorSection
                onGoToStudy={() => {
                  setPrimaryTab('conteudos');
                  setAbaAtiva('biblioteca');
                }}
              />
            )}
            {abaAtiva === 'folha_vespera' && <CheatSheetGeneratorSection />}
            {![
              'mascote_xp',
              'estatisticas_estudo',
              'ranking',
              'reta_final',
              'planner_rotina',
              'sisu_simulator',
              'folha_vespera',
            ].includes(abaAtiva) && (
              <PerfilXP
                userName={userProfile?.name || 'Estudante ENEM'}
                userXP={userXP}
                level={Math.min(10, Math.floor(userXP / 350) + 1)}
                levelTitle="Mestre dos Simulados"
                streakDays={studyStreak || 7}
                onOpenSettings={() => setActiveModal('profile')}
                onNavigateToRedacao={() => {
                  setPrimaryTab('redacao_ia');
                  setAbaAtiva('redacao');
                }}
                onNavigateToSimulados={() => {
                  setPrimaryTab('simulados_treino');
                  setAbaAtiva('simulado_tri');
                }}
              />
            )}
          </main>
        )}

        {/* 7. OPÇÕES GERAIS / HUB */}
        {primaryTab === 'opcoes_hub' && (
          <CentralDeOpcoesSection
            userProfile={userProfile}
            studyStreak={studyStreak}
            historyCount={materials.length + tutorPlans.length + eli5Explanations.length}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenHistory={() => setActiveModal('history')}
            onOpenHelp={() => setActiveModal('how_it_works')}
            onOpenOnboarding={() => setActiveModal('onboarding')}
            onOpenGabi={() => setActiveModal('gabi')}
            onOpenPro={() => setActiveModal('pro')}
            onGoHome={() => setPrimaryTab('home')}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigationBar
        activePrimaryTab={primaryTab}
        onSelectPrimaryTab={handleSelectPrimaryTab}
      />

      {/* Modals & Overlays */}
      <AnimatePresence>
        {/* Profile Settings Modal */}
        {activeModal === 'profile' && (
          <ProfileSettingsModal
            studyStreak={studyStreak}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenOnboarding={() => setActiveModal('onboarding')}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* PRO Subscription Modal */}
        {activeModal === 'pro' && (
          <ProSubscriptionModal onClose={() => setActiveModal(null)} />
        )}

        {/* Professora Gabi AI Assistant Modal */}
        {activeModal === 'gabi' && (
          <GabiAssistantModal
            initialPrompt={gabiInitialPrompt}
            onNavigateShortcut={(atalho) => {
              if (atalho === 'arena') {
                setPrimaryTab('arena');
              } else if (atalho === 'redacao') {
                setPrimaryTab('redacao_ia');
              } else if (atalho === 'simulados') {
                setPrimaryTab('simulados_treino');
              } else if (atalho === 'pro') {
                setActiveModal('pro');
                return;
              }
              setActiveModal(null);
            }}
            onClose={() => {
              setActiveModal(null);
              setGabiInitialPrompt(null);
            }}
          />
        )}

        {/* Onboarding Tutorial Modal */}
        {activeModal === 'onboarding' && (
          <OnboardingModal
            onSaveProfile={(updatedProfile) => {
              setUserProfile(updatedProfile);
            }}
            onOpenProfile={() => setActiveModal('profile')}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* History Modal */}
        {activeModal === 'history' && (
          <HistoryModal
            materials={materials}
            tutorPlans={tutorPlans}
            eli5Explanations={eli5Explanations}
            onSelectMaterial={(mat) => {
              setSelectedMaterial(mat);
              setActiveModal('interactive_quiz');
            }}
            onSelectTutorPlan={() => {
              setPrimaryTab('conteudos');
              setAbaAtiva('catalogo');
              setActiveModal(null);
            }}
            onSelectELI5={() => {
              setPrimaryTab('conteudos');
              setAbaAtiva('duvidas');
              setActiveModal(null);
            }}
            onDeleteMaterial={async (id) => {
              await deleteFromIndexedDB('materials', id);
              setMaterials((prev) => prev.filter((m) => m.id !== id));
            }}
            onDeleteTutorPlan={async (id) => {
              await deleteFromIndexedDB('tutor_plans', id);
              setTutorPlans((prev) => prev.filter((p) => p.id !== id));
            }}
            onDeleteELI5={async (id) => {
              await deleteFromIndexedDB('eli5_explanations', id);
              setEli5Explanations((prev) => prev.filter((e) => e.id !== id));
            }}
            onClearHistory={async (cat) => {
              if (cat === 'all') {
                await clearEntireIndexedDB();
                setMaterials([]);
                setTutorPlans([]);
                setEli5Explanations([]);
              } else if (cat === 'materials') {
                await clearIndexedDBStore('materials');
                setMaterials([]);
              } else if (cat === 'tutor') {
                await clearIndexedDBStore('tutor_plans');
                setTutorPlans([]);
              } else if (cat === 'eli5') {
                await clearIndexedDBStore('eli5_explanations');
                setEli5Explanations([]);
              }
            }}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* How It Works Tutorial Modal */}
        {activeModal === 'how_it_works' && (
          <HowItWorksModal
            onNavigateModule={(tab, sub) => {
              if (tab) setPrimaryTab(tab as any);
              if (sub) setAbaAtiva(sub as any);
              setActiveModal(null);
            }}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* Study Streak Calendar Modal */}
        {activeModal === 'calendar' && (
          <StudyCalendarModal
            studyStreak={studyStreak}
            onUpdateStreak={(newStreak) => setStudyStreak(newStreak)}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* Banca Personality Selector Modal */}
        {activeModal === 'banca' && (
          <BancaPersonalitySelectorModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* General Options Modal */}
        {activeModal === 'opcoes' && (
          <OpcoesGeraisModal
            isOpen={true}
            historyCount={materials.length + tutorPlans.length + eli5Explanations.length}
            studyStreak={studyStreak}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenProfile={() => setActiveModal('profile')}
            onOpenHistory={() => setActiveModal('history')}
            onOpenHelp={() => setActiveModal('how_it_works')}
            onOpenOnboarding={() => setActiveModal('onboarding')}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* Interactive Quiz Modal */}
        {activeModal === 'interactive_quiz' && selectedMaterial && (
          <InteractiveQuizModal
            material={selectedMaterial}
            onShare={(score, total, topic) => {
              setSocialStoryData({
                type: 'quiz',
                data: {
                  quizScore: score,
                  quizTotal: total,
                  quizTopic: topic,
                  quizPercent: Math.round((score / total) * 100),
                },
              });
              setActiveModal('social_story');
            }}
            onCompleted={() => {
              handleAddXP(50);
            }}
            onClose={() => {
              setActiveModal(null);
              setSelectedMaterial(null);
            }}
          />
        )}

        {/* Social Share Story Modal */}
        {activeModal === 'social_story' && (
          <SocialShareStoryModal
            type={socialStoryData?.type || 'mascote'}
            data={
              socialStoryData?.data || {
                mascotName: 'Gabaritão',
                streakDays: studyStreak,
                mascotXp: userXP,
              }
            }
            onClose={() => {
              setActiveModal(null);
              setSocialStoryData(null);
            }}
          />
        )}

        {/* Printable ENEM Essay Sheet Modal */}
        {activeModal === 'printable_sheet' && (
          <EnemPrintableSheetModal
            initialTheme={printSheetTheme}
            onClose={() => {
              setActiveModal(null);
              setPrintSheetTheme('');
            }}
          />
        )}

        {/* Microphone Permission Modal */}
        {activeModal === 'microphone' && (
          <MicrophonePermissionModal
            isOpen={true}
            onAllow={() => setActiveModal(null)}
            onDisallow={() => setActiveModal(null)}
          />
        )}

        {/* Gemini AI Studio Playground Settings Modal */}
        {activeModal === 'playground_settings' && (
          <PlaygroundSettingsModal
            apiKey={geminiApiKey}
            model={geminiModel}
            temperature={geminiTemperature}
            systemInstruction={geminiSystemInstruction}
            onSave={(settings) => {
              setGeminiApiKey(settings.apiKey);
              setGeminiModel(settings.model);
              setGeminiTemperature(settings.temperature);
              setGeminiSystemInstruction(settings.systemInstruction);

              try {
                localStorage.setItem('gabaritai_gemini_api_key', settings.apiKey);
                localStorage.setItem('gabaritai_gemini_model', settings.model);
                localStorage.setItem('gabaritai_gemini_temp', settings.temperature.toString());
                localStorage.setItem('gabaritai_gemini_sys_instruction', settings.systemInstruction);
              } catch (e) {
                console.error('Erro ao salvar preferências no localStorage:', e);
              }
            }}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
