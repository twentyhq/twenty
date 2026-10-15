import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isNoReplyToolPart } from './is-no-reply-tool-part.util';

const isSucceededNoReplyToolPart = (part: ExtendedUIMessagePart): boolean =>
  isNoReplyToolPart(part) &&
  part.state === 'output-available' &&
  isObject(part.output) &&
  'success' in part.output &&
  part.output.success === true;

const isHiddenInSilentTurn = (part: ExtendedUIMessagePart): boolean =>
  isNoReplyToolPart(part) ||
  part.type === 'step-start' ||
  part.type === 'reasoning' ||
  (part.type === 'text' && !isNonEmptyString(part.text));

export const isSilentAgentChatMessageParts = (
  parts: ExtendedUIMessagePart[],
): boolean =>
  parts.some(isSucceededNoReplyToolPart) && parts.every(isHiddenInSilentTurn);
