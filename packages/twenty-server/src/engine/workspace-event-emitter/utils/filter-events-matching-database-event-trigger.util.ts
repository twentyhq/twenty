import { isNonEmptyString } from '@sniptt/guards';
import {
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
  isValidationRuleToOneRelationField,
  renameValidationRuleExpressionToCurrentFieldNames,
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
  previousRelations: ConditionRelation[];
};

const toRecordReads = ({
  paths,
  fields,
}: {
  paths: string[];
  fields: ValidationRuleFieldDescriptor[];
}) => {
  const rootPaths = paths.filter((path) => !path.includes('.'));
  const relations = fields
    .filter(
      (field) =>
        isValidationRuleToOneRelationField(field) &&
        rootPaths.includes(field.name),
    )
    .map((field) => ({
      fieldName: field.name,
      joinColumnName: computeRelationGqlFieldJoinColumnName({
        name: field.name,
      }),
      targetFieldNames: paths
        .filter((path) => path.startsWith(`${field.name}.`))
        .map((path) => path.slice(field.name.length + 1)),
    }));
  const relationFieldNames = relations.map(({ fieldName }) => fieldName);

  return {
    fieldNames: [
      ...rootPaths.filter((path) => !relationFieldNames.includes(path)),
      ...relations.map(({ joinColumnName }) => joinColumnName),
    ],
    relations,
  };
};

const toConditionReads = ({
  boundPaths,
  fields,
}: {
  boundPaths: string[];
  fields: ValidationRuleFieldDescriptor[];
}): ConditionReads => {
  const currentReads = toRecordReads({ paths: boundPaths, fields });
  const previousReads = toRecordReads({
    paths: boundPaths
      .map(getValidationRulePreviousValueFieldPath)
      .filter(isDefined),
    fields,
  });

  return {
    eventFieldNames: currentReads.fieldNames,
    previousFieldNames: previousReads.fieldNames,
    relations: currentReads.relations,
    previousRelations: previousReads.relations,
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

type RelationLoad = {
  joinColumnName: string;
  fieldNames: Set<string>;
  recordIds: Set<string>;
};

// One load per relation serves both the current and the previous record
const toRelationLoads = (
  relationReads: {
    relations: ConditionRelation[];
    records: ConditionRecord[];
  }[],
): Map<string, RelationLoad> => {
  const relationLoads = new Map<string, RelationLoad>();

  for (const { relations, records } of relationReads) {
    for (const relation of relations) {
      const relationLoad = relationLoads.get(relation.fieldName) ?? {
        joinColumnName: relation.joinColumnName,
        fieldNames: new Set<string>(),
        recordIds: new Set<string>(),
      };

      // Only fields beyond the id need the related record itself
      relation.targetFieldNames
        .filter((fieldName) => fieldName !== 'id')
        .forEach((fieldName) => relationLoad.fieldNames.add(fieldName));
      records
        .map((record) => readRecordId(record[relation.joinColumnName]))
        .filter(isDefined)
        .forEach((recordId) => relationLoad.recordIds.add(recordId));

      relationLoads.set(relation.fieldName, relationLoad);
    }
  }

  return relationLoads;
};

const findRelatedRecordsById = async ({
  relationLoads,
  findRelatedRecords,
}: {
  relationLoads: Map<string, RelationLoad>;
  findRelatedRecords?: FindDatabaseEventRelatedRecords;
}): Promise<Map<string, Map<string, ConditionRecord>>> => {
  const relatedRecordsByRelation = new Map<
    string,
    Map<string, ConditionRecord>
  >();

  for (const [relationFieldName, relationLoad] of relationLoads) {
    if (relationLoad.fieldNames.size === 0) {
      continue;
    }

    if (!isDefined(findRelatedRecords)) {
      throw new Error(
        `This trigger cannot read the fields of "${relationFieldName}"`,
      );
    }

    const relatedRecords =
      relationLoad.recordIds.size > 0
        ? await findRelatedRecords({
            relationFieldName,
            recordIds: [...relationLoad.recordIds],
            fieldNames: [...relationLoad.fieldNames],
          })
        : [];

    relatedRecordsByRelation.set(
      relationFieldName,
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

  for (const { fieldName, joinColumnName, targetFieldNames } of relations) {
    const relatedRecordId = readRecordId(record[joinColumnName]);
    // Per side, so a previous.<relation> read doesn't change how the current relation reads
    const loadedRelatedRecords = targetFieldNames.some(
      (targetFieldName) => targetFieldName !== 'id',
    )
      ? relatedRecordsByRelation.get(fieldName)
      : undefined;

    if (!isDefined(relatedRecordId)) {
      apiShapedRecord[fieldName] = null;
      continue;
    }

    // A loaded relation reads null when its record is deleted or hidden, as the API returns it
    apiShapedRecord[fieldName] = isDefined(loadedRelatedRecords)
      ? (loadedRelatedRecords.get(relatedRecordId) ?? null)
      : { id: relatedRecordId };
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

  const relatedRecordsLoad = await findRelatedRecordsById({
    relationLoads: toRelationLoads([
      {
        relations: conditionReads.relations,
        records: readableEvents.map(({ record }) => record),
      },
      {
        relations: conditionReads.previousRelations,
        records: readableEvents
          .map(({ previousRecord }) => previousRecord)
          .filter(isDefined),
      },
    ]),
    findRelatedRecords,
  }).then(
    (relatedRecordsByRelation) => ({ relatedRecordsByRelation }),
    (error: unknown) => ({
      errorMessage: error instanceof Error ? error.message : String(error),
    }),
  );

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
      record: toApiShapedRecord({
        record,
        relations: conditionReads.relations,
        relatedRecordsByRelation,
      }),
      previousRecord: isDefined(previousRecord)
        ? toApiShapedRecord({
            record: previousRecord,
            relations: conditionReads.previousRelations,
            relatedRecordsByRelation,
          })
        : undefined,
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
