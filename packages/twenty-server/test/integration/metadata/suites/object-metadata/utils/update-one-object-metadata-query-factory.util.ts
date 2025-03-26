import gql from 'graphql-tag';
import { PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

export type UpdateOneObjectFactoryInput = {
  idToUpdate: string;
  updatePayload: UpdateObjectPayload;
};

export const updateOneObjectMetadataFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateOneObjectFactoryInput>) => ({
  query: gql`
        mutation UpdateOneObjectMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateOneObjectInput!) {
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
