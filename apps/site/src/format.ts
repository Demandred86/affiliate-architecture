import type { Product } from "./types.js";

export function formatWeight(product: Product): string {
  const w = product.weightG;
  if (w.status === "conflict" && w.min != null && w.max != null) {
    return `CONFLICT: ${w.min}–${w.max} g (VERIFY)`;
  }
  if (w.status === "verify" && w.min != null && w.max != null && w.min !== w.max) {
    return `approx. ${w.min}–${w.max} g`;
  }
  if (w.notes?.includes("177") && w.max === 180) {
    return "approx. 177–180 g";
  }
  return `${w.value} g`;
}

export function formatHandSize(value: string): string {
  return value;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function confidenceBadge(confidence: string): string {
  return confidence.toUpperCase();
}
