import { v4 } from 'uuid';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { findFlatRoleTargetOf } from 'src/engine/metadata-modules/flat-role-target/utils/find-all-flat-role-target-of.util';
import { CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';
import { isDefined } from 'twenty-shared/utils';

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
    createdAt: now,
    updatedAt: now,
    universalIdentifier: universalIdentifier ?? v4(),
    workspaceId,
    applicationId: createRoleTargetInput.applicationId,
    [targetMetadataForeignKey]: targetId,
  };

  const flatRoleTargetToDelete = findFlatRoleTargetOf({
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
