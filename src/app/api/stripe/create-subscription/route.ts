import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db/pg/db.pg";
import { subscriptions } from "@/lib/db/pg/schema.pg";
import { stripe, isStripeConfigured } from "@/lib/stripe/config";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Helper function to get base URL dynamically
const getBaseUrl = (request: Request) => {
  // First priority: environment variable if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Second priority: detect from request headers
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host") || url.host;
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
  } catch (error) {
    console.warn("Failed to detect base URL from request:", error);
  }

  // Fallback for development
  return process.env.NODE_ENV === "production"
    ? "https://david-ai.example.com"
    : "http://localhost:3000";
};

export async function POST(request: Request) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: "Payment system is not configured" },
        { status: 503 },
      );
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 },
      );
    }

    try {
      // Check if user already has a subscription
      const [existingSubscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, session.user.id));

      let customerId = existingSubscription?.stripeCustomerId;

      // If no customer ID exists, create a new customer
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: session.user.email,
          metadata: {
            userId: session.user.id,
          },
        });
        customerId = customer.id;
      }

      const baseUrl = getBaseUrl(request);

      // Create Stripe Checkout Session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${baseUrl}/settings/subscription?success=true`,
        cancel_url: `${baseUrl}/settings/subscription?canceled=true`,
        metadata: {
          userId: session.user.id,
        },
      });

      if (!checkoutSession.id) {
        throw new Error("Failed to create checkout session");
      }

      return NextResponse.json({
        sessionId: checkoutSession.id,
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);

      if (stripeError instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          { error: stripeError.message },
          { status: stripeError.statusCode || 500 },
        );
      }

      throw stripeError; // Re-throw non-Stripe errors
    }
  } catch (error) {
    console.error("Error creating subscription:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  }
}
