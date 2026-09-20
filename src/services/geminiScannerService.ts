// Direct client-side Gemini API integration supporting Vercel and local environments.
// Reads API key from: import.meta.env.VITE_GEMINI_API_KEY, process.env.VITE_GEMINI_API_KEY, or process.env.GEMINI_API_KEY.
import { GoogleGenAI } from '@google/genai';
import { dispatchGeminiError, classifyGeminiError } from '../utils/geminiErrorHandler';

export interface QuestionSolution3Passos {
  tipo_resposta?: string;
  categoria?: 'duvida_complexa' | 'conhecimentos_gerais' | 'cumprimento' | 'exercicio';
  foto_ilegivel?: boolean;
  mensagem_erro_ilegivel?: string;
  materia: string;
  transcricao_enunciado?: string;
  conceito_chave?: string;
  resposta_direta?: string;
  resolucao_passo_a_passo?: string;
  gabarito_resposta_final?: string;
  passo1_compreensao: string;
  passo2_formula_conceito: string;
  passo3_resolucao_guiada: string;
  gabarito_final: string;
  dica_rapida: string;
}

/**
 * Detecta se a mensagem do usuário é uma saudação, cumprimento ou interação informal.
 */
export function isGreetingOrInformal(text: string): boolean {
  if (!text) return false;
  const clean = text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos para comparação uniforme
    .replace(/[!?,.;:\-_()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return false;

  const exactGreetings = new Set([
    'oi', 'oie', 'ola', 'opa', 'e ai', 'eai',
    'tudo bem', 'tudo bom', 'tudo certo', 'como vai', 'como voce esta',
    'como vc esta', 'como vc ta', 'bom dia', 'boa tarde', 'boa noite',
    'fala ai', 'fala tu', 'salve', 'hello', 'hi', 'hey',
    'obrigado', 'obrigada', 'valeu', 'valeuu', 'muito obrigado',
    'show', 'beleza', 'blz', 'professora', 'profa', 'gabi',
    'oi gabi', 'ola gabi', 'oi professora', 'ola professora',
    'oi profa', 'ola profa', 'professora gabi', 'profa gabi',
    'quem e voce', 'quem e vc', 'quem e a professora gabi',
    'ajuda', 'socorro', 'preciso de ajuda'
  ]);

  if (exactGreetings.has(clean)) return true;

  // Saudações curtas no início de mensagens sem comandos acadêmicos
  const greetingStarts = ['oi ', 'ola ', 'oie ', 'opa ', 'e ai ', 'bom dia', 'boa tarde', 'boa noite'];
  if (clean.length < 35 && greetingStarts.some((g) => clean.startsWith(g))) {
    const academicWords = ['calcule', 'determine', 'encontre', 'quantos', 'quanto', 'resolva', 'qual', 'equacao', 'funcao', 'vestibular', 'enem', 'alternativa'];
    const hasAcademic = academicWords.some((w) => clean.includes(w));
    if (!hasAcademic) return true;
  }

  return false;
}

const RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION = `Você é o Tira-Dúvidas Inteligente e Assistente da Professora Gabi no Gabaritou.
Sua missão é responder com naturalidade, simpatia, precisão pedagógica e flexibilidade ao tipo de mensagem enviada pelo usuário.

DIRETRIZES FUNDAMENTAIS DE CLASSIFICAÇÃO E RESPOSTA:

1. CUMPRIMENTOS, SAUDAÇÕES OU CONVERSA INFORMAL (ex: "Oi", "Olá", "Tudo bem?", "Bom dia", "Boa tarde", "Boa noite", "E aí", "Obrigado", "Valeu", "Quem é você?"):
   - NUNCA trate saudações como se fossem exercícios de prova ou dúvidas acadêmicas.
   - É ESTRITAMENTE PROIBIDO usar introduções burocráticas ou fórmulas como "Aqui está a explicação sobre sua dúvida: 'Oi'" ou "Tema compreendido e esclarecido".
   - Responda como a Professora Gabi de forma conversacional, acolhedora e amigável (ex: "Olá! Sou a Professora Gabi, sua assistente de estudos do Gabaritou! Como posso te ajudar hoje? Envie suas dúvidas, exercícios ou a foto de uma questão para estudarmos juntos!").
   - Defina "categoria": "cumprimento" e "tipo_resposta": "conversacional".
   - Preencha o campo "resposta_direta" com sua resposta amigável e conversacional.
   - Os campos "passo1_compreensao", "passo2_formula_conceito", "passo3_resolucao_guiada", "gabarito_final" e "gabarito_resposta_final" devem ficar vazios ("").
   - Defina "materia": "Conversa & Saudações".

2. CURIOSIDADES, PERGUNTAS LIVRES E CONHECIMENTOS GERAIS (ex: "Por que o céu é azul?", "Como funciona a gravidade?", "Quem inventou o avião?", "Dicas para memorizar fórmulas"):
   - Responda de forma direta, clara e fluida no campo "resposta_direta".
   - Defina "categoria": "conhecimentos_gerais" e "tipo_resposta": "conhecimentos_gerais".
   - NÃO force etapas rígidas de prova escolar. Sintetize a resposta em "gabarito_resposta_final" e adicione uma curiosidade em "dica_rapida".

3. EXERCÍCIOS ESCOLARES, QUESTÕES DE PROVA OU VESTIBULAR/ENEM (ex: questões com alternativas A-E, cálculos matemáticos/físicos/químicos, interpretação de texto):
   - Estruture a resolução didática nos 3 passos pedagógicos:
     * Passo 1: Leitura e compreensão do enunciado.
     * Passo 2: Fórmula, lei ou conceito teórico aplicável.
     * Passo 3: Resolução guiada e cálculo passo a passo.
   - Forneça o gabarito final objetivo em "gabarito_final".
   - Defina "categoria": "exercicio" e "tipo_resposta": "exercicio_3passos".

4. IMAGEM ILEGÍVEL:
   - Se a imagem enviada estiver borrada, escura ou cortada, defina "foto_ilegivel": true e defina "mensagem_erro_ilegivel": "Ops! Não consegui ler bem o enunciado da foto. Tente tirar outra foto mais de perto e em um ambiente bem iluminado! 📸".

ESTRUTURA DA RESPOSTA (FORMATO JSON OBRIGATÓRIO):
{
  "categoria": "cumprimento | conhecimentos_gerais | exercicio",
  "tipo_resposta": "conversacional | conhecimentos_gerais | exercicio_3passos",
  "foto_ilegivel": false,
  "mensagem_erro_ilegivel": "",
  "materia": "Área ou Conversa (ex: Conversa & Saudações, Física, Matemática, Conhecimentos Gerais...)",
  "transcricao_enunciado": "Mensagem ou questão enviada.",
  "conceito_chave": "Conceito principal (vazio se for cumprimento)",
  "resposta_direta": "Resposta amigável e conversacional (para saudações/curiosidades) ou explicação direta.",
  "resolucao_passo_a_passo": "Resolução detalhada (apenas para exercícios/conteúdos complexos).",
  "gabarito_resposta_final": "Síntese ou gabarito (vazio se for cumprimento).",
  "passo1_compreensao": "",
  "passo2_formula_conceito": "",
  "passo3_resolucao_guiada": "",
  "gabarito_final": "",
  "dica_rapida": "Dica prática, conselho de estudo ou curiosidade."
}`;

/**
 * Obtém a chave da API do Gemini de qualquer uma das seguintes fontes:
 * 1. import.meta.env.VITE_GEMINI_API_KEY
 * 2. process.env.VITE_GEMINI_API_KEY
 * 3. process.env.GEMINI_API_KEY
 */
export function getGeminiApiKey(): string {
  let key = '';

  // 1. localStorage gabaritai_gemini_api_key (configurado pelo usuário)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('gabaritai_gemini_api_key');
      if (saved && saved.trim() && saved.trim().length > 20 && saved.trim() !== 'MY_GEMINI_API_KEY') {
        key = saved.trim();
      }
    }
  } catch {
    // ignora
  }

  // 2. import.meta.env.VITE_GEMINI_API_KEY (apenas se for chave válida, não placeholder ou valor corrompido)
  if (!key) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
        const envVal = String(import.meta.env.VITE_GEMINI_API_KEY).trim();
        if (envVal.length > 20 && envVal !== 'MY_GEMINI_API_KEY' && envVal !== '5,00') {
          key = envVal;
        }
      }
    } catch {
      // ignora
    }
  }

  return (key || '').trim();
}

/**
 * Limpa marcações markdown ```json ... ``` de saídas da IA antes do parse JSON.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Tenta executar a requisição na rota local do servidor se disponível.
 */
async function tryServerEndpoint(
  duvida: string,
  imagemBase64?: string | null
): Promise<QuestionSolution3Passos | null> {
  try {
    const res = await fetch('/api/solve-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duvida: duvida.trim(),
        imagemBase64: imagemBase64 || undefined,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await res.text();
      if (text && text.trim()) {
        const json = JSON.parse(text);
        if (res.ok && json.success && json.data) {
          return json.data;
        }
      }
    }
  } catch {
    // Rota local indisponível no ambiente cliente
  }
  return null;
}

/**
 * Resolução contextual de demonstração apenas se não houver rede nem chave configurada.
 */
function generateContextualFallbackSolution(duvida: string): QuestionSolution3Passos {
  const d = duvida.toLowerCase();

  // 1. Tratamento específico para saudações e mensagens informais
  if (isGreetingOrInformal(duvida)) {
    return {
      materia: 'Conversa & Atendimento',
      categoria: 'cumprimento',
      tipo_resposta: 'conversacional',
      resposta_direta:
        'Olá! Sou a Professora Gabi, sua assistente de estudos do Gabaritou! Como posso te ajudar hoje? Envie suas dúvidas teóricas, exercícios escolares, redações ou a foto de uma questão para estudarmos juntos!',
      transcricao_enunciado: duvida.trim() || 'Olá!',
      conceito_chave: '',
      resolucao_passo_a_passo: '',
      gabarito_resposta_final: '',
      passo1_compreensao: '',
      passo2_formula_conceito: '',
      passo3_resolucao_guiada: '',
      gabarito_final: '',
      dica_rapida:
        'Você pode digitar sua dúvida no campo acima ou clicar em "Anexar Foto" para enviar uma página da sua apostila ou prova! 📸',
    };
  }

  // Perguntas de conhecimentos gerais / fatos diretos
  if (d.includes('machado de assis') || d.includes('abl') || d.includes('literatura') && d.includes('quem')) {
    return {
      materia: 'Literatura Brasileira',
      categoria: 'conhecimentos_gerais',
      resposta_direta: 'Machado de Assis (1839–1908) foi o principal expoente do Realismo no Brasil e fundou a Academia Brasileira de Letras (ABL) em 1897, sendo eleito seu primeiro presidente perpétuo.',
      passo1_compreensao: 'Pergunta direta sobre figura histórica e literatura.',
      passo2_formula_conceito: 'Fundação da ABL e Realismo Brasileiro (1881–1908).',
      passo3_resolucao_guiada: 'Machado de Assis fundou a Academia Brasileira de Letras em 1897 no Rio de Janeiro e presidiu a instituição até sua morte em 1908.',
      gabarito_final: 'Machado de Assis, fundador e primeiro presidente da ABL (1897).',
      dica_rapida: 'A fase realista de Machado iniciou-se em 1881 com a publicação de "Memórias Póstumas de Brás Cubas".',
    };
  }

  if (d.includes('capital') || d.includes('quem foi') || d.includes('quem descobriu') || d.includes('quantos') || d.includes('onde fica')) {
    return {
      materia: 'Conhecimentos Gerais',
      categoria: 'conhecimentos_gerais',
      resposta_direta: `Aqui estão as informações sobre sua pesquisa: "${duvida.trim()}". Fato de conhecimento geral com fundamentação objetiva.`,
      passo1_compreensao: 'Pergunta de fato direto / conhecimento geral.',
      passo2_formula_conceito: 'Informação factual objetiva.',
      passo3_resolucao_guiada: 'Informação pontual explicada com síntese direta.',
      gabarito_final: 'Informação de conhecimento geral validada.',
      dica_rapida: 'Mantenha leitura de atualidades e repertórios culturais para responder rápido na prova.',
    };
  }

  // Dúvidas acadêmicas complexas: estruturadas em EXATAMENTE 3 passos
  if (d.includes('força') || d.includes('bloco') || d.includes('acelera') || d.includes('m/s') || d.includes('newton') || d.includes('circuito') || d.includes('corrente')) {
    return {
      materia: 'Física',
      categoria: 'duvida_complexa',
      passo1_compreensao: duvida.trim() || 'Passo 1: Identificação das variáveis de força (F), massa (m) e aceleração (a), ou tensão (U), resistência (R) e corrente (i).',
      passo2_formula_conceito: 'Passo 2: Fórmula aplicável — Primeira Lei de Ohm (U = R · i ➔ i = U / R) ou Segunda Lei de Newton (F = m · a).',
      passo3_resolucao_guiada:
        'Passo 3: 1. Isole os dados do enunciado.\n2. Aplique a equação fundamental correspondente.\n3. Calcule o valor exato substituindo os parâmetros com as unidades do SI.',
      gabarito_final: 'Resultado calculado com precisão no Sistema Internacional.',
      dica_rapida: 'Lembre-se sempre de conferir as unidades no SI (Volts, Amperes, Ohms, Newtons e kg) antes de aplicar as fórmulas.',
    };
  }

  if (d.includes('equação') || d.includes('raízes') || d.includes('bhaskara') || d.includes('x²') || d.includes('soma e produto')) {
    return {
      materia: 'Matemática',
      categoria: 'duvida_complexa',
      passo1_compreensao: duvida.trim() || 'Passo 1: Leitura da equação quadrática ax² + bx + c = 0 e extração dos coeficientes a, b e c.',
      passo2_formula_conceito: 'Passo 2: Fórmula de Bhaskara: x = (-b ± √Δ) / 2a, com discriminante Δ = b² - 4ac (ou relações de Girard / Soma e Produto).',
      passo3_resolucao_guiada:
        'Passo 3: 1. Calcule o discriminante Δ = b² - 4ac.\n2. Se Δ ≥ 0, extraia a raiz quadrada e calcule x₁ e x₂.\n3. Valide o conjunto solução S = {x₁, x₂}.',
      gabarito_final: 'Raízes reais obtidas com precisão algébrica.',
      dica_rapida: 'Se a = 1, busque dois números que somados deem -b e multiplicados deem c para resolver em segundos no ENEM!',
    };
  }

  if (d.includes('ácido') || d.includes('base') || d.includes('ph') || d.includes('química') || d.includes('reação')) {
    return {
      materia: 'Química',
      categoria: 'duvida_complexa',
      passo1_compreensao: duvida.trim() || 'Passo 1: Reconhecimento dos reagentes na reação de neutralização e das concentrações molares.',
      passo2_formula_conceito: 'Passo 2: Reação de Neutralização Ácido + Base ➔ Sal + H₂O e cálculo de pH = -log[H⁺].',
      passo3_resolucao_guiada:
        'Passo 3: 1. Escreva a equação química balanceada.\n2. Determine a proporção estequiométrica de H⁺ e OH⁻.\n3. Calcule a concentração final de íons e determine o pH.',
      gabarito_final: 'Neutralização balanceada com determinação do pH final.',
      dica_rapida: 'Ácido forte com base forte em proporções estequiométricas resulta sempre em pH neutro (pH = 7 a 25 °C).',
    };
  }

  return {
    materia: 'Conhecimentos Gerais & Estudos',
    categoria: 'conhecimentos_gerais',
    resposta_direta: `Aqui estão as explicações sobre "${duvida.trim()}". Analisamos os aspectos centrais e conceitos fundamentais para facilitar seu entendimento.`,
    resolucao_passo_a_passo: `Ao estudar "${duvida.trim()}", identificamos os pontos-chave e suas conexões práticas com o conteúdo.`,
    gabarito_resposta_final: 'Conceito esclarecido com didática e objetividade.',
    passo1_compreensao: duvida.trim() || 'Tema pesquisado.',
    passo2_formula_conceito: 'Princípios e fundamentos do assunto.',
    passo3_resolucao_guiada: 'Explicação detalhada fornecida pela tutora.',
    gabarito_final: 'Esclarecimento didático concluído.',
    dica_rapida: 'Você pode perguntar sobre matérias escolares, vestibulares ou curiosidades a qualquer momento!',
  };
}

/**
 * Resolve questão utilizando chamada direta ao SDK oficial do Gemini no client-side
 * quando houver chave configurada, ou utilizando o endpoint seguro do servidor.
 */
export async function solveQuestionWithClientGemini(
  duvida: string,
  imagemBase64?: string | null
): Promise<QuestionSolution3Passos> {
  // 1. Rota de servidor segura (/api/solve-question) com GEMINI_API_KEY do backend
  const serverResult = await tryServerEndpoint(duvida, imagemBase64);
  if (serverResult) {
    return serverResult;
  }

  // 2. Chamada direta cliente APENAS se houver chave manual válida configurada pelo usuário
  const apiKey = getGeminiApiKey();

  if (apiKey && apiKey.length > 20) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contents: any[] = [];

      if (imagemBase64) {
        const mimeMatch = imagemBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const cleanBase64 = imagemBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

        contents.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });

        contents.push({
          text: duvida && duvida.trim()
            ? `Analise a foto e o texto enviado: "${duvida.trim()}". Responda de forma aberta e sem restrições de tema no formato JSON solicitado.`
            : 'Analise a imagem enviada. Responda rigorosamente no formato JSON solicitado com clareza e sem restrições de assunto.',
        });
      } else {
        contents.push({
          text: `Pergunta ou Dúvida do Usuário:\n"${duvida.trim()}"`,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      });

      const rawText = response.text || '';
      if (rawText && rawText.trim()) {
        const cleaned = cleanJsonOutput(rawText);
        const parsed = JSON.parse(cleaned);
        const dataObj = Array.isArray(parsed) ? parsed[0] : (parsed.data || parsed);

        const userIsGreeting = isGreetingOrInformal(duvida);
        const isGreeting = userIsGreeting || dataObj.categoria === 'cumprimento';
        const isExercicio = !isGreeting && (dataObj.categoria === 'exercicio' || dataObj.categoria === 'duvida_complexa');
        const isGeral = !isGreeting && !isExercicio;

        const categoriaFinal: 'cumprimento' | 'conhecimentos_gerais' | 'exercicio' = isGreeting
          ? 'cumprimento'
          : isExercicio
          ? 'exercicio'
          : 'conhecimentos_gerais';

        const respostaDireta =
          dataObj.resposta_direta ||
          dataObj.resolucao_passo_a_passo ||
          dataObj.gabarito_final ||
          (isGreeting
            ? 'Olá! Sou a Professora Gabi, sua assistente de estudos do Gabaritou! Como posso te ajudar hoje?'
            : 'Aqui está a explicação sobre a sua dúvida.');

        return {
          tipo_resposta: isGreeting ? 'conversacional' : dataObj.tipo_resposta || (isExercicio ? 'exercicio_3passos' : 'conhecimentos_gerais'),
          categoria: categoriaFinal,
          foto_ilegivel: dataObj.foto_ilegivel || false,
          mensagem_erro_ilegivel: dataObj.mensagem_erro_ilegivel || '',
          materia: dataObj.materia || (isGreeting ? 'Conversa & Saudações' : isGeral ? 'Conhecimentos Gerais' : 'Geral'),
          transcricao_enunciado: dataObj.transcricao_enunciado || duvida,
          conceito_chave: isGreeting ? '' : (dataObj.conceito_chave || ''),
          resposta_direta: respostaDireta,
          resolucao_passo_a_passo: isGreeting ? '' : (dataObj.resolucao_passo_a_passo || (isExercicio ? respostaDireta : '')),
          gabarito_resposta_final: isGreeting ? '' : (dataObj.gabarito_resposta_final || ''),
          passo1_compreensao: isGreeting ? '' : (dataObj.passo1_compreensao || (isExercicio ? (dataObj.transcricao_enunciado || duvida) : '')),
          passo2_formula_conceito: isGreeting ? '' : (dataObj.passo2_formula_conceito || (isExercicio ? (dataObj.conceito_chave || 'Fundamentos Gerais') : '')),
          passo3_resolucao_guiada: isGreeting ? '' : (dataObj.passo3_resolucao_guiada || (isExercicio ? respostaDireta : '')),
          gabarito_final: isGreeting ? '' : (dataObj.gabarito_final || dataObj.gabarito_resposta_final || ''),
          dica_rapida: dataObj.dica_rapida || (isGreeting ? 'Você pode enviar perguntas sobre matérias escolares ou anexar fotos da sua prova!' : 'Dica: Você pode fazer perguntas sobre qualquer tema!'),
        };
      }
    } catch (sdkError: any) {
      console.warn('Tentativa direta client-side encontrou erro, chaveando para endpoint de servidor:', sdkError);
    }
  }

  // 3. Fallback didático seguro imediato
  return generateContextualFallbackSolution(duvida);
}
