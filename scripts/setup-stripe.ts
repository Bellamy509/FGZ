import { load } from "../src/lib/load-env";
import fs from "fs";
import path from "path";
import readline from "readline";

// Load environment variables
load();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupStripe() {
  console.log("🎯 Configuration de Stripe pour votre application");
  console.log("=".repeat(50));

  console.log("\n📋 Vous devez d'abord :");
  console.log("1. Créer un compte Stripe sur https://stripe.com");
  console.log("2. Aller dans 'Developers > API keys'");
  console.log("3. Créer un produit dans 'Products'");
  console.log("4. Configurer un webhook sur 'Developers > Webhooks'");

  const proceed = await askQuestion("\n✅ Avez-vous fait ces étapes ? (y/n): ");

  if (proceed.toLowerCase() !== "y" && proceed.toLowerCase() !== "yes") {
    console.log(
      "\n⚠️  Veuillez d'abord compléter ces étapes sur le dashboard Stripe.",
    );
    console.log(
      "📖 Guide complet : https://stripe.com/docs/development/quickstart",
    );
    rl.close();
    return;
  }

  console.log("\n🔑 Entrez vos clés Stripe :");

  const secretKey = await askQuestion("Clé secrète (sk_test_...): ");
  const publishableKey = await askQuestion("Clé publique (pk_test_...): ");
  const priceId = await askQuestion("ID du prix (price_...): ");
  const webhookSecret = await askQuestion("Secret webhook (whsec_...): ");

  // Validate inputs
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    console.log(
      "❌ Erreur : La clé secrète doit commencer par 'sk_test_' ou 'sk_live_'",
    );
    rl.close();
    return;
  }

  if (
    !publishableKey.startsWith("pk_test_") &&
    !publishableKey.startsWith("pk_live_")
  ) {
    console.log(
      "❌ Erreur : La clé publique doit commencer par 'pk_test_' ou 'pk_live_'",
    );
    rl.close();
    return;
  }

  // Read current .env file
  const envPath = path.join(process.cwd(), ".env");
  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  // Remove existing Stripe configurations
  const stripeVars = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID",
  ];

  stripeVars.forEach((varName) => {
    const regex = new RegExp(`^${varName}=.*$`, "gm");
    envContent = envContent.replace(regex, "");
  });

  // Add new Stripe configuration
  const stripeConfig = `
# Stripe Configuration
STRIPE_SECRET_KEY="${secretKey}"
STRIPE_PUBLISHABLE_KEY="${publishableKey}"
STRIPE_WEBHOOK_SECRET="${webhookSecret}"
STRIPE_PRICE_ID="${priceId}"
`;

  envContent = envContent.trim() + stripeConfig;

  // Write updated .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Configuration Stripe ajoutée au fichier .env");

    console.log("\n🔄 Pour que les changements prennent effet :");
    console.log("1. Redémarrez votre serveur de développement");
    console.log("2. Les paiements Stripe seront maintenant actifs");

    console.log("\n⚠️  Important pour la production :");
    console.log("- Remplacez les clés 'test' par les clés 'live'");
    console.log("- Configurez le webhook sur votre domaine de production");
  } catch (error) {
    console.log("❌ Erreur lors de l'écriture du fichier .env:", error);
  }

  rl.close();
}

setupStripe().catch(console.error);
