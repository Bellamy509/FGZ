import { load } from "../src/lib/load-env";
import { db } from "../src/lib/db/pg/db.pg";
import { UserSchema, userCredits } from "../src/lib/db/pg/schema.pg";
import { STRIPE_PLANS } from "../src/lib/stripe/config";
import { eq } from "drizzle-orm";

// Load environment variables
load();

async function main() {
  console.log("⏳ Initializing free credits for existing users...");

  try {
    // Get all users
    const users = await db.select().from(UserSchema);
    console.log(`📊 Found ${users.length} users to process`);

    let creditsGranted = 0;
    let usersAlreadyHaveCredits = 0;

    // For each user, check if they have credits and create if not
    for (const user of users) {
      const [existingCredits] = await db
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, user.id));

      if (!existingCredits) {
        await db.insert(userCredits).values({
          userId: user.id,
          credits: STRIPE_PLANS.FREE.credits,
          isInitialCredit: true,
        });
        console.log(
          `✅ Created ${STRIPE_PLANS.FREE.credits} free credits for user: ${user.email}`,
        );
        creditsGranted++;
      } else {
        console.log(
          `ℹ️ User ${user.email} already has ${existingCredits.credits} credits`,
        );
        usersAlreadyHaveCredits++;
      }
    }

    console.log("\n📈 Summary:");
    console.log(`✅ Credits granted to: ${creditsGranted} users`);
    console.log(`ℹ️ Users who already had credits: ${usersAlreadyHaveCredits}`);
    console.log(`🎉 Total users processed: ${users.length}`);
  } catch (error) {
    console.error("❌ Error during credit initialization:", error);
    process.exit(1);
  }
}

main().catch(console.error);
