import { GoogleGenAI } from '@google/genai';

/**
 * Endpoint Serverless do Chat da Professora Gabi / MenteUp AI (/api/gemini/chat).
 * Compatível com Vercel Serverless Functions (Node.js e Edge/Next.js routes) e Express.
 */

interface ChatRequestBody {
  prompt?: string;
  pergunta?: string;
  message?: string;
  duvida?: string;
  fileParts?: Array<{
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
  history?: Array<{
    role: string;
    parts: string | Array<{ text: string }>;
  }>;
  apiKey?: string;
  model?: string;
  temperature?: number;
  systemInstruction?: string;
}

const GABI_SYSTEM_INSTRUCTION = `Você é a Professora Gabi, a tutora pedagógica oficial do MenteUp.
Você é extremamente didática, calorosa, motivadora e especialista nas competências do ENEM e grandes vestibulares.
Suas respostas devem ser claras, focadas em ajudar o estudante a dominar o conceito e acertar questões da TRI.
Seja concisa, estruture com tópicos e use emojis com moderação para manter a leitura agradável.`;

async function processChatRequest(body: ChatRequestBody): Promise<{
  success: boolean;
  reply: string;
  text: string;
  resposta_suporte: string;
  botao_atalho?: string;
  modelUsed?: string;
  error?: string;
}> {
  const userText = (body.prompt || body.pergunta || body.message || body.duvida || '').trim();

  if (!userText && (!body.fileParts || body.fileParts.length === 0)) {
    throw new Error('A mensagem ou anexo de estudo é obrigatório.');
  }

  const effectiveKey = (body.apiKey && body.apiKey.length > 15 ? body.apiKey : process.env.GEMINI_API_KEY || '').trim();

  if (!effectiveKey) {
    // Resposta amigável se a chave ainda não estiver configurada no ambiente
    return {
      success: true,
      reply: 'Olá! Sou a Professora Gabi. Para que eu possa responder em tempo real com toda a inteligência pedagógica do MenteUp, configure a sua GEMINI_API_KEY no painel de segredos.',
      text: 'Olá! Sou a Professora Gabi. Para que eu possa responder em tempo real com toda a inteligência pedagógica do MenteUp, configure a sua GEMINI_API_KEY no painel de segredos.',
      resposta_suporte: 'Olá! Sou a Professora Gabi. Para que eu possa responder em tempo real com toda a inteligência pedagógica do MenteUp, configure a sua GEMINI_API_KEY no painel de segredos.',
      botao_atalho: 'ajustes',
    };
  }

  const ai = new GoogleGenAI({
    apiKey: effectiveKey,
    httpOptions: {
      headers: {
        'User-Agent': 'menteup-aistudio',
      },
    },
  });

  const contentParts: any[] = [];

  if (body.fileParts && Array.isArray(body.fileParts)) {
    for (const part of body.fileParts) {
      if (part.inlineData?.data && part.inlineData?.mimeType) {
        contentParts.push({
          inlineData: {
            mimeType: part.inlineData.mimeType,
            data: part.inlineData.data,
          },
        });
      }
    }
  }

  if (userText) {
    contentParts.push({ text: userText });
  }

  const modelsToTry = [
    body.model || 'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contentParts,
        config: {
          systemInstruction: body.systemInstruction || GABI_SYSTEM_INSTRUCTION,
          temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
        },
      });

      const replyText = response.text?.trim() || 'Resposta gerada com sucesso pela Professora Gabi.';

      return {
        success: true,
        reply: replyText,
        text: replyText,
        resposta_suporte: replyText,
        botao_atalho: 'nenhum',
        modelUsed: modelName,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gabi API] Falha com modelo ${modelName}:`, err?.message || err);
    }
  }

  throw lastError || new Error('Não foi possível gerar a resposta com a Professora Gabi.');
}

// -------------------------------------------------------------
// Handler para Web Standard (Next.js App Router / Vercel Edge)
// -------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const result = await processChatRequest(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao processar mensagem com a Professora Gabi.',
      }),
      {
        status: error.status || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Endpoint /api/gemini/chat online. Utilize POST para enviar mensagens para a Professora Gabi.',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// -------------------------------------------------------------
// Handler padrão para Vercel Serverless Function (Node.js runtime)
// -------------------------------------------------------------
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Endpoint /api/gemini/chat online. Utilize POST para enviar mensagens para a Professora Gabi.',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Utilize requisições POST para /api/gemini/chat.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await processChatRequest(body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro no handler /api/gemini/chat:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar mensagem com a Professora Gabi.',
    });
  }
}
