import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildCountStatement,
  buildSelectStatement,
  type SelectStatementState,
} from 'src/engine/twenty-orm/sql/utils/build-select-statement.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

const SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const buildColumn = (columnName: string) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
});

const personTableShape: WorkspaceTableShape = {
  objectMetadataId: 'person-object-id',
  nameSingular: 'person',
  schemaName: SCHEMA_NAME,
  tableName: 'person',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const buildState = (
  overrides: Partial<SelectStatementState> = {},
): SelectStatementState => ({
  alias: 'person',
  tableShape: personTableShape,
  findOptions: { select: { id: true } },
  extraSelectClauses: [],
  columnSelections: [],
  joinClauses: [],
  whereClauses: [],
  rowAccessConditions: [],
  existsFilterClauses: [],
  groupByExpressions: [],
  orderByClauses: [],
  distinctOnExpressions: [],
  includeDeleted: false,
  allowPlainToManyJoins: false,
  ...overrides,
});

const OR_CHAIN_WHERE_CLAUSES: SelectStatementState['whereClauses'] = [
  { operator: 'and', sql: '("person"."id" = :a)' },
  { operator: 'or', sql: '("person"."id" = :b)' },
];

const ROW_ACCESS_CONDITION = '"person"."ownerId" = :ownerId';

describe('buildSelectStatement', () => {
  it('should keep row access conditions outside a user OR chain', () => {
    const sql = buildSelectStatement(
      buildState({
        whereClauses: OR_CHAIN_WHERE_CLAUSES,
        rowAccessConditions: [ROW_ACCESS_CONDITION],
        includeDeleted: true,
      }),
    );

    expect(sql).toBe(
      `SELECT "person"."id" AS "person_id" FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE (("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId)',
    );
  });

  it('should keep the soft-delete predicate outside both the user expression and row access conditions', () => {
    const sql = buildSelectStatement(
      buildState({
        whereClauses: OR_CHAIN_WHERE_CLAUSES,
        rowAccessConditions: [ROW_ACCESS_CONDITION],
      }),
    );

    expect(sql).toContain(
      'WHERE ((("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId)) AND "person"."deletedAt" IS NULL',
    );
  });

  it('should AND every row access condition', () => {
    const sql = buildSelectStatement(
      buildState({
        whereClauses: OR_CHAIN_WHERE_CLAUSES,
        rowAccessConditions: [ROW_ACCESS_CONDITION, 'EXISTS (SELECT 1) OR 1=1'],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain(
      'WHERE (("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId) AND (EXISTS (SELECT 1) OR 1=1)',
    );
  });

  it('should render row access conditions alone when there is no user where', () => {
    const sql = buildSelectStatement(
      buildState({
        rowAccessConditions: [ROW_ACCESS_CONDITION],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain('WHERE ("person"."ownerId" = :ownerId)');
  });

  it('should keep row access conditions outside a user OR chain in a count', () => {
    const sql = buildCountStatement(
      buildState({
        whereClauses: OR_CHAIN_WHERE_CLAUSES,
        rowAccessConditions: [ROW_ACCESS_CONDITION],
        includeDeleted: true,
      }),
    );

    expect(sql).toBe(
      `SELECT COUNT(1) AS "count" FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE (("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId)',
    );
  });
});
