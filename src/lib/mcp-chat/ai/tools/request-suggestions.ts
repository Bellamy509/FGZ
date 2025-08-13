import { z } from "zod";
import { Session } from "next-auth";
import { DataStreamWriter, streamObject, tool } from "ai";
import { getDocumentById } from "@/lib/mcp-chat/db/queries";
// import { Suggestion } from "@/lib/mcp-chat/db/schema"; // TODO: Re-enable when saveSuggestions is implemented
// import { generateUUID } from "@/lib/utils"; // TODO: Re-enable when saveSuggestions is implemented
import { myProvider } from "../providers";

interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: "Request suggestions for a document",
    parameters: z.object({
      documentId: z
        .string()
        .describe("The ID of the document to request edits"),
    }),
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: "Document not found",
        };
      }

      const suggestions: Array<{
        originalSentence: string;
        suggestedSentence: string;
        description: string;
      }> = [];

      const { elementStream } = streamObject({
        model: myProvider.languageModel("artifact-model"),
        system:
          "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
        prompt: document.content,
        output: "array",
        schema: z.object({
          originalSentence: z.string().describe("The original sentence"),
          suggestedSentence: z.string().describe("The suggested sentence"),
          description: z.string().describe("The description of the suggestion"),
        }),
      });

      for await (const element of elementStream) {
        const suggestion = {
          originalSentence: element.originalSentence,
          suggestedSentence: element.suggestedSentence,
          description: element.description,
        };

        dataStream.writeData({
          type: "suggestion",
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      // TODO: Implement saveSuggestions function in queries.ts
      // if (session.user?.id) {
      //   const userId = session.user.id;
      //   await saveSuggestions({
      //     suggestions: suggestions.map((suggestion) => ({
      //       ...suggestion,
      //       userId,
      //       createdAt: new Date(),
      //       documentCreatedAt: document.createdAt,
      //     })),
      //   });
      // }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: "Suggestions have been added to the document",
      };
    },
  });
