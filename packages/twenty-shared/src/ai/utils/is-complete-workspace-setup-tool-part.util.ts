import { getToolName, isToolUIPart, type ToolUIPart } from 'ai';

import { COMPLETE_WORKSPACE_SETUP_TOOL_NAME } from '../constants/complete-workspace-setup-tool-name.const';
import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';

export const isCompleteWorkspaceSetupToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart =>
  isToolUIPart(part) &&
  getToolName(part) === COMPLETE_WORKSPACE_SETUP_TOOL_NAME;
