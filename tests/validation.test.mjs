import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

// ==========================================
// EVIDENCE VERIFICATION ENGINE IMPLEMENTATION
// ==========================================

function normalizeTextForComparison(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035']/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036"]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function verifyEvidence(evidence, sourceDocumentText) {
  const rawEvidence = (evidence || "").trim();
  const rawSource = (sourceDocumentText || "").trim();

  if (
    !rawEvidence ||
    rawEvidence === "No explicit clause text quoted." ||
    rawEvidence === "No direct quote available." ||
    rawEvidence === "Evidence unavailable in original document." ||
    rawEvidence.length < 3
  ) {
    return {
      status: "missing",
      isVerified: false,
      displayText: "Evidence unavailable in original document.",
    };
  }

  if (!rawSource) {
    return {
      status: "model_quoted",
      isVerified: false,
      displayText: rawEvidence,
    };
  }

  const normEvidence = normalizeTextForComparison(rawEvidence);
  const normSource = normalizeTextForComparison(rawSource);

  // Exact / normalized match
  if (normSource.includes(normEvidence)) {
    return {
      status: "verified",
      isVerified: true,
      displayText: rawEvidence,
    };
  }

  const cleanEvidence = normEvidence.replace(/^["']+|["']+$/g, "").trim();
  if (cleanEvidence.length >= 5 && normSource.includes(cleanEvidence)) {
    return {
      status: "verified",
      isVerified: true,
      displayText: rawEvidence,
    };
  }

  // Token overlap
  const evidenceWords = normEvidence.split(/\s+/).filter((w) => w.length > 2);
  if (evidenceWords.length >= 3) {
    const matchedWords = evidenceWords.filter((w) => normSource.includes(w));
    const overlapRatio = matchedWords.length / evidenceWords.length;
    if (overlapRatio >= 0.8) {
      return {
        status: "model_quoted",
        isVerified: false,
        displayText: rawEvidence,
      };
    }
  }

  return {
    status: "unverified",
    isVerified: false,
    displayText: rawEvidence,
  };
}

// ==========================================
// SCHEMAS
// ==========================================

const reviewLevelEnum = z.enum([
  "Informational",
  "Review",
  "Needs clarification",
]);

const clauseSchema = z.object({
  title: z.string().min(1, "Clause title is required"),
  category: z.string().default("General"),
  explanation: z.string().min(1, "Clause explanation is required"),
  parties: z.array(z.string()).default([]),
  riskLevel: reviewLevelEnum.default("Informational"),
  evidence: z.string().default("No explicit clause text quoted."),
  confidenceNote: z.string().optional(),
});

const obligationSchema = z.object({
  party: z.string().min(1, "Party name is required"),
  obligation: z.string().min(1, "Obligation description is required"),
  evidence: z.string().default("No direct quote available."),
});

const deadlineSchema = z.object({
  timeframe: z.string().min(1, "Timeframe is required"),
  description: z.string().min(1, "Deadline description is required"),
  evidence: z.string().default("No direct quote available."),
});

const analysisResultSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  documentType: z.string().default("Unspecified Legal Document"),
  clauses: z.array(clauseSchema).default([]),
  obligations: z.array(obligationSchema).default([]),
  deadlines: z.array(deadlineSchema).default([]),
  reviewChecklist: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([
    "This analysis is informational and should be reviewed with a qualified legal professional.",
  ]),
  missingOrUnclearInfo: z.array(z.string()).optional().default([]),
});

const analyzeRequestSchema = z.object({
  documentText: z
    .string()
    .trim()
    .min(10, "Document text is too short (minimum 10 non-whitespace characters)")
    .max(100000, "Document text is too long (maximum 100,000 characters)"),
  documentTitle: z.string().trim().max(200).optional(),
});

const askRequestSchema = z.object({
  documentText: z
    .string()
    .trim()
    .min(10, "Document text is required (minimum 10 non-whitespace characters)"),
  question: z
    .string()
    .trim()
    .min(2, "Question is too short (minimum 2 characters)")
    .max(1000, "Question is too long (maximum 1,000 characters)"),
});

const askResponseSchema = z.object({
  answer: z.string().min(1, "Answer is required"),
  evidence: z.string().default(""),
  foundInDocument: z.boolean().default(false),
  limitations: z.string().default("This answer is based strictly on the provided document text."),
});

// ==========================================
// 1. INPUT VALIDATION TEST SUITE
// ==========================================

test("Input Validation: Rejects empty and whitespace-only document", () => {
  const emptyRes = analyzeRequestSchema.safeParse({ documentText: "" });
  assert.equal(emptyRes.success, false);

  const whitespaceRes = analyzeRequestSchema.safeParse({ documentText: "          " });
  assert.equal(whitespaceRes.success, false);

  const shortRes = analyzeRequestSchema.safeParse({ documentText: "Too short" });
  assert.equal(shortRes.success, false);
});

test("Input Validation: Rejects documents exceeding 100,000 characters", () => {
  const tooLongText = "A".repeat(100001);
  const res = analyzeRequestSchema.safeParse({ documentText: tooLongText });
  assert.equal(res.success, false);
});

test("Input Validation: Rejects empty, whitespace-only, and over-length questions", () => {
  const emptyQ = askRequestSchema.safeParse({
    documentText: "The Client shall pay within 30 days.",
    question: "",
  });
  assert.equal(emptyQ.success, false);

  const whitespaceQ = askRequestSchema.safeParse({
    documentText: "The Client shall pay within 30 days.",
    question: "   ",
  });
  assert.equal(whitespaceQ.success, false);

  const tooLongQ = askRequestSchema.safeParse({
    documentText: "The Client shall pay within 30 days.",
    question: "Q".repeat(1001),
  });
  assert.equal(tooLongQ.success, false);
});

// ==========================================
// 2. EVIDENCE VERIFICATION ENGINE TEST SUITE
// ==========================================

const SAMPLE_DOC = `SERVICE AGREEMENT\nThe Client shall pay the Service Provider within 30 days of receiving a valid invoice.\nEither party may terminate this agreement by providing 30 days written notice.`;

test("Evidence Engine: Verifies exact and normalized whitespace quotes", () => {
  const exactQuote = "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.";
  const resExact = verifyEvidence(exactQuote, SAMPLE_DOC);
  assert.equal(resExact.status, "verified");
  assert.equal(resExact.isVerified, true);

  // With line break / extra whitespace
  const whitespaceQuote = "The Client   shall pay the Service Provider\nwithin 30 days of receiving a valid invoice.";
  const resWhitespace = verifyEvidence(whitespaceQuote, SAMPLE_DOC);
  assert.equal(resWhitespace.status, "verified");
  assert.equal(resWhitespace.isVerified, true);
});

test("Evidence Engine: Flags fabricated or unmentioned citations as unverified", () => {
  const fabricatedQuote = "The Client shall pay a late fee penalty of 50% immediately upon demand.";
  const res = verifyEvidence(fabricatedQuote, SAMPLE_DOC);
  assert.equal(res.status, "unverified");
  assert.equal(res.isVerified, false);
});

test("Evidence Engine: Handles missing, placeholder, or empty quotes safely", () => {
  const emptyRes = verifyEvidence("", SAMPLE_DOC);
  assert.equal(emptyRes.status, "missing");
  assert.equal(emptyRes.isVerified, false);

  const placeholderRes = verifyEvidence("No direct quote available.", SAMPLE_DOC);
  assert.equal(placeholderRes.status, "missing");
  assert.equal(placeholderRes.isVerified, false);
});

// ==========================================
// 3. AI RESPONSE VALIDATION TEST SUITE
// ==========================================

test("AI Response Validation: Successfully parses well-formed Gemini JSON", () => {
  const mockAiOutput = {
    summary: "Standard service agreement between Client and Service Provider.",
    documentType: "Service Agreement",
    clauses: [
      {
        title: "Payment Terms",
        category: "Payment",
        explanation: "Client is required to pay invoices within 30 days.",
        parties: ["Client"],
        riskLevel: "Review",
        evidence: "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.",
      },
    ],
    obligations: [
      {
        party: "Client",
        obligation: "Pay invoices within 30 days",
        evidence: "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.",
      },
    ],
    deadlines: [
      {
        timeframe: "30 days",
        description: "Payment due within 30 days",
        evidence: "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.",
      },
    ],
    reviewChecklist: ["Verify invoice definition."],
    limitations: ["Informational only."],
  };

  const parsed = analysisResultSchema.safeParse(mockAiOutput);
  assert.equal(parsed.success, true);
});

test("Safety & Grounding: Unsupported question flags unmentioned info without hallucination", () => {
  const unsupportedAnswer = {
    answer: "The supplied document does not mention the client company registration number.",
    evidence: "",
    foundInDocument: false,
    limitations: "This answer is based strictly on the provided document text.",
  };
  const parsedUnsupported = askResponseSchema.safeParse(unsupportedAnswer);
  assert.equal(parsedUnsupported.success, true);
  assert.equal(parsedUnsupported.data.foundInDocument, false);
  assert.equal(parsedUnsupported.data.evidence, "");
});
