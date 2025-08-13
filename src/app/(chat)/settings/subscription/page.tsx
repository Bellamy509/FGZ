import { SubscriptionCard } from "@/components/subscription-card";
import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db/pg/db.pg";
import { userCredits } from "@/lib/db/pg/schema.pg";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export default async function SubscriptionPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  try {
    const [userCredit] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, session.user.id));

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>

        {userCredit && (
          <div className="mb-8 p-4 bg-secondary rounded-lg">
            <p className="text-lg">
              Available Credits:{" "}
              <span className="font-bold">{userCredit.credits}</span>
            </p>
          </div>
        )}

        <SubscriptionCard />
      </div>
    );
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
        <SubscriptionCard />
      </div>
    );
  }
}
