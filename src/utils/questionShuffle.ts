/**
 * Utilitário de Embaralhamento Dinâmico (Shuffle) e Validação de Alternativas de Questões
 * 
 * Garante que:
 * 1. As alternativas (A, B, C, D, E) sejam embaralhadas aleatoriamente a cada exibição da questão.
 * 2. A resposta correta nunca fique presa a uma posição fixa (ex: sempre na letra A).
 * 3. A validação acompanhe precisamente o texto/identificador da alternativa correta.
 */

export interface ShuffledOptionsData {
  /** Lista de opções com prefixos de letras recalculados (ex: ['A) ...', 'B) ...']) */
  options: string[];
  /** Lista com os textos puros das opções (sem o prefixo 'A) ') */
  rawOptions: string[];
  /** O novo índice numérico onde a resposta correta se encontra após o shuffle (0 a N-1) */
  correctIndex: number;
  /** O texto completo da alternativa correta (com o novo prefixo 'X) ...') */
  correctOptionWithPrefix: string;
  /** O texto limpo da alternativa correta (sem prefixo de letra) */
  correctRawText: string;
  /** Mapeamento de cada índice embaralhado para o seu índice original correspondente */
  originalIndices: number[];
}

const LETTER_PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Remove prefixos de alternativas como 'A) ', 'B. ', 'c) ', '[A] ', '1. ', etc.
 */
export function cleanOptionPrefix(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^\s*(?:\[?[A-Ha-h0-9][\)\.\:\-\]]|\([A-Ha-h0-9]\))\s*/, '')
    .trim();
}

/**
 * Embaralha um array usando o algoritmo Fisher-Yates
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Embaralha dinamicamente as opções de uma questão e recalcula os mapeamentos de resposta correta.
 *
 * @param rawOptions Array com as opções originais da questão
 * @param correctIdentifier Pode ser o índice original (number) ou o texto/letra da resposta correta (string)
 */
export function shuffleQuestionOptions(
  rawOptions: string[] | undefined | null,
  correctIdentifier: number | string
): ShuffledOptionsData {
  if (!rawOptions || !Array.isArray(rawOptions) || rawOptions.length === 0) {
    return {
      options: [],
      rawOptions: [],
      correctIndex: 0,
      correctOptionWithPrefix: '',
      correctRawText: '',
      originalIndices: [],
    };
  }

  // Identificar qual era o índice correto original
  let originalCorrectIndex = 0;

  if (typeof correctIdentifier === 'number') {
    originalCorrectIndex = Math.max(0, Math.min(correctIdentifier, rawOptions.length - 1));
  } else if (typeof correctIdentifier === 'string') {
    const cleanTarget = cleanOptionPrefix(correctIdentifier).toLowerCase();
    const letterMatch = correctIdentifier.trim().match(/^([A-Ea-e])[\)\.\:\-\s]/);

    let foundIdx = -1;

    // Tentar correspondência direta de texto
    for (let i = 0; i < rawOptions.length; i++) {
      const cleanOpt = cleanOptionPrefix(rawOptions[i]).toLowerCase();
      if (cleanOpt === cleanTarget || (cleanTarget && cleanOpt.includes(cleanTarget)) || (cleanTarget && cleanTarget.includes(cleanOpt))) {
        foundIdx = i;
        break;
      }
    }

    // Se não achou por texto, verificar se era uma letra inicial (A, B, C, D, E)
    if (foundIdx === -1 && letterMatch) {
      const letter = letterMatch[1].toUpperCase();
      const letterIdx = LETTER_PREFIXES.indexOf(letter);
      if (letterIdx >= 0 && letterIdx < rawOptions.length) {
        foundIdx = letterIdx;
      }
    }

    originalCorrectIndex = foundIdx !== -1 ? foundIdx : 0;
  }

  // Criar itens com metadados para rastreamento
  const items = rawOptions.map((opt, origIdx) => {
    const cleanText = cleanOptionPrefix(opt);
    return {
      origIdx,
      cleanText: cleanText || opt,
      isCorrect: origIdx === originalCorrectIndex,
    };
  });

  // Embaralhar os itens
  const shuffledItems = fisherYatesShuffle(items);

  // Formatar com novos prefixos de letras
  const formattedOptions: string[] = [];
  const rawCleanOptions: string[] = [];
  const originalIndices: number[] = [];
  let newCorrectIndex = 0;
  let correctRawText = '';
  let correctOptionWithPrefix = '';

  shuffledItems.forEach((item, newIdx) => {
    const letter = LETTER_PREFIXES[newIdx] || `${newIdx + 1}`;
    const formatted = `${letter}) ${item.cleanText}`;

    formattedOptions.push(formatted);
    rawCleanOptions.push(item.cleanText);
    originalIndices.push(item.origIdx);

    if (item.isCorrect) {
      newCorrectIndex = newIdx;
      correctRawText = item.cleanText;
      correctOptionWithPrefix = formatted;
    }
  });

  return {
    options: formattedOptions,
    rawOptions: rawCleanOptions,
    correctIndex: newCorrectIndex,
    correctOptionWithPrefix,
    correctRawText,
    originalIndices,
  };
}

/**
 * Validador universal que compara a escolha do usuário com a resposta correta
 */
export function checkAnswerCorrectness(
  userSelection: number | string | null | undefined,
  shuffledData: ShuffledOptionsData
): boolean {
  if (userSelection === null || userSelection === undefined) return false;

  if (typeof userSelection === 'number') {
    return userSelection === shuffledData.correctIndex;
  }

  if (typeof userSelection === 'string') {
    const cleanUser = cleanOptionPrefix(userSelection).trim().toLowerCase();
    const cleanCorrect = shuffledData.correctRawText.trim().toLowerCase();
    if (cleanUser && cleanCorrect && cleanUser === cleanCorrect) return true;

    // Também compara com a opção completa
    if (userSelection.trim() === shuffledData.correctOptionWithPrefix.trim()) return true;

    // Compara letra de seleção
    const letterMatch = userSelection.trim().match(/^([A-Ea-e])/);
    if (letterMatch) {
      const letter = letterMatch[1].toUpperCase();
      const letterIdx = LETTER_PREFIXES.indexOf(letter);
      return letterIdx === shuffledData.correctIndex;
    }
  }

  return false;
}

/**
 * Rotaciona um array a partir de um ponto de início (offset) aleatório ou especificado.
 * Isso garante que a visualização não comece sempre na mesma questão.
 */
export function rotateArray<T>(array: T[], offset?: number): T[] {
  if (!array || array.length <= 1) return [...array];
  const start = offset !== undefined 
    ? ((offset % array.length) + array.length) % array.length 
    : Math.floor(Math.random() * array.length);
  return [...array.slice(start), ...array.slice(0, start)];
}

/**
 * Embaralha uma lista completa de questões locais/offline e opcionalmente varia o ponto de início (offset).
 * Garante que o usuário nunca veja a mesma lista na mesma ordem.
 */
export function shuffleAndRotateQuestions<T>(
  list: T[],
  options?: {
    shuffleOrder?: boolean;
    randomizeStart?: boolean;
    offset?: number;
  }
): T[] {
  if (!list || list.length === 0) return [];
  const shouldShuffle = options?.shuffleOrder !== false;
  const shouldRandomizeStart = options?.randomizeStart !== false;

  let result = shouldShuffle ? fisherYatesShuffle(list) : [...list];

  if (shouldRandomizeStart && result.length > 1) {
    result = rotateArray(result, options?.offset);
  }

  return result;
}

/**
 * Embaralha a ordem das questões e, para cada questão, embaralha também suas alternativas (A, B, C, D, E),
 * recalculando o índice correto.
 */
export function prepareQuestionsWithFullShuffle<T extends { opcoes?: string[]; resposta_correta_index?: number; [key: string]: any }>(
  list: T[],
  options?: {
    randomizeListOrder?: boolean;
    randomizeStart?: boolean;
    shuffleOptions?: boolean;
  }
): T[] {
  if (!list || list.length === 0) return [];

  // 1. Embaralhar ordem da lista e rotacionar ponto de início
  const orderedList = shuffleAndRotateQuestions(list, {
    shuffleOrder: options?.randomizeListOrder !== false,
    randomizeStart: options?.randomizeStart !== false,
  });

  // 2. Se shuffleOptions for habilitado, recalcular alternativas e gabarito de cada item
  if (options?.shuffleOptions === false) {
    return orderedList;
  }

  return orderedList.map((q) => {
    if (!q.opcoes || !Array.isArray(q.opcoes) || q.opcoes.length === 0 || q.resposta_correta_index === undefined) {
      return q;
    }
    const shuffled = shuffleQuestionOptions(q.opcoes, q.resposta_correta_index);
    return {
      ...q,
      opcoes: shuffled.options,
      resposta_correta_index: shuffled.correctIndex,
    };
  });
}
