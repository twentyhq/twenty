import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';

export const updateCoreViewSortQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  viewSortId,
  input,
}: PerformMetadataQueryParams<UpdateViewSortInput> & { viewSortId: string }) => ({
  query: gql`
    mutation UpdateCoreViewSort($id: String!, $input: UpdateViewSortInput!) {
      updateCoreViewSort(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewSortId,
    input,
  },
});
