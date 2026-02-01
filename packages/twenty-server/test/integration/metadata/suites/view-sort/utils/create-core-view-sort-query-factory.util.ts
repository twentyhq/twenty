import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';

export const createCoreViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewSortInput>) => ({
  query: gql`
    mutation CreateCoreViewSort($input: CreateViewSortInput!) {
      createCoreViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
