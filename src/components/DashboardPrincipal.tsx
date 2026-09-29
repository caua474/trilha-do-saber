import React from 'react';
import CardMetaDiaria from './CardMetaDiaria';
import RaioXDisciplinas from './RaioXDisciplinas';
import { SubscriptionManagementCard } from './SubscriptionManagementCard';
import { AuthUser } from '../types';

interface DashboardPrincipalProps {
  onOpenGabi?: () => void;
  onSelectDisciplina?: (materia: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenLegal?: (tab: 'terms' | 'privacy') => void;
  onOpenPro?: () => void;
  authUser?: AuthUser | null;
  children?: React.ReactNode;
}

export default function DashboardPrincipal({
  onOpenGabi,
  onSelectDisciplina,
  onNavigateTab,
  onOpenLegal,
  onOpenPro,
  authUser: propAuthUser,
  children,
}: DashboardPrincipalProps) {
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(() => {
    if (propAuthUser) return propAuthUser;
    try {
      const saved = localStorage.getItem('gabaritai_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    if (propAuthUser) setCurrentUser(propAuthUser);
  }, [propAuthUser]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white pb-32">
      <div className="w-full max-w-7xl mx-auto">
        {/* 1. Meta Diária com Gráfico Principal (com tooltips e metas dos últimos 7 dias) */}
        <section className="px-4 py-3">
          <CardMetaDiaria onNavigateTab={onNavigateTab} />
        </section>

        {/* 2. Raio-X por Disciplina com Empty States */}
        <section className="px-4 py-3">
          <RaioXDisciplinas onSelectDisciplina={onSelectDisciplina} />
        </section>

        {/* 3. Seção Minha Assinatura / Plano Pro Mercado Pago */}
        <section className="px-4 py-3">
          <SubscriptionManagementCard
            authUser={currentUser}
            onOpenPro={onOpenPro}
            onStatusUpdated={() => {
              try {
                const saved = localStorage.getItem('gabaritai_auth_user');
                setCurrentUser(saved ? JSON.parse(saved) : null);
              } catch {}
            }}
          />
        </section>

        {/* Conteúdo adicional do Dashboard */}
        {children && <div className="space-y-4 px-4">{children}</div>}

        {/* Footer Institucional com Links de Termos e Privacidade */}
        <footer className="mt-8 pt-6 pb-4 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2 px-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <a
              href="#/termos-de-uso"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal?.('terms');
              }}
              className="hover:text-indigo-400 text-slate-400 transition-colors underline cursor-pointer"
            >
              Termos de Uso
            </a>
            <span>•</span>
            <a
              href="#/politica-de-privacidade"
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal?.('privacy');
              }}
              className="hover:text-emerald-400 text-slate-400 transition-colors underline cursor-pointer"
            >
              Política de Privacidade (LGPD)
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => onOpenPro?.()}
              className="hover:text-amber-300 text-amber-400 font-bold transition-colors cursor-pointer underline flex items-center gap-1"
            >
              <span>MenteUp Pro R$ 5,00 (Acesso Vitalício)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-600">
            MenteUp © 2026 • Plataforma Inteligente de Estudos & Aprovação ENEM. Todos os direitos reservados.
          </p>
        </footer>
      </div>

      {/* Botão da Gabi IA ancorado acima da barra inferior sem cobrir os dados */}
      {onOpenGabi && (
        <div className="fixed bottom-20 right-4 z-50">
          <button
            type="button"
            onClick={onOpenGabi}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2.5 rounded-full shadow-lg border border-purple-400/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>Gabi IA</span>
          </button>
        </div>
      )}
    </div>
  );
}
