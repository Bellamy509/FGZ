import { getSuggestionsByDocumentId } from "@/lib/mcp-chat/db/queries";
import { getEffectiveSession } from "@/lib/mcp-chat/auth-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await getEffectiveSession();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const suggestions = await getSuggestionsByDocumentId({
    documentId,
  });

  // Note: getSuggestionsByDocumentId currently returns empty array as placeholder
  // Authorization check would be implemented when suggestion table is available
  return Response.json(suggestions, { status: 200 });
}
