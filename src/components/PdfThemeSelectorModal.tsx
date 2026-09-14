import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Palette, BookOpen, Check, X, Download, Sparkles } from 'lucide-react';
import { PdfVisualTheme } from '../utils/pdfExport';

interface PdfThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (theme: PdfVisualTheme) => void;
  documentTitle?: string;
  documentType?: 'material' | 'scanner' | 'mindmap' | 'redacao' | 'plano';
}

interface ThemeOption {
  id: PdfVisualTheme;
  title: string;
  badge: string;
  desc: string;
  idealPara: string;
  icon: React.ReactNode;
  previewColors: string[];
  borderClass: string;
  bgPreviewClass: string;
}

export const PDF_THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'minimalista',
    title: 'Minimalista (Preto & Branco)',
    badge: 'Economia de Tinta',
    desc: 'Layout sóbrio, traços finos e máximo contraste em escala monocromática.',
    idealPara: 'Impressão física rápida e estudo direto sem distrações.',
    icon: <FileText className="w-5 h-5 text-slate-700 dark:text-slate-200" />,
    previewColors: ['bg-slate-900', 'bg-slate-500', 'bg-slate-200', 'bg-white'],
    borderClass: 'border-slate-300 dark:border-slate-700 hover:border-slate-500',
    bgPreviewClass: 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100',
  },
  {
    id: 'colorido',
    title: 'Colorido (Infográfico)',
    badge: 'Mais Popular',
    desc: 'Banners em gradiente, caixas temáticas coloridas e ícones com hierarquia visual.',
    idealPara: 'Mapas mentais, resumos visuais e estudo em tablets ou smartphones.',
    icon: <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    previewColors: ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'],
    borderClass: 'border-indigo-300 dark:border-indigo-700 hover:border-indigo-500',
    bgPreviewClass: 'bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100',
  },
  {
    id: 'foco_leitura',
    title: 'Foco em Leitura (Editorial)',
    badge: 'Conforto Ocular',
    desc: 'Tons suaves de pergaminho/marfim, texto em sépia escuro e espaçamento duplo.',
    idealPara: 'Leituras longas e revisões noturnas sem cansar a visão.',
    icon: <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-500" />,
    previewColors: ['bg-amber-800', 'bg-amber-600', 'bg-amber-200', 'bg-[#FDFBF7]'],
    borderClass: 'border-amber-300 dark:border-amber-700 hover:border-amber-500',
    bgPreviewClass: 'bg-amber-50/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100',
  },
];

export default function PdfThemeSelectorModal({
  isOpen,
  onClose,
  onConfirmExport,
  documentTitle = 'Material de Estudo',
  documentType = 'material',
}: PdfThemeSelectorModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<PdfVisualTheme>('colorido');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      onConfirmExport(selectedTheme);
      setIsExporting(false);
      onClose();
    }, 250);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Escolher Tema do PDF
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                  {documentTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Selection List */}
          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Selecione o estilo visual antes de exportar:
            </p>

            {PDF_THEME_OPTIONS.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-xs'
                      : `${theme.borderClass} bg-white dark:bg-slate-800/60`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700">
                        {theme.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {theme.title}
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {theme.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {theme.desc}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Visual Palettes & Ideal For */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 italic">
                      🎯 {theme.idealPara}
                    </span>
                    <div className="flex items-center space-x-1">
                      {theme.previewColors.map((colorClass, cIdx) => (
                        <span
                          key={cIdx}
                          className={`w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 ${colorClass}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Exportar em PDF</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
