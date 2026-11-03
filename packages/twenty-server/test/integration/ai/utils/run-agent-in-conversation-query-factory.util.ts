import gql from 'graphql-tag';

export const runAgentInConversationQueryFactory = ({
  agentUniversalIdentifier,
  content,
  threadKey,
}: {
  agentUniversalIdentifier: string;
  content: string;
  threadKey: string;
}) => ({
  query: gql`
    mutation RunAgent($input: RunAgentInput!) {
      runAgent(input: $input) {
        threadId
        runId
        status
      }
    }
  `,
  variables: {
    input: {
      agentUniversalIdentifier,
      input: [{ role: 'user', content }],
      thread: { key: threadKey },
    },
  },
});
