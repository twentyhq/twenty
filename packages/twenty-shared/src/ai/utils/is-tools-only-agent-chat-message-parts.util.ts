import { isNonEmptyString } from '@sniptt/guards';
import { isToolUIPart } from 'ai';

import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isNoReplyToolPart } from './is-no-reply-tool-part.util';
import { isPausingToolPart } from './is-pausing-tool-part.util';

const isFinishedToolPart = (part: ExtendedUIMessagePart): boolean =>
  isToolUIPart(part) &&
  !isNoReplyToolPart(part) &&
  (part.state === 'output-available' || part.state === 'output-error');

const isWithoutVisibleReply = (part: ExtendedUIMessagePart): boolean =>
  (isToolUIPart(part) && !isPausingToolPart(part)) ||
  part.type === 'step-start' ||
  part.type === 'reasoning' ||
  part.type === 'data-thread-title' ||
  (part.type === 'text' && !isNonEmptyString(part.text.trim()));

export const isToolsOnlyAgentChatMessageParts = (
  parts: ExtendedUIMessagePart[],
): boolean =>
  parts.some(isFinishedToolPart) && parts.every(isWithoutVisibleReply);
