import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export type ObjectRecordEventForWebhook = Omit<
  ObjectRecordEvent,
  'objectMetadata'
> & {
  objectMetadata: Pick<ObjectMetadataEntity, 'id' | 'nameSingular'>;
};
