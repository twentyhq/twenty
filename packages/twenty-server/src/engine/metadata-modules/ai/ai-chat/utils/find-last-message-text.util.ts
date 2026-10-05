import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const findLastMessageText = (
  parts: ExtendedUIMessagePart[],
): string | null =>
  parts
    .flatMap((part) =>
      part.type === 'text' && isNonEmptyString(part.text.trim())
        ? [part.text]
        : [],
    )
    .pop() ?? null;
