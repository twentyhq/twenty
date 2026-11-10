import { isNonEmptyString } from '@sniptt/guards';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  createValidationRuleEvaluator,
  getValidationRuleRecordsFromDatabaseEvent,
} from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

export type DatabaseEventTriggerMatch<TEvent extends ObjectRecordEvent> = {
  events: TEvent[];
  conditionErrorMessage?: string;
};

// A condition that fails to evaluate matches nothing, and the caller logs why
export const filterEventsMatchingDatabaseEventTrigger = <
  TEvent extends ObjectRecordEvent,
>({
  events,
  eventName,
  watchedFields,
  condition,
  fields,
}: {
  events: TEvent[];
  eventName: string;
  watchedFields?: string[];
  condition?: string;
  fields: ValidationRuleFieldDescriptor[];
}): DatabaseEventTriggerMatch<TEvent> => {
  const eventsWithWatchedFields = filterEventsByUpdatedFields({
    events,
    eventName,
    watchedFields,
  });

  if (!isNonEmptyString(condition)) {
    return { events: eventsWithWatchedFields };
  }

  const { action } = parseEventNameOrThrow(eventName);
  const evaluate = createValidationRuleEvaluator({
    expression: condition,
    fields,
  });
  const now = new Date().toISOString();
  const matchingEvents: TEvent[] = [];
  let conditionErrorMessage: string | undefined;

  for (const event of eventsWithWatchedFields) {
    const result = evaluate({
      ...getValidationRuleRecordsFromDatabaseEvent({ event, action }),
      now,
    });

    if (result.status === 'passed') {
      matchingEvents.push(event);
    } else if (result.status === 'errored') {
      conditionErrorMessage = result.errorMessage;
    }
  }

  return { events: matchingEvents, conditionErrorMessage };
};
