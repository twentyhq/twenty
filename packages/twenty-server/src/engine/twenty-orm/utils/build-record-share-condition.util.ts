import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordShareCondition = ({
  tableAlias,
  recordShareTableExpression,
  objectMetadataId,
  principalIds,
  accessLevels,
  recordIdExpression,
  objectMetadataIdExpression,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  objectMetadataId?: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  recordIdExpression?: string;
  objectMetadataIdExpression?: string;
}): { sql: string; parameters: ObjectLiteral } => {
  const parameterSuffix = randomBytes(5).toString('hex');
  const objectMetadataIdParameterName = `recordShareObjectMetadataId_${parameterSuffix}`;
  const principalIdsParameterName = `recordSharePrincipalIds_${parameterSuffix}`;
  const accessLevelsParameterName = `recordShareAccessLevels_${parameterSuffix}`;

  const recordShareAlias = escapeIdentifier(`${tableAlias}_recordShare`);
  const recordIdSql =
    recordIdExpression ?? `${escapeIdentifier(tableAlias)}."id"`;

  const objectMetadataIdSql =
    objectMetadataIdExpression ?? `:${objectMetadataIdParameterName}`;

  const conditions = [
    `${recordShareAlias}."recordId" = ${recordIdSql}`,
    `${recordShareAlias}."objectMetadataId" = ${objectMetadataIdSql}`,
    `${recordShareAlias}."principalId" = ANY(:${principalIdsParameterName})`,
    `${recordShareAlias}."accessLevel" IN (:...${accessLevelsParameterName})`,
    `${recordShareAlias}."deletedAt" IS NULL`,
  ];

  return {
    sql: `EXISTS (SELECT 1 FROM ${recordShareTableExpression} AS ${recordShareAlias} WHERE ${conditions.join(' AND ')})`,
    parameters: {
      ...(isDefined(objectMetadataIdExpression)
        ? {}
        : { [objectMetadataIdParameterName]: objectMetadataId }),
      [principalIdsParameterName]: principalIds,
      [accessLevelsParameterName]: accessLevels,
    },
  };
};
