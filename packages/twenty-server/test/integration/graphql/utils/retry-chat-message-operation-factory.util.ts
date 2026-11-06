import gql from 'graphql-tag';

export const retryChatMessageOperationFactory = (threadId: string) => ({
  query: gql`
    mutation RetryChatMessage($threadId: UUID!) {
      retryChatMessage(threadId: $threadId) {
        streamId
      }
    }
  `,
  variables: { threadId },
});
