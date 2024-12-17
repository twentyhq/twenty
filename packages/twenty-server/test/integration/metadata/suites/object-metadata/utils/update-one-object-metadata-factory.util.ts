import gql from 'graphql-tag';

import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

type UpdateOneObjectFactoryParams = {
  gqlFields: string;
  input: {
    idToUpdate: string;
    updatePayload: UpdateObjectPayload;
  };
};

export const updateOneObjectMetadataItemFactory = ({
  gqlFields,
  input,
}: UpdateOneObjectFactoryParams) => ({
  query: gql`
      mutation UpdateOneObjectMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateObjectPayload!) {
        updateOneObject(input: {id: $idToUpdate, update: $updatePayload}) {
          ${gqlFields}
        }
      }
    `,
  variables: {
    idToUpdate: input.idToUpdate,
    updatePayload: input.updatePayload,
  },
});
