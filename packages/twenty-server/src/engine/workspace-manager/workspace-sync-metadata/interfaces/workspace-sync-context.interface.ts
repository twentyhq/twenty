import { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

export interface WorkspaceSyncContext {
  workspaceId: string;
  dataSourceId: string;
  featureFlags: FeatureFlagMap;
  twentyStandardFlatApplication: FlatApplication
}
