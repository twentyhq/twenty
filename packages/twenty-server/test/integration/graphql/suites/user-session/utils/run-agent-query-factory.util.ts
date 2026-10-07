import gql from 'graphql-tag';
import { type RunAgentThread } from 'twenty-shared/application';

export const runAgentQueryFactory = ({
  agentUniversalIdentifier,
  prompt,
  thread,
  runAsWorkspaceMemberId,
}: {
  agentUniversalIdentifier: string;
  prompt: string;
  thread?: RunAgentThread;
  runAsWorkspaceMemberId?: string;
}) => ({
  query: gql`
    mutation RunAgent($input: RunAgentInput!) {
      runAgent(input: $input) {
        result
        error
        success
        threadId
      }
    }
  `,
  variables: {
    input: { agentUniversalIdentifier, prompt, thread, runAsWorkspaceMemberId },
  },
});
