#!/usr/bin/env tsx

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import { db } from "../src/lib/db/pg/db.pg";
import { McpServerSchema } from "../src/lib/db/pg/schema.pg";
import { eq } from "drizzle-orm";

async function updateMcpServerName() {
  console.log("🔍 Searching for DeepResearchMCP server...");

  try {
    // Find the server with the old name
    const [server] = await db
      .select()
      .from(McpServerSchema)
      .where(eq(McpServerSchema.name, "DeepResearchMCP"));

    if (!server) {
      console.log('❌ Server "DeepResearchMCP" not found in database');
      return;
    }

    console.log(`✅ Found server: ${server.name} (ID: ${server.id})`);

    // Update the server name
    const [updatedServer] = await db
      .update(McpServerSchema)
      .set({
        name: "Deep Research",
        updatedAt: new Date(),
      })
      .where(eq(McpServerSchema.id, server.id))
      .returning();

    if (updatedServer) {
      console.log(
        `✅ Successfully updated server name from "${server.name}" to "${updatedServer.name}"`,
      );
      console.log(`📅 Updated at: ${updatedServer.updatedAt}`);
    } else {
      console.log("❌ Failed to update server name");
    }
  } catch (error) {
    console.error("❌ Error updating MCP server name:", error);
  } finally {
    process.exit(0);
  }
}

// Run the update
updateMcpServerName();
