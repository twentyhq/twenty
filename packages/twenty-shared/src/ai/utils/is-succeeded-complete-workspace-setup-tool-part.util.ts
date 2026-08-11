import { type ToolUIPart } from 'ai';

import { type ExtendedUIMessagePart } from '../types/ExtendedUIMessagePart';
import { isCompleteWorkspaceSetupToolPart } from './is-complete-workspace-setup-tool-part.util';

export const isSucceededCompleteWorkspaceSetupToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart => {
  if (!isCompleteWorkspaceSetupToolPart(part)) {
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
