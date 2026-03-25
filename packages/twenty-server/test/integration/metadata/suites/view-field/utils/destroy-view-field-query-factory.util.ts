import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';

export const destroyViewFieldQueryFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewFieldInput>) => ({
  query: gql`
    mutation DestroyViewField($input: DestroyViewFieldInput!) {
      destroyViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
