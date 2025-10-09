import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';

export const createCoreViewFilterQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewFilterInput>) => ({
  query: gql`
    mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
      createCoreViewFilter(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
