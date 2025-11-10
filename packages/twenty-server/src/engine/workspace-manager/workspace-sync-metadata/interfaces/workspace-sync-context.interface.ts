import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

export interface WorkspaceSyncContext {
  workspaceId: string;
  dataSourceId: string;
  featureFlags: FeatureFlagMap;
  applications: {
    twentyStandardApplication: ApplicationEntity;
    workspaceCustomApplication?: ApplicationEntity;
  };
}
