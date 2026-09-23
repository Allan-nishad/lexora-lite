import { AnalysisResult, AskQuestionResponse } from "@/types/analysis";
import { SYSTEM_INSTRUCTION_ANALYSIS, SYSTEM_INSTRUCTION_QA, buildAnalysisPrompt, buildQAPrompt } from "@/lib/ai/prompts";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { analysisResultSchema, askResponseSchema } from "@/lib/validation/schemas";
import { verifyEvidence } from "@/lib/validation/evidence";

/**
 * Executes document analysis seamlessly across both server and static GitHub Pages environments.
 */
export async function executeDocumentAnalysis(
  documentText: string,
  documentTitle?: string
): Promise<AnalysisResult> {
  // First, attempt to call the Next.js API route (when running in dev mode / server runtime)
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentText, documentTitle }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {
    // API route not reachable (e.g., static hosting on GitHub Pages) -> proceed to client execution
  }

  // Direct client execution for GitHub Pages static export
  const prompt = buildAnalysisPrompt(documentText, documentTitle);
  const rawAiResult = await callGeminiJSON<unknown>(
    SYSTEM_INSTRUCTION_ANALYSIS,
    prompt
  );

  const parsedResult = analysisResultSchema.safeParse(rawAiResult);
  if (!parsedResult.success) {
    throw new Error(
      "The AI model generated an unexpected response format. Please retry."
    );
  }

  const data = parsedResult.data;

  // Deterministic Evidence Verification Layer
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

  return {
    ...data,
    clauses: verifiedClauses,
    obligations: verifiedObligations,
    deadlines: verifiedDeadlines,
  };
}

/**
 * Executes grounded document Q&A seamlessly across both server and static GitHub Pages environments.
 */
export async function executeDocumentQA(
  documentText: string,
  question: string
): Promise<AskQuestionResponse> {
  // First, attempt to call the Next.js API route
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentText, question }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch {
    // Static fallback
  }

  const prompt = buildQAPrompt(documentText, question);
  const rawAiResult = await callGeminiJSON<unknown>(
    SYSTEM_INSTRUCTION_QA,
    prompt
  );

  const parsedResult = askResponseSchema.safeParse(rawAiResult);
  if (!parsedResult.success) {
    throw new Error(
      "The AI model generated an unexpected format for the answer. Please retry."
    );
  }

  const data = parsedResult.data;
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

  return {
    ...data,
    evidence: finalEvidence,
    evidenceStatus,
    isVerified,
  };
}
