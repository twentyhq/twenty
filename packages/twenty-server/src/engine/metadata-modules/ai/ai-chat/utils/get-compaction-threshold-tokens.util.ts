import { AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS } from 'src/engine/metadata-modules/ai/ai-chat/constants/ai-chat-working-context-budget-tokens.const';

const COMPACTION_TRIGGER_WINDOW_RATIO = 0.85;

export const getCompactionThresholdTokens = (
  contextWindowTokens: number,
): number =>
  Math.min(
    COMPACTION_TRIGGER_WINDOW_RATIO * contextWindowTokens,
    AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS,
  );
