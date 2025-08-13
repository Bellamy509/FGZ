#!/usr/bin/env node

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Configure dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🔍 Final MCP server name update...");
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
    // Use tsx to run TypeScript code
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    const scriptPath = join(__dirname, "update-mcp-server-name.ts");

    console.log("🚀 Executing TypeScript script with tsx...");
    const { stdout, stderr } = await execAsync(`npx tsx ${scriptPath}`);

    if (stderr) {
      console.log("⚠️ Warnings/Errors:", stderr);
    }

    console.log("📋 Output:", stdout);
  } catch (error) {
    console.error("❌ Error executing script:", error.message);

    // Fallback: Try manual SQL update
    console.log("🔄 Trying alternative approach...");
    await manualUpdate();
  }
}

async function manualUpdate() {
  try {
    console.log("🛠️ Attempting manual database update...");

    // Create a simple SQL update
    const updateQuery = `
      UPDATE mcp_servers 
      SET name = 'Deep Research', updated_at = NOW() 
      WHERE name = 'DeepResearchMCP'
    `;

    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    // Use psql command if available
    try {
      const result = await execAsync(
        `echo "${updateQuery}" | psql "${process.env.POSTGRES_URL}"`,
      );
      console.log("✅ SQL Update result:", result.stdout);

      if (result.stdout.includes("UPDATE 1")) {
        console.log(
          '🎉 Successfully updated MCP server name to "Deep Research"!',
        );
      } else {
        console.log(
          "⚠️ No rows were updated. Server might not exist or already updated.",
        );
      }
    } catch (sqlError) {
      console.log("❌ SQL execution failed:", sqlError.message);
      console.log(
        "💡 Please manually update the database or restart the application.",
      );
    }
  } catch (error) {
    console.error("❌ Manual update failed:", error.message);
  }
}

updateMcpServerName();
