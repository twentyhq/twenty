import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  computeRelationGqlFieldJoinColumnName,
  createValidationRuleEvaluator,
  getValidationRulePreviousValueFieldPath,
  getValidationRuleRecordsFromDatabaseEvent,
  isDefined,
} from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FindDatabaseEventRelatedRecords } from 'src/engine/workspace-event-emitter/types/find-database-event-related-records.type';
import { filterEventsByUpdatedFields } from 'src/engine/workspace-event-emitter/utils/filter-events-by-updated-fields.util';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type ConditionRecord = Record<string, unknown>;

type ConditionRelation = {
  fieldName: string;
  joinColumnName: string;
  targetFieldNames: string[];
};

type ConditionReads = {
  eventFieldNames: string[];
  previousFieldNames: string[];
  relations: ConditionRelation[];
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

const readRecordId = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

// Only fields beyond the id need the related record itself
const findRelatedRecordsById = async ({
  relations,
  records,
  findRelatedRecords,
}: {
  relations: ConditionRelation[];
  records: ConditionRecord[];
  findRelatedRecords?: FindDatabaseEventRelatedRecords;
}): Promise<Map<string, Map<string, ConditionRecord>>> => {
  const relatedRecordsByRelation = new Map<
    string,
    Map<string, ConditionRecord>
  >();

  for (const relation of relations) {
    const fieldNames = relation.targetFieldNames.filter(
      (fieldName) => fieldName !== 'id',
    );

    if (fieldNames.length === 0) {
      continue;
    }

    if (!isDefined(findRelatedRecords)) {
      throw new Error(
        `This trigger cannot read the fields of "${relation.fieldName}"`,
      );
    }

    const recordIds = [
      ...new Set(
        records
          .map((record) => readRecordId(record[relation.joinColumnName]))
          .filter(isDefined),
      ),
    ];
    const relatedRecords =
      recordIds.length > 0
        ? await findRelatedRecords({
            relationFieldName: relation.fieldName,
            recordIds,
            fieldNames,
          })
        : [];

    relatedRecordsByRelation.set(
      relation.fieldName,
      new Map(
        relatedRecords
          .map((relatedRecord) => [
            readRecordId(relatedRecord.id),
            relatedRecord,
          ])
          .filter((entry): entry is [string, ConditionRecord] =>
            isDefined(entry[0]),
          ),
      ),
    );
  }

  return relatedRecordsByRelation;
};

// A relation reads as the API shows it: company is { id, ... } or null, never companyId
const toApiShapedRecord = ({
  record,
  relations,
  relatedRecordsByRelation,
}: {
  record: ConditionRecord;
  relations: ConditionRelation[];
  relatedRecordsByRelation: Map<string, Map<string, ConditionRecord>>;
}): ConditionRecord => {
  const apiShapedRecord = { ...record };

  for (const { fieldName, joinColumnName } of relations) {
    const relatedRecordId = readRecordId(record[joinColumnName]);

    apiShapedRecord[fieldName] = isDefined(relatedRecordId)
      ? {
          ...relatedRecordsByRelation.get(fieldName)?.get(relatedRecordId),
          id: relatedRecordId,
        }
      : null;
  }

  return apiShapedRecord;
};

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
  condition,
  fields,
  findRelatedRecords,
}: {
  events: TEvent[];
  eventName: string;
  watchedFields?: string[];
  condition?: string;
  fields: ValidationRuleFieldDescriptor[];
  findRelatedRecords?: FindDatabaseEventRelatedRecords;
}): Promise<DatabaseEventTriggerMatch<TEvent>> => {
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

  let relatedRecordsByRelation: Map<string, Map<string, ConditionRecord>>;

  try {
    relatedRecordsByRelation = await findRelatedRecordsById({
      relations: conditionReads.relations,
      records: readableEvents.map(({ record }) => record),
      findRelatedRecords,
    });
  } catch (error) {
    return {
      events: [],
      conditionErrorMessage:
        error instanceof Error ? error.message : String(error),
    };
  }

  const evaluate = createValidationRuleEvaluator({
    expression: condition,
    fields,
  });
  const now = new Date().toISOString();
  const matchingEvents: TEvent[] = [];

  for (const { event, record, previousRecord } of readableEvents) {
    const result = evaluate({
      record: toApiShapedRecord({
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
