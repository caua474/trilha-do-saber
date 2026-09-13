import React, { useState } from 'react';
import { FileText, Printer, Sparkles, AlertTriangle, BookOpen, Copy, Check, Download, Zap } from 'lucide-react';

interface CheatSheetData {
  materia: string;
  topico: string;
  resumo_executivo: string;
  conceitos_chave: { termo: string; definicao: string }[];
  formulas_e_regras: { nome: string; expressao: string; quando_usar: string }[];
  pega_rabichos: string[];
  gatilhos_de_memorizacao: string[];
}

export const CheatSheetGeneratorSection: React.FC = () => {
  const [materia, setMateria] = useState<string>('Matemática');
  const [topico, setTopico] = useState<string>('Função Quadrática e Parábolas');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sheet, setSheet] = useState<CheatSheetData | null>({
    materia: 'Matemática',
    topico: 'Função Quadrática e Parábolas',
    resumo_executivo: 'A Função Quadrática f(x) = ax² + bx + c modela trajetórias parabólicas, máximos e mínimos econômicos. O sinal de "a" define a concavidade e Delta (Δ) determina o número de raízes reais.',
    conceitos_chave: [
      { termo: 'Concavidade (Sinal de a)', definicao: 'Se a > 0: parábola voltada para cima (ponto de mínimo). Se a < 0: voltada para baixo (ponto de máximo).' },
      { termo: 'Discriminante Delta (Δ)', definicao: 'Δ = b² - 4ac. Δ > 0 (2 raízes reais distintas); Δ = 0 (1 raiz real dupla); Δ < 0 (nenhuma raiz real).' },
      { termo: 'Vértice da Parábola', definicao: 'Coordenadas do ponto crítico: Xv = -b / (2a) e Yv = -Δ / (4a).' },
    ],
    formulas_e_regras: [
      { nome: 'Fórmula de Bhaskara', expressao: 'x = (-b ± √Δ) / (2a)', quando_usar: 'Para encontrar as raízes onde a função intersecta o eixo X.' },
      { nome: 'Coordenada Yv (Valor Máximo/Mínimo)', expressao: 'Yv = -Δ / (4a)', quando_usar: 'Para calcular o lucro máximo, altura máxima ou custo mínimo.' },
      { nome: 'Soma e Produto das Raízes', expressao: 'x1 + x2 = -b/a  |  x1 · x2 = c/a', quando_usar: 'Para achar raízes inteiras rapidamente sem Bhaskara.' },
    ],
    pega_rabichos: [
      'Não confunda "o valor que gera o lucro máximo" (Xv) com "o valor do lucro máximo em si" (Yv)!',
      'Lembre-se: se a questão pedir altura máxima de um projetil, ela está pedindo a coordenada Y do vértice (Yv).',
    ],
    gatilhos_de_memorizacao: [
      'Mnemônico Xv: "Menos b, sobre dois a, no eixo x vai parar!"',
      'Mnemônico Yv: "Menos Delta sobre quatro a, o topo da montanha vai achar!"',
    ],
  });

  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!topico.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-cheatsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materia, topico }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSheet(data.data);
      }
    } catch (e) {
      console.error('Erro ao gerar folha de véspera:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!sheet) return;
    const text = `📄 FOLHA DE VÉSPERA (CHEAT SHEET): ${sheet.materia} - ${sheet.topico}
    
⚡ Resumo Executivo:
${sheet.resumo_executivo}

📌 Conceitos-Chave:
${sheet.conceitos_chave.map((c) => `- ${c.termo}: ${c.definicao}`).join('\n')}

📐 Fórmulas & Regras:
${sheet.formulas_e_regras.map((f) => `- ${f.nome}: ${f.expressao} (${f.quando_usar})`).join('\n')}

⚠️ Pega-Rabichos:
${sheet.pega_rabichos.map((p) => `- ${p}`).join('\n')}

💡 Gatilhos de Memorização:
${sheet.gatilhos_de_memorizacao.map((g) => `- ${g}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/60 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl print:hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="bg-indigo-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <FileText className="w-3.5 h-3.5" /> Compilador de Revisão de Véspera
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              📑 Gerador de Folha de Véspera (Cheat Sheet)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Sintetize qualquer conteúdo extenso em um resumo ultra-denso de 1 página pronto para revisão rápida antes da prova ou impressão!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-xl">
              ⚡
            </div>
            <div>
              <span className="text-xs text-indigo-200 font-bold block uppercase tracking-wider">Formato Sintético</span>
              <span className="text-sm font-black text-white">1 Página Imprimível</span>
            </div>
          </div>
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Disciplina / Área:
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Matemática">Matemática</option>
              <option value="Física">Física</option>
              <option value="Química">Química</option>
              <option value="Biologia">Biologia</option>
              <option value="História">História</option>
              <option value="Geografia">Geografia</option>
              <option value="Português & Gramática">Português & Gramática</option>
              <option value="Redação ENEM">Redação ENEM</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
              Tópico para Compilar:
            </label>
            <input
              type="text"
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              placeholder="Ex: Leis de Newton, Estequiometria, Brasil Colônia..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topico.trim()}
          className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black transition cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Sintetizando Folha de Véspera...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Gerar Folha de Véspera Sintética (Cheat Sheet)</span>
            </>
          )}
        </button>
      </div>

      {/* CHEAT SHEET PRINTABLE DISPLAY */}
      {sheet && (
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 print:border-none print:shadow-none print:p-0">
          {/* SHEET HEADER & ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-100 dark:border-indigo-900/60 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                {sheet.materia} • Resumo de 1 Página
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {sheet.topico}
              </h3>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>
          </div>

          {/* ⚡ RESUMO EXECUTIVO */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300 block">
              ⚡ Visão Geral Sintética
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
              {sheet.resumo_executivo}
            </p>
          </div>

          {/* GRID OF CONCEPTS & FORMULAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CONCEITOS CHAVE */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Conceitos Essenciais
              </h4>

              <div className="space-y-2">
                {sheet.conceitos_chave.map((c, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      • {c.termo}
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium pl-3">
                      {c.definicao}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FÓRMULAS E REGRAS */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Fórmulas & Aplicações
              </h4>

              <div className="space-y-2.5">
                {sheet.formulas_e_regras.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">{f.nome}</span>
                      <span className="text-[10px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded">
                        {f.expressao}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      💡 Quando usar: {f.quando_usar}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PEGA RABICHOS & GATILHOS DE MEMORIZAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PEGA RABICHOS */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 space-y-2">
              <h4 className="text-xs font-black uppercase text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Cuidado! Pega-Rabichos Clássicos
              </h4>
              <ul className="space-y-1">
                {sheet.pega_rabichos.map((p, idx) => (
                  <li key={idx} className="text-xs font-bold text-rose-950 dark:text-rose-200 leading-snug">
                    ⚠️ {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* GATILHOS DE MEMORIZAÇÃO */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                💡 Gatilhos & Mnemônicos
              </h4>
              <ul className="space-y-1">
                {sheet.gatilhos_de_memorizacao.map((g, idx) => (
                  <li key={idx} className="text-xs font-bold text-amber-950 dark:text-amber-200 leading-snug">
                    🧠 {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
