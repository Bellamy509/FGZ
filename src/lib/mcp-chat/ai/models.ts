export const DEFAULT_CHAT_MODEL: string = "claude-sonnet-4-0";

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  // GPT-5 Series (first)
  { id: "gpt-5", name: "GPT-5", description: "Official GPT-5" },
  { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Lightweight GPT-5" },
  { id: "gpt-5-turbo", name: "GPT-5 Turbo", description: "Fast GPT-5 variant" },
  { id: "gpt-5-pro", name: "GPT-5 Pro", description: "Advanced GPT-5" },
  {
    id: "gpt-5-ultra",
    name: "GPT-5 Ultra",
    description: "Premium GPT-5 for most complex tasks",
  },
  { id: "gpt-5-nano", name: "GPT-5 Nano", description: "Smallest GPT-5" },

  // GPT-4o Series
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description:
      "Most advanced GPT-4 model with vision and enhanced capabilities",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Small model for fast, lightweight tasks",
  },

  // GPT-4 Series
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "Fast and powerful GPT-4 model",
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    description: "Flagship GPT-4 model for complex tasks",
  },

  // o1 Reasoning Series
  {
    id: "o1",
    name: "o1",
    description: "Advanced reasoning model for complex problem solving",
  },
  {
    id: "o1-mini",
    name: "o1 Mini",
    description: "Lightweight reasoning model",
  },

  // Google Models
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "High performance, low cost model",
  },

  // Anthropic Models
  {
    id: "claude-opus-4-0",
    name: "Claude Opus 4",
    description: "Highest level of intelligence and capability",
  },
  {
    id: "claude-sonnet-4-0",
    name: "Claude Sonnet 4",
    description: "High intelligence and balanced performance",
  },
];
