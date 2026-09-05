import { randomBytes } from 'node:crypto';

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordShareObjectMetadataIdSource =
  | {
      objectMetadataId: string;
      objectMetadataIdExpression?: never;
      objectMetadataIds?: never;
    }
  | {
      objectMetadataId?: never;
      objectMetadataIdExpression: string;
      objectMetadataIds?: string[];
    };

export const buildRecordShareCondition = ({
  tableAlias,
  recordShareTableExpression,
  objectMetadataId,
  objectMetadataIdExpression,
  objectMetadataIds,
  principalIds,
  accessLevels,
  recordIdExpression,
}: {
  tableAlias: string;
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  recordIdExpression?: string;
} & RecordShareObjectMetadataIdSource): {
  sql: string;
  parameters: ObjectLiteral;
} => {
  const parameterSuffix = randomBytes(5).toString('hex');
  const objectMetadataIdParameterName = `recordShareObjectMetadataId_${parameterSuffix}`;
  const objectMetadataIdsParameterName = `recordShareObjectMetadataIds_${parameterSuffix}`;
  const principalIdsParameterName = `recordSharePrincipalIds_${parameterSuffix}`;
  const accessLevelsParameterName = `recordShareAccessLevels_${parameterSuffix}`;

  const recordShareAlias = escapeIdentifier(`${tableAlias}_recordShare`);
  const recordIdSql =
    recordIdExpression ?? `${escapeIdentifier(tableAlias)}."id"`;
  const objectMetadataIdSql =
    objectMetadataIdExpression ?? `:${objectMetadataIdParameterName}`;
  const hasObjectMetadataIds =
    isDefined(objectMetadataIds) && objectMetadataIds.length > 0;

  const conditions = [
    `${recordShareAlias}."recordId" = ${recordIdSql}`,
    `${recordShareAlias}."objectMetadataId" = ${objectMetadataIdSql}`,
    ...(hasObjectMetadataIds
      ? [
          `${recordShareAlias}."objectMetadataId" IN (:...${objectMetadataIdsParameterName})`,
        ]
      : []),
    `${recordShareAlias}."principalId" = ANY(:${principalIdsParameterName})`,
    `${recordShareAlias}."accessLevel" IN (:...${accessLevelsParameterName})`,
    `${recordShareAlias}."deletedAt" IS NULL`,
  ];

  return {
    sql: `EXISTS (SELECT 1 FROM ${recordShareTableExpression} AS ${recordShareAlias} WHERE ${conditions.join(' AND ')})`,
    parameters: {
      ...(isDefined(objectMetadataId)
        ? { [objectMetadataIdParameterName]: objectMetadataId }
        : {}),
      ...(hasObjectMetadataIds
        ? { [objectMetadataIdsParameterName]: objectMetadataIds }
        : {}),
      [principalIdsParameterName]: principalIds,
      [accessLevelsParameterName]: accessLevels,
    },
  };
};
