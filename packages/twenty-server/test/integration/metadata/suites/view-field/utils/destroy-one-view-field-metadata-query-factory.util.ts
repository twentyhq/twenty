import gql from 'graphql-tag';

import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DestroyViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/destroy-view-field.input';

export const destroyOneViewFieldMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<DestroyViewFieldInput>) => ({
  query: gql`
    mutation DestroyOneViewField($input: DestroyViewFieldInput!) {
      destroyOneViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
