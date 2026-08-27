/**
 * Affiliate link configuration. Empty URLs must not render as clickable CTAs.
 * Replace placeholders after Amazon Associates / retailer approval (HUMAN task).
 */
export interface AffiliateLinkEntry {
    amazonUS: string;
    retailerUS: string;
}
export declare const affiliateLinks: Record<string, AffiliateLinkEntry>;
export declare const AFFILIATE_LINK_PENDING = "AFFILIATE_LINK_PENDING";
export declare function hasAffiliateLink(entry: AffiliateLinkEntry | undefined): boolean;
export declare function firstAffiliateUrl(entry: AffiliateLinkEntry | undefined): string | null;
//# sourceMappingURL=affiliate-links.d.ts.map