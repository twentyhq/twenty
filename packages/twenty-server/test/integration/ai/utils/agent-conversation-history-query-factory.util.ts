import gql from 'graphql-tag';

type AgentConversationVariables = {
  threadId?: string;
  agentUniversalIdentifier?: string;
  threadKey?: string;
};

export const agentConversationHistoryQueryFactory = (
  variables: AgentConversationVariables,
) => ({
  query: gql`
    query ConversationHistory(
      $threadId: UUID
      $agentUniversalIdentifier: UUID
      $threadKey: String
    ) {
      chatMessages(
        threadId: $threadId
        agentUniversalIdentifier: $agentUniversalIdentifier
        threadKey: $threadKey
      ) {
        threadId
        turnId
        role
        parts {
          type
          textContent
        }
      }
      chatStreamCatchupChunks(
        threadId: $threadId
        agentUniversalIdentifier: $agentUniversalIdentifier
        threadKey: $threadKey
      ) {
        chunks
        maxSeq
      }
    }
  `,
  variables,
});
