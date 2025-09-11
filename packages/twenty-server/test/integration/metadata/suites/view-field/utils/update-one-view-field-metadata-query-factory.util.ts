import gql from 'graphql-tag';

import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateViewFieldInput } from 'src/engine/core-modules/view/dtos/inputs/update-view-field.input';

export const updateOneViewFieldMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateViewFieldInput>) => ({
  query: gql`
    mutation UpdateOneViewField($input: UpdateViewFieldInput!) {
      updateOneViewField(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input,
  },
});
