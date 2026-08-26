import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { createLogger } from "./index.js";

describe("structured logging", () => {
  it("writes valid JSON with a trace id and redacts secrets", () => {
    let output = "";
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });

    createLogger("trace-123", destination).info(
      { apiKey: "do-not-log" },
      "pipeline started",
    );

    const entry = JSON.parse(output) as Record<string, unknown>;
    expect(entry.trace_id).toBe("trace-123");
    expect(entry.msg).toBe("pipeline started");
    expect(entry.apiKey).toBe("[REDACTED]");
    expect(output).not.toContain("do-not-log");
  });
});
