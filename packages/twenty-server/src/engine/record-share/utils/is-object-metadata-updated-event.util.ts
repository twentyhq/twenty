import {
  type MetadataEvent,
  type UpdateMetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

export type ObjectMetadataUpdatedEvent = MetadataEvent &
  UpdateMetadataEvent<'objectMetadata'>;

export const isObjectMetadataUpdatedEvent = (
  event: MetadataEvent,
): event is ObjectMetadataUpdatedEvent =>
  event.metadataName === 'objectMetadata' && event.type === 'updated';
