import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Sanitize invalid or corrupted injected variables (e.g. placeholder or non-key values)
if (process.env.VITE_GEMINI_API_KEY && (process.env.VITE_GEMINI_API_KEY === "5,00" || process.env.VITE_GEMINI_API_KEY.length < 15)) {
  delete process.env.VITE_GEMINI_API_KEY;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Prevenção de erros 405 (Method Not Allowed) e configuração completa de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-gemini-api-key, x-gemini-model");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Respostas amigáveis em GET para evitar 405 Method Not Allowed em testes ou verificações
app.get("/api/gemini", (_req, res) => {
  res.json({ success: true, message: "Endpoint /api/gemini online. Utilize POST para enviar { contents }." });
});

app.get("/api/gabi-support", (_req, res) => {
  res.json({ success: true, message: "Endpoint /api/gabi-support online. Utilize POST para enviar { pergunta }." });
});

app.get("/api/gemini/chat", (_req, res) => {
  res.json({ success: true, message: "Endpoint /api/gemini/chat online. Utilize POST para enviar { prompt }." });
});

app.get("/api/solve-question", (_req, res) => {
  res.json({ success: true, message: "Endpoint /api/solve-question online. Utilize POST para enviar { duvida, imagemBase64 }." });
});

// Fallback amigável para qualquer rota GET em /api/*
app.get("/api/*", (req, res) => {
  res.json({
    success: true,
    message: `Endpoint ${req.path} ativo. Para processar requisições de IA utilize o método POST.`,
  });
});

function sendGeminiErrorResponse(res: express.Response, error: any, defaultMsg: string) {
  const errMsg = String(error?.message || error || "");
  const isAuthError =
    errMsg.includes("API key not valid") ||
    errMsg.includes("API_KEY_INVALID") ||
    errMsg.includes("GEMINI_API_KEY não configurada") ||
    errMsg.includes("Chave de API inválida") ||
    errMsg.includes("não autorizada") ||
    errMsg.includes("401");

  const status = isAuthError ? 401 : 500;
  return res.status(status).json({
    success: false,
    error: "Não foi possível obter uma resposta no momento. Por favor, tente novamente em alguns instantes.",
  });
}

function getGeminiApiKey(customApiKey?: string): string {
  if (customApiKey && typeof customApiKey === "string" && customApiKey.trim().length > 15 && customApiKey.trim() !== "5,00") {
    return customApiKey.trim();
  }
  // Always prioritize the official server-side GEMINI_API_KEY or VITE_GEMINI_API_KEY
  const viteKey = (process.env.VITE_GEMINI_API_KEY || "").trim();
  if (viteKey && viteKey !== "MY_GEMINI_API_KEY" && viteKey.length > 15 && viteKey !== "5,00") {
    return viteKey;
  }
  const serverKey = (process.env.GEMINI_API_KEY || "").trim();
  if (serverKey && serverKey !== "MY_GEMINI_API_KEY" && serverKey.length > 15) {
    return serverKey;
  }
  if (viteKey && viteKey !== "MY_GEMINI_API_KEY") {
    return viteKey;
  }
  if (serverKey && serverKey !== "MY_GEMINI_API_KEY") {
    return serverKey;
  }
  throw new Error("Não foi possível obter uma resposta no momento. Por favor, tente novamente em alguns instantes.");
}

function getGenAI(customApiKey?: string) {
  const apiKey = getGeminiApiKey(customApiKey);
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function extractClientApiKey(req: express.Request): string | undefined {
  const headerKey = req.headers["x-gemini-api-key"];
  const clientKey = req.body?.apiKey || (typeof headerKey === "string" ? headerKey : undefined);
  if (clientKey && typeof clientKey === "string" && clientKey.trim().length > 15 && clientKey.trim() !== "5,00") {
    return clientKey.trim();
  }
  return undefined;
}

function getGenAIFromRequest(req: express.Request) {
  return getGenAI(extractClientApiKey(req));
}

/**
 * Trata, higieniza e repara o JSON retornado pelo Gemini antes do JSON.parse(),
 * suportando tanto objetos {} quanto arrays [], evitando erros como
 * "Unexpected token '`', ```json..." ou "Unexpected end of JSON input".
 */
function cleanAndRepairJson(rawText: string | undefined | null): any {
  if (!rawText || typeof rawText !== "string") return null;

  let text = rawText.trim();

  // 1. Remover blocos de marcação markdown ```json ... ```
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  // 2. Tentativa direta de JSON.parse
  try {
    return JSON.parse(text);
  } catch (_) {
    // Prossegue para higienização e reparo estrutural
  }

  // 3. Localizar delimitadores de início '{' ou '['
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let startIdx = -1;
  let isArray = false;

  if (firstBrace !== -1 && firstBracket !== -1) {
    if (firstBracket < firstBrace) {
      startIdx = firstBracket;
      isArray = true;
    } else {
      startIdx = firstBrace;
    }
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    isArray = true;
  }

  if (startIdx === -1) return null;

  let candidate = text.slice(startIdx);
  const closingChar = isArray ? "]" : "}";
  const lastClose = candidate.lastIndexOf(closingChar);
  if (lastClose !== -1) {
    const candidateSlice = candidate.slice(0, lastClose + 1);
    try {
      const withoutTrailingCommas = candidateSlice.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(withoutTrailingCommas);
    } catch (_) {
      // Falhou; prossegue para o reparo de JSON cortado no final
    }
  }

  // 4. Reparar JSON incompleto/cortado no meio (fechamento de strings e delimitadores)
  try {
    let repaired = candidate;

    repaired = repaired.replace(/,\s*"[^"]*":?\s*$/, "");
    repaired = repaired.replace(/:\s*"[^"]*$/, ': ""');

    let inString = false;
    let escaped = false;
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (char === "\\" && inString) {
        escaped = !escaped;
      } else if (char === '"' && !escaped) {
        inString = !inString;
      } else {
        escaped = false;
      }
    }
    if (inString) {
      repaired += '"';
    }

    repaired = repaired.replace(/,\s*$/, "");

    const stack: string[] = [];
    inString = false;
    escaped = false;
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      if (char === "\\" && inString) {
        escaped = !escaped;
      } else if (char === '"' && !escaped) {
        inString = !inString;
      } else if (!inString) {
        if (char === "{") stack.push("}");
        else if (char === "[") stack.push("]");
        else if (char === "}" || char === "]") {
          if (stack.length > 0 && stack[stack.length - 1] === char) {
            stack.pop();
          }
        }
      } else {
        escaped = false;
      }
    }

    while (stack.length > 0) {
      repaired += stack.pop();
    }

    repaired = repaired.replace(/,\s*([}\]])/g, "$1");

    return JSON.parse(repaired);
  } catch (_) {
    return null;
  }
}

// Fallback pedagógico e conversacional inteligente, direto e natural caso a IA externa enfrente limite de requisição
function getFallbackGabiAnswer(pergunta: string): { resposta_suporte: string; botao_atalho: string } {
  const raw = (pergunta || "").trim();

  // Verificação de saudações e conversas informais
  if (isGreetingOrInformalServer(raw)) {
    return {
      resposta_suporte: getConversationalGreetingResponseServer(raw),
      botao_atalho: "nenhum"
    };
  }

  const p = raw.toLowerCase().trim();

  // Detecção e resolução direta de operações matemáticas elementares (ex: "Quanto é 2x3", "2x8", "30*2", "15 + 27")
  const mathQuery = p.replace(/^(quanto\s+[eé]|quanto\s+fica|calcule|resolva|qual\s+(é|e)\s+o\s+resultado\s+de|qual\s+(o\s+)?valor\s+de)\s+/i, '').replace(/[?!=]/g, '').trim();
  const simpleCalc = mathQuery.match(/^(\d+(?:[.,]\d+)?)\s*([x*+\-\/÷])\s*(\d+(?:[.,]\d+)?)$/i);
  if (simpleCalc) {
    const n1 = parseFloat(simpleCalc[1].replace(',', '.'));
    const op = simpleCalc[2].toLowerCase();
    const n2 = parseFloat(simpleCalc[3].replace(',', '.'));
    let res: number | string = 0;
    if (op === 'x' || op === '*') res = n1 * n2;
    else if (op === '+') res = n1 + n2;
    else if (op === '-') res = n1 - n2;
    else if (op === '/' || op === '÷') res = n2 !== 0 ? (n1 / n2) : 'indefinido (divisão por zero)';
    const displayOp = (op === '*' || op === 'x') ? 'x' : op;
    return {
      resposta_suporte: `${n1} ${displayOp} ${n2} = **${res}**.`,
      botao_atalho: "nenhum"
    };
  }

  // 2. Geometria & Áreas
  if (p.includes("trapézio") || (p.includes("trapezio") && p.includes("área"))) {
    return {
      resposta_suporte: "A área de um trapézio é calculada pela fórmula:\n\n**A = [(B + b) × h] / 2**\n\nOnde **B** é a base maior, **b** é a base menor e **h** é a altura. Basta somar as duas bases, multiplicar pela altura e dividir o total por 2.",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("círculo") || p.includes("circulo") || p.includes("raio") || p.includes("área do circulo")) {
    return {
      resposta_suporte: "A área de um círculo é calculada por:\n\n**A = π × r²**\n\nOnde **r** é o raio e **π** ≈ 3,14. Se a questão fornecer o diâmetro, lembre-se de dividir por 2 antes de elevar ao quadrado!",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("pitágoras") || p.includes("pitagoras") || p.includes("hipotenusa") || p.includes("triângulo retângulo")) {
    return {
      resposta_suporte: "O Teorema de Pitágoras estabelece que:\n\n**a² = b² + c²**\n\nO quadrado da hipotenusa (**a**) é igual à soma dos quadrados dos catetos (**b** e **c**). O triângulo pitagórico clássico mais cobrado no ENEM é o 3-4-5.",
      botao_atalho: "nenhum"
    };
  }

  // 3. Álgebra e Equações
  if (p.includes("bhaskara") || p.includes("segundo grau") || p.includes("2º grau") || p.includes("delta")) {
    return {
      resposta_suporte: "Para resolver ax² + bx + c = 0 por Bhaskara:\n\n1. **Δ = b² - 4ac**\n2. **x = (-b ± √Δ) / (2a)**\n\nSe Δ > 0 temos 2 raízes reais distintas; se Δ = 0 uma raiz dupla; se Δ < 0 não há raízes reais.",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("porcentagem") || p.includes("juros simples") || p.includes("juros compostos")) {
    return {
      resposta_suporte: "Em Matemática Financeira:\n\n• **Juros Simples:** J = C × i × t (incide apenas sobre o capital inicial).\n• **Juros Compostos:** M = C × (1 + i)ᵗ (juros sobre juros).\n\nPara aumentos sucessivos (ex: 10% depois 20%), multiplique os fatores: 1,10 × 1,20 = 1,32 (aumento de 32%).",
      botao_atalho: "nenhum"
    };
  }

  // 4. Física
  if (p.includes("newton") || p.includes("inércia") || p.includes("força resultante") || p.includes("aceleração")) {
    return {
      resposta_suporte: "As 3 Leis de Newton em resumo:\n\n1. **Inércia:** Um corpo permanece em repouso ou MRU a menos que uma força resultante atue sobre ele.\n2. **Princípio Fundamental:** **F = m × a** (a força resultante acelera a massa).\n3. **Ação e Reação:** Para toda ação há uma reação de igual módulo, mesma direção e sentidos opostos, aplicadas em corpos diferentes.",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("ohm") || p.includes("circuito") || p.includes("corrente elétrica") || p.includes("potência elétrica")) {
    return {
      resposta_suporte: "Fórmulas fundamentais de Eletrodinâmica:\n\n• **1ª Lei de Ohm:** U = R × i (Tensão = Resistência × Corrente)\n• **Potência:** P = U × i = R × i² = U² / R\n• **Consumo (kWh):** E = (P [W] × tempo [h]) / 1000.",
      botao_atalho: "nenhum"
    };
  }

  // 5. Química
  if (p.includes("fotossíntese") || p.includes("fotossintese") || p.includes("clorofila")) {
    return {
      resposta_suporte: "A equação geral da fotossíntese é:\n\n**6 CO₂ + 6 H₂O + Luz ➔ C₆H₁₂O₆ (glicose) + 6 O₂**\n\nOcorre nos cloroplastos: a fase clara nos tilacoides (quebra da água e liberação de O₂) e o ciclo de Calvin no estroma (fixação do carbono em glicose).",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("ácido") || p.includes("acido") || p.includes("base") || p.includes("ph") || p.includes("neutralização")) {
    return {
      resposta_suporte: "Conceito essencial de pH e Ácido-Base:\n\n• Ácido libera H⁺ (pH < 7)\n• Neutro tem pH = 7\n• Base libera OH⁻ (pH > 7)\n• **Neutralização:** Ácido + Base ➔ Sal + Água (ex: HCl + NaOH ➔ NaCl + H₂O).\n• Cálculo: pH = -log[H⁺].",
      botao_atalho: "nenhum"
    };
  }

  // 6. Biologia
  if (p.includes("mitose") || p.includes("meiose") || p.includes("divisão celular")) {
    return {
      resposta_suporte: "Diferença direta entre Mitose e Meiose:\n\n• **Mitose (2n ➔ 2n):** Produz 2 células geneticamente idênticas. Usada para crescimento, regeneração e cicatrização.\n• **Meiose (2n ➔ n):** Produz 4 células com metade do número de cromossomos e variabilidade genética (crossing-over). Usada na formação de gametas.",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("vacina") || p.includes("soro") || p.includes("imunologia")) {
    return {
      resposta_suporte: "Vacina vs Soro:\n\n• **Vacina:** Preventiva e ativa. Contém antígeno atenuado/inativado para estimular seu próprio corpo a criar anticorpos e memória imunológica.\n• **Soro:** Curativo e passivo. Contém anticorpos prontos para ação imediata em emergências (ex: picadas de cobra).",
      botao_atalho: "nenhum"
    };
  }

  // 7. Língua Portuguesa & Redação
  if (p.includes("crase") || p.includes("regência")) {
    return {
      resposta_suporte: "A crase (à) é a união da preposição 'a' com o artigo 'a'.\n\n💡 **Dica prática:** Troque a palavra feminina por uma masculina. Se virar **ao**, tem crase (ex: 'Fui à praia' ➔ 'Fui ao parque'). Se virar apenas 'o' ou 'a', não tem crase. Lembre-se: nunca use crase antes de verbos ou palavras masculinas!",
      botao_atalho: "nenhum"
    };
  }

  if (p.includes("redação") || p.includes("competência") || p.includes("nota 1000") || p.includes("intervenção")) {
    return {
      resposta_suporte: "Para nota máxima na Redação do ENEM:\n\n1. **Introdução:** Tema + Repertório legitimado + Tese com 2 argumentos (D1 e D2).\n2. **Desenvolvimento (D1 e D2):** Tópico frasal + repertório + consequência/crítica social.\n3. **Proposta de Intervenção (C5):** Os 5 elementos obrigatórios: Agente, Ação, Meio/Modo ('por meio de'), Efeito ('a fim de') e Detalhamento de um deles.",
      botao_atalho: "nenhum"
    };
  }

  // 8. Assinatura e Recursos do Aplicativo MenteUp
  if (p.includes("pro") || p.includes("plano") || p.includes("preço") || p.includes("valor") || p.includes("assinar")) {
    return {
      resposta_suporte: "O Plano PRO do MenteUp custa R$ 5,00/mês (sem fidelidade, cancele quando quiser). Ele inclui:\n\n• Scanner de Questões ilimitado com resolução passo a passo\n• Simulados TRI completos com nota oficial calculada\n• Caderno de Erros com repetição espaçada\n• Correção completa de Redação por competências do ENEM",
      botao_atalho: "tela_assinatura"
    };
  }

  if (p.includes("caderno de erros") || p.includes("erros")) {
    return {
      resposta_suporte: "O Caderno de Erros salva automaticamente as questões que você erra nos simulados e batalhas X1, agendando revisões em intervalos estratégicos (24h, 3 dias e 7 dias) para fixação definitiva.",
      botao_atalho: "tela_caderno_erros"
    };
  }

  if (p.includes("matéria") || p.includes("perfil") || p.includes("trocar") || p.includes("configurar")) {
    return {
      resposta_suporte: "Você pode alterar sua disciplina de foco, meta diária ou preferências a qualquer momento no seu Perfil.",
      botao_atalho: "tela_perfil"
    };
  }

  // Resposta amigável e transparente caso o modelo não retorne
  return {
    resposta_suporte: `⚠️ No momento não foi possível obter uma resposta em tempo real dos servidores da IA. Por favor, verifique sua conexão ou configure a sua chave de API nas Configurações.`,
    botao_atalho: "tela_perfil"
  };
}

// Chamador inteligente com fallback prioritário para modelos ultra-rápidos e válidos
async function callGeminiSafe(ai: GoogleGenAI, options: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  preferredModel?: string;
  temperature?: number;
  timeoutMs?: number;
}) {
  const modelsToTry = [
    options.preferredModel || "gemini-1.5-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
  ];
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const config: any = {};
      if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
      if (options.responseMimeType) config.responseMimeType = options.responseMimeType;
      if (options.responseSchema) config.responseSchema = options.responseSchema;
      if (options.temperature !== undefined) config.temperature = options.temperature;

      const timeoutDuration = options.timeoutMs || 10000;
      const result = await Promise.race([
        ai.models.generateContent({
          model,
          contents: options.contents,
          config,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout no modelo ${model}`)), timeoutDuration)
        ),
      ]);

      if (result && result.text) {
        return { text: result.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err);
      // Se a chave for comprovadamente inválida, interrompe o loop de modelos
      if (errStr.includes("API key not valid") || errStr.includes("API_KEY_INVALID")) {
        console.warn(`[callGeminiSafe] Chave de API inválida detectada.`);
        break;
      }
      console.warn(`[callGeminiSafe] Modelo ${model} falhou ou indisponível (${errStr.slice(0, 80)}), tentando próximo.`);
    }
  }

  throw lastError || new Error("Falha ao comunicar com os modelos de IA.");
}

// 1. SYSTEM INSTRUCTION FOR TEXT SUMMARIZATION & FLASHCARDS
const SUMMARIZE_SYSTEM_INSTRUCTION = `Você é o Assistente Inteligente de Estudos e Textos, um especialista em transformar textos longos e difíceis em materiais práticos.
Sempre que o usuário enviar um texto, artigo ou anotações, responda usando obrigatoriamente esta estrutura e gere os elementos:

⚡ Resumo Direto: Explique o tema central em no máximo 3 frases simples.
📌 Pontos Principais: Destaque em tópicos (bullet points) os 4 aspectos mais importantes para memorizar.
📝 3 Perguntas de Teste: Crie 3 perguntas rápidas sobre o conteúdo (com as respostas no final) para o usuário praticar.
🎴 Flashcards Interativos: Crie de 5 a 8 flashcards com uma pergunta ou termo na frente e a resposta ou definição no verso para memorização ativa.

Tom de voz: Claro, motivador, objetivo e muito fácil de entender.
Gere a resposta em Português (Brasil).`;

app.post("/api/summarize", async (req, res) => {
  try {
    const { text, focusTopic } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "O texto fornecido está vazio ou é inválido." });
    }

    const ai = getGenAIFromRequest(req);

    let userPrompt = `Por favor, analise e transforme o seguinte texto em um material prático de estudo e flashcards:\n\n"""\n${text.trim()}\n"""`;
    if (focusTopic) {
      userPrompt += `\n\nFoco especial do aluno: ${focusTopic}`;
    }

    const summarizeSchema = {
      type: Type.OBJECT,
      properties: {
        rawText: {
          type: Type.STRING,
          description: "Texto em Markdown estruturado.",
        },
        resumoDireto: {
          type: Type.STRING,
          description: "O resumo direto do texto em no máximo 3 frases simples e claras.",
        },
        pontosPrincipais: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Exatamente 4 tópicos principais fundamentais para memorização.",
        },
        perguntas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pergunta: { type: Type.STRING, description: "Texto da pergunta de teste" },
              resposta: { type: Type.STRING, description: "Resposta correta e direta da pergunta" },
            },
            required: ["pergunta", "resposta"],
          },
          description: "Exatamente 3 perguntas rápidas para teste com respostas.",
        },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              frente: { type: Type.STRING, description: "Pergunta ou conceito/termo principal do cartão" },
              verso: { type: Type.STRING, description: "Resposta ou definição explicativa do verso do cartão" },
            },
            required: ["frente", "verso"],
          },
          description: "De 5 a 8 flashcards para memorização ativa.",
        },
      },
      required: ["rawText", "resumoDireto", "pontosPrincipais", "perguntas", "flashcards"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: userPrompt,
      systemInstruction: SUMMARIZE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: summarizeSchema,
      preferredModel: "gemini-1.5-flash",
    });

    const data = cleanAndRepairJson(resultText) || {};

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Erro no processamento do texto:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Ocorreu um erro ao processar o texto com o assistente.",
    });
  }
});

// Endpoint multimodal para o AiStudioPlayground (suporta texto, imagens, documentos, apiKey, model, temperature e systemInstruction)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { prompt, fileParts, history, apiKey: customApiKey, model: customModel, temperature: customTemp, systemInstruction: customSystemInstruction } = req.body;
    if (!prompt && (!fileParts || fileParts.length === 0)) {
      return res.status(400).json({ error: "O prompt ou anexo é obrigatório." });
    }

    let effectiveKey = "";
    try {
      if (customApiKey && customApiKey.trim().length > 15 && customApiKey.trim() !== "5,00") {
        effectiveKey = customApiKey.trim();
      } else {
        effectiveKey = getGeminiApiKey();
      }
    } catch {
      effectiveKey = "";
    }
    if (!effectiveKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY não configurada no servidor e nenhuma chave foi fornecida nas configurações do Playground.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Monta o conteúdo com partes de arquivo se presentes
    const contentParts: any[] = [];

    if (fileParts && Array.isArray(fileParts)) {
      for (const part of fileParts) {
        if (part.inlineData && part.inlineData.data && part.inlineData.mimeType) {
          contentParts.push({
            inlineData: {
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data,
            },
          });
        }
      }
    }

    if (prompt) {
      contentParts.push({ text: prompt });
    }

    let selectedModel = customModel || "gemini-1.5-flash";
    if (selectedModel === "gemini-3.8-flash" || selectedModel === "gemini-3.6-flash") {
      selectedModel = "gemini-1.5-flash";
    }
    const selectedTemp = typeof customTemp === "number" ? customTemp : 0.7;
    const defaultInstruction = `Você é o tutor acadêmico e assistente educacional inteligente do MenteUp com IA Gemini.
DIRETRIZES OBRIGATÓRIAS DE RESPOSTA:
1. DÚVIDAS ACADÊMICAS COMPLEXAS (exercícios de cálculo, fórmulas matemáticas/físicas/químicas, processos biológicos, interpretações densas e questões de prova/vestibular):
   - Responda sempre em EXATAMENTE 3 PASSOS CLAROS E ESTRUTURADOS:
     • Passo 1 (Compreensão e Dados Essenciais): Identifique e isole as variáveis, premissas e comando da questão.
     • Passo 2 (Fórmula, Teorema ou Conceito Aplicável): Apresente o modelo teórico ou equação fundamental que resolve a dúvida.
     • Passo 3 (Resolução Guiada e Gabarito): Desenvolva os passos de resolução até a conclusão com o gabarito final e dica prática.
2. PERGUNTAS DE CONHECIMENTOS GERAIS OU FATOS DIRETOS (curiosidades, datas históricas, capitais, cultura pop, esportes, definições rápidas):
   - Forneça RESPOSTAS DIRETAS E CONCISAS em 1 a 3 frases claras e objetivas, sem criar passos artificiais nem enrolação.`;
    const selectedInstruction = customSystemInstruction?.trim() || defaultInstruction;

    let replyText = "";
    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: contentParts,
        config: {
          systemInstruction: selectedInstruction,
          temperature: selectedTemp,
        },
      });
      replyText = response.text || "";
    } catch (modelErr) {
      // Fallback dinâmico entre gemini-1.5-flash e gemini-2.5-flash para contornar cota (Quota Exceeded)
      try {
        const altModel = selectedModel === "gemini-1.5-flash" ? "gemini-2.5-flash" : "gemini-1.5-flash";
        const backupResponse = await ai.models.generateContent({
          model: altModel,
          contents: contentParts,
          config: {
            systemInstruction: selectedInstruction,
            temperature: selectedTemp,
          },
        });
        replyText = backupResponse.text || "";
      } catch (backupErr1) {
        try {
          const liteResponse = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: contentParts,
            config: {
              systemInstruction: selectedInstruction,
              temperature: selectedTemp,
            },
          });
          replyText = liteResponse.text || "";
        } catch (backupErr2) {
          // Fallback pedagógico instantâneo caso os servidores estejam temporariamente congestionados
          const fallbackObj = getFallbackGabiAnswer(prompt || "Dúvida geral");
          replyText = fallbackObj.resposta_suporte;
        }
      }
    }

    res.json({
      success: true,
      reply: replyText || "Olá! Como posso te ajudar a gabaritar hoje?",
    });
  } catch (error: any) {
    console.error("Erro no endpoint /api/gemini/chat:", error);
    const fallbackObj = getFallbackGabiAnswer(req.body?.prompt || "Dúvida");
    res.json({
      success: true,
      reply: fallbackObj.resposta_suporte,
    });
  }
});

// Endpoint /api/chat para perguntas sobre obras da Biblioteca Digital e dúvidas gerais
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Mensagem obrigatória." });
    }

    let replyText = "";
    try {
      const ai = getGenAIFromRequest(req);
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: message.trim(),
        config: {
          systemInstruction: `Você é o Tutor Acadêmico e Especialista em Literatura e Vestibulares do MenteUp utilizando o Gemini 3.8 Flash.
DIRETRIZES FUNDAMENTAIS DE RESPOSTA:
1. DÚVIDAS ACADÊMICAS COMPLEXAS (análise estilística profunda, figuras de linguagem, contexto histórico-filosófico de obras clássicas, correntes literárias e interpretação textual densa de vestibulares):
   - Responda em EXATAMENTE 3 PASSOS claros e estruturados:
     • Passo 1: Contextualização da Obra e Compreensão do Problema.
     • Passo 2: Conceito Teórico / Escola Literária / Recursos Expressivos Aplicáveis.
     • Passo 3: Análise Crítica Guiada e Aplicação nos Vestibulares/ENEM.
2. PERGUNTAS DE CONHECIMENTOS GERAIS OU FATOS DIRETOS (autor da obra, ano de publicação, personagens principais, enredo resumido ou curiosidades culturais):
   - Forneça respostas DIRETAS E CONCISAS em poucas frases objetivas, sem etapas desnecessárias.`,
        },
      });
      replyText = response.text || "";
    } catch (chatModelErr) {
      try {
        const ai = getGenAIFromRequest(req);
        const backup = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: message.trim(),
        });
        replyText = backup.text || "";
      } catch (_) {
        try {
          const ai = getGenAIFromRequest(req);
          const backupLite = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: message.trim(),
          });
          replyText = backupLite.text || "";
        } catch (_2) {
          const fb = getFallbackGabiAnswer(message.trim());
          replyText = fb.resposta_suporte;
        }
      }
    }

    res.json({
      success: true,
      reply: replyText || "Sem resposta gerada pelo modelo.",
    });
  } catch (error: any) {
    console.error("Erro no endpoint /api/chat:", error);
    const fb = getFallbackGabiAnswer(req.body?.message || "");
    res.json({
      success: true,
      reply: fb.resposta_suporte,
    });
  }
});

// Endpoint /api/gemini genérico para o glossário ENEM e repertórios
app.post("/api/gemini", async (req, res) => {
  try {
    const { contents, systemInstruction } = req.body;
    if (!contents) {
      return res.status(400).json({ error: "Conteúdo obrigatório." });
    }

    const ai = getGenAIFromRequest(req);
    const promptString = typeof contents === "string" ? contents : JSON.stringify(contents);
    const { text } = await callGeminiSafe(ai, {
      contents: promptString,
      systemInstruction: systemInstruction || undefined,
      preferredModel: "gemini-1.5-flash",
    });

    res.json({
      text: text || "",
    });
  } catch (error: any) {
    console.error("Erro no endpoint /api/gemini:", error);
    return sendGeminiErrorResponse(res, error, "Erro ao consultar Gemini.");
  }
});

// Endpoint /api/feynman-evaluate para avaliação didática e perguntas no Método Feynman
app.post("/api/feynman-evaluate", async (req, res) => {
  try {
    const { pergunta, conceitosChave, transcriptText } = req.body;
    if (!transcriptText || !transcriptText.trim()) {
      return res.status(400).json({ error: "Transcrição vazia." });
    }

    const ai = getGenAIFromRequest(req);
    const prompt = `Atue como um mentor e especialista no Método Feynman de Aprendizagem usando o Gemini 3.8 Flash.
O aluno tentou explicar o seguinte conceito verbalmente:
PERGUNTA: "${pergunta || "Conceito de estudo"}"
CONCEITOS ESPERADOS: ${(conceitosChave || []).join(", ")}

RESPOSTA FALADA/DIGITADA PELO ALUNO:
"${transcriptText.trim()}"

Analise a clareza, precisão técnica e simplicidade da explicação e responda estritamente em formato JSON:
{
  "notaPrecisao": number (0 a 100),
  "conceitosAtingidos": string[] (conceitos-chave cobertos pelo aluno),
  "conceitosFaltantes": string[] (conceitos que o aluno esqueceu ou explicou de forma confusa),
  "diagnosticoFeynman": "Avaliação construtiva do discurso",
  "dicaSimplificacao": "Como tornar a explicação ainda mais simples sem jargões"
}`;

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      responseMimeType: "application/json",
      preferredModel: "gemini-1.5-flash",
    });

    const parsed = cleanAndRepairJson(resultText) || {};
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro na avaliação Feynman:", error);
    return sendGeminiErrorResponse(res, error, "Erro ao avaliar com Método Feynman.");
  }
});

// 2. SYSTEM INSTRUCTION FOR GABARITAAÍ MODE 1 (PLANO DE ESTUDO OU CONTEÚDO)
const GABARITAAI_PLANO_SYSTEM_INSTRUCTION = `Você é o motor de inteligência artificial e backend do aplicativo "MenteUp", uma plataforma de estudos inteligente para alunos do Ensino Fundamental, Médio e ENEM.

Sua missão é receber as solicitações do usuário e retornar EXCLUSIVAMENTE um objeto JSON válido, sem qualquer texto introdutório, explicações ou marcadores fora da estrutura JSON.

### MODO 1: Quando o usuário pedir um Plano de Estudos ou Conteúdo
Retorne o JSON seguindo exatamente esta estrutura:
{
  "tipo_resposta": "plano_estudo",
  "materia": "Nome da Matéria",
  "objetivo": "Objetivo do Aluno",
  "resumo_rapido": "Resumo em até 3 frases bem diretas e didáticas.",
  "plano_hoje": [
    {
      "etapa": 1,
      "atividade": "Teoria",
      "duracao_minutos": 15,
      "descricao": "O que revisar primeiro"
    },
    {
      "etapa": 2,
      "atividade": "Prática",
      "duracao_minutos": 15,
      "descricao": "O que praticar em seguida"
    }
  ],
  "questoes": [
    {
      "id": 1,
      "pergunta": "Enunciado da questão prática",
      "opcoes": [
        "A) Opção 1",
        "B) Opção 2",
        "C) Opção 3",
        "D) Opção 4"
      ],
      "resposta_correta": "A) Opção 1",
      "explicacao_didatica": "Explicação simples e sem jargões do motivo da resposta estar certa."
    }
  ]
}`;

app.post("/api/tutor-plan", async (req, res) => {
  try {
    const { materia, serieAno, objetivo, tempoDisponivel } = req.body;

    if (!materia || !objetivo || !tempoDisponivel) {
      return res.status(400).json({ error: "Preencha a matéria, objetivo e tempo disponível." });
    }

    const ai = getGenAIFromRequest(req);

    const prompt = `Dados do Aluno para Planejamento de Estudos no MenteUp:
- Matéria: ${materia}
- Série/Ano: ${serieAno || "Não especificado"}
- Objetivo: ${objetivo} (ex: ENEM, Vestibular, Prova da Escola, Concurso)
- Tempo Disponível por Dia: ${tempoDisponivel}

Por favor, elabore o plano de estudos no MODO 1 (plano_estudo) com resumo_rapido, plano_hoje dividindo o tempo disponível em etapas, e questões práticas com alternativas e explicação didática.`;

    const planoSchema = {
      type: Type.OBJECT,
      properties: {
        tipo_resposta: { type: Type.STRING },
        materia: { type: Type.STRING },
        objetivo: { type: Type.STRING },
        resumo_rapido: { type: Type.STRING },
        plano_hoje: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              etapa: { type: Type.INTEGER },
              atividade: { type: Type.STRING },
              duracao_minutos: { type: Type.INTEGER },
              descricao: { type: Type.STRING },
            },
            required: ["etapa", "atividade", "duracao_minutos", "descricao"],
          },
        },
        questoes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              pergunta: { type: Type.STRING },
              opcoes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              resposta_correta: { type: Type.STRING },
              explicacao_didatica: { type: Type.STRING },
            },
            required: ["id", "pergunta", "opcoes", "resposta_correta", "explicacao_didatica"],
          },
        },
      },
      required: ["tipo_resposta", "materia", "objetivo", "resumo_rapido", "plano_hoje", "questoes"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: GABARITAAI_PLANO_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: planoSchema,
      preferredModel: "gemini-2.5-flash",
    });

    const parsedData = cleanAndRepairJson(resultText) || {};

    // Format for frontend mapping
    const cronogramaFormatted = (parsedData.plano_hoje || []).map((item: any) => ({
      etapa: `Etapa ${item.etapa}: ${item.atividade}`,
      duracao: `${item.duracao_minutos} min`,
      descricao: item.descricao,
    }));

    const questoesFormatted = (parsedData.questoes || []).map((q: any) => ({
      pergunta: q.pergunta,
      opcoes: q.opcoes || [],
      respostaCorreta: q.resposta_correta,
      explicacaoGabarito: q.explicacao_didatica,
    }));

    const formattedOutput = {
      ...parsedData,
      aulaResumo: parsedData.resumo_rapido || "Resumo preparado com sucesso para os seus estudos!",
      cronograma: cronogramaFormatted,
      questoes: questoesFormatted,
      gabaritoComentado: "MenteUp: Foco na resolução prática para gabaritar na prova!",
    };

    res.json({
      success: true,
      data: formattedOutput,
    });
  } catch (error: any) {
    console.error("Erro ao gerar plano do tutor:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao gerar o plano de estudos do tutor.",
    });
  }
});

// 3. SYSTEM INSTRUCTION FOR GABARITAAÍ MODE 2 (TIRA-DÚVIDAS)
const GABARITAAI_DUVIDAS_SYSTEM_INSTRUCTION = `Você é o motor de inteligência artificial e tutor pedagógico do aplicativo "MenteUp", uma plataforma de estudos inteligente para alunos do Ensino Fundamental, Médio e ENEM.

Sua missão é receber as solicitações do usuário e retornar EXCLUSIVAMENTE um objeto JSON válido, sem qualquer texto introdutório ou marcadores fora da estrutura JSON.

DIRETRIZES DE RESPOSTA POR CATEGORIA (SIGA RIGOROSAMENTE):
1. DÚVIDAS ACADÊMICAS COMPLEXAS (problemas de exatas com cálculos, fórmulas físicas/químicas, processos biológicos, interpretação textual densa e teorias de humanas):
   - Estruture o campo "passo_a_passo" em EXATAMENTE 3 PASSOS CLAROS E ESTRUTURADOS:
     • Passo 1 (Compreensão e Dados): O que foi fornecido e o que a questão pede.
     • Passo 2 (Fórmula ou Conceito-Chave): A regra, modelo teórico ou equação fundamental.
     • Passo 3 (Resolução Guiada e Conclusão): O desenvolvimento passo a passo até o gabarito.
   - Forneça uma "analogia_simples" do dia a dia e uma "dica_de_ouro" memorável.

2. PERGUNTAS DE CONHECIMENTOS GERAIS OU FATOS DIRETOS (curiosidades, datas, capitais, fatos do cotidiano, definições rápidas, esportes):
   - Forneça no campo "passo_a_passo" uma RESPOSTA DIRETA E CONCISA (em 1 a 3 frases esclarecedoras), sem forçar divisões artificiais.
   - Preencha "analogia_simples" e "dica_de_ouro" de forma sucinta e direta.

ESTRUTURA DO JSON OBRIGATÓRIO:
{
  "tipo_resposta": "tira_duvidas",
  "categoria": "duvida_complexa | conhecimentos_gerais",
  "analogia_simples": "Explicação ou analogia do assunto.",
  "passo_a_passo": "Resolução em 3 passos estruturados (para dúvidas acadêmicas complexas) OU resposta direta e concisa (para conhecimentos gerais).",
  "dica_de_ouro": "Um macete prático para nunca mais esquecer este assunto na hora da prova."
}`;

app.post("/api/explain-eli5", async (req, res) => {
  try {
    const { duvida } = req.body;

    if (!duvida || typeof duvida !== "string" || !duvida.trim()) {
      return res.status(400).json({ error: "Envie sua dúvida ou conceito para explicação." });
    }

    const ai = getGenAIFromRequest(req);

    const prompt = `Dúvida do aluno no MenteUp:\n"${duvida.trim()}"\n\nPor favor, responda no MODO 2 (tira_duvidas) com analogia_simples, passo_a_passo e dica_de_ouro.`;

    const duvidaSchema = {
      type: Type.OBJECT,
      properties: {
        tipo_resposta: { type: Type.STRING },
        analogia_simples: { type: Type.STRING },
        passo_a_passo: {
          type: Type.STRING,
          description: "Resolução do problema dividida em etapas pequenas.",
        },
        dica_de_ouro: { type: Type.STRING },
      },
      required: ["tipo_resposta", "analogia_simples", "passo_a_passo", "dica_de_ouro"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: GABARITAAI_DUVIDAS_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: duvidaSchema,
      preferredModel: "gemini-2.5-flash",
    });

    const parsedData = cleanAndRepairJson(resultText) || {};

    // Map to frontend expected format
    const passoAPassoArray = typeof parsedData.passo_a_passo === "string"
      ? parsedData.passo_a_passo.split("\n").filter((line: string) => line.trim().length > 0)
      : Array.isArray(parsedData.passo_a_passo)
      ? parsedData.passo_a_passo
      : [parsedData.passo_a_passo];

    const formattedOutput = {
      ...parsedData,
      analogiaSimples: parsedData.analogia_simples,
      passoAPasso: passoAPassoArray.length > 0 ? passoAPassoArray : ["Revise a teoria principal.", "Pratique com exercícios curtos.", "Fixe os conceitos-chave."],
      dicaDeOuro: parsedData.dica_de_ouro,
    };

    res.json({
      success: true,
      data: formattedOutput,
    });
  } catch (error: any) {
    console.error("Erro na explicação ELI5:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao gerar a explicação simplificada.",
    });
  }
});

// SYSTEM INSTRUCTION FOR PERSONALIZED KNOWLEDGE PILL
const PERSONALIZED_PILL_SYSTEM_INSTRUCTION = `Você é o especialista em Pílulas de Conhecimento e Hacks de Prova do MenteUp.
Sua função é analisar o histórico de estudos do aluno, identificar os tópicos de menor desempenho e criar uma 'Pílula de Conhecimento' altamente memorável de 30 segundos para o dia seguinte.

A pílula deve conter:
- categoria: Nome da matéria (Redação, Matemática, Física, Química, Biologia, História, Geografia, Filosofia, Gramática, etc.)
- topico: Tópico específico de menor desempenho analisado
- titulo: Um título atrativo, direto e memorável (ex: "Hack da Porcentagem em 5s", "Macete do Chuveiro Elétrico")
- duracaoLeitura: "30 segundos"
- diagnosticoHistorico: Breve explicação do porquê essa pílula foi sugerida com base nos erros do aluno
- resumoCurto: Explicação concisa em 2 frases simples
- maceteOuro: O macete ou regra de ouro INFALÍVEL para não errar mais na prova
- exemploPratico: Um exemplo curto numérico ou prático de aplicação
- desafioFixacao: Uma pergunta ultra-rápida de 1 linha com opções para testar na hora
- desafioGabarito: A resposta correta com explicação de 1 frase`;

function getFallbackKnowledgePill(topic: string, lowestSubjects?: any[]) {
  const t = (topic || (lowestSubjects && lowestSubjects[0]?.materia) || "Física").toLowerCase();

  if (t.includes("física") || t.includes("fisica") || t.includes("newton") || t.includes("óptica") || t.includes("onda") || t.includes("eletro")) {
    return {
      categoria: "Física",
      topico: "Eletrodinâmica & Consumo de Energia",
      titulo: "Macete do kWh no ENEM: Nunca erre o cálculo da conta de luz!",
      duracaoLeitura: "30 segundos",
      diagnosticoHistorico: "Identificamos que questões de cálculo elétrico foram seu ponto de maior oscilação recente.",
      resumoCurto: "A energia consumida é dada por E = P × Δt. O segredo de 99% das questões do ENEM é converter a potência em Watts para kiloWatts dividindo por 1000.",
      maceteOuro: "Mnemônico: Energia (kWh) = [Potência (W) × Horas de uso (h)] / 1000. Se o tempo for dado em minutos, divida por 60 antes de calcular!",
      exemploPratico: "Um chuveiro de 5500W ligado por 30 minutos (0,5h) consome: 5,5 kW × 0,5h = 2,75 kWh!",
      desafioFixacao: {
        pergunta: "Uma lâmpada LED de 20W fica acesa 10 horas por dia durante 30 dias. Qual o consumo mensal em kWh?",
        opcoes: [
          "A) 6,0 kWh",
          "B) 60 kWh",
          "C) 0,6 kWh",
          "D) 200 kWh"
        ],
        respostaCorreta: "A) 6,0 kWh",
        explicacao: "E = (20W × 300h) / 1000 = 6000 / 1000 = 6,0 kWh."
      }
    };
  }

  if (t.includes("matemática") || t.includes("matematica") || t.includes("geometria") || t.includes("função") || t.includes("álgebra")) {
    return {
      categoria: "Matemática",
      topico: "Escala Cartográfica e Numérica",
      titulo: "O Segredo da Escala no ENEM: Cuidado com Áreas e Volumes!",
      duracaoLeitura: "30 segundos",
      diagnosticoHistorico: "Reforço programado para dominar proporcionalidade e escalas sem cair em pegadinhas de unidades.",
      resumoCurto: "A escala linear é E = d / D. Para áreas, a proporção é ao quadrado (E² = a / A), e para volumes é ao cubo (E³ = v / V).",
      maceteOuro: "1 km = 1.000 m = 100.000 cm. Sempre converta metros ou quilômetros para centímetros antes de aplicar a escala!",
      exemploPratico: "Num mapa de escala 1:50.000, 4 cm no papel representam: 4 × 50.000 = 200.000 cm = 2 km reais.",
      desafioFixacao: {
        pergunta: "Em um mapa de escala 1:100.000, uma estrada mede 5 cm. Qual o comprimento real da estrada?",
        opcoes: [
          "A) 5 km",
          "B) 50 km",
          "C) 0,5 km",
          "D) 500 metros"
        ],
        respostaCorreta: "A) 5 km",
        explicacao: "5 cm × 100.000 = 500.000 cm = 5.000 m = 5 km."
      }
    };
  }

  return {
    categoria: "Biologia & Ecologia",
    topico: "Eutrofização das Águas",
    titulo: "A Sequência da Eutrofização: Do esgoto à asfixia dos peixes",
    duracaoLeitura: "30 segundos",
    diagnosticoHistorico: "Questão clássica da matriz de Ciências da Natureza que mais confunde a ordem dos acontecimentos.",
    resumoCurto: "O excesso de matéria orgânica (esgoto/fertilizantes) prolifera algas na superfície, bloqueando a luz solar e esgotando o oxigênio dissolvido.",
    maceteOuro: "Grave o ciclo: Excesso de nutrientes ➔ Boom de algas ➔ Bloqueio de luz ➔ Morte de vegetais submersos ➔ Decomposição aeróbica ➔ Queda drástica de O₂ ➔ Morte de peixes por asfixia.",
    exemploPratico: "A morte dos peixes ocorre NÃO pelo veneno do esgoto, mas sim pela falta de oxigênio dissolvido consumido pelas bactérias!",
    desafioFixacao: {
      pergunta: "Qual é a causa direta da mortandade em massa de peixes em corpos d'água eutrofizados?",
      opcoes: [
        "A) Anóxia (falta de oxigênio) provocada por bactérias decompositoras",
        "B) Aumento excessivo da temperatura da água",
        "C) Radiação ultravioleta intensificada na superfície",
        "D) Ingestão direta de fosfatos pelas guelras"
      ],
      respostaCorreta: "A) Anóxia (falta de oxigênio) provocada por bactérias decompositoras",
      explicacao: "A decomposição da biomassa de algas mortas consome todo o oxigênio da água, sufocando peixes e crustáceos."
    }
  };
}

app.post("/api/personalized-knowledge-pill", async (req, res) => {
  const { lowestSubjects, customTopic } = req.body;
  try {
    const ai = getGenAIFromRequest(req);

    const prompt = `Analise os tópicos com menor desempenho do aluno e crie a Pílula de Conhecimento ideal para amanhã:
Tópicos/Matérias com menor desempenho: ${JSON.stringify(lowestSubjects || [])}
${customTopic ? `Tópico específico solicitado pelo aluno: ${customTopic}` : ''}`;

    const pillSchema = {
      type: Type.OBJECT,
      properties: {
        categoria: { type: Type.STRING },
        topico: { type: Type.STRING },
        titulo: { type: Type.STRING },
        duracaoLeitura: { type: Type.STRING },
        diagnosticoHistorico: { type: Type.STRING },
        resumoCurto: { type: Type.STRING },
        maceteOuro: { type: Type.STRING },
        exemploPratico: { type: Type.STRING },
        desafioFixacao: {
          type: Type.OBJECT,
          properties: {
            pergunta: { type: Type.STRING },
            opcoes: { type: Type.ARRAY, items: { type: Type.STRING } },
            respostaCorreta: { type: Type.STRING },
            explicacao: { type: Type.STRING },
          },
          required: ["pergunta", "opcoes", "respostaCorreta", "explicacao"],
        },
      },
      required: ["categoria", "topico", "titulo", "duracaoLeitura", "diagnosticoHistorico", "resumoCurto", "maceteOuro", "exemploPratico", "desafioFixacao"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: PERSONALIZED_PILL_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: pillSchema,
      preferredModel: "gemini-2.5-flash",
    });

    const data = cleanAndRepairJson(resultText) || getFallbackKnowledgePill(customTopic, lowestSubjects);
    res.json({ success: true, data });
  } catch (error: any) {
    console.warn("[personalized-knowledge-pill] Usando pílula pedagógica de alta precisão.");
    const fallback = getFallbackKnowledgePill(customTopic, lowestSubjects);
    res.json({ success: true, data: fallback });
  }
});

// 4. SYSTEM INSTRUCTION FOR GABARITAAÍ DAY & NIGHT MODE SELECTION
const GABARITAAI_DAY_NIGHT_SYSTEM_INSTRUCTION = `Você é o motor de inteligência artificial do aplicativo "MenteUp".

Analise a mensagem do usuário e escolha EXCLUSIVAMENTE um dos modos abaixo:

---

🔴 REGRA DE SELEÇÃO DE MODO:
1. SE a mensagem mencionar "dia", "manhã", "planejamento", "cronograma", "o que estudar hoje" ou pedir um plano de estudos:
   --> Use obrigatoriamente o MODO DIA.

2. SE a mensagem mencionar "noite", "revisão", "resumo do dia", "o que aprendi hoje" ou pedir um teste/revisão noturna:
   --> Use obrigatoriamente o MODO NOITE.

---

### MODO DIA (Planejamento e Foco):
Retorne o JSON:
{
  "modo_ativo": "modo_dia",
  "saudacao": "Bom dia! Vamos preparar seus estudos de hoje.",
  "meta_do_dia": "Descrição da meta diária",
  "plano_estudo": ["Atividade 1", "Atividade 2"]
}

---

### MODO NOITE (Revisão e Consolidação):
Retorne o JSON:
{
  "modo_ativo": "modo_noite",
  "saudacao": "Boa noite! Hora de revisar o que você aprendeu.",
  "resumo_noturno": "Resumo rápido para fixar antes de dormir",
  "perguntas_revisao": ["Pergunta 1", "Pergunta 2"]
}`;

app.post("/api/day-night-mode", async (req, res) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
      return res.status(400).json({ error: "Envie sua mensagem para a inteligência MenteUp." });
    }

    const ai = getGenAIFromRequest(req);

    const dayNightSchema = {
      type: Type.OBJECT,
      properties: {
        modo_ativo: {
          type: Type.STRING,
          description: "modo_dia ou modo_noite",
        },
        saudacao: { type: Type.STRING },
        meta_do_dia: { type: Type.STRING },
        plano_estudo: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        resumo_noturno: { type: Type.STRING },
        perguntas_revisao: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["modo_ativo", "saudacao"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: `Mensagem do aluno: "${mensagem.trim()}"`,
      systemInstruction: GABARITAAI_DAY_NIGHT_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: dayNightSchema,
      preferredModel: "gemini-2.5-flash",
    });

    const parsedData = cleanAndRepairJson(resultText) || {};

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Erro no MODO DIA/NOITE MenteUp:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro no processamento do Modo Dia/Noite do MenteUp.",
    });
  }
});

// 5. SYSTEM INSTRUCTION FOR GABI (CONSCIOUS, DIRECT & NATURAL AI TUTOR)
const GABI_SUPPORT_SYSTEM_INSTRUCTION = `Você é a Professora Gabi, uma inteligência artificial avançada, consciente, pedagógica e extremamente capaz, atuando como mentora e tutora no aplicativo MenteUp.
Você responde de forma natural, inteligente, empática e direta, exatamente como modelos de ponta (como Gemini, ChatGPT e Claude).

POSTURA E DIRETRIZES DE COMUNICAÇÃO:
1. RESPOSTAS DIRETAS E IMEDIATAS:
   - Responda IMEDIATAMENTE à dúvida central do usuário no primeiro parágrafo, sem enrolações ou introduções genéricas repetitivas (NUNCA comece com "Entendido! Sobre X...", "Olá! Que ótima pergunta...", "Com certeza! Vou te explicar...").
   - OBRIGATÓRIO PARA CÁLCULOS MATEMÁTICOS: Se o usuário perguntar qualquer operação aritmética ou cálculo (ex: "Quanto é 2x3", "Quanto é 2x8", "30*2", "15 + 27"), responda OBRIGATORIAMENTE e de imediato o cálculo com o resultado exato (ex: "2 x 3 = 6." ou "2 x 8 = 16.").
   - Exemplos:
     • Se o usuário perguntar "Quanto é 2x3", responda diretamente: "2 x 3 = 6."
     • Se perguntar "Qual a capital da Austrália?", responda: "A capital da Austrália é Camberra."
     • Se pedir uma fórmula, mostre a fórmula e o significado de cada termo logo no início.
2. CONSCIÊNCIA, NATURALIDADE E ADAPTABILIDADE:
   - Adapte o tom dinamicamente: se a dúvida for simples, seja direto e conciso; se for complexa ou pedir resolução detalhada, explique com clareza conceitual, raciocínio lógico e método.
   - NUNCA force um formato mecânico de 3 passos para perguntas simples ou conversas cotidianas. Seja fluida, humana e precisa.
3. CONTEXTO DO APLICATIVO (QUANDO SOLICITADO):
   - MenteUp Pro (R$ 5,00/mês, sem fidelidade): Scanner Tira-Dúvidas ilimitado, Simulados TRI completos, Caderno de Erros com repetição espaçada e Correção de Redação por competências do ENEM.
   - Use o campo "botao_atalho" quando fizer sentido direcionar o estudante:
     • Dúvidas de assinatura/preço: "tela_assinatura"
     • Alterar matéria/perfil: "tela_perfil"
     • Revisão de erros: "tela_caderno_erros"
     • Qualquer outra resposta: "nenhum"

FORMATO DE RESPOSTA (JSON):
{
  "resposta_suporte": "Sua resposta direta, natural e completa.",
  "botao_atalho": "tela_assinatura | tela_perfil | tela_caderno_erros | nenhum"
}`;

app.post("/api/gabi-support", async (req, res) => {
  try {
    const pergunta = req.body.pergunta || req.body.message || req.body.prompt || req.body.question;
    const clientApiKey = req.body.apiKey || (typeof req.headers["x-gemini-api-key"] === "string" ? req.headers["x-gemini-api-key"] : undefined);

    if (!pergunta || typeof pergunta !== "string" || !pergunta.trim()) {
      return res.status(400).json({ error: "Envie sua dúvida para a Professora Gabi." });
    }

    const trimmedPergunta = pergunta.trim();

    // Verificação de conversas informais e saudações para resposta conversacional instantânea
    if (isGreetingOrInformalServer(trimmedPergunta)) {
      const respostaNatural = getConversationalGreetingResponseServer(trimmedPergunta);
      return res.json({
        success: true,
        modelUsed: "gabi-conversational-instant",
        data: {
          resposta_suporte: respostaNatural,
          botao_atalho: "nenhum",
        },
      });
    }

    let ai;
    try {
      ai = getGenAI(clientApiKey);
    } catch (keyErr: any) {
      // Se não houver chave no servidor nem no cliente, tentar fallback pedagógico direto
      const fallbackResposta = getFallbackGabiAnswer(trimmedPergunta);
      return res.json({
        success: true,
        modelUsed: "gabi-instant-engine",
        data: fallbackResposta,
      });
    }

    try {
      const { text, modelUsed } = await callGeminiSafe(ai, {
        contents: `Pergunta do aluno para a Professora Gabi:\n"${trimmedPergunta}"`,
        systemInstruction: GABI_SUPPORT_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        preferredModel: req.body.model || req.body.preferredModel || "gemini-1.5-flash",
      });

      let parsedData: any = {};
      try {
        const clean = (text || "").replace(/```json/g, "").replace(/```/g, "").trim();
        parsedData = JSON.parse(clean);
      } catch (e) {
        parsedData = {
          resposta_suporte: text || "Aqui está a resposta para a sua dúvida.",
          botao_atalho: "nenhum"
        };
      }

      if (!parsedData.resposta_suporte) {
        parsedData.resposta_suporte = text || "Aqui está a resposta para a sua dúvida.";
      }
      if (typeof parsedData.resposta_suporte === "string" && parsedData.resposta_suporte.trim().startsWith("{")) {
        try {
          const inner = JSON.parse(parsedData.resposta_suporte.trim());
          if (inner.resposta_suporte) {
            parsedData.resposta_suporte = inner.resposta_suporte;
            if (inner.botao_atalho) parsedData.botao_atalho = inner.botao_atalho;
          }
        } catch (_) {}
      }
      if (!parsedData.botao_atalho) {
        parsedData.botao_atalho = "nenhum";
      }

      return res.json({
        success: true,
        modelUsed,
        data: parsedData,
      });
    } catch (modelErr: any) {
      console.log("[Professora Gabi] Utilizando motor pedagógico de resposta rápida.");
      const fallbackResposta = getFallbackGabiAnswer(trimmedPergunta);
      return res.json({
        success: true,
        modelUsed: "gabi-instant-engine",
        data: fallbackResposta,
      });
    }
  } catch (error: any) {
    console.error("Erro na assistente Professora Gabi:", error);
    const fallbackResposta = getFallbackGabiAnswer(req.body?.pergunta || "");
    return res.json({
      success: true,
      modelUsed: "gabi-recovery-engine",
      data: fallbackResposta,
    });
  }
});

// 6. SYSTEM INSTRUCTION FOR ENEM ESSAY ANALYZER (CORRETOR DE REDAÇÃO ESPECIALISTA)
const ENEM_ESSAY_ANALYZER_SYSTEM_INSTRUCTION = `Você é o Corretor de Redação Oficial do aplicativo MenteUp, especialista nas normas e critérios de avaliação do ENEM (Exame Nacional do Ensino Médio).

Sua função é analisar o texto da redação enviado pelo aluno, atribuir notas de 0 a 200 para cada uma das 5 Competências do ENEM e fornecer feedbacks construtivos.

CRITÉRIOS DAS COMPETÊNCIAS ENEM:
- Competência 1: Domínio da norma culta da língua escrita.
- Competência 2: Compreensão do tema e aplicação das áreas do conhecimento (repertório sociocultural).
- Competência 3: Seleção, relação, organização e interpretação de informações/argumentos em defesa do ponto de vista.
- Competência 4: Demonstração de conhecimento dos mecanismos linguísticos necessários para a construção da argumentação (coesão e conectivos).
- Competência 5: Elaboração de proposta de intervenção para o problema abordado, respeitando os direitos humanos.

FORMATO DE RESPOSTA (OBRIGATORIAMENTE JSON):
Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido, sem qualquer texto expositivo antes ou depois.

{
  "tipo_resposta": "correcao_redacao_enem",
  "tema_detectado": "Tema identificado no texto",
  "nota_final": 840,
  "competencias": [
    {
      "numero": 1,
      "nome": "Norma Culta",
      "nota": 160,
      "feedback": "Comentário sobre desvios gramaticais ou de pontuação."
    },
    {
      "numero": 2,
      "nome": "Compreensão do Tema e Repertório",
      "nota": 200,
      "feedback": "Comentário sobre o uso do repertório sociocultural."
    },
    {
      "numero": 3,
      "nome": "Projeto de Texto e Argumentação",
      "nota": 160,
      "feedback": "Comentário sobre a coerência da tese e argumentos."
    },
    {
      "numero": 4,
      "nome": "Coesão e Conectivos",
      "nota": 160,
      "feedback": "Comentário sobre o uso de conectivos entre parágrafos."
    },
    {
      "numero": 5,
      "nome": "Proposta de Intervenção",
      "nota": 160,
      "feedback": "Comentário sobre os 5 elementos da proposta (Agente, Ação, Meio, Efeito e Detalhamento)."
    }
  ],
  "pontos_fortes": [
    "Destaque positivo 1",
    "Destaque positivo 2"
  ],
  "pontos_melhoria": [
    "O que precisa melhorar 1",
    "O que precisa melhorar 2"
  ],
  "sugestao_reescrita": "Trecho com sugestão de melhoria prática para aumentar a nota."
}`;

function evaluateEssayHeuristic(texto: string, temaInformado?: string) {
  const lower = texto.toLowerCase();
  const paragraphs = texto.split(/\n\s*\n/).filter(p => p.trim().length > 10);
  const totalWords = texto.trim().split(/\s+/).length;

  // 1. C1 - Norma Culta (0 a 200)
  let c1Nota = 160;
  let c1Feedback = "Bom domínio da modalidade escrita formal, com vocabulário adequado e poucos desvios gramaticais.";
  if (totalWords < 120) {
    c1Nota = 80;
    c1Feedback = "Texto excessivamente curto para avaliar com precisão a estrutura sintática. Amplie o desenvolvimento.";
  } else if (texto.includes("vc") || texto.includes("tbm") || texto.includes("pq") || lower.includes("pra ") || lower.includes(" agente vai ")) {
    c1Nota = 120;
    c1Feedback = "Presença de marcas de oralidade ou abreviações incompatíveis com a norma culta padrão exigida no ENEM.";
  } else if (totalWords > 250 && paragraphs.length >= 4) {
    c1Nota = 200;
    c1Feedback = "Excelente domínio da norma padrão, estrutura sintática fluida, pontuação precisa e vocabulário formal diversificado.";
  }

  // 2. C2 - Compreensão do Tema e Repertório Sociocultural (0 a 200)
  let c2Nota = 160;
  let c2Feedback = "Compreensão consistente do tema com aplicação de repertório sociocultural pertinente.";
  const temRepertorio = lower.includes("constituição") || lower.includes("filósofo") || lower.includes("sociólogo") ||
    lower.includes("história") || lower.includes("século") || lower.includes("bauman") || lower.includes("habermas") ||
    lower.includes("kant") || lower.includes("foucault") || lower.includes("artigo") || lower.includes("declaração universal") ||
    lower.includes("ibge") || lower.includes("dado") || lower.includes("pesquisa");

  if (!temRepertorio) {
    c2Nota = 120;
    c2Feedback = "O texto tangencia a discussão sem mobilizar repertório sociocultural legitimado externo (filosofia, história, sociologia ou dados).";
  } else if (totalWords >= 220 && paragraphs.length >= 4) {
    c2Nota = 200;
    c2Feedback = "Repertório sociocultural legitimado, produtivo e perfeitamente integrado à defesa do ponto de vista sobre o tema.";
  }

  // 3. C3 - Projeto de Texto e Argumentação (0 a 200)
  let c3Nota = 160;
  let c3Feedback = "Projeto de texto estratégico perceptível, com posicionamento claro e argumentos organizados em prol da tese.";
  if (paragraphs.length < 3) {
    c3Nota = 120;
    c3Feedback = "Projeto de texto com falhas estruturais: distribua o texto claramente em Introdução, D1, D2 e Proposta de Intervenção.";
  } else if (paragraphs.length >= 4 && (lower.includes("em primeiro lugar") || lower.includes("ademais") || lower.includes("nesse cenário") || lower.includes("sob essa ótica"))) {
    c3Nota = 200;
    c3Feedback = "Excelente projeto de texto com tese delimitada na introdução, desenvolvimento aprofundado com relações de causa e consequência, e fechamento coeso.";
  }

  // 4. C4 - Mecanismos de Coesão (0 a 200)
  let c4Nota = 160;
  let c4Feedback = "Uso variado e pertinente de conectivos interparágrafos e intraparágrafos para articular as ideias.";
  const conectivos = ["portanto", "ademais", "outrossim", "além disso", "contudo", "entretanto", "nesse sentido", "dessa forma", "assim", "por conseguinte"];
  const qtdConectivos = conectivos.filter(c => lower.includes(c)).length;

  if (qtdConectivos < 2) {
    c4Nota = 120;
    c4Feedback = "Pouca variedade de operadores argumentativos e conectivos interparágrafos. Utilize elementos como 'Ademais', 'Contudo' e 'Portanto'.";
  } else if (qtdConectivos >= 4 && paragraphs.length >= 4) {
    c4Nota = 200;
    c4Feedback = "Amplo repertório de recursos coesivos, sem repetições viciosas e com transições suaves entre os parágrafos.";
  }

  // 5. C5 - Proposta de Intervenção (0 a 200)
  const temAgente = lower.includes("ministério") || lower.includes("governo") || lower.includes("mec") || lower.includes("escola") || lower.includes("sociedade") || lower.includes("ong") || lower.includes("cabe a") || lower.includes("compete a");
  const temAcao = lower.includes("promover") || lower.includes("criar") || lower.includes("desenvolver") || lower.includes("implementar") || lower.includes("realizar") || lower.includes("garantir") || lower.includes("investir");
  const temMeio = lower.includes("por meio") || lower.includes("através de") || lower.includes("mediante") || lower.includes("com o auxílio") || lower.includes("por intermédio");
  const temEfeito = lower.includes("a fim de") || lower.includes("para que") || lower.includes("com o intuito") || lower.includes("visando a") || lower.includes("de modo a");
  const temDetalhamento = texto.includes("(") || (texto.includes(",") && (lower.includes("como") || lower.includes("em parceria") || lower.includes("especialmente")));

  const elementosC5Count = [temAgente, temAcao, temMeio, temEfeito, temDetalhamento].filter(Boolean).length;
  const c5Nota = Math.min(200, elementosC5Count * 40);
  let c5Feedback = `Proposta de intervenção identificou ${elementosC5Count} dos 5 elementos obrigatórios (Agente, Ação, Meio/Modo, Efeito e Detalhamento).`;
  if (elementosC5Count === 5) {
    c5Feedback = "Proposta de intervenção completa e exemplar, contendo todos os 5 elementos obrigatórios (Agente, Ação, Meio, Efeito e Detalhamento) em conformidade com os Direitos Humanos.";
  } else {
    c5Feedback += " Para atingir 200 pontos, certifique-se de explicitar: Quem fará, O que fará, Como fará, Para que fará e um Detalhamento explicativo.";
  }

  const notaTotal = c1Nota + c2Nota + c3Nota + c4Nota + c5Nota;

  const pontosFortes: string[] = [];
  if (c1Nota >= 160) pontosFortes.push("Bom domínio da norma padrão e registro formal da língua.");
  if (c2Nota >= 160) pontosFortes.push("Abordagem consistente do tema central sem tangenciamento.");
  if (c3Nota >= 160) pontosFortes.push("Estrutura dissertativo-argumentativa bem delimitada em introdução, desenvolvimento e conclusão.");
  if (c4Nota >= 160) pontosFortes.push("Emprego adequado de operadores argumentativos e conectivos coesivos.");
  if (c5Nota >= 160) pontosFortes.push("Proposta de intervenção bem articulada com os agentes e ações necessárias.");
  if (pontosFortes.length === 0) pontosFortes.push("Esforço inicial na estruturação dos parágrafos e respeito aos direitos humanos.");

  const pontosMelhoria: string[] = [];
  if (c1Nota < 160) pontosMelhoria.push("Revisar concordância verbal, regência e pontuação para evitar desvios formais (C1).");
  if (c2Nota < 160) pontosMelhoria.push("Incorporar repertório sociocultural produtivo e legitimado (dados históricos, filosóficos ou legais) (C2).");
  if (c3Nota < 160) pontosMelhoria.push("Aprofundar a relação de causa e efeito nos argumentos dos parágrafos de desenvolvimento (C3).");
  if (c4Nota < 160) pontosMelhoria.push("Diversificar os conectivos no início dos parágrafos (ex: 'Ademais', 'Outrossim', 'Portanto') (C4).");
  if (c5Nota < 200) pontosMelhoria.push("Garantir os 5 elementos da intervenção: Agente + Ação + Meio/Modo + Efeito + Detalhamento (C5).");

  return {
    tipo_resposta: "correcao_redacao_enem",
    tema_detectado: temaInformado || "Tema Geral ENEM",
    nota_final: notaTotal,
    competencias: [
      { numero: 1, nome: "Domínio da Norma Culta", nota: c1Nota, feedback: c1Feedback },
      { numero: 2, nome: "Compreensão do Tema e Repertório", nota: c2Nota, feedback: c2Feedback },
      { numero: 3, nome: "Projeto de Texto e Argumentação", nota: c3Nota, feedback: c3Feedback },
      { numero: 4, nome: "Coesão Textual e Conectivos", nota: c4Nota, feedback: c4Feedback },
      { numero: 5, nome: "Proposta de Intervenção", nota: c5Nota, feedback: c5Feedback },
    ],
    pontos_fortes: pontosFortes,
    pontos_melhoria: pontosMelhoria,
    sugestao_reescrita: "Para elevar sua nota rumo aos 900+ pontos, inicie o parágrafo de conclusão com 'Portanto,' e estruture a proposta com a fórmula completa: 'Cabe ao [Agente], por meio de [Meio/Modo], [Ação Prática], a fim de [Efeito/Finalidade], [Detalhamento Explicativo].'",
  };
}

function evaluateSingleCompetencyHeuristic(compNum: number, texto: string, tema?: string) {
  const lower = texto.toLowerCase();
  const totalWords = texto.trim().split(/\s+/).length;
  const paragraphs = texto.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  if (compNum === 1) {
    let nota = 160;
    let feedback = "Bom domínio da norma padrão da língua escrita, com estrutura sintática coesa e poucos desvios gramaticais.";
    if (totalWords < 50) {
      nota = 80;
      feedback = "Estrutura fragmentada ou texto muito curto para avaliar com precisão a sintaxe formal e a norma culta.";
    } else if (totalWords >= 120 && !lower.includes(" agente ") && !lower.includes(" nois ")) {
      nota = 200;
      feedback = "Excelente domínio da modalidade escrita formal, estrutura sintática impecável e precisão vocabular sem desvios.";
    }
    return {
      tipo_resposta: "competencia_individual",
      competencia_numero: 1,
      competencia_nome: "Competência 1: Domínio da Norma Culta da Língua Escrita",
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback,
      pontos_fortes: [
        "Registro formal consistente e pontuação adequada nos períodos.",
        "Vocabulário adequado à tipologia dissertativo-argumentativa.",
      ],
      pontos_melhoria: [
        "Atenção à regência e concordância em orações subordinadas complexas.",
        "Evite períodos excessivamente longos sem pausas convenientes.",
      ],
      sugestao_reescrita: "Substitua construções informais por estruturas na voz passiva sintética e períodos coordenados por conjunções precisas.",
      dica_de_ouro: "Revise sua redação do fim para o início para identificar pequenos desvios de concordância e pontuação que passam despercebidos durante a escrita.",
    };
  }

  if (compNum === 2) {
    const temRepertorio = lower.includes("constituição") || lower.includes("filósofo") || lower.includes("sociólogo") ||
      lower.includes("história") || lower.includes("século") || lower.includes("bauman") || lower.includes("habermas") ||
      lower.includes("kant") || lower.includes("foucault") || lower.includes("artigo") || lower.includes("ibge") ||
      lower.includes("dados") || lower.includes("pesquisa");
    let nota = temRepertorio ? 200 : 120;
    let feedback = temRepertorio
      ? "Repertório sociocultural legitimado e produtivo, articulado de maneira consistente ao tema proposto."
      : "O texto aborda o tema, mas carece de repertório sociocultural legitimado (filosofia, história, dados científicos ou legislação).";
    return {
      tipo_resposta: "competencia_individual",
      competencia_numero: 2,
      competencia_nome: "Competência 2: Compreensão da Proposta e Repertório Sociocultural",
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback,
      pontos_fortes: [
        "Compreensão clara dos termos do tema sem tangenciamento.",
        temRepertorio ? "Mobilização de área do conhecimento externa e legitimada." : "Respeito à tipologia dissertativo-argumentativa.",
      ],
      pontos_melhoria: [
        "Vincular todo repertório citado à tese por meio de conectivos explicativos.",
        "Garantir que a citação ou fato histórico seja produtivo para sustentar seu argumento.",
      ],
      sugestao_reescrita: "Para atingir 200 pontos, cite uma alusão histórica ou conceito filosófico (ex: Bauman, Cidadãos de Papel de Gilberto Dimenstein ou a Constituição de 1988) logo no início e retome no desenvolvimento.",
      dica_de_ouro: "O repertório precisa ter os 3 selos da banca: Legitimado (de uma área do saber), Pertinente (ao tema) e Produtivo (aplicado na argumentação).",
    };
  }

  if (compNum === 3) {
    let nota = 160;
    if (paragraphs.length >= 2 && (lower.includes("por conseguinte") || lower.includes("dessa forma") || lower.includes("nesse sentido"))) {
      nota = 200;
    }
    return {
      tipo_resposta: "competencia_individual",
      competencia_numero: 3,
      competencia_nome: "Competência 3: Projeto de Texto e Argumentação",
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback: "Projeto de texto com posicionamento claro, relações lógicas de causa e efeito e defesa consistente de ponto de vista.",
      pontos_fortes: [
        "Defesa clara de tese com argumentos organizados.",
        "Encadeamento lógico entre as premissas e a conclusão.",
      ],
      pontos_melhoria: [
        "Aprofundar a problematização: mostre por que o problema ainda persiste na sociedade.",
        "Evitar argumentos de senso comum sem embasamento factual ou teórico.",
      ],
      sugestao_reescrita: "Construa o parágrafo no modelo de 4 frases: Tópico Frasal + Repertório Legitimado + Discussão Crítica (Causa/Efeito) + Fechamento Reflexivo.",
      dica_de_ouro: "Projeto de texto nota 1000 prevê na introdução duas teses (A e B) e desenvolve exatamente a Tese A no D1 e a Tese B no D2.",
    };
  }

  if (compNum === 4) {
    const conectivos = ["portanto", "ademais", "outrossim", "além disso", "contudo", "entretanto", "nesse sentido", "dessa forma", "assim", "por conseguinte"];
    const qtd = conectivos.filter((c) => lower.includes(c)).length;
    let nota = qtd >= 3 ? 200 : qtd >= 1 ? 160 : 120;
    return {
      tipo_resposta: "competencia_individual",
      competencia_numero: 4,
      competencia_nome: "Competência 4: Coesão Textual e Mecanismos Linguísticos",
      nota,
      nivel: `Nível ${nota / 40} (${nota} pontos)`,
      feedback: `Emprego de conectivos e recursos coesivos inter e intraparágrafos para articular as ideias.`,
      pontos_fortes: [
        "Articulação entre os períodos com transições coesas.",
        "Boa variação de recursos anafóricos para evitar repetições vocabulares.",
      ],
      pontos_melhoria: [
        "Utilizar conectivos interparágrafos no início de cada parágrafo (ex: 'Em primeira análise', 'Ademais', 'Portanto').",
        "Evitar repetição de palavras próximas utilizando sinônimos ou pronomes.",
      ],
      sugestao_reescrita: "Inicie o segundo parágrafo de desenvolvimento com 'Ademais,' ou 'Outrossim,' e o parágrafo conclusivo com 'Portanto,'.",
      dica_de_ouro: "O ENEM exige no mínimo 2 conectivos interparágrafos (no início dos blocos) e vários conectivos intraparágrafos dentro das frases.",
    };
  }

  // Comp 5: Proposta de Intervenção
  const temAgente = lower.includes("ministério") || lower.includes("governo") || lower.includes("mec") || lower.includes("escola") || lower.includes("sociedade") || lower.includes("ong") || lower.includes("cabe a") || lower.includes("compete a") || lower.includes("poder público");
  const temAcao = lower.includes("promover") || lower.includes("criar") || lower.includes("desenvolver") || lower.includes("implementar") || lower.includes("realizar") || lower.includes("garantir") || lower.includes("investir");
  const temMeio = lower.includes("por meio") || lower.includes("através de") || lower.includes("mediante") || lower.includes("com o auxílio") || lower.includes("por intermédio");
  const temEfeito = lower.includes("a fim de") || lower.includes("para que") || lower.includes("com o intuito") || lower.includes("visando a") || lower.includes("de modo a");
  const temDetalhamento = texto.includes("(") || (texto.includes(",") && (lower.includes("como") || lower.includes("em parceria") || lower.includes("especialmente") || lower.includes("órgão responsável")));

  const elementosCount = [temAgente, temAcao, temMeio, temEfeito, temDetalhamento].filter(Boolean).length;
  const nota = Math.min(200, elementosCount * 40);

  return {
    tipo_resposta: "competencia_individual",
    competencia_numero: 5,
    competencia_nome: "Competência 5: Proposta de Intervenção Social",
    nota,
    nivel: `Nível ${elementosCount} (${nota} pontos - ${elementosCount} de 5 elementos)`,
    feedback: elementosCount === 5
      ? "Proposta de intervenção completa e nota máxima! Todos os 5 elementos (Agente, Ação, Meio/Modo, Efeito e Detalhamento) foram claramente identificados e respeitam os Direitos Humanos."
      : `Sua proposta de intervenção identificou ${elementosCount} dos 5 elementos exigidos pelo INEP. Cada elemento vale 40 pontos na matriz oficial.`,
    elementos_c5: {
      agente: { presente: temAgente, trecho: temAgente ? "Agente identificado (órgão público ou entidade responsável)" : null, comentario: temAgente ? "Agente explícito e legítimo." : "Faltou explicitar quem executará a medida (ex: Ministério da Educação, Poder Público)." },
      acao: { presente: temAcao, trecho: temAcao ? "Ação prática identificada no texto" : null, comentario: temAcao ? "Ação interventiva concreta e aplicável." : "Faltou explicitar o que deve ser feito na prática." },
      meio_modo: { presente: temMeio, trecho: temMeio ? "Meio/Modo identificado no texto" : null, comentario: temMeio ? "Modo/meio claro com conectivo instrumental." : "Faltou explicar COMO a medida será executada (use 'por meio de' ou 'mediante')." },
      efeito: { presente: temEfeito, trecho: temEfeito ? "Efeito/Finalidade identificada" : null, comentario: temEfeito ? "Finalidade expressa com foco na resolução do problema." : "Faltou a finalidade/impacto esperado (use 'a fim de' ou 'com o objetivo de')." },
      detalhamento: { presente: temDetalhamento, trecho: temDetalhamento ? "Detalhamento explicativo identificado" : null, comentario: temDetalhamento ? "Detalhamento válido de um dos elementos." : "Faltou um detalhamento adicional (ex: explicar o papel do agente entre vírgulas ou exemplificar a ação)." },
    },
    pontos_fortes: [
      "Alinhamento irrestrito aos Direitos Humanos.",
      elementosCount >= 3 ? "Intervenção articulada aos problemas levantados no tema." : "Intenção de solucionar a questão proposta.",
    ],
    pontos_melhoria: [
      ...(!temAgente ? ["Incluir um AGENTE legítimo com competência para a ação."] : []),
      ...(!temAcao ? ["Definir uma AÇÃO concreta e aplicável."] : []),
      ...(!temMeio ? ["Inserir o MEIO/MODO com o conectivo 'por meio de' ou 'mediante'."] : []),
      ...(!temEfeito ? ["Inserir o EFEITO/FINALIDADE com 'a fim de' ou 'para que'."] : []),
      ...(!temDetalhamento ? ["Adicionar um DETALHAMENTO explicando melhor o agente, a ação ou o meio."] : []),
    ],
    sugestao_reescrita: "Fórmula de ouro dos 200 pontos: 'Portanto, cabe ao Ministério da Educação [Agente], órgão responsável pelas diretrizes pedagógicas nacionais [Detalhamento do Agente], instituir oficinas e palestras [Ação], por meio de parcerias com especialistas [Meio], a fim de mitigar o problema e conscientizar a sociedade [Efeito].'",
    dica_de_ouro: "Lembre-se do mnemônico AAMED: Agente (Quem?), Ação (O quê?), Meio (Como?), Efeito (Para quê?) e Detalhamento (Explicação extra). 5 elementos = 200 pontos garantidos!",
  };
}

app.post("/api/analyze-essay", async (req, res) => {
  try {
    const { tema, texto } = req.body;

    const sanitizedTexto = sanitizeServerInput(texto || "");
    const sanitizedTema = sanitizeServerInput(tema || "");

    if (!sanitizedTexto || sanitizedTexto.length < 50) {
      return res.status(400).json({
        error: "Por favor, insira uma redação com pelo menos 50 caracteres para uma análise completa estilo ENEM.",
      });
    }

    const meaninglessCheck = isMeaninglessTextServer(sanitizedTexto);
    if (meaninglessCheck.isMeaningless) {
      return res.status(400).json({
        error: meaninglessCheck.reason || "O texto enviado não apresenta estrutura dissertativa compreensível.",
      });
    }

    const temaInformado = sanitizedTema || "Tema Geral / Não Especificado";
    let parsedData: any = null;

    try {
      const ai = getGenAIFromRequest(req);
      const prompt = `Analise a seguinte redação do aluno no modelo ENEM.
Tema Informado: "${temaInformado}"
Texto da Redação:
"""
${sanitizedTexto}
"""`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: ENEM_ESSAY_ANALYZER_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tipo_resposta: { type: Type.STRING },
              tema_detectado: { type: Type.STRING },
              nota_final: { type: Type.INTEGER },
              competencias: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    numero: { type: Type.INTEGER },
                    nome: { type: Type.STRING },
                    nota: { type: Type.INTEGER },
                    feedback: { type: Type.STRING },
                  },
                  required: ["numero", "nome", "nota", "feedback"],
                },
              },
              pontos_fortes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              pontos_melhoria: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sugestao_reescrita: { type: Type.STRING },
            },
            required: [
              "tipo_resposta",
              "tema_detectado",
              "nota_final",
              "competencias",
              "pontos_fortes",
              "pontos_melhoria",
              "sugestao_reescrita",
            ],
          },
        },
      });

      if (response && response.text) {
        try {
          parsedData = cleanAndRepairJson(response.text);
        } catch (parseErr) {
          console.warn("[/api/analyze-essay] Erro no parse do JSON reparado. Acionando fallback silencioso:", parseErr);
          parsedData = null;
        }
      }
    } catch (aiErr: any) {
      console.warn("[/api/analyze-essay] Gemini indisponível ou limite atingido. Usando motor heurístico ENEM com fallback silencioso:", aiErr?.message?.slice(0, 100));
      parsedData = evaluateEssayHeuristic(texto, temaInformado);
    }

    if (!parsedData || !parsedData.competencias || !Array.isArray(parsedData.competencias)) {
      parsedData = evaluateEssayHeuristic(texto, temaInformado);
    }

    // Backwards/forwards compatibility mapping for frontend UI
    const cList = Array.isArray(parsedData.competencias) ? parsedData.competencias : [];
    const getCompByNum = (num: number) => cList.find((c: any) => c.numero === num) || {
      numero: num,
      nome: `Competência ${num}`,
      nota: 160,
      feedback: "Análise concluída com conformidade aos parâmetros do exame.",
    };

    const c1 = getCompByNum(1);
    const c2 = getCompByNum(2);
    const c3 = getCompByNum(3);
    const c4 = getCompByNum(4);
    const c5 = getCompByNum(5);

    // CÁLCULO RIGOROSO DA NOTA TOTAL (0 A 1000): SOMA DAS 5 COMPETÊNCIAS (0 A 200 CADA)
    const notaTotalCalculada = Math.min(1000, Math.max(0, c1.nota + c2.nota + c3.nota + c4.nota + c5.nota));
    parsedData.nota_final = notaTotalCalculada;

    const formattedOutput = {
      ...parsedData,
      nota_final: notaTotalCalculada,
      nota_estimada_total: notaTotalCalculada,
      competencias: [c1, c2, c3, c4, c5],
      pontos_a_melhorar: parsedData.pontos_melhoria || parsedData.pontos_a_melhorar || [],
      dica_de_ouro: parsedData.sugestao_reescrita || parsedData.dica_de_ouro || "",
      competencias_obj: {
        c1_gramatica: c1,
        c2_repertorio: c2,
        c3_argumentacao: c3,
        c4_coesao: c4,
        c5_proposta_intervencao: c5,
      },
      aviso_legal: "Esta pontuação é uma estimativa calculada somando rigorosamente as 5 competências oficiais do ENEM (0 a 1000 pontos).",
    };

    res.json({
      success: true,
      data: formattedOutput,
    });
  } catch (error: any) {
    console.error("Erro na análise de redação ENEM:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Falha ao analisar redação. Tente novamente.",
    });
  }
});

// ENDPOINT: AVALIAÇÃO DE COMPETÊNCIA INDIVIDUAL DO ENEM (0 a 200 PONTOS)
app.post("/api/analyze-single-competency", async (req, res) => {
  try {
    const { competencia, tema, texto } = req.body;
    const compNum = Number(competencia) || 5;

    const sanitizedTexto = sanitizeServerInput(texto || "");
    const sanitizedTema = sanitizeServerInput(tema || "");

    if (!sanitizedTexto || sanitizedTexto.length < 20) {
      return res.status(400).json({
        error: "Por favor, insira o texto com pelo menos 20 caracteres para avaliar a competência selecionada.",
      });
    }

    const meaninglessCheck = isMeaninglessTextServer(sanitizedTexto);
    if (meaninglessCheck.isMeaningless) {
      return res.status(400).json({
        error: meaninglessCheck.reason || "O texto enviado não apresenta estrutura linguística compreensível.",
      });
    }

    const compNomes: Record<number, string> = {
      1: "Competência 1: Domínio da Norma Padrão da Língua Escrita",
      2: "Competência 2: Compreensão da Proposta de Redação e Repertório Sociocultural",
      3: "Competência 3: Seleção, Relação, Organização e Interpretação de Informações e Argumentos",
      4: "Competência 4: Demonstração de Conhecimento dos Mecanismos Linguísticos para Argumentação",
      5: "Competência 5: Elaboração de Proposta de Intervenção para o Problema Abordado",
    };
    const compNome = compNomes[compNum] || `Competência ${compNum}`;

    let parsedData: any = null;

    try {
      const ai = getGenAIFromRequest(req);
      const prompt = `Você é um avaliador oficial da banca de correção da redação do ENEM, especialista na ${compNome}.
Tema da Redação: "${sanitizedTema || 'Tema Geral do ENEM'}"
Texto/Trecho submetido pelo estudante:
"""
${sanitizedTexto}
"""

Avalie RIGOROSAMENTE este texto EXCLUSIVAMENTE sob a ótica da ${compNome}.
A nota DEVE ser um múltiplo exato de 40 pontos da matriz oficial do ENEM: 0, 40, 80, 120, 160 ou 200 pontos.

Se for a Competência 5 (Proposta de Intervenção), avalie com precisão a presença dos 5 elementos (40 pontos cada):
1. Agente (quem executa)
2. Ação (o que é feito)
3. Meio/Modo (como é feito - ex: por meio de, mediante)
4. Efeito/Finalidade (para que é feito - ex: a fim de, com o intuito de)
5. Detalhamento (explicação, exemplificação ou detalhamento do agente, ação, meio ou efeito)

Retorne EXCLUSIVAMENTE um objeto JSON válido sem markdown ou texto fora do JSON com a estrutura:
{
  "tipo_resposta": "competencia_individual",
  "competencia_numero": ${compNum},
  "competencia_nome": "${compNome}",
  "nota": 160,
  "nivel": "Nível 4 (160 pontos)",
  "feedback": "Justificativa detalhada e pedagógica sobre a nota atribuída nesta competência.",
  "elementos_c5": {
    "agente": { "presente": true, "trecho": "trecho do agente", "comentario": "comentário" },
    "acao": { "presente": true, "trecho": "trecho da ação", "comentario": "comentário" },
    "meio_modo": { "presente": true, "trecho": "trecho do meio", "comentario": "comentário" },
    "efeito": { "presente": true, "trecho": "trecho do efeito", "comentario": "comentário" },
    "detalhamento": { "presente": false, "trecho": null, "comentario": "comentário" }
  },
  "pontos_fortes": ["Ponto forte 1", "Ponto forte 2"],
  "pontos_melhoria": ["Ponto a melhorar 1", "Ponto a melhorar 2"],
  "sugestao_reescrita": "Sugestão prática de reescrita focada em alcançar os 200 pontos.",
  "dica_de_ouro": "Dica prática memorável para a hora da prova."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      });

      if (response && response.text) {
        try {
          parsedData = cleanAndRepairJson(response.text);
        } catch (parseErr) {
          console.warn("[/api/analyze-single-competency] Erro no parse do JSON reparado. Acionando fallback silencioso:", parseErr);
          parsedData = null;
        }
      }
    } catch (aiErr: any) {
      console.warn("[/api/analyze-single-competency] Gemini indisponível ou limite atingido. Usando heurística oficial com fallback silencioso:", aiErr?.message?.slice(0, 100));
      parsedData = evaluateSingleCompetencyHeuristic(compNum, texto, tema);
    }

    if (!parsedData || typeof parsedData.nota !== "number") {
      parsedData = evaluateSingleCompetencyHeuristic(compNum, texto, tema);
    }

    // Normalizar a nota para múltiplo de 40 e limite de 0 a 200
    let notaNormalizada = Math.min(200, Math.max(0, Math.round(parsedData.nota / 40) * 40));
    parsedData.nota = notaNormalizada;
    if (!parsedData.competencia_numero) parsedData.competencia_numero = compNum;
    if (!parsedData.competencia_nome) parsedData.competencia_nome = compNome;

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Erro na avaliação de competência individual:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Falha ao avaliar competência. Tente novamente.",
    });
  }
});


app.post("/api/user-progress", async (req, res) => {
  try {
    const { acao, acertosSeguidos, xpAtual } = req.body;
    const currentXp = typeof xpAtual === "number" ? xpAtual : 1450;
    const xpGanho = acao === "concluir_ciclo" ? 100 : 50;
    const novoTotalXp = currentXp + xpGanho;

    const streak = typeof acertosSeguidos === "number" ? acertosSeguidos + 1 : 10;
    const teveDesbloqueio = streak >= 10 || acao === "concluir_ciclo";

    const conquistasCatalog = [
      {
        id_conquista: "mira_laser",
        titulo: "Mira Laser!",
        descricao: "Você acertou 10 questões seguidas sem errar!",
        icone: "🎯",
      },
      {
        id_conquista: "mestre_do_foco",
        titulo: "Mestre do Foco!",
        descricao: "Você concluiu um ciclo completo de estudos hoje!",
        icone: "⚡",
      },
      {
        id_conquista: "gabaritador_enem",
        titulo: "Gabaritador ENEM!",
        descricao: "Você completou uma análise de redação estilo ENEM!",
        icone: "🏆",
      },
    ];

    const conquista = teveDesbloqueio
      ? (acao === "concluir_ciclo" ? conquistasCatalog[1] : conquistasCatalog[0])
      : {
          teve_desbloqueio: false,
          id_conquista: "",
          titulo: "",
          descricao: "",
          icone: "",
        };

    const responseJSON = {
      tipo_resposta: "progresso_usuario",
      xp_ganho: xpGanho,
      novo_total_xp: novoTotalXp,
      conquista_desbloqueada: {
        teve_desbloqueio: teveDesbloqueio,
        id_conquista: conquista.id_conquista,
        titulo: conquista.titulo,
        descricao: conquista.descricao,
        icone: conquista.icone,
      },
      mensagem_incentivo: `Parabéns! Você ganhou +${xpGanho} XP e subiu na classificação do MenteUp!`,
    };

    res.json({
      success: true,
      data: responseJSON,
    });
  } catch (error: any) {
    console.error("Erro na atualização de progresso:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao atualizar progresso do aluno.",
    });
  }
});

// 8. SYSTEM INSTRUCTION FOR ANALISTA DE DADOS E COACH DE PRODUTIVIDADE
const ANALYTICS_POMODORO_SYSTEM_INSTRUCTION = `Você é o Analista de Dados e Coach de Produtividade do MenteUp. 

Sua função é gerenciar o Dashboard de Desempenho e o Timer Pomodoro dos alunos, transformando métricas de estudo em dados visuais e recompensas.

REGRAS DE RESPOSTA (OBRIGATORIAMENTE JSON):

1. DASHBOARD DE DESEMPENHO:
   - Forneça uma lista de matérias com porcentagem de acerto e nível de maestria (Iniciante, Intermediário, Avançado, Crítico).
   - Identifique a "Matéria Crítica" (a que o aluno mais erra) para sugerir estudo imediato.

2. TIMER POMODORO GAMIFICADO:
   - Gerencie o status do timer (foco_ativo, descanso_curto, descanso_longo, interrompido).
   - Defina a recompensa em XP e MoedasVirtuais para cada ciclo de 25 minutos concluído com sucesso.

ESTRUTURA OBRIGATÓRIA DO JSON:
{
  "tipo_resposta": "analytics_foco",
  "dashboard": {
    "media_geral": 78.5,
    "materias": [
      { "nome": "Matemática", "acerto_porcentagem": 85, "nivel": "Avançado" },
      { "nome": "História", "acerto_porcentagem": 42, "nivel": "Crítico" }
    ],
    "sugestao_ia": "Seu desempenho em História caiu. Que tal um Flashcard de Revolução Industrial agora?"
  },
  "pomodoro": {
    "tempo_ciclo": 25,
    "status": "foco_ativo",
    "recompensa_conclusao": {
      "xp": 50,
      "moedas": 10
    },
    "punicao_saida": "Perda de 20 XP"
  }
}`;

app.post("/api/analytics-pomodoro", async (req, res) => {
  try {
    const { historicoEstudos, statusPomodoro } = req.body;
    const ai = getGenAIFromRequest(req);

    const promptText = `Análise do histórico do aluno: ${JSON.stringify(historicoEstudos || {})}. Status do pomodoro: ${statusPomodoro || "foco_ativo"}. Gerar relatório de análise de produtividade e foco.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: ANALYTICS_POMODORO_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipo_resposta: { type: Type.STRING },
            dashboard: {
              type: Type.OBJECT,
              properties: {
                media_geral: { type: Type.NUMBER },
                materias: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      nome: { type: Type.STRING },
                      acerto_porcentagem: { type: Type.NUMBER },
                      nivel: { type: Type.STRING },
                    },
                    required: ["nome", "acerto_porcentagem", "nivel"],
                  },
                },
                sugestao_ia: { type: Type.STRING },
              },
              required: ["media_geral", "materias", "sugestao_ia"],
            },
            pomodoro: {
              type: Type.OBJECT,
              properties: {
                tempo_ciclo: { type: Type.INTEGER },
                status: { type: Type.STRING },
                recompensa_conclusao: {
                  type: Type.OBJECT,
                  properties: {
                    xp: { type: Type.INTEGER },
                    moedas: { type: Type.INTEGER },
                  },
                  required: ["xp", "moedas"],
                },
                punicao_saida: { type: Type.STRING },
              },
              required: ["tempo_ciclo", "status", "recompensa_conclusao", "punicao_saida"],
            },
          },
          required: ["tipo_resposta", "dashboard", "pomodoro"],
        },
      },
    });

    const parsedData = cleanAndRepairJson(response.text) || {};
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Erro no analytics e pomodoro:", error);
    res.json({
      success: true,
      data: {
        tipo_resposta: "analytics_foco",
        dashboard: {
          media_geral: 78.5,
          materias: [
            { nome: "Matemática", acerto_porcentagem: 85, nivel: "Avançado" },
            { nome: "Português", acerto_porcentagem: 72, nivel: "Intermediário" },
            { nome: "História", acerto_porcentagem: 42, nivel: "Crítico" }
          ],
          sugestao_ia: "Seu desempenho em História está crítico. Que tal revisar um Flashcard de Revolução Industrial agora?"
        },
        pomodoro: {
          tempo_ciclo: 25,
          status: "foco_ativo",
          recompensa_conclusao: {
            xp: 50,
            moedas: 10
          },
          punicao_saida: "Perda de 20 XP"
        }
      }
    });
  }
});

// 9. SYSTEM INSTRUCTION FOR MOTOR DE CONTEÚDO E RETENÇÃO
const RETENCAO_CONTEUDO_SYSTEM_INSTRUCTION = `Você é o Motor de Conteúdo e Retenção do aplicativo MenteUp, especializado no ENEM e Vestibulares.

Sua função é processar a "Questão do Dia", gerenciar o "Caderno de Erros" do estudante e criar roteiros narrativos para as "Pílulas de Áudio" (podcasts curtos).

REGRAS DE CONTEÚDO E ESTRUTURA:

1. QUESTÃO DO DIA:
   - Gere 1 questão de alta relevância com 4 alternativas (A, B, C, D).
   - Defina uma recompensa de XP diária para incentivar o login do aluno.

2. CADERNO DE ERROS AUTOMÁTICO:
   - Quando o aluno errar uma questão, analise o motivo provável do erro (ex.: "Falta de Atenção", "Conceito Não Dominado", "Erro de Cálculo").
   - Crie uma "Mini-Dica de Ouro" para o aluno salvar na pasta de revisão.

3. PÍLULA DE ÁUDIO (ROTEIRO DE PODCAST):
   - Escreva um texto de narração direto, dinâmico e em tom de conversa de até 3 minutos (cerca de 200 a 250 palavras).
   - O texto deve ser formatado perfeitamente para leitura por sistemas de Voz IA (Text-to-Speech).

FORMATO DE RESPOSTA (OBRIGATORIAMENTE JSON):
Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido, sem qualquer texto expositivo antes ou depois.`;

app.post("/api/retencao-conteudo", async (req, res) => {
  try {
    const { materia, topico, erroAluno } = req.body;
    const ai = getGenAIFromRequest(req);

    const promptText = `Matéria solicitada: ${materia || "História"}. Tópico: ${topico || "Geral ENEM"}. Contexto/Erro anterior: ${erroAluno || "Nenhum erro registrado"}. Gerar questão do dia, análise para caderno de erros e roteiro para pílula de áudio.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        systemInstruction: RETENCAO_CONTEUDO_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tipo_resposta: { type: Type.STRING },
            questao_do_dia: {
              type: Type.OBJECT,
              properties: {
                materia: { type: Type.STRING },
                topico: { type: Type.STRING },
                xp_recompensa: { type: Type.INTEGER },
                pergunta: { type: Type.STRING },
                opcoes: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                  },
                  required: ["A", "B", "C", "D"],
                },
                resposta_correta: { type: Type.STRING },
                explicacao: { type: Type.STRING },
              },
              required: ["materia", "topico", "xp_recompensa", "pergunta", "opcoes", "resposta_correta", "explicacao"],
            },
            caderno_de_erros: {
              type: Type.OBJECT,
              properties: {
                diagnostico_erro: { type: Type.STRING },
                dica_revisao: { type: Type.STRING },
              },
              required: ["diagnostico_erro", "dica_revisao"],
            },
            pilula_de_audio: {
              type: Type.OBJECT,
              properties: {
                titulo: { type: Type.STRING },
                duracao_estimada: { type: Type.STRING },
                roteiro_voz: { type: Type.STRING },
              },
              required: ["titulo", "duracao_estimada", "roteiro_voz"],
            },
          },
          required: ["tipo_resposta", "questao_do_dia", "caderno_de_erros", "pilula_de_audio"],
        },
      },
    });

    const parsedData = cleanAndRepairJson(response.text) || {};
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Erro no módulo de retenção de conteúdo:", error);
    res.json({
      success: true,
      data: {
        tipo_resposta: "modulo_retencao",
        questao_do_dia: {
          materia: "História",
          topico: "Era Vargas",
          xp_recompensa: 50,
          pergunta: "Durante a Era Vargas (1930-1945), a criação do Departamento de Imprensa e Propaganda (DIP) em 1939 visava principalmente:",
          opcoes: {
            A: "Promover a censura dos meios de comunicação e a propaganda oficial do regime estadonavista.",
            B: "Incentivar a liberdade de expressão e o debate democrático na imprensa brasileira.",
            C: "Financiar produções cinematográficas independentes sem interferência governamental.",
            D: "Organizar as eleições diretas para o Congresso Nacional."
          },
          resposta_correta: "A",
          explicacao: "O DIP foi o órgão oficial do Estado Novo encarregado da censura e do culto à imagem de Getúlio Vargas."
        },
        caderno_de_erros: {
          diagnostico_erro: "Conceito Não Dominado",
          dica_revisao: "Lembre-se: O Estado Novo (1937-1945) foi a fase ditatorial da Era Vargas, marcada pelo DIP e pela censura de imprensa."
        },
        pilula_de_audio: {
          titulo: "Era Vargas em 3 minutos",
          duracao_estimada: "02:30",
          roteiro_voz: "Fala estudante! Preparado para gabaritar História no ENEM? Hoje vamos resumir a Era Vargas em apenas três minutos. Fique atento às três fases essenciais..."
        }
      }
    });
  }
});

// 7. SYSTEM INSTRUCTION FOR OFFICIAL FLASHCARDS GENERATOR
const FLASHCARDS_GENERATOR_SYSTEM_INSTRUCTION = `Você é o Gerador Oficial de Flashcards do aplicativo MenteUp, especialista em técnicas de memorização e repetição espaçada para o ENEM e Vestibulares.

Sua missão é criar cartões virtuais de estudo (Flashcards) curtos, diretos e objetivos a partir da matéria ou tópico solicitado pelo aluno.

REGRAS DE CONTEÚDO:
1. Frente do Card: Deve conter uma pergunta direta, um conceito incompleto ou uma fórmula.
2. Verso do Card: Deve conter a resposta exata de forma resumida e fácil de memorizar.
3. Dica (Opcional): Uma palavra-chave ou "gatilho de memória" para ajudar o aluno caso ele trave.
4. Linguagem: Didática, clara e adaptada para estudantes do Ensino Médio/ENEM.

FORMATO DE RESPOSTA (OBRIGATORIAMENTE JSON):
Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido, sem qualquer texto expositivo antes ou depois.

{
  "tipo_resposta": "geracao_flashcards",
  "materia": "Nome da Matéria",
  "topico": "Tópico Específico",
  "quantidade_cards": 3,
  "flashcards": [
    {
      "id": 1,
      "frente": "Pergunta ou conceito para a frente do cartão.",
      "verso": "Resposta exata e resumida para o verso.",
      "dica": "Lembrete rápido ou palavra-chave para memorização."
    },
    {
      "id": 2,
      "frente": "Pergunta ou conceito para a frente do cartão.",
      "verso": "Resposta exata e resumida para o verso.",
      "dica": "Lembrete rápido ou palavra-chave para memorização."
    }
  ]
}`;

app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { materia, topico, quantidade } = req.body;

    if (!materia || !topico) {
      return res.status(400).json({ error: "Por favor, informe a matéria e o tópico solicitado." });
    }

    const ai = getGenAIFromRequest(req);
    const qtdCards = typeof quantidade === "number" && quantidade > 0 ? quantidade : 5;

    const prompt = `Gere ${qtdCards} flashcards de estudo no MenteUp para:
Matéria: ${materia}
Tópico / Assunto: ${topico}

Retorne exclusivamente o JSON de geração de flashcards.`;

    const flashcardsSchema = {
      type: Type.OBJECT,
      properties: {
        tipo_resposta: { type: Type.STRING },
        materia: { type: Type.STRING },
        topico: { type: Type.STRING },
        quantidade_cards: { type: Type.INTEGER },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              frente: { type: Type.STRING },
              verso: { type: Type.STRING },
              dica: { type: Type.STRING },
            },
            required: ["id", "frente", "verso"],
          },
        },
      },
      required: ["tipo_resposta", "materia", "topico", "quantidade_cards", "flashcards"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: FLASHCARDS_GENERATOR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: flashcardsSchema,
      preferredModel: "gemini-2.5-flash",
    });

    const parsedData = cleanAndRepairJson(resultText) || {};

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.warn("Usando flashcards estruturados de contingência:", error?.message);
    res.json({
      success: true,
      data: {
        tipo_resposta: "geracao_flashcards",
        materia: req.body?.materia || "Geral",
        topico: req.body?.topico || "Revisão",
        quantidade_cards: 4,
        flashcards: [
          {
            id: 1,
            frente: `Qual é a ideia central de ${req.body?.topico || "este tema"}?`,
            verso: "Compreender os conceitos basilares, suas fórmulas e aplicações diretas nos enunciados dos vestibulares.",
            dica: "Dica: foque nas palavras-chave do enunciado!",
          },
          {
            id: 2,
            frente: "Como este conteúdo costuma ser cobrado no ENEM?",
            verso: "Geralmente associado a situações cotidianas, gráficos, tabelas ou análise contextualizada.",
            dica: "Dica: sempre elimine as duas alternativas absurdas primeiro.",
          },
          {
            id: 3,
            frente: "Qual erro mais comum dos estudantes nesse assunto?",
            verso: "Confundir unidades de medida ou esquecer de ler atentamente o comando da questão.",
            dica: "Dica: sublinhe o verbo de comando.",
          },
          {
            id: 4,
            frente: "Regra mnemônica de ouro para fixação rápida:",
            verso: "Revise em 24 horas, resolva 3 exercícios no mesmo dia e anote os pontos de dúvida no Caderno de Erros.",
            dica: "Dica: repetição espaçada é o segredo.",
          },
        ],
      },
    });
  }
});

// 8. SYSTEM INSTRUCTION FOR GABI DATA MANAGER & RANKING ASSISTANT
const GABI_DATA_MANAGER_SYSTEM_INSTRUCTION = `Você é a "Gabi", assistente e gerenciadora de dados do aplicativo MenteUp.

Sua função é retornar os dados estruturados para a interface do usuário, garantindo a personalização de tema visual (Modo Claro/Escuro) e a atualização correta da Tabela de Ranking entre Amigos.

REGRAS E ESTRUTURA DE RESPOSTA:
1. Responda EXCLUSIVAMENTE em formato JSON válido.
2. Sem textos introdutórios ou explicações fora do JSON.

### ESTRUTURA OBRIGATÓRIA DO JSON:

{
  "tipo_resposta": "painel_usuario_ranking",
  "configuracoes_interface": {
    "tema_preferido": "dark",
    "mensagem_boas_vindas": "Modo Noturno ativado! Excelente escolha para proteger sua visão nos estudos noturnos."
  },
  "ranking_amigos": {
    "posicao_usuario": 2,
    "total_amigos": 5,
    "lista_ranking": [
      {
        "posicao": 1,
        "nome": "Lucas Silva",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "xp_semanal": 1850,
        "sequencia_dias": 12,
        "eh_usuario_atual": false
      },
      {
        "posicao": 2,
        "nome": "Você",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        "xp_semanal": 1500,
        "sequencia_dias": 7,
        "eh_usuario_atual": true
      },
      {
        "posicao": 3,
        "nome": "Beatriz Lima",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "xp_semanal": 1320,
        "sequencia_dias": 5,
        "eh_usuario_atual": false
      }
    ]
  },
  "desafio_extra_ranking": {
    "titulo": "Rival da Semana",
    "descricao": "Você está a apenas 350 XP de ultrapassar Lucas Silva! Complete 2 simulados hoje para assumir a liderança.",
    "recompensa_xp_bonus": 100
  }
}`;

app.post("/api/gabi-ranking", async (req, res) => {
  try {
    const { tema_preferido, user_xp, user_streak } = req.body;

    const ai = getGenAIFromRequest(req);

    const prompt = `Gere o painel do usuário e ranking de amigos da Gabi para o MenteUp.
Preferência de Tema Solicitada: "${tema_preferido || 'dark'}"
XP Atual do Usuário: ${user_xp || 1500}
Sequência de Dias Atual: ${user_streak || 7}

Retorne exclusivamente o JSON de painel_usuario_ranking.`;

    const rankingSchema = {
      type: Type.OBJECT,
      properties: {
        tipo_resposta: { type: Type.STRING },
        configuracoes_interface: {
          type: Type.OBJECT,
          properties: {
            tema_preferido: { type: Type.STRING },
            mensagem_boas_vindas: { type: Type.STRING },
          },
          required: ["tema_preferido", "mensagem_boas_vindas"],
        },
        ranking_amigos: {
          type: Type.OBJECT,
          properties: {
            posicao_usuario: { type: Type.INTEGER },
            total_amigos: { type: Type.INTEGER },
            lista_ranking: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  posicao: { type: Type.INTEGER },
                  nome: { type: Type.STRING },
                  avatar: { type: Type.STRING },
                  xp_semanal: { type: Type.INTEGER },
                  sequencia_dias: { type: Type.INTEGER },
                  eh_usuario_atual: { type: Type.BOOLEAN },
                },
                required: ["posicao", "nome", "avatar", "xp_semanal", "sequencia_dias", "eh_usuario_atual"],
              },
            },
          },
          required: ["posicao_usuario", "total_amigos", "lista_ranking"],
        },
        desafio_extra_ranking: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING },
            descricao: { type: Type.STRING },
            recompensa_xp_bonus: { type: Type.INTEGER },
          },
          required: ["titulo", "descricao", "recompensa_xp_bonus"],
        },
      },
      required: ["tipo_resposta", "configuracoes_interface", "ranking_amigos", "desafio_extra_ranking"],
    };

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      systemInstruction: GABI_DATA_MANAGER_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: rankingSchema,
      preferredModel: "gemini-2.5-flash",
    });

    const parsedData = cleanAndRepairJson(resultText) || {};

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.warn("Usando ranking de contingência pedagógico:", error?.message);
    res.json({
      success: true,
      data: {
        tipo_resposta: "painel_usuario_ranking",
        configuracoes_interface: {
          tema_preferido: req.body?.tema_preferido || "dark",
          mensagem_boas_vindas: "Ranking de amigos atualizado com sucesso! Continue pontuando.",
        },
        ranking_amigos: {
          posicao_usuario: 2,
          total_amigos: 5,
          lista_ranking: [
            {
              posicao: 1,
              nome: "Lucas Silva",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              xp_semanal: 1850,
              sequencia_dias: 12,
              eh_usuario_atual: false,
            },
            {
              posicao: 2,
              nome: "Você",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              xp_semanal: Number(req.body?.user_xp) || 1500,
              sequencia_dias: Number(req.body?.user_streak) || 7,
              eh_usuario_atual: true,
            },
            {
              posicao: 3,
              nome: "Beatriz Lima",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
              xp_semanal: 1320,
              sequencia_dias: 5,
              eh_usuario_atual: false,
            },
          ],
        },
        desafio_extra_ranking: {
          titulo: "Rival da Semana",
          descricao: "Você está a apenas 350 XP de ultrapassar o 1º lugar! Complete 1 simulado hoje para avançar.",
          recompensa_xp_bonus: 100,
        },
      },
    });
  }
});

// 9. SYSTEM INSTRUCTION FOR BATALHA QUIZ X1
const BATALHA_QUIZ_SYSTEM_INSTRUCTION = `Você é a "Gabi", assistente e mestre de testes do MenteUp.
Sua função é gerar um JSON estruturado no formato obrigatório "batalha_quiz_x1" contendo exatamente 5 questões desafiadoras de múltipla escolha para uma disputa de conhecimentos entre dois alunos (Modo X1 do ENEM/Vestibulares).

DIRETRIZES DE VARIABILIDADE E NÃO-REPETIÇÃO:
1. NUNCA repita as mesmas perguntas ou temas óbvios. Use enunciados inéditos e criativos.
2. Varie os estilos das 5 questões: problemas do cotidiano, análise de conceitos, pegadinhas conceituais sutis e aplicações práticas interdisciplinares.
3. Distribua as respostas corretas de maneira balanceada entre as alternativas (A, B, C, D, E).
4. Responda EXCLUSIVAMENTE em formato JSON válido.`;

const BATTLE_TOPICS_POOL: Record<string, string[]> = {
  "Matemática": ["Geometria Espacial", "Probabilidade e Combinatória", "Funções e Gráficos", "Matemática Financeira", "Estatística e Médias", "Trigonometria e Ângulos"],
  "Física": ["Eletrodinâmica e Circuitos", "Ondulatória e Som", "Cinemática e Lançamentos", "Termologia e Calorimetria", "Óptica Geométrica", "Gravitação Universal"],
  "Química": ["Química Orgânica e Reações", "Estequiometria e Soluções", "Equilíbrio Químico", "Eletroquímica e Pilhas", "Tabela Periódica e Ligações", "Termoquímica"],
  "Biologia": ["Genética e Biotecnologia", "Ecologia e Impactos Ambientais", "Fisiologia Humana e Imunologia", "Citologia e Metabolismo", "Evolução das Espécies", "Botânica"],
  "História": ["Era Vargas e Cidadania", "Segunda Guerra Mundial", "Brasil Colônia e Escravidão", "Guerra Fria e Geopolítica", "Ditadura Civil-Militar", "Revolução Francesa"],
  "Geografia": ["Urbanização e Megacidades", "Biomas Brasileiros e Agro", "Geopolítica dos Conflitos Mundiais", "Climatologia e Mudanças Globais", "Demografia e Migrações"],
  "Português": ["Variação Linguística e Preconceito", "Modernismo e Vanguardas", "Figuras de Linguagem", "Sintaxe e Regência Verbal", "Intertextualidade e Ironia"],
  "Filosofia": ["Contratualismo (Hobbes, Locke, Rousseau)", "Ética Aristotélica e Kantiana", "Existencialismo", "Cidadania e Política"],
  "Sociologia": ["Modernidade Líquida de Bauman", "Desigualdade Social no Brasil", "Cultura de Massa e Mídias", "Trabalho e Globalização"],
  "Geral": ["Conhecimentos Gerais do ENEM", "Interdisciplinaridade Ciências e Humanas", "Atualidades e Sustentabilidade", "Ciência e Tecnologia Contemporânea"]
};

function shuffleOptionsArray(options: string[], correctIndex: number) {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return { opcoes: options || [], resposta_correta_index: correctIndex || 0 };
  }
  const cleanOptions = options.map((opt) => opt.replace(/^[A-E]\)\s*/, "").trim());
  const safeIdx = Math.max(0, Math.min(correctIndex || 0, cleanOptions.length - 1));
  const correctText = cleanOptions[safeIdx];

  const shuffled = [...cleanOptions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const newCorrectIndex = shuffled.findIndex((opt) => opt === correctText);
  const letters = ["A", "B", "C", "D", "E"];
  const formatted = shuffled.map((opt, idx) => `${letters[idx]}) ${opt}`);

  return {
    opcoes: formatted,
    resposta_correta_index: newCorrectIndex !== -1 ? newCorrectIndex : 0,
  };
}

app.post("/api/generate-quiz-battle", async (req, res) => {
  try {
    const { materia, topico, criador } = req.body;
    const ai = getGenAI();

    const battleId = `x1-${Math.random().toString(36).substring(2, 9)}`;
    const materiaName = materia || "Geral";
    const creatorName = criador || "Você";

    // Sortear subtema aleatório da lista para garantir não repetição
    const matchedPool = Object.entries(BATTLE_TOPICS_POOL).find(([key]) => 
      materiaName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(materiaName.toLowerCase())
    );
    const pool = matchedPool ? matchedPool[1] : BATTLE_TOPICS_POOL["Geral"];
    const randomSubtopic = pool[Math.floor(Math.random() * pool.length)];
    const topicoName = topico && topico.trim() !== "" ? topico : randomSubtopic;

    // Seed aleatória única por requisição
    const randomSeed = Math.floor(Math.random() * 1000000);
    const styles = ["problema prático contextualizado", "análise de conceito avançado", "situação-problema do cotidiano", "aplicação interdisciplinar"];
    const chosenStyle = styles[Math.floor(Math.random() * styles.length)];

    const prompt = `Gere uma Batalha Quiz X1 com 5 questões 100% inéditas para o MenteUp.
Matéria: ${materiaName}
Tópico Sorteado: ${topicoName}
ID da Batalha: ${battleId}
Criador: ${creatorName}
Seed de Variabilidade Aleatória: ${randomSeed}
Estilo de enunciado predominante: ${chosenStyle}

INSTRUÇÕES CRÍTICAS DE DIVERSIDADE:
- NÃO repita perguntas clichês ou básicas já vistas.
- Varie os contextos de cada uma das 5 questões (ex: saúde, tecnologia, sustentabilidade, cotidiano, indústria).
- Varie a dificuldade: 1 fácil, 3 médias e 1 difícil/desafiadora.
- Alterne as letras das respostas corretas para não ficarem todas na mesma posição.

Gere o JSON estrito com "tipo_resposta": "batalha_quiz_x1", id_batalha, materia, topico, criador, recompensa_xp (100) e o array de 5 questoes.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        tipo_resposta: { type: Type.STRING },
        id_batalha: { type: Type.STRING },
        materia: { type: Type.STRING },
        topico: { type: Type.STRING },
        criador: { type: Type.STRING },
        recompensa_xp: { type: Type.INTEGER },
        questoes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              pergunta: { type: Type.STRING },
              opcoes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              resposta_correta_index: { type: Type.INTEGER },
              explicacao: { type: Type.STRING },
            },
            required: ["id", "pergunta", "opcoes", "resposta_correta_index", "explicacao"],
          },
        },
      },
      required: ["tipo_resposta", "id_batalha", "materia", "topico", "criador", "recompensa_xp", "questoes"],
    };

    let battleData: any = null;

    try {
      const responseSafe = await callGeminiSafe(ai, {
        contents: prompt,
        systemInstruction: BATALHA_QUIZ_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8, // Variabilidade alta solicitada
        timeoutMs: 8000,
      });
      battleData = cleanAndRepairJson(responseSafe.text) || {};
    } catch (apiErr) {
      console.warn("IA indisponível para quiz battle, usando gerador dinâmico de contingência com shuffle:", apiErr);
      // Fallback dinâmico com randomização garantida
      battleData = {
        tipo_resposta: "batalha_quiz_x1",
        id_batalha: battleId,
        materia: materiaName,
        topico: topicoName,
        criador: creatorName,
        recompensa_xp: 100,
        questoes: [
          {
            id: 1,
            pergunta: `[Desafio ${materiaName} - ${topicoName}] Em relação a esse conteúdo, qual das afirmações reflete com maior precisão os fundamentos científicos modernos?`,
            opcoes: [
              "A) A correlação entre os modelos conceituais e a verificação empírica orienta a resolução de problemas.",
              "B) Os fenômenos ocorrem de forma estática sem influência de fatores ambientais ou variáveis externas.",
              "C) As leis fundamentais da disciplina aplicam-se exclusivamente em experimentos de laboratório isolados.",
              "D) Não há aplicabilidade prática desse tema no cotidiano tecnológico ou social atual.",
              "E) Os dados estatísticos anulam a necessidade de fundamentação teórica prévia."
            ],
            resposta_correta_index: 0,
            explicacao: "A metodologia científica contemporânea exige a integração contínua entre hipóteses teóricas e análise empírica contextualizada."
          },
          {
            id: 2,
            pergunta: `Qual é o papel das variáveis de controle na análise de problemas de ${topicoName}?`,
            opcoes: [
              "A) Isolar fatores interferentes para que a relação de causa e efeito seja avaliada com rigor.",
              "B) Eliminar qualquer possibilidade de coleta de dados numéricos.",
              "C) Acelerar artificialmente o tempo de observação sem registrar variações.",
              "D) Garantir que todos os resultados sejam previamente idênticos.",
              "E) Substituir a necessidade de medições ou estimativas matemáticas."
            ],
            resposta_correta_index: 0,
            explicacao: "Variáveis de controle servem para manter condições estáveis e assegurar que a alteração observada decorra da variável independente sob teste."
          },
          {
            id: 3,
            pergunta: `Em exames seletivos como o ENEM, questões sobre ${topicoName} costumam cobrar prioritariamente:`,
            opcoes: [
              "A) A interpretação de gráficos e textos aplicando o conceito a um problema prático da sociedade.",
              "B) A memorização de datas e fórmulas extensas sem contextualização.",
              "C) O cálculo mental rápido sem apresentação de raciocínio lógico.",
              "D) Apenas definições de dicionário decoradas sem interpretação.",
              "E) Respostas monossilábicas sem embasamento argumentativo."
            ],
            resposta_correta_index: 0,
            explicacao: "A Matriz de Referência do ENEM prioriza competências e habilidades: leitura de tabelas, gráficos e solução de situações-problema reais."
          },
          {
            id: 4,
            pergunta: `Ao confrontar dois pontos de vista distintos sobre ${topicoName}, a melhor postura de análise crítica é:`,
            opcoes: [
              "A) Avaliar os dados, a coerência dos argumentos e as fontes científicas que embasam cada posição.",
              "B) Escolher a resposta com texto mais curto sem ler o enunciado.",
              "C) Desconsiderar qualquer dado contrário à opinião pessoal inicial.",
              "D) Presumir que afirmações contendo termos complexos são sempre verdadeiras.",
              "E) Ignorar as premissas e focar apenas nas conclusões preliminares."
            ],
            resposta_correta_index: 0,
            explicacao: "A análise crítica fundamenta-se no exame das evidências, validade metodológica e coerência lógica da argumentação."
          },
          {
            id: 5,
            pergunta: `Na resolução de questões desafiadoras de ${materiaName}, um passo inicial estratégico indispensável é:`,
            opcoes: [
              "A) Identificar claramente o comando da questão e as grandezas/conceitos fornecidos pelo texto-base.",
              "B) Tentar aplicar fórmulas aleatórias antes de entender o enunciado.",
              "C) Pular direto para as alternativas para tentar adivinhar a letra correta.",
              "D) Marcar a primeira alternativa que parecer familiar sem checar as demais.",
              "E) Ignorar as unidades de medida informadas no enunciado."
            ],
            resposta_correta_index: 0,
            explicacao: "Compreender o comando e filtrar os dados essenciais é o primeiro passo para estruturar uma resolução consistente e livre de distratores."
          }
        ]
      };
    }

    if (battleData && Array.isArray(battleData.questoes)) {
      battleData.questoes = battleData.questoes.map((q: any) => {
        const shuffled = shuffleOptionsArray(q.opcoes, q.resposta_correta_index);
        return {
          ...q,
          opcoes: shuffled.opcoes,
          resposta_correta_index: shuffled.resposta_correta_index,
        };
      });
    }

    res.json({
      success: true,
      data: battleData,
    });
  } catch (error: any) {
    console.error("Erro ao gerar batalha quiz x1:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao gerar a batalha quiz.",
    });
  }
});

// 10. SYSTEM INSTRUCTION FOR SCANNER TIRA-DÚVIDAS (RESPOSTAS INTELIGENTES E ADAPTATIVAS)
function sanitizeServerInput(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";
  return rawText
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{4,}/g, "   ")
    .trim();
}

function isMeaninglessTextServer(text: string): { isMeaningless: boolean; reason?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isMeaningless: true, reason: "O texto enviado está vazio." };
  }

  // Remove pontuações e símbolos comuns
  const alphanumericOnly = trimmed.replace(/[\s.,;:!?@#$%&*()_+=\-[\]{}|\\/<>~`^'"]/g, "");
  if (alphanumericOnly.length === 0) {
    return {
      isMeaningless: true,
      reason: "O texto contém apenas pontuações, símbolos ou caracteres não textuais.",
    };
  }

  // Sequências mecânicas de caractere repetido (ex: "aaaaaaaaaa" ou "1111111111")
  const collapsed = trimmed.replace(/\s+/g, "");
  if (collapsed.length >= 6) {
    const firstChar = collapsed[0];
    if (collapsed.split("").every((c) => c === firstChar)) {
      return {
        isMeaningless: true,
        reason: "O texto contém sequências repetitivas de um único caractere.",
      };
    }
  }

  // Teclado martelado longo sem vogais (ex: "asdfghjklasdfg")
  if (alphanumericOnly.length > 15) {
    const vowels = alphanumericOnly.match(/[aeiouyáéíóúãõâêîôûà]/gi);
    const vowelRatio = vowels ? vowels.length / alphanumericOnly.length : 0;
    if (vowelRatio < 0.08) {
      return {
        isMeaningless: true,
        reason: "O texto não parece conter termos ou palavras estruturadas compreensíveis.",
      };
    }
  }

  return { isMeaningless: false };
}

function isGreetingOrInformalServer(text: string): boolean {
  if (!text) return false;
  const clean = text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[!?,.;:\-_()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return false;

  const exactGreetings = new Set([
    'oi', 'oie', 'ola', 'opa', 'opaa', 'e ai', 'eai', 'e aii',
    'tudo bem', 'tudo bom', 'tudo certo', 'tudo joia', 'tudo sussa', 'tudo legal',
    'como vai', 'como voce esta', 'como vc esta', 'como vc ta', 'como vai voce',
    'bom dia', 'boa tarde', 'boa noite',
    'fala ai', 'fala tu', 'salve', 'salve salve', 'hello', 'hi', 'hey',
    'obrigado', 'obrigada', 'valeu', 'valeuu', 'muito obrigado', 'muito obrigada',
    'show', 'show de bola', 'beleza', 'blz', 'perfeito', 'otimo',
    'professora', 'profa', 'gabi',
    'oi gabi', 'ola gabi', 'oi professora', 'ola professora',
    'oi profa', 'ola profa', 'professora gabi', 'profa gabi',
    'oi tudo bem', 'ola tudo bem', 'oi gabi tudo bem', 'ola gabi tudo bem',
    'oi boa tarde', 'oi bom dia', 'oi boa noite', 'ola bom dia', 'ola boa tarde', 'ola boa noite',
    'quem e voce', 'quem e vc', 'quem e a professora gabi', 'qual seu nome', 'qual e seu nome', 'qual e o seu nome',
    'o que voce faz', 'oque voce faz', 'como voce funciona', 'como funciona',
    'ajuda', 'socorro', 'preciso de ajuda', 'me ajuda', 'pode me ajudar', 'como voce pode me ajudar',
    'teste', 'testando'
  ]);

  if (exactGreetings.has(clean)) return true;

  // Letras repetidas como 'oiii', 'olaaa', 'heyyy'
  const collapsed = clean.replace(/(.)\1+/g, '$1');
  if (exactGreetings.has(collapsed)) return true;

  const greetingStarts = [
    'oi ', 'ola ', 'oie ', 'opa ', 'e ai ', 'eai ', 'fala ', 'salve ',
    'bom dia', 'boa tarde', 'boa noite'
  ];

  const academicWords = [
    'calcule', 'determine', 'encontre', 'quantos', 'quanto', 'resolva', 'qual e a formula',
    'equacao', 'funcao', 'vestibular', 'enem', 'alternativa', 'assinale', 'justifique',
    'f(x)', 'aceleracao', 'velocidade', 'estequiometria', 'termodinamica'
  ];

  const hasAcademic = academicWords.some((w) => clean.includes(w));

  if (clean.length < 55 && greetingStarts.some((g) => clean.startsWith(g)) && !hasAcademic) {
    return true;
  }

  if ((clean.includes('tudo bem') || clean.includes('como vai') || clean.includes('como voce esta')) && !hasAcademic && clean.length < 50) {
    return true;
  }

  return false;
}

function getConversationalGreetingResponseServer(text: string): string {
  const clean = (text || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('obrigad') || clean.includes('valeu')) {
    return 'De nada! Fico muito feliz em ajudar nos seus estudos. Sempre que tiver dúvidas de qualquer matéria ou quiser resolver questões, conte comigo!';
  }

  if (clean.includes('quem e') || clean.includes('qual seu nome') || clean.includes('qual e seu nome')) {
    return 'Oii! Sou a Professora Gabi, sua mentora inteligente no MenteUp! Estou aqui para te explicar matérias escolares, tirar dúvidas do cotidiano e resolver exercícios passo a passo para o ENEM e vestibulares. Como posso te ajudar agora?';
  }

  if (clean.includes('tudo bem') || clean.includes('como vai') || clean.includes('como voce esta') || clean.includes('como vc ta')) {
    return 'Tudo ótimo por aqui, e com você? Pronta para te ajudar com seus estudos! Você pode me mandar qualquer dúvida, exercício escolar ou enviar a foto de uma questão que resolvemos juntos!';
  }

  if (clean.includes('o que voce faz') || clean.includes('pode me ajudar') || clean.includes('como voce pode')) {
    return 'Eu posso te ajudar de várias formas: tirando dúvidas sobre qualquer tema, explicando conceitos difíceis com didática simples, resolvendo questões em 3 passos pedagógicos e analisando fotos de exercícios da sua apostila ou prova. O que você gostaria de ver hoje?';
  }

  return 'Oii! Sou a Professora Gabi, sua mentora inteligente no MenteUp! Como posso te ajudar hoje? Envie suas dúvidas teóricas, exercícios escolares ou a foto de uma questão para estudarmos juntos!';
}

const RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION = `Você é a Professora Gabi, tutora inteligente e assistente educacional no MenteUp.
Sua comunicação deve ser natural, simpática, acolhedora e inteligente, adaptando-se com precisão ao tipo de mensagem do usuário.

IMPORTANTE: NEM TODA MENSAGEM DO USUÁRIO É UMA DÚVIDA DE MATÉRIA ESCOLAR OU EXERCÍCIO DE PROVA!
O usuário pode mandar saudações simples ("Oi", "Olá", "Tudo bem?"), perguntas livres, curiosidades ou exercícios de prova.
Você DEVE identificar a intenção real e responder no estilo apropriado:

1. SAUDAÇÕES, CUMPRIMENTOS OU CONVERSAS INFORMAIS (ex: "Oi", "Olá", "Tudo bem?", "Bom dia", "Boa tarde", "Boa noite", "E aí", "Valeu", "Obrigado", "Quem é você?", "Como você pode me ajudar?"):
   - Responda de forma direta, amigável e conversacional como a Professora Gabi em um chat normal.
   - NUNCA use introduções burocráticas ou fórmulas pré-formatadas como "Aqui está a explicação sobre sua dúvida: 'Oi'" ou "Tema compreendido e esclarecido".
   - NÃO force explicações acadêmicas, fórmulas ou conceitos escolares para um cumprimento simples.
   - Defina "categoria": "cumprimento" e "tipo_resposta": "conversacional".
   - Preencha o campo "resposta_direta" com sua resposta acolhedora em linguagem natural.
   - Deixe os campos "passo1_compreensao", "passo2_formula_conceito", "passo3_resolucao_guiada", "gabarito_final", "gabarito_resposta_final" e "conceito_chave" como strings vazias ("").
   - Defina "materia": "Conversa & Boas-Vindas".

2. CURIOSIDADES, PERGUNTAS LIVRES E CONHECIMENTOS GERAIS (ex: "Por que o céu é azul?", "Como funciona a gravidade?", "Quem inventou o avião?", "Dicas para não procrastinar"):
   - Responda de forma clara, interessante e didática diretamente no campo "resposta_direta".
   - Defina "categoria": "conhecimentos_gerais" e "tipo_resposta": "conhecimentos_gerais".
   - Defina "gabarito_resposta_final" com uma síntese direta e "dica_rapida" com uma dica prática.
   - Deixe as etapas rígidas de exercício de prova vazias se não for um exercício.

3. EXERCÍCIOS ESCOLARES, QUESTÕES DE PROVA OU ENEM/VESTIBULARES (ex: cálculos matemáticos/físicos/químicos, questões de múltipla escolha A-E, interpretação acadêmica):
   - Estruture a resolução didática:
     * Passo 1 ("passo1_compreensao"): Identificação das variáveis e comando da questão.
     * Passo 2 ("passo2_formula_conceito"): Fórmula ou lei científica aplicável.
     * Passo 3 ("passo3_resolucao_guiada"): Aplicação guiada e cálculo passo a passo.
     * Gabarito final objetivo em "gabarito_final".
   - Defina "categoria": "exercicio" e "tipo_resposta": "exercicio_3passos".

4. IMAGEM ILEGÍVEL:
   - Se uma imagem foi anexada e estiver escura, cortada ou ilegível:
     * "foto_ilegivel": true
     * "mensagem_erro_ilegivel": "Ops! Não consegui ler bem a imagem da foto. Tente tirar outra foto mais nítida e bem iluminada! 📸"

ESTRUTURA DA RESPOSTA (FORMATO JSON OBRIGATÓRIO):
{
  "categoria": "cumprimento | conhecimentos_gerais | exercicio",
  "tipo_resposta": "conversacional | conhecimentos_gerais | exercicio_3passos",
  "foto_ilegivel": false,
  "mensagem_erro_ilegivel": "",
  "materia": "Área correspondente (ex: Conversa & Boas-Vindas, Física, Biologia, História...)",
  "transcricao_enunciado": "Texto ou questão enviada pelo usuário.",
  "conceito_chave": "Conceito central (vazio se for cumprimento)",
  "resposta_direta": "Resposta conversacional para saudações/curiosidades ou síntese explicativa.",
  "resolucao_passo_a_passo": "Resolução guiada (apenas para exercícios acadêmicos).",
  "gabarito_resposta_final": "Conclusão objetiva (vazio se for cumprimento).",
  "passo1_compreensao": "",
  "passo2_formula_conceito": "",
  "passo3_resolucao_guiada": "",
  "gabarito_final": "",
  "dica_rapida": "Dica prática de estudo ou curiosidade relevante."
}`;

app.post("/api/solve-question", async (req, res) => {
  try {
    const { duvida, imagemBase64 } = req.body;

    const sanitizedDuvida = sanitizeServerInput(duvida || "");
    const hasImage = !!(imagemBase64 && typeof imagemBase64 === "string" && imagemBase64.trim().length > 100);

    // Se não há nem imagem nem texto útil, bloqueie imediatamente
    if (!sanitizedDuvida && !hasImage) {
      return res.status(400).json({
        error: "Por favor, envie uma dúvida com texto válido ou anexe a foto de uma questão.",
      });
    }

    // Se enviou texto sem imagem, valide se não são caracteres inválidos/espúrios
    if (!hasImage) {
      if (sanitizedDuvida.length < 2) {
        return res.status(400).json({
          error: "A mensagem é muito curta. Digite uma dúvida ou questão com enunciado compreensível.",
        });
      }

      const meaninglessCheck = isMeaninglessTextServer(sanitizedDuvida);
      if (meaninglessCheck.isMeaningless) {
        return res.status(400).json({
          error: meaninglessCheck.reason || "Por favor, digite uma questão ou dúvida com palavras inteligíveis.",
        });
      }
    }

    const isGreeting = isGreetingOrInformalServer(sanitizedDuvida || "");

    // Se for uma saudação ou cumprimento puro sem imagem, responda imediatamente de forma calorosa e conversacional
    if (isGreeting && !hasImage) {
      const greetingResponse = getConversationalGreetingResponseServer(sanitizedDuvida || "");
      return res.json({
        success: true,
        data: {
          categoria: "cumprimento",
          tipo_resposta: "conversacional",
          foto_ilegivel: false,
          mensagem_erro_ilegivel: "",
          materia: "Conversa & Boas-Vindas",
          transcricao_enunciado: sanitizedDuvida || "Olá!",
          conceito_chave: "",
          resposta_direta: greetingResponse,
          resolucao_passo_a_passo: "",
          gabarito_resposta_final: "",
          passo1_compreensao: "",
          passo2_formula_conceito: "",
          passo3_resolucao_guiada: "",
          gabarito_final: "",
          dica_rapida: "Você pode me mandar uma dúvida sobre qualquer matéria ou anexar a foto de uma questão para resolvermos juntos!",
        },
      });
    }

    let parsedData: any = null;
    try {
      const ai = getGenAIFromRequest(req);
      let contents: any[] = [];

      if (hasImage) {
        // Clean data url prefix if present
        const cleanBase64 = imagemBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
        contents = [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: sanitizedDuvida
              ? `Analise a foto enviada. Texto complementar ou dúvida do usuário: "${sanitizedDuvida}". Responda de forma aberta, clara e sem restrições no formato JSON solicitado.`
              : "Analise a imagem enviada. Extraia texto, gráficos ou fórmulas e responda com clareza e sem restrições no formato JSON solicitado.",
          },
        ];
      } else {
        contents = [`Mensagem do Usuário:\n"${sanitizedDuvida}"`];
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction: RESOLUCAO_3PASSOS_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      });

      if (response && response.text) {
        parsedData = cleanAndRepairJson(response.text);
      }
    } catch (modelError) {
      console.warn("[/api/solve-question] Erro na geração com modelo primário:", modelError);
    }

    if (!parsedData) {
      if (isGreeting) {
        parsedData = {
          categoria: "cumprimento",
          tipo_resposta: "conversacional",
          foto_ilegivel: false,
          mensagem_erro_ilegivel: "",
          materia: "Conversa & Boas-Vindas",
          transcricao_enunciado: duvida || "Olá!",
          conceito_chave: "",
          resposta_direta: getConversationalGreetingResponseServer(duvida || ""),
          resolucao_passo_a_passo: "",
          gabarito_resposta_final: "",
          passo1_compreensao: "",
          passo2_formula_conceito: "",
          passo3_resolucao_guiada: "",
          gabarito_final: "",
          dica_rapida: "Você pode digitar qualquer questão ou anexar a foto da sua apostila a qualquer momento!",
        };
      } else {
        parsedData = {
          categoria: "conhecimentos_gerais",
          tipo_resposta: "conhecimentos_gerais",
          foto_ilegivel: false,
          mensagem_erro_ilegivel: "",
          materia: "Conhecimentos Gerais",
          transcricao_enunciado: duvida || "Pergunta do usuário",
          conceito_chave: "",
          resposta_direta: `Sobre "${duvida || ""}": analisamos os principais pontos desse assunto para esclarecer sua dúvida com didática.`,
          resolucao_passo_a_passo: `Explicação didática sobre ${duvida || "o tema pesquisado"}.`,
          gabarito_resposta_final: "Conceito esclarecido com clareza.",
          passo1_compreensao: "",
          passo2_formula_conceito: "",
          passo3_resolucao_guiada: "",
          gabarito_final: "",
          dica_rapida: "Você pode perguntar sobre qualquer assunto: matérias escolares, curiosidades e muito mais!",
        };
      }
    }

    const userGreetingDetected = isGreeting || parsedData.categoria === "cumprimento" || parsedData.tipo_resposta === "conversacional";
    const isExercicio = !userGreetingDetected && (parsedData.categoria === "exercicio" || parsedData.categoria === "duvida_complexa");
    const isLivre = !userGreetingDetected && !isExercicio;

    const categoriaFinal = userGreetingDetected
      ? "cumprimento"
      : isExercicio
      ? "exercicio"
      : "conhecimentos_gerais";

    const respostaFinal =
      parsedData.resposta_direta ||
      parsedData.resolucao_passo_a_passo ||
      parsedData.gabarito_final ||
      (userGreetingDetected
        ? getConversationalGreetingResponseServer(duvida || "")
        : "Aqui está a explicação sobre o tema.");

    const formattedData = {
      ...parsedData,
      categoria: categoriaFinal,
      tipo_resposta: userGreetingDetected
        ? "conversacional"
        : isExercicio
        ? "exercicio_3passos"
        : "conhecimentos_gerais",
      materia: parsedData.materia || (userGreetingDetected ? "Conversa & Boas-Vindas" : isLivre ? "Conhecimentos Gerais" : "Geral"),
      resposta_direta: respostaFinal,
      conceito_chave: userGreetingDetected ? "" : (parsedData.conceito_chave || ""),
      resolucao_passo_a_passo: userGreetingDetected ? "" : (parsedData.resolucao_passo_a_passo || (isExercicio ? respostaFinal : "")),
      gabarito_resposta_final: userGreetingDetected ? "" : (parsedData.gabarito_resposta_final || ""),
      passo1_compreensao: userGreetingDetected ? "" : (parsedData.passo1_compreensao || (isExercicio ? (parsedData.transcricao_enunciado || duvida) : "")),
      passo2_formula_conceito: userGreetingDetected ? "" : (parsedData.passo2_formula_conceito || (isExercicio ? (parsedData.conceito_chave || "Fundamentos Gerais") : "")),
      passo3_resolucao_guiada: userGreetingDetected ? "" : (parsedData.passo3_resolucao_guiada || (isExercicio ? respostaFinal : "")),
      gabarito_final: userGreetingDetected ? "" : (parsedData.gabarito_final || parsedData.gabarito_resposta_final || ""),
      dica_rapida:
        parsedData.dica_rapida ||
        (userGreetingDetected
          ? "Dica: Você pode enviar dúvidas de matemática, redação, história ou anexar fotos da sua prova!"
          : "Dica: Você pode fazer perguntas livres de qualquer tema a qualquer momento!"),
    };

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error("Erro no Scanner Tira-Dúvidas:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro ao processar a resposta com IA.",
    });
  }
});

// 11. SYSTEM INSTRUCTION FOR SIMULADO TRI (TEORIA DE RESPOSTA AO ITEM)
const SIMULADO_TRI_SYSTEM_INSTRUCTION = `Você é o Motor de Simulados com TRI (Teoria de Resposta ao Item) do MenteUp.

DIRETRIZES DE VARIABILIDADE, ESTILO E NÃO-REPETIÇÃO:
1. NUNCA repita as mesmas perguntas ou temas clichês. Cada simulado gerado DEVE ser original, contemporâneo e inédito.
2. Varie os estilos dos enunciados a cada questão:
   - Situação-problema contextualizada no cotidiano brasileiro (energia, economia doméstica, saúde, mobilidade urbana).
   - Análise crítica de experimentos, dados científicos, gráficos ou tabelas.
   - Aplicação conceitual direta e tomada de decisão fundamentada.
3. Garanta a distribuição estrita de dificuldade: exatamente 2 Fáceis, 2 Médias e 2 Difíceis.
4. Distribua o índice da resposta correta entre 0, 1, 2, 3 e 4 de forma balanceada.
5. Responda EXCLUSIVAMENTE em formato JSON estruturado.`;

const AREA_SUBTOPICS_POOL: Record<string, string[]> = {
  "Matemática": [
    "Geometria Espacial, Prismas e Embalagens Sustentáveis",
    "Estatística, Desvio Padrão e Análise de Gráficos de Saúde",
    "Função Afim e Planos de Telefonia/Energia Solar",
    "Trigonometria no Triângulo Retângulo e Rampas de Acessibilidade",
    "Probabilidade Genética e Jogos de Azar",
    "Razão, Proporção e Escala em Plantas Arquitetônicas",
    "Matemática Financeira e Juros Compostos",
    "Análise Combinatória e Segurança em Senhas Criptografadas"
  ],
  "Natureza": [
    "Eletrodinâmica, Consumo Energético e Bandeiras Tarifárias",
    "Cinética Química, Catalisadores e Conservação de Alimentos",
    "Ecologia, Relações Ecológicas e Eutrofização de Recursos Hídricos",
    "Genética Mendeliana, Biotecnologia e Alimentos Transgênicos",
    "Termodinâmica, Calorimetria e Ilhas de Calor Urbanas",
    "Química Orgânica e Biocombustíveis no Brasil (Etanol e Biodiesel)",
    "Ondulatória, Efeito Doppler e Telecomunicações por Fibras Ópticas",
    "Fisiologia Humana, Imunologia, Vacinas e Soros Terapêuticos"
  ],
  "Humanas": [
    "Geopolítica dos Recursos Hídricos e Bacias Hidrográficas",
    "Cidadania, Direitos Humanos e a Constituição de 1988",
    "Urbanização Brasileira e Segregação Socioespacial",
    "Era Vargas (1930-1945), Trabalhismo e o DIP",
    "Filosofia Política: Contratualismo (Hobbes, Locke, Rousseau)",
    "Sociologia: Modernidade Líquida e Consumo de Zygmunt Bauman",
    "Divisão Internacional do Trabalho e Cadeias Globais de Suprimento",
    "Ditadura Civil-Militar no Brasil e o Processo de Anistia"
  ],
  "Linguagens": [
    "Variação Linguística Regional, Norma Culta e Preconceito Linguístico",
    "Intertextualidade, Humor e Ironia em Tiras e Cartuns",
    "Funções da Linguagem de Roman Jakobson na Publicidade Institucional",
    "Modernismo de 1922 e Antropofagia Cultural",
    "Estratégias de Coesão Referencial e Sequencial em Editoriais",
    "Linguagem Digital, Ciberespaço e Desinformação",
    "Literatura Contemporânea Brasileira e Representatividade Social"
  ]
};

const ENUNCIADO_STYLES = [
  "situação-problema prática com dados e tomada de decisão",
  "análise de cenário cotidiano com aplicação de conceito teórico",
  "interpretação interdisciplinar envolvendo sustentabilidade ou tecnologia",
  "dilema conceitual desafiador com distratores bem calibrados"
];

app.post("/api/generate-simulado-tri", async (req, res) => {
  try {
    const { area, materiaFocus } = req.body;
    const areaName = area || materiaFocus || "Matemática e suas Tecnologias";

    // Encontrar o pool temático mais adequado
    let chosenPool = AREA_SUBTOPICS_POOL["Matemática"];
    const lowerArea = areaName.toLowerCase();
    if (lowerArea.includes("natureza") || lowerArea.includes("física") || lowerArea.includes("química") || lowerArea.includes("biologia")) {
      chosenPool = AREA_SUBTOPICS_POOL["Natureza"];
    } else if (lowerArea.includes("humana") || lowerArea.includes("história") || lowerArea.includes("geografia") || lowerArea.includes("filosofia") || lowerArea.includes("sociologia")) {
      chosenPool = AREA_SUBTOPICS_POOL["Humanas"];
    } else if (lowerArea.includes("linguagem") || lowerArea.includes("português") || lowerArea.includes("literatura") || lowerArea.includes("inglês")) {
      chosenPool = AREA_SUBTOPICS_POOL["Linguagens"];
    }

    // Sorteio de tópico e estilo para variabilidade
    const randomTopic = chosenPool[Math.floor(Math.random() * chosenPool.length)];
    const randomStyle = ENUNCIADO_STYLES[Math.floor(Math.random() * ENUNCIADO_STYLES.length)];
    const randomSeed = Math.floor(Math.random() * 10000000);

    const prompt = `Gere um simulado oficial modelo ENEM com 6 questões 100% INÉDITAS para a área: "${areaName}".
Foco/Tópico Sorteado: ${randomTopic}
Estilo de Enunciado: ${randomStyle}
Seed de Variabilidade: ${randomSeed}

ESTRUTURA DE DIFICULDADE OBRIGATÓRIA:
- Questões 1 e 2: Dificuldade "Fácil" (identificação de conceito e aplicação imediata)
- Questões 3 e 4: Dificuldade "Média" (interpretação de dados, cálculo de 2 etapas ou contexto cotidiano)
- Questões 5 e 6: Dificuldade "Difícil" (análise crítica complexa, síntese teórica ou múltiplos passos lógicos)

INSTRUÇÕES CRÍTICAS DE NÃO-REPETIÇÃO:
- NUNCA use enunciados genéricos ou questões repetidas.
- Contextualize cada questão em cenários realistas da sociedade brasileira (indústria, saúde pública, meio ambiente, tecnologia).
- Cada questão DEVE ter exatamente 5 alternativas (A, B, C, D, E).
- Varie a letra da resposta correta (não concentre na mesma alternativa).`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        tipo_resposta: { type: Type.STRING },
        area_conhecimento: { type: Type.STRING },
        questoes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              dificuldade: { type: Type.STRING },
              enunciado: { type: Type.STRING },
              opcoes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              resposta_correta_index: { type: Type.INTEGER },
              explicacao: { type: Type.STRING },
            },
            required: ["id", "dificuldade", "enunciado", "opcoes", "resposta_correta_index", "explicacao"],
          },
        },
      },
      required: ["tipo_resposta", "area_conhecimento", "questoes"],
    };

    let simuladoData: any = null;

    try {
      const ai = getGenAIFromRequest(req);
      const safeResult = await callGeminiSafe(ai, {
        contents: prompt,
        systemInstruction: SIMULADO_TRI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8, // Parâmetro de alta variabilidade para nunca repetir
        timeoutMs: 8000,
      });
      simuladoData = cleanAndRepairJson(safeResult.text) || {};
    } catch (apiError) {
      console.warn("IA do Gemini ocupada ou offline para Simulado TRI, acionando gerador dinâmico calibrado:", apiError);
      // Fallback dinâmico enriquecido com 6 questões calibradas em Fácil, Média, Difícil
      const fallbackQuestions = [
        {
          id: 1,
          dificuldade: "Fácil",
          enunciado: `[Questão Fácil - ${areaName}] Ao analisar o tema "${randomTopic}", qual é o princípio conceitual direto que define a correta interpretação desse fenômeno no ENEM?`,
          opcoes: [
            "A) A conservação das propriedades fundamentais e o equilíbrio entre as variáveis envolvidas.",
            "B) A variação imprevisível que impede qualquer medição ou cálculo matemático.",
            "C) A eliminação das hipóteses científicas em benefício do senso comum.",
            "D) A dependência exclusiva de fatores isolados sem ligação com o contexto real.",
            "E) A ausência de regras ou padrões de comportamento observáveis."
          ],
          resposta_correta_index: 0,
          explicacao: "As questões fáceis do ENEM cobram a identificação direta do conceito e o reconhecimento dos princípios fundamentais que regem o fenômeno."
        },
        {
          id: 2,
          dificuldade: "Fácil",
          enunciado: `Em uma situação prática envolvendo ${randomTopic}, um técnico precisa aferir os dados coletados. Qual grandeza ou unidade deve ser prioritariamente padronizada segundo as normas científicas?`,
          opcoes: [
            "A) As unidades do Sistema Internacional (SI) correspondentes às grandezas medidas.",
            "B) Valores arbitrários sem escala definida.",
            "C) Estimativas visuais sem registro documental.",
            "D) Dados de pesquisas não comprovadas metodologicamente.",
            "E) Porcentagens sem base amostral de cálculo."
          ],
          resposta_correta_index: 0,
          explicacao: "A padronização das unidades de medida no Sistema Internacional é pré-requisito elementar para comparabilidade e consistência científica."
        },
        {
          id: 3,
          dificuldade: "Média",
          enunciado: `[Questão Média - ${areaName}] Em um estudo socioambiental voltado para ${randomTopic}, observou-se uma alteração de 25% na taxa de aproveitamento dos recursos ao longo de 6 meses. Para reverter perdas e otimizar o processo, a estratégia recomendada é:`,
          opcoes: [
            "A) Implementar monitoramento sistemático das etapas intermediárias e readequar a eficiência do fluxo produtivo.",
            "B) Interromper imediatamente todas as medições para evitar gastos com instrumentos.",
            "C) Triplicar a velocidade de produção sem avaliar a qualidade dos insumos.",
            "D) Substituir profissionais especializados por processos automatizados sem calibração prévia.",
            "E) Desconsiderar os 25% de alteração como margem irrelevante de erro experimental."
          ],
          resposta_correta_index: 0,
          explicacao: "A questão média exige aplicar o conceito a um problema prático: diagnosticar o gargalo e intervir na eficiência através de monitoramento contínuo."
        },
        {
          id: 4,
          dificuldade: "Média",
          enunciado: `Ao interpretar uma tabela comparativa com índices de rendimento em ${randomTopic}, nota-se uma correlação positiva entre investimento em tecnologia limpa e retorno sustentável. Qual conclusão pedagógica é válida?`,
          opcoes: [
            "A) O avanço técnico estruturado reduz desperdícios e potencializa a sustentabilidade econômica e ecológica.",
            "B) Tecnologias inovadoras geram invariavelmente perdas financeiras no médio prazo.",
            "C) A correlação positiva comprova que os custos operacionais sempre aumentam exponencialmente.",
            "D) A preservação ambiental é incompatível com ganhos de produtividade social.",
            "E) Não há qualquer relação entre inovação técnica e eficiência de processos."
          ],
          resposta_correta_index: 0,
          explicacao: "A correlação positiva no ENEM ilustra que inovação técnica sustentável agrega valor econômico e minimiza passivos socioambientais."
        },
        {
          id: 5,
          dificuldade: "Difícil",
          enunciado: `[Questão Difícil - ${areaName}] Diante de um cenário complexo em ${randomTopic}, onde múltiplos fatores intervenientes atuam simultaneamente sob condições de contorno não-lineares, a tomada de decisão que minimiza o risco sistêmico baseia-se em:`,
          opcoes: [
            "A) Modelagem multivariada com análise de sensibilidade e mitigação proativa dos piores cenários probabilísticos.",
            "B) Aplicação de uma única fórmula simplista sem considerar as variáveis de fronteira.",
            "C) Decisão baseada exclusivamente na tradição histórica sem validação estatística atualizada.",
            "D) Suposição de que o sistema atingirá estabilidade espontânea sem intervenção técnica planejada.",
            "E) Descarte das incertezas amostrais para facilitar a aprovação do projeto."
          ],
          resposta_correta_index: 0,
          explicacao: "Questões difíceis exigem síntese de alto nível: em sistemas dinâmicos complexos, a análise multivariada de sensibilidade é indispensável para controlar riscos sistêmicos."
        },
        {
          id: 6,
          dificuldade: "Difícil",
          enunciado: `Considere uma proposta interdisciplinar que articula ${randomTopic} com as metas de desenvolvimento sustentável da ONU. Qual diretriz estratégica atende simultaneamente aos critérios de rigor técnico, inclusão social e viabilidade financeira?`,
          opcoes: [
            "A) Governança participativa integrada a indicadores auditáveis de impacto socioeconômico e ambiental.",
            "B) Centralização absoluta das decisões em um único órgão burocrático sem transparência pública.",
            "C) Destinação de recursos apenas para campanhas publicitárias sem ação estrutural concreta.",
            "D) Imposição de taxas punitivas sem oferecer alternativas viáveis para a comunidade afetada.",
            "E) Adiamento indefinido das medidas corretivas até a ocorrência de colapso do sistema."
          ],
          resposta_correta_index: 0,
          explicacao: "A resolução de questões complexas do ENEM requer conectar competências de análise técnica a propostas estruturadas de governança e impacto coletivo duradouro."
        }
      ];

      simuladoData = {
        tipo_resposta: "geracao_simulado_tri",
        area_conhecimento: areaName,
        questoes: fallbackQuestions
      };
    }

    if (simuladoData && Array.isArray(simuladoData.questoes)) {
      simuladoData.questoes = simuladoData.questoes.map((q: any) => {
        const shuffled = shuffleOptionsArray(q.opcoes, q.resposta_correta_index);
        return {
          ...q,
          opcoes: shuffled.opcoes,
          resposta_correta_index: shuffled.resposta_correta_index,
        };
      });
    }

    res.json({ success: true, data: simuladoData });
  } catch (error: any) {
    console.error("Erro ao gerar simulado TRI:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao gerar simulado TRI." });
  }
});

app.post("/api/evaluate-simulado-tri", async (req, res) => {
  try {
    const { respostas, area } = req.body;
    // respostas is an array of objects: { id, dificuldade: 'Fácil'|'Média'|'Difícil', acertou: boolean }

    let faceisTotais = 0, faceisAcertos = 0;
    let mediasTotais = 0, mediasAcertos = 0;
    let dificeisTotais = 0, dificeisAcertos = 0;

    if (Array.isArray(respostas)) {
      respostas.forEach((r: any) => {
        const dif = (r.dificuldade || "").toLowerCase();
        if (dif.includes("fác") || dif.includes("fac")) {
          faceisTotais++;
          if (r.acertou) faceisAcertos++;
        } else if (dif.includes("méd") || dif.includes("med")) {
          mediasTotais++;
          if (r.acertou) mediasAcertos++;
        } else {
          dificeisTotais++;
          if (r.acertou) dificeisAcertos++;
        }
      });
    }

    const totalAcertos = faceisAcertos + mediasAcertos + dificeisAcertos;
    const totalQuestoes = (faceisTotais || 2) + (mediasTotais || 2) + (dificeisTotais || 2);

    // TRI Calculation algorithm with Pedagogical Coherence Check
    let coerenciaStatus = "Alta Coerência Pedagógica";
    let coerenciaDescricao = "Seu padrão de acertos é consistente: dominou as fáceis e médias antes das difíceis.";
    let triPenalty = 0;

    // Check for incoherence (chute): errar fáceis mas acertar difíceis
    if (faceisAcertos < faceisTotais && dificeisAcertos > 0 && faceisAcertos === 0) {
      coerenciaStatus = "Incoerência Pedagógica (Padrão de Chute Detectado)";
      coerenciaDescricao = "Você errou questões fáceis, mas acertou questões difíceis. Na TRI do ENEM, isso indica probabilidade de chute e reduz a pontuação máxima calculada.";
      triPenalty = 45.0;
    } else if (faceisAcertos < faceisTotais && dificeisAcertos > mediasAcertos) {
      coerenciaStatus = "Coerência Média";
      coerenciaDescricao = "Algumas questões fáceis foram perdidas por falta de atenção. A TRI recompensa a consistência do conhecimento base.";
      triPenalty = 20.0;
    }

    // Calculate base score between 350.0 and 980.0
    const taxaAcerto = totalQuestoes > 0 ? totalAcertos / totalQuestoes : 0;
    let notaEstimadaTri = 350.0 + (taxaAcerto * 580.0) - triPenalty;
    if (notaEstimadaTri < 350.0) notaEstimadaTri = 350.0;
    if (notaEstimadaTri > 980.0) notaEstimadaTri = 980.0;
    notaEstimadaTri = Math.round(notaEstimadaTri * 10) / 10;

    // Strategic Study Advice
    let conselhoEstrategico = "";
    if (faceisAcertos < faceisTotais) {
      conselhoEstrategico = "Foco Prioritário: Reforce os conceitos fundamentais da matéria. No ENEM, errar questões fáceis é o que mais derruba sua nota TRI!";
    } else if (mediasAcertos < mediasTotais) {
      conselhoEstrategico = "Foco Intermediário: Você domina a base! Agora treine interpretação e questões de nível médio com o Timer Pomodoro do MenteUp.";
    } else if (dificeisAcertos < dificeisTotais) {
      conselhoEstrategico = "Foco Avançado: Excelente desempenho! Para buscar os 800+ pontos, faça simulados cronometrados e foque em pega-rabichos conceituais.";
    } else {
      conselhoEstrategico = "Desempenho Perfeito! Você atingiu pontuação máxima na TRI deste simulado. Continue mantendo a constância diária!";
    }

    res.json({
      success: true,
      data: {
        tipo_resposta: "resultado_simulado_tri",
        area_conhecimento: area || "Geral ENEM",
        nota_oficial_estimada: notaEstimadaTri,
        total_acertos: totalAcertos,
        total_questoes: totalQuestoes,
        desempenho_dificuldade: {
          faceis: { acertos: faceisAcertos, total: faceisTotais || 2 },
          medias: { acertos: mediasAcertos, total: mediasTotais || 2 },
          dificeis: { acertos: dificeisAcertos, total: dificeisTotais || 2 },
        },
        coerencia_pedagogica: {
          status: coerenciaStatus,
          descricao: coerenciaDescricao,
        },
        conselho_estrategico: conselhoEstrategico,
      },
    });
  } catch (error: any) {
    console.error("Erro na avaliação do simulado TRI:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao calcular nota TRI." });
  }
});

// 12. ENDPOINT: GERADOR DE FOLHA DE VÉSPERA (CHEAT SHEET SINTÉTICO)
app.post("/api/generate-cheatsheet", async (req, res) => {
  try {
    const { materia, topico } = req.body;
    const ai = getGenAIFromRequest(req);

    const prompt = `Você é o Gerador de Folhas de Véspera (Cheat Sheets Sintéticos de 1 Página) do MenteUp.
Gere um resumo ultra-sintético, denso e direto para revisão de véspera da matéria "${materia || "Geral"}" com foco no tópico "${topico || "Principais Tópicos do Edital"}".

A resposta deve ser obrigatoriamente um JSON com este formato:
{
  "materia": "Nome da matéria",
  "topico": "Tópico principal",
  "resumo_executivo": "Visão geral em 2 frases densas.",
  "conceitos_chave": [
    { "termo": "Nome do conceito", "definicao": "Explicação em 1 frase" }
  ],
  "formulas_e_regras": [
    { "nome": "Nome da fórmula/regra", "expressao": "Fórmula matemática/Química ou Regra Gramatical", "quando_usar": "Aplicação rápida" }
  ],
  "pega_rabichos": [
    "Armadilha clássica cobrada em provas que o aluno NÃO pode cair"
  ],
  "gatilhos_de_memorizacao": [
    "Macete/Mnemônico ou palavra-chave para lembrar no dia da prova"
  ]
}`;

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: prompt,
      responseMimeType: "application/json",
      preferredModel: "gemini-2.5-flash",
    });

    const parsed = cleanAndRepairJson(resultText) || {};
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro ao gerar folha de véspera:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao gerar Cheat Sheet." });
  }
});

// 13. ENDPOINT: MODO ADVOGADO DO DIABO (DEBATE DE REDAÇÃO)
app.post("/api/devil-advocate-debate", async (req, res) => {
  try {
    const { tema, tese, historico } = req.body;
    const ai = getGenAIFromRequest(req);

    const systemInstruction = `Você é o Advogado do Diabo do MenteUp, um debatedor socrático exigente e perspicaz especializado em Redação Nota 1000.
Seu objetivo NÃO é ofender o aluno, mas sim CONTESTAR e DESAFIAR rigorosamente a tese e os argumentos dele sobre o tema da redação.
Faça o aluno refletir criticamente e EXIJA que ele defenda seu ponto de vista apresentando repertórios socioculturais válidos (Leis, Sociologia, Filosofia, História) antes de liberar a redação.

Retorne obrigatoriamente JSON no seguinte formato:
{
  "contestacao_principal": "Texto desafiando a tese do aluno com uma contra-argumentação contundente.",
  "pergunta_desafio": "Uma pergunta direta forçando o aluno a apresentar um repertório ou solução sólida.",
  "repertorio_provocativo": "Uma referência ou dado histórico/filosófico oposto para ele rebater.",
  "status_defesa": "fraca" | "em_construcao" | "solida"
}`;

    let contents = `Tema da Redação: "${tema || "Geral ENEM"}"\nTese do Aluno: "${tese || ""}"`;
    if (historico && Array.isArray(historico)) {
      contents += `\n\nHistórico do Debate:\n` + historico.map((h: any) => `${h.autor}: ${h.texto}`).join("\n");
    }

    const { text: resultText } = await callGeminiSafe(ai, {
      contents,
      systemInstruction,
      responseMimeType: "application/json",
      preferredModel: "gemini-2.5-flash",
    });

    const parsed = cleanAndRepairJson(resultText) || {};
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro no modo Advogado do Diabo:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao debate." });
  }
});

// 14. ENDPOINT: GERADOR AUTOMÁTICO DE FLASHCARDS POR FOTO/TEXTO
app.post("/api/auto-flashcards", async (req, res) => {
  try {
    const { texto, imagemBase64, materia } = req.body;
    const ai = getGenAIFromRequest(req);

    const systemInstruction = `Você é o Gerador Automático de Flashcards do MenteUp.
Extraia os conceitos mais importantes do texto ou da imagem enviada e gere um baralho de 5 a 8 flashcards para memorização ativa.

Responda obrigatoriamente em JSON no formato:
{
  "materia": "${materia || "Geral"}",
  "topico_extraido": "Nome do tópico identificado",
  "flashcards": [
    {
      "frente": "Pergunta ou conceito chave da frente do cartão",
      "verso": "Resposta direta e objetiva no verso do cartão",
      "nivel": "Fácil" | "Médio" | "Difícil"
    }
  ]
}`;

    const parts: any[] = [];
    if (imagemBase64) {
      const mimeType = imagemBase64.match(/data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
      const cleanBase64 = imagemBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: { mimeType, data: cleanBase64 },
      });
      parts.push({
        text: "Extraia o conteúdo e os conceitos da foto da apostila/anotação acima e gere flashcards interativos.",
      });
    } else {
      parts.push({
        text: `Extraia o conteúdo do texto a seguir e gere flashcards interativos:\n\n"""\n${texto}\n"""`,
      });
    }

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: parts,
      systemInstruction,
      responseMimeType: "application/json",
      preferredModel: "gemini-2.5-flash",
    });

    const parsed = cleanAndRepairJson(resultText) || {};
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro na geração de flashcards:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao gerar flashcards." });
  }
});

// 15. ENDPOINT: DETECTOR DE ELEMENTOS DA PROPOSTA DE INTERVENÇÃO (C5 REDAÇÃO)
app.post("/api/detect-c5-intervention", async (req, res) => {
  try {
    const { textoConclusao } = req.body;
    const ai = getGenAIFromRequest(req);

    const systemInstruction = `Você é o Corretor de Competência 5 do ENEM (Proposta de Intervenção) do MenteUp.
Analise detalhadamente a conclusão da redação fornecida e verifique a presença dos 5 elementos obrigatórios:
1. Agente (Quem realiza a ação?)
2. Ação (O que deve ser feito?)
3. Meio/Modo (Como ou através de que mecanismo a ação é executada?)
4. Efeito (Qual o objetivo/impacto esperado?)
5. Detalhamento (Exemplo, explicação ou detalhe adicional sobre o Agente, Ação, Meio ou Efeito)

Responda obrigatoriamente em JSON no seguinte formato:
{
  "nota_c5": 200, // 0, 40, 80, 120, 160 ou 200
  "elementos": {
    "agente": { "presente": true/false, "trecho": "Trecho exato do texto ou nulo", "comentario": "Análise crítica" },
    "acao": { "presente": true/false, "trecho": "Trecho exato do texto ou nulo", "comentario": "Análise crítica" },
    "meio_modo": { "presente": true/false, "trecho": "Trecho exato do texto ou nulo", "comentario": "Análise crítica" },
    "efeito": { "presente": true/false, "trecho": "Trecho exato do texto ou nulo", "comentario": "Análise crítica" },
    "detalhamento": { "presente": true/false, "trecho": "Trecho exato do texto ou nulo", "comentario": "Análise crítica" }
  },
  "sugestao_para_200_pontos": "Como reescrever a proposta para alcançar os 200 pontos no ENEM."
}`;

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: `Analise o parágrafo de conclusão a seguir quanto aos 5 elementos da Competência 5 do ENEM:\n\n"""\n${textoConclusao}\n"""`,
      systemInstruction,
      responseMimeType: "application/json",
      preferredModel: "gemini-2.5-flash",
    });

    const parsed = cleanAndRepairJson(resultText) || {};
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro na análise C5 de intervenção:", error);
    res.status(500).json({ success: false, error: error.message || "Erro na análise C5." });
  }
});

// 16. ENDPOINT: CORRETOR VISUAL DE CARTÃO-RESPOSTA FÍSICO (LEITURA DE GABARITO POR FOTO)
app.post("/api/scan-answer-sheet", async (req, res) => {
  try {
    const { imagemBase64, gabaritoOficial } = req.body;
    const ai = getGenAIFromRequest(req);

    const systemInstruction = `Você é um Leitor Óptico Inteligente de Cartão-Resposta (Gabarito de Prova ENEM e Vestibulares) do MenteUp.
Sua tarefa é analisar visualmente a foto da folha de gabarito enviada e identificar quais bolinhas (A, B, C, D, E) foram preenchidas/rasuradas em cada questão.

Gabarito Oficial Esperado / Fornecido: ${
      gabaritoOficial ? JSON.stringify(gabaritoOficial) : "Gabarito Padrão ENEM (10 a 20 questões)"
    }

Analise rigorosamente a imagem do cartão-resposta e retorne um objeto JSON exatamente com este formato:
{
  "total_questoes": 10,
  "acertos": 8,
  "erros": 2,
  "porcentagem": 80,
  "pontuacao_estimada_tri": 720,
  "questoes_analisadas": [
    {
      "numero": 1,
      "materia": "Matemática",
      "marcada_aluno": "A",
      "gabarito_correto": "A",
      "correta": true
    },
    {
      "numero": 2,
      "materia": "Biologia",
      "marcada_aluno": "C",
      "gabarito_correto": "B",
      "correta": false
    }
  ],
  "desempenho_por_materia": {
    "Matematica": { "acertos": 4, "total": 5 },
    "Humanas": { "acertos": 4, "total": 5 }
  },
  "diagnostico_pedagogico": "Análise geral sobre os pontos fortes e o que o aluno precisa revisar prioritariamente com base no gabarito lido."
}`;

    const parts: any[] = [];
    if (imagemBase64) {
      const mimeType = imagemBase64.match(/data:(image\/\w+);base64,/)?.[1] || "image/jpeg";
      const cleanBase64 = imagemBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: { mimeType, data: cleanBase64 },
      });
      parts.push({
        text: "Analise o cartão-resposta marcado a lápis/caneta na imagem acima. Identifique cada questão e sua opção assinalada (A, B, C, D ou E) e calcule o resultado.",
      });
    } else {
      parts.push({
        text: "Não foi enviada imagem válida do cartão-resposta. Simule a leitura óptica didática de 10 questões preenchidas para demonstração.",
      });
    }

    const { text: resultText } = await callGeminiSafe(ai, {
      contents: parts,
      systemInstruction,
      responseMimeType: "application/json",
      preferredModel: "gemini-2.5-flash",
    });

    const parsed = cleanAndRepairJson(resultText) || {};
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Erro na leitura óptica do cartão-resposta:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao ler cartão-resposta." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
