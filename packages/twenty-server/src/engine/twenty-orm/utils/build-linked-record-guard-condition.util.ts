import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type InheritedAccessParentGate } from 'src/engine/twenty-orm/utils/build-inherited-access-condition.util';
import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type LinkedRecordObjectGate = {
  objectMetadataId: string;
  gate: InheritedAccessParentGate;
};

// A timeline activity cached the title of the record it points at, so the whole
// row stays hidden unless that record is readable. An object id the workspace
// cannot resolve is never granted: the allow list is explicit
export const buildLinkedRecordGuardCondition = ({
  tableAlias,
  linkedObjectMetadataIdColumnName,
  linkedRecordIdColumnName,
  objectGates,
  recordShareTableExpression,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  linkedObjectMetadataIdColumnName: string;
  linkedRecordIdColumnName: string;
  objectGates: LinkedRecordObjectGate[];
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): { sql: string; parameters: ObjectLiteral } => {
  const quotedTableAlias = escapeIdentifier(tableAlias);
  const linkedObjectMetadataIdSql = `${quotedTableAlias}.${escapeIdentifier(linkedObjectMetadataIdColumnName)}`;
  const linkedRecordIdSql = `${quotedTableAlias}.${escapeIdentifier(linkedRecordIdColumnName)}`;

  const parameters: ObjectLiteral = {};
  const parameterSuffix = randomBytes(5).toString('hex');

  const openObjectMetadataIds = objectGates
    .filter(({ gate }) => gate.kind === 'open')
    .map(({ objectMetadataId }) => objectMetadataId);

  const recordShareObjectMetadataIds = objectGates
    .filter(({ gate }) => gate.kind === 'recordShare')
    .map(({ objectMetadataId }) => objectMetadataId);

  const grantedArms: string[] = [];

  if (openObjectMetadataIds.length > 0) {
    const parameterName = `linkedRecordOpenObjectIds_${parameterSuffix}`;

    parameters[parameterName] = openObjectMetadataIds;
    grantedArms.push(`${linkedObjectMetadataIdSql} = ANY(:${parameterName})`);
  }

  if (recordShareObjectMetadataIds.length > 0) {
    const parameterName = `linkedRecordPrivateObjectIds_${parameterSuffix}`;
    const recordShareCondition = buildRecordShareCondition({
      tableAlias: `linkedRecord_${parameterSuffix}`,
      recordShareTableExpression,
      principalIds,
      accessLevels,
      recordIdExpression: linkedRecordIdSql,
      objectMetadataIdExpression: linkedObjectMetadataIdSql,
    });

    parameters[parameterName] = recordShareObjectMetadataIds;
    Object.assign(parameters, recordShareCondition.parameters);

    grantedArms.push(
      `(${linkedObjectMetadataIdSql} = ANY(:${parameterName}) AND ${recordShareCondition.sql})`,
    );
  }

  for (const [index, { objectMetadataId, gate }] of objectGates.entries()) {
    if (gate.kind !== 'parentRow') {
      continue;
    }

    const parameterName = `linkedRecordObjectId_${index}_${parameterSuffix}`;
    const quotedAlias = escapeIdentifier(gate.alias);

    parameters[parameterName] = objectMetadataId;

    for (const condition of gate.conditions) {
      Object.assign(parameters, condition.parameters);
    }

    const parentConditions = [
      `${quotedAlias}."id" = ${linkedRecordIdSql}`,
      ...gate.conditions.map((condition) => condition.sql),
    ];

    grantedArms.push(
      `(${linkedObjectMetadataIdSql} = :${parameterName} AND EXISTS (SELECT 1 FROM ${gate.tableExpression} AS ${quotedAlias} WHERE ${parentConditions.join(' AND ')}))`,
    );
  }

  const noLinkedRecordCondition = `(${linkedObjectMetadataIdSql} IS NULL AND ${linkedRecordIdSql} IS NULL)`;

  if (!isDefined(grantedArms[0])) {
    return { sql: `(${noLinkedRecordCondition})`, parameters };
  }

  return {
    sql: `(${noLinkedRecordCondition} OR (${linkedRecordIdSql} IS NOT NULL AND (${grantedArms.join(' OR ')})))`,
    parameters,
  };
};
