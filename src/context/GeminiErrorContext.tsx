import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GeminiApiErrorInfo } from '../types';
import {
  GEMINI_ERROR_EVENT,
  GEMINI_ERROR_CLEAR_EVENT,
  dispatchGeminiError,
  dispatchClearGeminiError,
} from '../utils/geminiErrorHandler';

interface GeminiErrorContextValue {
  error: GeminiApiErrorInfo | null;
  retryAction: (() => void) | null;
  showError: (
    error: any,
    options?: {
      componentName?: string;
      retryAction?: () => void;
      customTitle?: string;
      customMessage?: string;
    }
  ) => GeminiApiErrorInfo;
  clearError: () => void;
  triggerRetry: () => void;
  isAuthError: boolean;
  isOfflineError: boolean;
}

const GeminiErrorContext = createContext<GeminiErrorContextValue | undefined>(undefined);

export const GeminiErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<GeminiApiErrorInfo | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);

  const showError = useCallback(
    (
      err: any,
      options?: {
        componentName?: string;
        retryAction?: () => void;
        customTitle?: string;
        customMessage?: string;
      }
    ) => {
      const info = dispatchGeminiError(err, options);
      setError(info);
      setRetryAction(options?.retryAction ? () => options.retryAction : null);
      return info;
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
    setRetryAction(null);
    dispatchClearGeminiError();
  }, []);

  const triggerRetry = useCallback(() => {
    if (retryAction) {
      const action = retryAction;
      clearError();
      action();
    }
  }, [retryAction, clearError]);

  // Listener para eventos customizados disparados por serviços (ex: geminiScannerService)
  useEffect(() => {
    const handleCustomError = (e: Event) => {
      const customEvent = e as CustomEvent<{
        errorInfo: GeminiApiErrorInfo;
        retryAction?: () => void;
      }>;
      if (customEvent.detail?.errorInfo) {
        setError(customEvent.detail.errorInfo);
        setRetryAction(customEvent.detail.retryAction ? () => customEvent.detail.retryAction! : null);
      }
    };

    const handleCustomClear = () => {
      setError(null);
      setRetryAction(null);
    };

    const handleOnline = () => {
      // Se o erro era de falta de internet e a conexão voltou, limpa automaticamente
      setError((prev) => (prev?.type === 'OFFLINE_ERROR' ? null : prev));
    };

    window.addEventListener(GEMINI_ERROR_EVENT, handleCustomError);
    window.addEventListener(GEMINI_ERROR_CLEAR_EVENT, handleCustomClear);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener(GEMINI_ERROR_EVENT, handleCustomError);
      window.removeEventListener(GEMINI_ERROR_CLEAR_EVENT, handleCustomClear);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const isAuthError = error?.type === 'AUTH_ERROR';
  const isOfflineError = error?.type === 'OFFLINE_ERROR';

  return (
    <GeminiErrorContext.Provider
      value={{
        error,
        retryAction,
        showError,
        clearError,
        triggerRetry,
        isAuthError,
        isOfflineError,
      }}
    >
      {children}
    </GeminiErrorContext.Provider>
  );
};

export function useGeminiError(): GeminiErrorContextValue {
  const context = useContext(GeminiErrorContext);
  if (!context) {
    // Retorno seguro caso o componente seja utilizado fora do Provider
    return {
      error: null,
      retryAction: null,
      showError: (err, opts) => dispatchGeminiError(err, opts),
      clearError: () => dispatchClearGeminiError(),
      triggerRetry: () => {},
      isAuthError: false,
      isOfflineError: false,
    };
  }
  return context;
}
