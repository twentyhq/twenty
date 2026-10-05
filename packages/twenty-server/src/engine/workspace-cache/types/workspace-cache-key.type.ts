import {
  type FeatureFlagKey,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { type CompactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';
import { type BillingEntitlements } from 'src/engine/core-modules/billing/types/billing-entitlements.type';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type WorkflowAutomatedTriggerMaps } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';
import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type UsageLimits } from 'src/engine/core-modules/usage-limit/types/usage-limits.type';

export type AdditionalCacheDataMaps = {
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  rolesPermissions: ObjectsPermissionsByRoleId;
  apiKeyMap: Record<string, FlatApiKey>;
  flatApplicationMaps: FlatApplicationCacheMaps;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  currentBillingSubscription: CurrentBillingSubscription;
  billingEntitlements: BillingEntitlements;
  workflowAutomatedTriggerMaps: WorkflowAutomatedTriggerMaps;
  usageLimits: UsageLimits;
};

export type WorkspaceCacheDataMap = AllFlatEntityMaps<true> &
  AdditionalCacheDataMaps;

export type WorkspaceCacheKeyName = keyof WorkspaceCacheDataMap;

// TODO: remove once the 2.8 upgrade command that flushes this key is removed
export type RemovedWorkspaceCacheKeyName = 'ORMEntityMetadatas';

export type WorkspaceDerivedCacheDataMap = {
  roleIdsWithAllRecordsAccess: string[];
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
  graphQLResolverNameMap: Record<string, ResolverNameMapEntry>;
};

export type WorkspaceDerivedCacheKeyName = keyof WorkspaceDerivedCacheDataMap;

export type WorkspaceCacheOrDerivedCacheDataMap = WorkspaceCacheDataMap &
  WorkspaceDerivedCacheDataMap;

export type WorkspaceCacheOrDerivedCacheKeyName =
  keyof WorkspaceCacheOrDerivedCacheDataMap;

export type WorkspaceCacheResult<
  K extends WorkspaceCacheOrDerivedCacheKeyName[],
> = {
  [P in K[number]]: WorkspaceCacheOrDerivedCacheDataMap[P];
};

export type WorkspaceCacheResultWithHashes<
  K extends WorkspaceCacheOrDerivedCacheKeyName[],
> = {
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
