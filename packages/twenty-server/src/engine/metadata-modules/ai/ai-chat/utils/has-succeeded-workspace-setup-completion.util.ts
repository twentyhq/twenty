import {
  type ExtendedUIMessage,
  isSucceededCompleteWorkspaceSetupToolPart,
} from 'twenty-shared/ai';

export const hasSucceededWorkspaceSetupCompletion = (
  messages: ExtendedUIMessage[],
): boolean =>
  messages.some((message) =>
    message.parts.some(isSucceededCompleteWorkspaceSetupToolPart),
  );
