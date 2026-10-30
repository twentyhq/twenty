import { ok } from 'node:assert';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const runWithReadOnlyChatPermission = async <TResult>({
  workspaceId,
  userWorkspaceId,
  work,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  work: () => Promise<TResult>;
}): Promise<TResult> => {
  const cache = getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  );
  const {
    userWorkspaceRoleMap,
    flatRoleMaps,
    flatObjectPermissionMaps,
    flatObjectMetadataMaps,
  } = await cache.getOrRecompute(workspaceId, [
    'userWorkspaceRoleMap',
    'flatRoleMaps',
    'flatObjectPermissionMaps',
    'flatObjectMetadataMaps',
  ]);
  const roleId = userWorkspaceRoleMap[userWorkspaceId];

  ok(isDefined(roleId), 'The seeded chat member has no role');

  const roleUniversalIdentifier = flatRoleMaps.universalIdentifierById[roleId];
  const objectMetadata =
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];

  ok(
    isDefined(roleUniversalIdentifier) && isDefined(objectMetadata),
    'The seeded chat permission metadata is missing',
  );

  const originalObjectPermissions = Object.values(
    flatObjectPermissionMaps.byUniversalIdentifier,
  ).flatMap((permission) => {
    if (
      !isDefined(permission) ||
      permission.roleUniversalIdentifier !== roleUniversalIdentifier
    ) {
      return [];
    }

    return [
      {
        objectMetadataId: permission.objectMetadataId,
        canReadObjectRecords: permission.canReadObjectRecords ?? undefined,
        canUpdateObjectRecords: permission.canUpdateObjectRecords ?? undefined,
        canSoftDeleteObjectRecords:
          permission.canSoftDeleteObjectRecords ?? undefined,
        canDestroyObjectRecords:
          permission.canDestroyObjectRecords ?? undefined,
      },
    ];
  });
  const service = getAppProviderByClassName<ObjectPermissionService>(
    'ObjectPermissionService',
  );
  const otherObjectPermissions = originalObjectPermissions.filter(
    (permission) => permission.objectMetadataId !== objectMetadata.id,
  );

  try {
    await service.upsertObjectPermissions({
      workspaceId,
      input: {
        roleId,
        objectPermissions: [
          ...otherObjectPermissions,
          {
            objectMetadataId: objectMetadata.id,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    return await work();
  } finally {
    await service.upsertObjectPermissions({
      workspaceId,
      input: { roleId, objectPermissions: otherObjectPermissions },
    });
    await service.upsertObjectPermissions({
      workspaceId,
      input: { roleId, objectPermissions: originalObjectPermissions },
    });
  }
};
