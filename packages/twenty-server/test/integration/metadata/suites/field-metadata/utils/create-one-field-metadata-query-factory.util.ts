import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

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
