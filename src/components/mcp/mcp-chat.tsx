"use client";

import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Cpu, MessageCircle } from "lucide-react";
import { mutate } from "swr";
import { Button } from "ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "ui/card";
import { ScrollArea } from "ui/scroll-area";
import { Textarea } from "ui/textarea";
import { cn } from "lib/utils";

interface MCPChatProps {
  chatId: string;
  userId: string;
  userEmail: string;
}

export function MCPChat({ chatId, userId, userEmail }: MCPChatProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");

  const { messages, input, setInput, handleSubmit, isLoading, stop } = useChat({
    id: chatId,
    api: "/api/mcp-chat/chat",
    body: {
      chatId,
      userId,
      selectedModel,
    },
    onFinish: () => {
      // Refresh user credits display after chat completion
      mutate("/api/user/credits");
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const [attachments, setAttachments] = useState<any[]>([]);

  // Temporary console.log to avoid linter errors
  console.log({ setSelectedModel, attachments, setAttachments });

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Cpu className="size-5 text-blue-500" />
          <h1 className="text-lg font-semibold">MCP Chat</h1>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
            Alpha
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <MCPWelcome />
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-pulse">●</div>
                <span>L&apos;IA est en train d&apos;écrire...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Demandez à l&apos;IA d&apos;utiliser des APIs comme Gmail, Google Calendar, Stripe..."
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setInput(
                    "Aide-moi à organiser ma journée avec Google Calendar",
                  )
                }
              >
                📅 Google Calendar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput("Envoie un email avec Gmail")}
              >
                📧 Gmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInput("Vérifie mes paiements Stripe")}
              >
                💳 Stripe
              </Button>
            </div>
            <div className="flex gap-2">
              {isLoading ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={stop}
                >
                  Arrêter
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={!input.trim()}>
                  Envoyer
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function MCPWelcome() {
  return (
    <div className="text-center py-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Bienvenue dans MCP Chat</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Connectez l&apos;IA à plus de 2700+ APIs et services comme Gmail,
          Google Calendar, Stripe, HubSpot, et bien plus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              📧 Communication
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              Gmail, Outlook, Slack, Discord
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              📅 Productivité
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              Google Calendar, Notion, Trello, Asana
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              💳 Business
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-xs">
              Stripe, HubSpot, Salesforce, Shopify
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Commencez par taper votre demande ou utilisez les suggestions
          ci-dessous
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 space-y-2",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <div className="flex items-center gap-2 text-xs">
          {isUser ? (
            <>
              <span className="font-medium">Vous</span>
              <MessageCircle className="size-3" />
            </>
          ) : (
            <>
              <Cpu className="size-3" />
              <span className="font-medium">MCP Assistant</span>
            </>
          )}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.content}
        </div>
      </div>
    </div>
  );
}
