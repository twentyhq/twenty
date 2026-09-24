import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export const currentUserQueryFactory = ({
  gqlFields = 'id',
}: Pick<PerformMetadataQueryParams<never>, 'gqlFields'>) => ({
  query: gql`
    query CurrentUser {
      currentUser {
        ${gqlFields}
      }
    }
  `,
  variables: {},
});
