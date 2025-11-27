import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateRolePayload } from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';

export type UpdateOneRoleFactoryInput = {
  idToUpdate: string;
  updatePayload: UpdateRolePayload;
};

export const updateOneRoleQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateOneRoleFactoryInput>) => ({
  query: gql`
        mutation UpdateOneRole($idToUpdate: UUID!, $updatePayload: UpdateRolePayload!) {
            updateOneRole(updateRoleInput: {id: $idToUpdate, update: $updatePayload}) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToUpdate: input.idToUpdate,
    updatePayload: input.updatePayload,
  },
});
