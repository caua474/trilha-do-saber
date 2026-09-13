// Direct client-side Gemini API integration supporting Vercel and local environments.
// Reads API key from: import.meta.env.VITE_GEMINI_API_KEY, process.env.VITE_GEMINI_API_KEY, or process.env.GEMINI_API_KEY.
import { GoogleGenAI } from '@google/genai';

export interface QuestionSolution3Passos {
  tipo_resposta?: string;
  foto_ilegivel?: boolean;
  mensagem_erro_ilegivel?: string;
  materia: string;
  transcricao_enunciado?: string;
  conceito_chave?: string;
  resolucao_passo_a_passo?: string;
  gabarito_resposta_final?: string;
  passo1_compreensao: string;
  passo2_formula_conceito: string;
  passo3_resolucao_guiada: string;
  gabarito_final: string;
  dica_rapida: string;
}

const RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION = `Você é o Scanner Tira-Dúvidas e Tutor de IA Multimodal/Vision do GabaritaAí.
Sua missão é extrair e ler com precisão texto, equações matemáticas, gráficos e tabelas presentes na imagem ou enunciado fornecido (seja texto impresso ou manuscrito legível).

IMPORTANTE - TRATAMENTO DE IMAGENS ILEGÍVEIS:
Se a imagem estiver borrada, muito escura, cortada ou impossível de ler com precisão, defina "foto_ilegivel": true e defina "mensagem_erro_ilegivel": "Ops! Não consegui ler bem o enunciado. Tente tirar outra foto mais de perto e em um ambiente bem iluminado! 📸".

ESTRUTURA DA RESPOSTA (FORMATO JSON OBRIGATÓRIO):
{
  "tipo_resposta": "resolucao_vision_scanner",
  "foto_ilegivel": false,
  "mensagem_erro_ilegivel": "",
  "materia": "Física",
  "transcricao_enunciado": "Transcrição exata e completa do enunciado e dados identificados na imagem ou texto.",
  "conceito_chave": "Termodinâmica • Primeira Lei da Termodinâmica",
  "resolucao_passo_a_passo": "1. Identificação das variáveis: Q = 500J e W = 200J.\\n2. Aplicação da fórmula ΔU = Q - W.\\n3. Cálculo: ΔU = 500 - 200 = 300J.",
  "gabarito_resposta_final": "300 Joules (Alternativa B)",
  "passo1_compreensao": "Transcrição e leitura do enunciado da questão.",
  "passo2_formula_conceito": "Fórmula ou conceito principal envolvido.",
  "passo3_resolucao_guiada": "Explicação passo a passo da resolução.",
  "gabarito_final": "Alternativa B (300 J)",
  "dica_rapida": "Dica de ouro para lembrar na hora do exame."
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

  if (d.includes('força') || d.includes('bloco') || d.includes('acelera') || d.includes('m/s') || d.includes('newton')) {
    return {
      materia: 'Física',
      passo1_compreensao: duvida.trim() || 'Cálculo de aceleração a partir da Segunda Lei de Newton (F = m · a).',
      passo2_formula_conceito: 'Segunda Lei de Newton: F_resultante = m · a ➔ a = F / m.',
      passo3_resolucao_guiada:
        '1. Isole os dados fornecidos no enunciado (massa e força).\n2. Aplique a fórmula fundamental da dinâmica: aceleração = Força / Massa.\n3. Se F = 20 N e m = 5 kg, temos: a = 20 / 5 = 4 m/s².',
      gabarito_final: 'a = 4 m/s²',
      dica_rapida: 'Lembre-se sempre de converter a massa para quilogramas (kg) e a força para Newtons (N) antes de calcular!',
    };
  }

  if (d.includes('equação') || d.includes('raízes') || d.includes('bhaskara') || d.includes('x²') || d.includes('soma e produto')) {
    return {
      materia: 'Matemática',
      passo1_compreensao: duvida.trim() || 'Resolução de equação quadrática ax² + bx + c = 0.',
      passo2_formula_conceito: 'Soma e Produto: S = -b/a e P = c/a, ou Fórmula de Bhaskara: x = (-b ± √Δ) / 2a.',
      passo3_resolucao_guiada:
        '1. Identifique os coeficientes a, b e c da equação.\n2. Calcule o discriminante: Δ = b² - 4ac.\n3. Encontre as raízes reais aplicando a fórmula de Bhaskara ou buscando dois números cuja soma seja -b e o produto seja c.',
      gabarito_final: 'Raízes encontradas com precisão algébrica.',
      dica_rapida: 'Se a = 1, pense direto em dois números que somados dão -b e multiplicados dão c para ganhar tempo no ENEM!',
    };
  }

  if (d.includes('ácido') || d.includes('base') || d.includes('ph') || d.includes('química') || d.includes('reação')) {
    return {
      materia: 'Química',
      passo1_compreensao: duvida.trim() || 'Reação ácido-base e cálculo estequiométrico.',
      passo2_formula_conceito: 'Reação de Neutralização: Ácido + Base ➔ Sal + Água. pH = -log[H+].',
      passo3_resolucao_guiada:
        '1. Escreva e balanceie a equação química de neutralização.\n2. Verifique a proporção molar entre os íons H⁺ liberados pelo ácido e os íons OH⁻ fornecidos pela base.\n3. Calcule o pH resultante com base na concentração de íons remanescentes.',
      gabarito_final: 'Neutralização estequiométrica completa.',
      dica_rapida: 'Ácido forte com base forte em proporções estequiométricas resulta sempre em solução aquosa neutra (pH = 7 a 25 °C).',
    };
  }

  return {
    materia: 'Interdisciplinar / ENEM',
    passo1_compreensao: duvida.trim() || 'Análise atenta do enunciado e identificação do comando da questão.',
    passo2_formula_conceito: 'Interpretação textual com levantamento de dados, hipóteses e fundamentos teóricos.',
    passo3_resolucao_guiada:
      '1. Sublinhe as palavras-chave e a pergunta exata que o examinador está fazendo.\n2. Elimine distratores absurdos ou que extrapolam o texto de apoio.\n3. Associe os dados fornecidos às leis e teorias científicas correspondentes.',
    gabarito_final: 'Alternativa correta identificada por coerência conceitual.',
    dica_rapida: 'No ENEM, cerca de 70% dos erros acontecem por desatenção ao comando final da questão (ex: "é incorreto afirmar", "exceto").',
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

      return {
        tipo_resposta: dataObj.tipo_resposta || 'resolucao_vision_scanner',
        foto_ilegivel: dataObj.foto_ilegivel || false,
        mensagem_erro_ilegivel: dataObj.mensagem_erro_ilegivel || '',
        materia: dataObj.materia || 'Geral',
        transcricao_enunciado: dataObj.transcricao_enunciado || duvida,
        conceito_chave: dataObj.conceito_chave || '',
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

      // Tenta rota do servidor como alternativa
      const serverResult = await tryServerEndpoint(duvida, imagemBase64);
      if (serverResult) {
        return serverResult;
      }

      // Se a chamada à API falhar, lança erro com mensagem amigável
      throw new Error(
        sdkError?.message?.includes('API_KEY_INVALID')
          ? 'Chave de API do Gemini inválida. Verifique sua chave nas configurações.'
          : 'Não foi possível gerar a resposta com a API do Gemini no momento. Tente novamente em instantes.'
      );
    }
  }

  // 2. Se não houver chave client-side configurada, tenta rota de servidor local
  const serverResult = await tryServerEndpoint(duvida, imagemBase64);
  if (serverResult) {
    return serverResult;
  }

  // 3. Fallback didático caso esteja em ambiente completamente offline e sem chave
  return generateContextualFallbackSolution(duvida);
}
