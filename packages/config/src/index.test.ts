import { describe, expect, it } from "vitest";
import { loadConfig } from "./index.js";

describe("config", () => {
  it("loads all three safe budget defaults without an env file", () => {
    const config = loadConfig({});

    expect(config).toMatchObject({
      DAILY_BUDGET_USD: 1,
      MAX_COST_PER_RUN_USD: 0.05,
      MAX_PROJECT_BUDGET_USD: 5,
    });
  });

  it("rejects invalid and inconsistent caps", () => {
    expect(() => loadConfig({ DAILY_BUDGET_USD: "-1" })).toThrow();
    expect(() =>
      loadConfig({
        DAILY_BUDGET_USD: "1",
        MAX_COST_PER_RUN_USD: "2",
      }),
    ).toThrow();
  });
});
