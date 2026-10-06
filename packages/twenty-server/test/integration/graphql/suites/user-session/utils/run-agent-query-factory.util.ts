import gql from 'graphql-tag';

export const runAgentQueryFactory = ({
  agentUniversalIdentifier,
  prompt,
}: {
  agentUniversalIdentifier: string;
  prompt: string;
}) => ({
  query: gql`
    mutation RunAgent($input: RunAgentInput!) {
      runAgent(input: $input) {
        result
        error
        success
      }
    }
  `,
  variables: { input: { agentUniversalIdentifier, prompt } },
});
