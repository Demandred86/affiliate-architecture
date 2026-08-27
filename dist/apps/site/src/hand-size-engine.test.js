import { describe, expect, it } from "vitest";
import { recommendPruner } from "./hand-size-engine.js";
describe("hand-size-engine", () => {
    it("recommends Okatsune 101 for small-hand input in Okatsune guideline range", () => {
        const result = recommendPruner({ handLengthCm: 17, palmWidthCm: 7.5, priority: null });
        expect(result.recommendedProductId).toBe("okatsune101");
        expect(result.confidence).toBe("high");
    });
    it("recommends FELCO 6 for medium-ish input above Okatsune range", () => {
        const result = recommendPruner({ handLengthCm: 19, palmWidthCm: 8.5, priority: null });
        expect(result.recommendedProductId).toBe("felco6");
    });
    it("recommends FELCO 15 when rotating-handle preference is selected", () => {
        const result = recommendPruner({
            handLengthCm: 17,
            palmWidthCm: 7.5,
            priority: "ergonomic_handle",
        });
        expect(result.recommendedProductId).toBe("felco15");
    });
    it("recommends Okatsune 101 when maximum-capacity preference is selected", () => {
        const result = recommendPruner({
            handLengthCm: 17,
            palmWidthCm: 7.5,
            priority: "maximum_cutting_capacity",
        });
        expect(result.recommendedProductId).toBe("okatsune101");
    });
    it("handles missing input with low-confidence default", () => {
        const result = recommendPruner({ handLengthCm: null, palmWidthCm: null, priority: null });
        expect(result.recommendedProductId).toBe("okatsune101");
        expect(result.confidence).toBe("low");
        expect(result.disclaimer).toContain("editorial guide");
    });
    it("handles boundary values at Okatsune range edges", () => {
        const lower = recommendPruner({ handLengthCm: 16, palmWidthCm: 7, priority: null });
        const upper = recommendPruner({ handLengthCm: 18.5, palmWidthCm: 8.5, priority: null });
        expect(lower.recommendedProductId).toBe("okatsune101");
        expect(upper.recommendedProductId).toBe("okatsune101");
    });
    it("recommends Darlac for lightest-weight priority", () => {
        const result = recommendPruner({
            handLengthCm: 17,
            palmWidthCm: 7.5,
            priority: "lightest_weight",
        });
        expect(result.recommendedProductId).toBe("darlacDp930");
    });
    it("recommends FELCO 14 for premium/serviceability priority", () => {
        const result = recommendPruner({
            handLengthCm: 17,
            palmWidthCm: 7.5,
            priority: "premium_serviceability",
        });
        expect(result.recommendedProductId).toBe("felco14");
    });
});
//# sourceMappingURL=hand-size-engine.test.js.map