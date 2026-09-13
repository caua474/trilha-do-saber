import React, { useState, useEffect } from 'react';

export interface DisciplinaItem {
  nome: string;
  estudos: number;
  icone: string;
  sigla?: string;
}

interface RaioXDisciplinasProps {
  disciplinas?: DisciplinaItem[];
  onSelectDisciplina?: (materia: string) => void;
}

const disciplinasPadrao: DisciplinaItem[] = [
  { nome: 'Matemática', estudos: 0, icone: '📐', sigla: 'MAT' },
  { nome: 'Biologia', estudos: 0, icone: '🧬', sigla: 'BIO' },
  { nome: 'Física', estudos: 0, icone: '⚡', sigla: 'FIS' },
  { nome: 'Química', estudos: 0, icone: '🧪', sigla: 'QUI' },
  { nome: 'História', estudos: 0, icone: '📜', sigla: 'HIS' },
  { nome: 'Geografia', estudos: 0, icone: '🌍', sigla: 'GEO' },
  { nome: 'Filosofia', estudos: 0, icone: '🏛️', sigla: 'FIL' },
  { nome: 'Sociologia', estudos: 0, icone: '👥', sigla: 'SOC' },
];

export default function RaioXDisciplinas({
  disciplinas: propDisciplinas,
  onSelectDisciplina,
}: RaioXDisciplinasProps) {
  const [listaDisciplinas, setListaDisciplinas] = useState<DisciplinaItem[]>(
    propDisciplinas || disciplinasPadrao
  );

  useEffect(() => {
    if (propDisciplinas && propDisciplinas.length > 0) {
      setListaDisciplinas(propDisciplinas);
      return;
    }

    try {
      // Verifica se há horas ou contagens salvas no histórico local
      const rawHistory = localStorage.getItem('gabaritai_history');
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const counts: Record<string, number> = {};
          parsed.forEach((item: any) => {
            const materia = item.materia || item.subject || '';
            disciplinasPadrao.forEach((d) => {
              if (
                materia.toLowerCase().includes(d.nome.toLowerCase()) ||
                d.nome.toLowerCase().includes(materia.toLowerCase())
              ) {
                counts[d.nome] = (counts[d.nome] || 0) + 1;
              }
            });
          });

          const atualizadas = disciplinasPadrao.map((d) => ({
            ...d,
            estudos: counts[d.nome] ? Math.round(counts[d.nome] * 0.5 * 10) / 10 : 0,
          }));
          setListaDisciplinas(atualizadas);
        }
      }
    } catch {
      // Mantém lista padrão
    }
  }, [propDisciplinas]);

  return (
    <div id="raio-x-disciplinas" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
          <span>⏱️</span> Raio-X de Atividade por Disciplina
        </h3>
        <span className="text-xs text-slate-500">Histórico no Navegador</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {listaDisciplinas.map((materia) => (
          <div
            key={materia.nome}
            onClick={() => onSelectDisciplina?.(materia.nome)}
            className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/50 transition-all cursor-pointer group hover:bg-slate-900/80"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                {materia.icone} {materia.nome}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                {materia.estudos === 0 ? 'Novo' : `${materia.estudos}h`}
              </span>
            </div>

            <div className="mt-3">
              {materia.estudos === 0 ? (
                <div className="flex items-center justify-between text-[11px] text-amber-400 group-hover:underline font-semibold">
                  <span>Iniciar primeiro treino</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(materia.estudos * 10, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Progresso</span>
                    <span>{Math.min(Math.round(materia.estudos * 10), 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
