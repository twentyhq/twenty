import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type RevokeRoleWideAccessToChannelObjectsCommand } from 'src/engine/permissions/channel-visibility/commands/revoke-role-wide-access-to-channel-objects.command';
import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const revokeRoleWideAccessToChannelObjects = () =>
  getAppProviderByClassName<RevokeRoleWideAccessToChannelObjectsCommand>(
    'RevokeRoleWideAccessToChannelObjectsCommand',
  ).runOnWorkspace({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    options: {},
    index: 0,
    total: 1,
  });

export const restoreRoleWideAccessToChannelObjects = async () => {
  await global.testDataSource.query(
    `DELETE FROM core."objectPermission" "objectPermission"
      USING core."objectMetadata" "objectMetadata"
      WHERE "objectMetadata".id = "objectPermission"."objectMetadataId"
        AND "objectPermission"."workspaceId" = $1
        AND "objectMetadata"."universalIdentifier" = ANY($2)`,
    [
      SEED_APPLE_WORKSPACE_ID,
      [
        STANDARD_OBJECTS.message.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.universalIdentifier,
        ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
        STANDARD_OBJECTS.attachment.universalIdentifier,
        STANDARD_OBJECTS.callRecording.universalIdentifier,
      ],
    ],
  );
  await global.testDataSource.query(
    `DELETE FROM core."rowLevelPermissionRule" "rule"
      USING core."objectMetadata" "objectMetadata", core."role" "role"
      WHERE "objectMetadata".id = "rule"."objectMetadataId"
        AND "role".id = "rule"."roleId"
        AND "role"."canBeAssignedToUsers"
        AND "rule"."workspaceId" = $1
        AND "objectMetadata"."universalIdentifier" = ANY($2)`,
    [
      SEED_APPLE_WORKSPACE_ID,
      [
        STANDARD_OBJECTS.attachment.universalIdentifier,
        STANDARD_OBJECTS.callRecording.universalIdentifier,
      ],
    ],
  );
  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatObjectPermissionMaps',
    'flatRowLevelPermissionRuleMaps',
    'flatRowLevelPermissionPredicateGroupMaps',
    'flatRowLevelPermissionPredicateMaps',
    'rolesPermissions',
  ]);
};
