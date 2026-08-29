import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

const DEFAULT_FRONT_COMPONENTS_GQL_FIELDS = `
  id
  name
  universalIdentifier
  applicationId
`;

export const findFrontComponentsQueryFactory = ({
  gqlFields = DEFAULT_FRONT_COMPONENTS_GQL_FIELDS,
}: Partial<PerformMetadataQueryParams<undefined>>) => ({
  query: gql`
    query FrontComponents {
      frontComponents {
        ${gqlFields}
      }
    }
  `,
});
