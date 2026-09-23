/**
 * Deterministic Evidence Verification Utility for LEXORA LITE
 * 
 * Verifies that AI-quoted evidence strings exist in the raw source document text.
 * Distinguishes between deterministically verified verbatim quotes, model-provided supporting text,
 * and unverified or missing citations.
 */

export type EvidenceVerificationStatus =
  | "verified"        // Exact or normalized whitespace substring found in source document
  | "model_quoted"    // Model-provided quote that closely matches but has minor phrasing differences
  | "unverified"      // Quote text was not found in the source document
  | "missing";        // No quote provided

export interface EvidenceVerificationResult {
  status: EvidenceVerificationStatus;
  isVerified: boolean;
  displayText: string;
  badgeLabel: string;
  badgeVariant: "emerald" | "amber" | "rose" | "slate";
}

/**
 * Normalizes text for safe whitespace and punctuation comparisons
 */
export function normalizeTextForComparison(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035']/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036"]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deterministically checks whether an evidence quote exists in the source document.
 */
export function verifyEvidence(
  evidence: string | undefined | null,
  sourceDocumentText: string | undefined | null
): EvidenceVerificationResult {
  const rawEvidence = (evidence || "").trim();
  const rawSource = (sourceDocumentText || "").trim();

  // 1. Missing or placeholder evidence
  const lowerEv = rawEvidence.toLowerCase();
  if (
    !rawEvidence ||
    rawEvidence === "No explicit clause text quoted." ||
    rawEvidence === "No direct quote available." ||
    rawEvidence === "Evidence unavailable" ||
    lowerEv === "n/a" ||
    lowerEv === "none" ||
    lowerEv.startsWith("not specified") ||
    lowerEv.startsWith("not mentioned") ||
    rawEvidence.length < 3
  ) {
    return {
      status: "missing",
      isVerified: false,
      displayText: "Evidence unavailable in original document.",
      badgeLabel: "Evidence Unavailable",
      badgeVariant: "slate",
    };
  }

  // If no source document is provided for comparison, return model-quoted status
  if (!rawSource) {
    return {
      status: "model_quoted",
      isVerified: false,
      displayText: rawEvidence,
      badgeLabel: "Model-Provided Reference",
      badgeVariant: "amber",
    };
  }

  const normEvidence = normalizeTextForComparison(rawEvidence);
  const normSource = normalizeTextForComparison(rawSource);

  // 2. Exact or normalized substring match (Deterministic Verification)
  if (normSource.includes(normEvidence)) {
    return {
      status: "verified",
      isVerified: true,
      displayText: rawEvidence,
      badgeLabel: "Verified in Source Document",
      badgeVariant: "emerald",
    };
  }

  // 3. Check stripped quotes and punctuation
  const cleanEvidence = normEvidence.replace(/^["']+|["']+$/g, "").trim();
  if (cleanEvidence.length >= 5 && normSource.includes(cleanEvidence)) {
    return {
      status: "verified",
      isVerified: true,
      displayText: rawEvidence,
      badgeLabel: "Verified in Source Document",
      badgeVariant: "emerald",
    };
  }

  // 4. Token overlap comparison for minor paraphrasing
  const evidenceWords = normEvidence.split(/\s+/).filter((w) => w.length > 2);
  if (evidenceWords.length >= 3) {
    const matchedWords = evidenceWords.filter((w) => normSource.includes(w));
    const overlapRatio = matchedWords.length / evidenceWords.length;

    if (overlapRatio >= 0.8) {
      return {
        status: "model_quoted",
        isVerified: false,
        displayText: rawEvidence,
        badgeLabel: "Supporting Reference (Partial Overlap)",
        badgeVariant: "amber",
      };
    }
  }

  // 5. Unverified / Quote not found in source text
  return {
    status: "unverified",
    isVerified: false,
    displayText: rawEvidence,
    badgeLabel: "Unverified Citation &bull; Review Needed",
    badgeVariant: "rose",
  };
}
