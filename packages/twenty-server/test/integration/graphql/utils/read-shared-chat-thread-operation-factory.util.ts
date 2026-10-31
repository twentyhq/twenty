import gql from 'graphql-tag';

export const readSharedChatThreadOperationFactory = ({
  threadId,
}: {
  threadId: string;
}) => ({
  query: gql`
    query SharedConversation($threadId: UUID!) {
      chatThread(id: $threadId) {
        id
      }
      chatMessages(threadId: $threadId) {
        id
        senderWorkspaceMemberId
        senderUserWorkspaceId
      }
      chatStreamCatchupChunks(threadId: $threadId) {
        chunks
        maxSeq
      }
    }
  `,
  variables: { threadId },
});
