export type ReviewLevel = "Informational" | "Review" | "Needs clarification";
export type EvidenceStatus = "verified" | "model_quoted" | "unverified" | "missing";

export interface ExtractedClause {
  title: string;
  category: string;
  explanation: string;
  parties: string[];
  riskLevel: ReviewLevel;
  evidence: string;
  confidenceNote?: string;
  evidenceStatus?: EvidenceStatus;
  isVerified?: boolean;
}

export interface ObligationItem {
  party: string;
  obligation: string;
  evidence: string;
  evidenceStatus?: EvidenceStatus;
  isVerified?: boolean;
}

export interface DeadlineItem {
  timeframe: string;
  description: string;
  evidence: string;
  evidenceStatus?: EvidenceStatus;
  isVerified?: boolean;
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
  evidenceStatus?: EvidenceStatus;
  isVerified?: boolean;
}

export interface AnalyzeDocumentRequest {
  documentText: string;
  documentTitle?: string;
}
