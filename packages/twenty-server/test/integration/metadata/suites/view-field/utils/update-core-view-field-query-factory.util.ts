import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';

export const updateCoreViewFieldQueryFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<UpdateViewFieldInput>) => ({
  query: gql`
    mutation UpdateCoreViewField($input: UpdateViewFieldInput!) {
      updateCoreViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
