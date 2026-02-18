import gql from 'graphql-tag';
import { VIEW_FIELD_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/update-view-field-group.input';

export const updateCoreViewFieldGroupQueryFactory = ({
  gqlFields = VIEW_FIELD_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateViewFieldGroupInput>) => ({
  query: gql`
    mutation UpdateCoreViewFieldGroup($input: UpdateViewFieldGroupInput!) {
      updateCoreViewFieldGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
