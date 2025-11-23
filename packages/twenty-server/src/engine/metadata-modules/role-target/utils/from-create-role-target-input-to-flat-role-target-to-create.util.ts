import { v4 } from 'uuid';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';

export const fromCreateRoleTargetInputToFlatRoleTargetToCreate = ({
  createRoleTargetInput,
  workspaceId,
}: {
  createRoleTargetInput: CreateRoleTargetInput & { applicationId: string };
  workspaceId: string;
}): {
  flatRoleTargetToCreate: FlatRoleTarget;
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  const now = new Date();
  const { roleId, targetId, targetMetadata, universalIdentifier } =
    createRoleTargetInput;

  const flatRoleTargetToCreate: FlatRoleTarget = {
    id: v4(),
    roleId,
    userWorkspaceId: null,
    agentId: null,
    apiKeyId: null,
    createdAt: now,
    updatedAt: now,
    universalIdentifier: universalIdentifier ?? v4(),
    workspaceId,
    applicationId: createRoleTargetInput.applicationId,
    [targetMetadata]: targetId,
  };

  return {
    flatRoleTargetToCreate: flatRoleTargetToCreate,
    flatRoleTargetsToDelete: [],
  };
};
