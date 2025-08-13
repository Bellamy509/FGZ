import { NextRequest, NextResponse } from "next/server";
import { mcpRepository } from "../../../../lib/db/repository";

export async function POST(request: NextRequest) {
  try {
    const { oldName, newName } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json(
        { error: "oldName and newName are required" },
        { status: 400 },
      );
    }

    console.log(`🔍 Searching for server with name: ${oldName}`);

    // Find the server with the old name
    const server = await mcpRepository.selectByServerName(oldName);

    if (!server) {
      return NextResponse.json(
        { error: `Server "${oldName}" not found in database` },
        { status: 404 },
      );
    }

    console.log(`✅ Found server: ${server.name} (ID: ${server.id})`);

    // Update the server name
    const updatedServer = await mcpRepository.updateServerName(
      server.id,
      newName,
    );

    if (updatedServer) {
      console.log(
        `✅ Successfully updated server name from "${oldName}" to "${newName}"`,
      );
      return NextResponse.json({
        success: true,
        message: `Server name updated from "${oldName}" to "${newName}"`,
        server: updatedServer,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to update server name" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("❌ Error updating MCP server name:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
