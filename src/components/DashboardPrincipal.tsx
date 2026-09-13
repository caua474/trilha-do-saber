import React from 'react';
import CardMetaDiaria from './CardMetaDiaria';
import RaioXDisciplinas from './RaioXDisciplinas';

interface DashboardPrincipalProps {
  onOpenGabi?: () => void;
  onSelectDisciplina?: (materia: string) => void;
  onNavigateTab?: (tab: string) => void;
  children?: React.ReactNode;
}

export default function DashboardPrincipal({
  onOpenGabi,
  onSelectDisciplina,
  onNavigateTab,
  children,
}: DashboardPrincipalProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white pb-32">
      {/* 1. Meta Diária com Gráfico Principal (com tooltips e metas dos últimos 7 dias) */}
      <section className="px-4 py-3">
        <CardMetaDiaria onNavigateTab={onNavigateTab} />
      </section>

      {/* 2. Raio-X por Disciplina com Empty States */}
      <section className="px-4 py-3">
        <RaioXDisciplinas onSelectDisciplina={onSelectDisciplina} />
      </section>

      {/* Conteúdo adicional do Dashboard */}
      {children && <div className="space-y-4">{children}</div>}

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
