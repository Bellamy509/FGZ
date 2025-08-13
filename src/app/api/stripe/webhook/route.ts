import { NextResponse } from "next/server";
import Stripe from "stripe";
import { STRIPE_CONFIG, isStripeConfigured } from "lib/stripe/config";
import { db } from "lib/db/pg/db.pg";
import { userCredits } from "lib/db/pg/schema.pg";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(STRIPE_CONFIG.secretKey);

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (!userId) {
          throw new Error("Missing client_reference_id");
        }

        await db
          .update(userCredits)
          .set({
            credits: -1, // Unlimited credits
            updatedAt: new Date(),
          })
          .where(eq(userCredits.userId, userId));

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in Stripe webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 },
    );
  }
}
