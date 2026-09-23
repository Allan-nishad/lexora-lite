import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema, analysisResultSchema } from "@/lib/validation/schemas";
import { SYSTEM_INSTRUCTION_ANALYSIS, buildAnalysisPrompt } from "@/lib/ai/prompts";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { verifyEvidence } from "@/lib/validation/evidence";
import { sanitizeInputText, detectPromptInjection } from "@/lib/security/sanitizer";
import { globalRateLimiter } from "@/lib/security/rate-limiter";
import { analysisCache } from "@/lib/cache/lru-cache";
import { AnalysisResult } from "@/types/analysis";
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
          error: "Rate limit exceeded. Please wait a few seconds before analyzing another document.",
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

    // 2. Validate incoming request structure
    const validationResult = analyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const rawDocText = validationResult.data.documentText;
    const rawDocTitle = validationResult.data.documentTitle;

    // 3. Security Sanitization & Injection Detection
    const documentText = sanitizeInputText(rawDocText);
    const documentTitle = rawDocTitle ? sanitizeInputText(rawDocTitle) : undefined;

    const injectionCheck = detectPromptInjection(documentText);
    if (injectionCheck.isSuspicious) {
      return NextResponse.json(
        {
          error: "Document submission rejected: Potential prompt injection or jailbreak patterns detected.",
        },
        { status: 422 }
      );
    }

    // 4. Check LRU Cache for Instant Response
    const cacheKey = analysisCache.hashKey("analysis", `${documentTitle || ""}_${documentText}`);
    const cachedResult = analysisCache.get(cacheKey) as AnalysisResult | null;
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: cachedResult,
        cached: true,
      });
    }

    // 5. Build prompt and invoke Google Gemini
    const prompt = buildAnalysisPrompt(documentText, documentTitle);
    const rawAiResult = await callGeminiJSON<unknown>(
      SYSTEM_INSTRUCTION_ANALYSIS,
      prompt
    );

    // 6. Validate AI output against strict Zod schema
    const parsedResult = analysisResultSchema.safeParse(rawAiResult);
    if (!parsedResult.success) {
      console.error(
        "[Analyze API] Schema validation error on AI output:",
        parsedResult.error.format()
      );
      return NextResponse.json(
        {
          error:
            "The AI generated a response that did not match the required schema. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = parsedResult.data;

    // 7. Deterministic Evidence Verification Layer
    const verifiedClauses = data.clauses.map((clause) => {
      const verification = verifyEvidence(clause.evidence, documentText);
      let riskLevel = clause.riskLevel;

      if (verification.status === "unverified" || verification.status === "missing") {
        if (riskLevel === "Informational") {
          riskLevel = "Review";
        }
      }

      return {
        ...clause,
        riskLevel,
        evidence: verification.status === "missing" ? "Evidence unavailable in original document." : clause.evidence,
        evidenceStatus: verification.status,
        isVerified: verification.isVerified,
      };
    });

    const verifiedObligations = data.obligations.map((obligation) => {
      const verification = verifyEvidence(obligation.evidence, documentText);
      return {
        ...obligation,
        evidence: verification.status === "missing" ? "Evidence unavailable in original document." : obligation.evidence,
        evidenceStatus: verification.status,
        isVerified: verification.isVerified,
      };
    });

    const verifiedDeadlines = data.deadlines.map((deadline) => {
      const verification = verifyEvidence(deadline.evidence, documentText);
      return {
        ...deadline,
        evidence: verification.status === "missing" ? "Evidence unavailable in original document." : deadline.evidence,
        evidenceStatus: verification.status,
        isVerified: verification.isVerified,
      };
    });

    const finalResult: AnalysisResult = {
      ...data,
      clauses: verifiedClauses,
      obligations: verifiedObligations,
      deadlines: verifiedDeadlines,
    };

    // Save in LRU cache
    analysisCache.set(cacheKey, finalResult);

    return NextResponse.json({
      success: true,
      data: finalResult,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Analyze API] Error:", error.message);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed: " + error.message },
        { status: 400 }
      );
    }

    if (error.message.includes("GEMINI_API_KEY is not configured")) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal analysis error: " + error.message },
      { status: 500 }
    );
  }
}
