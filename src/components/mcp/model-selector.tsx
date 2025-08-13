"use client";

import { startTransition, useMemo, useOptimistic, useState } from "react";

import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { customModelProvider } from "@/lib/ai/models";
import { cn } from "@/lib/mcp-chat/utils";

import { CheckCircleFillIcon, ChevronDownIcon } from "./icons";

// Adapter les modèles de l'app principale vers le format MCP
const chatModels = customModelProvider.modelsInfo.flatMap(
  ({ provider, models }) =>
    models.map(({ name }) => {
      // Mapping pour garder la compatibilité avec les IDs originaux de l'app MCP
      let id = name;
      let displayName = name;
      let description = `${name} from ${provider}`;

      // Mapping spécifique pour les modèles connus
      if (provider === "anthropic") {
        if (name === "claude-4-sonnet") {
          id = "claude-sonnet-4-0";
          displayName = "Claude Sonnet 4";
          description = "High intelligence and balanced performance";
        } else if (name === "claude-4-opus") {
          id = "claude-opus-4-0";
          displayName = "Claude Opus 4";
          description = "Highest level of intelligence and capability";
        }
      } else if (provider === "openai") {
        // GPT-4o Series mappings
        if (name === "gpt-4o") {
          id = "gpt-4o";
          displayName = "GPT-4o";
          description = "Most advanced GPT-4 model with vision capabilities";
        } else if (name === "gpt-4o-mini") {
          id = "gpt-4o-mini";
          displayName = "GPT-4o Mini";
          description = "Small model for fast, lightweight tasks";
        } else if (name === "gpt-4-turbo") {
          id = "gpt-4-turbo";
          displayName = "GPT-4 Turbo";
          description = "Fast and powerful GPT-4 model";
        } else if (name === "gpt-4") {
          id = "gpt-4";
          displayName = "GPT-4";
          description = "Flagship GPT-4 model for complex tasks";
        } else if (name === "o1") {
          id = "o1";
          displayName = "o1";
          description = "Advanced reasoning model";
        } else if (name === "o1-mini") {
          id = "o1-mini";
          displayName = "o1 Mini";
          description = "Lightweight reasoning model";
        }
      } else if (provider === "google") {
        if (name === "gemini-2.5-flash") {
          id = "gemini-2.5-flash";
          displayName = "Gemini 2.5 Flash";
          description = "High performance, low cost model";
        }
      }

      return {
        id,
        name: displayName,
        description,
      };
    }),
);

export function ModelSelector({
  selectedModelId,
  className,
}: {
  selectedModelId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  const selectedChatModel = useMemo(
    () => chatModels.find((chatModel) => chatModel.id === optimisticModelId),
    [optimisticModelId],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
          className,
        )}
        asChild
      >
        <Button variant="outline" className="md:px-2 md:h-[34px]">
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {chatModels.map((chatModel) => (
          <DropdownMenuItem
            key={chatModel.id}
            onSelect={() => {
              setOpen(false);

              startTransition(() => {
                setOptimisticModelId(chatModel.id);
                saveChatModelAsCookie(chatModel.id);
              });
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={chatModel.id === optimisticModelId}
          >
            <div className="flex flex-col gap-1 items-start">
              {chatModel.name}
              {chatModel.description && (
                <div className="text-xs text-muted-foreground">
                  {chatModel.description}
                </div>
              )}
            </div>
            {chatModel.id === optimisticModelId && (
              <div className="text-blue-400">
                <CheckCircleFillIcon />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
