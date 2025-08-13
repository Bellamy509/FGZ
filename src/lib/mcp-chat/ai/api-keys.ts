// Server-side only functions for checking API keys
export function hasValidAPIKeys(): boolean {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  return !!(openaiKey?.trim() || anthropicKey?.trim() || googleKey?.trim());
}

export function getMissingAPIKeys(): string[] {
  const missing: string[] = [];

  if (
    !process.env.OPENAI_API_KEY?.trim() &&
    !process.env.ANTHROPIC_API_KEY?.trim() &&
    !process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  ) {
    return [
      "OPENAI_API_KEY or ANTHROPIC_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY",
    ];
  }

  return missing;
}
