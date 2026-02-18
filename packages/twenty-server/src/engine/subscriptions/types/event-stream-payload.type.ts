import { type ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

export type EventStreamPayload = {
  objectRecordEventsWithQueryIds: {
    queryIds: string[];
    objectRecordEvent: ObjectRecordSubscriptionEvent;
  }[];
  metadataEventsWithQueryIds: {
    queryIds: string[];
    metadataEvent: MetadataEvent;
  }[];
};
