import { isNonEmptyString } from '@sniptt/guards';

import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isNoReplyToolPart } from './is-no-reply-tool-part.util';
import { isPausingToolPart } from './is-pausing-tool-part.util';

// A question asked in the same step still waits on the member, so it must stay visible
export const isSilentAgentChatMessageParts = (
  parts: ExtendedUIMessagePart[],
): boolean =>
  parts.some(isNoReplyToolPart) &&
  !parts.some(
    (part) =>
      (part.type === 'text' && isNonEmptyString(part.text)) ||
      isPausingToolPart(part),
  );
