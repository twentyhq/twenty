import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

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

export const findAgentsQueryFactory = ({
  gqlFields = DEFAULT_AGENT_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query findManyAgents {
      findManyAgents {
        ${gqlFields}
      }
    }
  `,
});
