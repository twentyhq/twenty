import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { type EntityMetadata } from 'typeorm';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/services/workspace-user-workspace-role-map-cache.service';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';

export const WORKSPACE_CACHE_KEYS_V2 = {
  flatObjectMetadataMaps: 'flat-maps:object-metadata',
  flatFieldMetadataMaps: 'flat-maps:field-metadata',
  flatIndexMaps: 'flat-maps:index',
  flatViewMaps: 'flat-maps:view',
  flatViewFieldMaps: 'flat-maps:view-field',
  flatViewGroupMaps: 'flat-maps:view-group',
  flatViewFilterMaps: 'flat-maps:view-filter',
  flatViewFilterGroupMaps: 'flat-maps:view-filter-group',
  flatServerlessFunctionMaps: 'flat-maps:serverless-function',
  flatCronTriggerMaps: 'flat-maps:cron-trigger',
  flatDatabaseEventTriggerMaps: 'flat-maps:database-event-trigger',
  flatRouteTriggerMaps: 'flat-maps:route-trigger',
  featureFlagsMap: 'feature-flag:feature-flags-map',
  rolesPermissions: 'metadata:permissions:roles-permissions',
  userWorkspaceRoleMap: 'metadata:permissions:user-workspace-role-map',
  apiKeyRoleMap: 'metadata:permissions:api-key-role-map',
  flatApplicationMaps: 'flat-maps:flatApplicationMaps',
  flatRoleMaps: 'flat-maps:role',
  flatRoleTargetMaps: 'flat-maps:role-target',
  ORMEntityMetadatas: 'orm:entity-metadatas',
  flatAgentMaps: 'flat-maps:agent',
  flatSkillMaps: 'flat-maps:skill',
  flatRoleTargetByAgentIdMaps: 'flat-maps:flatRoleTargetByAgentId',
  flatPageLayoutMaps: 'flat-maps:page-layout',
  flatPageLayoutWidgetMaps: 'flat-maps:page-layout-widget',
  flatPageLayoutTabMaps: 'flat-maps:flatPageLayoutTabMaps',
  flatRowLevelPermissionPredicateMaps:
    'flat-maps:row-level-permission-predicate',
  flatRowLevelPermissionPredicateGroupMaps:
    'flat-maps:row-level-permission-predicate-group',
} as const satisfies Record<WorkspaceCacheKeyName, string>;

export type AdditionalCacheDataMaps = {
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  rolesPermissions: ObjectsPermissionsByRoleId;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatApplicationMaps: FlatApplicationCacheMaps;
  ORMEntityMetadatas: EntityMetadata[];
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
};

export type WorkspaceCacheDataMap = AllFlatEntityMaps & AdditionalCacheDataMaps;

export type WorkspaceCacheKeyName = keyof WorkspaceCacheDataMap;

export type WorkspaceCacheResult<K extends WorkspaceCacheKeyName[]> = {
  [P in K[number]]: WorkspaceCacheDataMap[P];
};
