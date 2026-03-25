import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export type WorkspaceEventBatchForWebhook<WorkspaceEvent> = Omit<
  WorkspaceEventBatch<WorkspaceEvent>,
  'objectMetadata'
> & {
  objectMetadata: Pick<ObjectMetadataEntity, 'id' | 'nameSingular'>;
};
