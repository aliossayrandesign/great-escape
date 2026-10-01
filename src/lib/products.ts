export type ProductType = "website" | "app" | "deck" | "package";

export const PRODUCT_LABEL: Record<ProductType, string> = {
  website: "Website",
  app: "App",
  deck: "Pitch Deck",
  package: "Package Design",
};

// Prices are in whole US dollars. This is the single source of truth —
// the payment API charges from this map, never from client input.
// "package" is the base price for a single SKU — see getPackagePrice below
// for how additional SKUs add to it.
export const PRODUCT_PRICE: Record<ProductType, number> = {
  website: 2500,
  app: 4500,
  deck: 1000,
  package: 1500,
};

export const PACKAGE_MIN_SKUS = 1;
export const PACKAGE_MAX_SKUS = 5; // beyond this, custom quote only — no automatic checkout
export const PACKAGE_SKU_INCREMENT = 500; // added per SKU beyond the first

export function getPackagePrice(skuCount: number): number {
  const clamped = Math.min(Math.max(skuCount, PACKAGE_MIN_SKUS), PACKAGE_MAX_SKUS);
  return PRODUCT_PRICE.package + (clamped - PACKAGE_MIN_SKUS) * PACKAGE_SKU_INCREMENT;
}

export function getTotalPrice(product: ProductType, skuCount?: number | null): number {
  if (product === "package") return getPackagePrice(skuCount ?? PACKAGE_MIN_SKUS);
  return PRODUCT_PRICE[product];
}

// Standard split for every order: half to start, half on delivery. Centralized
// here so the ratio is never computed ad-hoc in more than one place.
export function getDepositAmount(totalPrice: number): number {
  return totalPrice / 2;
}
