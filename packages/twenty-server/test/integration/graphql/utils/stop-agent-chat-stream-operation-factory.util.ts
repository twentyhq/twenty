import gql from 'graphql-tag';

export const stopAgentChatStreamOperationFactory = ({
  threadId,
}: {
  threadId: string;
}) => ({
  query: gql`
    mutation StopSharedConversation($threadId: UUID!) {
      stopAgentChatStream(threadId: $threadId)
    }
  `,
  variables: { threadId },
});
