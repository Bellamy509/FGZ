import { getSession } from "auth/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Pour l'instant, retournons des données mockées
    // Plus tard, nous récupérerons les vrais chats depuis la base de données
    const mockChats = [
      {
        id: "mcp-demo-gmail",
        title: "Gmail Automation",
        description: "Configuration des emails automatiques",
        updatedAt: new Date().toISOString(),
        userId: session.user.id,
      },
      {
        id: "mcp-demo-calendar",
        title: "Google Calendar Integration",
        description: "Synchronisation des événements",
        updatedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        userId: session.user.id,
      },
    ];

    return Response.json(mockChats);
  } catch (error) {
    console.error("MCP Chats API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { title, description } = await request.json();

    // Pour l'instant, créons un chat mocké
    // Plus tard, nous l'enregistrerons en base de données
    const newChat = {
      id: `mcp-${Date.now()}`,
      title: title || "Nouveau Chat MCP",
      description: description || "Chat avec les outils MCP",
      updatedAt: new Date().toISOString(),
      userId: session.user.id,
    };

    return Response.json(newChat);
  } catch (error) {
    console.error("MCP Create Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
