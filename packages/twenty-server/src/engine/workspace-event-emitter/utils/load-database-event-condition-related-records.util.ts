import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventConditionRelation } from 'src/engine/workspace-event-emitter/types/database-event-condition-relation.type';
import { type FindDatabaseEventRelatedRecords } from 'src/engine/workspace-event-emitter/types/find-database-event-related-records.type';

type ConditionRecord = Record<string, unknown>;

type RelatedRecordsByRelation = Map<string, Map<string, ConditionRecord>>;

const readRecordId = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

const toRelatedRecordsById = (relatedRecords: ConditionRecord[]) =>
  new Map(
    relatedRecords.flatMap((relatedRecord) => {
      const relatedRecordId = readRecordId(relatedRecord.id);

      return isDefined(relatedRecordId)
        ? [[relatedRecordId, relatedRecord] as const]
        : [];
    }),
  );

export const loadDatabaseEventConditionRelatedRecords = async ({
  relations,
  records,
  findRelatedRecords,
}: {
  relations: DatabaseEventConditionRelation[];
  records: ConditionRecord[];
  findRelatedRecords?: FindDatabaseEventRelatedRecords;
}): Promise<
  | { relatedRecordsByRelation: RelatedRecordsByRelation }
  | { errorMessage: string }
> => {
  const relatedRecordsByRelation: RelatedRecordsByRelation = new Map();

  for (const relation of relations) {
    // The id is on the event already
    const fieldNames = relation.targetFieldNames.filter(
      (fieldName) => fieldName !== 'id',
    );

    if (fieldNames.length === 0) {
      continue;
    }

    if (!isDefined(findRelatedRecords)) {
      return {
        errorMessage: `This trigger cannot read the fields of "${relation.fieldName}"`,
      };
    }

    const recordIds = [
      ...new Set(
        records
          .map((record) => readRecordId(record[relation.joinColumnName]))
          .filter(isDefined),
      ),
    ];

    if (recordIds.length === 0) {
      relatedRecordsByRelation.set(relation.fieldName, new Map());
      continue;
    }

    // A failed read must not stop the other triggers of the batch, which a job retry would run twice
    const result = await findRelatedRecords({
      relationFieldName: relation.fieldName,
      recordIds,
      fieldNames,
    }).catch((error: unknown) => ({
      errorMessage: `Cannot read the records of "${relation.fieldName}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    }));

    if ('errorMessage' in result) {
      return result;
    }

    relatedRecordsByRelation.set(
      relation.fieldName,
      toRelatedRecordsById(result.relatedRecords),
    );
  }

  return { relatedRecordsByRelation };
};

// A relation reads as the API shows it: company is { id, ... } or null, never companyId
export const toApiShapedDatabaseEventRecord = ({
  record,
  relations,
  relatedRecordsByRelation,
}: {
  record: ConditionRecord;
  relations: DatabaseEventConditionRelation[];
  relatedRecordsByRelation: RelatedRecordsByRelation;
}): ConditionRecord => {
  const apiShapedRecord = { ...record };

  for (const { fieldName, joinColumnName } of relations) {
    const relatedRecordId = readRecordId(record[joinColumnName]);
    const loadedRelatedRecords = relatedRecordsByRelation.get(fieldName);

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
