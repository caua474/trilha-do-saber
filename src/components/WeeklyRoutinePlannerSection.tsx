import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle2, Sparkles, BookOpen, Sun, Moon, Coffee, HeartHandshake } from 'lucide-react';

interface RoutineBlock {
  id: string;
  dia: 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom';
  horario: string; // e.g., "08:00 - 12:00"
  materiaOuAtividade: string;
  categoria: 'Escola / Cursinho' | 'Estudo GabaritaAí' | 'Exercícios & Simulados' | 'Lazer & Descanso';
  concluido?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Escola / Cursinho': { bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-300' },
  'Estudo GabaritaAí': { bg: 'bg-indigo-100 dark:bg-indigo-950/80', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-300' },
  'Exercícios & Simulados': { bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-300' },
  'Lazer & Descanso': { bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300' },
};

const INITIAL_BLOCKS: RoutineBlock[] = [
  { id: '1', dia: 'Seg', horario: '07:30 - 12:30', materiaOuAtividade: 'Escola / Cursinho', categoria: 'Escola / Cursinho' },
  { id: '2', dia: 'Seg', horario: '14:00 - 16:00', materiaOuAtividade: 'Matemática & Exercícios TRI', categoria: 'Estudo GabaritaAí', concluido: true },
  { id: '3', dia: 'Seg', horario: '16:30 - 18:00', materiaOuAtividade: 'Redação & Caderno de Erros', categoria: 'Exercícios & Simulados', concluido: true },
  { id: '4', dia: 'Seg', horario: '19:00 - 21:00', materiaOuAtividade: 'Academia & Lazer', categoria: 'Lazer & Descanso' },
  { id: '5', dia: 'Ter', horario: '07:30 - 12:30', materiaOuAtividade: 'Escola / Cursinho', categoria: 'Escola / Cursinho' },
  { id: '6', dia: 'Ter', horario: '14:00 - 16:30', materiaOuAtividade: 'Física & Flashcards', categoria: 'Estudo GabaritaAí' },
  { id: '7', dia: 'Qua', horario: '14:00 - 17:00', materiaOuAtividade: 'Simulado Parcial ENEM', categoria: 'Exercícios & Simulados' },
  { id: '8', dia: 'Qui', horario: '14:00 - 16:00', materiaOuAtividade: 'Biologia & Química', categoria: 'Estudo GabaritaAí' },
  { id: '9', dia: 'Sex', horario: '14:00 - 16:00', materiaOuAtividade: 'História e Geografia', categoria: 'Estudo GabaritaAí' },
  { id: '10', dia: 'Sáb', horario: '09:00 - 12:00', materiaOuAtividade: 'Revisão Espaçada Leitner', categoria: 'Estudo GabaritaAí' },
  { id: '11', dia: 'Dom', horario: '10:00 - 18:00', materiaOuAtividade: 'Descanso Total e Família', categoria: 'Lazer & Descanso' },
];

const DIAS: ('Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom')[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const WeeklyRoutinePlannerSection: React.FC = () => {
  const [blocks, setBlocks] = useState<RoutineBlock[]>(INITIAL_BLOCKS);
  const [diaAdd, setDiaAdd] = useState<'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom'>('Seg');
  const [horarioAdd, setHorarioAdd] = useState<string>('14:00 - 16:00');
  const [materiaAdd, setMateriaAdd] = useState<string>('');
  const [categoriaAdd, setCategoriaAdd] = useState<'Escola / Cursinho' | 'Estudo GabaritaAí' | 'Exercícios & Simulados' | 'Lazer & Descanso'>('Estudo GabaritaAí');

  const handleAddBlock = () => {
    if (!materiaAdd.trim()) return;
    const newBlock: RoutineBlock = {
      id: Date.now().toString(),
      dia: diaAdd,
      horario: horarioAdd,
      materiaOuAtividade: materiaAdd,
      categoria: categoriaAdd,
    };
    setBlocks([...blocks, newBlock]);
    setMateriaAdd('');
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleToggleConcluido = (id: string) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, concluido: !b.concluido } : b))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <Calendar className="w-3.5 h-3.5" /> Organização de Horários e Saúde Mental
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              📅 Planner de Rotina e Cronograma Semanal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Organize seus blocos de estudo, rotina de exercícios e momentos essenciais de descanso para manter o equilíbrio emocional até a data do exame.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 text-slate-950 flex items-center justify-center font-black text-xl">
              🗓️
            </div>
            <div>
              <span className="text-xs text-amber-200 font-bold block uppercase tracking-wider">Cronograma Ativo</span>
              <span className="text-sm font-black text-white">{blocks.length} Blocos Agendados</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW BLOCK FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Adicionar Bloco ao Cronograma
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Dia da Semana:</label>
            <select
              value={diaAdd}
              onChange={(e: any) => setDiaAdd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            >
              {DIAS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Horário:</label>
            <input
              type="text"
              value={horarioAdd}
              onChange={(e) => setHorarioAdd(e.target.value)}
              placeholder="Ex: 14:00 - 16:00"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Atividade / Matéria:</label>
            <input
              type="text"
              value={materiaAdd}
              onChange={(e) => setMateriaAdd(e.target.value)}
              placeholder="Ex: Resolução de Questões de Física..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Categoria:</label>
            <select
              value={categoriaAdd}
              onChange={(e: any) => setCategoriaAdd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Escola / Cursinho">Escola / Cursinho</option>
              <option value="Estudo GabaritaAí">Estudo GabaritaAí</option>
              <option value="Exercícios & Simulados">Exercícios & Simulados</option>
              <option value="Lazer & Descanso">Lazer & Descanso</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleAddBlock}
          disabled={!materiaAdd.trim()}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          Adicionar ao Cronograma
        </button>
      </div>

      {/* WEEKLY GRID DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DIAS.map((dia) => {
          const dayBlocks = blocks.filter((b) => b.dia === dia);
          return (
            <div
              key={dia}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3 min-h-[220px]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{dia}</span>
                <span className="text-[10px] font-bold text-slate-400">{dayBlocks.length} tarefas</span>
              </div>

              <div className="space-y-2">
                {dayBlocks.length === 0 ? (
                  <span className="text-[11px] text-slate-400 font-medium italic block text-center py-4">
                    Sem tarefas
                  </span>
                ) : (
                  dayBlocks.map((b) => {
                    const style = CATEGORY_COLORS[b.categoria] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
                    return (
                      <div
                        key={b.id}
                        className={`p-2.5 rounded-2xl border transition space-y-1 ${style.bg} ${style.border} ${
                          b.concluido ? 'opacity-50 line-through' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase ${style.text}`}>
                            {b.horario}
                          </span>
                          <button
                            onClick={() => handleDeleteBlock(b.id)}
                            className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <p className={`text-xs font-extrabold ${style.text} leading-tight`}>
                          {b.materiaOuAtividade}
                        </p>

                        <button
                          onClick={() => handleToggleConcluido(b.id)}
                          className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{b.concluido ? 'Concluído' : 'Marcar Feito'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
