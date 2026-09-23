import test from "node:test";
import assert from "node:assert/strict";
import { verifyEvidence } from "../lib/validation/evidence.ts";
import { sanitizeInputText } from "../lib/security/sanitizer.ts";
import { analysisResultSchema } from "../lib/validation/schemas.ts";

// Sample Real-world Contract Documents
const EMPLOYMENT_CONTRACT = `
EMPLOYMENT AGREEMENT
1. POSITION AND DUTIES: Employee agrees to serve as Lead Software Engineer.
2. COMPENSATION: Base salary of $140,000 per annum, payable bi-weekly.
3. TERMINATION: Either party may terminate this agreement with two (2) weeks written notice.
4. NON-COMPETE: Employee shall not engage in competing software development for a period of twelve (12) months following termination within the state.
5. CONFIDENTIALITY: All company source code and client lists remain strictly proprietary.
`;

const NDA_CONTRACT = `
MUTUAL NON-DISCLOSURE AGREEMENT
1. DEFINITION OF CONFIDENTIAL INFORMATION: Proprietary technology, financial forecasts, and trade secrets disclosed between the parties.
2. EXCLUSIONS: Information already in the public domain or independently developed.
3. DURATION: Confidentiality obligations shall continue for three (3) years from the date of disclosure.
4. RETURN OF MATERIALS: Upon written request, receiving party must return or destroy all confidential records within ten (10) business days.
`;

const LEASE_AGREEMENT = `
RESIDENTIAL LEASE AGREEMENT
1. TERM: The lease commences on November 1, 2026 and expires on October 31, 2027.
2. RENT: Tenant shall pay $2,200 per month due on the first day of each calendar month. Late fee of $75 applies after the 5th day.
3. SECURITY DEPOSIT: A deposit of $2,200 is held in an escrow account and refundable within 30 days after vacating.
4. PETS: No pets are allowed without written permission and a $300 pet deposit.
`;

test("Scenario 1 (Employment Contract): Verifies 12-month non-compete and 2-week notice quotes", () => {
  const nonCompeteQuote = "Employee shall not engage in competing software development for a period of twelve (12) months following termination";
  const noticeQuote = "Either party may terminate this agreement with two (2) weeks written notice.";

  const v1 = verifyEvidence(nonCompeteQuote, EMPLOYMENT_CONTRACT);
  assert.equal(v1.isVerified, true);
  assert.equal(v1.status, "verified");

  const v2 = verifyEvidence(noticeQuote, EMPLOYMENT_CONTRACT);
  assert.equal(v2.isVerified, true);
  assert.equal(v2.status, "verified");
});

test("Scenario 2 (Mutual NDA): Accurately verifies 3-year term and 10-day return policy", () => {
  const durationQuote = "Confidentiality obligations shall continue for three (3) years from the date of disclosure.";
  const returnQuote = "return or destroy all confidential records within ten (10) business days.";

  assert.equal(verifyEvidence(durationQuote, NDA_CONTRACT).isVerified, true);
  assert.equal(verifyEvidence(returnQuote, NDA_CONTRACT).isVerified, true);
});

test("Scenario 3 (Residential Lease): Verifies rent, deposit, and pet restrictions", () => {
  const rentQuote = "Tenant shall pay $2,200 per month due on the first day of each calendar month.";
  const petQuote = "No pets are allowed without written permission and a $300 pet deposit.";

  assert.equal(verifyEvidence(rentQuote, LEASE_AGREEMENT).isVerified, true);
  assert.equal(verifyEvidence(petQuote, LEASE_AGREEMENT).isVerified, true);
});

test("Scenario 4 (Corrupted Input): Sanitizes dirty input and validates schema compliance", () => {
  const dirtyDoc = sanitizeInputText(`${EMPLOYMENT_CONTRACT}\n<script>window.stealKeys()</script>`);
  assert.equal(dirtyDoc.includes("<script>"), false);

  const parsed = analysisResultSchema.safeParse({
    summary: "Standard full-time employment agreement.",
    documentType: "Employment Contract",
    clauses: [
      {
        title: "Non-Compete Covenant",
        category: "Liability",
        explanation: "Restricts competing software work for 12 months post-employment.",
        parties: ["Employee"],
        riskLevel: "Review",
        evidence: "Employee shall not engage in competing software development for a period of twelve (12) months",
      },
    ],
    obligations: [
      {
        party: "Employee",
        obligation: "Serve as Lead Software Engineer.",
        evidence: "Employee agrees to serve as Lead Software Engineer.",
      },
    ],
    deadlines: [
      {
        timeframe: "2 weeks",
        description: "Written notice required for termination.",
        evidence: "Either party may terminate this agreement with two (2) weeks written notice.",
      },
    ],
    reviewChecklist: ["Review enforceability of 12-month non-compete with counsel."],
    limitations: ["Educational analysis only."],
    missingOrUnclearInfo: ["Severance package terms are unstated."],
  });

  assert.equal(parsed.success, true);
});
