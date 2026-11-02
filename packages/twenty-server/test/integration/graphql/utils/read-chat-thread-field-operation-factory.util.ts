import gql from 'graphql-tag';

const CHAT_THREAD_FIELD_QUERIES = {
  chatThread: gql`
    query ReadChatThreadById($threadId: UUID!) {
      chatThread(id: $threadId) {
        id
      }
    }
  `,
  chatMessages: gql`
    query ReadChatThreadMessages($threadId: UUID!) {
      chatMessages(threadId: $threadId) {
        id
      }
    }
  `,
  chatStreamCatchupChunks: gql`
    query ReadChatThreadStreamCatchup($threadId: UUID!) {
      chatStreamCatchupChunks(threadId: $threadId) {
        maxSeq
      }
    }
  `,
};

export const readChatThreadFieldOperationFactory = ({
  threadId,
  field,
}: {
  threadId: string;
  field: keyof typeof CHAT_THREAD_FIELD_QUERIES;
}) => ({
  query: CHAT_THREAD_FIELD_QUERIES[field],
  variables: { threadId },
});
