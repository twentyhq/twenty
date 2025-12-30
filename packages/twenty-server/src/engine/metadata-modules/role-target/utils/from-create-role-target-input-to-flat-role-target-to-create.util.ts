import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { type CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';

export const fromCreateRoleTargetInputToFlatRoleTargetToCreate = ({
  createRoleTargetInput,
  workspaceId,
  flatRoleTargetMaps,
}: {
  createRoleTargetInput: CreateRoleTargetInput & { applicationId: string };
  workspaceId: string;
} & Pick<AllFlatEntityMaps, 'flatRoleTargetMaps'>): {
  flatRoleTargetToCreate: FlatRoleTarget;
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  const now = new Date();
  const { roleId, targetId, targetMetadataForeignKey, universalIdentifier } =
    createRoleTargetInput;

  const flatRoleTargetToCreate: FlatRoleTarget = {
    id: v4(),
    roleId,
    userWorkspaceId: null,
    agentId: null,
    apiKeyId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    universalIdentifier: universalIdentifier ?? v4(),
    workspaceId,
    applicationId: createRoleTargetInput.applicationId,
    [targetMetadataForeignKey]: targetId,
  };

  const flatRoleTargetToDelete = findFlatRoleTargetFromForeignKey({
    flatRoleTargetMaps,
    targetMetadataForeignKey,
    targetId,
  });

  return {
    flatRoleTargetToCreate: flatRoleTargetToCreate,
    flatRoleTargetsToDelete: isDefined(flatRoleTargetToDelete)
      ? [flatRoleTargetToDelete]
      : [],
  };
};
