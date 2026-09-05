import { randomBytes } from 'node:crypto';

import {
  type MetadataReadability,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';
import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type LinkedObjectReadability = {
  objectMetadataId: string;
  readability: MetadataReadability;
  isOwningApplication: boolean;
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
  linkedObjects: LinkedObjectReadability[];
}): { sql: string; parameters: ObjectLiteral } | undefined => {
  const deniedObjectMetadataIds: string[] = [];
  const privateObjectMetadataIds: string[] = [];

  for (const {
    objectMetadataId,
    readability,
    isOwningApplication,
  } of linkedObjects) {
    const gateKind = resolveRecordShareGateKind({
      readability,
      isOwningApplication,
    });

    if (gateKind === 'deny') {
      deniedObjectMetadataIds.push(objectMetadataId);
    }

    if (gateKind === 'private') {
      privateObjectMetadataIds.push(objectMetadataId);
    }
  }

  if (
    deniedObjectMetadataIds.length === 0 &&
    privateObjectMetadataIds.length === 0
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
    ],
  };

  if (privateObjectMetadataIds.length > 0) {
    const recordShareCondition = buildRecordShareCondition({
      tableAlias,
      recordShareTableExpression,
      principalIds,
      accessLevels,
      recordIdExpression: `${quotedTableAlias}."linkedRecordId"`,
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

  return { sql: `(${conditions.join(' OR ')})`, parameters };
};
