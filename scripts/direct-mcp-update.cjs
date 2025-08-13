#!/usr/bin/env node

// Load environment variables
require("dotenv").config();

console.log("🔍 Direct MCP server name update...");
console.log("Environment check:");
console.log(
  "- POSTGRES_URL:",
  process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set",
);

if (!process.env.POSTGRES_URL) {
  console.log("❌ POSTGRES_URL not found. Please check your .env file.");
  process.exit(1);
}

async function updateMcpServerName() {
  try {
    // Import the repository using dynamic import
    const { mcpRepository } = await import("../src/lib/db/repository.ts");

    console.log("🔍 Searching for DeepResearchMCP server...");

    // Find the server with the old name
    const server = await mcpRepository.selectByServerName("DeepResearchMCP");

    if (!server) {
      console.log('❌ Server "DeepResearchMCP" not found in database');
      console.log(
        "💡 This might mean the server name has already been updated or doesn't exist.",
      );
      return;
    }

    console.log(`✅ Found server: ${server.name} (ID: ${server.id})`);

    // Update the server name
    const updatedServer = await mcpRepository.updateServerName(
      server.id,
      "Deep Research",
    );

    if (updatedServer) {
      console.log(
        `✅ Successfully updated server name from "${server.name}" to "${updatedServer.name}"`,
      );
      console.log(`📅 Updated at: ${updatedServer.updatedAt}`);
      console.log(
        "🎉 The change should be reflected in the deployed application after the next restart!",
      );
    } else {
      console.log("❌ Failed to update server name");
    }
  } catch (error) {
    console.error("❌ Error updating MCP server name:", error.message);
    console.error("🔍 Full error:", error);
  } finally {
    process.exit(0);
  }
}

updateMcpServerName();
