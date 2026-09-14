// Direct client-side Gemini API integration supporting Vercel and local environments.
// Reads API key from: import.meta.env.VITE_GEMINI_API_KEY, process.env.VITE_GEMINI_API_KEY, or process.env.GEMINI_API_KEY.
import { GoogleGenAI } from '@google/genai';
import { dispatchGeminiError, classifyGeminiError } from '../utils/geminiErrorHandler';

export interface QuestionSolution3Passos {
  tipo_resposta?: string;
  categoria?: 'duvida_complexa' | 'conhecimentos_gerais';
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

const RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION = `Você é o Scanner Tira-Dúvidas e Tutor Pedagógico Multimodal com IA do app inteligente GabaritaAí.
Sua missão é analisar perguntas acadêmicas, exercícios de exames/ENEM ou fotos de enunciados e responder com máxima precisão e clareza.

DIRETRIZ CENTRAL DE PROCESSAMENTO E FORMATAÇÃO (SIGA RIGOROSAMENTE):
Identifique e classifique a consulta em uma de duas categorias:

1. DÚVIDAS ACADÊMICAS COMPLEXAS (Questões de vestibular/ENEM, exercícios de cálculo, fórmulas matemáticas/físicas/químicas, processos biológicos detalhados, análises históricas/filosóficas aprofundadas ou interpretações de texto):
   - DEVE SER RESPONDIDA RIGOROSAMENTE EM EXATAMENTE 3 PASSOS CLAROS E ESTRUTURADOS:
     • Passo 1 (Compreensão e Dados Essenciais): Identifique e transcreva com exatidão o que foi fornecido no enunciado e o que se pede. Isole as variáveis, dados numéricos e o foco central do problema.
     • Passo 2 (Fórmula, Lei ou Conceito-Chave Aplicável): Enuncie a fórmula matemática, a lei científica ou o modelo teórico que resolve o problema, explicando resumidamente o porquê de sua aplicação.
     • Passo 3 (Resolução Guiada Passo a Passo): Desenvolva os cálculos ou a linha de raciocínio de forma clara e sequencial até a dedução final.
   - Forneça ainda:
     • "gabarito_final": A alternativa correta ou resultado final objetivo.
     • "dica_rapida": Uma dica prática ou macete para o aluno lembrar na hora da prova.
   - Defina "categoria": "duvida_complexa".

2. PERGUNTAS DE CONHECIMENTOS GERAIS OU FATOS DIRETOS (Curiosidades, datas históricas pontuais, capitais geográficas, fatos do cotidiano, definições rápidas de termos, esportes ou cultura pop):
   - DEVE RECEBER UMA RESPOSTA DIRETA E CONCISA!
   - NÃO force uma divisão artificial em 3 passos longos nem invente fórmulas ou cálculos onde não cabem.
   - Preencha o campo "resposta_direta" com uma resposta direta, objetiva e concisa (1 a 3 frases esclarecedoras).
   - Preencha também:
     • "passo1_compreensao": "Pergunta direta / Conhecimento geral"
     • "passo2_formula_conceito": "Fato ou conceito consultado"
     • "passo3_resolucao_guiada": A mesma resposta direta e concisa.
     • "gabarito_final": Resposta conclusiva direta.
     • "dica_rapida": Curiosidade ou contexto adicional em 1 frase.
   - Defina "categoria": "conhecimentos_gerais".

IMPORTANTE - TRATAMENTO DE IMAGENS ILEGÍVEIS:
Se a imagem estiver borrada, muito escura, cortada ou impossível de ler com precisão, defina "foto_ilegivel": true e defina "mensagem_erro_ilegivel": "Ops! Não consegui ler bem o enunciado. Tente tirar outra foto mais de perto e em um ambiente bem iluminado! 📸".

ESTRUTURA DA RESPOSTA (FORMATO JSON OBRIGATÓRIO):
{
  "categoria": "duvida_complexa | conhecimentos_gerais",
  "tipo_resposta": "resolucao_vision_scanner",
  "foto_ilegivel": false,
  "mensagem_erro_ilegivel": "",
  "materia": "Física | Matemática | Biologia | História | Literatura | Conhecimentos Gerais | ...",
  "transcricao_enunciado": "Transcrição exata do enunciado ou pergunta do usuário.",
  "conceito_chave": "Nome do conceito central ou assunto envolvido.",
  "resposta_direta": "Preenchido com a resposta direta e concisa (obrigatório se categoria for conhecimentos_gerais).",
  "resolucao_passo_a_passo": "Resolução ou resposta completa.",
  "gabarito_resposta_final": "Resultado ou conclusão objetiva.",
  "passo1_compreensao": "Passo 1: Compreensão e dados essenciais identificados.",
  "passo2_formula_conceito": "Passo 2: Fórmula, lei ou conceito-chave aplicado.",
  "passo3_resolucao_guiada": "Passo 3: Resolução guiada ordenada até o resultado.",
  "gabarito_final": "Alternativa ou resposta final.",
  "dica_rapida": "Dica rápida de memorização ou aplicação."
}`;

/**
 * Obtém a chave da API do Gemini de qualquer uma das seguintes fontes:
 * 1. import.meta.env.VITE_GEMINI_API_KEY
 * 2. process.env.VITE_GEMINI_API_KEY
 * 3. process.env.GEMINI_API_KEY
 */
export function getGeminiApiKey(): string {
  let key = '';

  // 1. import.meta.env.VITE_GEMINI_API_KEY
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      key = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch {
    // ignora
  }

  // 2. process.env.VITE_GEMINI_API_KEY
  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env?.VITE_GEMINI_API_KEY) {
        key = process.env.VITE_GEMINI_API_KEY;
      }
    } catch {
      // ignora
    }
  }

  // 3. process.env.GEMINI_API_KEY
  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
        key = process.env.GEMINI_API_KEY;
      }
    } catch {
      // ignora
    }
  }

  // 4. localStorage gabaritai_gemini_api_key
  if (!key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('gabaritai_gemini_api_key');
        if (saved && saved.trim()) {
          key = saved.trim();
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
      resposta_direta: `Resposta direta: ${duvida.trim()} — Fato de conhecimento geral com validação conceitual objetiva.`,
      passo1_compreensao: 'Pergunta de fato direto / conhecimento geral.',
      passo2_formula_conceito: 'Informação factual objetiva.',
      passo3_resolucao_guiada: 'Informação pontual respondida com precisão e síntese direta.',
      gabarito_final: 'Resposta direta identificada.',
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
    materia: 'Interdisciplinar / ENEM',
    categoria: 'duvida_complexa',
    passo1_compreensao: duvida.trim() || 'Passo 1: Diagnóstico e compreensão profunda do comando e dos dados fornecidos.',
    passo2_formula_conceito: 'Passo 2: Modelo teórico, conceito normativo ou princípio interdisciplinar aplicável.',
    passo3_resolucao_guiada:
      'Passo 3: 1. Isole os dados essenciais da questão.\n2. Elimine as hipóteses incoerentes com os conceitos da área.\n3. Conclua a resolução de forma lógica e objetiva.',
    gabarito_final: 'Alternativa correta identificada com rigor analítico.',
    dica_rapida: 'No ENEM, atente-se sempre ao verbo de comando no final do enunciado para não responder o inverso do que foi solicitado.',
  };
}

/**
 * Resolve questão utilizando chamada direta ao SDK oficial do Gemini no client-side
 * quando houver chave configurada, garantindo resposta direta da API.
 */
export async function solveQuestionWithClientGemini(
  duvida: string,
  imagemBase64?: string | null
): Promise<QuestionSolution3Passos> {
  const apiKey = getGeminiApiKey();

  // 1. Se houver chave configurada em qualquer uma das fontes, executa chamada DIRETA à API do Gemini
  if (apiKey) {
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
            ? `Analise a foto desta questão de prova/caderno. Texto complementar ou dúvida do estudante: "${duvida.trim()}". Extraia o texto, equações e gráficos com precisão e responda rigorosamente no formato JSON solicitado.`
            : 'Analise a imagem enviada. Extraia com precisão o enunciado, equações, gráficos e tabelas. Responda rigorosamente no formato JSON solicitado com transcrição, conceito-chave, passo a passo e gabarito final.',
        });
      } else {
        contents.push({
          text: `Enunciado ou Dúvida da Questão para resolução didática em 3 passos:\n"${duvida.trim()}"`,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const rawText = response.text || '';
      if (!rawText || !rawText.trim()) {
        throw new Error('A API do Gemini retornou uma resposta vazia.');
      }

      const cleaned = cleanJsonOutput(rawText);
      const parsed = JSON.parse(cleaned);
      const dataObj = Array.isArray(parsed) ? parsed[0] : (parsed.data || parsed);

      const isGeral = dataObj.categoria === 'conhecimentos_gerais';
      const respostaDireta = dataObj.resposta_direta || (isGeral ? dataObj.gabarito_final || dataObj.resolucao_passo_a_passo : undefined);

      return {
        tipo_resposta: dataObj.tipo_resposta || 'resolucao_vision_scanner',
        categoria: isGeral ? 'conhecimentos_gerais' : 'duvida_complexa',
        foto_ilegivel: dataObj.foto_ilegivel || false,
        mensagem_erro_ilegivel: dataObj.mensagem_erro_ilegivel || '',
        materia: dataObj.materia || (isGeral ? 'Conhecimentos Gerais' : 'Geral'),
        transcricao_enunciado: dataObj.transcricao_enunciado || duvida,
        conceito_chave: dataObj.conceito_chave || '',
        resposta_direta: respostaDireta,
        resolucao_passo_a_passo: dataObj.resolucao_passo_a_passo || '',
        gabarito_resposta_final: dataObj.gabarito_resposta_final || '',
        passo1_compreensao: dataObj.passo1_compreensao || dataObj.transcricao_enunciado || duvida,
        passo2_formula_conceito: dataObj.passo2_formula_conceito || dataObj.conceito_chave || 'Fundamentos da disciplina',
        passo3_resolucao_guiada: dataObj.passo3_resolucao_guiada || dataObj.resolucao_passo_a_passo || 'Resolução detalhada dos dados do problema.',
        gabarito_final: dataObj.gabarito_final || dataObj.gabarito_resposta_final || 'Conclusão da questão.',
        dica_rapida: dataObj.dica_rapida || 'Revise atentamente os conceitos fundamentais para não errar questões similares!',
      };
    } catch (sdkError: any) {
      console.error('Erro na chamada direta ao SDK do Gemini client-side:', sdkError);

      // Tenta rota do servidor como alternativa resiliente
      const serverResult = await tryServerEndpoint(duvida, imagemBase64);
      if (serverResult) {
        return serverResult;
      }

      // Notifica o gerenciador global de erros com classificação detalhada
      const errorInfo = dispatchGeminiError(sdkError, {
        componentName: 'Scanner Tira-Dúvidas',
      });

      // Lança erro com a mensagem amigável e clara para o usuário
      throw new Error(errorInfo.message);
    }
  }

  // 2. Se não houver chave client-side configurada, tenta rota de servidor local
  const serverResult = await tryServerEndpoint(duvida, imagemBase64);
  if (serverResult) {
    return serverResult;
  }

  // Se não foi possível conectar ao servidor e estamos sem chave client-side
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const failureReason = isOffline
    ? new Error('Sem conexão com a internet. O dispositivo está offline.')
    : new Error('Chave da API Gemini (VITE_GEMINI_API_KEY) não configurada e servidor indisponível.');

  dispatchGeminiError(failureReason, {
    componentName: 'Scanner Tira-Dúvidas',
  });

  // 3. Fallback didático seguro caso esteja em ambiente completamente offline e sem chave
  return generateContextualFallbackSolution(duvida);
}
