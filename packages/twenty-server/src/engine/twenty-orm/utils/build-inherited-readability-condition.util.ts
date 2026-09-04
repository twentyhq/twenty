import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type InheritedReadabilityParentGate =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'private'; objectMetadataId: string }
  | {
      kind: 'inherited';
      parentTableAlias: string;
      parentTableExpression: string;
      parentCondition: { sql: string; parameters: ObjectLiteral };
    };

export type InheritedReadabilityParentCondition = {
  joinColumnName: string;
  gate: InheritedReadabilityParentGate;
};

export const buildInheritedReadabilityCondition = ({
  tableAlias,
  parents,
  recordShareTableExpression,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  parents: InheritedReadabilityParentCondition[];
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): { sql: string; parameters: ObjectLiteral } | undefined => {
  if (parents.every(({ gate }) => gate.kind === 'open')) {
    return undefined;
  }

  const parameters: ObjectLiteral = {};
  const quotedTableAlias = escapeIdentifier(tableAlias);
  const quoteColumn = (joinColumnName: string) =>
    `${quotedTableAlias}.${escapeIdentifier(joinColumnName)}`;

  const noParentCondition = `(${parents
    .map(({ joinColumnName }) => `${quoteColumn(joinColumnName)} IS NULL`)
    .join(' AND ')})`;

  const parentConditions = parents.flatMap(({ joinColumnName, gate }) => {
    const notNullCondition = `${quoteColumn(joinColumnName)} IS NOT NULL`;

    switch (gate.kind) {
      case 'open':
        return [notNullCondition];
      case 'denied':
        return [];
      case 'private': {
        const recordShareCondition = buildRecordShareCondition({
          tableAlias,
          recordShareTableExpression,
          objectMetadataId: gate.objectMetadataId,
          principalIds,
          accessLevels,
          recordIdExpression: quoteColumn(joinColumnName),
        });

        Object.assign(parameters, recordShareCondition.parameters);

        return [`(${notNullCondition} AND ${recordShareCondition.sql})`];
      }
      case 'inherited': {
        const quotedParentTableAlias = escapeIdentifier(gate.parentTableAlias);

        Object.assign(parameters, gate.parentCondition.parameters);

        return [
          `(${notNullCondition} AND EXISTS (SELECT 1 FROM ${gate.parentTableExpression} AS ${quotedParentTableAlias} WHERE ${quotedParentTableAlias}."id" = ${quoteColumn(joinColumnName)} AND ${gate.parentCondition.sql}))`,
        ];
      }
    }
  });

  return {
    sql: `(${[noParentCondition, ...parentConditions].join(' OR ')})`,
    parameters,
  };
};
