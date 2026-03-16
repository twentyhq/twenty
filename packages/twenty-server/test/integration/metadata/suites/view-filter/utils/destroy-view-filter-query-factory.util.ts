import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/destroy-view-filter.input';

export const destroyViewFilterQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewFilterInput>) => ({
  query: gql`
    mutation DestroyViewFilter($input: DestroyViewFilterInput!) {
      destroyViewFilter(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
