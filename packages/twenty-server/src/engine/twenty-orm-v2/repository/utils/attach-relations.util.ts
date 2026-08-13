import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';

export const collectForeignKeys = (
  records: ObjectRecord[],
  joinColumnName: string,
): string[] => [
  ...new Set(
    records.map((record) => record[joinColumnName]).filter(isNonEmptyString),
  ),
];

export const collectRecordIds = (records: ObjectRecord[]): string[] => [
  ...new Set(records.map((record) => record.id).filter(isNonEmptyString)),
];

// Mutates `records`, setting each `fieldName` to its matching target (or null).
export const attachToOneRelationToRecords = ({
  records,
  fieldName,
  joinColumnName,
  targets,
}: {
  records: ObjectRecord[];
  fieldName: string;
  joinColumnName: string;
  targets: ObjectRecord[];
}): void => {
  const targetById = new Map(targets.map((target) => [target.id, target]));

  for (const record of records) {
    const foreignKey = record[joinColumnName];

    record[fieldName] = isNonEmptyString(foreignKey)
      ? (targetById.get(foreignKey) ?? null)
      : null;
  }
};

// Mutates `records`, grouping `children` by their inverse foreign key onto each
// parent's `fieldName` (empty array when a parent has no children).
export const attachToManyRelationToRecords = ({
  records,
  fieldName,
  inverseForeignKeyColumnName,
  children,
}: {
  records: ObjectRecord[];
  fieldName: string;
  inverseForeignKeyColumnName: string;
  children: ObjectRecord[];
}): void => {
  const childrenByParentId = new Map<string, ObjectRecord[]>();

  for (const child of children) {
    const parentId = child[inverseForeignKeyColumnName];

    if (!isNonEmptyString(parentId)) {
      continue;
    }

    const siblings = childrenByParentId.get(parentId) ?? [];

    siblings.push(child);
    childrenByParentId.set(parentId, siblings);
  }

  for (const record of records) {
    record[fieldName] = childrenByParentId.get(record.id) ?? [];
  }
};
