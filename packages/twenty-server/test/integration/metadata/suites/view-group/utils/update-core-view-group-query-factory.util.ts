import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/update-view-group.input';

export const updateCoreViewGroupQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateViewGroupInput>) => ({
  query: gql`
    mutation UpdateCoreViewGroup($input: UpdateViewGroupInput!) {
      updateCoreViewGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
