import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';

export const deleteCoreViewSortQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteViewSortInput>) => ({
  query: gql`
    mutation DeleteCoreViewSort($input: DeleteViewSortInput!) {
      deleteCoreViewSort(input: $input)
    }
  `,
  variables: {
    input,
  },
});
