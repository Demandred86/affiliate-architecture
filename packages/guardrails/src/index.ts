export const DEFAULT_BANNED_EXPERIENCE_PHRASES = [
  "we tested",
  "we personally tested",
  "our testing",
  "in our tests",
  "hands-on testing",
] as const;

export type FabricationFailureCode =
  | "FABRICATED_EXPERIENCE"
  | "FABRICATED_NUMERIC";

export type FabricationCheck =
  | { ok: true }
  | {
      ok: false;
      code: FabricationFailureCode;
      evidence: string;
    };

export interface FabricationGuardrailInput {
  inputTexts: readonly string[];
  outputTexts: readonly string[];
  bannedExperiencePhrases?: readonly string[];
}

export class FabricationGuardrailError extends Error {
  public constructor(
    public readonly code: FabricationFailureCode,
    public readonly evidence: string,
  ) {
    super(`${code}: ${evidence}`);
    this.name = "FabricationGuardrailError";
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(text: string, phrase: string): boolean {
  const pattern = escapeRegExp(phrase.trim()).replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${pattern}(?=$|[^\\p{L}\\p{N}])`, "iu").test(
    text,
  );
}

function canonicalNumericToken(token: string): string {
  const hasPercent = token.endsWith("%");
  const numeric = token.replaceAll(",", "").replace(/%$/, "");
  const value = Number(numeric);
  if (!Number.isFinite(value)) {
    throw new TypeError(`Unparseable numeric token: ${token}`);
  }
  return `${Object.is(value, -0) ? 0 : value}${hasPercent ? "%" : ""}`;
}

export function extractNumericTokens(text: string): ReadonlySet<string> {
  const matches = text.match(
    /(?<![\p{L}\p{N}])[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?(?![\p{L}\p{N}])/gu,
  );
  return new Set((matches ?? []).map(canonicalNumericToken));
}

export function checkFabrication(
  input: FabricationGuardrailInput,
): FabricationCheck {
  const phrases =
    input.bannedExperiencePhrases ?? DEFAULT_BANNED_EXPERIENCE_PHRASES;
  const output = input.outputTexts.join("\n");

  for (const phrase of phrases) {
    if (phrase.trim().length === 0) {
      throw new TypeError("Banned experience phrases must not be empty");
    }
    if (containsPhrase(output, phrase)) {
      return {
        ok: false,
        code: "FABRICATED_EXPERIENCE",
        evidence: phrase,
      };
    }
  }

  const inputNumbers = extractNumericTokens(input.inputTexts.join("\n"));
  for (const number of extractNumericTokens(output)) {
    if (!inputNumbers.has(number)) {
      return {
        ok: false,
        code: "FABRICATED_NUMERIC",
        evidence: number,
      };
    }
  }

  return { ok: true };
}

export function assertNoFabrication(input: FabricationGuardrailInput): void {
  const result = checkFabrication(input);
  if (!result.ok) {
    throw new FabricationGuardrailError(result.code, result.evidence);
  }
}
