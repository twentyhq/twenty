import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { type ObjectLiteral } from 'typeorm';

import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type SqlCondition = { sql: string; parameters: ObjectLiteral };

export type InheritedReadabilityParentGate =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'private'; objectMetadataId: string }
  | {
      kind: 'inherited';
      parentTableAlias: string;
      parentTableExpression: string;
      parentCondition: SqlCondition;
    };

export type InheritedReadabilityChildGate =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; condition: SqlCondition };

export type InheritedReadabilityParentCondition =
  | {
      kind: 'column';
      joinColumnName: string;
      gate: InheritedReadabilityParentGate;
    }
  | {
      kind: 'children';
      childTableAlias: string;
      childTableExpression: string;
      childJoinColumnName: string;
      gate: InheritedReadabilityChildGate;
    };

export const buildInheritedReadabilityCondition = ({
  tableAlias,
  objectMetadataId,
  parents,
  recordShareTableExpression,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  objectMetadataId: string;
  parents: InheritedReadabilityParentCondition[];
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): SqlCondition | undefined => {
  const parameters: ObjectLiteral = {};
  const quotedTableAlias = escapeIdentifier(tableAlias);
  const quoteColumn = (joinColumnName: string) =>
    `${quotedTableAlias}.${escapeIdentifier(joinColumnName)}`;

  // The share rows on the record itself, its creator's among them, grant
  // access on their own, as they do on a PRIVATE record
  const ownRecordShareCondition = buildRecordShareCondition({
    tableAlias,
    recordShareTableExpression,
    objectMetadataId,
    principalIds,
    accessLevels,
  });

  Object.assign(parameters, ownRecordShareCondition.parameters);

  const parentConditions = parents.flatMap((parent) => {
    if (parent.kind === 'children') {
      const {
        childTableAlias,
        childTableExpression,
        childJoinColumnName,
        gate,
      } = parent;

      if (gate.kind === 'denied') {
        return [];
      }

      const quotedChildTableAlias = escapeIdentifier(childTableAlias);
      const childRowConditions = [
        `${quotedChildTableAlias}.${escapeIdentifier(childJoinColumnName)} = ${quotedTableAlias}."id"`,
        `${quotedChildTableAlias}."deletedAt" IS NULL`,
      ];

      if (gate.kind === 'gated') {
        Object.assign(parameters, gate.condition.parameters);
        childRowConditions.push(gate.condition.sql);
      }

      return [
        `EXISTS (SELECT 1 FROM ${childTableExpression} AS ${quotedChildTableAlias} WHERE ${childRowConditions.join(' AND ')})`,
      ];
    }

    const { joinColumnName, gate } = parent;
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
    sql: `(${[ownRecordShareCondition.sql, ...parentConditions].join(' OR ')})`,
    parameters,
  };
};
