import { getToolName, isToolUIPart } from 'ai';

import { PAUSING_TOOL_NAMES } from '../constants/pausing-tool-names.const';
import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';

export const isPausingToolPart = (part: ExtendedUIMessagePart): boolean =>
  isToolUIPart(part) && PAUSING_TOOL_NAMES.has(getToolName(part));
