import { getToolName, isToolUIPart, type ToolUIPart } from 'ai';

import { COMPLETE_WORKSPACE_SETUP_TOOL_NAME } from '../constants/complete-workspace-setup-tool-name.const';
import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';

export const isSucceededCompleteWorkspaceSetupToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart => {
  if (
    !isToolUIPart(part) ||
    getToolName(part) !== COMPLETE_WORKSPACE_SETUP_TOOL_NAME
  ) {
    return false;
  }

  const output: unknown = part.output;

  return (
    typeof output === 'object' &&
    output !== null &&
    'success' in output &&
    output.success === true
  );
};
