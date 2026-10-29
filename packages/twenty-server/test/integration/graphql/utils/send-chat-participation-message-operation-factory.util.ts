import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';

export const sendChatParticipationMessageOperationFactory = ({
  threadId,
  messageId = randomUUID(),
  text = 'Can you help with this task?',
  modelId = TEST_AI_MODEL_ID,
  shouldAssistantReply = true,
  isAssistantParticipant,
  isAssistantMentioned = false,
  mentionedWorkspaceMemberIds = [],
  recipientWorkspaceMemberIds = [],
}: {
  threadId: string;
  messageId?: string;
  text?: string;
  modelId?: string;
  shouldAssistantReply?: boolean;
  isAssistantParticipant?: boolean;
  isAssistantMentioned?: boolean | null;
  mentionedWorkspaceMemberIds?: string[];
  recipientWorkspaceMemberIds?: string[];
}) => ({
  query: gql`
    mutation SendParticipationMessage(
      $threadId: UUID!
      $messageId: UUID!
      $text: String!
      $modelId: String
      $shouldAssistantReply: Boolean
      $isAssistantParticipant: Boolean
      $isAssistantMentioned: Boolean
      $mentionedWorkspaceMemberIds: [UUID!]
      $recipientWorkspaceMemberIds: [UUID!]
    ) {
      sendChatMessage(
        threadId: $threadId
        messageId: $messageId
        text: $text
        modelId: $modelId
        shouldAssistantReply: $shouldAssistantReply
        isAssistantParticipant: $isAssistantParticipant
        isAssistantMentioned: $isAssistantMentioned
        mentionedWorkspaceMemberIds: $mentionedWorkspaceMemberIds
        recipientWorkspaceMemberIds: $recipientWorkspaceMemberIds
      ) {
        messageId
        queued
        streamId
        mentionedParticipantWorkspaceMemberIds
        recipientParticipantWorkspaceMemberIds
      }
    }
  `,
  variables: {
    threadId,
    messageId,
    text,
    modelId,
    shouldAssistantReply,
    isAssistantParticipant,
    isAssistantMentioned,
    mentionedWorkspaceMemberIds,
    recipientWorkspaceMemberIds,
  },
});
