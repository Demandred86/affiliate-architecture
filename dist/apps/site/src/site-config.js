/**
 * Site-wide configuration placeholders for disclosures.
 * Public origin is SITE_URL at build time (see .env.example).
 * Do not insert real tracking IDs; this MVP ships with no analytics SDK.
 */
export const siteConfig = {
    siteName: "Affiliate SEO Engine (M2.5 MVP)",
    /** Env var read by apps/site/scripts/build.mjs. Replace before deployment. */
    siteUrlEnvVar: "SITE_URL",
    /** Safe placeholder — not a real domain. Override with SITE_URL. */
    defaultSiteUrl: "https://example.com",
    affiliateDisclosure: "Some links on this page may be affiliate links. If you buy through them, we may earn a commission at no additional cost to you. Affiliate relationships have not been verified for this MVP page.",
    analytics: {
        googleAnalyticsId: "",
        googleSearchConsoleVerification: "",
        notes: "No analytics package is bundled. Use Google Search Console (no site SDK) after you set a real SITE_URL.",
    },
    articlePath: "/best-pruning-shears-for-small-hands/",
};
//# sourceMappingURL=site-config.js.map