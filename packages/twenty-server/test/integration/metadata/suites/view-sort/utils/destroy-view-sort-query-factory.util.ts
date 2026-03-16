import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';

export const destroyViewSortQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DestroyViewSortInput>) => ({
  query: gql`
    mutation DestroyViewSort($input: DestroyViewSortInput!) {
      destroyViewSort(input: $input)
    }
  `,
  variables: {
    input,
  },
});
