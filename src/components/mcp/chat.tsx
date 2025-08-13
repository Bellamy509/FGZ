"use client";

import type { Attachment, UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ChatHeader } from "@/components/mcp/chat-header";
import type { Vote } from "@/lib/mcp-chat/db/schema";
import { fetcher, generateUUID } from "@/lib/mcp-chat/utils";
import { Artifact } from "./artifact";
import { MultimodalInput } from "./multimodal-input";
import { Messages } from "./messages";
import { VisibilityType } from "./visibility-selector";
import { useArtifactSelector } from "@/hooks/use-artifact";
import { toast } from "sonner";
import { SuggestedActions } from "./suggested-actions";
import Link from "next/link";
import { useEffectiveSession } from "@/hooks/use-effective-session";
import { UpgradeAlert } from "@/components/upgrade-alert";

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  hasAPIKeys,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  hasAPIKeys?: boolean;
}) {
  const { mutate } = useSWRConfig();
  const { data: session } = useEffectiveSession();
  const isSignedIn = !!session?.user;

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    api: "/api/mcp-chat/chat",
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate("/api/mcp-chat/history");
      // Refresh user credits display after chat completion
      mutate("/api/user/credits");
    },
    onError: (error) => {
      // Check if error is a 401 unauthorized due to authentication
      if (error instanceof Error && error.message.includes("401")) {
        // This error is likely from the submitForm auth check, so we don't need to show an error
        return;
      }
      toast.error("An error occurred, please try again!");
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/mcp-chat/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Show error if no API keys are configured
  if (hasAPIKeys === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-background px-4">
        <div className="max-w-2xl w-full space-y-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-3">
              Missing AI API Keys
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              Oops, the chat app requires at least one of these environment
              variables to be set:
            </p>
            <ul className="text-left space-y-2 mb-4">
              <li className="text-red-600 dark:text-red-400">
                <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-sm">
                  OPENAI_API_KEY
                </code>{" "}
                - For OpenAI models
              </li>
              <li className="text-red-600 dark:text-red-400">
                <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-sm">
                  ANTHROPIC_API_KEY
                </code>{" "}
                - For Anthropic Claude models
              </li>
              <li className="text-red-600 dark:text-red-400">
                <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded text-sm">
                  GOOGLE_GENERATIVE_AI_API_KEY
                </code>{" "}
                - For Google Gemini models
              </li>
            </ul>
            <p className="text-sm text-red-600 dark:text-red-400">
              Please add at least one API key to your{" "}
              <code className="bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                .env
              </code>{" "}
              file and restart the server.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Need help? Check the{" "}
              <Link
                href="https://github.com/pipedreamhq/mcp"
                className="underline hover:text-foreground"
              >
                README
              </Link>{" "}
              for setup instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Layout adjustment for signed-out users
  if (!isSignedIn) {
    return (
      <>
        <div className="flex flex-col min-w-0 h-screen bg-background">
          <div className="flex-1 min-h-0 flex flex-col">
            {messages.length > 0 ? (
              <div className="flex-1 min-h-0">
                <Messages
                  chatId={id}
                  status={status}
                  votes={votes}
                  messages={messages}
                  setMessages={setMessages}
                  reload={reload}
                  isReadonly={isReadonly}
                  isArtifactVisible={isArtifactVisible}
                  append={append}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4 sm:px-0 max-w-3xl">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-2">
                    <h1 className="text-3xl font-bold max-w-[280px] sm:max-w-none leading-tight">
                      Welcome to David AI
                    </h1>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mt-1 sm:mt-0">
                      Alpha
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                    Chat directly with 2700+ APIs powered by{" "}
                    <Link
                      className="font-medium underline underline-offset-4"
                      href="https://pipedream.com/docs/connect/mcp/developers"
                      target="_blank"
                    >
                      Pipedream Connect
                    </Link>
                  </p>

                  {/* Show examples for new chats */}
                  <div className="w-full">
                    <SuggestedActions append={append} chatId={id} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 border-t bg-background">
            <form className="w-full max-w-3xl mx-auto px-4 py-4">
              {!isReadonly && (
                <MultimodalInput
                  chatId={id}
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  status={status}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  messages={messages}
                  setMessages={setMessages}
                  append={append}
                />
              )}
            </form>
          </div>
        </div>

        <Artifact
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          append={append}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          votes={votes}
          isReadonly={isReadonly}
        />
      </>
    );
  }

  // Default layout for signed-in users
  return (
    <>
      <div className="flex flex-col min-w-0 h-screen bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        {/* Upgrade Alert for MCP */}
        <div className="px-4 py-2">
          <UpgradeAlert context="mcp" showWhenLowCredits={true} />
        </div>

        <div className="flex-1 min-h-0">
          <Messages
            chatId={id}
            status={status}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isArtifactVisible={isArtifactVisible}
            append={append}
          />
        </div>

        <div className="flex-shrink-0 border-t bg-background">
          <form className="flex mx-auto px-4 py-4 gap-2 w-full md:max-w-3xl">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
              />
            )}
          </form>
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
