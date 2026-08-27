export type SourceType = "manufacturer" | "independent" | "retailer" | "unknown";
export type Confidence = "high" | "medium" | "low";
export type ClaimKind = "fact" | "manufacturer_claim" | "independent_test" | "editorial" | "unknown";
export type AffiliateStatus = "unknown" | "available" | "not_verified";
export interface ProvenanceField<T> {
    value: T;
    source: string;
    sourceType: SourceType;
    confidence: Confidence;
    claimKind?: ClaimKind;
    status?: "verified" | "verify" | "conflict" | "unknown";
    min?: number;
    max?: number;
    notes?: string;
}
export interface ProductSource {
    id: string;
    name: string;
    sourceType: SourceType;
    url: string;
    claimsSupported: string[];
    checkedAt: string;
}
export interface AffiliateRetailer {
    retailer: string;
    market: string;
    url: string;
    status: AffiliateStatus;
}
export interface PriceObservation {
    price: number | null;
    currency: string;
    retailer: string;
    market: string;
    checkedAt: string;
    source: string;
    note?: string;
}
export interface Product {
    id: string;
    name: string;
    brand: string;
    model: string;
    recommendationLabel: string;
    handSize: ProvenanceField<string>;
    lengthMm: ProvenanceField<number>;
    weightG: ProvenanceField<number> & {
        min?: number;
        max?: number;
    };
    cuttingCapacityMm: ProvenanceField<number>;
    mechanism: string;
    dexterity?: string;
    keyFeatures: string[];
    bestFor: string;
    limitations: string[];
    whyWeLikeIt: string[];
    whoShouldBuy: string;
    whoShouldSkip: string;
    editorialNotes?: string[];
    sources: string[];
    affiliate: {
        status: AffiliateStatus;
        retailers: AffiliateRetailer[];
    };
    priceObservations?: PriceObservation[];
    evidenceConfidence: Confidence;
}
export interface QuickAnswer {
    label: string;
    productId: string;
    claimKind: "editorial";
}
export interface FaqItem {
    question: string;
    answer: string;
}
export interface ArticleMeta {
    slug: string;
    primaryKeyword: string;
    title: string;
    h1: string;
    seoTitle: string;
    metaDescription: string;
    canonicalPlaceholder: string;
    openGraph: {
        title: string;
        description: string;
    };
    quickAnswers: QuickAnswer[];
    faq: FaqItem[];
    comparisons: Array<{
        id: string;
        title: string;
        paragraphs: string[];
    }>;
}
export type HandSizePriority = "lightest_weight" | "maximum_cutting_capacity" | "premium_serviceability" | "ergonomic_handle" | null;
export interface HandSizeInput {
    handLengthCm: number | null;
    palmWidthCm: number | null;
    priority?: HandSizePriority;
}
export interface HandSizeRecommendation {
    recommendedProductId: string;
    recommendedName: string;
    reason: string;
    alternativeProductId: string;
    alternativeName: string;
    alternativeReason: string;
    disclaimer: string;
    confidence: Confidence;
}
/** Placeholder for future M9 learning loop — not populated in M2.5 */
export interface RecommendationRecord {
    articleSlug: string;
    productId: string;
    recommendationType: string;
    evidenceSummary: string;
    decision: string;
    confidence: Confidence;
    performanceMetrics: {
        ranking: number | null;
        ctr: number | null;
        affiliateClicks: number | null;
        conversion: number | null;
        revenue: number | null;
    };
}
//# sourceMappingURL=types.d.ts.map