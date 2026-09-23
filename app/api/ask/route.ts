import { NextRequest, NextResponse } from "next/server";
import { askRequestSchema, askResponseSchema } from "@/lib/validation/schemas";
import { SYSTEM_INSTRUCTION_QA, buildQAPrompt } from "@/lib/ai/prompts";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { verifyEvidence } from "@/lib/validation/evidence";
import { sanitizeInputText, detectPromptInjection } from "@/lib/security/sanitizer";
import { globalRateLimiter } from "@/lib/security/rate-limiter";
import { qaCache } from "@/lib/cache/lru-cache";
import { AskQuestionResponse } from "@/types/analysis";
import { ZodError } from "zod";

const MAX_PAYLOAD_BYTES = 250 * 1024; // 250 KB max

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
};

export async function POST(req: NextRequest) {
  try {
    // 1. Content-Type Header Enforcement
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Unsupported Media Type. Request Content-Type must be application/json." },
        { status: 415, headers: SECURITY_HEADERS }
      );
    }

    // 2. Rate Limiting Protection
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous_client";

    const rateCheck = globalRateLimiter.check(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before asking another question.",
        },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    // 3. Request Body Size & JSON Validation
    const textBody = await req.text().catch(() => null);
    if (!textBody || textBody.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload too large or empty. Maximum allowed request size is 250KB." },
        { status: 413, headers: SECURITY_HEADERS }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(textBody);
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON payload." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // 4. Validate request schema
    const validationResult = askRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400, headers: SECURITY_HEADERS });
    }

    const rawDocText = validationResult.data.documentText;
    const rawQuestion = validationResult.data.question;

    // 5. Security Sanitization & Prompt Injection Defense
    const documentText = sanitizeInputText(rawDocText);
    const question = sanitizeInputText(rawQuestion);

    const injectionCheck = detectPromptInjection(question);
    if (injectionCheck.isSuspicious) {
      return NextResponse.json(
        {
          error: "Question rejected: Potential prompt injection or jailbreak patterns detected.",
        },
        { status: 422, headers: SECURITY_HEADERS }
      );
    }

    // 6. Check LRU Cache
    const cacheKey = qaCache.hashKey("qa", `${documentText.slice(0, 100)}_${question}`);
    const cachedResponse = qaCache.get(cacheKey) as AskQuestionResponse | null;
    if (cachedResponse) {
      return NextResponse.json(
        {
          success: true,
          data: cachedResponse,
          cached: true,
        },
        { headers: SECURITY_HEADERS }
      );
    }

    // 7. Call Gemini AI
    const prompt = buildQAPrompt(documentText, question);
    const rawAiResult = await callGeminiJSON<unknown>(
      SYSTEM_INSTRUCTION_QA,
      prompt
    );

    // 8. Validate response schema
    const parsedResult = askResponseSchema.safeParse(rawAiResult);
    if (!parsedResult.success) {
      console.error(
        "[Ask API] Schema validation error on AI output:",
        parsedResult.error.format()
      );
      return NextResponse.json(
        {
          error:
            "The AI generated a response that did not match the expected format. Please try again.",
        },
        { status: 502, headers: SECURITY_HEADERS }
      );
    }

    const data = parsedResult.data;

    // 9. Deterministic Evidence Verification Layer
    let evidenceStatus: "verified" | "model_quoted" | "unverified" | "missing" = "missing";
    let isVerified = false;
    let finalEvidence = data.evidence;

    if (data.foundInDocument && data.evidence) {
      const verification = verifyEvidence(data.evidence, documentText);
      evidenceStatus = verification.status;
      isVerified = verification.isVerified;
      if (verification.status === "missing") {
        finalEvidence = "";
      }
    } else {
      evidenceStatus = "missing";
      finalEvidence = "";
    }

    const finalResponse: AskQuestionResponse = {
      ...data,
      evidence: finalEvidence,
      evidenceStatus,
      isVerified,
    };

    // Store in cache
    qaCache.set(cacheKey, finalResponse);

    return NextResponse.json(
      {
        success: true,
        data: finalResponse,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Ask API] Error:", error.message);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed: " + error.message },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
