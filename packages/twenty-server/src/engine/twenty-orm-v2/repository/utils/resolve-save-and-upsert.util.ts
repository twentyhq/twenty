import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';

export type SavePartition = {
  toUpdate: Partial<ObjectRecord>[];
  toInsert: Partial<ObjectRecord>[];
};

// `save` updates entities whose id already exists and inserts the rest.
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

export type UpsertPartition = {
  toUpdate: { id: string; entity: Partial<ObjectRecord> }[];
  toInsert: Partial<ObjectRecord>[];
};

// `upsert` matches incoming entities to existing rows on the conflict columns,
// updating matches by their existing id and inserting the rest.
export const matchEntitiesForUpsert = (
  entities: Partial<ObjectRecord>[],
  existingRecords: ObjectRecord[],
  conflictPaths: string[],
): UpsertPartition => {
  const existingIdByConflictKey = new Map<string, string>();

  for (const existingRecord of existingRecords) {
    if (isNonEmptyString(existingRecord.id)) {
      existingIdByConflictKey.set(
        buildConflictKey(existingRecord, conflictPaths),
        existingRecord.id,
      );
    }
  }

  const toUpdate: { id: string; entity: Partial<ObjectRecord> }[] = [];
  const toInsert: Partial<ObjectRecord>[] = [];

  for (const entity of entities) {
    const existingId = existingIdByConflictKey.get(
      buildConflictKey(entity, conflictPaths),
    );

    if (isNonEmptyString(existingId)) {
      toUpdate.push({ id: existingId, entity });
    } else {
      toInsert.push(entity);
    }
  }

  return { toUpdate, toInsert };
};
