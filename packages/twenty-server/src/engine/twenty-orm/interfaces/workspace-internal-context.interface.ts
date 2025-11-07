import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type ExternalFieldDrivers } from 'src/engine/twenty-orm/storage/external-field-drivers.token';

export interface WorkspaceInternalContext {
  workspaceId: string;
  objectMetadataMaps: ObjectMetadataMaps;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  eventEmitterService: WorkspaceEventEmitter;
  externalFieldDrivers: ExternalFieldDrivers;
}
