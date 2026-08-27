import { AgentRunner } from "@ase/agent-core";
import { keywordAnalyses, keywordClusterMembers, keywordFacets, keywordScores, keywords, niches, } from "@ase/database";
import { opportunityScoreSchema, } from "@ase/schemas";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
export const OPPORTUNITY_MODEL_VERSION = "1.0.0";
export const MISSING_COMMERCIAL_INPUTS = [
    "search_volume",
    "keyword_difficulty",
    "cpc",
    "serp_retrieved",
    "aov_or_commission",
];
const scoringInputSchema = z
    .object({
    keywordId: z.uuid(),
    patternType: z.enum([
        "BEST_X_FOR_Y",
        "BEST_ATTRIBUTE_X",
        "X_VS_Y",
        "BEST_X_UNDER_PRICE",
        "HOW_TO_CHOOSE_X",
        "BUYING_GUIDE",
        "OTHER",
    ]),
    intentType: z.enum([
        "COMMERCIAL_INVESTIGATION",
        "TRANSACTIONAL",
        "INFORMATIONAL",
        "MIXED",
        "UNKNOWN",
    ]),
    hasQualifier: z.boolean(),
    facetCount: z.number().int().nonnegative(),
    clusterSize: z.number().int().positive(),
    analysisConfidence: z.number().min(0).max(1),
    nicheActive: z.boolean(),
})
    .strict();
function commercialIntent(intent) {
    if (intent === "COMMERCIAL_INVESTIGATION" || intent === "TRANSACTIONAL") {
        return 1;
    }
    if (intent === "MIXED")
        return 0.6;
    if (intent === "INFORMATIONAL")
        return 0.3;
    return 0.2;
}
function specificity(input) {
    const qualifier = input.hasQualifier ? 0.4 : 0;
    const facets = Math.min(0.4, input.facetCount * 0.2);
    const grammar = input.patternType === "BEST_X_FOR_Y" ||
        input.patternType === "BEST_ATTRIBUTE_X"
        ? 0.2
        : 0;
    return Math.min(1, qualifier + facets + grammar);
}
export function calculateOpportunityScore(input) {
    const components = {
        specificity: specificity(input),
        commercial_intent: commercialIntent(input.intentType),
        cluster_support: Math.min(1, (input.clusterSize - 1) / 4),
        extraction_ok: input.analysisConfidence,
        niche_fit: input.nicheActive ? 1 : 0,
    };
    const raw = 0.35 * components.specificity +
        0.3 * components.commercial_intent +
        0.15 * components.cluster_support +
        0.15 * components.extraction_ok +
        0.05 * components.niche_fit;
    const score = Math.round(raw * 100_000) / 1_000;
    const band = score >= 70
        ? "PROVISIONAL_HIGH"
        : score >= 50
            ? "PROVISIONAL_MEDIUM"
            : "PROVISIONAL_LOW";
    return opportunityScoreSchema.parse({
        scoreKind: "OPPORTUNITY_SCORE",
        modelId: "opportunity-v1",
        modelVersion: OPPORTUNITY_MODEL_VERSION,
        score,
        band,
        dataCompleteness: 0.4,
        components,
        missingInputs: [...MISSING_COMMERCIAL_INPUTS],
    });
}
const scoringJob = {
    agentId: "scoring",
    agentVersion: OPPORTUNITY_MODEL_VERSION,
    prompt: {
        name: "opportunity-v1",
        version: OPPORTUNITY_MODEL_VERSION,
        content: "Apply approved opportunity-v1 analysis-only weights. Never use M1 hypotheses or invent commercial metrics.",
    },
    inputSchema: scoringInputSchema,
    outputSchema: opportunityScoreSchema,
    execute: calculateOpportunityScore,
};
export async function scoreNicheKeywords(db, nicheSlug, budgetCaps) {
    const rows = await db
        .select({ keyword: keywords, analysis: keywordAnalyses, niche: niches })
        .from(keywords)
        .innerJoin(keywordAnalyses, eq(keywordAnalyses.keywordId, keywords.id))
        .innerJoin(niches, eq(niches.id, keywords.nicheId))
        .where(eq(niches.slug, nicheSlug));
    const runner = new AgentRunner(db, { budgetCaps });
    let cacheHits = 0;
    for (const row of rows) {
        const facetRows = await db
            .select({ id: keywordFacets.id })
            .from(keywordFacets)
            .where(eq(keywordFacets.keywordId, row.keyword.id));
        const memberships = await db
            .select({ clusterId: keywordClusterMembers.clusterId })
            .from(keywordClusterMembers)
            .where(eq(keywordClusterMembers.keywordId, row.keyword.id));
        let clusterSize = 1;
        const membership = memberships[0];
        if (membership) {
            const members = await db
                .select({ id: keywordClusterMembers.id })
                .from(keywordClusterMembers)
                .where(eq(keywordClusterMembers.clusterId, membership.clusterId));
            clusterSize = members.length;
        }
        const run = await runner.run(scoringJob, {
            keywordId: row.keyword.id,
            patternType: row.analysis.patternType,
            intentType: row.analysis.intentType,
            hasQualifier: row.analysis.qualifierText !== null,
            facetCount: facetRows.length,
            clusterSize,
            analysisConfidence: Number(row.analysis.confidence),
            nicheActive: row.niche.status === "ACTIVE",
        });
        if (run.cacheHit)
            cacheHits += 1;
        const output = run.output;
        await db
            .insert(keywordScores)
            .values({
            id: uuidv7(),
            keywordId: row.keyword.id,
            scoreKind: output.scoreKind,
            modelId: output.modelId,
            modelVersion: output.modelVersion,
            score: output.score?.toFixed(3) ?? null,
            band: output.band,
            dataCompleteness: output.dataCompleteness.toFixed(3),
            components: output.components,
            missingInputs: output.missingInputs,
            agentRunId: run.runId,
        })
            .onConflictDoNothing();
        await db
            .update(keywords)
            .set({ status: "SCORED", updatedAt: new Date() })
            .where(eq(keywords.id, row.keyword.id));
    }
    return { scoredCount: rows.length, cacheHits };
}
//# sourceMappingURL=index.js.map