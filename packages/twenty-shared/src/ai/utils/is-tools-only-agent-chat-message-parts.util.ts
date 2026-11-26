import { isNonEmptyString, isObject } from '@sniptt/guards';
import { isToolUIPart } from 'ai';

import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isPausingToolPart } from './is-pausing-tool-part.util';

const isSucceededToolPart = (part: ExtendedUIMessagePart): boolean =>
  isToolUIPart(part) &&
  part.state === 'output-available' &&
  !(
    isObject(part.output) &&
    'success' in part.output &&
    part.output.success === false
  );

const isQuietPart = (part: ExtendedUIMessagePart): boolean =>
  (isSucceededToolPart(part) && !isPausingToolPart(part)) ||
  part.type === 'step-start' ||
  part.type === 'reasoning' ||
  part.type === 'data-thread-title' ||
  (part.type === 'text' && !isNonEmptyString(part.text));

export const isToolsOnlyAgentChatMessageParts = (
  parts: ExtendedUIMessagePart[],
): boolean => parts.some(isSucceededToolPart) && parts.every(isQuietPart);
