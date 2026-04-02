import { type ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';

export type EventStreamMetadataEvent = {
  metadataName: string;
  type: 'created' | 'updated' | 'deleted';
  recordId: string;
  properties: {
    updatedFields?: string[];
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, unknown>;
  };
  updatedCollectionHash?: string;
};

export type EventStreamPayload = {
  objectRecordEventsWithQueryIds: {
    queryIds: string[];
    objectRecordEvent: ObjectRecordSubscriptionEvent;
  }[];
  metadataEvents: EventStreamMetadataEvent[];
};
