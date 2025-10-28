import gql from 'graphql-tag';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

export const createCoreViewFieldQueryFactory = ({
  gqlFields = VIEW_FIELD_GQL_FIELDS,
  input,
}: PerformMetadataQueryParams<CreateViewFieldInput>) => ({
  query: gql`
    mutation CreateCoreViewField($input: CreateViewFieldInput!) {
      createCoreViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
