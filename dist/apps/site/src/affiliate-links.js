/**
 * Affiliate helpers. URLs live in apps/site/data/affiliate-links.json
 * (single source of truth for the static build). Empty URLs must not
 * render as clickable CTAs. Replace placeholders after program approval
 * (HUMAN task). Do not invent Amazon or other affiliate URLs.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const affiliateLinksPath = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "affiliate-links.json");
export const affiliateLinks = JSON.parse(readFileSync(affiliateLinksPath, "utf8"));
export const AFFILIATE_LINK_PENDING = "AFFILIATE_LINK_PENDING";
export function hasAffiliateLink(entry) {
    if (!entry)
        return false;
    return Boolean(entry.amazonUS.trim() || entry.retailerUS.trim());
}
export function firstAffiliateUrl(entry) {
    if (!entry)
        return null;
    const url = entry.amazonUS.trim() || entry.retailerUS.trim();
    return url || null;
}
//# sourceMappingURL=affiliate-links.js.map