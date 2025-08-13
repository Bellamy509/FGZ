import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { customProvider } from "ai";
import { isTestEnvironment } from "../constants";
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from "./models.test";

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        "chat-model-small": chatModel,
        "chat-model-large": chatModel,
        "chat-model-reasoning": reasoningModel,
        "title-model": titleModel,
        "artifact-model": artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // GPT-5 Series
        "gpt-5": openai(process.env.OPENAI_GPT5_MODEL_ID || "gpt-5"),
        "gpt-5-mini": openai(
          process.env.OPENAI_GPT5_MINI_MODEL_ID || "gpt-5-mini",
        ),
        "gpt-5-turbo": openai(
          process.env.OPENAI_GPT5_TURBO_MODEL_ID || "gpt-5-turbo",
        ),
        "gpt-5-pro": openai(
          process.env.OPENAI_GPT5_PRO_MODEL_ID || "gpt-5-pro",
        ),
        "gpt-5-ultra": openai(
          process.env.OPENAI_GPT5_ULTRA_MODEL_ID || "gpt-5-ultra",
        ),
        "gpt-5-nano": openai(
          process.env.OPENAI_GPT5_NANO_MODEL_ID || "gpt-5-nano",
        ),

        // GPT-4o and GPT-4 Series (Available models)
        "gpt-4o": openai("gpt-4o"),
        "gpt-4o-mini": openai("gpt-4o-mini"),
        "gpt-4-turbo": openai("gpt-4-turbo"),
        "gpt-4": openai("gpt-4"),

        // Google Models
        "gemini-2.5-flash": google("gemini-2.5-flash"),

        // Claude Series
        "claude-opus-4-0": anthropic("claude-opus-4-20250514"),
        "claude-sonnet-4-0": anthropic("claude-sonnet-4-20250514"),
        // 'chat-model-reasoning': wrapLanguageModel({
        //   model: fireworks('accounts/fireworks/models/deepseek-r1'),
        //   middleware: extractReasoningMiddleware({ tagName: 'think' }),
        // }),
        "title-model": openai("gpt-4-turbo"),
        "artifact-model": openai("gpt-4o-mini"),
      },
      imageModels: {
        "small-model": openai.image("dall-e-2"),
        "large-model": openai.image("dall-e-3"),
      },
    });
