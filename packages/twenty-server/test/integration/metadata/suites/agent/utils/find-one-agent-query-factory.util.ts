import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindOneAgentFactoryInput = {
  id: string;
};

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

export const findOneAgentQueryFactory = ({
  input,
  gqlFields = DEFAULT_AGENT_GQL_FIELDS,
}: PerformMetadataQueryParams<FindOneAgentFactoryInput>) => ({
  query: gql`
    query FindOneAgent($input: AgentIdInput!) {
      findOneAgent(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: {
      id: input.id,
    },
  },
});
