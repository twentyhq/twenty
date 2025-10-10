import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/delete-view-filter.input';

export const deleteCoreViewFilterQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DeleteViewFilterInput>) => ({
  query: gql`
    mutation DeleteCoreViewFilter($input: DeleteViewFilterInput!) {
      deleteCoreViewFilter(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
