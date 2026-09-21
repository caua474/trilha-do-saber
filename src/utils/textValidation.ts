/**
 * Utilitários de validação e sanitização robusta de texto
 * Evita o envio de mensagens vazias, sequências repetidas, caracteres de controle
 * ou conteúdos espúrios para as APIs do Gemini.
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedText: string;
  errorMessage?: string;
  warningMessage?: string;
}

/**
 * Remove caracteres de controle invisíveis ou potencialmente maliciosos,
 * normaliza quebras de linha e comprime espaços em branco excessivos.
 */
export function sanitizeInputText(rawText: string): string {
  if (!rawText) return '';

  return (
    rawText
      // Remove caracteres nulos e de controle C0/C1 (mantém apenas \n, \r, \t)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
      // Remove caracteres invisíveis / zero-width spaces / joiners
      .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '')
      // Normaliza quebras de linha Windows/Mac para \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Limita repetições abusivas de novas linhas consecutivas a no máximo duas
      .replace(/\n{3,}/g, '\n\n')
      // Comprime sequências exageradas de espaços em branco contínuos em uma linha
      .replace(/[ \t]{4,}/g, '   ')
      .trim()
  );
}

/**
 * Verifica se um texto consiste unicamente em pontuações, caracteres especiais,
 * emojis isolados ou repetição mecânica de um mesmo caractere (sem conteúdo linguístico útil).
 */
export function isMeaninglessText(text: string): { isMeaningless: boolean; reason?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isMeaningless: true, reason: 'O texto está vazio.' };
  }

  // Remove espaços e pontuações comuns para checar se sobra conteúdo alfanumérico
  const alphanumericOnly = trimmed.replace(/[\s.,;:!?@#$%&*()_+=\-[\]{}|\\/<>~`^'"]/g, '');
  if (alphanumericOnly.length === 0) {
    return {
      isMeaningless: true,
      reason: 'O texto contém apenas pontuações, símbolos ou espaços sem conteúdo inteligível.',
    };
  }

  // Detecta sequências exageradas de um único caractere repetido (ex: "aaaaaa", "11111111", "......")
  const collapsed = trimmed.replace(/\s+/g, '');
  if (collapsed.length >= 6) {
    const firstChar = collapsed[0];
    const allSame = collapsed.split('').every((c) => c === firstChar);
    if (allSame) {
      return {
        isMeaningless: true,
        reason: 'O texto contém repetições mecânicas de um mesmo caractere.',
      };
    }
  }

  // Detecta teclado martelado (ex: "asdfghjklasdfg" ou "qwertyuiop") sem vogais mínimas ou estrutura
  if (alphanumericOnly.length > 15) {
    const vowels = alphanumericOnly.match(/[aeiouyáéíóúãõâêîôûà]/gi);
    const vowelRatio = vowels ? vowels.length / alphanumericOnly.length : 0;
    // Em português ou espanhol/inglês, textos reais têm no mínimo 15% de vogais
    if (vowelRatio < 0.08) {
      return {
        isMeaningless: true,
        reason: 'O texto não parece conter palavras estruturadas ou compreensíveis.',
      };
    }
  }

  return { isMeaningless: false };
}

/**
 * Validação rigorosa para o Scanner Tira-Dúvidas (Professor Gabi).
 * Suporta entrada de texto puro OU foto isolada OU texto com foto.
 */
export function validateScannerInput(
  duvidaRaw: string,
  hasImage: boolean = false
): ValidationResult {
  const sanitized = sanitizeInputText(duvidaRaw);

  // Se o usuário anexou uma imagem válida, o texto é opcional ou complementar
  if (hasImage) {
    if (!sanitized) {
      return { isValid: true, sanitizedText: '' };
    }
    // Se digitou texto junto com a foto, checa se não é apenas caracteres maliciosos
    return { isValid: true, sanitizedText: sanitized };
  }

  // Sem imagem: o texto é obrigatório
  if (!sanitized) {
    return {
      isValid: false,
      sanitizedText: '',
      errorMessage: 'Por favor, digite sua dúvida ou adicione a foto de uma questão da prova/caderno.',
    };
  }

  if (sanitized.length < 2) {
    return {
      isValid: false,
      sanitizedText: sanitized,
      errorMessage: 'A pergunta é muito curta. Digite ao menos uma palavra ou enunciado com sentido.',
    };
  }

  const meaninglessCheck = isMeaninglessText(sanitized);
  if (meaninglessCheck.isMeaningless) {
    return {
      isValid: false,
      sanitizedText: sanitized,
      errorMessage: meaninglessCheck.reason || 'Por favor, digite uma dúvida ou questão com palavras inteligíveis.',
    };
  }

  return {
    isValid: true,
    sanitizedText: sanitized,
  };
}

/**
 * Validação rigorosa para a Redação Completa (0 a 1000 pontos no ENEM).
 */
export function validateEssayInput(
  textoRaw: string,
  temaRaw: string = ''
): ValidationResult {
  const sanitizedTexto = sanitizeInputText(textoRaw);
  const sanitizedTema = sanitizeInputText(temaRaw);

  if (!sanitizedTexto) {
    return {
      isValid: false,
      sanitizedText: '',
      errorMessage: 'Por favor, digite ou cole sua redação para iniciar a avaliação oficial do ENEM.',
    };
  }

  const palavras = sanitizedTexto.split(/\s+/).filter((w) => w.length > 0);

  if (sanitizedTexto.length < 120 || palavras.length < 25) {
    return {
      isValid: false,
      sanitizedText: sanitizedTexto,
      errorMessage: `Sua redação possui apenas ${palavras.length} palavras (${sanitizedTexto.length} caracteres). Para uma correção justa das 5 competências do ENEM, envie um texto com pelo menos 25 palavras.`,
    };
  }

  const meaninglessCheck = isMeaninglessText(sanitizedTexto);
  if (meaninglessCheck.isMeaningless) {
    return {
      isValid: false,
      sanitizedText: sanitizedTexto,
      errorMessage: meaninglessCheck.reason || 'O texto enviado não apresenta estrutura dissertativa válida.',
    };
  }

  // Verifica parágrafos mínimos ou quebras
  const paragrafos = sanitizedTexto.split(/\n+/).filter((p) => p.trim().length > 0);
  let warningMessage: string | undefined;
  if (paragrafos.length === 1 && palavras.length > 70) {
    warningMessage = 'Dica: Redações do ENEM geralmente possuem de 3 a 4 parágrafos (Introdução, Desenvolvimento e Conclusão).';
  }

  return {
    isValid: true,
    sanitizedText: sanitizedTexto,
    warningMessage,
  };
}

/**
 * Validação rigorosa para Competência Individual do ENEM (0 a 200 pontos).
 */
export function validateSingleCompetencyInput(
  textoRaw: string,
  competenciaNum: number = 5
): ValidationResult {
  const sanitized = sanitizeInputText(textoRaw);

  if (!sanitized) {
    return {
      isValid: false,
      sanitizedText: '',
      errorMessage: 'Por favor, insira o parágrafo ou trecho a ser avaliado para esta competência.',
    };
  }

  const palavras = sanitized.split(/\s+/).filter((w) => w.length > 0);

  if (sanitized.length < 30 || palavras.length < 7) {
    return {
      isValid: false,
      sanitizedText: sanitized,
      errorMessage: `O trecho inserido tem apenas ${palavras.length} palavras. Insira ao menos um período completo (mínimo de 7 palavras) para avaliação precisa.`,
    };
  }

  const meaninglessCheck = isMeaninglessText(sanitized);
  if (meaninglessCheck.isMeaningless) {
    return {
      isValid: false,
      sanitizedText: sanitized,
      errorMessage: meaninglessCheck.reason || 'O trecho inserido não contém palavras ou frases inteligíveis.',
    };
  }

  return {
    isValid: true,
    sanitizedText: sanitized,
  };
}
