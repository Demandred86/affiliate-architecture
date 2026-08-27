import { v7 as uuidv7 } from "uuid";
import { facets, nicheAliases, niches } from "./schema.js";
const nicheSeeds = [
    {
        slug: "problem-solving-gardening",
        name: "Problem-Solving Gardening",
        status: "ACTIVE",
    },
    {
        slug: "tools-home-improvement",
        name: "Tools / Home Improvement",
        status: "PARKED",
    },
    {
        slug: "automotive-accessories",
        name: "Automotive Accessories",
        status: "PARKED",
    },
    {
        slug: "outdoor-camping",
        name: "Outdoor / Camping",
        status: "PARKED",
    },
    {
        slug: "kitchen-micro-niche",
        name: "Kitchen Micro-Niche",
        status: "PARKED",
    },
];
const facetSeeds = [
    ["CONSTRAINT", "small-hands", "small hands"],
    ["ENVIRONMENT", "vegetable-garden", "vegetable garden"],
    ["ENVIRONMENT", "raised-beds", "raised beds"],
    ["USE_CASE", "tomatoes", "tomatoes"],
    ["ENVIRONMENT", "small-garden", "small garden"],
    ["USER", "beginners", "beginners"],
    ["USER", "elderly", "elderly"],
    ["ATTRIBUTE", "lightweight", "lightweight"],
];
export async function seed(db) {
    const inserted = await db
        .insert(niches)
        .values(nicheSeeds.map((niche) => ({
        id: uuidv7(),
        ...niche,
        market: "US",
        language: "en-US",
    })))
        .onConflictDoNothing({ target: niches.slug })
        .returning();
    const gardening = inserted.find((niche) => niche.slug === "problem-solving-gardening") ??
        (await db.query.niches.findFirst({
            where: (table, { eq }) => eq(table.slug, "problem-solving-gardening"),
        }));
    if (!gardening)
        throw new Error("Gardening niche seed failed");
    await db
        .insert(nicheAliases)
        .values({
        id: uuidv7(),
        nicheId: gardening.id,
        alias: "Lawn & Garden",
    })
        .onConflictDoNothing({ target: nicheAliases.alias });
    await db
        .insert(facets)
        .values(facetSeeds.map(([kind, slug, label]) => ({
        id: uuidv7(),
        kind,
        slug,
        label,
        synonyms: [label],
    })))
        .onConflictDoNothing({ target: facets.slug });
}
//# sourceMappingURL=seed.js.map