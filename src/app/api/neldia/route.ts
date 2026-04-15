import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Tu es l'IA de Nahel Trading, un assistant spécialisé dans le trading spot de crypto-monnaies. Tu utilises la méthodologie Smart Money Concepts (SMC) et ICT.

Tes compétences :
- Analyse technique avancée (SMC, ICT, Elliott Wave, Price Action)
- Identification des zones de liquidité, order blocks, fair value gaps, breaker blocks
- Analyse des structures de marché (BOS, CHoCH, MSS)
- Gestion du risque et money management en spot trading
- Analyse des sessions (Asian, London, New York)
- Kill zones et optimal trade entries (OTE)
- Analyse de graphiques crypto quand on t'envoie des images

Règles :
- Réponds toujours en français
- Sois précis et concis dans tes analyses
- Donne des niveaux de prix quand c'est possible
- Rappelle toujours l'importance de la gestion du risque
- Tu ne donnes JAMAIS de conseils financiers, tu analyses et éduques
- Si on t'envoie un graphique, analyse-le en détail (structure, niveaux clés, zones de liquidité, biais directionnel)`;

// ========== PROVIDER 1: Google Gemini ==========
async function callGemini(message: string, image?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "ta_cle_api_ici") return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: SYSTEM_PROMPT + "\n\nMessage de l'utilisateur : " + message },
  ];

  if (image) {
    const base64Data = image.split(",")[1];
    const mimeType = image.match(/data:(.*?);/)?.[1] || "image/png";
    parts.push({ inlineData: { mimeType, data: base64Data } });
  }

  const result = await model.generateContent(parts);
  return result.response.text();
}

// ========== PROVIDER 2: Groq (gratuit, rapide) ==========
async function callGroq(message: string, image?: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "ta_cle_groq_ici") return null;

  const groq = new Groq({ apiKey });

  const messages: Array<{ role: "system" | "user"; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (image) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: message },
        { type: "image_url", image_url: { url: image } },
      ],
    });
  } else {
    messages.push({ role: "user", content: message });
  }

  const model = image ? "llama-3.2-90b-vision-preview" : "llama-3.3-70b-versatile";

  const completion = await groq.chat.completions.create({
    messages: messages as Parameters<typeof groq.chat.completions.create>[0]["messages"],
    model,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || null;
}

// ========== PROVIDER 3: Ollama (local) ==========
async function callOllama(message: string) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "gemma3";

  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      prompt: SYSTEM_PROMPT + "\n\nMessage de l'utilisateur : " + message,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error("Ollama non disponible");
  const data = await res.json();
  return data.response;
}

export async function POST(req: NextRequest) {
  try {
    const { message, image, provider } = await req.json();

    // Direct provider request
    if (provider === "gemini") {
      const response = await callGemini(message, image);
      if (response) return NextResponse.json({ response, provider: "gemini" });
    }
    if (provider === "groq") {
      const response = await callGroq(message, image);
      if (response) return NextResponse.json({ response, provider: "groq" });
    }
    if (provider === "ollama") {
      const response = await callOllama(message);
      return NextResponse.json({ response, provider: "ollama" });
    }

    // Auto mode: try all providers in order
    const providers = [
      { name: "gemini", fn: () => callGemini(message, image) },
      { name: "groq", fn: () => callGroq(message, image) },
      { name: "ollama", fn: () => callOllama(message) },
    ];

    for (const p of providers) {
      try {
        const response = await p.fn();
        if (response) {
          return NextResponse.json({ response, provider: p.name });
        }
      } catch {
        // try next provider
      }
    }

    return NextResponse.json({
      error: "Aucune IA configurée. Ajoutez au moins une clé API dans .env.local:\n\n" +
        "Option 1 (recommandé): GROQ_API_KEY — gratuit sur groq.com\n" +
        "Option 2: GEMINI_API_KEY — gratuit sur aistudio.google.com\n" +
        "Option 3: Installer Ollama (ollama.com)",
      setup: true,
    }, { status: 500 });
  } catch (error: unknown) {
    console.error("API error:", error);
    const msg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET endpoint to check which providers are configured
export async function GET() {
  const providers = {
    gemini: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "ta_cle_api_ici"),
    groq: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "ta_cle_groq_ici"),
    ollama: false,
  };

  // Check if Ollama is running
  try {
    const res = await fetch((process.env.OLLAMA_URL || "http://localhost:11434") + "/api/tags", {
      signal: AbortSignal.timeout(2000),
    });
    providers.ollama = res.ok;
  } catch {
    // Ollama not available
  }

  return NextResponse.json({ providers, anyAvailable: Object.values(providers).some(Boolean) });
}
