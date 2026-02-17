import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { type EntityMetadata } from 'typeorm';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/applicationVariable/types/application-variable-cache-maps.type';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';

export const WORKSPACE_CACHE_KEYS_V2 = {
  flatObjectMetadataMaps: 'flat-maps:object-metadata',
  flatFieldMetadataMaps: 'flat-maps:field-metadata',
  flatIndexMaps: 'flat-maps:index',
  flatViewMaps: 'flat-maps:view',
  flatViewFieldMaps: 'flat-maps:view-field',
  flatViewFieldGroupMaps: 'flat-maps:view-field-group',
  flatViewGroupMaps: 'flat-maps:view-group',
  flatViewFilterMaps: 'flat-maps:view-filter',
  flatViewFilterGroupMaps: 'flat-maps:view-filter-group',
  flatLogicFunctionMaps: 'flat-maps:logic-function',
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
  flatCommandMenuItemMaps: 'flat-maps:command-menu-item',
  flatNavigationMenuItemMaps: 'flat-maps:navigation-menu-item',
  flatRoleTargetByAgentIdMaps: 'flat-maps:flatRoleTargetByAgentId',
  flatPageLayoutMaps: 'flat-maps:page-layout',
  flatPageLayoutWidgetMaps: 'flat-maps:page-layout-widget',
  flatPageLayoutTabMaps: 'flat-maps:flatPageLayoutTabMaps',
  flatRowLevelPermissionPredicateMaps:
    'flat-maps:row-level-permission-predicate',
  flatRowLevelPermissionPredicateGroupMaps:
    'flat-maps:row-level-permission-predicate-group',
  flatFrontComponentMaps: 'flat-maps:front-component',
  flatWebhookMaps: 'flat-maps:webhook',
  flatWorkspaceMemberMaps: 'flat-maps:workspace-member',
  applicationVariableMaps: 'cache:application-variable',
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
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  applicationVariableMaps: ApplicationVariableCacheMaps;
};

export type WorkspaceCacheDataMap = AllFlatEntityMaps<true> &
  AdditionalCacheDataMaps;

export type WorkspaceCacheKeyName = keyof WorkspaceCacheDataMap;

export type WorkspaceCacheResult<K extends WorkspaceCacheKeyName[]> = {
  [P in K[number]]: WorkspaceCacheDataMap[P];
};
