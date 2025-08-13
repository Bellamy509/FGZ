import { NextResponse } from "next/server";
import { STRIPE_CONFIG, isStripeConfigured } from "@/lib/stripe/config";

export async function GET() {
  try {
    // Only expose the publishable key and configuration status
    // This is safe to expose as publishable keys are meant to be public
    const config = {
      publishableKey: STRIPE_CONFIG.publishableKey,
      isConfigured: isStripeConfigured(),
      priceId: STRIPE_CONFIG.priceId,
    };

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error) {
    console.error("Error getting Stripe config:", error);
    return NextResponse.json(
      {
        publishableKey: "",
        isConfigured: false,
        priceId: "",
        error: "Configuration error",
      },
      { status: 500 },
    );
  }
}
