import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

export type UpdateOneFieldFactoryInput = {
  idToUpdate: string;
  updatePayload: Omit<UpdateFieldInput, 'workspaceId' | 'id'>;
};

export const updateOneFieldMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateOneFieldFactoryInput>) => ({
  query: gql`
        mutation UpdateOneFieldMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateFieldInput!) {
            updateOneField(input: {id: $idToUpdate, update: $updatePayload}) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToUpdate: input.idToUpdate,
    updatePayload: input.updatePayload,
  },
});
