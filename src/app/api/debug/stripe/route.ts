import { NextResponse } from "next/server";

export async function GET() {
  // Debug information to help identify Stripe configuration issues
  const config = {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasPublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasPriceId: !!process.env.STRIPE_PRICE_ID,
    secretKeyPrefix:
      process.env.STRIPE_SECRET_KEY?.substring(0, 7) || "missing",
    publishableKeyPrefix:
      process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 7) || "missing",
    priceIdPrefix: process.env.STRIPE_PRICE_ID?.substring(0, 8) || "missing",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  const allConfigured =
    config.hasSecretKey &&
    config.hasPublishableKey &&
    config.hasWebhookSecret &&
    config.hasPriceId;

  return NextResponse.json(
    {
      ...config,
      allConfigured,
      message: allConfigured
        ? "✅ Stripe is fully configured"
        : "❌ Stripe configuration incomplete",
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
