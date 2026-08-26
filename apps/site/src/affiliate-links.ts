/**
 * Affiliate link configuration. Empty URLs must not render as clickable CTAs.
 * Replace placeholders after Amazon Associates / retailer approval (HUMAN task).
 */
export interface AffiliateLinkEntry {
  amazonUS: string;
  retailerUS: string;
}

export const affiliateLinks: Record<string, AffiliateLinkEntry> = {
  okatsune101: {
    amazonUS: "",
    retailerUS: "",
  },
  felco14: {
    amazonUS: "",
    retailerUS: "",
  },
  darlacDp930: {
    amazonUS: "",
    retailerUS: "",
  },
  felco15: {
    amazonUS: "",
    retailerUS: "",
  },
  felco6: {
    amazonUS: "",
    retailerUS: "",
  },
};

export const AFFILIATE_LINK_PENDING = "AFFILIATE_LINK_PENDING";

export function hasAffiliateLink(entry: AffiliateLinkEntry | undefined): boolean {
  if (!entry) return false;
  return Boolean(entry.amazonUS.trim() || entry.retailerUS.trim());
}

export function firstAffiliateUrl(entry: AffiliateLinkEntry | undefined): string | null {
  if (!entry) return null;
  const url = entry.amazonUS.trim() || entry.retailerUS.trim();
  return url || null;
}
