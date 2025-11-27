import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type UpdateRolePayload } from 'src/engine/metadata-modules/role/dtos/update-role-input.dto';

export type UpdateOneRoleFactoryInput = {
  idToUpdate: string;
  updatePayload: UpdateRolePayload;
};

const DEFAULT_ROLE_GQL_FIELDS = `
  id
  label
  description
  icon
  isEditable
  canUpdateAllSettings
  canAccessAllTools
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  canBeAssignedToUsers
  canBeAssignedToAgents
  canBeAssignedToApiKeys
`;

export const updateOneRoleQueryFactory = ({
  gqlFields = DEFAULT_ROLE_GQL_FIELDS,
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
