import gql from 'graphql-tag';

import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

type CreateOneObjectFactoryParams = {
  gqlFields: string;
  input?: { object: Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'> };
};

export const createOneObjectMetadataFactory = ({
  gqlFields,
  input,
}: CreateOneObjectFactoryParams) => ({
  query: gql`
      mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
        createOneObject(input: $input) {
          ${gqlFields}
      }
    }
    `,
  variables: {
    input,
  },
});
