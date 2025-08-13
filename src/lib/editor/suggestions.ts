import type { EditorView } from "prosemirror-view";

// Type stub pour UISuggestion
export interface UISuggestion {
  id: string;
  selectionStart: number;
  selectionEnd: number;
  content: string;
  title?: string;
  description?: string;
}

// Fonction stub pour createSuggestionWidget
export function createSuggestionWidget(
  suggestion: UISuggestion,
  _view: EditorView,
): { dom: HTMLElement } {
  const dom = document.createElement("span");
  dom.className = "suggestion-widget";
  dom.textContent = `[Suggestion: ${suggestion.title || "Untitled"}]`;
  dom.style.backgroundColor = "#f0f0f0";
  dom.style.padding = "2px 4px";
  dom.style.borderRadius = "3px";
  dom.style.fontSize = "12px";
  dom.style.color = "#666";
  dom.style.marginLeft = "4px";

  return { dom };
}

// Exports additionnels si nécessaires pour text-editor.tsx
export const projectWithPositions = (suggestions: UISuggestion[]) =>
  suggestions;

export const suggestionsPlugin = null;
export const suggestionsPluginKey = null;
