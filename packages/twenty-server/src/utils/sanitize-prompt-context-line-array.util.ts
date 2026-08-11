import { isNonEmptyString } from '@sniptt/guards';

import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

export const sanitizePromptContextLineArray = ({
  value,
  maxLength,
  maxItems,
}: {
  value: unknown;
  maxLength: number;
  maxItems: number;
}): string[] =>
  Array.isArray(value)
    ? value
        .map((item) => sanitizePromptContextLine(item, maxLength))
        .filter(isNonEmptyString)
        .slice(0, maxItems)
    : [];
