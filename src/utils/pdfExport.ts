import jsPDF from 'jspdf';
import { StudyMaterial, TutorPlan, QuestionSolution3Passos, MindmapData } from '../types';

export type PdfVisualTheme = 'minimalista' | 'colorido' | 'foco_leitura';

interface ThemePalette {
  name: string;
  bannerHeight: number;
  bannerColors: [number, number, number][];
  headerBg: [number, number, number];
  headerBorder: [number, number, number];
  headerTitle: [number, number, number];
  subText: [number, number, number];
  sec1Bg: [number, number, number];
  sec1Border: [number, number, number];
  sec1Text: [number, number, number];
  sec2Bg: [number, number, number];
  sec2Border: [number, number, number];
  sec2Text: [number, number, number];
  sec3Bg: [number, number, number];
  sec3Border: [number, number, number];
  sec3Text: [number, number, number];
  bodyText: [number, number, number];
  cardBg: [number, number, number];
  cardBorder: [number, number, number];
  highlightBg: [number, number, number];
  highlightText: [number, number, number];
  lineSpacing: number;
}

function getThemePalette(theme: PdfVisualTheme): ThemePalette {
  if (theme === 'minimalista') {
    return {
      name: 'Minimalista',
      bannerHeight: 2,
      bannerColors: [[30, 41, 59]], // Clean dark slate
      headerBg: [255, 255, 255],
      headerBorder: [203, 213, 225],
      headerTitle: [15, 23, 42],
      subText: [100, 116, 139],
      sec1Bg: [248, 250, 252],
      sec1Border: [203, 213, 225],
      sec1Text: [15, 23, 42],
      sec2Bg: [248, 250, 252],
      sec2Border: [203, 213, 225],
      sec2Text: [15, 23, 42],
      sec3Bg: [248, 250, 252],
      sec3Border: [203, 213, 225],
      sec3Text: [15, 23, 42],
      bodyText: [30, 41, 59],
      cardBg: [255, 255, 255],
      cardBorder: [226, 232, 240],
      highlightBg: [241, 245, 249],
      highlightText: [15, 23, 42],
      lineSpacing: 4.5,
    };
  }

  if (theme === 'foco_leitura') {
    return {
      name: 'Foco em Leitura',
      bannerHeight: 3,
      bannerColors: [[180, 83, 9]], // Warm sepia amber
      headerBg: [253, 251, 247], // Soft Ivory paper
      headerBorder: [229, 223, 209],
      headerTitle: [69, 26, 3], // Warm dark mahogany
      subText: [120, 113, 108],
      sec1Bg: [254, 243, 199], // Warm amber
      sec1Border: [245, 158, 11],
      sec1Text: [146, 64, 14],
      sec2Bg: [250, 245, 235],
      sec2Border: [217, 199, 170],
      sec2Text: [120, 53, 15],
      sec3Bg: [245, 240, 230],
      sec3Border: [214, 204, 185],
      sec3Text: [68, 64, 60],
      bodyText: [41, 37, 36], // Warm charcoal
      cardBg: [255, 254, 250],
      cardBorder: [231, 225, 213],
      highlightBg: [253, 246, 227],
      highlightText: [120, 53, 15],
      lineSpacing: 5.3, // Generous line spacing for relaxed reading
    };
  }

  // default: 'colorido' (Infográfico)
  return {
    name: 'Colorido (Infográfico)',
    bannerHeight: 4,
    bannerColors: [[79, 70, 229], [245, 158, 11]], // Indigo & Amber
    headerBg: [243, 244, 246],
    headerBorder: [224, 231, 255],
    headerTitle: [30, 27, 75],
    subText: [99, 102, 241],
    sec1Bg: [238, 242, 255], // Indigo 50
    sec1Border: [199, 210, 254],
    sec1Text: [67, 56, 202],
    sec2Bg: [236, 253, 245], // Emerald 50
    sec2Border: [167, 243, 208],
    sec2Text: [4, 120, 87],
    sec3Bg: [254, 243, 199], // Amber 100
    sec3Border: [252, 211, 77],
    sec3Text: [180, 83, 9],
    bodyText: [30, 41, 59],
    cardBg: [255, 255, 255],
    cardBorder: [199, 210, 254],
    highlightBg: [16, 185, 129], // Emerald
    highlightText: [255, 255, 255],
    lineSpacing: 4.8,
  };
}

// 1. EXPORTAÇÃO DE MATERIAL / RESUMO
export function exportMaterialToPdf(material: StudyMaterial, theme: PdfVisualTheme = 'colorido') {
  const pal = getThemePalette(theme);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeaderFooter = () => {
    if (pal.bannerColors.length === 1) {
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, pageWidth, pal.bannerHeight, 'F');
    } else {
      const half = pageWidth / 2;
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, half, pal.bannerHeight, 'F');
      doc.setFillColor(pal.bannerColors[1][0], pal.bannerColors[1][1], pal.bannerColors[1][2]);
      doc.rect(half, 0, half, pal.bannerHeight, 'F');
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 8) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Header Box
  doc.setFillColor(pal.headerBg[0], pal.headerBg[1], pal.headerBg[2]);
  doc.setDrawColor(pal.headerBorder[0], pal.headerBorder[1], pal.headerBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
  doc.text(`Gabaritou • Resumo Sintetizado (${pal.name})`, margin + 5, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(pal.subText[0], pal.subText[1], pal.subText[2]);
  const dateStr = new Date(material.createdAt || Date.now()).toLocaleDateString('pt-BR');
  const topicStr = material.focusTopic ? `  |  Foco: ${material.focusTopic}` : '';
  doc.text(`Título: ${material.title}  |  Data: ${dateStr}${topicStr}`, margin + 5, y + 17);

  y += 30;

  // --- SECTION 1: Resumo Direto ---
  checkPageBreak(30);
  doc.setFillColor(pal.sec1Bg[0], pal.sec1Bg[1], pal.sec1Bg[2]);
  doc.setDrawColor(pal.sec1Border[0], pal.sec1Border[1], pal.sec1Border[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(pal.sec1Text[0], pal.sec1Text[1], pal.sec1Text[2]);
  doc.text('RESUMO DIRETO', margin + 4, y + 5.5);

  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);

  const resumoLines = doc.splitTextToSize(material.resumoDireto, contentWidth);
  checkPageBreak(resumoLines.length * pal.lineSpacing + 6);
  doc.text(resumoLines, margin, y);
  y += resumoLines.length * pal.lineSpacing + 8;

  // --- SECTION 2: Pontos Principais ---
  checkPageBreak(30);
  doc.setFillColor(pal.sec2Bg[0], pal.sec2Bg[1], pal.sec2Bg[2]);
  doc.setDrawColor(pal.sec2Border[0], pal.sec2Border[1], pal.sec2Border[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(pal.sec2Text[0], pal.sec2Text[1], pal.sec2Text[2]);
  doc.text('PONTOS PRINCIPAIS (PARA MEMORIZAR)', margin + 4, y + 5.5);

  y += 12;

  material.pontosPrincipais.forEach((ponto, idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
    const itemLines = doc.splitTextToSize(`[0${idx + 1}] ${ponto}`, contentWidth);

    checkPageBreak(itemLines.length * pal.lineSpacing + 4);
    doc.text(itemLines, margin, y);
    y += itemLines.length * pal.lineSpacing + 3;
  });

  y += 5;

  // --- SECTION 3: Perguntas de Teste ---
  if (material.perguntas && material.perguntas.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(pal.sec3Bg[0], pal.sec3Bg[1], pal.sec3Bg[2]);
    doc.setDrawColor(pal.sec3Border[0], pal.sec3Border[1], pal.sec3Border[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(pal.sec3Text[0], pal.sec3Text[1], pal.sec3Text[2]);
    doc.text('PERGUNTAS DE TESTE & GABARITO', margin + 4, y + 5.5);

    y += 12;

    material.perguntas.forEach((q, idx) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);

      const qTitle = `Pergunta ${idx + 1}: ${q.pergunta}`;
      const qLines = doc.splitTextToSize(qTitle, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * (pal.lineSpacing * 0.95) + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);

      const aTitle = `Gabarito: ${q.resposta}`;
      const aLines = doc.splitTextToSize(aTitle, contentWidth - 6);
      checkPageBreak(aLines.length * pal.lineSpacing + 4);

      doc.setFillColor(pal.cardBg[0], pal.cardBg[1], pal.cardBg[2]);
      doc.setDrawColor(pal.cardBorder[0], pal.cardBorder[1], pal.cardBorder[2]);
      doc.roundedRect(margin, y - 1, contentWidth, aLines.length * pal.lineSpacing + 3, 1, 1, 'FD');
      doc.text(aLines, margin + 3, y + 3.5);
      y += aLines.length * pal.lineSpacing + 7;
    });
  }

  // Numeração de páginas no rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gabaritou • Tema: ${pal.name} • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Gabaritou_Resumo_${material.title.replace(/[^a-zA-Z0-9]/g, '_')}_${theme}.pdf`);
}

// 2. EXPORTAÇÃO DE PLANO DO TUTOR
export function exportTutorPlanToPdf(plan: TutorPlan, theme: PdfVisualTheme = 'colorido') {
  const pal = getThemePalette(theme);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeaderFooter = () => {
    doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
    doc.rect(0, 0, pageWidth, pal.bannerHeight, 'F');
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 8) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Header Box
  doc.setFillColor(pal.headerBg[0], pal.headerBg[1], pal.headerBg[2]);
  doc.setDrawColor(pal.headerBorder[0], pal.headerBorder[1], pal.headerBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
  doc.text(`Gabaritou • Plano do Tutor (${pal.name})`, margin + 5, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(pal.subText[0], pal.subText[1], pal.subText[2]);
  doc.text(`Matéria: ${plan.materia}  |  Objetivo: ${plan.objetivo}  |  Tempo: ${plan.tempoDisponivel}`, margin + 5, y + 17);

  y += 30;

  // Cronograma Sugerido
  if (plan.cronograma && plan.cronograma.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(pal.sec1Bg[0], pal.sec1Bg[1], pal.sec1Bg[2]);
    doc.setDrawColor(pal.sec1Border[0], pal.sec1Border[1], pal.sec1Border[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(pal.sec1Text[0], pal.sec1Text[1], pal.sec1Text[2]);
    doc.text('CRONOGRAMA SUGERIDO', margin + 4, y + 5.5);

    y += 12;

    plan.cronograma.forEach((item) => {
      checkPageBreak(18);
      const duracao = item.duracao || (item as any).tempo || '';
      const etapa = item.etapa || (item as any).atividade || '';
      const desc = item.descricao || (item as any).detalhe || '';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
      doc.text(`• ${duracao ? duracao + ': ' : ''}${etapa}`, margin + 2, y);
      y += 4.8;

      if (desc) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
        const detLines = doc.splitTextToSize(desc, contentWidth - 6);
        checkPageBreak(detLines.length * pal.lineSpacing + 3);
        doc.text(detLines, margin + 6, y);
        y += detLines.length * pal.lineSpacing + 3;
      }
    });
  }

  // Footer com números de páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gabaritou • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Gabaritou_Plano_${plan.materia.replace(/[^a-zA-Z0-9]/g, '_')}_${theme}.pdf`);
}

// 3. EXPORTAÇÃO DE RESOLUÇÃO DO SCANNER (TIRA-DÚVIDAS 3 PASSOS)
export function exportQuestionSolutionToPdf(
  solution: QuestionSolution3Passos,
  questionInput?: string,
  theme: PdfVisualTheme = 'colorido'
) {
  const pal = getThemePalette(theme);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeaderFooter = () => {
    if (pal.bannerColors.length === 1) {
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, pageWidth, pal.bannerHeight, 'F');
    } else {
      const half = pageWidth / 2;
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, half, pal.bannerHeight, 'F');
      doc.setFillColor(pal.bannerColors[1][0], pal.bannerColors[1][1], pal.bannerColors[1][2]);
      doc.rect(half, 0, half, pal.bannerHeight, 'F');
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Header Box
  doc.setFillColor(pal.headerBg[0], pal.headerBg[1], pal.headerBg[2]);
  doc.setDrawColor(pal.headerBorder[0], pal.headerBorder[1], pal.headerBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
  doc.text(`Gabaritou • Scanner Tira-Dúvidas (${pal.name})`, margin + 5, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(pal.subText[0], pal.subText[1], pal.subText[2]);
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const materia = solution.materia || 'Geral';
  doc.text(`Disciplina: ${materia}   |   Data: ${dataHoje}   |   Resolução Estruturada em 3 Passos`, margin + 5, y + 17);

  y += 32;

  // --- SEÇÃO 1: Enunciado da Questão ---
  const enunciadoText =
    solution.transcricao_enunciado ||
    solution.passo1_compreensao ||
    questionInput ||
    'Questão registrada no Scanner Tira-Dúvidas';

  checkPageBreak(30);
  doc.setFillColor(pal.sec1Bg[0], pal.sec1Bg[1], pal.sec1Bg[2]);
  doc.setDrawColor(pal.sec1Border[0], pal.sec1Border[1], pal.sec1Border[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(pal.sec1Text[0], pal.sec1Text[1], pal.sec1Text[2]);
  doc.text('1. ENUNCIADO IDENTIFICADO', margin + 4, y + 5.5);

  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
  const enunciadoLines = doc.splitTextToSize(enunciadoText, contentWidth - 6);
  const enunciadoBoxHeight = enunciadoLines.length * pal.lineSpacing + 6;
  checkPageBreak(enunciadoBoxHeight + 4);

  doc.setFillColor(pal.cardBg[0], pal.cardBg[1], pal.cardBg[2]);
  doc.setDrawColor(pal.cardBorder[0], pal.cardBorder[1], pal.cardBorder[2]);
  doc.roundedRect(margin, y - 1, contentWidth, enunciadoBoxHeight, 2, 2, 'FD');
  doc.text(enunciadoLines, margin + 4, y + 4.5);
  y += enunciadoBoxHeight + 7;

  // --- SEÇÃO 2: Conceito-Chave & Área ---
  const conceitoText = solution.conceito_chave || solution.passo2_formula_conceito || 'Conceito Fundamental da Questão';
  checkPageBreak(30);
  doc.setFillColor(pal.sec2Bg[0], pal.sec2Bg[1], pal.sec2Bg[2]);
  doc.setDrawColor(pal.sec2Border[0], pal.sec2Border[1], pal.sec2Border[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(pal.sec2Text[0], pal.sec2Text[1], pal.sec2Text[2]);
  doc.text('2. CONCEITO-CHAVE & FÓRMULA PRINCIPAL', margin + 4, y + 5.5);

  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
  const conceitoLines = doc.splitTextToSize(conceitoText, contentWidth - 6);
  const conceitoBoxHeight = conceitoLines.length * pal.lineSpacing + 6;
  checkPageBreak(conceitoBoxHeight + 4);

  doc.setFillColor(pal.cardBg[0], pal.cardBg[1], pal.cardBg[2]);
  doc.setDrawColor(pal.cardBorder[0], pal.cardBorder[1], pal.cardBorder[2]);
  doc.roundedRect(margin, y - 1, contentWidth, conceitoBoxHeight, 2, 2, 'FD');
  doc.text(conceitoLines, margin + 4, y + 4.5);
  y += conceitoBoxHeight + 7;

  // --- SEÇÃO 3: Resolução Passo a Passo ---
  const resolucaoText = solution.resolucao_passo_a_passo || solution.passo3_resolucao_guiada;
  checkPageBreak(30);
  doc.setFillColor(pal.sec3Bg[0], pal.sec3Bg[1], pal.sec3Bg[2]);
  doc.setDrawColor(pal.sec3Border[0], pal.sec3Border[1], pal.sec3Border[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(pal.sec3Text[0], pal.sec3Text[1], pal.sec3Text[2]);
  doc.text('3. RESOLUÇÃO DETALHADA PASSO A PASSO', margin + 4, y + 5.5);

  y += 12;

  const paragraphs = resolucaoText.split('\n');
  paragraphs.forEach((p) => {
    if (!p.trim()) {
      y += 2;
      return;
    }
    const isHeader = p.trim().startsWith('Passo') || p.trim().startsWith('1.') || p.trim().startsWith('2.') || p.trim().startsWith('3.') || p.trim().startsWith('Etapa');
    doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
    if (isHeader) {
      doc.setTextColor(pal.sec3Text[0], pal.sec3Text[1], pal.sec3Text[2]);
    } else {
      doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
    }

    const pLines = doc.splitTextToSize(p, contentWidth);
    checkPageBreak(pLines.length * pal.lineSpacing + 3);
    doc.text(pLines, margin, y);
    y += pLines.length * pal.lineSpacing + 2;
  });

  y += 5;

  // --- SEÇÃO 4: Gabarito e Resposta Final ---
  const gabaritoText = solution.gabarito_resposta_final || solution.gabarito_final || 'Verificação concluída';
  checkPageBreak(25);
  doc.setFillColor(pal.highlightBg[0], pal.highlightBg[1], pal.highlightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(pal.highlightText[0], pal.highlightText[1], pal.highlightText[2]);
  doc.text('GABARITO / RESPOSTA FINAL:', margin + 5, y + 5.5);

  doc.setFontSize(11);
  doc.text(gabaritoText, margin + 5, y + 10.5);

  y += 18;

  // --- SEÇÃO 5: Dica Rápida / Estratégia de Prova ---
  if (solution.dica_rapida) {
    checkPageBreak(22);
    doc.setFillColor(pal.sec1Bg[0], pal.sec1Bg[1], pal.sec1Bg[2]);
    doc.setDrawColor(pal.sec1Border[0], pal.sec1Border[1], pal.sec1Border[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(pal.sec1Text[0], pal.sec1Text[1], pal.sec1Text[2]);
    doc.text('DICA DE OURO PARA A PROVA', margin + 4, y + 5.5);

    y += 11;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);

    const dicaLines = doc.splitTextToSize(solution.dica_rapida, contentWidth - 6);
    checkPageBreak(dicaLines.length * pal.lineSpacing + 4);

    doc.setFillColor(pal.cardBg[0], pal.cardBg[1], pal.cardBg[2]);
    doc.roundedRect(margin, y - 1, contentWidth, dicaLines.length * pal.lineSpacing + 4, 1, 1, 'F');
    doc.text(dicaLines, margin + 3, y + 3);
    y += dicaLines.length * pal.lineSpacing + 6;
  }

  // Footer com números de páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gabaritou • Resolução Tira-Dúvidas • Tema: ${pal.name} • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const cleanMateria = (solution.materia || 'Questao').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Gabaritou_Scanner_${cleanMateria}_${theme}.pdf`);
}

// 4. EXPORTAÇÃO DE MAPA MENTAL
export function exportMindmapToPdf(mindmap: MindmapData, theme: PdfVisualTheme = 'colorido') {
  const pal = getThemePalette(theme);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeaderFooter = () => {
    if (pal.bannerColors.length === 1) {
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, pageWidth, pal.bannerHeight, 'F');
    } else {
      const half = pageWidth / 2;
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, half, pal.bannerHeight, 'F');
      doc.setFillColor(pal.bannerColors[1][0], pal.bannerColors[1][1], pal.bannerColors[1][2]);
      doc.rect(half, 0, half, pal.bannerHeight, 'F');
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Header Box
  doc.setFillColor(pal.headerBg[0], pal.headerBg[1], pal.headerBg[2]);
  doc.setDrawColor(pal.headerBorder[0], pal.headerBorder[1], pal.headerBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
  doc.text(`Gabaritou • Mapa Mental do Edital (${pal.name})`, margin + 6, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(pal.subText[0], pal.subText[1], pal.subText[2]);
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  doc.text(`Disciplina: ${mindmap.materia}   |   Tópico: ${mindmap.topicoNome}   |   Data: ${dataHoje}`, margin + 6, y + 18);

  y += 33;

  // --- NÓ CENTRAL: Conceito Central ---
  checkPageBreak(30);
  doc.setFillColor(pal.highlightBg[0], pal.highlightBg[1], pal.highlightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(pal.highlightText[0], pal.highlightText[1], pal.highlightText[2]);
  doc.text('CONCEITO CENTRAL:', margin + 6, y + 6);

  doc.setFontSize(12);
  doc.text(mindmap.conceitoCentral, margin + 6, y + 13);

  y += 24;

  // --- RAMIFICAÇÕES PRINCIPAIS ---
  mindmap.ramificacoes.forEach((ramifica, index) => {
    checkPageBreak(38);

    let headerBgR = pal.sec1Bg[0], headerBgG = pal.sec1Bg[1], headerBgB = pal.sec1Bg[2];
    let textR = pal.sec1Text[0], textG = pal.sec1Text[1], textB = pal.sec1Text[2];
    let borderColorR = pal.sec1Border[0], borderColorG = pal.sec1Border[1], borderColorB = pal.sec1Border[2];

    if (theme === 'colorido') {
      if (ramifica.corTheme === 'emerald') {
        headerBgR = 236; headerBgG = 253; headerBgB = 245;
        textR = 4; textG = 120; textB = 87;
        borderColorR = 167; borderColorG = 243; borderColorB = 208;
      } else if (ramifica.corTheme === 'amber') {
        headerBgR = 254; headerBgG = 243; headerBgB = 199;
        textR = 180; textG = 83; textB = 9;
        borderColorR = 252; borderColorG = 211; borderColorB = 77;
      } else if (ramifica.corTheme === 'rose') {
        headerBgR = 255; headerBgG = 228; headerBgB = 230;
        textR = 190; textG = 18; textB = 60;
        borderColorR = 253; borderColorG = 164; borderColorB = 175;
      } else if (ramifica.corTheme === 'indigo') {
        headerBgR = 238; headerBgG = 242; headerBgB = 255;
        textR = 67; textG = 56; textB = 202;
        borderColorR = 199; borderColorG = 210; borderColorB = 254;
      }
    }

    doc.setFillColor(headerBgR, headerBgG, headerBgB);
    doc.setDrawColor(borderColorR, borderColorG, borderColorB);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(textR, textG, textB);
    doc.text(`RAMIFICAÇÃO ${index + 1}: ${ramifica.titulo}`, margin + 4, y + 5.5);

    y += 12;

    ramifica.subtopicos.forEach((sub) => {
      checkPageBreak(18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
      doc.text(`• ${sub.conceito}`, margin + 3, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);

      const subLines = doc.splitTextToSize(sub.detalhes, contentWidth - 8);
      checkPageBreak(subLines.length * pal.lineSpacing + 3);
      doc.text(subLines, margin + 7, y);
      y += subLines.length * pal.lineSpacing + 3.5;

      if (sub.dicaEnem) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(pal.sec3Text[0], pal.sec3Text[1], pal.sec3Text[2]);
        const dicaLines = doc.splitTextToSize(`Dica de Prova: ${sub.dicaEnem}`, contentWidth - 8);
        checkPageBreak(dicaLines.length * pal.lineSpacing + 2);
        doc.text(dicaLines, margin + 7, y);
        y += dicaLines.length * pal.lineSpacing + 3;
      }
    });

    y += 4;
  });

  // Footer com números de páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gabaritou • Mapa Mental • Tema: ${pal.name} • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const cleanTopico = (mindmap.topicoNome || 'Topico').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Gabaritou_MapaMental_${cleanTopico}_${theme}.pdf`);
}

// 5. EXPORTAÇÃO DE CORREÇÃO DE REDAÇÃO ENEM (0 A 1000 PONTOS + C1-C5)
export function exportEssayCorrectionToPdf(
  analysis: {
    nota_estimada_total?: number;
    nota_final?: number;
    tema_detectado?: string;
    competencias?: any;
    pontos_fortes?: string[];
    pontos_a_melhorar?: string[];
    pontos_melhoria?: string[];
    dica_de_ouro?: string;
    sugestao_reescrita?: string;
    aviso_legal?: string;
  },
  textoRedacao?: string,
  temaRedacao?: string,
  theme: PdfVisualTheme = 'colorido'
) {
  const pal = getThemePalette(theme);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addHeaderFooter = () => {
    if (pal.bannerColors.length === 1) {
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, pageWidth, pal.bannerHeight, 'F');
    } else {
      const half = pageWidth / 2;
      doc.setFillColor(pal.bannerColors[0][0], pal.bannerColors[0][1], pal.bannerColors[0][2]);
      doc.rect(0, 0, half, pal.bannerHeight, 'F');
      doc.setFillColor(pal.bannerColors[1][0], pal.bannerColors[1][1], pal.bannerColors[1][2]);
      doc.rect(half, 0, half, pal.bannerHeight, 'F');
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Header Box
  doc.setFillColor(pal.headerBg[0], pal.headerBg[1], pal.headerBg[2]);
  doc.setDrawColor(pal.headerBorder[0], pal.headerBorder[1], pal.headerBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
  doc.text(`Gabaritou • Relatório Oficial de Redação ENEM (${pal.name})`, margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(pal.subText[0], pal.subText[1], pal.subText[2]);
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  const temaFinal = analysis.tema_detectado || temaRedacao || 'Tema ENEM';
  doc.text(`Tema: ${temaFinal.slice(0, 70)}   |   Data: ${dataHoje}`, margin + 6, y + 17);

  y += 32;

  // Extrair notas das 5 competências
  let c1 = 160, c2 = 160, c3 = 160, c4 = 160, c5 = 160;
  let c1Feed = '', c2Feed = '', c3Feed = '', c4Feed = '', c5Feed = '';

  if (Array.isArray(analysis.competencias)) {
    analysis.competencias.forEach((c: any) => {
      if (c.numero === 1) { c1 = c.nota; c1Feed = c.feedback; }
      if (c.numero === 2) { c2 = c.nota; c2Feed = c.feedback; }
      if (c.numero === 3) { c3 = c.nota; c3Feed = c.feedback; }
      if (c.numero === 4) { c4 = c.nota; c4Feed = c.feedback; }
      if (c.numero === 5) { c5 = c.nota; c5Feed = c.feedback; }
    });
  } else if (analysis.competencias) {
    const comp = analysis.competencias;
    if (comp.c1_gramatica) { c1 = comp.c1_gramatica.nota || 0; c1Feed = comp.c1_gramatica.feedback || ''; }
    if (comp.c2_repertorio) { c2 = comp.c2_repertorio.nota || 0; c2Feed = comp.c2_repertorio.feedback || ''; }
    if (comp.c3_argumentacao) { c3 = comp.c3_argumentacao.nota || 0; c3Feed = comp.c3_argumentacao.feedback || ''; }
    if (comp.c4_coesao) { c4 = comp.c4_coesao.nota || 0; c4Feed = comp.c4_coesao.feedback || ''; }
    if (comp.c5_proposta_intervencao) { c5 = comp.c5_proposta_intervencao.nota || 0; c5Feed = comp.c5_proposta_intervencao.feedback || ''; }
  }

  // NOTA TOTAL = SOMA DAS 5 COMPETÊNCIAS (0 a 1000 pontos)
  const notaTotal = c1 + c2 + c3 + c4 + c5;

  // CARD DE NOTA TOTAL (0 a 1000)
  checkPageBreak(30);
  doc.setFillColor(pal.highlightBg[0], pal.highlightBg[1], pal.highlightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(pal.highlightText[0], pal.highlightText[1], pal.highlightText[2]);
  doc.text('NOTA FINAL ESTIMADA (SOMA DAS 5 COMPETÊNCIAS DO ENEM):', margin + 6, y + 8);

  doc.setFontSize(16);
  doc.text(`${notaTotal} / 1000 PONTOS`, margin + 6, y + 16);

  // Status text
  let statusNota = 'Excelente (Faixa 900+)';
  if (notaTotal < 600) statusNota = 'Atenção aos Fundamentos (Abaixo de 600)';
  else if (notaTotal < 750) statusNota = 'Bom Potencial (600 a 740)';
  else if (notaTotal < 880) statusNota = 'Muito Bom (760 a 860)';
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Classificação: ${statusNota}`, margin + 110, y + 16);

  y += 28;

  // --- DETALHAMENTO POR COMPETÊNCIA (C1 a C5) ---
  checkPageBreak(30);
  doc.setFillColor(pal.sec1Bg[0], pal.sec1Bg[1], pal.sec1Bg[2]);
  doc.setDrawColor(pal.sec1Border[0], pal.sec1Border[1], pal.sec1Border[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(pal.sec1Text[0], pal.sec1Text[1], pal.sec1Text[2]);
  doc.text('DETALHAMENTO POR COMPETÊNCIA (0 A 200 PONTOS CADA)', margin + 4, y + 5.5);

  y += 12;

  const comps = [
    { num: 1, nome: 'C1: Domínio da Norma Culta da Língua Escrita', nota: c1, feed: c1Feed },
    { num: 2, nome: 'C2: Compreensão da Proposta & Repertório Sociocultural', nota: c2, feed: c2Feed },
    { num: 3, nome: 'C3: Projeto de Texto & Seleção de Argumentos', nota: c3, feed: c3Feed },
    { num: 4, nome: 'C4: Coesão Textual, Conectivos & Articulação', nota: c4, feed: c4Feed },
    { num: 5, nome: 'C5: Proposta de Intervenção (5 Elementos Obrigatórios)', nota: c5, feed: c5Feed },
  ];

  comps.forEach((comp) => {
    checkPageBreak(18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
    doc.text(`${comp.nome}: ${comp.nota} / 200 pts`, margin + 2, y);
    y += 4.5;

    if (comp.feed) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
      const feedLines = doc.splitTextToSize(comp.feed, contentWidth - 8);
      checkPageBreak(feedLines.length * pal.lineSpacing + 3);
      doc.text(feedLines, margin + 5, y);
      y += feedLines.length * pal.lineSpacing + 3;
    }
  });

  y += 4;

  // --- PONTOS FORTES DO TEXTO ---
  const pontosFortes = analysis.pontos_fortes || [];
  if (pontosFortes.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(pal.sec2Bg[0], pal.sec2Bg[1], pal.sec2Bg[2]);
    doc.setDrawColor(pal.sec2Border[0], pal.sec2Border[1], pal.sec2Border[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(pal.sec2Text[0], pal.sec2Text[1], pal.sec2Text[2]);
    doc.text('PONTOS FORTES DO SEU TEXTO', margin + 4, y + 5.5);

    y += 11;

    pontosFortes.forEach((pf) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
      const pfLines = doc.splitTextToSize(`✓ ${pf}`, contentWidth - 4);
      doc.text(pfLines, margin + 4, y);
      y += pfLines.length * pal.lineSpacing + 2;
    });
    y += 4;
  }

  // --- O QUE PRECISA SER CORRIGIDO / MELHORADO ---
  const pontosMelhoria = analysis.pontos_melhoria || analysis.pontos_a_melhorar || [];
  if (pontosMelhoria.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(pal.sec3Bg[0], pal.sec3Bg[1], pal.sec3Bg[2]);
    doc.setDrawColor(pal.sec3Border[0], pal.sec3Border[1], pal.sec3Border[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(pal.sec3Text[0], pal.sec3Text[1], pal.sec3Text[2]);
    doc.text('O QUE PRECISA SER CORRIGIDO / MELHORADO', margin + 4, y + 5.5);

    y += 11;

    pontosMelhoria.forEach((pm) => {
      checkPageBreak(12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
      const pmLines = doc.splitTextToSize(`! ${pm}`, contentWidth - 4);
      doc.text(pmLines, margin + 4, y);
      y += pmLines.length * pal.lineSpacing + 2;
    });
    y += 4;
  }

  // --- DICA DE OURO / SUGESTÃO DE REESCRITA ---
  const sugestao = analysis.sugestao_reescrita || analysis.dica_de_ouro;
  if (sugestao) {
    checkPageBreak(25);
    doc.setFillColor(pal.cardBg[0], pal.cardBg[1], pal.cardBg[2]);
    doc.setDrawColor(pal.cardBorder[0], pal.cardBorder[1], pal.cardBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(pal.headerTitle[0], pal.headerTitle[1], pal.headerTitle[2]);
    doc.text('SUGESTÃO PRÁTICA DE REESCRITA / DICA DE OURO', margin + 4, y + 5.5);

    y += 11;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(pal.bodyText[0], pal.bodyText[1], pal.bodyText[2]);
    const sugLines = doc.splitTextToSize(`"${sugestao}"`, contentWidth - 6);
    checkPageBreak(sugLines.length * pal.lineSpacing + 4);
    doc.text(sugLines, margin + 4, y);
    y += sugLines.length * pal.lineSpacing + 6;
  }

  // Footer com números de páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Gabaritou • Correção Oficial de Redação ENEM • Tema: ${pal.name} • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`Gabaritou_Redacao_ENEM_${notaTotal}pts_${theme}.pdf`);
}
