import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export type CreateOneFieldFactoryInput = Omit<
  CreateFieldInput,
  'workspaceId' | 'dataSourceId'
>;

export const createOneFieldMetadataQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<CreateOneFieldFactoryInput>) => ({
  query: gql`
        mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
          createOneField(input: $input) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    input: { field: input },
  },
});
