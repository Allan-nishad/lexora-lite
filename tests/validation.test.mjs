import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

// Re-create or import schemas to test in standalone runner
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
    .min(10, "Document text is too short (minimum 10 characters)")
    .max(100000, "Document text is too long (maximum 100,000 characters)"),
  documentTitle: z.string().max(200).optional(),
});

const askRequestSchema = z.object({
  documentText: z
    .string()
    .min(10, "Document text is required (minimum 10 characters)"),
  question: z
    .string()
    .min(2, "Question is too short")
    .max(1000, "Question is too long"),
});

const askResponseSchema = z.object({
  answer: z.string().min(1, "Answer is required"),
  evidence: z.string().default(""),
  foundInDocument: z.boolean().default(false),
  limitations: z.string().default("This answer is based strictly on the provided document text."),
});

// Test Suites
test("Analyze Request Validation - Rejects empty and too short input", () => {
  const emptyRes = analyzeRequestSchema.safeParse({ documentText: "" });
  assert.equal(emptyRes.success, false);

  const shortRes = analyzeRequestSchema.safeParse({ documentText: "Too short" });
  assert.equal(shortRes.success, false);
});

test("Analyze Request Validation - Accepts valid document and title", () => {
  const validRes = analyzeRequestSchema.safeParse({
    documentText: "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.",
    documentTitle: "Sample Agreement",
  });
  assert.equal(validRes.success, true);
  if (validRes.success) {
    assert.equal(validRes.data.documentTitle, "Sample Agreement");
  }
});

test("Analysis Result Validation - Successfully parses well-formed Gemini JSON", () => {
  const mockAiOutput = {
    summary: "This is a standard service agreement outlining payment, termination notice, and confidentiality between Client and Service Provider.",
    documentType: "Service Agreement",
    clauses: [
      {
        title: "Payment Terms",
        category: "Payment",
        explanation: "Client is required to pay invoices within a 30-day window.",
        parties: ["Client"],
        riskLevel: "Review",
        evidence: "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.",
        confidenceNote: "Explicitly defined payment timeline.",
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
        description: "Payment due following invoice receipt",
        evidence: "The Client shall pay the Service Provider within 30 days of receiving a valid invoice.",
      },
    ],
    reviewChecklist: [
      "Confirm invoice submission protocol and dispute procedures.",
    ],
    limitations: [
      "Informational only. Consult an attorney.",
    ],
  };

  const parsed = analysisResultSchema.safeParse(mockAiOutput);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.clauses[0].riskLevel, "Review");
    assert.equal(parsed.data.clauses[0].parties[0], "Client");
  }
});

test("Analysis Result Validation - Safely applies defaults when optional fields are omitted", () => {
  const minimalOutput = {
    summary: "A brief agreement.",
  };

  const parsed = analysisResultSchema.safeParse(minimalOutput);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.documentType, "Unspecified Legal Document");
    assert.equal(Array.isArray(parsed.data.clauses), true);
    assert.equal(parsed.data.clauses.length, 0);
  }
});

test("Ask Q&A Request & Response - Grounded answer vs Unsupported question handling", () => {
  // Validate Ask Request
  const validAskReq = askRequestSchema.safeParse({
    documentText: "The Client shall pay within 30 days.",
    question: "What is the deadline?",
  });
  assert.equal(validAskReq.success, true);

  const invalidAskReq = askRequestSchema.safeParse({
    documentText: "Short",
    question: "?",
  });
  assert.equal(invalidAskReq.success, false);

  // 1. Supported Question
  const supportedAnswer = {
    answer: "The agreement requires 30 days written notice for termination.",
    evidence: "Either party may terminate this agreement by providing 30 days written notice.",
    foundInDocument: true,
    limitations: "This answer is based strictly on the provided document text.",
  };
  const parsedSupported = askResponseSchema.safeParse(supportedAnswer);
  assert.equal(parsedSupported.success, true);
  if (parsedSupported.success) {
    assert.equal(parsedSupported.data.foundInDocument, true);
    assert.ok(parsedSupported.data.evidence.includes("30 days"));
  }

  // 2. Unsupported Question (e.g., Company Registration Number)
  const unsupportedAnswer = {
    answer: "The supplied document does not mention a registered company number.",
    evidence: "",
    foundInDocument: false,
    limitations: "This answer is based strictly on the provided document text.",
  };
  const parsedUnsupported = askResponseSchema.safeParse(unsupportedAnswer);
  assert.equal(parsedUnsupported.success, true);
  if (parsedUnsupported.success) {
    assert.equal(parsedUnsupported.data.foundInDocument, false);
    assert.equal(parsedUnsupported.data.evidence, "");
  }
});
