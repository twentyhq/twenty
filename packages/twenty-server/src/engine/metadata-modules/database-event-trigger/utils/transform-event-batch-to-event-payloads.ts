import { isDefined } from 'twenty-shared/utils';

import type {
  DatabaseEventPayload,
  ObjectRecordEvent,
} from 'twenty-shared/database-events';

import { type DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { type ServerlessFunctionTriggerJobData } from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';
import type { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const transformEventBatchToEventPayloads = ({
  workspaceEventBatch,
  databaseEventListeners,
}: {
  workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  databaseEventListeners: DatabaseEventTriggerEntity[];
}): ServerlessFunctionTriggerJobData[] => {
  const result: ServerlessFunctionTriggerJobData[] = [];
  const { events, ...batchEventInfo } = workspaceEventBatch;
  const [, operation] = workspaceEventBatch.name.split('.');

  for (const databaseEventListener of databaseEventListeners) {
    const triggerUpdatedFields = databaseEventListener.settings.updatedFields;

    const filteredEvents = filterEventsByUpdatedFields({
      events,
      operation,
      triggerUpdatedFields,
    });

    for (const event of filteredEvents) {
      const payload: DatabaseEventPayload = { ...batchEventInfo, ...event };

      result.push({
        serverlessFunctionId: databaseEventListener.serverlessFunction.id,
        workspaceId: databaseEventListener.workspaceId,
        payload,
      });
    }
  }

  return result;
};

const filterEventsByUpdatedFields = ({
  events,
  operation,
  triggerUpdatedFields,
}: {
  events: ObjectRecordEvent[];
  operation: string;
  triggerUpdatedFields?: string[];
}): ObjectRecordEvent[] => {
  if (
    operation !== 'updated' ||
    !isDefined(triggerUpdatedFields) ||
    triggerUpdatedFields.length === 0
  ) {
    return events;
  }

  return events.filter((event) => {
    const eventUpdatedFields = (
      event.properties as { updatedFields?: string[] }
    )?.updatedFields;

    if (!isDefined(eventUpdatedFields) || eventUpdatedFields.length === 0) {
      return false;
    }

    return eventUpdatedFields.some((fieldName: string) =>
      triggerUpdatedFields.includes(fieldName),
    );
  });
};
