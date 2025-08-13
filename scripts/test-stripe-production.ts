#!/usr/bin/env tsx

// Test script to verify Stripe configuration
import { config } from "dotenv";
config();

async function testStripeConfig() {
  console.log("🧪 Testing Stripe Configuration");
  console.log("===============================\\n");

  const stripeConfig = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
  };

  console.log("Local Configuration:", {
    hasSecretKey: !!stripeConfig.secretKey,
    hasPublishableKey: !!stripeConfig.publishableKey,
    hasWebhookSecret: !!stripeConfig.webhookSecret,
    hasPriceId: !!stripeConfig.priceId,
  });

  // Test API endpoint
  try {
    const response = await fetch("http://localhost:3000/api/stripe/config");
    const data = await response.json();

    console.log("API Response:", data);
    console.log("Is Configured:", data.isConfigured);

    if (data.isConfigured) {
      console.log("✅ Stripe is properly configured!");
    } else {
      console.log("❌ Stripe configuration issues detected");
    }
  } catch (error) {
    console.log("❌ Failed to test API endpoint:", error);
    console.log("Make sure your development server is running (npm run dev)");
  }
}

testStripeConfig();
