import type { Offering, Product, ProductGroup } from "./types";

export type SortOrder = "asc" | "desc";

/** 14.5 -> "€14.50", 10 -> "€10" */
export const money = (n: number | string) => {
  const v = Number(n);
  return Number.isInteger(v) ? `€${v}` : `€${v.toFixed(2)}`;
};

// Variants that add no information, so they are not shown in brackets
const HIDDEN_VARIANTS = new Set(["Standard", "Regular", "Single Ride", "Single Entry", "Souvenir"]);

/** "Mass Helles" + variant "1L" -> "Mass Helles (1L)" */
export function productTitle(p: Product): string {
  return !p.variant || HIDDEN_VARIANTS.has(p.variant) ? p.product_name : `${p.product_name} (${p.variant})`;
}

/** Lower case, no accents, "ß" -> "ss": so "weiss" finds "Weißbier" and "kase" finds "Käse". */
export const normalizeText = (text: string) =>
  text.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** True when the PRODUCT NAME contains exactly the typed characters (vendor names are ignored). */
export const matchesProductName = (p: Product, query: string) =>
  normalizeText(p.product_name).includes(normalizeText(query.trim()));

/** 0 = name starts with the text, 1 = a word of the name starts with it, 2 = it appears inside a word. */
function matchRank(p: Product, query: string): number {
  const name = normalizeText(p.product_name);
  const text = normalizeText(query.trim());
  if (name.startsWith(text)) return 0;
  return name.split(/[^a-z0-9]+/).some((word) => word.startsWith(text)) ? 1 : 2;
}

/** Best matches first, then alphabetical. */
export function rankByQuery(groups: ProductGroup[], query: string): ProductGroup[] {
  return [...groups].sort(
    (a, b) =>
      matchRank(a.product, query) - matchRank(b.product, query) ||
      productTitle(a.product).localeCompare(productTitle(b.product)),
  );
}

/** One product = one row in the list; "from" price = cheapest offering. */
export function groupByProduct(offerings: Offering[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();
  for (const o of offerings) {
    const price = Number(o.price_eur);
    const group = map.get(o.product_id);
    if (group) {
      group.offerings.push(o);
      group.minPrice = Math.min(group.minPrice, price);
    } else {
      map.set(o.product_id, { product: o.product, minPrice: price, offerings: [o] });
    }
  }
  return [...map.values()];
}

/** Sorts products by name (A–Z or Z–A). */
export function sortGroups(groups: ProductGroup[], order: SortOrder): ProductGroup[] {
  const direction = order === "asc" ? 1 : -1;
  return [...groups].sort((a, b) => direction * productTitle(a.product).localeCompare(productTitle(b.product)));
}

/** Sorts vendors by price (cheapest first or most expensive first). */
export function sortOfferingsByPrice(offerings: Offering[], order: SortOrder): Offering[] {
  const direction = order === "asc" ? 1 : -1;
  return [...offerings].sort((a, b) => direction * (Number(a.price_eur) - Number(b.price_eur)));
}

/** An offering has the "best price" when it is the cheapest one (ties included) and there is something to compare with. */
export const isBestPrice = (o: Offering, group: ProductGroup) =>
  group.offerings.length > 1 && Number(o.price_eur) === group.minPrice;

export const VENDOR_TYPE_LABEL: Record<string, string> = {
  large_tent: "Large beer tent",
  small_tent: "Small tent",
  oide_tent: "Oide Wiesn tent",
  food_stand: "Food stand",
  ride: "Ride",
  game: "Game stand",
  merch_stand: "Souvenir stand",
};
