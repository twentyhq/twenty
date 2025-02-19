import gql from 'graphql-tag';

import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

type UpdateOneFieldFactoryParams = {
  gqlFields: string;
  input: { id: string; update: Omit<UpdateFieldInput, 'workspaceId' | 'id'> };
};

export const updateOneFieldMetadataFactory = ({
  gqlFields,
  input,
}: UpdateOneFieldFactoryParams) => ({
  query: gql`
        mutation UpdateOneFieldMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateFieldInput!) {
            updateOneField(input: {id: $idToUpdate, update: $updatePayload}) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToUpdate: input.id,
    updatePayload: input.update,
  },
});
