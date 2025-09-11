import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/delete-view-field.input';

export const deleteOneViewFieldMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<DeleteViewFieldInput>) => ({
  query: gql`
    mutation DeleteOneViewField($input: DeleteViewFieldInput!) {
      deleteOneViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
