import { isDefined } from 'twenty-shared/utils';

import type {
  DatabaseEventActor,
  ObjectRecordEvent,
} from 'twenty-shared/database-events';
import type { DatabaseEventTriggerConditions } from 'twenty-shared/application';

import { evaluateDatabaseEventTriggerRecordCondition } from 'src/engine/workspace-event-emitter/utils/evaluate-database-event-trigger-record-condition.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

const pickRecordForCondition = (
  event: ObjectRecordEvent,
  action: string,
): unknown => {
  const { before, after } = event.properties as {
    before?: unknown;
    after?: unknown;
  };

  return action === 'deleted' || action === 'destroyed' ? before : after;
};

export const filterEventsByTriggerConditions = <
  TEvent extends ObjectRecordEvent,
>({
  events,
  eventName,
  conditions,
  actor,
}: {
  events: TEvent[];
  eventName: string;
  conditions: DatabaseEventTriggerConditions | undefined;
  actor: DatabaseEventActor | undefined;
}): TEvent[] => {
  if (!isDefined(conditions)) {
    return events;
  }

  if (
    isDefined(conditions.actor) &&
    (!isDefined(actor) || !conditions.actor.includes(actor.type))
  ) {
    return [];
  }

  const recordCondition = conditions.record;

  if (!isDefined(recordCondition)) {
    return events;
  }

  const { action } = parseEventNameOrThrow(eventName);

  return events.filter((event) =>
    evaluateDatabaseEventTriggerRecordCondition({
      record: pickRecordForCondition(event, action),
      condition: recordCondition,
    }),
  );
};
