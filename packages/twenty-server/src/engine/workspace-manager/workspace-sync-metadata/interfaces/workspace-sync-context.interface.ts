import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
export interface WorkspaceSyncContext {
  workspaceId: string;
  dataSourceId: string;
  featureFlags: FeatureFlagMap;
  twentyStandardApplication: ApplicationEntity;
}
