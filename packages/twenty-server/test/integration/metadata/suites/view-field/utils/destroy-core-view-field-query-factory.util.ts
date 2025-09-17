import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';

export const destroyCoreViewFieldQueryFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<DestroyViewFieldInput>) => ({
  query: gql`
    mutation DestroyCoreViewField($input: DestroyViewFieldInput!) {
      destroyCoreViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
