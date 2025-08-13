import { db } from "../db.pg";
import { eq, and } from "drizzle-orm";
import { mcpToolCustomizations, mcpServers } from "../schema.pg";

export const pgMcpToolCustomizationRepository = {
  async getCustomization(serverId: string, toolId: string) {
    const [customization] = await db
      .select()
      .from(mcpToolCustomizations)
      .where(
        and(
          eq(mcpToolCustomizations.serverId, serverId),
          eq(mcpToolCustomizations.toolId, toolId),
        ),
      );
    return customization;
  },

  async saveCustomization(
    serverId: string,
    toolId: string,
    config: Record<string, any>,
  ) {
    await db
      .insert(mcpToolCustomizations)
      .values({
        serverId,
        toolId,
        config,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [mcpToolCustomizations.serverId, mcpToolCustomizations.toolId],
        set: {
          config,
          updatedAt: new Date(),
        },
      });
  },

  async deleteCustomization(serverId: string, toolId: string) {
    await db
      .delete(mcpToolCustomizations)
      .where(
        and(
          eq(mcpToolCustomizations.serverId, serverId),
          eq(mcpToolCustomizations.toolId, toolId),
        ),
      );
  },

  async selectByUserIdAndMcpServerId({
    userId,
    mcpServerId,
  }: {
    userId: string;
    mcpServerId: string;
  }) {
    return db
      .select()
      .from(mcpToolCustomizations)
      .innerJoin(mcpServers, eq(mcpToolCustomizations.serverId, mcpServers.id))
      .where(
        and(
          eq(mcpServers.userId, userId),
          eq(mcpToolCustomizations.serverId, mcpServerId),
        ),
      );
  },

  async selectByUserId(userId: string) {
    return db
      .select({
        id: mcpToolCustomizations.id,
        serverId: mcpToolCustomizations.serverId,
        toolId: mcpToolCustomizations.toolId,
        config: mcpToolCustomizations.config,
        serverName: mcpServers.name,
      })
      .from(mcpToolCustomizations)
      .innerJoin(mcpServers, eq(mcpToolCustomizations.serverId, mcpServers.id))
      .where(eq(mcpServers.userId, userId));
  },
};
