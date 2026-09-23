# ⚖️ LEXORA LITE
### *Understand Before You Sign*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Zod](https://img.shields.io/badge/Validated_with-Zod-3E67B1?style=for-the-badge&logo=zod)](https://zod.dev/)
[![Status](https://img.shields.io/badge/PromptWars-MVP_Submission-emerald?style=for-the-badge)](https://promptwars.dev)

> **Solo Submission** for the **PromptWars Virtual Exclusive Edition**  
> **Challenge:** *AI for Legal Assistance & Access*  
> **Repository:** [https://github.com/Allan-nishad/lexora-lite](https://github.com/Allan-nishad/lexora-lite)

---

## 📑 Table of Contents
1. [Overview & Problem Statement](#-1-overview--problem-statement)
2. [Core Capabilities & Feature Matrix](#-2-core-capabilities--feature-matrix)
3. [Deterministic Evidence Verification Engine](#-3-deterministic-evidence-verification-engine)
4. [GenAI Architecture & Data Flow](#-4-genai-architecture--data-flow)
5. [Prompt Engineering & Safety Directives](#-5-prompt-engineering--safety-directives)
6. [Quick Start & Local Installation](#-6-quick-start--local-installation)
7. [Interactive Demo & Test Scenarios](#-7-interactive-demo--test-scenarios)
8. [Automated Testing & Quality Suite](#-8-automated-testing--quality-suite)
9. [Accessibility & WCAG 2.1 Conformance](#-9-accessibility--wcag-21-conformance)
10. [Legal Safety, Privacy & Scope Boundaries](#-10-legal-safety-privacy--scope-boundaries)

---

## 🎯 1. Overview & Problem Statement

Every day, freelancers, small business owners, and consumers sign agreements filled with archaic legalese, ambiguous terms, strict deadlines, and one-sided liabilities. Professional legal review is often inaccessible for routine agreements, while generic LLMs frequently hallucinate dates, terms, and non-existent obligations.

**LEXORA LITE** is an educational legal document assistant that bridges this gap. It translates complex contracts into structured, plain-language insights backed by a **deterministic evidence verification engine** that mathematically verifies all quoted citations against raw source text with **zero hallucinations**.

### 🔄 The Before & After Experience

| Traditional Contract Review | With LEXORA LITE |
| :--- | :--- |
| ❌ Dense paragraphs of confusing legalese | ✅ Executive plain-language summary in 2–3 sentences |
| ❌ Buried liabilities and hidden deadlines | ✅ Color-coded clause cards (*Informational*, *Review*, *Needs Clarification*) |
| ❌ Vague assumptions about party responsibilities | ✅ Isolated party duties (Client vs. Provider vs. Landlord) |
| ❌ Chatbots hallucinating unmentioned terms | ✅ Deterministic quote verification & omission detection |
| ❌ Uncertainty about what to ask an attorney | ✅ Pre-signing checklist generated dynamically for legal consultation |

---

## ✨ 2. Core Capabilities & Feature Matrix

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                              LEXORA LITE SUITE                              │
  ├──────────────────────┬──────────────────────┬───────────────────────────────┤
  │   📥 DOCUMENT        │    🔍 GROUNDED       │       💬 CONVERSATIONAL       │
  │      INPUT           │       ANALYSIS       │          ASSISTANT            │
  │  • Textarea editor   │  • Executive summary │  • Grounded Q&A console       │
  │  • File upload (.txt)│  • Clause extraction │  • Deterministic quote checks │
  │  • Sample presets    │  • Party obligations │  • Unstated info detection    │
  │  • Read-time metric  │  • Timeline limits   │  • Suggested inquiry chips    │
  └──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 1. Document Input & Presets
- **Multi-Format Input:** Direct text pasting or drag-and-drop file upload (`.txt`, `.md`).
- **One-Click Demo Presets:** Pre-loaded standard agreements (*Service Agreement*, *Mutual NDA*, and *Independent Contractor Agreement*).
- **Live Metrics:** Real-time character count, word count, and estimated reading time.

### 2. Grounded Clause Extraction & Review Levels
- **Executive Summary:** High-level operational overview identifying document type.
- **Categorized Breakdown:** Automatic categorization (*Payment*, *Termination*, *Confidentiality*, *Deliverables*, *Liability*).
- **Balanced Review Indicators:**
  - 🔵 **Informational:** Standard operational provisions.
  - 🟡 **Review Needed:** Critical commercial terms, payment deadlines, or notice windows.
  - 🟣 **Needs Clarification:** Ambiguous definitions or one-sided requirements.
- **Verbatim Evidence Quotes:** Every clause includes an expandable box containing the exact source quotation with one-click clipboard copying.

### 3. Party Obligations & Timeline Milestones
- **Party Separation:** Distinguishes duties for each signing entity.
- **Milestone Cards:** Highlights fixed time periods, payment windows, and notice intervals.

### 4. Interactive Pre-Signing Checklist
- **Preparation for Legal Counsel:** Actionable discussion points to raise with an attorney.
- **Local State Tracking:** Check off reviewed items with a live progress bar.
- **Export Capabilities:** One-click **"Export .MD"** (downloads formatted markdown) and **"Copy Report"** functions.

### 5. Document-Grounded Q&A Console
- **Strict Bounding:** Answers questions using *only* facts explicitly stated in the document.
- **Anti-Hallucination Detection:** Flags unmentioned inquiries (e.g., company registration numbers) with a clear `Not Specified in Document Text` badge.

---

## 🔬 3. Deterministic Evidence Verification Engine

To ensure that AI-generated citations are genuine and never fabricated, LEXORA LITE incorporates a **deterministic evidence verification layer** ([`lib/validation/evidence.ts`](file:///c:/Users/allan/Documents/Projects/Lexora%20Lite/lib/validation/evidence.ts)).

```
+-------------------------------------------------------------------------------+
|                        DETERMINISTIC VERIFICATION FLOW                        |
+-------------------------------------------------------------------------------+
  [ Model Quoted Evidence ] ───► [ Normalization & Strip Quotes ]
                                              │
                                              ▼
                             [ Check Substring in Source Text ]
                                    /                   \
                            MATCH FOUND?              NO MATCH?
                                /                           \
                               ▼                             ▼
                    🟢 STATUS: "verified"            [ Token Overlap Check ]
                 (Verified in Source Text)                 /         \
                                                   OVERLAP ≥ 80%?   < 80%
                                                         /             \
                                                        ▼               ▼
                                              🟡 "model_quoted"    🔴 "unverified"
                                              (Partial Citation)   (Review Needed)
```

### Citation Status Tiers
1. 🟢 **`Verified in Source Text`**: The quoted citation exists verbatim in the source document.
2. 🟡 **`Model Supporting Reference`**: The quote closely matches (≥ 80% token overlap) with minor punctuation or whitespace variations.
3. 🔴 **`Unverified Citation • Review Needed`**: The citation text is missing from the document; the item is automatically escalated to **"Review Needed"**.
4. ⚪ **`Evidence Unavailable`**: Rendered safely when no textual quote exists.

---

## 🏗️ 4. GenAI Architecture & Data Flow

```
                      [ USER LEGAL DOCUMENT ]
                      (Text / Preset Sample)
                                │
                                ▼
                   [ NEXT.JS APP ROUTER (UI) ]
              - Length & character validation
              - Reading time estimation & preset loader
                                │
                                ▼ POST /api/analyze | POST /api/ask
               [ SERVER API ROUTE (Edge / Node) ]
              - Request validation via Zod Schemas
              - Untrusted input isolation
              - Secret protection (API key on server)
                                │
                                ▼
                     [ GOOGLE GEMINI ENGINE ]
              - Structured JSON mode (application/json)
              - Low temperature (0.1) for high factual fidelity
              - Supported: Gemini 3.5 Flash / Flash-Lite / 3.6 / 2.5
                                │
                                ▼
                  [ ZOD RUNTIME PARSER & CHECKER ]
              - Validates all fields, arrays, and enums
                                │
                                ▼
                [ DETERMINISTIC EVIDENCE VERIFIER ]
              - Cross-checks quotes against raw source text
              - Flags unverified text & escalates risk
                                │
                                ▼
                   [ LEXORA LITE RESULTS HUB ]
              - Executive overview & metric counters
              - Clause comparison & verified quotes
              - Interactive checklist & Q&A history
```

---

## 🛡️ 5. Prompt Engineering & Safety Directives

LEXORA LITE uses defensible system instructions engineered in [`lib/ai/prompts.ts`](file:///c:/Users/allan/Documents/Projects/Lexora%20Lite/lib/ai/prompts.ts):

1. **Untrusted Input Isolation:** Treats all user text strictly as raw data to prevent prompt injection and jailbreaking attempts.
2. **Verbatim Evidence Mandate:** Instructs the model to quote exact sentence fragments rather than paraphrasing.
3. **No Definitive Legal Rulings:** Strictly forbids declaring contracts "legal", "illegal", or "binding", positioning all output as educational comprehension assistance.
4. **Explicit Negative Grounding:** For Q&A, if a detail is omitted from the contract, the model is instructed to return `foundInDocument: false` and explicitly state that the text does not mention the topic.

---

## ⚡ 6. Quick Start & Local Installation

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** (or `pnpm` / `yarn`)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/app/apikey)) OR an OpenAI-compatible virtual gateway (e.g., Hidevs).

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Allan-nishad/lexora-lite.git
   cd lexora-lite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the project root:

   **Option A: Using Google AI Studio directly:**
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```

   **Option B: Using an LLM Gateway (e.g., Hidevs):**
   ```env
   GEMINI_API_KEY=sk-your_virtual_key_here
   GEMINI_BASE_URL=https://llm.hidevs.xyz
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 7. Interactive Demo & Test Scenarios

### Scenario A: Standard Service Agreement
1. Open the app and click **"Load Sample" &rarr; "Service Agreement"**.
2. Click **"Analyze Document"** (or press <kbd>Ctrl+Enter</kbd>).
3. Observe:
   - **Executive Summary:** Identifies the 30-day payment and termination terms.
   - **Payment Clause:** Classified as *Review Needed* with the exact verified invoice quote.
   - **Confidentiality:** Attributed to the Service Provider.

### Scenario B: Verification of Grounded Q&A
- **Supported Query:**  
  *Question:* *"What is the payment deadline?"*  
  *Result:*  
  🟢 **Grounded in Document &bull; Verified Quote:** *"The Client must pay the Service Provider within 30 days of receiving a valid invoice."*  
  *Quote:* `"The Client shall pay the Service Provider within 30 days of receiving a valid invoice."`

- **Unsupported Query (Testing Hallucination Prevention):**  
  *Question:* *"What is the client's registered company number?"*  
  *Result:*  
  🟡 **Not Specified in Document Text:** *"The supplied document does not mention the client company registration number."*

---

## 🚦 8. Automated Testing & Quality Suite

The codebase includes an extensive **18-suite automated test matrix** in [`tests/`](file:///c:/Users/allan/Documents/Projects/Lexora%20Lite/tests/) exercising real behaviors:
- **Input Validation & Bounds:** Rejection of empty/whitespace inputs and 100,000 character limit enforcement.
- **Security Sanitizer:** Striping of malicious `<script>` / `<iframe>` tags, control characters, and known prompt injection patterns.
- **Rate Limiting Engine:** Sliding window rate limit verification and burst flood protection.
- **LRU Cache & Deduplication:** Sub-millisecond hash key retrieval, eviction order, and TTL expiration.
- **Deterministic Evidence Engine:** Exact quote matching, whitespace normalization, and fabricated quote rejection.
- **Real Contract Scenarios:** Automated evaluation of Employment Agreements (non-compete clauses), Mutual NDAs (return policies), and Residential Leases (deposits & pet rules).
- **Zod Schema Conformance:** Strict schema verification of Gemini JSON outputs and negative grounding checks.

```bash
# Run all 18 automated test suites
npm test

# Run TypeScript strict type-checker
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Build production bundle
npm run build
```

---

## ♿ 9. Accessibility & WCAG 2.1 Conformance

LEXORA LITE is built with full keyboard accessibility and screen reader support:
- **ARIA Accordions:** `aria-expanded` and `aria-controls` on evidence panels.
- **Checklist Semantics:** `role="checkbox"` and `aria-checked` with keyboard toggling (<kbd>Space</kbd> / <kbd>Enter</kbd>).
- **Progress Tracking:** `role="progressbar"` with `aria-valuenow` for live feedback.
- **Screen Reader Announcements:** `aria-live="polite"` on metric counters and `role="alert"` on error banners.
- **Color Independence:** Statuses use text labels, distinct borders, and icons rather than color alone.

---

## ⚖️ 10. Legal Safety, Privacy & Scope Boundaries

### Legal Notice
> **LEXORA LITE is an educational document comprehension tool.** It does not provide legal representation, determine binding validity, or replace consultation with a qualified legal professional.

### Privacy & Scope Design
- **100% Stateless Processing:** No document text or conversation logs are stored in a database.
- **Server-Side API Key Security:** Keys and upstream endpoints are never exposed to the client browser.
- **MVP Boundaries:** Does not include permanent document archiving, OCR image scanning, or multi-user accounts in this submission to maintain privacy and fast responsiveness.

---

<div align="center">
  <sub>Built for the <strong>PromptWars Virtual Exclusive Edition</strong> &bull; AI for Legal Assistance & Access</sub>
</div>
