import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/destroy-view-sort.input';

export const destroyCoreViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewSortInput>) => ({
  query: gql`
    mutation DestroyCoreViewSort($input: DestroyViewSortInput!) {
      destroyCoreViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
