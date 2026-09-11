import { randomBytes } from 'node:crypto';

import {
  ObjectAccessInheritanceMatch,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const ALWAYS_FALSE_SQL = '(1=0)';

export type InheritedAccessParentGate =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'recordShare'; objectMetadataId: string }
  | {
      kind: 'parentRow';
      tableExpression: string;
      alias: string;
      conditions: { sql: string; parameters: ObjectLiteral }[];
    };

export type InheritedAccessColumnGate = {
  joinColumnName: string;
  gate: InheritedAccessParentGate;
};

export type InheritedAccessBranchGate = {
  isMorph: boolean;
  columns: InheritedAccessColumnGate[];
};

const buildColumnCondition = ({
  columnSql,
  gate,
  recordShareTableExpression,
  principalIds,
  accessLevels,
  parameters,
}: {
  columnSql: string;
  gate: InheritedAccessParentGate;
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
  parameters: ObjectLiteral;
}): string | undefined => {
  const notNullCondition = `${columnSql} IS NOT NULL`;

  switch (gate.kind) {
    case 'denied':
      return undefined;
    case 'open':
      return `(${notNullCondition})`;
    case 'recordShare': {
      const recordShareCondition = buildRecordShareCondition({
        tableAlias: `inheritedParent_${randomBytes(5).toString('hex')}`,
        recordShareTableExpression,
        objectMetadataId: gate.objectMetadataId,
        principalIds,
        accessLevels,
        recordIdExpression: columnSql,
      });

      Object.assign(parameters, recordShareCondition.parameters);

      return `(${notNullCondition} AND ${recordShareCondition.sql})`;
    }
    case 'parentRow': {
      const quotedAlias = escapeIdentifier(gate.alias);

      for (const condition of gate.conditions) {
        Object.assign(parameters, condition.parameters);
      }

      const parentConditions = [
        `${quotedAlias}."id" = ${columnSql}`,
        ...gate.conditions.map((condition) => condition.sql),
      ];

      return `(${notNullCondition} AND EXISTS (SELECT 1 FROM ${gate.tableExpression} AS ${quotedAlias} WHERE ${parentConditions.join(' AND ')}))`;
    }
    default:
      return assertUnreachable(gate);
  }
};

// A populated to-one morph carries exactly one concrete parent: a row holding
// several of them is malformed and must not become readable through whichever
// of them the caller happens to be granted
const buildMorphCardinalityCondition = (columnSqls: string[]): string =>
  `(${columnSqls
    .map(
      (columnSql) => `(CASE WHEN ${columnSql} IS NOT NULL THEN 1 ELSE 0 END)`,
    )
    .join(' + ')} = 1)`;

export const buildInheritedAccessCondition = ({
  tableAlias,
  branches,
  match,
  recordShareTableExpression,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  branches: InheritedAccessBranchGate[];
  match: ObjectAccessInheritanceMatch;
  recordShareTableExpression: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): { sql: string; parameters: ObjectLiteral } => {
  if (branches.length === 0) {
    return { sql: ALWAYS_FALSE_SQL, parameters: {} };
  }

  const parameters: ObjectLiteral = {};
  const quotedTableAlias = escapeIdentifier(tableAlias);
  const quoteColumn = (joinColumnName: string) =>
    `${quotedTableAlias}.${escapeIdentifier(joinColumnName)}`;

  const branchConditions = branches.map((branch) => {
    const columnSqls = branch.columns.map(({ joinColumnName }) =>
      quoteColumn(joinColumnName),
    );

    const grantedColumnConditions = branch.columns
      .map(({ joinColumnName, gate }) =>
        buildColumnCondition({
          columnSql: quoteColumn(joinColumnName),
          gate,
          recordShareTableExpression,
          principalIds,
          accessLevels,
          parameters,
        }),
      )
      .filter(isDefined);

    if (grantedColumnConditions.length === 0) {
      return ALWAYS_FALSE_SQL;
    }

    const grantedCondition =
      grantedColumnConditions.length === 1
        ? grantedColumnConditions[0]
        : `(${grantedColumnConditions.join(' OR ')})`;

    if (!branch.isMorph || columnSqls.length < 2) {
      return grantedCondition;
    }

    return `(${buildMorphCardinalityCondition(columnSqls)} AND ${grantedCondition})`;
  });

  const separator =
    match === ObjectAccessInheritanceMatch.ALL ? ' AND ' : ' OR ';

  return {
    sql: `(${branchConditions.join(separator)})`,
    parameters,
  };
};
