export declare const DEFAULT_BANNED_EXPERIENCE_PHRASES: readonly ["we tested", "we personally tested", "our testing", "in our tests", "hands-on testing"];
export type FabricationFailureCode = "FABRICATED_EXPERIENCE" | "FABRICATED_NUMERIC";
export type FabricationCheck = {
    ok: true;
} | {
    ok: false;
    code: FabricationFailureCode;
    evidence: string;
};
export interface FabricationGuardrailInput {
    inputTexts: readonly string[];
    outputTexts: readonly string[];
    bannedExperiencePhrases?: readonly string[];
}
export declare class FabricationGuardrailError extends Error {
    readonly code: FabricationFailureCode;
    readonly evidence: string;
    constructor(code: FabricationFailureCode, evidence: string);
}
export declare function extractNumericTokens(text: string): ReadonlySet<string>;
export declare function checkFabrication(input: FabricationGuardrailInput): FabricationCheck;
export declare function assertNoFabrication(input: FabricationGuardrailInput): void;
//# sourceMappingURL=index.d.ts.map