import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export type DatabaseEventPayload<T = ObjectRecordEvent> = Omit<
  WorkspaceEventBatch<T>,
  'events'
> &
  T;
