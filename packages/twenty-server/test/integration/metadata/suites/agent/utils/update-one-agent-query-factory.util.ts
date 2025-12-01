import gql from 'graphql-tag';

import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';

export type UpdateOneAgentFactoryInput = UpdateAgentInput;

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

export const updateOneAgentQueryFactory = ({
  gqlFields = DEFAULT_AGENT_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateOneAgentFactoryInput>) => ({
  query: gql`
    mutation UpdateOneAgent($updateAgentInput: UpdateAgentInput!) {
      updateOneAgent(updateAgentInput: $updateAgentInput) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    updateAgentInput: input,
  },
});

