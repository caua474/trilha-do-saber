import React from 'react';

interface ArenaX1Props {
  onStartDuel?: () => void;
  userXP?: number;
  opponentXP?: number;
}

export default function ArenaX1({
  onStartDuel,
  userXP = 1250,
  opponentXP = 1180,
}: ArenaX1Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
          <span>⚔️</span> Arena X1 - Duelo do Dia
        </h3>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          AO VIVO
        </span>
      </div>
      
      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl mb-4 border border-slate-800">
        <div className="text-center flex-1">
          <p className="text-xs font-bold text-indigo-400">Você</p>
          <p className="text-lg font-black tracking-tight">{userXP.toLocaleString('pt-BR')} XP</p>
        </div>
        <span className="text-xs font-black text-slate-500 px-2">VS</span>
        <div className="text-center flex-1">
          <p className="text-xs font-bold text-amber-400">Oponente</p>
          <p className="text-lg font-black tracking-tight">{opponentXP.toLocaleString('pt-BR')} XP</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStartDuel}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-all cursor-pointer shadow-sm hover:shadow-amber-500/20 active:scale-98"
      >
        Procurar Adversário
      </button>
    </div>
  );
}

export { ArenaX1 };
