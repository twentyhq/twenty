import gql from 'graphql-tag';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

type CreateOneFieldFactoryParams = {
  gqlFields: string;
  input?: { field: Omit<CreateFieldInput, 'workspaceId' | 'dataSourceId'> };
};

export const createOneFieldMetadataFactory = ({
  gqlFields,
  input,
}: CreateOneFieldFactoryParams) => ({
  query: gql`
        mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
          createOneField(input: $input) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    input,
  },
});
