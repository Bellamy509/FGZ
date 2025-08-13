"use client";

import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PromptInput from "./prompt-input";
import clsx from "clsx";
import { appStore } from "@/app/store";
import { cn, generateUUID } from "lib/utils";
import { ErrorMessage, PreviewMessage } from "./message";
import { ChatGreeting } from "./chat-greeting";
import { UpgradeAlert } from "./upgrade-alert";

import { useShallow } from "zustand/shallow";
import { UIMessage } from "ai";

import { safe } from "ts-safe";
import {
  ChatApiSchemaRequestBody,
  ClientToolInvocation,
  ChatModel,
  ChatMention,
} from "app-types/chat";
import { useToRef } from "@/hooks/use-latest";
import { isShortcutEvent, Shortcuts } from "lib/keyboard-shortcuts";
import { Button } from "ui/button";
import { deleteThreadAction } from "@/app/api/chat/actions";
import { Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "ui/dialog";
import { useTranslations } from "next-intl";
import { Think } from "ui/think";
import { useGenerateThreadTitle } from "@/hooks/queries/use-generate-thread-title";
import { useRouter } from "next/navigation";

type Props = {
  threadId: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel?: string;
  slots?: {
    emptySlot?: ReactNode;
    inputBottomSlot?: ReactNode;
  };
};

interface ChatState {
  threadId: string;
  model: ChatModel | undefined;
  toolChoice: "auto" | "none" | "manual";
  allowedAppDefaultToolkit: string[];
  allowedMcpServers: Record<string, { tools: string[] }>;
  mentions: ChatMention[];
  threadList: any[];
  messages: UIMessage[];
}

export default function ChatBot({ threadId, initialMessages, slots }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const latestRef = useToRef<ChatState>({
    threadId,
    model: undefined,
    toolChoice: "auto", // Default value
    allowedAppDefaultToolkit: [],
    allowedMcpServers: {},
    mentions: [],
    threadList: [],
    messages: initialMessages || [],
  });

  const [appStoreMutate, threadList] = appStore(
    useShallow((state) => [state.mutate, state.threadList]),
  );

  const generateTitle = useGenerateThreadTitle({
    threadId,
  });

  const {
    messages,
    input,
    setInput,
    append,
    status,
    reload,
    setMessages,
    addToolResult,
    error,
    stop,
  } = useChat({
    id: threadId,
    api: "/api/chat",
    initialMessages,
    experimental_prepareRequestBody: ({ messages }) => {
      const isNewThread =
        !latestRef.current.threadList.some((v) => v.id === threadId) &&
        messages.filter((v) => v.role === "user" || v.role === "assistant")
          .length < 2 &&
        messages.at(-1)?.role === "user";
      if (isNewThread) {
        const part = messages.at(-1)!.parts.findLast((v) => v.type === "text");
        if (part) {
          generateTitle(part.text);
        }
      }
      window.history.replaceState({}, "", `/chat/${threadId}`);
      const lastMessage = messages.at(-1)!;
      vercelAISdkV4ToolInvocationIssueCatcher(lastMessage);

      // Ensure toolChoice is always a valid value
      const toolChoice = latestRef.current.toolChoice || "auto";
      if (!["auto", "none", "manual"].includes(toolChoice)) {
        console.warn(
          `Invalid toolChoice value: ${toolChoice}, defaulting to "auto"`,
        );
      }

      const request: ChatApiSchemaRequestBody = {
        id: latestRef.current.threadId,
        chatModel: latestRef.current.model,
        toolChoice: toolChoice as "auto" | "none" | "manual",
        allowedAppDefaultToolkit: latestRef.current.allowedAppDefaultToolkit,
        allowedMcpServers: latestRef.current.allowedMcpServers,
        mentions: latestRef.current.mentions,
        message: lastMessage,
      };
      return request;
    },
    onError: (error) => {
      if (error.message.includes("Insufficient credits")) {
        toast.error("Insufficient credits. Please upgrade to continue.");
      } else {
        toast.error("An error occurred while sending your message.");
      }
    },
    onFinish: () => {
      if (threadList[0]?.id !== threadId) {
        appStoreMutate((state) => ({
          threadList: state.threadList,
        }));
      }
    },
    sendExtraMessageFields: true,
    generateId: generateUUID,
    experimental_throttle: 100,
  });

  useEffect(() => {
    if (messages) {
      latestRef.current.messages = messages;
    }
  }, [messages, latestRef]);

  const [isDeleteThreadPopupOpen, setIsDeleteThreadPopupOpen] = useState(false);

  const isLoading = useMemo(
    () => status === "streaming" || status === "submitted",
    [status],
  );

  const emptyMessage = useMemo(
    () => messages.length === 0 && !error,
    [messages.length, error],
  );

  const isInitialThreadEntry = useMemo(
    () =>
      initialMessages.length > 0 &&
      initialMessages.at(-1)?.id === messages.at(-1)?.id,
    [initialMessages, messages],
  );

  const needSpaceClass = useCallback(
    (index: number) => {
      if (error || isInitialThreadEntry || index != messages.length - 1)
        return false;
      const message = messages[index];
      if (message.role === "user") return false;
      return true;
    },
    [messages, error],
  );

  const [isExecutingProxyToolCall, setIsExecutingProxyToolCall] =
    useState(false);

  const isPendingToolCall = useMemo(() => {
    if (status != "ready") return false;
    const lastMessage = messages.at(-1);
    if (lastMessage?.role != "assistant") return false;
    const lastPart = lastMessage.parts.at(-1);
    if (!lastPart) return false;
    if (lastPart.type != "tool-invocation") return false;
    if (lastPart.toolInvocation.state == "result") return false;
    return true;
  }, [status, messages]);

  const proxyToolCall = useCallback(
    (result: ClientToolInvocation) => {
      setIsExecutingProxyToolCall(true);
      return safe(async () => {
        const lastMessage = messages.at(-1)!;
        const lastPart = lastMessage.parts.at(-1)! as Extract<
          UIMessage["parts"][number],
          { type: "tool-invocation" }
        >;
        return addToolResult({
          toolCallId: lastPart.toolInvocation.toolCallId,
          result,
        });
      })
        .watch(() => setIsExecutingProxyToolCall(false))
        .unwrap();
    },
    [addToolResult],
  );

  const showThink = useMemo(() => {
    if (!isLoading) return false;
    const lastMessage = messages.at(-1);
    if (lastMessage?.role == "user") return true;
    const lastPart = lastMessage?.parts.at(-1);

    if (lastPart?.type == "step-start") return true;
    return false;
  }, [isLoading, messages.at(-1)]);

  useEffect(() => {
    appStoreMutate({ currentThreadId: threadId });
    return () => {
      appStoreMutate({ currentThreadId: null });
    };
  }, [threadId]);

  useEffect(() => {
    if (isInitialThreadEntry)
      containerRef.current?.scrollTo({
        top: containerRef.current?.scrollHeight,
        behavior: "instant",
      });
  }, [isInitialThreadEntry]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const currentMessages = latestRef.current.messages;
      if (!currentMessages?.length) return;

      const isLastMessageCopy = isShortcutEvent(e, Shortcuts.lastMessageCopy);
      const isDeleteThread = isShortcutEvent(e, Shortcuts.deleteThread);
      if (!isDeleteThread && !isLastMessageCopy) return;

      e.preventDefault();
      e.stopPropagation();

      if (isLastMessageCopy) {
        const lastMessage = currentMessages[currentMessages.length - 1];
        const lastMessageText = lastMessage.parts
          .filter((part) => part.type === "text")
          ?.at(-1)?.text;
        if (!lastMessageText) return;
        navigator.clipboard.writeText(lastMessageText);
        toast.success("Last message copied to clipboard");
      }

      if (isDeleteThread) {
        setIsDeleteThreadPopupOpen(true);
      }
    },
    [latestRef],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={cn(
        emptyMessage && "justify-center pb-24",
        "flex flex-col min-w-0 relative h-full",
      )}
    >
      {emptyMessage ? (
        slots?.emptySlot ? (
          slots.emptySlot
        ) : (
          <ChatGreeting />
        )
      ) : (
        <>
          {/* Upgrade Alert for main chat */}
          <div className="px-6 pt-4">
            <UpgradeAlert context="chat" showWhenLowCredits={true} />
          </div>

          <div
            className={"flex flex-col gap-2 overflow-y-auto py-6"}
            ref={containerRef}
          >
            {messages.map((message, index) => {
              const isLastMessage = messages.length - 1 === index;
              return (
                <PreviewMessage
                  threadId={threadId}
                  messageIndex={index}
                  key={index}
                  message={message}
                  status={status}
                  onPoxyToolCall={
                    isPendingToolCall &&
                    !isExecutingProxyToolCall &&
                    isLastMessage
                      ? proxyToolCall
                      : undefined
                  }
                  isLoading={isLoading || isPendingToolCall}
                  isError={!!error && isLastMessage}
                  isLastMessage={isLastMessage}
                  setMessages={setMessages}
                  reload={reload}
                  className={needSpaceClass(index) ? "min-h-[55dvh]" : ""}
                />
              );
            })}
            {showThink && (
              <div className="w-full mx-auto max-w-3xl px-6">
                <Think />
              </div>
            )}
            {status === "submitted" && messages.at(-1)?.role === "user" && (
              <div className="min-h-[calc(55dvh-56px)]" />
            )}
            {error && <ErrorMessage error={error} />}
            <div className="min-w-0 min-h-52" />
          </div>
        </>
      )}
      <div className={clsx(messages.length && "absolute bottom-14", "w-full")}>
        <PromptInput
          input={input}
          threadId={threadId}
          append={append}
          setInput={setInput}
          isLoading={isLoading || isPendingToolCall}
          onStop={stop}
        />
        {slots?.inputBottomSlot}
      </div>
      <DeleteThreadPopup
        isOpen={isDeleteThreadPopupOpen}
        onClose={() => setIsDeleteThreadPopupOpen(false)}
        threadId={threadId}
      />
    </div>
  );
}

function vercelAISdkV4ToolInvocationIssueCatcher(message: UIMessage) {
  if (message.role != "assistant") return;
  const lastPart = message.parts.at(-1);
  if (lastPart?.type != "tool-invocation") return;
  if (!message.toolInvocations)
    message.toolInvocations = [lastPart.toolInvocation];
}

function DeleteThreadPopup({
  isOpen,
  onClose,
  threadId,
}: {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
}) {
  const t = useTranslations();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    safe(() => deleteThreadAction(threadId))
      .map(() => {
        router.push("/chat");
        onClose();
      })
      .ifFail((error) => {
        console.error("Failed to delete thread:", error);
        toast.error("Failed to delete thread");
      })
      .watch(() => {
        setIsDeleting(false);
      });
  }, [threadId, onClose, router]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Delete Thread")}</DialogTitle>
          <DialogDescription>
            {t("Are you sure you want to delete this thread?")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {t("Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
