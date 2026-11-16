import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

// data parts are stream notifications and are never stored with the message
export const hasAgentChatReplyContent = (
  parts: ExtendedUIMessagePart[],
): boolean =>
  parts.some((part) => {
    if (part.type === 'text' || part.type === 'reasoning') {
      return isNonEmptyString(part.text.trim());
    }

    return part.type !== 'step-start' && !part.type.startsWith('data-');
  });
