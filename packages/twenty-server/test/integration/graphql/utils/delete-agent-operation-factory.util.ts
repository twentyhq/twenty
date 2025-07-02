import gql from 'graphql-tag';
import { AGENT_GQL_FIELDS } from 'test/integration/constants/agent-gql-fields.constants';

export const deleteAgentOperation = (id: string) => ({
  query: gql`
    mutation DeleteOneAgent($input: AgentIdInput!) {
      deleteOneAgent(input: $input) {
        ${AGENT_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: { id },
  },
});
