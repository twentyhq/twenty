import {
  type FeatureFlagKey,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { type EntityMetadata } from 'typeorm';

import { type CompactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-cache-maps.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type WorkflowAutomatedTriggerMaps } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';

export type AdditionalCacheDataMaps = {
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  rolesPermissions: ObjectsPermissionsByRoleId;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  apiKeyMap: Record<string, FlatApiKey>;
  flatApplicationMaps: FlatApplicationCacheMaps;
  ORMEntityMetadatas: EntityMetadata[];
  // Lite projection of flatFieldMetadataMaps for the record query/execution path. Recomputed and
  // invalidated as a derived sibling of flatFieldMetadataMaps (see WorkspaceCacheService).
  flatFieldMetadataMapsLite: FlatEntityMaps<LiteFlatFieldMetadata>;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  applicationVariableMaps: ApplicationVariableCacheMaps;
  graphQLResolverNameMap: Record<string, ResolverNameMapEntry>;
  currentBillingSubscription: CurrentBillingSubscription;
  workflowAutomatedTriggerMaps: WorkflowAutomatedTriggerMaps;
};

export type WorkspaceCacheDataMap = AllFlatEntityMaps<true> &
  AdditionalCacheDataMaps;

export type WorkspaceCacheKeyName = keyof WorkspaceCacheDataMap;

export type WorkspaceCacheResult<K extends WorkspaceCacheKeyName[]> = {
  [P in K[number]]: WorkspaceCacheDataMap[P];
};

export type WorkspaceCacheResultWithHashes<K extends WorkspaceCacheKeyName[]> =
  {
    data: WorkspaceCacheResult<K>;
    hashes: { [P in K[number]]: string };
  };

export type WorkspaceCacheStoredDataMap = Omit<
  WorkspaceCacheDataMap,
  'flatFieldMetadataMaps'
> & {
  flatFieldMetadataMaps:
    | WorkspaceCacheDataMap['flatFieldMetadataMaps']
    | CompactFlatFieldMetadataMaps;
};
