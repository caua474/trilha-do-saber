import React from 'react';
import { DailyGoalsWidget } from './DailyGoalsWidget';

interface CardMetaDiariaProps {
  onNavigateTab?: (tab: string) => void;
}

export default function CardMetaDiaria({ onNavigateTab }: CardMetaDiariaProps) {
  return (
    <div id="card-meta-diaria-wrapper" className="w-full">
      <DailyGoalsWidget onNavigateTab={onNavigateTab} />
    </div>
  );
}

export { CardMetaDiaria };
