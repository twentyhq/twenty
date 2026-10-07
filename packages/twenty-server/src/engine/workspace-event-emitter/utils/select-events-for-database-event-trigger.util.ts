import type {
  DatabaseEventActor,
  ObjectRecordEvent,
} from 'twenty-shared/database-events';
import type { DatabaseEventTriggerSettings } from 'twenty-shared/application';

import { filterEventsByTriggerConditions } from 'src/engine/workspace-event-emitter/utils/filter-events-by-trigger-conditions.util';
import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';

export const selectEventsForDatabaseEventTrigger = <
  TEvent extends ObjectRecordEvent,
>({
  events,
  eventName,
  actor,
  triggerSettings,
}: {
  events: TEvent[];
  eventName: string;
  actor: DatabaseEventActor | undefined;
  triggerSettings: DatabaseEventTriggerSettings | null | undefined;
}): TEvent[] =>
  filterEventsByTriggerConditions({
    events: filterEventsByUpdatedFields({
      events,
      eventName,
      watchedFields: triggerSettings?.updatedFields,
    }),
    eventName,
    conditions: triggerSettings?.conditions,
    actor,
  });
