import { NextRequest, NextResponse } from "next/server";
import { pdClient } from "@/lib/mcp-chat/pd-backend-client";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  // Page is 1-indexed in the existing UI
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.max(
    1,
    Number.parseInt(searchParams.get("pageSize") || "15"),
  );

  try {
    // Request up to page * pageSize records so we can slice locally.
    const limit = Math.min(page * pageSize, 100); // API max 100

    // Use the real Pipedream API to get apps
    const res = await pdClient().getApps({
      limit,
      q: search.trim(),
      sortKey: "featured_weight",
      sortDirection: "desc",
    });

    return NextResponse.json(res);
  } catch (error) {
    console.error("Error fetching apps from Pipedream:", error);

    // Fallback to mock data if Pipedream API fails
    const mockApps = [
      {
        id: "app_1",
        name: "OpenAI",
        description: "AI and machine learning tools",
        logo: "https://cdn.openai.com/API/favicon.png",
        featured_weight: 100,
        category: "AI",
      },
      {
        id: "app_2",
        name: "Google Sheets",
        description: "Spreadsheet and data management",
        logo: "https://ssl.gstatic.com/docs/spreadsheets/favicon3.ico",
        featured_weight: 90,
        category: "Productivity",
      },
      {
        id: "app_3",
        name: "Slack",
        description: "Team communication and collaboration",
        logo: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
        featured_weight: 85,
        category: "Communication",
      },
      {
        id: "app_4",
        name: "GitHub",
        description: "Code repository and version control",
        logo: "https://github.githubassets.com/favicons/favicon.png",
        featured_weight: 80,
        category: "Development",
      },
      {
        id: "app_5",
        name: "Gmail",
        description: "Email management and automation",
        logo: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico",
        featured_weight: 75,
        category: "Communication",
      },
    ];

    const searchLower = search.toLowerCase().trim();
    let filteredApps = mockApps;
    if (search.trim()) {
      filteredApps = mockApps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchLower) ||
          app.description.toLowerCase().includes(searchLower) ||
          app.category.toLowerCase().includes(searchLower),
      );
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedApps = filteredApps.slice(startIndex, endIndex);

    const fallbackResponse = {
      data: paginatedApps,
      total: filteredApps.length,
      page,
      pageSize,
      hasMore: endIndex < filteredApps.length,
    };

    return NextResponse.json(fallbackResponse);
  }
}
