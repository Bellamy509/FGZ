"use server";

import { userRepository } from "lib/db/repository";
import { db } from "@/lib/db/pg/db.pg";
import { userCredits, UserSchema } from "@/lib/db/pg/schema.pg";
import { STRIPE_PLANS } from "@/lib/stripe/config";
import { eq } from "drizzle-orm";

export async function existsByEmailAction(email: string) {
  const exists = await userRepository.existsByEmail(email);
  return exists;
}

export async function onUserCreated(userId: string) {
  try {
    // Check if user already has credits to prevent duplicates
    const [existingCredits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId));

    if (existingCredits) {
      console.log(
        `ℹ️ User ${userId} already has credits, skipping initialization`,
      );
      return;
    }

    // Grant initial free credits
    await db.insert(userCredits).values({
      userId,
      credits: STRIPE_PLANS.FREE.credits,
      isInitialCredit: true,
    });

    console.log(
      `✅ Successfully granted ${STRIPE_PLANS.FREE.credits} free credits to user: ${userId}`,
    );
  } catch (error) {
    console.error(`❌ Failed to grant free credits to user ${userId}:`, error);
    throw error; // Re-throw so the calling code knows it failed
  }
}

export async function ensureUserHasCredits(userId: string) {
  try {
    // Check if user exists and has credits
    const [existingCredits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId));

    if (!existingCredits) {
      // User doesn't have credits, grant them
      await db.insert(userCredits).values({
        userId,
        credits: STRIPE_PLANS.FREE.credits,
        isInitialCredit: true,
      });

      console.log(
        `✅ Granted initial ${STRIPE_PLANS.FREE.credits} credits to existing user: ${userId}`,
      );
      return {
        success: true,
        credited: true,
        credits: STRIPE_PLANS.FREE.credits,
      };
    }

    return { success: true, credited: false, credits: existingCredits.credits };
  } catch (error) {
    console.error(`❌ Failed to ensure credits for user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function initializeAllUserCredits() {
  try {
    // Get all users
    const users = await db.select().from(UserSchema);
    const results = {
      total: users.length,
      credited: 0,
      alreadyHadCredits: 0,
      errors: 0,
    };

    for (const user of users) {
      const result = await ensureUserHasCredits(user.id);
      if (result.success) {
        if (result.credited) {
          results.credited++;
        } else {
          results.alreadyHadCredits++;
        }
      } else {
        results.errors++;
      }
    }

    return results;
  } catch (error) {
    console.error("❌ Failed to initialize all user credits:", error);
    throw error;
  }
}
