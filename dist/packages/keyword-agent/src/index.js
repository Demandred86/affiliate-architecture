import { facets, keywordAnalyses, keywordClusterMembers, keywordClusters, keywordFacets, keywords, niches, } from "@ase/database";
import { AgentRunner } from "@ase/agent-core";
import { assertNoFabrication } from "@ase/guardrails";
import { keywordAnalysisSchema, } from "@ase/schemas";
import { and, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { z } from "zod";
const inputSchema = z
    .object({ keywordId: z.uuid(), keyword: z.string().min(1) })
    .strict();
function slugify(value) {
    return value
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
function qualifierFacet(value) {
    if (value === "lightweight") {
        return { kind: "ATTRIBUTE", slug: "lightweight", label: value };
    }
    if (value.includes("beginner")) {
        return { kind: "USER", slug: "beginners", label: value };
    }
    if (value.includes("elderly")) {
        return { kind: "USER", slug: "elderly", label: value };
    }
    if (value.includes("small hands")) {
        return { kind: "CONSTRAINT", slug: "small-hands", label: value };
    }
    if (value.includes("tomato")) {
        return { kind: "USE_CASE", slug: "tomatoes", label: value };
    }
    return {
        kind: "ENVIRONMENT",
        slug: slugify(value),
        label: value,
    };
}
export function analyzeKeyword(keyword) {
    const normalized = keyword.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
    let patternType = "OTHER";
    let productText = null;
    let qualifierText = null;
    const attributeMatch = /^best (lightweight) (.+)$/.exec(normalized);
    const forMatch = /^best (.+) for (.+)$/.exec(normalized);
    if (attributeMatch) {
        patternType = "BEST_ATTRIBUTE_X";
        qualifierText = attributeMatch[1] ?? null;
        productText = attributeMatch[2] ?? null;
    }
    else if (forMatch) {
        patternType = "BEST_X_FOR_Y";
        productText = forMatch[1] ?? null;
        qualifierText = forMatch[2] ?? null;
    }
    const productFacet = productText
        ? {
            kind: "PRODUCT",
            slug: slugify(productText),
            label: productText,
            confidence: 0.95,
        }
        : null;
    const qualifier = qualifierText ? qualifierFacet(qualifierText) : null;
    const clusterSuggestion = normalized.includes("tomato") &&
        (normalized.includes("trellis") || normalized.includes("plant support"))
        ? { slug: "tomato-support", label: "Tomato support" }
        : productText
            ? { slug: slugify(productText), label: productText }
            : null;
    return keywordAnalysisSchema.parse({
        patternType,
        intentType: patternType === "OTHER" ? "UNKNOWN" : "COMMERCIAL_INVESTIGATION",
        productText,
        qualifierText,
        facets: [
            ...(productFacet ? [productFacet] : []),
            ...(qualifier
                ? [{ ...qualifier, confidence: 0.9 }]
                : []),
        ],
        userText: qualifier?.kind === "USER" ? qualifierText : null,
        problemText: null,
        environmentText: qualifier?.kind === "ENVIRONMENT" ? qualifierText : null,
        constraintText: qualifier?.kind === "CONSTRAINT" || qualifier?.kind === "ATTRIBUTE"
            ? qualifierText
            : null,
        clusterSuggestion,
        relatedCandidates: productText
            ? [
                {
                    text: `${productText} buying guide`,
                    origin: "TEMPLATE",
                    confidence: 0.4,
                },
            ]
            : [],
        confidence: patternType === "OTHER" ? 0.35 : 0.9,
        path: "DETERMINISTIC",
        notes: patternType === "OTHER" ? ["No supported grammar matched"] : [],
    });
}
const analysisJob = {
    agentId: "keyword",
    agentVersion: "1.0.0",
    prompt: {
        name: "deterministic-keyword-analysis",
        version: "1",
        content: "Apply the versioned BEST_X_FOR_Y and BEST_ATTRIBUTE_X grammar and lexicon.",
    },
    inputSchema,
    outputSchema: keywordAnalysisSchema,
    execute: ({ keyword }) => analyzeKeyword(keyword),
    guard: (input, output) => {
        assertNoFabrication({
            inputTexts: [input.keyword],
            outputTexts: [
                output.productText ?? "",
                output.qualifierText ?? "",
                ...output.relatedCandidates.map((candidate) => candidate.text),
            ],
        });
    },
};
export async function analyzeNicheKeywords(db, nicheSlug, budgetCaps) {
    const nicheKeywords = await db
        .select({ keyword: keywords, niche: niches })
        .from(keywords)
        .innerJoin(niches, eq(keywords.nicheId, niches.id))
        .where(eq(niches.slug, nicheSlug));
    const runner = new AgentRunner(db, { budgetCaps });
    let cacheHits = 0;
    for (const item of nicheKeywords) {
        const run = await runner.run(analysisJob, {
            keywordId: item.keyword.id,
            keyword: item.keyword.canonicalText,
        });
        if (run.cacheHit)
            cacheHits += 1;
        const output = run.output;
        await db
            .insert(keywordAnalyses)
            .values({
            id: uuidv7(),
            keywordId: item.keyword.id,
            patternType: output.patternType,
            intentType: output.intentType,
            productText: output.productText,
            qualifierText: output.qualifierText,
            userText: output.userText,
            problemText: output.problemText,
            environmentText: output.environmentText,
            constraintText: output.constraintText,
            confidence: output.confidence.toFixed(3),
            path: output.path,
            relatedCandidates: output.relatedCandidates,
            rawOutput: output,
            agentRunId: run.runId,
        })
            .onConflictDoNothing();
        for (const outputFacet of output.facets) {
            const [facet] = await db
                .insert(facets)
                .values({
                id: uuidv7(),
                kind: outputFacet.kind,
                slug: outputFacet.slug,
                label: outputFacet.label,
                synonyms: [outputFacet.label],
            })
                .onConflictDoUpdate({
                target: facets.slug,
                set: { updatedAt: new Date() },
            })
                .returning();
            if (facet) {
                await db
                    .insert(keywordFacets)
                    .values({
                    id: uuidv7(),
                    keywordId: item.keyword.id,
                    facetId: facet.id,
                    role: outputFacet.kind,
                    agentRunId: run.runId,
                })
                    .onConflictDoNothing();
            }
        }
        if (output.clusterSuggestion) {
            const [cluster] = await db
                .insert(keywordClusters)
                .values({
                id: uuidv7(),
                nicheId: item.niche.id,
                slug: output.clusterSuggestion.slug,
                label: output.clusterSuggestion.label,
                method: "deterministic-grammar",
                methodVersion: "1.0.0",
            })
                .onConflictDoUpdate({
                target: [keywordClusters.nicheId, keywordClusters.slug],
                set: { updatedAt: new Date() },
            })
                .returning();
            if (cluster) {
                const [existingPrimary] = await db
                    .select({ id: keywordClusterMembers.id })
                    .from(keywordClusterMembers)
                    .where(eq(keywordClusterMembers.clusterId, cluster.id))
                    .limit(1);
                await db
                    .insert(keywordClusterMembers)
                    .values({
                    id: uuidv7(),
                    clusterId: cluster.id,
                    keywordId: item.keyword.id,
                    isPrimary: !existingPrimary,
                })
                    .onConflictDoNothing();
            }
        }
        await db
            .update(keywords)
            .set({ status: "ANALYZED", updatedAt: new Date() })
            .where(and(eq(keywords.id, item.keyword.id), eq(keywords.nicheId, item.niche.id)));
    }
    return { analyzedCount: nicheKeywords.length, cacheHits };
}
//# sourceMappingURL=index.js.map