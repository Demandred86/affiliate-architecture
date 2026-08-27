const OKATSUNE_HAND_LENGTH_MIN = 16;
const OKATSUNE_HAND_LENGTH_MAX = 18.5;
const OKATSUNE_PALM_WIDTH_MIN = 7;
const OKATSUNE_PALM_WIDTH_MAX = 8.5;
const PRODUCT_NAMES = {
    okatsune101: "Okatsune 101",
    felco14: "FELCO 14",
    darlacDp930: "Darlac DP930",
    felco15: "FELCO 15",
    felco6: "FELCO 6",
};
const DISCLAIMER = "This is a simple editorial guide based on published specifications—not a medical or ergonomic assessment. Try tools in person when possible.";
function inOkatsuneSmallRange(handLengthCm, palmWidthCm) {
    return (handLengthCm >= OKATSUNE_HAND_LENGTH_MIN &&
        handLengthCm <= OKATSUNE_HAND_LENGTH_MAX &&
        palmWidthCm >= OKATSUNE_PALM_WIDTH_MIN &&
        palmWidthCm <= OKATSUNE_PALM_WIDTH_MAX);
}
function slightlyLargerHands(handLengthCm, palmWidthCm) {
    return (handLengthCm > OKATSUNE_HAND_LENGTH_MAX &&
        handLengthCm <= 20 &&
        palmWidthCm >= OKATSUNE_PALM_WIDTH_MIN &&
        palmWidthCm <= 9.5);
}
function buildResult(recommendedProductId, reason, alternativeProductId, alternativeReason, confidence = "medium") {
    return {
        recommendedProductId,
        recommendedName: PRODUCT_NAMES[recommendedProductId] ?? recommendedProductId,
        reason,
        alternativeProductId,
        alternativeName: PRODUCT_NAMES[alternativeProductId] ?? alternativeProductId,
        alternativeReason,
        disclaimer: DISCLAIMER,
        confidence,
    };
}
function recommendByPriority(priority) {
    switch (priority) {
        case "lightest_weight":
            return buildResult("darlacDp930", "Among models here, Darlac DP930 is positioned as the lightweight small-hand option (verify weight conflict before buying).", "okatsune101", "Okatsune 101 is also compact with published weight around 177–180 g and stronger rated capacity.", "medium");
        case "maximum_cutting_capacity":
            return buildResult("okatsune101", "Okatsune 101 lists the highest published cutting capacity in this group (25 mm).", "felco6", "FELCO 6 offers 20 mm capacity with FELCO serviceability if your hands fit Medium sizing.", "high");
        case "premium_serviceability":
            return buildResult("felco14", "FELCO 14 is the compact Small model with replaceable parts and lifetime handle warranty (manufacturer terms).", "felco6", "FELCO 6 adds capacity if Medium sizing fits your hand.", "high");
        case "ergonomic_handle":
            return buildResult("felco15", "FELCO 15 adds a rotating handle; FELCO claims up to 30% cutting-force reduction (manufacturer claim).", "felco14", "FELCO 14 is lighter if you prefer a fixed handle.", "high");
        default:
            return null;
    }
}
/**
 * Deterministic hand-size recommendation engine. No AI, no API.
 */
export function recommendPruner(input) {
    const { handLengthCm, palmWidthCm, priority = null } = input;
    if (priority) {
        const priorityResult = recommendByPriority(priority);
        if (priorityResult)
            return priorityResult;
    }
    if (handLengthCm === null || palmWidthCm === null || handLengthCm <= 0 || palmWidthCm <= 0) {
        return buildResult("okatsune101", "Enter hand length and palm width for a tailored suggestion. Default editorial pick for small hands: Okatsune 101.", "felco14", "Premium alternative with FELCO Small sizing and serviceability.", "low");
    }
    if (inOkatsuneSmallRange(handLengthCm, palmWidthCm)) {
        if (priority === "premium_serviceability") {
            return recommendByPriority("premium_serviceability");
        }
        return buildResult("okatsune101", "Your measurements fall within Okatsune's published guideline for model 101 (16–18.5 cm length, 7–8.5 cm palm width).", "felco14", "Consider FELCO 14 if you prefer Swiss serviceability and independent recognition over maximum rated cut diameter.", "high");
    }
    if (slightlyLargerHands(handLengthCm, palmWidthCm)) {
        return buildResult("felco6", "Your measurements are above Okatsune 101's guideline but may still suit a compact Medium tool with more capacity.", "felco14", "FELCO 14 remains the dedicated Small model if reach feels manageable.", "medium");
    }
    if (handLengthCm < OKATSUNE_HAND_LENGTH_MIN || palmWidthCm < OKATSUNE_PALM_WIDTH_MIN) {
        return buildResult("okatsune101", "Measurements are below Okatsune's published 101 range, but the 101 is still the most compact option in this comparison.", "darlacDp930", "Darlac DP930 offers the shortest body (175 mm) and slim handles—verify weight data before purchase.", "low");
    }
    return buildResult("felco6", "Measurements exceed small-hand guidelines for Okatsune 101; FELCO 6 may fit small-to-medium hands needing higher capacity.", "felco14", "If grip still feels large, compare against FELCO 14 Small sizing in a store.", "medium");
}
export const HAND_SIZE_ENGINE_VERSION = "1.0.0-m2.5";
//# sourceMappingURL=hand-size-engine.js.map