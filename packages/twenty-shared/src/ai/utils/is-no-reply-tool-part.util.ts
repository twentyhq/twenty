import { getToolName, isToolUIPart, type ToolUIPart } from 'ai';

import { NO_REPLY_TOOL_NAME } from '../constants/no-reply-tool-name.const';
import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';

export const isNoReplyToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart =>
  isToolUIPart(part) && getToolName(part) === NO_REPLY_TOOL_NAME;
