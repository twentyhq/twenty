import { isNonEmptyString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';

import { PAUSING_TOOL_NAMES } from '../constants/pausing-tool-names.const';
import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isNoReplyToolPart } from './is-no-reply-tool-part.util';

// A question asked in the same step still waits on the member, so it must stay visible
export const isSilentAgentChatMessageParts = (
  parts: ExtendedUIMessagePart[],
): boolean =>
  parts.some(isNoReplyToolPart) &&
  !parts.some(
    (part) =>
      (part.type === 'text' && isNonEmptyString(part.text)) ||
      (isToolUIPart(part) && PAUSING_TOOL_NAMES.has(getToolName(part))),
  );
