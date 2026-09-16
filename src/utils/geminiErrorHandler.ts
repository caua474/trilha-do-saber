import { GeminiApiErrorInfo, GeminiErrorType } from '../types';

/**
 * Event name used for dispatching global Gemini error notifications
 * across components without requiring deep prop drilling.
 */
export const GEMINI_ERROR_EVENT = 'gabaritai:gemini_error';
export const GEMINI_ERROR_CLEAR_EVENT = 'gabaritai:gemini_error_clear';

export interface ClassifiedGeminiError {
  type: GeminiErrorType;
  title: string;
  message: string;
  actionLabel: string;
  actionType: 'open_settings' | 'retry' | 'dismiss';
  isAuthError: boolean;
  isOfflineError: boolean;
  isQuotaError: boolean;
  isServerError: boolean;
}

/**
 * Normaliza e classifica qualquer erro disparado em chamadas da API Gemini
 * (seja via SDK cliente @google/genai ou rotas /api/* do Express).
 */
export function classifyGeminiError(error: any): ClassifiedGeminiError {
  // 1. Verificação prévia de conexão de rede
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  const rawMsg = (
    error?.message ||
    error?.error ||
    error?.statusText ||
    (typeof error === 'string' ? error : '')
  ).toLowerCase();

  const statusCode = error?.status || error?.statusCode || error?.code || 0;

  // 2. Erro de Conexão / Rede / Offline
  if (
    isOffline ||
    rawMsg.includes('failed to fetch') ||
    rawMsg.includes('networkerror') ||
    rawMsg.includes('network request failed') ||
    rawMsg.includes('err_internet_disconnected') ||
    rawMsg.includes('err_name_not_resolved') ||
    rawMsg.includes('offline') ||
    rawMsg.includes('sem conexão') ||
    rawMsg.includes('conexão perdida') ||
    rawMsg.includes('econnrefused') ||
    rawMsg.includes('timeout')
  ) {
    return {
      type: 'OFFLINE_ERROR',
      title: 'Conexão com a Internet Indisponível',
      message:
        'Não foi possível estabelecer comunicação com os servidores do Google Gemini. Verifique se o seu dispositivo está conectado ao Wi-Fi ou aos dados móveis.',
      actionLabel: 'Tentar Novamente',
      actionType: 'retry',
      isAuthError: false,
      isOfflineError: true,
      isQuotaError: false,
      isServerError: false,
    };
  }

  // 3. Erro de Autenticação / Chave VITE_GEMINI_API_KEY
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    rawMsg.includes('vite_gemini_api_key') ||
    rawMsg.includes('gemini_api_key') ||
    rawMsg.includes('api_key_invalid') ||
    rawMsg.includes('api key not valid') ||
    rawMsg.includes('unauthenticated') ||
    rawMsg.includes('permission_denied') ||
    rawMsg.includes('chave de api') ||
    rawMsg.includes('chave inválida') ||
    rawMsg.includes('não configurada') ||
    rawMsg.includes('invalid api key') ||
    rawMsg.includes('auth_error')
  ) {
    return {
      type: 'AUTH_ERROR',
      title: 'Chave da API Gemini Inválida ou Ausente',
      message:
        'A chave de autenticação do Gemini não foi configurada ou expirou. Você pode inserir sua chave gratuita do Google AI Studio nas configurações para continuar gerando respostas com IA.',
      actionLabel: 'Configurar Chave da API',
      actionType: 'open_settings',
      isAuthError: true,
      isOfflineError: false,
      isQuotaError: false,
      isServerError: false,
    };
  }

  // 4. Erro de Cota / Quota Exceeded (429 / RESOURCE_EXHAUSTED)
  if (
    statusCode === 429 ||
    rawMsg.includes('resource_exhausted') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('limite') ||
    rawMsg.includes('too many requests')
  ) {
    return {
      type: 'QUOTA_ERROR',
      title: 'Limite Temporário de Requisições Atingido',
      message:
        'O limite gratuito de requisições por minuto da API do Gemini foi atingido. Aguarde alguns segundos para tentar novamente ou utilize sua própria chave do Google AI Studio.',
      actionLabel: 'Aguardar e Tentar Novamente',
      actionType: 'retry',
      isAuthError: false,
      isOfflineError: false,
      isQuotaError: true,
      isServerError: false,
    };
  }

  // 5. Erro no Servidor ou Formatação (500 / 502 / 503)
  if (
    statusCode >= 500 ||
    rawMsg.includes('server error') ||
    rawMsg.includes('internal') ||
    rawMsg.includes('resposta vazia') ||
    rawMsg.includes('parse')
  ) {
    return {
      type: 'SERVER_ERROR',
      title: 'Instabilidade Temporária no Serviço de IA',
      message:
        'Os servidores do Gemini apresentaram uma oscilação momentânea ao processar esta resposta. Os dados salvos localmente continuam intactos.',
      actionLabel: 'Tentar Novamente',
      actionType: 'retry',
      isAuthError: false,
      isOfflineError: false,
      isQuotaError: false,
      isServerError: true,
    };
  }

  // 6. Erro Desconhecido Padrão
  return {
    type: 'UNKNOWN_ERROR',
    title: 'Falha na Resposta da IA',
    message:
      error?.message ||
      'Não foi possível concluir a operação com a inteligência artificial. Tente novamente em instantes.',
    actionLabel: 'Tentar Novamente',
    actionType: 'retry',
    isAuthError: false,
    isOfflineError: false,
    isQuotaError: false,
    isServerError: false,
  };
}

/**
 * Emite um evento global de erro do Gemini para ser capturado pelo App.tsx
 * e exibir a notificação feedback ao usuário.
 */
export function dispatchGeminiError(
  error: any,
  options?: {
    componentName?: string;
    retryAction?: () => void;
    customTitle?: string;
    customMessage?: string;
  }
): GeminiApiErrorInfo {
  const classified = classifyGeminiError(error);

  const errorInfo: GeminiApiErrorInfo = {
    id: `gemini-err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: classified.type,
    title: options?.customTitle || classified.title,
    message: options?.customMessage || classified.message,
    actionText: classified.actionLabel,
    actionType: classified.actionType,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    componentSource: options?.componentName,
    details: error?.message || (typeof error === 'string' ? error : undefined),
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(GEMINI_ERROR_EVENT, {
        detail: {
          errorInfo,
          retryAction: options?.retryAction,
        },
      })
    );
  }

  return errorInfo;
}

/**
 * Limpa o erro global ativo
 */
export function dispatchClearGeminiError(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GEMINI_ERROR_CLEAR_EVENT));
  }
}
