import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

const INBOX_PREVIEW_MAX_LENGTH = 200;

export const findFirstTextPart = (
  parts: ExtendedUIMessage['parts'],
): string | undefined => {
  const textPart = parts.find(
    (part) => part.type === 'text' && isNonEmptyString(part.text),
  );

  if (textPart?.type !== 'text') {
    return undefined;
  }

  return textPart.text.slice(0, INBOX_PREVIEW_MAX_LENGTH);
};
