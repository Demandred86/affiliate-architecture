import { describe, expect, it } from "vitest";
import {
  assertNoFabrication,
  checkFabrication,
} from "./index.js";

describe("fabrication guardrails", () => {
  it("rejects fabricated testing experience", () => {
    expect(
      checkFabrication({
        inputTexts: ["best garden kneeler"],
        outputTexts: ["We tested the best garden kneeler."],
      }),
    ).toEqual({
      ok: false,
      code: "FABRICATED_EXPERIENCE",
      evidence: "we tested",
    });
  });

  it("rejects numeric tokens absent from the source input", () => {
    expect(() =>
      assertNoFabrication({
        inputTexts: ["best garden kneeler"],
        outputTexts: ["Supports 300 pounds."],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "FABRICATED_NUMERIC",
        evidence: "300",
      }),
    );
  });

  it("allows sourced numbers and a kneeler keyword without a test claim", () => {
    expect(
      checkFabrication({
        inputTexts: ["best 10-inch garden kneeler"],
        outputTexts: ["Best garden kneeler with a 10 inch pad."],
      }),
    ).toEqual({ ok: true });
  });

  it("uses a configurable banned phrase list and fails closed on bad config", () => {
    expect(
      checkFabrication({
        inputTexts: ["garden tools"],
        outputTexts: ["Field verified garden tools"],
        bannedExperiencePhrases: ["field verified"],
      }),
    ).toMatchObject({ ok: false, code: "FABRICATED_EXPERIENCE" });

    expect(() =>
      checkFabrication({
        inputTexts: [],
        outputTexts: [],
        bannedExperiencePhrases: [""],
      }),
    ).toThrow("must not be empty");
  });
});
