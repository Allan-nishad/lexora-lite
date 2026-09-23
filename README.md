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

---

## 📑 Table of Contents
1. [Overview & Problem Statement](#-1-overview--problem-statement)
2. [Core Capabilities & Feature Matrix](#-2-core-capabilities--feature-matrix)
3. [GenAI Architecture & Data Flow](#-3-genai-architecture--data-flow)
4. [Prompt Engineering & Safety Directives](#-4-prompt-engineering--safety-directives)
5. [Quick Start & Local Installation](#-5-quick-start--local-installation)
6. [Interactive Demo & Test Scenarios](#-6-interactive-demo--test-scenarios)
7. [Automated Testing & Validation](#-7-automated-testing--validation)
8. [Legal Safety, Privacy & Scope Boundaries](#-8-legal-safety-privacy--scope-boundaries)

---

## 🎯 1. Overview & Problem Statement

Every day, freelancers, small business owners, and consumers sign agreements filled with archaic legalese, ambiguous terms, strict deadlines, and one-sided liabilities. Professional legal review is often costly and inaccessible for simple agreements, while generic chatbots frequently hallucinate dates, terms, and non-existent obligations.

**LEXORA LITE** is an educational legal assistance MVP that transforms dense contracts into structured, plain-language insights with **100% verbatim grounded evidence** directly from the source text.

### 🔄 The Before & After Experience

| Traditional Contract Review | With LEXORA LITE |
| :--- | :--- |
| ❌ Dense paragraphs of confusing legalese | ✅ Executive plain-language summary in 2–3 sentences |
| ❌ Buried liabilities and hidden deadlines | ✅ Color-coded clause cards (*Informational*, *Review*, *Needs Clarification*) |
| ❌ Vague assumptions about party responsibilities | ✅ Isolated party duties (Client vs. Provider vs. Landlord) |
| ❌ Chatbots hallucinating unmentioned terms | ✅ Strict grounding with verbatim quotes & instant omission detection |
| ❌ Uncertainty about what to ask an attorney | ✅ Pre-signing checklist generated dynamically for legal consultation |

---

## ✨ 2. Core Capabilities & Feature Matrix

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                           LEXORA LITE SUITE                             │
  ├─────────────────────┬─────────────────────┬─────────────────────────────┤
  │   📥 DOCUMENT       │    🔍 GROUNDED      │       💬 CONVERSATIONAL     │
  │      INPUT          │       ANALYSIS      │          ASSISTANT          │
  │  • Textarea editor  │  • Executive summary│  • Grounded Q&A console     │
  │  • File upload      │  • Clause extraction│  • Exact quote citations    │
  │  • Sample presets   │  • Party obligations│  • Unstated info detection  │
  │  • Read-time metric │  • Timeline limits  │  • Suggested inquiry chips  │
  └─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### 1. Document Input & Presets
- **Multi-Format Input:** Direct text pasting or drag-and-drop file upload (`.txt`, `.md`).
- **One-Click Demo Presets:** Includes pre-loaded standard agreements (*Service Agreement*, *Mutual NDA*, and *Independent Contractor Agreement*).
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
- **Export Capabilities:** One-click **"Export .MD"** and **"Copy Report"** functions.

### 5. Document-Grounded Q&A Console
- **Strict Bounding:** Answers questions using *only* facts explicitly stated in the document.
- **Anti-Hallucination Indicator:** Flags unmentioned inquiries (e.g., company registration numbers or unstated fees) with a clear `Not Specified in Document` badge.

---

## 🏗️ 3. GenAI Architecture & Data Flow

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
              - Ensures evidence string integrity
                                │
                                ▼
                   [ LEXORA LITE RESULTS HUB ]
              - Executive overview & metric counters
              - Clause comparison & verifiable quotes
              - Interactive checklist & Q&A history
```

---

## 🛡️ 4. Prompt Engineering & Safety Directives

LEXORA LITE uses defensible, secure system instructions engineered in [`lib/ai/prompts.ts`](file:///c:/Users/allan/Documents/Projects/Lexora%20Lite/lib/ai/prompts.ts):

1. **Untrusted Input Isolation:** Treats all user text strictly as raw data to prevent prompt injection and jailbreaking attempts.
2. **Verbatim Evidence Mandate:** Instructs the model to quote exact sentence fragments rather than paraphrasing.
3. **No Definitive Legal Rulings:** Strictly forbids declaring contracts "legal", "illegal", or "binding", positioning all output as educational comprehension assistance.
4. **Explicit Negative Grounding:** For Q&A, if a detail is omitted from the contract, the model is instructed to return `foundInDocument: false` and explicitly state that the text does not mention the topic.

---

## ⚡ 5. Quick Start & Local Installation

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** (or `pnpm` / `yarn`)
- **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/app/apikey)) OR an OpenAI-compatible virtual gateway (e.g., Hidevs).

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lexora-lite.git
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

## 🧪 6. Interactive Demo & Test Scenarios

### Scenario A: Standard Service Agreement
1. Open the app and click **"Load Sample" &rarr; "Service Agreement"**.
2. Click **"Analyze Document"** (or press <kbd>Ctrl+Enter</kbd>).
3. Observe:
   - **Executive Summary:** Identifies the 30-day payment and termination terms.
   - **Payment Clause:** Classified as *Review Needed* with the exact invoice quote.
   - **Confidentiality:** Attributed to the Service Provider.

### Scenario B: Verification of Grounded Q&A
- **Supported Query:**  
  *Question:* *"What is the payment deadline?"*  
  *Result:*  
  🟢 **Grounded in Document:** *"The Client must pay the Service Provider within 30 days of receiving a valid invoice."*  
  *Quote:* `"The Client shall pay the Service Provider within 30 days of receiving a valid invoice."`

- **Unsupported Query (Testing Hallucination Prevention):**  
  *Question:* *"What is the client's registered company number?"*  
  *Result:*  
  🟡 **Not Specified in Document Text:** *"The supplied document does not mention the client company registration number."*

---

## 🚦 7. Automated Testing & Validation

The codebase includes an automated validation test suite in [`tests/validation.test.mjs`](file:///c:/Users/allan/Documents/Projects/Lexora%20Lite/tests/validation.test.mjs) verifying:
- Request input limits (rejection of empty/short inputs).
- Zod schema adherence for Gemini responses.
- Safe default fallbacks for missing optional attributes.
- Grounded vs. ungrounded Q&A response validation.

```bash
# Run automated tests
npm test

# Run TypeScript type-checker
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Build production bundle
npm run build
```

---

## ⚖️ 8. Legal Safety, Privacy & Scope Boundaries

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
