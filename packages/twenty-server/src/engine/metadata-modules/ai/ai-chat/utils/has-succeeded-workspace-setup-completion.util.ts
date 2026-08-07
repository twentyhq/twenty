import { getToolName, isToolUIPart } from 'ai';
import {
  COMPLETE_WORKSPACE_SETUP_TOOL_NAME,
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

const isSucceededCompleteWorkspaceSetupPart = (
  part: ExtendedUIMessagePart,
): boolean => {
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

export const hasSucceededWorkspaceSetupCompletion = (
  messages: ExtendedUIMessage[],
): boolean =>
  messages.some((message) =>
    message.parts.some(isSucceededCompleteWorkspaceSetupPart),
  );
