import { NextRequest, NextResponse } from "next/server";
import { askRequestSchema, askResponseSchema } from "@/lib/validation/schemas";
import { SYSTEM_INSTRUCTION_QA, buildQAPrompt } from "@/lib/ai/prompts";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { verifyEvidence } from "@/lib/validation/evidence";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // 1. Validate request
    const validationResult = askRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { documentText, question } = validationResult.data;

    // 2. Call Gemini
    const prompt = buildQAPrompt(documentText, question);
    const rawAiResult = await callGeminiJSON<unknown>(
      SYSTEM_INSTRUCTION_QA,
      prompt
    );

    // 3. Validate response schema
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

    // 4. Deterministic Evidence Verification Layer
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

    // 5. Return validated result
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        evidence: finalEvidence,
        evidenceStatus,
        isVerified,
      },
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

    if (error.message.includes("GEMINI_API_KEY is not configured")) {
      return NextResponse.json(
        {
          error:
            "Google Gemini API key is not configured on the server. Please provide a valid GEMINI_API_KEY in .env.local.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while processing your question.",
      },
      { status: 500 }
    );
  }
}
