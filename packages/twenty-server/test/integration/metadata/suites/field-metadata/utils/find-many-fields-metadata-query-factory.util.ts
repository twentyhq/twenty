import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindManyFieldsMetadataFactoryInput = {
  filter: object;
  paging: object;
};

export const findManyFieldsMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<FindManyFieldsMetadataFactoryInput>) => ({
  query: gql`
      query FieldsMetadata($filter: FieldFilter!, $paging: CursorPaging!) {
        fields(filter: $filter, paging: $paging) {
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
