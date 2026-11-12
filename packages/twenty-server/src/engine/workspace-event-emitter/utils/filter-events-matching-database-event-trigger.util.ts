import { isNonEmptyString } from '@sniptt/guards';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  createValidationRuleEvaluator,
  getValidationRulePreviousValueFieldPath,
  getValidationRuleRecordsFromDatabaseEvent,
  isDefined,
} from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type ConditionFieldNames = { current: string[]; previous: string[] };

// Event fields have no related records, so every binding is a field or previous.field
const toConditionFieldNames = (boundPaths: string[]): ConditionFieldNames => ({
  current: boundPaths.filter((path) => !path.includes('.')),
  previous: boundPaths
    .map(getValidationRulePreviousValueFieldPath)
    .filter(isDefined),
});

// Fields the caller cannot read are removed from events, and must not read as empty
const hasConditionFields = ({
  conditionFieldNames,
  record,
  previousRecord,
}: {
  conditionFieldNames: ConditionFieldNames;
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
}) =>
  conditionFieldNames.current.every((fieldName) => fieldName in record) &&
  (!isDefined(previousRecord) ||
    conditionFieldNames.previous.every(
      (fieldName) => fieldName in previousRecord,
    ));

type DatabaseEventTriggerMatch<TEvent extends ObjectRecordEvent> = {
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

  // Compiling against the object's fields also rejects a field a wildcard trigger's object lacks
  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields,
  });

  if (!compilation.isValid) {
    return { events: [], conditionErrorMessage: compilation.errorMessage };
  }

  const { action } = parseEventNameOrThrow(eventName);
  const evaluate = createValidationRuleEvaluator({
    expression: condition,
    fields,
  });
  const conditionFieldNames = toConditionFieldNames(
    Object.keys(compilation.bindings),
  );
  const now = new Date().toISOString();
  const matchingEvents: TEvent[] = [];
  let conditionErrorMessage: string | undefined;

  for (const event of eventsWithWatchedFields) {
    const records = getValidationRuleRecordsFromDatabaseEvent({
      event,
      action,
    });

    if (!hasConditionFields({ conditionFieldNames, ...records })) {
      conditionErrorMessage =
        'The condition reads a field this trigger cannot see';
      continue;
    }

    const result = evaluate({ ...records, now });

    if (result.status === 'passed') {
      matchingEvents.push(event);
    } else if (result.status === 'errored') {
      conditionErrorMessage = result.errorMessage;
    }
  }

  return { events: matchingEvents, conditionErrorMessage };
};
