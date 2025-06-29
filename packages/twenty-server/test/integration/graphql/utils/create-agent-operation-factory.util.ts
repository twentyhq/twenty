import gql from 'graphql-tag';
import { AGENT_GQL_FIELDS } from 'test/integration/constants/agent-gql-fields.constants';

export const createAgentOperation = ({
  name,
  description,
  prompt,
  modelId,
  responseFormat,
}: {
  name: string;
  description?: string;
  prompt: string;
  modelId: string;
  responseFormat?: object;
}) => ({
  query: gql`
    mutation CreateOneAgent($input: CreateAgentInput!) {
      createOneAgent(input: $input) {
        ${AGENT_GQL_FIELDS}
      }
    }
  `,
  variables: {
    input: {
      name,
      description,
      prompt,
      modelId,
      responseFormat,
    },
  },
});
