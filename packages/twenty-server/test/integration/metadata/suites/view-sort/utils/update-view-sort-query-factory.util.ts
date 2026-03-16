import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';

export const updateViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateViewSortInput>) => ({
  query: gql`
    mutation UpdateViewSort($input: UpdateViewSortInput!) {
      updateViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
