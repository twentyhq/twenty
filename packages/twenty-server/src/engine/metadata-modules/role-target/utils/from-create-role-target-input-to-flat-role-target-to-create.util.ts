import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { type CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';

export const fromCreateRoleTargetInputToFlatRoleTargetToCreate = ({
  createRoleTargetInput,
  workspaceId,
  flatRoleTargetMaps,
  flatRoleMaps,
  flatApplication,
}: {
  createRoleTargetInput: CreateRoleTargetInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatRoleTargetMaps' | 'flatRoleMaps'>): {
  flatRoleTargetToCreate: FlatRoleTarget;
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  const now = new Date();
  const { roleId, targetId, targetMetadataForeignKey, universalIdentifier } =
    createRoleTargetInput;

  const { roleUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'roleTarget',
      foreignKeyValues: { roleId },
      flatEntityMaps: { flatRoleMaps },
    },
  );

  const flatRoleTargetToCreate: FlatRoleTarget = {
    id: v4(),
    roleId,
    roleUniversalIdentifier,
    userWorkspaceId: null,
    agentId: null,
    apiKeyId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    universalIdentifier: universalIdentifier ?? v4(),
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
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
