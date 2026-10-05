import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type SavePartition = {
  toUpdate: Partial<ObjectRecord>[];
  toInsert: Partial<ObjectRecord>[];
};

export const partitionEntitiesForSave = (
  entities: Partial<ObjectRecord>[],
  existingIds: Set<string>,
): SavePartition => {
  const toUpdate: Partial<ObjectRecord>[] = [];
  const toInsert: Partial<ObjectRecord>[] = [];

  for (const entity of entities) {
    const id = entity.id;

    if (isNonEmptyString(id) && existingIds.has(id)) {
      toUpdate.push(entity);
    } else {
      toInsert.push(entity);
    }
  }

  return { toUpdate, toInsert };
};

export const buildConflictKey = (
  entity: Partial<ObjectRecord>,
  conflictPaths: string[],
): string => JSON.stringify(conflictPaths.map((path) => entity[path] ?? null));

const hasCompleteConflictKey = (
  record: Partial<ObjectRecord>,
  conflictPaths: string[],
): boolean => conflictPaths.every((path) => isDefined(record[path]));

export type UpsertPartition = {
  toUpdate: { id: string; entity: Partial<ObjectRecord> }[];
  toInsert: Partial<ObjectRecord>[];
};

export const matchEntitiesForUpsert = (
  entities: Partial<ObjectRecord>[],
  existingRecords: ObjectRecord[],
  conflictPaths: string[],
): UpsertPartition => {
  const existingIdByConflictKey = new Map<string, string>();

  for (const existingRecord of existingRecords) {
    if (
      isNonEmptyString(existingRecord.id) &&
      hasCompleteConflictKey(existingRecord, conflictPaths)
    ) {
      existingIdByConflictKey.set(
        buildConflictKey(existingRecord, conflictPaths),
        existingRecord.id,
      );
    }
  }

  const toUpdate: { id: string; entity: Partial<ObjectRecord> }[] = [];
  const toInsert: Partial<ObjectRecord>[] = [];

  for (const entity of entities) {
    const existingId = hasCompleteConflictKey(entity, conflictPaths)
      ? existingIdByConflictKey.get(buildConflictKey(entity, conflictPaths))
      : undefined;

    if (isNonEmptyString(existingId)) {
      toUpdate.push({ id: existingId, entity });
    } else {
      toInsert.push(entity);
    }
  }

  return { toUpdate, toInsert };
};
