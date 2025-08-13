import { pgChatRepository } from "./pg/repositories/chat-repository.pg";
import { pgUserRepository } from "./pg/repositories/user-repository.pg";
import { mcpRepository } from "./pg/repositories/mcp-repository.pg";
import { pgMcpToolCustomizationRepository } from "./pg/repositories/mcp-tool-customization-repository.pg";
import { pgMcpServerCustomizationRepository } from "./pg/repositories/mcp-server-customization-repository.pg";
import { pgWorkflowRepository } from "./pg/repositories/workflow-repository.pg";
import { db } from "./pg/db.pg";
import { eq } from "drizzle-orm";
import { userCredits } from "./pg/schema.pg";

export {
  pgChatRepository as chatRepository,
  pgUserRepository as userRepository,
  mcpRepository,
  pgMcpToolCustomizationRepository as mcpMcpToolCustomizationRepository,
  pgMcpServerCustomizationRepository as mcpServerCustomizationRepository,
  pgWorkflowRepository as workflowRepository,
};

export async function deductUserCredits(userId: string, tokensUsed: number) {
  try {
    // Get current credits
    const [currentCredits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId));

    if (!currentCredits) {
      throw new Error("No credits found for user");
    }

    // Calculate credits to deduct (1 credit per 1000 tokens)
    const creditsToDeduct = Math.ceil(tokensUsed / 1000);

    // Update credits
    await db
      .update(userCredits)
      .set({
        credits: Math.max(0, currentCredits.credits - creditsToDeduct),
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    return creditsToDeduct;
  } catch (error) {
    console.error("Error deducting credits:", error);
    throw error;
  }
}
