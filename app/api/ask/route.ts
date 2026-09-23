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

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection
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
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // 2. Validate request schema
    const validationResult = askRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const rawDocText = validationResult.data.documentText;
    const rawQuestion = validationResult.data.question;

    // 3. Security Sanitization & Prompt Injection Defense
    const documentText = sanitizeInputText(rawDocText);
    const question = sanitizeInputText(rawQuestion);

    const injectionCheck = detectPromptInjection(question);
    if (injectionCheck.isSuspicious) {
      return NextResponse.json(
        {
          error: "Question rejected: Potential prompt injection or jailbreak patterns detected.",
        },
        { status: 422 }
      );
    }

    // 4. Check LRU Cache
    const cacheKey = qaCache.hashKey("qa", `${documentText.slice(0, 100)}_${question}`);
    const cachedResponse = qaCache.get(cacheKey) as AskQuestionResponse | null;
    if (cachedResponse) {
      return NextResponse.json({
        success: true,
        data: cachedResponse,
        cached: true,
      });
    }

    // 5. Call Gemini AI
    const prompt = buildQAPrompt(documentText, question);
    const rawAiResult = await callGeminiJSON<unknown>(
      SYSTEM_INSTRUCTION_QA,
      prompt
    );

    // 6. Validate response schema
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
        { status: 502 }
      );
    }

    const data = parsedResult.data;

    // 7. Deterministic Evidence Verification Layer
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

    return NextResponse.json({
      success: true,
      data: finalResponse,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Ask API] Error:", error.message);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed: " + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
