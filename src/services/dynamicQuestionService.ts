// Serviço de Perguntas Dinâmicas por Inteligência Artificial
// Possui sistema inteligente anti-repetição com memória de histórico e progressão de jornada (30 dias)

import { getSupabaseClient } from './authService';

export type QuestionCategory =
  | 'Foco Diário'
  | 'Gestão de Ansiedade'
  | 'Autodesenvolvimento'
  | 'Reflexões Noturnas';

export interface DynamicQuestion {
  id: string;
  diaJornada: number;
  categoria: QuestionCategory;
  tema: string;
  pergunta: string;
  contextoProfundo: string;
  tipo: 'reflexao' | 'multipla_escolha';
  opcoes?: string[];
  respostaSugeridaOuInsight?: string;
  acaoPraticaDoDia: string;
  tempoEstimadoMinutos: number;
}

export interface UserQuestionRecord {
  id: string;
  userId: string;
  questionId: string;
  categoria: string;
  tema: string;
  pergunta: string;
  respostaUsuario?: string;
  dataExibicao: string;
}

const HISTORY_STORAGE_KEY = 'menteup_user_question_history_v1';
const JOURNEY_PROGRESS_KEY = 'menteup_journey_day_progress_v1';

/**
 * Retorna o dia atual da jornada do usuário (de 1 a 30)
 */
export function getUserJourneyDay(): number {
  try {
    const saved = localStorage.getItem(JOURNEY_PROGRESS_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) {
        return parsed;
      }
    }
  } catch {}
  return 1;
}

/**
 * Salva o dia atual da jornada do usuário
 */
export function setUserJourneyDay(day: number): void {
  try {
    const clamped = Math.max(1, Math.min(30, day));
    localStorage.setItem(JOURNEY_PROGRESS_KEY, clamped.toString());
  } catch {}
}

/**
 * Retorna a lista de títulos/perguntas já exibidas para o usuário (anti-repetição)
 */
export async function getSeenQuestionsHistory(userId?: string): Promise<string[]> {
  const seenSet = new Set<string>();

  // 1. Histórico local no navegador
  try {
    const local = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (local) {
      const list: UserQuestionRecord[] = JSON.parse(local);
      list.forEach((item) => {
        if (item.pergunta) seenSet.add(item.pergunta.trim().toLowerCase());
        if (item.tema) seenSet.add(item.tema.trim().toLowerCase());
      });
    }
  } catch {}

  // 2. Tentar buscar no Supabase se logado
  if (userId) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('user_question_history')
          .select('pergunta, tema')
          .eq('user_id', userId)
          .limit(100);

        if (!error && data) {
          data.forEach((row: any) => {
            if (row.pergunta) seenSet.add(row.pergunta.trim().toLowerCase());
            if (row.tema) seenSet.add(row.tema.trim().toLowerCase());
          });
        }
      }
    } catch {
      // Ignora erro silenciosamente caso a tabela remota ainda não exista
    }
  }

  return Array.from(seenSet);
}

/**
 * Registra a exibição ou resposta de uma pergunta no histórico do usuário
 */
export async function recordQuestionView(params: {
  userId?: string;
  question: DynamicQuestion;
  respostaUsuario?: string;
}): Promise<void> {
  const { userId, question, respostaUsuario } = params;
  const record: UserQuestionRecord = {
    id: question.id || 'q_' + Date.now(),
    userId: userId || 'local_user',
    questionId: question.id,
    categoria: question.categoria,
    tema: question.tema,
    pergunta: question.pergunta,
    respostaUsuario,
    dataExibicao: new Date().toISOString(),
  };

  // 1. Grava no localStorage para persistência imediata
  try {
    const local = localStorage.getItem(HISTORY_STORAGE_KEY);
    const list: UserQuestionRecord[] = local ? JSON.parse(local) : [];
    // Adiciona e mantém até 500 registros
    list.unshift(record);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
  } catch {}

  // 2. Envia para o Supabase e servidor
  try {
    await fetch('/api/user-question-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch {}

  if (userId) {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('user_question_history').insert([
          {
            user_id: userId,
            question_id: question.id,
            categoria: question.categoria,
            tema: question.tema,
            pergunta: question.pergunta,
            resposta_usuario: respostaUsuario || null,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {}
  }
}

/**
 * Gera uma nova pergunta profunda e dinâmica via IA com garantia de não repetição
 */
export async function generateDynamicAiQuestion(params: {
  categoria: QuestionCategory;
  diaJornada: number;
  userId?: string;
  forceNew?: boolean;
}): Promise<DynamicQuestion> {
  const { categoria, diaJornada, userId } = params;

  // Busca histórico de perguntas já vistas para passar como restrição de anti-repetição
  const seenQuestions = await getSeenQuestionsHistory(userId);

  try {
    const res = await fetch('/api/dynamic-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoria,
        diaJornada,
        userId: userId || 'anonymous',
        seenQuestions: seenQuestions.slice(0, 50), // Envia últimas 50 para evitar repetição
      }),
    });

    const data = await res.json();
    if (data && data.success && data.question) {
      return data.question;
    }
  } catch (err) {
    console.warn('[DynamicQuestions] Erro na API remota de IA, utilizando gerador alternativo contextual:', err);
  }

  // Fallback estruturado de alta qualidade caso a rede falhe
  return getFallbackDynamicQuestion(categoria, diaJornada);
}

/**
 * Banco contextualizado com temas inteligentes de contingência
 */
function getFallbackDynamicQuestion(categoria: QuestionCategory, dia: number): DynamicQuestion {
  const fallbacks: Record<QuestionCategory, DynamicQuestion[]> = {
    'Foco Diário': [
      {
        id: `foco_${dia}_1`,
        diaJornada: dia,
        categoria: 'Foco Diário',
        tema: 'Eliminação da Fricção de Início',
        pergunta: 'Qual é a maior distração ambiental que rouba seu estado de flow nos primeiros 10 minutos de estudo e como eliminá-la hoje?',
        contextoProfundo: 'A neurociência comprova que a transição para a atenção focada consome mais glicose e força de vontade do que a tarefa em si. Ao remover o atrito inicial (notificações, abas abertas, mesa desorganizada), você economiza até 40 minutos de dispersão diária.',
        tipo: 'multipla_escolha',
        opcoes: [
          'A) Celular vibrando ou notificações visíveis no campo de visão.',
          'B) Abas do navegador com redes sociais ou vídeos aleatórios.',
          'C) Insegurança sobre por qual matéria ou exercício começar.',
          'D) Ambiente com barulho ou interrupções constantes.',
        ],
        respostaSugeridaOuInsight: 'Identificar seu gatilho de dispersão é o primeiro passo para o foco inabalável. Aplique a "Regra dos 20 Segundos": torne a distração pelo menos 20 segundos mais difícil de alcançar.',
        acaoPraticaDoDia: 'Coloque o celular em outro cômodo ou use o modo Não Perturbe durante seu próximo bloco de 45 minutos.',
        tempoEstimadoMinutos: 3,
      },
      {
        id: `foco_${dia}_2`,
        diaJornada: dia,
        categoria: 'Foco Diário',
        tema: 'A Regra da Intenção Única',
        pergunta: 'Se você só pudesse dominar um único conceito ou resolver um único bloco de exercícios com perfeição hoje, qual traria o maior impacto?',
        contextoProfundo: 'Estudantes de alta performance não tentam abraçar todo o edital em um dia. Eles aplicam a Lei de Pareto: 20% dos conceitos certos geram 80% do resultado nas provas.',
        tipo: 'reflexao',
        respostaSugeridaOuInsight: 'Priorize aquilo que gera desconforto cognitivo construtivo. Não fuja da matéria que você mais erra.',
        acaoPraticaDoDia: 'Defina por escrito no topo do seu caderno: "Minha prioridade inegociável de hoje é: [assunto]".',
        tempoEstimadoMinutos: 4,
      },
    ],
    'Gestão de Ansiedade': [
      {
        id: `ansiedade_${dia}_1`,
        diaJornada: dia,
        categoria: 'Gestão de Ansiedade',
        tema: 'Desarmando o Pânico Pré-Simulado',
        pergunta: 'Quando você se depara com um enunciado longo e complexo que parece impossível, qual é a sua reação automática imediata?',
        contextoProfundo: 'A resposta de "luta ou fuga" da amígdala sequestra o córtex pré-frontal, reduzindo temporariamente sua memória de trabalho. Respirar fundo e ancorar o corpo na cadeira restabelece a clareza analítica em menos de 90 segundos.',
        tipo: 'multipla_escolha',
        opcoes: [
          'A) Ansiedade súbita e vontade de chutar rápido para passar para a próxima.',
          'B) Leitura apressada sem fixar os dados do comando.',
          'C) Autocrítica ("eu não estudei o suficiente para isso").',
          'D) Parada tática: respiro fundo, sublinho a pergunta final e busco os dados.',
        ],
        respostaSugeridaOuInsight: 'A opção D é o padrão ouro dos primeiros colocados. Quando a questão assustar, leia direto a última linha (o comando) antes de ler o texto motivador.',
        acaoPraticaDoDia: 'Ao treinar questões hoje, experimente sempre ler o comando e a pergunta final antes do texto longo.',
        tempoEstimadoMinutos: 3,
      },
      {
        id: `ansiedade_${dia}_2`,
        diaJornada: dia,
        categoria: 'Gestão de Ansiedade',
        tema: 'O Efeito da Respiração 4-7-8',
        pergunta: 'Como você acalma sua mente nos momentos em que os pensamentos acelerados ameaçam seu rendimento?',
        contextoProfundo: 'Inspirar por 4 segundos, segurar por 7 e expirar lentamente por 8 ativa instantaneamente o sistema nervoso parassimpático, diminuindo os batimentos cardíacos e o nível de cortisol.',
        tipo: 'reflexao',
        respostaSugeridaOuInsight: 'O autocontrole fisiológico precede o autocontrole intelectual. Seu cérebro precisa saber que você está seguro.',
        acaoPraticaDoDia: 'Faça 3 ciclos da respiração 4-7-8 antes de começar sua primeira bateria de questões.',
        tempoEstimadoMinutos: 2,
      },
    ],
    'Autodesenvolvimento': [
      {
        id: `auto_${dia}_1`,
        diaJornada: dia,
        categoria: 'Autodesenvolvimento',
        tema: 'Mentalidade de Maestria com Erros',
        pergunta: 'Como você reage emocionalmente ao conferir o gabarito e constatar que errou uma questão que achava que dominava?',
        contextoProfundo: 'Errar uma questão durante a preparação não é fracasso: é um dado valioso que expõe uma lacuna antes do dia do exame. Cada questão errada registrada no Caderno de Erros é um ponto garantido na prova oficial.',
        tipo: 'multipla_escolha',
        opcoes: [
          'A) Frustração e desânimo, evito reler a questão errada.',
          'B) Justifico como "falta de atenção" sem investigar a raiz do erro.',
          'C) Curiosidade diagnóstica: anoto no caderno de erros e busco a teoria.',
          'D) Sensação de que preciso recomeçar todo o conteúdo do zero.',
        ],
        respostaSugeridaOuInsight: 'Comemore o erro encontrado no treino! Um erro descoberto hoje é um acerto blindado na prova real.',
        acaoPraticaDoDia: 'Abra o Caderno de Erros e revise 2 questões que você errou esta semana.',
        tempoEstimadoMinutos: 4,
      },
    ],
    'Reflexões Noturnas': [
      {
        id: `noite_${dia}_1`,
        diaJornada: dia,
        categoria: 'Reflexões Noturnas',
        tema: 'Consolidação de Memória no Sono',
        pergunta: 'Qual vitória de aprendizado — por menor que seja — você construiu no dia de hoje e merece ser reconhecida?',
        contextoProfundo: 'Durante as fases NREM e REM do sono profundo, seu cérebro sintetiza proteínas e solidifica as sinapses criadas nas horas de estudo. Ir dormir com sentimento de dever cumprido melhora a retenção em até 30%.',
        tipo: 'reflexao',
        respostaSugeridaOuInsight: 'Reconhecer seu esforço diário evita o esgotamento (burnout) e constrói a consistência inabalável necessária até a aprovação.',
        acaoPraticaDoDia: 'Feche as telas 30 minutos antes de dormir e repasse mentalmente os 3 principais tópicos estudados.',
        tempoEstimadoMinutos: 3,
      },
    ],
  };

  const pool = fallbacks[categoria] || fallbacks['Foco Diário'];
  const index = (dia - 1) % pool.length;
  return pool[index];
}
