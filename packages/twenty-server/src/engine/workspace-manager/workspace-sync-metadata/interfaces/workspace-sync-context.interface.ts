import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { TwentyStandardApplication } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

export interface WorkspaceSyncContext {
  workspaceId: string;
  dataSourceId: string;
  featureFlags: FeatureFlagMap;
  applications: TwentyStandardApplication
}
