import { db } from "../db.pg";
import { eq, and } from "drizzle-orm";
import { McpServerSchema, userMcpServers } from "../schema.pg";
import type { McpServerEntity } from "../schema.pg";

export const mcpRepository = {
  async selectAll(): Promise<McpServerEntity[]> {
    return db.select().from(McpServerSchema);
  },

  async selectById(id: string): Promise<McpServerEntity | null> {
    const [server] = await db
      .select()
      .from(McpServerSchema)
      .where(eq(McpServerSchema.id, id));
    return server ?? null;
  },

  async selectByServerName(name: string): Promise<McpServerEntity | null> {
    const [server] = await db
      .select()
      .from(McpServerSchema)
      .where(eq(McpServerSchema.name, name));
    return server ?? null;
  },

  async save(
    server: typeof McpServerSchema.$inferInsert,
  ): Promise<McpServerEntity> {
    const [savedServer] = await db
      .insert(McpServerSchema)
      .values(server)
      .returning();
    return savedServer;
  },

  async deleteById(id: string): Promise<void> {
    await db.delete(McpServerSchema).where(eq(McpServerSchema.id, id));
  },

  async updateServerName(
    id: string,
    newName: string,
  ): Promise<McpServerEntity | null> {
    const [updatedServer] = await db
      .update(McpServerSchema)
      .set({
        name: newName,
        updatedAt: new Date(),
      })
      .where(eq(McpServerSchema.id, id))
      .returning();
    return updatedServer ?? null;
  },

  // New methods for user-specific MCP servers
  async getUserServers(userId: string): Promise<McpServerEntity[]> {
    const userServers = await db
      .select({
        id: McpServerSchema.id,
        name: McpServerSchema.name,
        config: userMcpServers.config,
        createdAt: McpServerSchema.createdAt,
        updatedAt: McpServerSchema.updatedAt,
      })
      .from(userMcpServers)
      .innerJoin(
        McpServerSchema,
        eq(userMcpServers.serverId, McpServerSchema.id),
      )
      .where(eq(userMcpServers.userId, userId));

    // Add enabled: true and cast config
    return userServers.map((server) => ({
      ...server,
      enabled: true,
      config: server.config as import("app-types/mcp").MCPServerConfig,
    }));
  },

  async saveUserServer(
    userId: string,
    serverId: string,
    config: Record<string, any>,
  ): Promise<void> {
    await db.insert(userMcpServers).values({
      userId,
      serverId,
      config,
    });
  },

  async updateUserServer(
    userId: string,
    serverId: string,
    config: Record<string, any>,
  ): Promise<void> {
    await db
      .update(userMcpServers)
      .set({ config, updatedAt: new Date() })
      .where(
        and(
          eq(userMcpServers.userId, userId),
          eq(userMcpServers.serverId, serverId),
        ),
      );
  },

  async deleteUserServer(userId: string, serverId: string): Promise<void> {
    await db
      .delete(userMcpServers)
      .where(
        and(
          eq(userMcpServers.userId, userId),
          eq(userMcpServers.serverId, serverId),
        ),
      );
  },

  async getUserServerConfig(
    userId: string,
    serverId: string,
  ): Promise<Record<string, any> | null> {
    const [userServer] = await db
      .select()
      .from(userMcpServers)
      .where(
        and(
          eq(userMcpServers.userId, userId),
          eq(userMcpServers.serverId, serverId),
        ),
      );

    return userServer?.config ?? null;
  },
};
