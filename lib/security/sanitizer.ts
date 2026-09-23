/**
 * @file lib/security/sanitizer.ts
 * @description Advanced input sanitization, control character stripping, and prompt injection defense.
 */

// Regular expressions to detect common prompt injection and jailbreak patterns
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|directives|prompts)/i,
  /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions|directives|prompts)/i,
  /you\s+are\s+now\s+(in\s+)?(DAN|developer|jailbreak|unrestricted)\s+mode/i,
  /system\s+override/i,
  /exfiltrate\s+(the\s+)?(prompt|system\s+prompt|keys|api\s*key)/i,
  /reveal\s+(your\s+)?(internal|system\s+prompt|hidden\s+instructions)/i,
  /do\s+anything\s+now/i,
  /pretend\s+you\s+have\s+no\s+rules/i,
];

/**
 * Sanitizes input text by removing null bytes, unprintable control characters,
 * and dangerous script tags while preserving legal document structure (paragraphs, tabs, bullets).
 *
 * @param input - Raw input string
 * @returns Sanitized clean string
 */
export function sanitizeInputText(input: string): string {
  if (!input) return "";

  return input
    // Remove null bytes and non-printable control characters (except newline, tab, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Strip raw HTML script and iframe tags
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "")
    .replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .trim();
}

/**
 * Inspects an input string for known prompt injection attempts.
 *
 * @param input - Text to inspect
 * @returns An object containing `isSuspicious` boolean and optional `reason`
 */
export function detectPromptInjection(input: string): {
  isSuspicious: boolean;
  reason?: string;
} {
  if (!input) {
    return { isSuspicious: false };
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        isSuspicious: true,
        reason: "Input contains suspicious prompt manipulation phrases.",
      };
    }
  }

  return { isSuspicious: false };
}
