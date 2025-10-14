import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/delete-view-group.input';

export const deleteCoreViewGroupQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DeleteViewGroupInput>) => ({
  query: gql`
    mutation DeleteCoreViewGroup($input: DeleteViewGroupInput!) {
      deleteCoreViewGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
