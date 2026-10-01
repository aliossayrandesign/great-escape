import type { StripeElementsOptions } from "@stripe/stripe-js";

// Shared dark theme for every Stripe Elements instance in the app (checkout
// deposit + the balance payment on the client project page).
export const STRIPE_APPEARANCE: StripeElementsOptions["appearance"] = {
  theme: "night",
  variables: {
    colorPrimary: "#ff8a8a",
    colorBackground: "#0a0a0a",
    colorText: "#f3f3f3",
    colorTextSecondary: "#666666",
    colorTextPlaceholder: "#666666",
    colorDanger: "#ff8a8a",
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: "16px",
    fontSizeBase: "14px",
    spacingUnit: "5px",
  },
  rules: {
    ".Tab": {
      border: "1px solid #773047",
      backgroundColor: "#0a0a0a",
      boxShadow: "none",
      padding: "16px 20px",
    },
    ".Tab:hover": {
      border: "1px solid #454545",
      backgroundColor: "#0a0a0a",
    },
    ".Tab--selected": {
      border: "1px solid #ff8a8a",
      backgroundColor: "#0a0a0a",
      boxShadow: "0 0 0 1px #ff8a8a",
    },
    ".Tab--selected:hover": {
      border: "1px solid #ff8a8a",
    },
    ".TabLabel": {
      fontWeight: "600",
      color: "#f3f3f3",
    },
    ".TabLabel--selected": {
      color: "#f3f3f3",
    },
    ".TabIcon--selected": {
      fill: "#f3f3f3",
    },
    ".Input": {
      border: "1px solid #2a2a2a",
      backgroundColor: "#1f1f1f",
      padding: "16px 20px",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #ff8a8a",
      boxShadow: "0 0 0 1px #ff8a8a",
    },
    ".Label": {
      color: "#666666",
      fontFamily: "'DM Mono', monospace",
      fontSize: "12px",
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      marginBottom: "8px",
    },
    ".Block": {
      backgroundColor: "#0a0a0a",
      border: "1px solid #773047",
      boxShadow: "none",
    },
  },
};

export const STRIPE_FONTS: StripeElementsOptions["fonts"] = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap",
  },
];
