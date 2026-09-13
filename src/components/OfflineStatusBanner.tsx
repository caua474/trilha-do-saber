import React, { useState, useEffect } from 'react';
import { WifiOff, Database, CheckCircle2 } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 animate-in fade-in transition-all">
        <CheckCircle2 className="w-4 h-4" />
        <span>Conexão reestabelecida! O gerador de IA está novamente ativo.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-slate-950 text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center space-x-2 shadow-md animate-in fade-in transition-all">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        Você está navegando sem internet (Modo Offline). Todo seu histórico de resumos, planos e explicações está salvo no IndexedDB e acessível sem conexão!
      </span>
      <span className="hidden md:inline-flex items-center space-x-1 bg-amber-600/30 px-2 py-0.5 rounded-md text-[11px] font-extrabold ml-2 border border-amber-600/40">
        <Database className="w-3 h-3 mr-1" /> IndexedDB Ativo
      </span>
    </div>
  );
};
