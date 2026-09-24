/**
 * Serviço centralizado do cliente Gemini para a plataforma Gabaritou.
 * 
 * Implementa cliente robusto com:
 * - Uso prioritário e forçado do modelo 'gemini-1.5-flash'.
 * - Tratamento explícito de erros HTTP (405 Method Not Allowed, 401 Unauthorized, 500 Internal Server Error).
 * - Retentativas automáticas e contingências seguras para estabilidade de rede.
 * - Centralização de todas as chamadas espalhadas nos componentes.
 */

export const FORCED_GEMINI_MODEL = 'gemini-1.5-flash';

export class GeminiServiceError extends Error {
  status?: number;
  code?: string;
  originalError?: any;

  constructor(message: string, status?: number, code?: string, originalError?: any) {
    super(message);
    this.name = 'GeminiServiceError';
    this.status = status;
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Recupera a chave de API configurada no cliente (localStorage ou variável de ambiente).
 */
export function getGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('gabaritai_gemini_api_key');
    if (saved && saved.trim() && saved.trim() !== '5,00') {
      return saved.trim();
    }
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

/**
 * Salva ou limpa a chave de API do Gemini no armazenamento local.
 */
export function setGeminiApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    if (!apiKey || !apiKey.trim()) {
      localStorage.removeItem('gabaritai_gemini_api_key');
    } else {
      localStorage.setItem('gabaritai_gemini_api_key', apiKey.trim());
    }
  }
}

interface RequestOptions {
  method?: 'POST' | 'GET';
  apiKey?: string;
  customHeaders?: Record<string, string>;
  timeoutMs?: number;
  forceModel?: string;
  skipRetry?: boolean;
}

/**
 * Cliente central e robusto para comunicação com as rotas de IA da aplicação.
 * Trata erros 401, 405 e 500 com mensagens amigáveis e recuperação automática.
 */
export async function callGeminiApi<T = any>(
  endpoint: string,
  body: Record<string, any> = {},
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; [key: string]: any }> {
  const modelToUse = options.forceModel || FORCED_GEMINI_MODEL;
  const apiKey = (options.apiKey || getGeminiApiKey() || '').trim();
  const timeoutMs = options.timeoutMs || 25000;

  // Garante que o payload envie o modelo forçado 'gemini-1.5-flash'
  const enhancedBody: Record<string, any> = {
    ...body,
    model: modelToUse,
    preferredModel: modelToUse,
  };

  if (apiKey) {
    enhancedBody.apiKey = apiKey;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-gemini-model': modelToUse,
    ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
    ...(options.customHeaders || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: options.method || 'POST',
      headers,
      body: JSON.stringify(enhancedBody),
      signal: controller.signal,
    });
  } catch (netErr: any) {
    clearTimeout(timeoutId);
    if (netErr.name === 'AbortError') {
      throw new GeminiServiceError(
        `Tempo limite esgotado ao aguardar resposta do Gemini (${timeoutMs / 1000}s). Tente novamente.`,
        408,
        'TIMEOUT',
        netErr
      );
    }
    throw new GeminiServiceError(
      `Falha na conexão de rede com a API: ${netErr.message || 'Sem conexão com a internet.'}`,
      0,
      'NETWORK_ERROR',
      netErr
    );
  } finally {
    clearTimeout(timeoutId);
  }

  // Tratamento específico de status HTTP: 401, 405, 500
  if (response.status === 401) {
    throw new GeminiServiceError(
      'Não Autorizado (401): A chave de API do Gemini informada é inválida ou expirou. Por favor, acerte sua chave de API nas Configurações da IA.',
      401,
      'UNAUTHORIZED'
    );
  }

  if (response.status === 405) {
    // 405 Method Not Allowed
    console.warn(`[geminiService] Erro 405 em ${endpoint}. Verificando método HTTP.`);
    throw new GeminiServiceError(
      `Método Não Permitido (405): O servidor não aceitou a requisição no endpoint ${endpoint}.`,
      405,
      'METHOD_NOT_ALLOWED'
    );
  }

  if (response.status >= 500) {
    // Se for 500 e não for retry, tenta mais uma vez rapidamente após um breve delay
    if (!options.skipRetry) {
      console.warn(`[geminiService] Status 500 em ${endpoint}. Tentando retentativa de contingência...`);
      await new Promise((r) => setTimeout(r, 600));
      return callGeminiApi<T>(endpoint, body, { ...options, skipRetry: true });
    }

    let serverErrMsg = 'Erro interno nos servidores da IA (500).';
    try {
      const errJson = await response.json();
      if (errJson.error) serverErrMsg = errJson.error;
    } catch (_) {}

    throw new GeminiServiceError(
      `Erro no Servidor (500): ${serverErrMsg}`,
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  // Parse seguro do corpo da resposta
  let jsonResult: any;
  const rawText = await response.text();
  try {
    jsonResult = JSON.parse(rawText);
  } catch (parseErr) {
    // Tentativa de reparo caso venha com marcações ou texto adicional
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        jsonResult = JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
      } catch (_) {
        throw new GeminiServiceError(
          'Resposta recebida não está em formato JSON válido.',
          response.status,
          'INVALID_JSON',
          parseErr
        );
      }
    } else {
      throw new GeminiServiceError(
        'Resposta vazia ou corrompida do servidor.',
        response.status,
        'INVALID_RESPONSE',
        parseErr
      );
    }
  }

  if (!response.ok) {
    const errorMsg = jsonResult?.error || `Erro na requisição (${response.status})`;
    throw new GeminiServiceError(errorMsg, response.status, 'REQUEST_FAILED');
  }

  return jsonResult;
}

// ==========================================
// FUNÇÕES DE DOMÍNIO CENTRALIZADAS
// ==========================================

export interface GabiChatParams {
  pergunta: string;
  apiKey?: string;
  history?: Array<{ sender: string; text: string }>;
}

export interface GabiChatResult {
  resposta_suporte: string;
  botao_atalho?: string;
}

/**
 * Envia mensagem para a tutora Professora Gabi (/api/gabi-support).
 */
export async function chatWithGabi(params: GabiChatParams): Promise<GabiChatResult> {
  const result = await callGeminiApi<GabiChatResult>('/api/gabi-support', {
    pergunta: params.pergunta,
    apiKey: params.apiKey,
    history: params.history,
  });

  if (result.data) {
    return result.data;
  }
  return {
    resposta_suporte: result.reply || result.text || 'Aqui está a sua resposta!',
    botao_atalho: result.botao_atalho || 'nenhum',
  };
}

export interface SolveQuestionParams {
  duvida: string;
  imagemBase64?: string | null;
  apiKey?: string;
}

/**
 * Resolve questão enviada por foto ou texto com resolução passo a passo (/api/solve-question).
 */
export async function solveQuestion(params: SolveQuestionParams): Promise<any> {
  const result = await callGeminiApi('/api/solve-question', {
    duvida: params.duvida.trim(),
    imagemBase64: params.imagemBase64 || undefined,
    apiKey: params.apiKey,
  });

  return result.data || result;
}

export interface SimuladoTriGenerateParams {
  area?: string;
  materiaFocus?: string;
  quantidade?: number;
}

/**
 * Gera questões de Simulado TRI calibradas por parâmetros (/api/generate-simulado-tri).
 */
export async function generateSimuladoTri(params: SimuladoTriGenerateParams): Promise<any> {
  const result = await callGeminiApi('/api/generate-simulado-tri', {
    area: params.area,
    materiaFocus: params.materiaFocus,
    quantidade: params.quantidade,
  });

  return result.data || result;
}

export interface SimuladoTriEvaluateParams {
  area?: string;
  respostas: Array<{ id: number; dificuldade: string; acertou: boolean }>;
}

/**
 * Avalia o simulado calculando a Nota TRI paramétrica oficial (/api/evaluate-simulado-tri).
 */
export async function evaluateSimuladoTri(params: SimuladoTriEvaluateParams): Promise<any> {
  const result = await callGeminiApi('/api/evaluate-simulado-tri', {
    area: params.area,
    respostas: params.respostas,
  });

  return result.data || result;
}

export interface AnalyzeEssayParams {
  texto: string;
  tema?: string;
}

/**
 * Realiza a correção completa da redação do ENEM nas 5 competências (/api/analyze-essay).
 */
export async function analyzeEssay(params: AnalyzeEssayParams): Promise<any> {
  const result = await callGeminiApi('/api/analyze-essay', {
    texto: params.texto,
    tema: params.tema,
  });

  return result.data || result;
}

export interface AnalyzeSingleCompetencyParams {
  texto: string;
  competencia: number;
  tema?: string;
}

/**
 * Corrige uma única competência do ENEM detalhadamente (/api/analyze-single-competency).
 */
export async function analyzeSingleCompetency(params: AnalyzeSingleCompetencyParams): Promise<any> {
  const result = await callGeminiApi('/api/analyze-single-competency', {
    texto: params.texto,
    competencia: params.competencia,
    tema: params.tema,
  });

  return result.data || result;
}

export interface FeynmanEvaluateParams {
  pergunta: string;
  conceitosChave: string[];
  transcriptText: string;
}

/**
 * Avalia a explicação verbal do aluno no Método Feynman (/api/feynman-evaluate).
 */
export async function evaluateFeynmanAudio(params: FeynmanEvaluateParams): Promise<any> {
  const result = await callGeminiApi('/api/feynman-evaluate', {
    pergunta: params.pergunta,
    conceitosChave: params.conceitosChave,
    transcriptText: params.transcriptText,
  });

  return result.data || result;
}

export interface GenerateFlashcardsParams {
  materia: string;
  topico: string;
  quantidade?: number;
}

/**
 * Gera um baralho de flashcards por matéria e tópico (/api/generate-flashcards).
 */
export async function generateFlashcards(params: GenerateFlashcardsParams): Promise<any> {
  const result = await callGeminiApi('/api/generate-flashcards', {
    materia: params.materia,
    topico: params.topico,
    quantidade: params.quantidade,
  });

  return result.data || result;
}

export interface AutoFlashcardsParams {
  texto?: string;
  imagemBase64?: string | null;
  materia?: string;
}

/**
 * Extrai automaticamente flashcards a partir de texto ou foto de apostila (/api/auto-flashcards).
 */
export async function generateAutoFlashcards(params: AutoFlashcardsParams): Promise<any> {
  const result = await callGeminiApi('/api/auto-flashcards', {
    texto: params.texto,
    imagemBase64: params.imagemBase64 || undefined,
    materia: params.materia,
  });

  return result.data || result;
}

export interface GenerateCheatSheetParams {
  materia: string;
  topico?: string;
}

/**
 * Gera folha de véspera / cheat sheet de 1 página (/api/generate-cheatsheet).
 */
export async function generateCheatSheet(params: GenerateCheatSheetParams): Promise<any> {
  const result = await callGeminiApi('/api/generate-cheatsheet', {
    materia: params.materia,
    topico: params.topico,
  });

  return result.data || result;
}

export interface DevilAdvocateParams {
  tema: string;
  tese: string;
  historico?: any[];
}

/**
 * Simula o debate socrático com o Advogado do Diabo da redação (/api/devil-advocate-debate).
 */
export async function devilAdvocateDebate(params: DevilAdvocateParams): Promise<any> {
  const result = await callGeminiApi('/api/devil-advocate-debate', {
    tema: params.tema,
    tese: params.tese,
    historico: params.historico,
  });

  return result.data || result;
}

export interface DetectC5Params {
  textoConclusao: string;
}

/**
 * Analisa e pontua os 5 elementos da Competência 5 do ENEM (/api/detect-c5-intervention).
 */
export async function detectC5Intervention(params: DetectC5Params): Promise<any> {
  const result = await callGeminiApi('/api/detect-c5-intervention', {
    textoConclusao: params.textoConclusao,
  });

  return result.data || result;
}

export interface ScanAnswerSheetParams {
  imagemBase64: string;
  gabaritoOficial?: any;
}

/**
 * Realiza leitura óptica do cartão-resposta por foto (/api/scan-answer-sheet).
 */
export async function scanAnswerSheet(params: ScanAnswerSheetParams): Promise<any> {
  const result = await callGeminiApi('/api/scan-answer-sheet', {
    imagemBase64: params.imagemBase64,
    gabaritoOficial: params.gabaritoOficial,
  });

  return result.data || result;
}

export interface GenerateQuizBattleParams {
  materia: string;
  topico?: string;
  criador?: string;
}

/**
 * Gera questões competitivas para o modo Batalha 1v1 (/api/generate-quiz-battle).
 */
export async function generateQuizBattle(params: GenerateQuizBattleParams): Promise<any> {
  const result = await callGeminiApi('/api/generate-quiz-battle', {
    materia: params.materia,
    topico: params.topico,
    criador: params.criador,
  });

  return result.data || result;
}

export interface PersonalizedKnowledgePillParams {
  lowestSubjects?: any[];
  customTopic?: string;
}

/**
 * Gera a pílula de conhecimento diária personalizada (/api/personalized-knowledge-pill).
 */
export async function getPersonalizedKnowledgePill(params: PersonalizedKnowledgePillParams): Promise<any> {
  const result = await callGeminiApi('/api/personalized-knowledge-pill', {
    lowestSubjects: params.lowestSubjects,
    customTopic: params.customTopic,
  });

  return result.data || result;
}

export interface DayNightModeParams {
  mensagem: string;
}

/**
 * Consulta a IA para alternância dinâmica de modo dia/noite (/api/day-night-mode).
 */
export async function getDayNightMode(params: DayNightModeParams): Promise<any> {
  const result = await callGeminiApi('/api/day-night-mode', {
    mensagem: params.mensagem,
  });

  return result.data || result;
}

export interface ChatMessageApiParams {
  message: string;
  history?: any[];
}

/**
 * Conversa com o chat contextual de tutoria ou biblioteca (/api/chat).
 */
export async function askGeminiChat(params: ChatMessageApiParams): Promise<string> {
  const result = await callGeminiApi('/api/chat', {
    message: params.message,
    history: params.history || [],
  });

  return result.reply || result.data?.reply || 'Sem resposta disponível.';
}

export interface GeminiGenericParams {
  contents: any;
  systemInstruction?: string;
}

/**
 * Envia prompt genérico ao Gemini (/api/gemini).
 */
export async function askGemini(params: GeminiGenericParams): Promise<any> {
  const result = await callGeminiApi('/api/gemini', {
    contents: params.contents,
    systemInstruction: params.systemInstruction,
  });

  return result;
}

export interface PlaygroundChatParams {
  prompt: string;
  fileParts?: any[];
  apiKey?: string;
  temperature?: number;
  systemInstruction?: string;
  history?: any[];
}

/**
 * Executa requisição no Playground de IA (/api/gemini/chat).
 */
export async function sendPlaygroundChat(params: PlaygroundChatParams): Promise<string> {
  const result = await callGeminiApi('/api/gemini/chat', {
    prompt: params.prompt,
    fileParts: params.fileParts || [],
    apiKey: params.apiKey,
    model: FORCED_GEMINI_MODEL,
    temperature: params.temperature,
    systemInstruction: params.systemInstruction,
    history: params.history || [],
  });

  return result.reply || 'Sem resposta gerada pelo assistente.';
}
