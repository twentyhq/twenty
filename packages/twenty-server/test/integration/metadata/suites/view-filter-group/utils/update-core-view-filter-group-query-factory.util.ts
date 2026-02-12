import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/update-view-filter-group.input';

export const updateCoreViewFilterGroupQueryFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  input,
  id,
}: PerformMetadataQueryParams<UpdateViewFilterGroupInput> & {
  id: string;
}) => ({
  query: gql`
    mutation UpdateCoreViewFilterGroup($id: String!, $input: UpdateViewFilterGroupInput!) {
      updateCoreViewFilterGroup(id: $id, input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id,
    input,
  },
});
