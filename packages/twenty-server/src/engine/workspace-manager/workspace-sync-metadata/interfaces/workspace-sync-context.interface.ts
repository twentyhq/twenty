import { StandardApplicationEntityByApplicationUniversalIdentifier } from 'src/engine/core-modules/application/types/standard-application-entity-by-applicatin-universal-identifier';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

export interface WorkspaceSyncContext {
  workspaceId: string;
  dataSourceId: string;
  featureFlags: FeatureFlagMap;
  standardApplicationEntityByApplicationUniversalIdentifier: StandardApplicationEntityByApplicationUniversalIdentifier;
}
