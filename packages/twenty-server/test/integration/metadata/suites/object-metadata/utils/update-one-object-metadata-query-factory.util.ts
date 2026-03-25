import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

export type UpdateOneObjectFactoryInput = {
  idToUpdate: string;
  updatePayload: UpdateObjectPayload;
};

export const updateOneObjectMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateOneObjectFactoryInput>) => ({
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
