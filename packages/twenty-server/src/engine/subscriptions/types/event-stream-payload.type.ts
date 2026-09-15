import { type EventStreamMetadataEvent } from 'src/engine/subscriptions/types/event-stream-metadata-event.type';
import { type ObjectRecordSubscriptionEvent } from 'src/engine/subscriptions/types/object-record-subscription-event.type';
import { type QueueJobEvent } from 'src/engine/subscriptions/types/queue-job-event.type';

import { type RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';

export type EventStreamPayload = {
  recordExportEvents?: RecordExportDTO[];
  objectRecordEventsWithQueryIds: {
    queryIds: string[];
    objectRecordEvent: ObjectRecordSubscriptionEvent;
  }[];
  metadataEvents: EventStreamMetadataEvent[];
  queueJobEvents?: QueueJobEvent[];
};
