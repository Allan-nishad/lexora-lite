import { AnalysisResult, AskQuestionResponse } from "@/types/analysis";
import { SYSTEM_INSTRUCTION_ANALYSIS, SYSTEM_INSTRUCTION_QA, buildAnalysisPrompt, buildQAPrompt } from "@/lib/ai/prompts";
import { callGeminiJSON } from "@/lib/ai/gemini";
import { analysisResultSchema, askResponseSchema } from "@/lib/validation/schemas";
import { verifyEvidence } from "@/lib/validation/evidence";
import { sanitizeInputText, detectPromptInjection } from "@/lib/security/sanitizer";
import { analysisCache, qaCache } from "@/lib/cache/lru-cache";

/**
 * Executes document analysis seamlessly across both server and static GitHub Pages environments.
 *
 * @param documentText - Raw text of the legal document
 * @param documentTitle - Optional title/name of the agreement
 * @returns Fully validated and verified AnalysisResult object
 */
export async function executeDocumentAnalysis(
  documentText: string,
  documentTitle?: string
): Promise<AnalysisResult> {
  const cleanDocText = sanitizeInputText(documentText);
  const cleanDocTitle = documentTitle ? sanitizeInputText(documentTitle) : undefined;

  const injectionCheck = detectPromptInjection(cleanDocText);
  if (injectionCheck.isSuspicious) {
    throw new Error("Document submission rejected: Potential prompt injection or jailbreak patterns detected.");
  }

  // Check in-memory LRU cache
  const cacheKey = analysisCache.hashKey("analysis", `${cleanDocTitle || ""}_${cleanDocText}`);
  const cached = analysisCache.get(cacheKey) as AnalysisResult | null;
  if (cached) {
    return cached;
  }

  // First, attempt to call the Next.js API route (when running in dev mode / server runtime)
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentText: cleanDocText, documentTitle: cleanDocTitle }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        analysisCache.set(cacheKey, data.data);
        return data.data;
      }
    }
  } catch {
    // API route not reachable (e.g., static hosting on GitHub Pages) -> proceed to client execution
  }

  // Direct client execution for GitHub Pages static export
  const prompt = buildAnalysisPrompt(cleanDocText, cleanDocTitle);
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
    const verification = verifyEvidence(clause.evidence, cleanDocText);
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
    const verification = verifyEvidence(obligation.evidence, cleanDocText);
    return {
      ...obligation,
      evidence: verification.status === "missing" ? "Evidence unavailable in original document." : obligation.evidence,
      evidenceStatus: verification.status,
      isVerified: verification.isVerified,
    };
  });

  const verifiedDeadlines = data.deadlines.map((deadline) => {
    const verification = verifyEvidence(deadline.evidence, cleanDocText);
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

  analysisCache.set(cacheKey, finalResult);
  return finalResult;
}

/**
 * Executes grounded document Q&A seamlessly across both server and static GitHub Pages environments.
 *
 * @param documentText - Raw text of the legal document
 * @param question - User's inquiry regarding the document
 * @returns Fully verified AskQuestionResponse
 */
export async function executeDocumentQA(
  documentText: string,
  question: string
): Promise<AskQuestionResponse> {
  const cleanDocText = sanitizeInputText(documentText);
  const cleanQuestion = sanitizeInputText(question);

  const injectionCheck = detectPromptInjection(cleanQuestion);
  if (injectionCheck.isSuspicious) {
    throw new Error("Question rejected: Potential prompt injection or jailbreak patterns detected.");
  }

  const cacheKey = qaCache.hashKey("qa", `${cleanDocText.slice(0, 100)}_${cleanQuestion}`);
  const cached = qaCache.get(cacheKey) as AskQuestionResponse | null;
  if (cached) {
    return cached;
  }

  // First, attempt to call the Next.js API route
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentText: cleanDocText, question: cleanQuestion }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        qaCache.set(cacheKey, data.data);
        return data.data;
      }
    }
  } catch {
    // Static fallback
  }

  const prompt = buildQAPrompt(cleanDocText, cleanQuestion);
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
    const verification = verifyEvidence(data.evidence, cleanDocText);
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

  qaCache.set(cacheKey, finalResponse);
  return finalResponse;
}
