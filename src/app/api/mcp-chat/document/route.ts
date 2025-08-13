import { getEffectiveSession } from "@/lib/mcp-chat/auth-utils";
import { ArtifactKind } from "@/components/mcp/artifact";
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentById,
  saveDocument,
} from "@/lib/mcp-chat/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = await getEffectiveSession();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return new Response("Not Found", { status: 404 });
  }

  if (document.userId !== session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json(document, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = await getEffectiveSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: ArtifactKind } =
    await request.json();

  if (session.user?.id) {
    const document = await saveDocument({
      document: {
        id,
        content,
        title,
        kind,
        userId: session.user.id,
        createdAt: new Date(),
      },
    });

    return Response.json(document, { status: 200 });
  }

  return new Response("Unauthorized", { status: 401 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const session = await getEffectiveSession();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const document = await getDocumentById({ id });

  if (!document) {
    return new Response("Document not found", { status: 404 });
  }

  if (document.userId !== session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    documentId: id,
    timestamp: new Date(timestamp),
  });

  return new Response("Deleted", { status: 200 });
}
