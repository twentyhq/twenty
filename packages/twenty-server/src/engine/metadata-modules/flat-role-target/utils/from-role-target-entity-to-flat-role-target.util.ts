import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromRoleTargetEntityToFlatRoleTarget = ({
  entity: roleTargetEntity,
  applicationIdToUniversalIdentifierMap,
  roleIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'roleTarget'>): FlatRoleTarget => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(roleTargetEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${roleTargetEntity.applicationId} not found when building flat role target for role target ${roleTargetEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const roleUniversalIdentifier = roleIdToUniversalIdentifierMap.get(
    roleTargetEntity.roleId,
  );

  if (!isDefined(roleUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Role with id ${roleTargetEntity.roleId} not found when building flat role target for role target ${roleTargetEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    id: roleTargetEntity.id,
    workspaceId: roleTargetEntity.workspaceId,
    roleId: roleTargetEntity.roleId,
    userWorkspaceId: roleTargetEntity.userWorkspaceId,
    agentId: roleTargetEntity.agentId,
    apiKeyId: roleTargetEntity.apiKeyId,
    applicationId: roleTargetEntity.applicationId,
    universalIdentifier: roleTargetEntity.universalIdentifier,
    createdAt: roleTargetEntity.createdAt.toISOString(),
    updatedAt: roleTargetEntity.updatedAt.toISOString(),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
  };
};
