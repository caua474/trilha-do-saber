import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Award,
  AlertTriangle,
  RefreshCw,
  FileText,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface QuestionResult {
  numero: number;
  materia: string;
  marcada_aluno: string;
  gabarito_correto: string;
  correta: boolean;
}

interface ScanResult {
  total_questoes: number;
  acertos: number;
  erros: number;
  porcentagem: number;
  pontuacao_estimada_tri: number;
  questoes_analisadas: QuestionResult[];
  desempenho_por_materia?: Record<string, { acertos: number; total: number }>;
  diagnostico_pedagogico?: string;
}

export const OpticalAnswerSheetScannerSection: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState<string>('1:A, 2:B, 3:C, 4:D, 5:E, 6:A, 7:B, 8:C, 9:D, 10:E');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setScanResult(null);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessScan = async () => {
    if (!imagePreview) {
      setErrorMessage('Por favor, tire uma foto ou selecione uma imagem do cartão-resposta.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/scan-answer-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagemBase64: imagePreview,
          gabaritoOficial: customKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setScanResult(json.data);
      } else {
        setErrorMessage(json.error || 'Não foi possível ler o cartão-resposta.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro de conexão com o servidor de visão computacional.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoTemplate = () => {
    // Generate a clean SVG sample answer sheet base64
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 400;
    demoCanvas.height = 500;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 500);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('ENEM 2026 - FOLHA DE RESPOSTAS', 40, 40);

      ctx.font = '12px sans-serif';
      ctx.fillText('NOME: ALUNO GABARITAAÍ', 40, 65);
      ctx.fillText('INSCRIÇÃO: 2026009841', 40, 85);

      const letters = ['A', 'B', 'C', 'D', 'E'];
      for (let i = 1; i <= 10; i++) {
        const y = 110 + i * 34;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`Q${i < 10 ? '0' + i : i}:`, 40, y + 5);

        letters.forEach((letra, idx) => {
          const x = 90 + idx * 45;
          ctx.beginPath();
          ctx.arc(x, y, 11, 0, 2 * Math.PI);
          // Fill some bubbles to simulate marked answers
          if (
            (i === 1 && letra === 'A') ||
            (i === 2 && letra === 'C') ||
            (i === 3 && letra === 'C') ||
            (i === 4 && letra === 'D') ||
            (i === 5 && letra === 'E') ||
            (i === 6 && letra === 'A') ||
            (i === 7 && letra === 'B') ||
            (i === 8 && letra === 'C') ||
            (i === 9 && letra === 'E') ||
            (i === 10 && letra === 'E')
          ) {
            ctx.fillStyle = '#1e1b4b'; // Filled with pen
            ctx.fill();
          } else {
            ctx.strokeStyle = '#64748b'; // Empty bubble
            ctx.stroke();
          }
          ctx.fillStyle = '#475569';
          ctx.font = '10px sans-serif';
          ctx.fillText(letra, x - 3, y + 3);
        });
      }
    }
    setImagePreview(demoCanvas.toDataURL('image/png'));
    setScanResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5" /> Visão Computacional de Gabaritos
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Corretor Visual de Cartão-Resposta Físico 📸
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Envie uma foto da sua folha de respostas oficial preenchida a caneta. Nossa IA identifica as bolinhas assinaladas, compara com o gabarito oficial e gera um relatório imediato de desempenho!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: UPLOAD & INPUT */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" /> Upload da Folha de Gabarito
            </h3>

            {/* Image Drop Area */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition relative bg-slate-50 dark:bg-slate-950/50">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Cartão resposta"
                    className="max-h-64 mx-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm object-contain"
                  />
                  <button
                    onClick={() => setImagePreview(null)}
                    className="text-xs font-bold text-rose-500 hover:underline"
                  >
                    Remover e escolher outra foto
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3 py-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Clique para enviar foto do cartão
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      JPG, PNG ou foto da câmera do celular
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Quick Demo Button */}
            {!imagePreview && (
              <button
                onClick={loadDemoTemplate}
                type="button"
                className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Carregar Exemplo de Gabarito ENEM</span>
              </button>
            )}

            {/* Custom Answer Key Configuration */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Gabarito Oficial para Correção:
              </label>
              <input
                type="text"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Ex: 1:A, 2:B, 3:C, 4:D, 5:E..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-slate-400 block">
                Especifique a chave de respostas corretas da prova.
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              onClick={handleProcessScan}
              disabled={isLoading || !imagePreview}
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || !imagePreview
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando Preenchimentos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Processar e Corrigir Gabarito</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS REPORT */}
        <div className="lg:col-span-7 space-y-5">
          {scanResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in">
              {/* Score Header */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    Relatório de Desempenho do Simulando
                  </span>
                  <h4 className="text-xl font-black text-white">
                    {scanResult.acertos} de {scanResult.total_questoes} Questões Corretas ({scanResult.porcentagem}%)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Pontuação Estimada TRI: <strong className="text-amber-400 font-extrabold">{scanResult.pontuacao_estimada_tri} Pontos</strong>
                  </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl font-black text-amber-300">{scanResult.porcentagem}%</span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Aproveitamento</span>
                </div>
              </div>

              {/* Subject Breakdown */}
              {scanResult.desempenho_por_materia && (
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Desempenho por Área do Conhecimento:
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(scanResult.desempenho_por_materia).map(([mat, data]) => (
                      <div
                        key={mat}
                        className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {mat}
                        </span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {data.acertos} / {data.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Table */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Detalhamento Questão por Questão:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                  {scanResult.questoes_analisadas.map((q) => (
                    <div
                      key={q.numero}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                        q.correta
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-700 dark:text-slate-300">Q{q.numero}</span>
                        {q.correta ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div className="text-[11px] font-bold mt-1">
                        <span>Marcou: <strong className={q.correta ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{q.marcada_aluno}</strong></span>
                        {!q.correta && (
                          <span className="block text-[10px] text-slate-500">Gabarito: <strong>{q.gabarito_correto}</strong></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Recommendation */}
              {scanResult.diagnostico_pedagogico && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-1">
                  <h6 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-indigo-600" /> Diagnóstico Pedagógico do Professor IA
                  </h6>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {scanResult.diagnostico_pedagogico}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3 min-h-[380px]">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Nenhum gabarito lido no momento
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Envie uma foto do seu cartão-resposta à esquerda e clique em "Processar e Corrigir" para visualizar o relatório completo.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
