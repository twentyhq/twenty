import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleBindings,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  computeRelationGqlFieldJoinColumnName,
  createValidationRuleEvaluator,
  getValidationRulePreviousValueFieldPath,
  getValidationRuleRecordsFromDatabaseEvent,
  isDefined,
  renameValidationRuleExpressionToCurrentFieldNames,
} from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type DatabaseEventConditionRelation } from 'src/engine/workspace-event-emitter/types/database-event-condition-relation.type';
import { type FindDatabaseEventRelatedRecords } from 'src/engine/workspace-event-emitter/types/find-database-event-related-records.type';
import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';
import {
  loadDatabaseEventConditionRelatedRecords,
  toApiShapedDatabaseEventRecord,
} from 'src/engine/workspace-event-emitter/utils/load-database-event-condition-related-records.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type ConditionRecord = Record<string, unknown>;

type ConditionReads = {
  eventFieldNames: string[];
  previousFieldNames: string[];
  relations: DatabaseEventConditionRelation[];
};

const toConditionReads = ({
  boundPaths,
  fields,
}: {
  boundPaths: string[];
  fields: ValidationRuleFieldDescriptor[];
}): ConditionReads => {
  const rootPaths = boundPaths.filter((path) => !path.includes('.'));
  const relations = fields
    .filter(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.relationType === RelationType.MANY_TO_ONE &&
        rootPaths.includes(field.name),
    )
    .map((field) => ({
      fieldName: field.name,
      joinColumnName: computeRelationGqlFieldJoinColumnName({
        name: field.name,
      }),
      targetFieldNames: boundPaths
        .filter((path) => path.startsWith(`${field.name}.`))
        .map((path) => path.slice(field.name.length + 1)),
    }));
  const relationFieldNames = relations.map(({ fieldName }) => fieldName);

  return {
    eventFieldNames: [
      ...rootPaths.filter((path) => !relationFieldNames.includes(path)),
      ...relations.map(({ joinColumnName }) => joinColumnName),
    ],
    previousFieldNames: boundPaths
      .map(getValidationRulePreviousValueFieldPath)
      .filter(isDefined),
    relations,
  };
};

// Fields the caller cannot read are removed from events, and must not read as empty
const hasConditionFields = ({
  conditionReads,
  record,
  previousRecord,
}: {
  conditionReads: ConditionReads;
  record: ConditionRecord;
  previousRecord?: ConditionRecord;
}) =>
  conditionReads.eventFieldNames.every((fieldName) => fieldName in record) &&
  (!isDefined(previousRecord) ||
    conditionReads.previousFieldNames.every(
      (fieldName) => fieldName in previousRecord,
    ));

type DatabaseEventTriggerMatch<TEvent extends ObjectRecordEvent> = {
  events: TEvent[];
  conditionErrorMessage?: string;
};

// A condition that fails to evaluate matches nothing, and the caller logs why
export const filterEventsMatchingDatabaseEventTrigger = async <
  TEvent extends ObjectRecordEvent,
>({
  events,
  eventName,
  watchedFields,
  condition: storedCondition,
  conditionBindings,
  fields,
  findRelatedRecords,
}: {
  events: TEvent[];
  eventName: string;
  watchedFields?: string[];
  condition?: string;
  conditionBindings?: ValidationRuleBindings;
  fields: ValidationRuleFieldDescriptor[];
  findRelatedRecords?: FindDatabaseEventRelatedRecords;
}): Promise<DatabaseEventTriggerMatch<TEvent>> => {
  const eventsWithWatchedFields = filterEventsByUpdatedFields({
    events,
    eventName,
    watchedFields,
  });

  if (!isNonEmptyString(storedCondition)) {
    return { events: eventsWithWatchedFields };
  }

  const condition = isDefined(conditionBindings)
    ? renameValidationRuleExpressionToCurrentFieldNames({
        expression: storedCondition,
        bindings: conditionBindings,
        fields,
      })
    : storedCondition;

  // Compiling against the object's fields also rejects a field a wildcard trigger's object lacks
  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields,
  });

  if (!compilation.isValid) {
    return { events: [], conditionErrorMessage: compilation.errorMessage };
  }

  const { action } = parseEventNameOrThrow(eventName);
  const conditionReads = toConditionReads({
    boundPaths: Object.keys(compilation.bindings),
    fields,
  });
  let conditionErrorMessage: string | undefined;

  const readableEvents = eventsWithWatchedFields
    .map((event) => ({
      event,
      ...getValidationRuleRecordsFromDatabaseEvent({ event, action }),
    }))
    .filter((eventRecords) => {
      const isReadable = hasConditionFields({
        conditionReads,
        ...eventRecords,
      });

      if (!isReadable) {
        conditionErrorMessage =
          'The condition reads a field this trigger cannot see';
      }

      return isReadable;
    });

  const relatedRecordsLoad = await loadDatabaseEventConditionRelatedRecords({
    relations: conditionReads.relations,
    records: readableEvents.map(({ record }) => record),
    findRelatedRecords,
  });

  if ('errorMessage' in relatedRecordsLoad) {
    return {
      events: [],
      conditionErrorMessage: relatedRecordsLoad.errorMessage,
    };
  }

  const { relatedRecordsByRelation } = relatedRecordsLoad;

  const evaluate = createValidationRuleEvaluator({
    expression: condition,
    fields,
  });
  const now = new Date().toISOString();
  const matchingEvents: TEvent[] = [];

  for (const { event, record, previousRecord } of readableEvents) {
    const result = evaluate({
      record: toApiShapedDatabaseEventRecord({
        record,
        relations: conditionReads.relations,
        relatedRecordsByRelation,
      }),
      previousRecord,
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
