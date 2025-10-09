import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';

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
