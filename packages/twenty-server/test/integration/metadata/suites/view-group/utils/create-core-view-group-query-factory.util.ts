import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

export const createCoreViewGroupQueryFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewGroupInput>) => ({
  query: gql`
    mutation CreateCoreViewGroup($input: CreateViewGroupInput!) {
      createCoreViewGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
