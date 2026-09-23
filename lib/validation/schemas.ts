import { z } from "zod";

export const reviewLevelEnum = z.enum([
  "Informational",
  "Review",
  "Needs clarification",
]);

export const clauseSchema = z.object({
  title: z.string().min(1, "Clause title is required"),
  category: z.string().default("General"),
  explanation: z.string().min(1, "Clause explanation is required"),
  parties: z.array(z.string()).default([]),
  riskLevel: reviewLevelEnum.default("Informational"),
  evidence: z.string().default("No explicit clause text quoted."),
  confidenceNote: z.string().optional(),
});

export const obligationSchema = z.object({
  party: z.string().min(1, "Party name is required"),
  obligation: z.string().min(1, "Obligation description is required"),
  evidence: z.string().default("No direct quote available."),
});

export const deadlineSchema = z.object({
  timeframe: z.string().min(1, "Timeframe is required"),
  description: z.string().min(1, "Deadline description is required"),
  evidence: z.string().default("No direct quote available."),
});

export const analysisResultSchema = z.object({
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

export const analyzeRequestSchema = z.object({
  documentText: z
    .string()
    .trim()
    .min(10, "Document text is too short (minimum 10 non-whitespace characters)")
    .max(100000, "Document text is too long (maximum 100,000 characters)"),
  documentTitle: z.string().trim().max(200).optional(),
});

export const askRequestSchema = z.object({
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

export const askResponseSchema = z.object({
  answer: z.string().min(1, "Answer is required"),
  evidence: z.string().default(""),
  foundInDocument: z.boolean().default(false),
  limitations: z.string().default("This answer is based strictly on the provided document text."),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type AnalysisResultParsed = z.infer<typeof analysisResultSchema>;
export type AskRequest = z.infer<typeof askRequestSchema>;
export type AskResponseParsed = z.infer<typeof askResponseSchema>;
export type ReviewLevel = z.infer<typeof reviewLevelEnum>;
