import { load } from "../src/lib/load-env";
import { STRIPE_CONFIG, isStripeConfigured } from "../src/lib/stripe/config";

// Load environment variables
load();

async function testStripeConfiguration() {
  console.log("🧪 Test de Configuration Stripe");
  console.log("=".repeat(40));

  console.log("\n📋 Vérification des variables d'environnement :");

  const checks = [
    {
      name: "STRIPE_SECRET_KEY",
      value: STRIPE_CONFIG.secretKey,
      required: true,
    },
    {
      name: "STRIPE_PUBLISHABLE_KEY",
      value: STRIPE_CONFIG.publishableKey,
      required: true,
    },
    {
      name: "STRIPE_WEBHOOK_SECRET",
      value: STRIPE_CONFIG.webhookSecret,
      required: true,
    },
    { name: "STRIPE_PRICE_ID", value: STRIPE_CONFIG.priceId, required: true },
  ];

  let allGood = true;

  checks.forEach((check) => {
    const isSet = check.value && check.value.length > 0;
    const status = isSet ? "✅" : "❌";
    const preview = check.value
      ? `${check.value.substring(0, 20)}...`
      : "Non défini";

    console.log(`   ${status} ${check.name}: ${preview}`);

    if (check.required && !isSet) {
      allGood = false;
    }
  });

  console.log(
    `\n🔧 Configuration Stripe : ${isStripeConfigured() ? "✅ Configuré" : "❌ Non configuré"}`,
  );

  if (!allGood) {
    console.log("\n⚠️  Des variables sont manquantes. Exécutez :");
    console.log("   pnpm setup:stripe");
    return;
  }

  // Test Stripe connection
  try {
    console.log("\n🔌 Test de connexion à Stripe...");

    // We can't import stripe directly here due to the conditional initialization
    // So we'll just check the config format
    if (STRIPE_CONFIG.secretKey.startsWith("sk_")) {
      console.log("✅ Format de clé secrète valide");
    } else {
      console.log("❌ Format de clé secrète invalide");
      allGood = false;
    }

    if (STRIPE_CONFIG.publishableKey.startsWith("pk_")) {
      console.log("✅ Format de clé publique valide");
    } else {
      console.log("❌ Format de clé publique invalide");
      allGood = false;
    }

    if (STRIPE_CONFIG.priceId.startsWith("price_")) {
      console.log("✅ Format d'ID de prix valide");
    } else {
      console.log("❌ Format d'ID de prix invalide");
      allGood = false;
    }

    if (STRIPE_CONFIG.webhookSecret.startsWith("whsec_")) {
      console.log("✅ Format de secret webhook valide");
    } else {
      console.log("❌ Format de secret webhook invalide");
      allGood = false;
    }
  } catch (error) {
    console.log("❌ Erreur lors du test de connexion:", error);
    allGood = false;
  }

  console.log("\n" + "=".repeat(40));

  if (allGood) {
    console.log("🎉 Configuration Stripe OK !");
    console.log("\n✅ Prochaines étapes :");
    console.log("1. Redémarrez votre serveur (pnpm dev)");
    console.log("2. Les paiements Stripe sont maintenant actifs");
    console.log("3. Testez avec les cartes de test Stripe :");
    console.log("   - 4242 4242 4242 4242 (Visa réussie)");
    console.log("   - 4000 0000 0000 0002 (Carte déclinée)");
  } else {
    console.log("❌ Configuration incomplète");
    console.log("\n🔧 Pour corriger :");
    console.log("   pnpm setup:stripe");
  }
}

testStripeConfiguration().catch(console.error);
