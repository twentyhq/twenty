import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';

export type CreateOneAgentFactoryInput = CreateAgentInput;

const DEFAULT_AGENT_GQL_FIELDS = `
  id
  name
  label
  icon
  description
  prompt
  modelId
  responseFormat
  roleId
  isCustom
  applicationId
  modelConfiguration
  evaluationInputs
  createdAt
  updatedAt
`;

export const createOneAgentQueryFactory = ({
  input,
  gqlFields = DEFAULT_AGENT_GQL_FIELDS,
}: PerformMetadataQueryParams<CreateOneAgentFactoryInput>) => ({
  query: gql`
    mutation CreateOneAgent($input: CreateAgentInput!) {
      createOneAgent(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
