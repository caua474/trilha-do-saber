import React from 'react';
import { X, Printer, Download, Award, CheckCircle2, TrendingUp, Calendar, FileText, UserCheck, ShieldCheck } from 'lucide-react';

interface ParentPerformanceReportModalProps {
  onClose: () => void;
  studyStreak: number;
}

export const ParentPerformanceReportModal: React.FC<ParentPerformanceReportModalProps> = ({
  onClose,
  studyStreak,
}) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER BAR */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              📊
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Relatório de Desempenho Mensal (Para os Pais & Responsáveis)
              </h3>
              <p className="text-xs text-slate-400 font-medium capitalize">
                Período de Acompanhamento: {currentDate}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT BODY */}
        <div id="printable-report" className="p-6 sm:p-8 space-y-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          {/* STUDENT IDENTIFICATION HEADER */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                Plataforma GabaritaAí • Edição 2026
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Estudante: Lucas Gabriel S.
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Série: 3º Ano do Ensino Médio • Foco: ENEM & Fuvest
              </p>
            </div>

            <div className="text-right border-l sm:border-l-2 border-slate-200 dark:border-slate-800 pl-4 py-1">
              <span className="text-xs text-slate-500 block font-bold uppercase">Ofensiva de Estudos</span>
              <span className="text-2xl font-black text-amber-500">🔥 {studyStreak} Dias Seguidos</span>
            </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">42h</span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">Horas Estudadas</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">8 Redações</span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">Corrigidas IA</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <span className="text-2xl font-black text-amber-500 block">780 Pts</span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">Média Simulados TRI</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block">89%</span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase block">Frequência Semanal</span>
            </div>
          </div>

          {/* EVOLUTION BY SUBJECT TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Evolução por Área do Conhecimento (Mês de Referência)
              </h5>
            </div>

            <div className="space-y-3">
              {[
                { area: 'Matemática e suas Tecnologias', progresso: 82, status: 'Excelente (+45 pts)', color: 'bg-amber-500' },
                { area: 'Redação e Competências C1-C5', progresso: 92, status: 'Nota Média 920', color: 'bg-rose-500' },
                { area: 'Ciências da Natureza (Bio/Fís/Qui)', progresso: 76, status: 'Evolução Constante', color: 'bg-emerald-500' },
                { area: 'Ciências Humanas (Hist/Geo/Fil)', progresso: 88, status: 'Alto Desempenho', color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.area} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{item.area}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{item.status}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full transition-all duration-500`} style={{ width: `${item.progresso}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PARENT SIGNATURE & DIAGNOSTIC */}
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Diagnóstico do Tutor Pedagógico GabaritaAí:</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              O estudante demonstrou excelente disciplina durante este mês, mantendo a rotina de estudos em dia e corrigindo redações semanalmente. Recomendamos apoio contínuo para o simulado TRI da próxima semana.
            </p>

            <div className="pt-6 border-t border-indigo-200/60 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
              <div className="text-center sm:text-left">
                <div className="border-b border-slate-400 w-48 mb-1" />
                <span>Assinatura do Pai/Mãe ou Responsável</span>
              </div>
              <div className="text-center sm:text-right">
                <span className="font-bold block text-slate-700 dark:text-slate-300">GabaritaAí Pedagógico 2026</span>
                <span className="text-[10px]">Autenticação Digital: #GAB-8829-PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
