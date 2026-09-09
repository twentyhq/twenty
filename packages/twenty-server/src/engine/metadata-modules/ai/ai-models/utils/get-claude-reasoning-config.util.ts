import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { type ClaudeReasoningConfig } from 'src/engine/metadata-modules/ai/ai-models/types/claude-reasoning-config.type';

const CLAUDE_VERSION_PATTERN =
  /claude-(?:opus|sonnet|haiku|fable|mythos)-(\d+)(?:-(\d+))?/;

const FIXED_BUDGET: ClaudeReasoningConfig = {
  type: 'enabled',
  budgetTokens: AGENT_CONFIG.REASONING_BUDGET_TOKENS,
};

// Claude 4.6 and later think adaptively and, from 4.7 on, reject a fixed
// budget with a 400; Haiku 4.5 and everything older still require one. An id
// that names no version keeps the budget it has always been sent.
export const getClaudeReasoningConfig = (
  modelId: string,
): ClaudeReasoningConfig => {
  const match = CLAUDE_VERSION_PATTERN.exec(modelId);

  if (match === null) {
    return FIXED_BUDGET;
  }

  const major = Number(match[1]);
  const minor = Number(match[2] ?? 0);

  const thinksAdaptively = major > 4 || (major === 4 && minor >= 6);

  return thinksAdaptively ? { type: 'adaptive' } : FIXED_BUDGET;
};
