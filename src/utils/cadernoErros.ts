export interface WrongQuestion {
  id: string;
  materia: string;
  topico: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta_index: number;
  resposta_usuario_index: number;
  explicacao: string;
  dataErro: string; // ISO String
  proximaRevisao3Dias: string; // ISO String
  proximaRevisao7Dias: string; // ISO String
  proximaRevisao15Dias: string; // ISO String
  revisadoCount: number;
  dominado: boolean;
}

const CADERNO_ERROS_KEY = 'gabaritai_caderno_erros_v1';

export function getCadernoErros(): WrongQuestion[] {
  try {
    const data = localStorage.getItem(CADERNO_ERROS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao ler Caderno de Erros:', e);
    return [];
  }
}

export function saveWrongQuestion(q: {
  materia: string;
  topico: string;
  pergunta: string;
  opcoes: string[];
  resposta_correta_index: number;
  resposta_usuario_index: number;
  explicacao: string;
}): WrongQuestion {
  const list = getCadernoErros();

  const now = new Date();
  const date3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const date7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const date15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

  // Avoid duplicate exact questions
  const existingIdx = list.findIndex((item) => item.pergunta === q.pergunta);

  const wrongItem: WrongQuestion = {
    id: existingIdx >= 0 ? list[existingIdx].id : 'err_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    materia: q.materia,
    topico: q.topico,
    pergunta: q.pergunta,
    opcoes: q.opcoes,
    resposta_correta_index: q.resposta_correta_index,
    resposta_usuario_index: q.resposta_usuario_index,
    explicacao: q.explicacao,
    dataErro: now.toISOString(),
    proximaRevisao3Dias: date3,
    proximaRevisao7Dias: date7,
    proximaRevisao15Dias: date15,
    revisadoCount: existingIdx >= 0 ? list[existingIdx].revisadoCount : 0,
    dominado: false,
  };

  if (existingIdx >= 0) {
    list[existingIdx] = wrongItem;
  } else {
    list.unshift(wrongItem);
  }

  try {
    localStorage.setItem(CADERNO_ERROS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Erro ao salvar no Caderno de Erros:', e);
  }

  return wrongItem;
}

export function markQuestionDominado(id: string, dominado: boolean = true) {
  const list = getCadernoErros();
  const updated = list.map((item) => {
    if (item.id === id) {
      return { ...item, dominado, revisadoCount: item.revisadoCount + 1 };
    }
    return item;
  });
  try {
    localStorage.setItem(CADERNO_ERROS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao atualizar Caderno de Erros:', e);
  }
}

export function deleteWrongQuestion(id: string) {
  const list = getCadernoErros();
  const updated = list.filter((item) => item.id !== id);
  try {
    localStorage.setItem(CADERNO_ERROS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Erro ao apagar do Caderno de Erros:', e);
  }
}

export function clearCadernoErros() {
  try {
    localStorage.removeItem(CADERNO_ERROS_KEY);
  } catch (e) {
    console.error('Erro ao limpar Caderno de Erros:', e);
  }
}
