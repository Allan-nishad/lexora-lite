import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema, analysisResultSchema } from "@/lib/validation/schemas";
import { SYSTEM_INSTRUCTION_ANALYSIS, buildAnalysisPrompt } from "@/lib/ai/prompts";
import { callGeminiJSON } from "@/lib/ai/gemini";
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

    // 1. Validate incoming request
    const validationResult = analyzeRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { documentText, documentTitle } = validationResult.data;

    // 2. Build structured prompt and call Google Gemini
    const prompt = buildAnalysisPrompt(documentText, documentTitle);
    const rawAiResult = await callGeminiJSON<unknown>(
      SYSTEM_INSTRUCTION_ANALYSIS,
      prompt
    );

    // 3. Validate structured AI response with Zod
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

    // 4. Return validated result
    return NextResponse.json({
      success: true,
      data: parsedResult.data,
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
            "Google Gemini API key is not configured on the server. Please provide a valid GEMINI_API_KEY in .env.local.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while analyzing the document.",
      },
      { status: 500 }
    );
  }
}
