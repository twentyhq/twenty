import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';

export const destroyCoreViewSortQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DestroyViewSortInput>) => ({
  query: gql`
    mutation DestroyCoreViewSort($input: DestroyViewSortInput!) {
      destroyCoreViewSort(input: $input)
    }
  `,
  variables: {
    input,
  },
});
