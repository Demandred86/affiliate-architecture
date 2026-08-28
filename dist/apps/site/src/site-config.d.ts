/**
 * Site-wide configuration placeholders for disclosures.
 * Public origin is SITE_URL at build time (see .env.example).
 * Do not insert real tracking IDs; this MVP ships with no analytics SDK.
 */
export declare const siteConfig: {
    readonly siteName: "Affiliate SEO Engine (M2.5 MVP)";
    /** Env var read by apps/site/scripts/build.mjs. Replace before deployment. */
    readonly siteUrlEnvVar: "SITE_URL";
    /** Safe placeholder — not a real domain. Override with SITE_URL. */
    readonly defaultSiteUrl: "https://example.com";
    readonly affiliateDisclosure: "Some links on this page may be affiliate links. If you buy through them, we may earn a commission at no additional cost to you. Affiliate relationships have not been verified for this MVP page.";
    readonly analytics: {
        readonly googleAnalyticsId: "";
        readonly googleSearchConsoleVerification: "";
        readonly notes: "No analytics package is bundled. Use Google Search Console (no site SDK) after you set a real SITE_URL.";
    };
    readonly articlePath: "/best-pruning-shears-for-small-hands/";
};
//# sourceMappingURL=site-config.d.ts.map