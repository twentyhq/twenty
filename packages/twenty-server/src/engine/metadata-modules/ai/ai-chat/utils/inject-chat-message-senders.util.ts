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
    if (message.role !== 'user' || !isDefined(senderId)) {
      return message;
    }
    return {
      ...message,
      parts: [
        {
          type: 'text',
          text: `<message_sender>${JSON.stringify({ userWorkspaceId: senderId, isCurrentSender: senderId === currentUserWorkspaceId })}</message_sender>`,
        },
        ...message.parts,
      ],
    };
  });
