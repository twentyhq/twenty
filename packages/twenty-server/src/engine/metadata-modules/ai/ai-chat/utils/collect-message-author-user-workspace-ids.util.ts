import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const collectMessageAuthorUserWorkspaceIds = (
  messages: ExtendedUIMessage[],
): string[] => [
  ...new Set(
    messages.flatMap((message) => {
      const authorUserWorkspaceId = message.metadata?.authorUserWorkspaceId;

      return message.role === 'user' && isDefined(authorUserWorkspaceId)
        ? [authorUserWorkspaceId]
        : [];
    }),
  ),
];
