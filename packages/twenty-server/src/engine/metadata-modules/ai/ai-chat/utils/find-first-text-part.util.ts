import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

const INBOX_PREVIEW_MAX_LENGTH = 200;

export const findFirstTextPart = (
  parts: ExtendedUIMessage['parts'],
): string | undefined => {
  const textPart = parts.find(
    // Trimmed, because a whitespace only part would render as a blank preview
    (part) => part.type === 'text' && isNonEmptyString(part.text.trim()),
  );

  if (textPart?.type !== 'text') {
    return undefined;
  }

  return textPart.text.trim().slice(0, INBOX_PREVIEW_MAX_LENGTH);
};
