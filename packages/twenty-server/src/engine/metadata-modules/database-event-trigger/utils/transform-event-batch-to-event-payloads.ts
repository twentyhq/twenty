import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type ServerlessFunctionTriggerJobData } from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';

type DatabaseEventPayload<T = ObjectRecordEvent> = Omit<
  WorkspaceEventBatch<T>,
  'events'
> &
  T;

export const transformEventBatchToEventPayloads = ({
  workspaceEventBatch,
  databaseEventListeners,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  databaseEventListeners: DatabaseEventTriggerEntity[];
}): ServerlessFunctionTriggerJobData[] => {
  const result: ServerlessFunctionTriggerJobData[] = [];

  for (const databaseEventListener of databaseEventListeners) {
    const { events, ...batchEventInfo } = workspaceEventBatch;

    for (const event of events) {
      result.push({
        serverlessFunctionId: databaseEventListener.serverlessFunction.id,
        workspaceId: databaseEventListener.workspaceId,
        payload: { ...batchEventInfo, ...event },
      });
    }
  }

  return result;
};
