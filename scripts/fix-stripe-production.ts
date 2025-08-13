#!/usr/bin/env tsx

import { config } from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Load environment variables
config();

const REQUIRED_STRIPE_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID",
];

function checkStripeConfig() {
  console.log("🔍 Checking Stripe configuration...\n");

  const missingVars: string[] = [];
  const presentVars: string[] = [];

  REQUIRED_STRIPE_VARS.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value.trim() === "") {
      missingVars.push(varName);
      console.log(`❌ ${varName}: Missing or empty`);
    } else {
      presentVars.push(varName);
      console.log(`✅ ${varName}: Present (${value.substring(0, 10)}...)`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(
    `✅ Present: ${presentVars.length}/${REQUIRED_STRIPE_VARS.length}`,
  );
  console.log(
    `❌ Missing: ${missingVars.length}/${REQUIRED_STRIPE_VARS.length}`,
  );

  return { missingVars, presentVars };
}

function updateEnvExample() {
  console.log("\n📝 Updating .env.example with Stripe variables...");

  const envExamplePath = join(process.cwd(), ".env.example");
  let content = "";

  try {
    content = readFileSync(envExamplePath, "utf-8");
  } catch {
    console.log("⚠️ .env.example not found, creating new one");
  }

  const stripeSection = `
# === Stripe Configuration ===
# Required for payment processing
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID=price_your_price_id_here
`;

  // Check if Stripe section already exists
  if (!content.includes("STRIPE_SECRET_KEY")) {
    content += stripeSection;
    writeFileSync(envExamplePath, content);
    console.log("✅ Added Stripe configuration to .env.example");
  } else {
    console.log("ℹ️ Stripe configuration already exists in .env.example");
  }
}

function generateProductionEnvInstructions(missingVars: string[]) {
  if (missingVars.length === 0) {
    console.log("\n🎉 All Stripe variables are configured!");
    return;
  }

  console.log("\n🚀 Production Deployment Instructions:");
  console.log("=====================================");
  console.log("\nFor Vercel deployment, add these environment variables:");

  missingVars.forEach((varName) => {
    console.log(`vercel env add ${varName}`);
  });

  console.log("\nOr add them through Vercel dashboard:");
  console.log("1. Go to your Vercel project dashboard");
  console.log("2. Go to Settings > Environment Variables");
  console.log("3. Add the following variables:");

  missingVars.forEach((varName) => {
    console.log(`   - ${varName}: [your_${varName.toLowerCase()}_value]`);
  });

  console.log("\nFor other platforms (Netlify, Railway, etc.):");
  console.log("Add these environment variables to your deployment platform:");
  missingVars.forEach((varName) => {
    console.log(`   ${varName}=[your_value]`);
  });
}

function createStripeTestScript() {
  console.log("\n📝 Creating Stripe test script...");

  const testScript = `#!/usr/bin/env tsx

// Test script to verify Stripe configuration
import { config } from "dotenv";
config();

async function testStripeConfig() {
  console.log("🧪 Testing Stripe Configuration");
  console.log("===============================\n");
  
  const config = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
  };
  
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
`;

  writeFileSync("scripts/test-stripe-production.ts", testScript);
  console.log("✅ Created scripts/test-stripe-production.ts");
}

async function main() {
  console.log("🎯 Stripe Production Fix Tool");
  console.log("============================\n");

  const { missingVars } = checkStripeConfig();
  updateEnvExample();
  generateProductionEnvInstructions(missingVars);
  createStripeTestScript();

  console.log("\n📋 Next Steps:");
  console.log(
    "1. Add missing environment variables to your production deployment",
  );
  console.log("2. Redeploy your application");
  console.log("3. Test with: npx tsx scripts/test-stripe-production.ts");
  console.log("4. Verify payments work on your live site");
}

main().catch(console.error);
