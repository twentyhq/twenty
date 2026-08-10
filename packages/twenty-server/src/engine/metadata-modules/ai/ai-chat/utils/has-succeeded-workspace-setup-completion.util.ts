import {
  type ExtendedUIMessage,
  isSucceededCompleteWorkspaceSetupToolPart,
} from 'twenty-shared/ai';

export const hasSucceededWorkspaceSetupCompletion = (
  messages: Pick<ExtendedUIMessage, 'parts'>[],
): boolean =>
  messages.some((message) =>
    message.parts.some(isSucceededCompleteWorkspaceSetupToolPart),
  );
