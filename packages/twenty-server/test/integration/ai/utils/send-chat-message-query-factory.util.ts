import gql from 'graphql-tag';

export const sendChatMessageQueryFactory = ({
  threadId,
  messageId,
  recipientWorkspaceMemberIds,
}: {
  threadId: string;
  messageId: string;
  recipientWorkspaceMemberIds: string[];
}) => ({
  query: gql`
    mutation SendAssistantPersonalizationMessage(
      $threadId: UUID!
      $messageId: UUID!
      $recipientWorkspaceMemberIds: [UUID!]
    ) {
      sendChatMessage(
        threadId: $threadId
        messageId: $messageId
        text: "Please reply."
        isAssistantMentioned: true
        recipientWorkspaceMemberIds: $recipientWorkspaceMemberIds
      ) {
        queued
      }
    }
  `,
  variables: { threadId, messageId, recipientWorkspaceMemberIds },
});
