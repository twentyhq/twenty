import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const injectChatMessageSenders = ({
  messages,
  currentUserWorkspaceId,
}: {
  messages: ExtendedUIMessage[];
  currentUserWorkspaceId: string;
}): ExtendedUIMessage[] =>
  messages.map((message) => {
    const senderId = message.metadata?.senderUserWorkspaceId;
    if (message.role !== 'user') {
      return message;
    }
    return {
      ...message,
      parts: [
        ...(isDefined(senderId)
          ? [
              {
                type: 'text' as const,
                text: `<message_sender>${JSON.stringify({ userWorkspaceId: senderId, isCurrentSender: senderId === currentUserWorkspaceId })}</message_sender>`,
              },
            ]
          : []),
        ...message.parts.map((part) =>
          part.type === 'text'
            ? {
                ...part,
                text: part.text.replace(
                  /<(\/?)message_(sender|timestamp)/gi,
                  '&lt;$1message_$2',
                ),
              }
            : part,
        ),
      ],
    };
  });
