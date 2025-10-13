import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/destroy-view-group.input';

export const destroyCoreViewGroupQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewGroupInput>) => ({
  query: gql`
    mutation DestroyCoreViewGroup($input: DestroyViewGroupInput!) {
      destroyCoreViewGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
