export type TextBlock =
  | { type: 'reasoning'; content: string; isThinking: boolean }
  | { type: 'text'; content: string }
  | null;
