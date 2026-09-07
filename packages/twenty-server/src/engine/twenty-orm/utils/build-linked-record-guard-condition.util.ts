import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import {
  buildInheritedReadabilityCondition,
  type InheritedReadabilityParentGate,
} from 'src/engine/twenty-orm/utils/build-inherited-readability-condition.util';
import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const LINKED_RECORD_ID_COLUMN_NAME = 'linkedRecordId';

export type LinkedObjectGate = {
  objectMetadataId: string;
  gate: InheritedReadabilityParentGate;
};

type InheritedLinkedObjectGate = {
  objectMetadataId: string;
  gate: Extract<InheritedReadabilityParentGate, { kind: 'inherited' }>;
};

export const buildLinkedRecordGuardCondition = ({
  tableAlias,
  recordShareTableExpression,
  principalIds,
  accessLevels,
  linkedObjects,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  linkedObjects: LinkedObjectGate[];
}): { sql: string; parameters: ObjectLiteral } | undefined => {
  const deniedObjectMetadataIds: string[] = [];
  const privateObjectMetadataIds: string[] = [];
  const inheritedLinkedObjects: InheritedLinkedObjectGate[] = [];

  for (const { objectMetadataId, gate } of linkedObjects) {
    switch (gate.kind) {
      case 'open':
        break;
      case 'denied':
        deniedObjectMetadataIds.push(objectMetadataId);
        break;
      case 'private':
        privateObjectMetadataIds.push(objectMetadataId);
        break;
      case 'inherited':
        inheritedLinkedObjects.push({ objectMetadataId, gate });
        break;
    }
  }

  if (
    deniedObjectMetadataIds.length === 0 &&
    privateObjectMetadataIds.length === 0 &&
    inheritedLinkedObjects.length === 0
  ) {
    return undefined;
  }

  const parameterSuffix = randomBytes(5).toString('hex');
  const nonOpenObjectMetadataIdsParameterName = `linkedRecordGuardNonOpenObjectMetadataIds_${parameterSuffix}`;
  const privateObjectMetadataIdsParameterName = `linkedRecordGuardPrivateObjectMetadataIds_${parameterSuffix}`;
  const quotedTableAlias = escapeIdentifier(tableAlias);
  const linkedObjectMetadataIdSql = `${quotedTableAlias}."linkedObjectMetadataId"`;

  const conditions = [
    `${linkedObjectMetadataIdSql} IS NULL`,
    `${linkedObjectMetadataIdSql} NOT IN (:...${nonOpenObjectMetadataIdsParameterName})`,
  ];
  const parameters: ObjectLiteral = {
    [nonOpenObjectMetadataIdsParameterName]: [
      ...deniedObjectMetadataIds,
      ...privateObjectMetadataIds,
      ...inheritedLinkedObjects.map(({ objectMetadataId }) => objectMetadataId),
    ],
  };

  if (privateObjectMetadataIds.length > 0) {
    const recordShareCondition = buildRecordShareCondition({
      tableAlias,
      recordShareTableExpression,
      principalIds,
      accessLevels,
      recordIdExpression: `${quotedTableAlias}.${escapeIdentifier(LINKED_RECORD_ID_COLUMN_NAME)}`,
      objectMetadataIdExpression: linkedObjectMetadataIdSql,
      objectMetadataIds: privateObjectMetadataIds,
    });

    conditions.push(
      `(${linkedObjectMetadataIdSql} IN (:...${privateObjectMetadataIdsParameterName}) AND ${recordShareCondition.sql})`,
    );
    Object.assign(parameters, recordShareCondition.parameters, {
      [privateObjectMetadataIdsParameterName]: privateObjectMetadataIds,
    });
  }

  inheritedLinkedObjects.forEach(({ objectMetadataId, gate }, index) => {
    const inheritedCondition = buildInheritedReadabilityCondition({
      tableAlias,
      recordShareTableExpression,
      principalIds,
      accessLevels,
      parents: [{ joinColumnName: LINKED_RECORD_ID_COLUMN_NAME, gate }],
    });

    if (!isDefined(inheritedCondition)) {
      return;
    }

    const inheritedObjectMetadataIdParameterName = `linkedRecordGuardInheritedObjectMetadataId_${parameterSuffix}_${index}`;

    conditions.push(
      `(${linkedObjectMetadataIdSql} = :${inheritedObjectMetadataIdParameterName} AND ${inheritedCondition.sql})`,
    );
    Object.assign(parameters, inheritedCondition.parameters, {
      [inheritedObjectMetadataIdParameterName]: objectMetadataId,
    });
  });

  return { sql: `(${conditions.join(' OR ')})`, parameters };
};
