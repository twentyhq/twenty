import gql from 'graphql-tag';
import { VIEW_FIELD_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/delete-view-field-group.input';

export const deleteCoreViewFieldGroupQueryFactory = ({
  gqlFields = VIEW_FIELD_GROUP_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DeleteViewFieldGroupInput>) => ({
  query: gql`
    mutation DeleteCoreViewFieldGroup($input: DeleteViewFieldGroupInput!) {
      deleteCoreViewFieldGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
