import React, { useState } from 'react';
import {
  X,
  Search,
  Trash2,
  BookOpen,
  Clock,
  ChevronRight,
  FileText,
  Zap,
  Calendar,
  Lightbulb,
  Database,
} from 'lucide-react';
import { StudyMaterial, TutorPlan, ELI5Explanation } from '../types';

interface HistoryModalProps {
  materials: StudyMaterial[];
  tutorPlans: TutorPlan[];
  eli5Explanations: ELI5Explanation[];
  onSelectMaterial: (material: StudyMaterial) => void;
  onSelectTutorPlan: (plan: TutorPlan) => void;
  onSelectELI5: (explanation: ELI5Explanation) => void;
  onDeleteMaterial: (id: string) => void;
  onDeleteTutorPlan: (id: string) => void;
  onDeleteELI5: (id: string) => void;
  onClearHistory: (category: 'materials' | 'tutor' | 'eli5' | 'all') => void;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  materials,
  tutorPlans,
  eli5Explanations,
  onSelectMaterial,
  onSelectTutorPlan,
  onSelectELI5,
  onDeleteMaterial,
  onDeleteTutorPlan,
  onDeleteELI5,
  onClearHistory,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'tutor' | 'eli5'>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Todas');

  const SUBJECTS_LIST = [
    'Todas',
    'Matemática',
    'Português / Linguagens',
    'História',
    'Geografia',
    'Biologia',
    'Física',
    'Química',
    'Filosofia / Sociologia',
    'Redação'
  ];

  const totalItems = materials.length + tutorPlans.length + eli5Explanations.length;

  const matchesSubject = (itemSubjectOrText?: string) => {
    if (selectedSubject === 'Todas') return true;
    if (!itemSubjectOrText) return false;
    const textLower = itemSubjectOrText.toLowerCase();
    const targetLower = selectedSubject.toLowerCase();
    if (targetLower.includes('matemática') && textLower.includes('mat')) return true;
    if (targetLower.includes('português') && (textLower.includes('port') || textLower.includes('ling') || textLower.includes('gram'))) return true;
    if (targetLower.includes('história') && textLower.includes('hist')) return true;
    if (targetLower.includes('geografia') && textLower.includes('geo')) return true;
    if (targetLower.includes('biologia') && textLower.includes('bio')) return true;
    if (targetLower.includes('física') && textLower.includes('fís')) return true;
    if (targetLower.includes('química') && textLower.includes('quím')) return true;
    if (targetLower.includes('filosofia') && (textLower.includes('filo') || textLower.includes('socio'))) return true;
    if (targetLower.includes('redação') && textLower.includes('red')) return true;
    return textLower.includes(targetLower);
  };

  const filteredMaterials = materials.filter(
    (item) =>
      (matchesSubject(item.focusTopic) || matchesSubject(item.title) || matchesSubject(item.resumoDireto)) &&
      (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resumoDireto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.focusTopic && item.focusTopic.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const filteredTutorPlans = tutorPlans.filter(
    (plan) =>
      (matchesSubject(plan.materia) || matchesSubject(plan.objetivo)) &&
      (plan.materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.objetivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.serieAno.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredELI5 = eli5Explanations.filter(
    (exp) =>
      (matchesSubject(exp.duvida) || matchesSubject(exp.analogiaSimples)) &&
      (exp.duvida.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.analogiaSimples.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.dicaDeOuro.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Histórico no IndexedDB ({totalItems})
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Database className="w-3 h-3" /> Offline Pronto
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Resumos, cronogramas e explicações gravados localmente no navegador
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-3 pb-2 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex space-x-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'materials'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Resumos ({materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Planos do Coach ({tutorPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('eli5')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'eli5'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Explicações ELI5 ({eli5Explanations.length})</span>
          </button>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar no histórico..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-auto text-xs font-bold bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {SUBJECTS_LIST.map((subj) => (
                  <option key={subj} value={subj}>
                    📚 {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {totalItems > 0 && (
              <button
                onClick={() => onClearHistory(activeTab)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
              >
                Limpar esta aba
              </button>
            )}
            {totalItems > 0 && (
              <button
                onClick={() => onClearHistory('all')}
                className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Apagar todo banco IndexedDB"
              >
                Limpar Tudo
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {/* TAB 1: MATERIALS */}
          {activeTab === 'materials' && (
            <>
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">
                    {searchTerm
                      ? 'Nenhum resumo encontrado para essa busca.'
                      : 'Nenhum resumo salvo no IndexedDB ainda.'}
                  </p>
                </div>
              ) : (
                filteredMaterials.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-2xl p-4 transition-all flex items-start justify-between group cursor-pointer"
                    onClick={() => {
                      onSelectMaterial(item);
                      onClose();
                    }}
                  >
                    <div className="space-y-1 pr-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </span>
                        {item.focusTopic && (
                          <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                            {item.focusTopic}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.resumoDireto}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1 pt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="ml-2 font-mono text-[9px] text-indigo-500">IndexedDB</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMaterial(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                        title="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB 2: TUTOR PLANS */}
          {activeTab === 'tutor' && (
            <>
              {filteredTutorPlans.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">
                    {searchTerm
                      ? 'Nenhum plano do tutor encontrado para essa busca.'
                      : 'Nenhum plano de estudo do tutor salvo no IndexedDB.'}
                  </p>
                </div>
              ) : (
                filteredTutorPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-2xl p-4 transition-all flex items-start justify-between group cursor-pointer"
                    onClick={() => {
                      onSelectTutorPlan(plan);
                      onClose();
                    }}
                  >
                    <div className="space-y-1 pr-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                          Plano: {plan.materia}
                        </span>
                        <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                          {plan.objetivo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {plan.serieAno ? `${plan.serieAno} • ` : ''}Tempo: {plan.tempoDisponivel} por dia. {plan.aulaResumo.slice(0, 90)}...
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1 pt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(plan.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="ml-2 font-mono text-[9px] text-indigo-500">IndexedDB</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTutorPlan(plan.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                        title="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB 3: ELI5 EXPLANATIONS */}
          {activeTab === 'eli5' && (
            <>
              {filteredELI5.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">
                    {searchTerm
                      ? 'Nenhuma explicação encontrada para essa busca.'
                      : 'Nenhuma explicação ELI5 salva no IndexedDB.'}
                  </p>
                </div>
              ) : (
                filteredELI5.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-slate-50 dark:bg-slate-950/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-2xl p-4 transition-all flex items-start justify-between group cursor-pointer"
                    onClick={() => {
                      onSelectELI5(exp);
                      onClose();
                    }}
                  >
                    <div className="space-y-1 pr-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                          💡 Dúvida: "{exp.duvida}"
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        Analogia: {exp.analogiaSimples}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1 pt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(exp.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="ml-2 font-mono text-[9px] text-indigo-500">IndexedDB</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteELI5(exp.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                        title="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
