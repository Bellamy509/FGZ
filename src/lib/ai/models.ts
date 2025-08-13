// models.ts
import { createOllama } from "ollama-ai-provider";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { LanguageModel } from "ai";
import {
  createOpenAICompatibleModels,
  openaiCompatibleModelsSafeParse,
} from "./create-openai-compatiable";
import { ChatModel } from "app-types/chat";

const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/api",
});

const staticModels: Record<string, Record<string, LanguageModel>> = {
  openai: {
    // GPT-4o Series (Available models)
    "4o": openai("gpt-4o"),
    "4o-mini": openai("gpt-4o-mini"),

    // GPT-4 Turbo Series
    "gpt-4-turbo": openai("gpt-4-turbo"),
    "gpt-4": openai("gpt-4"),

    // o1 Reasoning Series (Available models)
    o1: openai("o1"),
    "o1-mini": openai("o1-mini"),
  },
  google: {
    "gemini-2.0-flash-lite": google("gemini-2.0-flash-lite"),
    "gemini-2.5-flash": google("gemini-2.5-flash-preview-04-17"),
    "gemini-2.5-pro": google("gemini-2.5-pro-preview-05-06"),
  },
  anthropic: {
    "claude-4-sonnet": anthropic("claude-4-sonnet-20250514"),
    "claude-4-opus": anthropic("claude-4-opus-20250514"),
    "claude-3-7-sonnet": anthropic("claude-3-7-sonnet-latest"),
  },
  xai: {
    "grok-3": xai("grok-3-latest"),
    "grok-3-mini": xai("grok-3-mini-latest"),
  },
  ollama: {
    "gemma3:1b": ollama("gemma3:1b"),
    "gemma3:4b": ollama("gemma3:4b"),
    "gemma3:12b": ollama("gemma3:12b"),
  },
  openRouter: {
    "qwen3-8b:free": openrouter("qwen/qwen3-8b:free"),
    "qwen3-14b:free": openrouter("qwen/qwen3-14b:free"),
  },
};

// Optional: enable official GPT-5 only when model id is provided
const gpt5ModelId = process.env.OPENAI_GPT5_MODEL_ID || "gpt-5";
staticModels.openai["gpt-5"] = openai(gpt5ModelId);
staticModels.openai["gpt-5-mini"] = openai(
  process.env.OPENAI_GPT5_MINI_MODEL_ID || "gpt-5-mini",
);
staticModels.openai["gpt-5-turbo"] = openai(
  process.env.OPENAI_GPT5_TURBO_MODEL_ID || "gpt-5-turbo",
);
staticModels.openai["gpt-5-pro"] = openai(
  process.env.OPENAI_GPT5_PRO_MODEL_ID || "gpt-5-pro",
);
staticModels.openai["gpt-5-ultra"] = openai(
  process.env.OPENAI_GPT5_ULTRA_MODEL_ID || "gpt-5-ultra",
);
staticModels.openai["gpt-5-nano"] = openai(
  process.env.OPENAI_GPT5_NANO_MODEL_ID || "gpt-5-nano",
);

const staticUnsupportedModels = new Set([
  // Keep only models we actually include above
  staticModels.google["gemini-2.0-flash-lite"],
  staticModels.ollama["gemma3:1b"],
  staticModels.ollama["gemma3:4b"],
  staticModels.ollama["gemma3:12b"],
  staticModels.openRouter["qwen3-8b:free"],
  staticModels.openRouter["qwen3-14b:free"],
]);

const openaiCompatibleProviders = openaiCompatibleModelsSafeParse(
  process.env.OPENAI_COMPATIBLE_DATA,
);

const {
  providers: openaiCompatibleModels,
  unsupportedModels: openaiCompatibleUnsupportedModels,
} = createOpenAICompatibleModels(openaiCompatibleProviders);

const allModels = { ...openaiCompatibleModels, ...staticModels };

const allUnsupportedModels = new Set([
  ...openaiCompatibleUnsupportedModels,
  ...staticUnsupportedModels,
]);

export const isToolCallUnsupportedModel = (model: LanguageModel) => {
  return allUnsupportedModels.has(model);
};

const firstProvider = Object.keys(allModels)[0];
const firstModel = Object.keys(allModels[firstProvider])[0];

const fallbackModel = allModels[firstProvider][firstModel];

export const customModelProvider = {
  modelsInfo: Object.entries(allModels).map(([provider, models]) => ({
    provider,
    models: Object.entries(models).map(([name, model]) => ({
      name,
      isToolCallUnsupported: isToolCallUnsupportedModel(model),
    })),
  })),
  getModel: (model?: ChatModel): LanguageModel => {
    if (!model) return fallbackModel;
    return allModels[model.provider]?.[model.model] || fallbackModel;
  },
};
