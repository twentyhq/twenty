import { getSystemSideEffectRoleTargetUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { type CreateRoleTargetInput } from 'src/engine/metadata-modules/role-target/types/create-role-target.input';

export const fromCreateRoleTargetInputToFlatRoleTargetToCreate = ({
  createRoleTargetInput,
  workspaceId,
  flatRoleTargetMaps,
  flatRoleMaps,
  flatAgentMaps,
  flatWebhookMaps,
  flatApplication,
}: {
  createRoleTargetInput: CreateRoleTargetInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps' | 'flatRoleMaps' | 'flatAgentMaps' | 'flatWebhookMaps'
>): {
  flatRoleTargetToCreate: FlatRoleTarget;
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  const now = new Date();
  const { roleId, targetId, targetMetadataForeignKey, universalIdentifier } =
    createRoleTargetInput;

  // A role cached before the upgrade that adds this column has no value for it, and the role target column is NOT NULL.
  const isSystemSideEffect =
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatRoleMaps,
      flatEntityId: roleId,
    }).isSystemSideEffect === true;

  const { roleUniversalIdentifier } = resolveEntityRelationUniversalIdentifiers(
    {
      metadataName: 'roleTarget',
      foreignKeyValues: { roleId },
      flatEntityMaps: { flatRoleMaps },
    },
  );

  const agentUniversalIdentifier =
    targetMetadataForeignKey === 'agentId'
      ? findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatAgentMaps,
          flatEntityId: targetId,
        }).universalIdentifier
      : null;

  const webhookUniversalIdentifier =
    targetMetadataForeignKey === 'webhookId'
      ? findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatWebhookMaps,
          flatEntityId: targetId,
        }).universalIdentifier
      : null;

  const flatRoleTargetToCreate: FlatRoleTarget = {
    id: v4(),
    roleId,
    roleUniversalIdentifier,
    userWorkspaceId: null,
    isSystemSideEffect,
    agentId: null,
    agentUniversalIdentifier,
    apiKeyId: null,
    webhookId: null,
    webhookUniversalIdentifier,
    targetApplicationId: null,
    targetApplicationUniversalIdentifier: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    universalIdentifier:
      universalIdentifier ??
      (isSystemSideEffect
        ? getSystemSideEffectRoleTargetUniversalIdentifier({
            applicationUniversalIdentifier: flatApplication.universalIdentifier,
            roleUniversalIdentifier,
            targetId,
          })
        : v4()),
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    [targetMetadataForeignKey]: targetId,
  };

  const flatRoleTargetToDelete = isSystemSideEffect
    ? undefined
    : findFlatRoleTargetFromForeignKey({
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
