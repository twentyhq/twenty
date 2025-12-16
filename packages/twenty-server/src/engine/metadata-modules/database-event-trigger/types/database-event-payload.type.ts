import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export type DatabaseEventPayload<T = ObjectRecordEvent> = Omit<
  WorkspaceEventBatch<T>,
  'events'
> &
  T;
