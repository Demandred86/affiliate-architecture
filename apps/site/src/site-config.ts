/**
 * Site-wide configuration placeholders for analytics and disclosures.
 * Do not insert real tracking IDs until HUMAN setup is complete.
 */
export const siteConfig = {
  siteName: "Affiliate SEO Engine (M2.5 MVP)",
  baseUrlPlaceholder: "https://YOUR-DOMAIN.example",
  affiliateDisclosure:
    "Some links on this page may be affiliate links. If you buy through them, we may earn a commission at no additional cost to you. Affiliate relationships have not been verified for this MVP page.",
  analytics: {
    googleAnalyticsId: "",
    googleSearchConsoleVerification: "",
    notes:
      "Insert GA4 measurement ID and Search Console meta tag in apps/site/public/partials/analytics.html after domain setup.",
  },
  articlePath: "/best-pruning-shears-for-small-hands/",
} as const;
