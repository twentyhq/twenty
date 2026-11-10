import { isNonEmptyString } from '@sniptt/guards';
import {
  VALIDATION_RULE_NOW_VARIABLE_NAME,
  VALIDATION_RULE_PREVIOUS_VARIABLE_NAME,
} from 'twenty-shared/constants';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  createValidationRuleEvaluator,
  getValidationRuleRecordsFromDatabaseEvent,
  isDefined,
  parseValidationRuleExpression,
} from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type ConditionFieldNames = { current: string[]; previous: string[] };

const findConditionFieldNames = (condition: string): ConditionFieldNames => {
  const conditionFieldNames: ConditionFieldNames = {
    current: [],
    previous: [],
  };

  try {
    for (const path of parseValidationRuleExpression(condition).variables({
      withMembers: true,
    })) {
      const [rootName, previousRootName] = path.split('.');
      const isPreviousPath =
        rootName === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME;
      const fieldName = isPreviousPath ? previousRootName : rootName;

      if (
        isDefined(fieldName) &&
        fieldName !== VALIDATION_RULE_NOW_VARIABLE_NAME
      ) {
        conditionFieldNames[isPreviousPath ? 'previous' : 'current'].push(
          fieldName,
        );
      }
    }
  } catch {
    // The evaluator reports the parse error
  }

  return conditionFieldNames;
};

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
  const conditionFieldNames = findConditionFieldNames(condition);
  const fieldNames = new Set(fields.map(({ name }) => name));
  const unknownFieldName = [
    ...conditionFieldNames.current,
    ...conditionFieldNames.previous,
  ].find((fieldName) => !fieldNames.has(fieldName));

  // A wildcard trigger reaches objects without the field, which would read as empty
  if (isDefined(unknownFieldName)) {
    return {
      events: [],
      conditionErrorMessage: `The condition reads ${unknownFieldName}, which this object does not have`,
    };
  }

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
