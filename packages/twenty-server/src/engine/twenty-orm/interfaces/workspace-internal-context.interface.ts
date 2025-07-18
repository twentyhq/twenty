import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

export interface WorkspaceInternalContext {
  workspaceId: string;
  objectMetadataMaps: ObjectMetadataMaps;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
  eventEmitterService: WorkspaceEventEmitter;
}
