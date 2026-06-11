// The conversation's data vocabulary and authored timing grammar.
export type ConversationMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant' };

export type TerminalView = 'ai-chat' | 'editor';

const CHAT_TIMINGS = {
  userToAssistantMs: 320,
  thinkingMs: 700,
  textStreamCharMs: 14,
  textToFileDelayMs: 380,
  fileWorkingDelayMs: 900,
  bubbleEnterMs: 280,
  fileCardEnterMs: 320,
};

const INITIAL_PROMPT_TEXT =
  'Scaffold a launch-ops CRM in my workspace with rockets, launches, payloads, customers, and launch sites, with relevant actions for each.';

export const CONVERSATION_CORE = {
  timings: CHAT_TIMINGS,
  initialPromptText: INITIAL_PROMPT_TEXT,
};
