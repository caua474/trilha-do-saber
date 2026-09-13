import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface EnemPrintableSheetModalProps {
  initialTheme?: string;
  onClose: () => void;
}

export const EnemPrintableSheetModal: React.FC<EnemPrintableSheetModalProps> = ({
  initialTheme = 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
  onClose
}) => {
  const [studentName, setStudentName] = useState<string>('Estudante GabaritaAí');
  const [essayTitle, setEssayTitle] = useState<string>(initialTheme);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  const handlePrint = () => {
    playSuccessSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-auto max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Folha Oficial de Redação ENEM (30 Linhas)
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Pronta para impressão no formato padrão do INEP/ENEM
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 font-black text-xs rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Configuration Header Bar (Hidden on Print) */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden">
          <div className="w-full sm:flex-1 space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              Nome do Estudante:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="w-full sm:flex-1 space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
              Tema da Redação:
            </label>
            <input
              type="text"
              value={essayTitle}
              onChange={(e) => setEssayTitle(e.target.value)}
              className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-slate-100"
              placeholder="Tema da proposta de redação"
            />
          </div>
        </div>

        {/* PRINTABLE ESSAY SHEET DOCUMENT */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible">
          
          {/* ENEM HEADER */}
          <div className="border-2 border-slate-900 p-4 mb-6 text-center space-y-2 relative">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
              <span className="font-black text-xs tracking-wider uppercase">
                EXAME NACIONAL DO ENSINO MÉDIO - ENEM 2026
              </span>
              <span className="font-black text-xs text-amber-600 dark:text-amber-700">
                GABARITA AÍ
              </span>
            </div>

            <h1 className="font-black text-lg tracking-wide uppercase">
              FOLHA DE RESPOSTA - REDAÇÃO
            </h1>

            <div className="grid grid-cols-2 gap-4 text-left text-xs pt-2 border-t border-slate-300">
              <div>
                <span className="font-bold">NOME DO CANDIDATO: </span>
                <span className="font-mono underline uppercase">{studentName || '______________________________________'}</span>
              </div>
              <div className="text-right">
                <span className="font-bold">DATA: </span>
                <span>____ / ____ / 2026</span>
              </div>
            </div>

            <div className="text-left text-xs pt-2">
              <span className="font-bold">PROPOSTA / TEMA: </span>
              <span className="font-semibold italic">{essayTitle || '____________________________________________________'}</span>
            </div>
          </div>

          {/* INSTRUCTIONS BOX */}
          <div className="border border-slate-400 p-3 mb-6 text-[11px] leading-snug bg-slate-50">
            <p className="font-bold uppercase text-slate-800 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" /> Instruções Oficiais do ENEM:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700">
              <li>Escreva seu texto com caneta esferográfica de tinta preta, fabricada em material transparente.</li>
              <li>Sua redação deve ter entre 7 e 30 linhas manuscritas. Textos com menos de 7 linhas recebem nota zero.</li>
              <li>Não assine fora do local indicado nem faça rasuras intencionais para identificação.</li>
              <li>A margem direita e esquerda não devem ser ultrapassadas.</li>
            </ul>
          </div>

          {/* 30 RULING LINES TABLE */}
          <div className="border-2 border-slate-900">
            <div className="bg-slate-200 border-b border-slate-900 py-1 px-3 text-[10px] font-black uppercase text-center tracking-widest">
              Espaço Reservado para o Texto Definitivo da Redação (Máximo 30 Linhas)
            </div>

            <div className="divide-y divide-slate-400">
              {Array.from({ length: 30 }).map((_, index) => {
                const lineNum = index + 1;
                return (
                  <div key={lineNum} className="flex items-center h-8 relative">
                    {/* Line number margin indicator */}
                    <div className="w-10 text-center font-bold text-xs border-r border-slate-400 bg-slate-100 text-slate-700 select-none py-1">
                      {lineNum < 10 ? `0${lineNum}` : lineNum}
                    </div>

                    {/* Writing Area Line */}
                    <div className="flex-1 h-full px-3 flex items-center text-xs font-mono text-slate-400 select-none">
                      {/* Blank line for handwriting */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER OFICIAL */}
          <div className="mt-4 pt-2 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Inep / Ministério da Educação • Modelo de Treino GabaritaAí</span>
            <span>Uso exclusivo para simulação e treino de manuscrito</span>
          </div>

        </div>

      </div>
    </div>
  );
};
