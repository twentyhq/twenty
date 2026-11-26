import { isNonEmptyString, isObject } from '@sniptt/guards';
import { isToolUIPart } from 'ai';

import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isNoReplyToolPart } from './is-no-reply-tool-part.util';
import { isPausingToolPart } from './is-pausing-tool-part.util';

const isSucceededToolPart = (part: ExtendedUIMessagePart): boolean =>
  isToolUIPart(part) &&
  part.state === 'output-available' &&
  !(
    isObject(part.output) &&
    'success' in part.output &&
    part.output.success === false
  );

const isWithoutVisibleReply = (part: ExtendedUIMessagePart): boolean =>
  (isSucceededToolPart(part) && !isPausingToolPart(part)) ||
  part.type === 'step-start' ||
  part.type === 'reasoning' ||
  part.type === 'data-thread-title' ||
  (part.type === 'text' && !isNonEmptyString(part.text.trim()));

export const isToolsOnlyAgentChatMessageParts = (
  parts: ExtendedUIMessagePart[],
): boolean =>
  parts.some((part) => isSucceededToolPart(part) && !isNoReplyToolPart(part)) &&
  parts.every(isWithoutVisibleReply);
