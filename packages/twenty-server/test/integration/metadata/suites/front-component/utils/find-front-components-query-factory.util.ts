import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_FRONT_COMPONENT_GQL_FIELDS = `
  id
  name
  applicationId
  createdAt
  updatedAt
`;

export const findFrontComponentsQueryFactory = ({
  gqlFields = DEFAULT_FRONT_COMPONENT_GQL_FIELDS,
}: PerformMetadataQueryParams<void>) => ({
  query: gql`
    query FrontComponents {
      frontComponents {
        ${gqlFields}
      }
    }
  `,
});
