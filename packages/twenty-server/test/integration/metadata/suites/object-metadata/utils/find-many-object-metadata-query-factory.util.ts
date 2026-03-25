import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindManyObjectMetadataFactoryInput = {
  filter: object;
  paging: object;
};

export const findManyObjectMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<FindManyObjectMetadataFactoryInput>) => ({
  query: gql`
      query ObjectsMetadata($filter: ObjectFilter!, $paging: CursorPaging!) {
        objects(filter: $filter, paging: $paging) {
          edges {
            node {
              ${gqlFields}
            }
          }
        }
      }
    `,
  variables: {
    filter: input.filter,
    paging: input.paging,
  },
});
