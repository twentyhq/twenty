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

export const injectMessageAuthors = (
  messages: ExtendedUIMessage[],
  {
    isShared,
    displayNameByUserWorkspaceId,
  }: {
    isShared: boolean;
    displayNameByUserWorkspaceId: Map<string, string>;
  },
): ExtendedUIMessage[] => {
  if (!isShared) {
    return messages;
  }

  return messages.map((message) => {
    if (message.role !== 'user') {
      return message;
    }

    const authorUserWorkspaceId = message.metadata?.authorUserWorkspaceId;

    if (!isDefined(authorUserWorkspaceId)) {
      return message;
    }

    const displayName = displayNameByUserWorkspaceId.get(authorUserWorkspaceId);

    if (!isDefined(displayName)) {
      return message;
    }

    const authorPart = {
      type: 'text' as const,
      text: `<message_author>From: ${displayName}</message_author>`,
    };

    return {
      ...message,
      parts: [authorPart, ...message.parts],
    };
  });
};
