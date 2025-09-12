import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';

export const deleteCoreViewFieldQueryFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DeleteViewFieldInput>) => ({
  query: gql`
    mutation DeleteCoreViewField($input: DeleteViewFieldInput!) {
      deleteCoreViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
