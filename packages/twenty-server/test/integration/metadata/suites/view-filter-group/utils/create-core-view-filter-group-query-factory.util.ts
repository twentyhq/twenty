import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';

export const createCoreViewFilterGroupQueryFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewFilterGroupInput>) => ({
  query: gql`
    mutation CreateCoreViewFilterGroup($input: CreateViewFilterGroupInput!) {
      createCoreViewFilterGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
