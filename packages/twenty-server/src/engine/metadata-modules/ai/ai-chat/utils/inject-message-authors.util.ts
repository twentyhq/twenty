import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadParticipantDisplayName } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant.service';

export const injectMessageAuthors = (
  messages: ExtendedUIMessage[],
  threadParticipants: AgentChatThreadParticipantDisplayName[],
): ExtendedUIMessage[] => {
  if (threadParticipants.length < 2) {
    return messages;
  }

  const displayNameByUserWorkspaceId = new Map(
    threadParticipants.map((participant) => [
      participant.userWorkspaceId,
      participant.displayName,
    ]),
  );

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
