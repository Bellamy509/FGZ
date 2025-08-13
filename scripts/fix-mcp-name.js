#!/usr/bin/env node

// Load environment variables like Next.js does
require("dotenv").config();

console.log("🔍 Attempting to update MCP server name...");
console.log("Environment check:");
console.log("- POSTGRES_URL:", process.env.POSTGRES_URL ? "Set" : "Not set");

// Make HTTP request to our API
const fetch = require("node-fetch");

async function updateMcpServerName() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/mcp/update-server-name",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldName: "DeepResearchMCP",
          newName: "Deep Research",
        }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Success:", result.message);
      console.log("📊 Updated server:", result.server);
    } else {
      console.log("❌ Error:", result.error);
      if (result.details) {
        console.log("🔍 Details:", result.details);
      }
    }
  } catch (error) {
    console.log("❌ Network error:", error.message);
    console.log(
      "💡 Make sure the Next.js development server is running (npm run dev)",
    );
  }
}

updateMcpServerName();
