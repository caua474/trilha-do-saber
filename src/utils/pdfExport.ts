import jsPDF from 'jspdf';
import { StudyMaterial, TutorPlan } from '../types';

export function exportMaterialToPdf(material: StudyMaterial) {
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
    // Top banner/accent bar
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 4, 'F');
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Document Title Header Box
  doc.setFillColor(243, 244, 246); // Slate 100
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 27, 75); // Dark indigo
  doc.text('GabaritaAí • Resumo Sintetizado Bento', margin + 5, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date(material.createdAt || Date.now()).toLocaleDateString('pt-BR');
  const topicStr = material.focusTopic ? `  |  Foco: ${material.focusTopic}` : '';
  doc.text(`Título: ${material.title}  |  Data: ${dateStr}${topicStr}`, margin + 5, y + 17);

  y += 30;

  // --- SECTION 1: Resumo Direto ---
  checkPageBreak(30);
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(67, 56, 202); // Indigo 700
  doc.text('RESUMO DIRETO', margin + 4, y + 5.5);

  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  const resumoLines = doc.splitTextToSize(material.resumoDireto, contentWidth);
  checkPageBreak(resumoLines.length * 5 + 6);
  doc.text(resumoLines, margin, y);
  y += resumoLines.length * 5 + 8;

  // --- SECTION 2: Pontos Principais ---
  checkPageBreak(30);
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text('PONTOS PRINCIPAIS (PARA MEMORIZAR)', margin + 4, y + 5.5);

  y += 12;

  material.pontosPrincipais.forEach((ponto, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const itemLines = doc.splitTextToSize(`[0${idx + 1}] ${ponto}`, contentWidth);
    
    checkPageBreak(itemLines.length * 5 + 4);
    doc.text(itemLines, margin, y);
    y += itemLines.length * 5 + 3;
  });

  y += 5;

  // --- SECTION 3: 3 Perguntas de Teste ---
  if (material.perguntas && material.perguntas.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(252, 211, 77); // Amber 300
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text('PERGUNTAS DE TESTE & GABARITO', margin + 4, y + 5.5);

    y += 12;

    material.perguntas.forEach((q, idx) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);

      const qTitle = `Pergunta ${idx + 1}: ${q.pergunta}`;
      const qLines = doc.splitTextToSize(qTitle, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 4.8 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      const aTitle = `Gabarito: ${q.resposta}`;
      const aLines = doc.splitTextToSize(aTitle, contentWidth - 6);
      checkPageBreak(aLines.length * 4.5 + 4);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y - 1, contentWidth, aLines.length * 4.5 + 3, 1, 1, 'F');
      doc.text(aLines, margin + 3, y + 3.5);
      y += aLines.length * 4.5 + 7;
    });
  }

  // --- SECTION 4: Flashcards de Memorização (se houver) ---
  if (material.flashcards && material.flashcards.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(243, 232, 255); // Purple 100
    doc.setDrawColor(216, 180, 254); // Purple 300
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(126, 34, 206); // Purple 700
    doc.text('FLASHCARDS DE REVISÃO RÁPIDA (LEITURA OFFLINE)', margin + 4, y + 5.5);

    y += 12;

    material.flashcards.forEach((card, idx) => {
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);

      const fLines = doc.splitTextToSize(`Card ${idx + 1} (Frente): ${card.frente}`, contentWidth);
      doc.text(fLines, margin, y);
      y += fLines.length * 4.5 + 2;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      const vLines = doc.splitTextToSize(`Verso: ${card.verso}`, contentWidth - 6);
      checkPageBreak(vLines.length * 4 + 3);

      doc.setFillColor(250, 245, 255);
      doc.roundedRect(margin, y - 1, contentWidth, vLines.length * 4 + 3, 1, 1, 'F');
      doc.text(vLines, margin + 3, y + 3.5);
      y += vLines.length * 4 + 6;
    });
  }

  // Add page numbers at footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `GabaritaAí • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`GabaritaAi_Resumo_${material.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function exportTutorPlanToPdf(plan: TutorPlan) {
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
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 4, 'F');
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 5;
      addHeaderFooter();
    }
  };

  addHeaderFooter();

  // Header Box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30, 27, 75);
  doc.text(`GabaritaAí • Cronograma & Plano do Tutor`, margin + 5, y + 9);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Matéria: ${plan.materia}  |  Objetivo: ${plan.objetivo}  |  Tempo: ${plan.tempoDisponivel}`, margin + 5, y + 17);

  y += 30;

  // --- SECTION 1: Cronograma Sugerido ---
  if (plan.cronograma && plan.cronograma.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(67, 56, 202);
    doc.text('CRONOGRAMA DE ESTUDOS SUGERIDO', margin + 4, y + 5.5);

    y += 12;

    plan.cronograma.forEach((item) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);

      doc.text(`• [${item.duracao}] ${item.etapa}`, margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);

      const descLines = doc.splitTextToSize(item.descricao, contentWidth - 5);
      checkPageBreak(descLines.length * 4.5);
      doc.text(descLines, margin + 5, y);
      y += descLines.length * 4.5 + 4;
    });

    y += 4;
  }

  // --- SECTION 2: Aula e Resumo Prático ---
  if (plan.aulaResumo) {
    checkPageBreak(30);
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(4, 120, 87);
    doc.text('AULA E RESUMO PRÁTICO (TUTOR)', margin + 4, y + 5.5);

    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const aulaParagraphs = plan.aulaResumo.split('\n\n');
    aulaParagraphs.forEach((p) => {
      const pLines = doc.splitTextToSize(p, contentWidth);
      checkPageBreak(pLines.length * 4.5 + 4);
      doc.text(pLines, margin, y);
      y += pLines.length * 4.5 + 4;
    });

    y += 4;
  }

  // --- SECTION 3: Questões Práticas ---
  if (plan.questoes && plan.questoes.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(252, 211, 77);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`QUESTÕES PRÁTICAS (${plan.objetivo})`, margin + 4, y + 5.5);

    y += 12;

    plan.questoes.forEach((q, idx) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);

      const qText = `Questão ${idx + 1}: ${q.pergunta}`;
      const qLines = doc.splitTextToSize(qText, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 4.8 + 2;

      if (q.opcoes && q.opcoes.length > 0) {
        q.opcoes.forEach((opt) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          const optLines = doc.splitTextToSize(`   ${opt}`, contentWidth - 5);
          checkPageBreak(optLines.length * 4 + 2);
          doc.text(optLines, margin, y);
          y += optLines.length * 4 + 1;
        });
      }

      if (q.respostaCorreta || q.explicacaoGabarito) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(5, 150, 105);
        const ansText = `Gabarito: ${q.respostaCorreta || ''}\n${q.explicacaoGabarito || ''}`;
        const ansLines = doc.splitTextToSize(ansText, contentWidth - 5);
        checkPageBreak(ansLines.length * 4.5 + 4);

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, contentWidth, ansLines.length * 4.5 + 3, 1, 1, 'F');
        doc.text(ansLines, margin + 3, y + 3.5);
        y += ansLines.length * 4.5 + 6;
      }

      y += 3;
    });
  }

  // Total pages footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `GabaritaAí • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`GabaritaAi_Plano_${plan.materia.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
