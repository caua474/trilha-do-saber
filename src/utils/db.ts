import { StudyMaterial, TutorPlan, ELI5Explanation, QuizResultLog, DuelResultLog, TopDuelist } from '../types';

const DB_NAME = 'AssistenteEstudosDB';
const DB_VERSION = 3;

export const STORES = {
  MATERIALS: 'materials',
  TUTOR_PLANS: 'tutor_plans',
  ELI5_EXPLANATIONS: 'eli5_explanations',
  QUIZ_RESULTS: 'quiz_results',
  DUEL_RESULTS: 'duel_results',
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB não é suportado neste navegador.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error('Erro ao abrir banco de dados IndexedDB.'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: materials (Resumos e Flashcards)
      if (!db.objectStoreNames.contains(STORES.MATERIALS)) {
        const materialStore = db.createObjectStore(STORES.MATERIALS, { keyPath: 'id' });
        materialStore.createIndex('createdAt', 'createdAt', { unique: false });
        materialStore.createIndex('title', 'title', { unique: false });
      }

      // Store 2: tutor_plans (Planos do Coach e Tutor)
      if (!db.objectStoreNames.contains(STORES.TUTOR_PLANS)) {
        const tutorStore = db.createObjectStore(STORES.TUTOR_PLANS, { keyPath: 'id' });
        tutorStore.createIndex('createdAt', 'createdAt', { unique: false });
        tutorStore.createIndex('materia', 'materia', { unique: false });
      }

      // Store 3: eli5_explanations (Explicações Tira-Dúvidas ELI5)
      if (!db.objectStoreNames.contains(STORES.ELI5_EXPLANATIONS)) {
        const eli5Store = db.createObjectStore(STORES.ELI5_EXPLANATIONS, { keyPath: 'id' });
        eli5Store.createIndex('createdAt', 'createdAt', { unique: false });
        eli5Store.createIndex('duvida', 'duvida', { unique: false });
      }

      // Store 4: quiz_results (Histórico de Quizzes & Simulados TRI)
      if (!db.objectStoreNames.contains(STORES.QUIZ_RESULTS)) {
        const quizStore = db.createObjectStore(STORES.QUIZ_RESULTS, { keyPath: 'id' });
        quizStore.createIndex('createdAt', 'createdAt', { unique: false });
        quizStore.createIndex('materia', 'materia', { unique: false });
      }

      // Store 5: duel_results (Histórico de Duelos e Batalhas X1)
      if (!db.objectStoreNames.contains(STORES.DUEL_RESULTS)) {
        const duelStore = db.createObjectStore(STORES.DUEL_RESULTS, { keyPath: 'id' });
        duelStore.createIndex('createdAt', 'createdAt', { unique: false });
        duelStore.createIndex('materia', 'materia', { unique: false });
        duelStore.createIndex('winner', 'winner', { unique: false });
      }
    };
  });
}

/**
 * Migration helper: Move any old localStorage materials into IndexedDB seamlessly.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  try {
    const oldHistoryKey = 'assistente_estudos_bento_history_v1';
    const saved = localStorage.getItem(oldHistoryKey);
    if (saved) {
      const materials: StudyMaterial[] = JSON.parse(saved);
      if (Array.isArray(materials) && materials.length > 0) {
        for (const mat of materials) {
          await saveMaterial(mat);
        }
      }
      // Remove old localStorage key once migrated
      localStorage.removeItem(oldHistoryKey);
    }
  } catch (err) {
    console.warn('Aviso na migração do localStorage para IndexedDB:', err);
  }
}

// -------------------------------------------------------------
// Materials Store Operations
// -------------------------------------------------------------

export async function saveMaterial(material: StudyMaterial): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MATERIALS, 'readwrite');
    const store = transaction.objectStore(STORES.MATERIALS);
    const request = store.put(material);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllMaterials(): Promise<StudyMaterial[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MATERIALS, 'readonly');
    const store = transaction.objectStore(STORES.MATERIALS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as StudyMaterial[]) || [];
      // Sort newest first
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MATERIALS, 'readwrite');
    const store = transaction.objectStore(STORES.MATERIALS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllMaterials(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.MATERIALS, 'readwrite');
    const store = transaction.objectStore(STORES.MATERIALS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// Tutor Plans Store Operations
// -------------------------------------------------------------

export async function saveTutorPlan(plan: TutorPlan): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TUTOR_PLANS, 'readwrite');
    const store = transaction.objectStore(STORES.TUTOR_PLANS);
    const request = store.put(plan);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllTutorPlans(): Promise<TutorPlan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TUTOR_PLANS, 'readonly');
    const store = transaction.objectStore(STORES.TUTOR_PLANS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as TutorPlan[]) || [];
      // Sort newest first
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTutorPlan(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TUTOR_PLANS, 'readwrite');
    const store = transaction.objectStore(STORES.TUTOR_PLANS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllTutorPlans(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TUTOR_PLANS, 'readwrite');
    const store = transaction.objectStore(STORES.TUTOR_PLANS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// ELI5 Explanations Store Operations
// -------------------------------------------------------------

export async function saveELI5Explanation(explanation: ELI5Explanation): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ELI5_EXPLANATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.ELI5_EXPLANATIONS);
    const request = store.put(explanation);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllELI5Explanations(): Promise<ELI5Explanation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ELI5_EXPLANATIONS, 'readonly');
    const store = transaction.objectStore(STORES.ELI5_EXPLANATIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as ELI5Explanation[]) || [];
      // Sort newest first
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteELI5Explanation(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ELI5_EXPLANATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.ELI5_EXPLANATIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllELI5Explanations(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ELI5_EXPLANATIONS, 'readwrite');
    const store = transaction.objectStore(STORES.ELI5_EXPLANATIONS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// Quiz Results Store Operations
// -------------------------------------------------------------

export async function saveQuizResult(log: QuizResultLog): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.QUIZ_RESULTS, 'readwrite');
    const store = transaction.objectStore(STORES.QUIZ_RESULTS);
    const request = store.put(log);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllQuizResults(): Promise<QuizResultLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.QUIZ_RESULTS, 'readonly');
    const store = transaction.objectStore(STORES.QUIZ_RESULTS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as QuizResultLog[]) || [];
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getTodayQuizCount(): Promise<number> {
  try {
    const all = await getAllQuizResults();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayQuizzes = all.filter((item) => {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
      return itemDate === todayStr;
    });
    return todayQuizzes.length;
  } catch (err) {
    console.warn('Erro ao obter contagem de quizzes de hoje:', err);
    return 0;
  }
}

export async function clearAllQuizResults(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.QUIZ_RESULTS, 'readwrite');
    const store = transaction.objectStore(STORES.QUIZ_RESULTS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// Duel Results Store Operations (Batalhas 1v1 e Arena)
// -------------------------------------------------------------

export async function saveDuelResult(duel: DuelResultLog): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.DUEL_RESULTS, 'readwrite');
    const store = transaction.objectStore(STORES.DUEL_RESULTS);
    const request = store.put(duel);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDuelResults(): Promise<DuelResultLog[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.DUEL_RESULTS, 'readonly');
    const store = transaction.objectStore(STORES.DUEL_RESULTS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as DuelResultLog[]) || [];
      // Sort newest first
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllDuelResults(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.DUEL_RESULTS, 'readwrite');
    const store = transaction.objectStore(STORES.DUEL_RESULTS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

const BASE_WEEKLY_DUELISTS: Omit<TopDuelist, 'rank'>[] = [
  {
    id: 'top_1',
    name: 'Lucas Ferreira',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    elo: 'Mestre Federal',
    vitorias: 42,
    derrotas: 4,
    pontos: 4850,
    xpSemanal: 1420,
    winRate: 91,
    uf: 'SP',
    curso: 'Medicina • USP',
    badge: '🥇 Líder da Semana',
    recentMateria: 'Biologia & Genética',
  },
  {
    id: 'top_2',
    name: 'Mariana Souza',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    elo: 'Diamante I',
    vitorias: 37,
    derrotas: 6,
    pontos: 4210,
    xpSemanal: 1250,
    winRate: 86,
    uf: 'MG',
    curso: 'Direito • UFMG',
    badge: '🥈 Vice-Líder',
    recentMateria: 'História do Brasil',
  },
  {
    id: 'top_3',
    name: 'Gabriel Pires',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    elo: 'Diamante II',
    vitorias: 31,
    derrotas: 8,
    pontos: 3680,
    xpSemanal: 980,
    winRate: 79,
    uf: 'RJ',
    curso: 'Eng. Aeronáutica • ITA',
    badge: '🥉 Pódio Semanal',
    recentMateria: 'Física & Mecânica',
  },
  {
    id: 'top_4',
    name: 'Beatriz Lima',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    elo: 'Platina I',
    vitorias: 26,
    derrotas: 7,
    pontos: 3150,
    xpSemanal: 840,
    winRate: 78,
    uf: 'DF',
    curso: 'Psicologia • UnB',
    badge: 'Top 5',
    recentMateria: 'Português & Redação',
  },
  {
    id: 'top_5',
    name: 'Rafael Castilho',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    elo: 'Platina II',
    vitorias: 22,
    derrotas: 9,
    pontos: 2790,
    xpSemanal: 710,
    winRate: 71,
    uf: 'PR',
    curso: 'Ciência da Computação • UFPR',
    badge: 'Top 10',
    recentMateria: 'Matemática & Funções',
  },
  {
    id: 'top_6',
    name: 'Camila Rocha',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    elo: 'Ouro I',
    vitorias: 18,
    derrotas: 8,
    pontos: 2340,
    xpSemanal: 590,
    winRate: 69,
    uf: 'RS',
    curso: 'Biomedicina • UFRGS',
    badge: 'Em Ascensão 🔥',
    recentMateria: 'Química Orgânica',
  },
];

/**
 * Calculates top duelists by consuming real local IndexedDB duel logs and combining with weekly leaderboard.
 */
export async function getTopDuelistsThisWeek(currentUserName = 'Você'): Promise<{
  leaderboard: TopDuelist[];
  recentDuels: DuelResultLog[];
  userStats: {
    totalDuels: number;
    wins: number;
    defeats: number;
    ties: number;
    winRate: number;
    weeklyPoints: number;
    weeklyXp: number;
    currentRank: number;
  };
}> {
  let localDuels: DuelResultLog[] = [];
  try {
    localDuels = await getAllDuelResults();
  } catch (err) {
    console.warn('Erro ao carregar duelos do IndexedDB:', err);
  }

  // Count user wins, defeats, ties from local DB
  let userWins = 0;
  let userDefeats = 0;
  let userTies = 0;
  let userPoints = 0;
  let userWeeklyXp = 0;

  localDuels.forEach((duel) => {
    if (duel.winner === 'player1') {
      userWins++;
      userPoints += 150 + duel.player1Score * 20;
      userWeeklyXp += duel.xpAwarded || 100;
    } else if (duel.winner === 'player2') {
      userDefeats++;
      userPoints += duel.player1Score * 10;
      userWeeklyXp += Math.round((duel.xpAwarded || 100) * 0.4);
    } else {
      userTies++;
      userPoints += 50 + duel.player1Score * 15;
      userWeeklyXp += Math.round((duel.xpAwarded || 100) * 0.6);
    }
  });

  const totalUserDuels = userWins + userDefeats + userTies;
  const userWinRate = totalUserDuels > 0 ? Math.round((userWins / totalUserDuels) * 100) : 0;

  // Base user stats starting with initial profile experience
  const baseUserPoints = 1850;
  const baseUserWins = 14;
  const baseUserDefeats = 4;
  const combinedWins = baseUserWins + userWins;
  const combinedDefeats = baseUserDefeats + userDefeats;
  const combinedPoints = baseUserPoints + userPoints;
  const combinedXp = 450 + userWeeklyXp;
  const combinedTotal = combinedWins + combinedDefeats + userTies;
  const combinedWinRate = combinedTotal > 0 ? Math.round((combinedWins / combinedTotal) * 100) : 77;

  // Build the user entry
  const userEntry: Omit<TopDuelist, 'rank'> = {
    id: 'user_current',
    name: currentUserName === 'Você' ? 'Você (Aluno GabaritaAí)' : `${currentUserName} (Você)`,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    elo: combinedPoints >= 4000 ? 'Diamante I' : combinedPoints >= 3000 ? 'Platina I' : 'Ouro II',
    vitorias: combinedWins,
    derrotas: combinedDefeats,
    pontos: combinedPoints,
    xpSemanal: combinedXp,
    winRate: combinedWinRate,
    isCurrentUser: true,
    uf: 'BR',
    curso: 'Medicina • SISU',
    badge: 'Desafiante Ativo ⚡',
    recentMateria: localDuels.length > 0 ? localDuels[0].materia : 'Simulado Geral',
  };

  // Combine and sort by points descending
  const allDuelists = [...BASE_WEEKLY_DUELISTS, userEntry].sort((a, b) => b.pontos - a.pontos);

  // Assign ranks
  const rankedList: TopDuelist[] = allDuelists.map((d, index) => ({
    ...d,
    rank: index + 1,
    badge: index === 0 ? '🥇 1º Lugar (Ouro)' : index === 1 ? '🥈 2º Lugar (Prata)' : index === 2 ? '🥉 3º Lugar (Bronze)' : d.badge,
  }));

  const userRank = rankedList.findIndex((d) => d.isCurrentUser) + 1;

  return {
    leaderboard: rankedList,
    recentDuels: localDuels.slice(0, 10),
    userStats: {
      totalDuels: combinedTotal,
      wins: combinedWins,
      defeats: combinedDefeats,
      ties: userTies,
      winRate: combinedWinRate,
      weeklyPoints: combinedPoints,
      weeklyXp: combinedXp,
      currentRank: userRank > 0 ? userRank : 5,
    },
  };
}

// -------------------------------------------------------------
// Clear Entire DB
// -------------------------------------------------------------

export async function clearEntireDatabase(): Promise<void> {
  await clearAllMaterials();
  await clearAllTutorPlans();
  await clearAllELI5Explanations();
  await clearAllQuizResults();
  await clearAllDuelResults();
}

