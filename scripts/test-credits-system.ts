import { load } from "../src/lib/load-env";
import { db } from "../src/lib/db/pg/db.pg";
import { UserSchema, userCredits } from "../src/lib/db/pg/schema.pg";
import { STRIPE_PLANS } from "../src/lib/stripe/config";

// Load environment variables
load();

async function testCreditsSystem() {
  console.log("🧪 Testing Credits System");
  console.log("========================");

  try {
    // 1. Check current configuration
    console.log(`📋 Current configuration:`);
    console.log(`   - Free credits per user: ${STRIPE_PLANS.FREE.credits}`);
    console.log(`   - Database connected: ${db ? "✅" : "❌"}`);

    // 2. Count total users
    const users = await db.select().from(UserSchema);
    console.log(`\n👥 Total users in system: ${users.length}`);

    if (users.length === 0) {
      console.log("ℹ️ No users found in the system. Nothing to test.");
      return;
    }

    // 3. Check credits distribution
    const usersWithCredits = await db
      .select({
        userId: userCredits.userId,
        credits: userCredits.credits,
        isInitialCredit: userCredits.isInitialCredit,
      })
      .from(userCredits);

    console.log(`\n💰 Users with credits: ${usersWithCredits.length}`);
    console.log(
      `💸 Users without credits: ${users.length - usersWithCredits.length}`,
    );

    // 4. Show detailed breakdown
    if (usersWithCredits.length > 0) {
      const totalCredits = usersWithCredits.reduce(
        (sum, user) => sum + user.credits,
        0,
      );
      const avgCredits = totalCredits / usersWithCredits.length;

      console.log(`\n📊 Credits Statistics:`);
      console.log(`   - Total credits distributed: ${totalCredits}`);
      console.log(`   - Average credits per user: ${Math.round(avgCredits)}`);
      console.log(
        `   - Users with initial credits: ${usersWithCredits.filter((u) => u.isInitialCredit).length}`,
      );
    }

    // 5. Find users without credits
    const usersWithoutCredits = users.filter(
      (user) =>
        !usersWithCredits.some((creditUser) => creditUser.userId === user.id),
    );

    if (usersWithoutCredits.length > 0) {
      console.log(`\n⚠️ Users without credits:`);
      usersWithoutCredits.forEach((user) => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });

      console.log(`\n💡 To fix this, run: pnpm init:credits`);
    } else {
      console.log(`\n✅ All users have credits assigned!`);
    }

    // 6. Test hook configuration
    console.log(`\n🔧 Testing hook configuration...`);
    // We can't directly test the hook, but we can check if the function exists
    try {
      const { onUserCreated } = await import("../src/app/api/auth/actions");
      console.log(
        `   - onUserCreated function: ${typeof onUserCreated === "function" ? "✅" : "❌"}`,
      );
    } catch {
      console.log(`   - onUserCreated function: ❌ (Import failed)`);
    }

    console.log(`\n🎉 Credits system test completed!`);
  } catch (error) {
    console.error("❌ Error during testing:", error);
    process.exit(1);
  }
}

testCreditsSystem().catch(console.error);
