import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';

export const WORKSPACE_CACHE_KEYS_V2 = {
  flatObjectMetadataMaps: 'flat-maps:object-metadata',
  flatFieldMetadataMaps: 'flat-maps:field-metadata',
  flatIndexMaps: 'flat-maps:index',
  flatViewMaps: 'flat-maps:view',
  flatViewFieldMaps: 'flat-maps:view-field',
  flatViewGroupMaps: 'flat-maps:view-group',
  flatViewFilterMaps: 'flat-maps:view-filter',
  flatServerlessFunctionMaps: 'flat-maps:serverless-function',
  flatCronTriggerMaps: 'flat-maps:cron-trigger',
  flatDatabaseEventTriggerMaps: 'flat-maps:database-event-trigger',
  flatRouteTriggerMaps: 'flat-maps:route-trigger',
  featureFlagsMap: 'feature-flag:feature-flags-map',
  rolesPermissions: 'metadata:permissions:roles-permissions',
  userWorkspaceRoleMap: 'metadata:permissions:user-workspace-role-map',
  flatApplicationMaps: 'flat-maps:flatApplicationMaps',
} as const satisfies Record<WorkspaceCacheKeyName, string>;

type AdditionalCacheDataMap = {
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  rolesPermissions: ObjectsPermissionsByRoleId;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  flatApplicationMaps: FlatApplicationCacheMaps;
};

export type WorkspaceCacheDataMap = AllFlatEntityMaps & AdditionalCacheDataMap;

export type WorkspaceCacheKeyName = keyof WorkspaceCacheDataMap;

export type WorkspaceCacheResult<K extends WorkspaceCacheKeyName[]> = {
  [P in K[number]]: WorkspaceCacheDataMap[P];
};
