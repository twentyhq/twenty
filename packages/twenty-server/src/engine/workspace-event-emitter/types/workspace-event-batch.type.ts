import type { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type WorkspaceEventBatch<WorkspaceEvent> = {
  name: string;
  workspaceId: string;
  objectMetadata: Omit<ObjectMetadataEntity, 'indexMetadatas'>;
  events: WorkspaceEvent[];
};
