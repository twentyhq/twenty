import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';

export type ObjectRecordEventForWebhook = Omit<
  ObjectRecordEvent,
  'objectMetadata'
> & {
  objectMetadata: Pick<ObjectMetadataInterface, 'id' | 'nameSingular'>;
};
