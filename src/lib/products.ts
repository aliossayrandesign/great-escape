export type ProductType = "website" | "app" | "deck";

export const PRODUCT_LABEL: Record<ProductType, string> = {
  website: "Website",
  app: "App",
  deck: "Pitch Deck",
};

// Prices are in whole US dollars. This is the single source of truth —
// the payment API charges from this map, never from client input.
export const PRODUCT_PRICE: Record<ProductType, number> = {
  website: 2500,
  app: 4500,
  deck: 1000,
};
