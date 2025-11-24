import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
export interface WorkspaceSyncContext {
  workspaceId: string;
  dataSourceId: string;
  featureFlags: FeatureFlagMap;
}
