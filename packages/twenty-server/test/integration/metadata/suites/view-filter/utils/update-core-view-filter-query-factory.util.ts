import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/update-view-filter.input';

export const updateCoreViewFilterQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateViewFilterInput>) => ({
  query: gql`
    mutation UpdateCoreViewFilter($input: UpdateViewFilterInput!) {
      updateCoreViewFilter(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
