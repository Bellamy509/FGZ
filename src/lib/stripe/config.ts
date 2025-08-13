import Stripe from "stripe";

export const STRIPE_CONFIG = {
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  priceId: process.env.STRIPE_PRICE_ID || "",
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
} as const;

// Only initialize Stripe on server-side and when secret key is available
export const stripe =
  typeof window === "undefined" && STRIPE_CONFIG.secretKey
    ? new Stripe(STRIPE_CONFIG.secretKey)
    : null;

export const STRIPE_PLANS = {
  FREE: {
    name: "Free Plan",
    credits: 300,
    price: 0,
  },
  PRO: {
    name: "Pro Plan",
    price: 15,
    priceId: STRIPE_CONFIG.priceId,
  },
} as const;

// Export config for client-side usage
export const STRIPE_PUBLIC_CONFIG = {
  publishableKey:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    "",
};

// Export helper functions
export const isStripeConfigured = () => {
  // Check both server and client configurations
  const hasServerConfig = !!(STRIPE_CONFIG.secretKey && STRIPE_CONFIG.priceId);
  const hasClientConfig = !!STRIPE_PUBLIC_CONFIG.publishableKey;

  return hasServerConfig && hasClientConfig;
};
