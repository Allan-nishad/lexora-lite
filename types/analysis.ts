export type ReviewLevel = "Informational" | "Review" | "Needs clarification";

export interface ExtractedClause {
  title: string;
  category: string;
  explanation: string;
  parties: string[];
  riskLevel: ReviewLevel;
  evidence: string;
  confidenceNote?: string;
}

export interface ObligationItem {
  party: string;
  obligation: string;
  evidence: string;
}

export interface DeadlineItem {
  timeframe: string;
  description: string;
  evidence: string;
}

export interface AnalysisResult {
  summary: string;
  documentType: string;
  clauses: ExtractedClause[];
  obligations: ObligationItem[];
  deadlines: DeadlineItem[];
  reviewChecklist: string[];
  limitations: string[];
  missingOrUnclearInfo?: string[];
}

export interface AskQuestionRequest {
  documentText: string;
  question: string;
}

export interface AskQuestionResponse {
  answer: string;
  evidence: string;
  foundInDocument: boolean;
  limitations: string;
}

export interface AnalyzeDocumentRequest {
  documentText: string;
  documentTitle?: string;
}
