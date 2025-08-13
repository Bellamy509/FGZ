import { NextRequest, NextResponse } from "next/server";
import { getEffectiveSession } from "@/lib/mcp-chat/auth/server";

// Mock history data - simulant l'historique des conversations (format Chat)
const mockHistory = [
  {
    id: "conv_1",
    title: "Getting started with MCP",
    createdAt: new Date(),
    userId: "mock-user-id",
    visibility: "private" as const,
  },
  {
    id: "conv_2",
    title: "Data analysis with AI",
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    userId: "mock-user-id",
    visibility: "private" as const,
  },
  {
    id: "conv_3",
    title: "Code review assistance",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    userId: "mock-user-id",
    visibility: "private" as const,
  },
];

export async function GET(_req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getEffectiveSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // No pagination needed, return all history

    // Simulate user-specific history (in real app, would query database)
    const userHistory = mockHistory.map((item) => ({
      ...item,
      userId: session.user?.id || "guest",
    }));

    // Return array directly (no pagination wrapper)
    return NextResponse.json(userHistory);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
