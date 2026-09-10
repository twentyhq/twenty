import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordShareCondition = ({
  tableAlias,
  recordShareTableExpression,
  objectMetadataId,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): { sql: string; parameters: ObjectLiteral } => {
  const parameterSuffix = randomBytes(5).toString('hex');
  const objectMetadataIdParameterName = `recordShareObjectMetadataId_${parameterSuffix}`;
  const principalIdsParameterName = `recordSharePrincipalIds_${parameterSuffix}`;
  const accessLevelsParameterName = `recordShareAccessLevels_${parameterSuffix}`;

  const recordShareAlias = escapeIdentifier(`${tableAlias}_recordShare`);
  const quotedTableAlias = escapeIdentifier(tableAlias);

  const conditions = [
    `${recordShareAlias}."recordId" = ${quotedTableAlias}."id"`,
    `${recordShareAlias}."objectMetadataId" = :${objectMetadataIdParameterName}`,
    `${recordShareAlias}."principalId" = ANY(:${principalIdsParameterName})`,
    `${recordShareAlias}."accessLevel" IN (:...${accessLevelsParameterName})`,
    `${recordShareAlias}."deletedAt" IS NULL`,
  ];

  return {
    sql: `EXISTS (SELECT 1 FROM ${recordShareTableExpression} AS ${recordShareAlias} WHERE ${conditions.join(' AND ')})`,
    parameters: {
      [objectMetadataIdParameterName]: objectMetadataId,
      [principalIdsParameterName]: principalIds,
      [accessLevelsParameterName]: accessLevels,
    },
  };
};
