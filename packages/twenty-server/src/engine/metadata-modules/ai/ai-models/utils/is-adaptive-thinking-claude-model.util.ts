import { isDefined } from 'twenty-shared/utils';

const CLAUDE_VERSION_PATTERN =
  /claude-(?:opus|sonnet|haiku|fable|mythos)-(\d+)(?:-(\d+))?/;

// Adaptive thinking is accepted from Claude 4.6 on.
export const isAdaptiveThinkingClaudeModel = (modelId: string): boolean => {
  const match = CLAUDE_VERSION_PATTERN.exec(modelId);

  if (!isDefined(match)) {
    return false;
  }

  const major = Number(match[1]);
  const minor = Number(match[2] ?? 0);

  return major > 4 || (major === 4 && minor >= 6);
};
