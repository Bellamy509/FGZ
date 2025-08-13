import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/pg/db.pg";
import { ChatThreadSchema, ChatMessageSchema } from "@/lib/db/pg/schema.pg";
import type { DBMessage, Chat, Vote, Document } from "./schema";
import type { VisibilityType } from "@/components/mcp/visibility-selector";

// Adapter les queries MCP vers le schéma de l'app principale

export async function saveChat({
  id,
  userId,
  title,
}: { id: string; userId: string; title: string }) {
  try {
    return await db.insert(ChatThreadSchema).values({
      id,
      userId,
      title,
    });
  } catch (error) {
    console.error("Failed to save chat:", error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db
      .delete(ChatMessageSchema)
      .where(eq(ChatMessageSchema.threadId, id));
    await db.delete(ChatThreadSchema).where(eq(ChatThreadSchema.id, id));
  } catch (error) {
    console.error("Failed to delete chat:", error);
    throw error;
  }
}

export async function getChatsByUserId({
  id,
}: { id: string }): Promise<Array<Chat>> {
  try {
    const chats = await db
      .select({
        id: ChatThreadSchema.id,
        title: ChatThreadSchema.title,
        userId: ChatThreadSchema.userId,
        createdAt: ChatThreadSchema.createdAt,
        visibility: sql<VisibilityType>`'private'`.as("visibility"),
      })
      .from(ChatThreadSchema)
      .where(eq(ChatThreadSchema.userId, id))
      .orderBy(desc(ChatThreadSchema.createdAt));

    return chats;
  } catch (error) {
    console.error("Failed to get chats by user id:", error);
    return [];
  }
}

export async function getChatById({
  id,
}: { id: string }): Promise<Chat | null> {
  try {
    const [chat] = await db
      .select({
        id: ChatThreadSchema.id,
        title: ChatThreadSchema.title,
        userId: ChatThreadSchema.userId,
        createdAt: ChatThreadSchema.createdAt,
        visibility: sql<VisibilityType>`'private'`.as("visibility"),
      })
      .from(ChatThreadSchema)
      .where(eq(ChatThreadSchema.id, id));

    return chat || null;
  } catch (error) {
    console.error("Failed to get chat by id:", error);
    return null;
  }
}

export async function saveMessages({
  messages,
}: { messages: Array<DBMessage> }) {
  try {
    return await db.insert(ChatMessageSchema).values(
      messages.map((message) => ({
        id: message.id,
        threadId: message.chatId,
        role: message.role,
        parts: message.parts,
        attachments: message.attachments || [],
        createdAt: message.createdAt,
      })) as any,
    );
  } catch (error) {
    console.error("Failed to save messages:", error);
    throw error;
  }
}

export async function getMessagesByChatId({
  id,
}: { id: string }): Promise<Array<DBMessage>> {
  try {
    const messages = await db
      .select()
      .from(ChatMessageSchema)
      .where(eq(ChatMessageSchema.threadId, id))
      .orderBy(asc(ChatMessageSchema.createdAt));

    return messages.map((msg) => ({
      id: msg.id,
      chatId: msg.threadId,
      role: msg.role as any,
      parts: msg.parts as any,
      attachments: msg.attachments as any,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get messages by chat id:", error);
    return [];
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(ChatMessageSchema)
      .where(
        and(
          eq(ChatMessageSchema.threadId, chatId),
          gte(ChatMessageSchema.createdAt, timestamp),
        ),
      );
  } catch (error) {
    console.error("Failed to delete messages:", error);
    throw error;
  }
}

export async function getMessageById({
  id,
}: { id: string }): Promise<DBMessage | null> {
  try {
    const [message] = await db
      .select()
      .from(ChatMessageSchema)
      .where(eq(ChatMessageSchema.id, id));

    if (!message) return null;

    return {
      id: message.id,
      chatId: message.threadId,
      role: message.role as any,
      parts: message.parts as any,
      attachments: message.attachments as any,
      createdAt: message.createdAt,
    };
  } catch (error) {
    console.error("Failed to get message by id:", error);
    return null;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    // Pour le moment, on ne fait rien car l'app principale n'a pas de champ visibility
    // Dans le futur, on pourrait ajouter ce champ au schéma
    console.log(
      "Chat visibility update requested but not implemented for main app schema",
      { chatId, visibility },
    );
    return null;
  } catch (error) {
    console.error("Failed to update chat visibility:", error);
    throw error;
  }
}

// Stubs pour les fonctions non utilisées dans cette intégration
export async function getVotesByChatId({
  id,
}: { id: string }): Promise<Array<Vote>> {
  console.log("getVotesByChatId called for id:", id);
  return [];
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: { chatId: string; messageId: string; type: string }) {
  // Not implemented for main app integration
  console.log("voteMessage called:", { chatId, messageId, type });
  return null;
}

export async function getDocumentById({
  id,
}: { id: string }): Promise<Document | null> {
  console.log("getDocumentById called for id:", id);
  return null;
}

export async function deleteDocumentsByIdAfterTimestamp({
  documentId,
  timestamp,
}: { documentId: string; timestamp: Date }) {
  // Not implemented for main app integration
  console.log("deleteDocumentsByIdAfterTimestamp called:", {
    documentId,
    timestamp,
  });
  return null;
}

export async function saveDocument({ document }: { document: Document }) {
  // Not implemented for main app integration
  console.log("saveDocument called:", document);
  return null;
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    // Placeholder implementation for main app integration
    // Returns empty array since the main app doesn't have suggestion table yet
    console.log(
      "getSuggestionsByDocumentId called for documentId:",
      documentId,
    );
    return [];
  } catch (error) {
    console.error("Failed to get suggestions by document id from database");
    throw error;
  }
}
