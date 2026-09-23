import { GoogleGenerativeAI } from "@google/generative-ai";

const GATEWAY_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

const NATIVE_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set a valid Gemini API key."
    );
  }
  return apiKey.trim();
}

function getBaseUrl(): string | null {
  const url =
    process.env.NEXT_PUBLIC_GEMINI_BASE_URL ||
    process.env.GEMINI_BASE_URL ||
    process.env.OPENAI_BASE_URL;
  return url && url.trim() !== "" ? url.trim().replace(/\/+$/, "") : null;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call OpenAI-compatible LLM gateway (e.g. https://llm.hidevs.xyz/v1/chat/completions)
 */
async function callOpenAICompatibleGateway<T>(
  baseUrl: string,
  apiKey: string,
  systemInstruction: string,
  userPrompt: string
): Promise<T> {
  const endpoint = `${baseUrl}/v1/chat/completions`;
  const preferredModel =
    process.env.NEXT_PUBLIC_GEMINI_MODEL ||
    process.env.GEMINI_MODEL ||
    "gemini-3.5-flash-lite";
  
  // Only try models allowed by the gateway
  const modelsToTry = [
    preferredModel,
    ...GATEWAY_MODELS.filter((m) => m !== preferredModel),
  ].filter((m) => GATEWAY_MODELS.includes(m));

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 1200,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          if (res.status === 429 && attempt === 0) {
            console.warn(`[Lexora AI] Rate limit on ${modelName}, waiting 1.5s before retry...`);
            await sleep(1500);
            continue;
          }
          throw new Error(
            `Gateway returned ${res.status}: ${errorText || res.statusText}`
          );
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("Empty response content received from model gateway.");
        }

        let cleaned = content.trim();
        if (cleaned.startsWith("```json")) {
          cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
        } else if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
        }

        return JSON.parse(cleaned) as T;
      } catch (err: unknown) {
        const error = err as Error;
        lastError = error;
        if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized") ||
          error.message.includes("invalid_api_key")
        ) {
          throw new Error("Invalid API key provided for model gateway.");
        }
      }
    }
  }

  if (lastError?.message.includes("429") || lastError?.message.includes("Rate limit")) {
    throw new Error(
      "The AI gateway token rate limit was temporarily reached. Please wait a moment and try again."
    );
  }

  throw new Error(`Failed to generate response: ${lastError?.message || "Gateway error"}`);
}

/**
 * Call native Google Generative AI SDK
 */
async function callNativeGemini<T>(
  apiKey: string,
  systemInstruction: string,
  userPrompt: string
): Promise<T> {
  const ai = new GoogleGenerativeAI(apiKey);
  const preferredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelsToTry = [
    preferredModel,
    ...NATIVE_GEMINI_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: Error | null = null;

  for (const modelName of modelsToTry) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          topP: 0.95,
          maxOutputTokens: 1500,
        },
      });

      const response = await model.generateContent(userPrompt);
      const text = response.response.text();

      if (!text || text.trim() === "") {
        throw new Error("Gemini returned an empty response.");
      }

      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/i, "").replace(/\s*```$/i, "");
      }

      return JSON.parse(cleanedText) as T;
    } catch (err: unknown) {
      const error = err as Error;
      lastError = error;
      console.warn(`[Lexora AI] Native Gemini attempt with ${modelName} failed:`, error.message);
      if (
        error.message.includes("API key not valid") ||
        error.message.includes("API_KEY_INVALID")
      ) {
        throw new Error(
          "Invalid Gemini API key provided. Please check your GEMINI_API_KEY configuration."
        );
      }
    }
  }

  throw new Error(`Failed to generate response from Gemini AI: ${lastError?.message || "Unknown error"}`);
}

/**
 * Universal executor supporting both OpenAI-compatible gateways (e.g. hidevs) and native Gemini SDK
 */
export async function callGeminiJSON<T>(
  systemInstruction: string,
  userPrompt: string
): Promise<T> {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();

  // If a custom Base URL is configured or the key starts with "sk-", route to gateway
  if (baseUrl || apiKey.startsWith("sk-")) {
    const targetUrl = baseUrl || "https://llm.hidevs.xyz";
    return callOpenAICompatibleGateway<T>(
      targetUrl,
      apiKey,
      systemInstruction,
      userPrompt
    );
  }

  return callNativeGemini<T>(apiKey, systemInstruction, userPrompt);
}
