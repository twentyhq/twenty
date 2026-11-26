import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

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
  unreadableColumnConditions: {},
  unreadableRelationConditions: {},
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
  it('should project a column as null when its unreadable condition holds', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: {
          person: {
            id: ['"person"."ownerId" = :ownerId', '"person"."x" = :x'],
          },
        },
      }),
    );

    expect(sql).toContain(
      'CASE WHEN ("person"."ownerId" = :ownerId) OR ("person"."x" = :x) THEN NULL ELSE "person"."id" END AS',
    );
  });

  it('should read a column selected under its own alias as null', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        extraSelectClauses: [{ expression: '"person"."id"', alias: 'imageId' }],
      }),
    );

    expect(sql).toContain(
      'CASE WHEN ("person"."x" = :x) THEN NULL ELSE "person"."id" END AS "imageId"',
    );
  });

  it('should group an unreadable column by its null value and leave out the rows it is unreadable on', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        extraSelectClauses: [{ expression: '"person"."id"', alias: 'groupId' }],
        groupByExpressions: ['"person"."id"'],
      }),
    );
    const unreadableColumn =
      '(CASE WHEN ("person"."x" = :x) THEN NULL ELSE "person"."id" END)';

    expect(sql).toContain(`${unreadableColumn} AS "groupId"`);
    expect(sql).toContain(`GROUP BY ${unreadableColumn}`);
    expect(sql).toContain('NOT COALESCE(("person"."x" = :x), FALSE)');
  });

  it('should make a condition on an unreadable column unknown on the rows it is unreadable on, order on the null value, and leave row access conditions and string literals alone', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        whereClauses: [
          {
            operator: 'and',
            sql: `"person"."id" = :a AND "person"."name" = '"person"."id"'`,
          },
        ],
        rowAccessConditions: ['"person"."id" = :ownerId'],
        orderByClauses: [{ expression: '"person"."id"', direction: 'ASC' }],
        includeDeleted: true,
      }),
    );
    const unreadableColumn =
      '(CASE WHEN ("person"."x" = :x) THEN NULL ELSE "person"."id" END)';

    expect(sql).toContain(
      `WHERE ((CASE WHEN COALESCE(("person"."x" = :x), FALSE) THEN NULL ELSE ${unreadableColumn} = :a AND "person"."name" = '"person"."id"' END)) AND ("person"."id" = :ownerId)`,
    );
    expect(sql).toContain(`ORDER BY ${unreadableColumn} ASC`);
  });

  it('should keep matching through another condition of an OR when one condition reads an unreadable column', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        whereClauses: [
          {
            operator: 'and',
            isNegated: false,
            clauses: [
              { operator: 'and', sql: '"person"."name" = :name' },
              { operator: 'or', sql: '"person"."id" = :a' },
            ],
          },
        ],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain(
      'WHERE ("person"."name" = :name OR (CASE WHEN COALESCE(("person"."x" = :x), FALSE) THEN NULL ELSE (CASE WHEN ("person"."x" = :x) THEN NULL ELSE "person"."id" END) = :a END))',
    );
    expect(sql).not.toContain('NOT COALESCE');
  });

  it('should keep a negated condition on an unreadable column unknown on the rows it is unreadable on', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        whereClauses: [
          {
            operator: 'and',
            isNegated: true,
            clauses: [{ operator: 'and', sql: '"person"."id" IS NULL' }],
          },
        ],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain(
      'WHERE NOT ((CASE WHEN COALESCE(("person"."x" = :x), FALSE) THEN NULL ELSE (CASE WHEN ("person"."x" = :x) THEN NULL ELSE "person"."id" END) IS NULL END))',
    );
  });

  it('should compare an unreadable column as null in a condition that orders pages', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        whereClauses: [
          {
            operator: 'and',
            isNegated: false,
            shouldReadUnreadableColumnsAsNull: true,
            clauses: [{ operator: 'and', sql: '"person"."id" IS NULL' }],
          },
        ],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain(
      'WHERE ((CASE WHEN ("person"."x" = :x) THEN NULL ELSE "person"."id" END) IS NULL)',
    );
  });

  it('should make a relation filter condition unknown on the related rows its column is unreadable on', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: {
          task: { title: ['"task"."x" = :x'] },
        },
        whereClauses: [{ operator: 'and', sql: '__exists_task__' }],
        existsFilterClauses: [
          {
            token: '__exists_task__',
            alias: 'task',
            parentAlias: 'person',
            relationFieldName: 'tasks',
            targetTableShape: { ...personTableShape, tableName: 'task' },
            correlationCondition: '"task"."personId" = "person"."id"',
            conditionClauses: [
              { operator: 'and', sql: `"task"."title" = 'Secret'` },
            ],
            additionalOnConditions: [],
          },
        ],
        includeDeleted: true,
      }),
    );
    const subquery = sql.slice(sql.indexOf('EXISTS'));

    expect(subquery).toContain(
      `(CASE WHEN COALESCE(("task"."x" = :x), FALSE) THEN NULL ELSE (CASE WHEN ("task"."x" = :x) THEN NULL ELSE "task"."title" END) = 'Secret' END)`,
    );
    expect(sql.slice(0, sql.indexOf('EXISTS'))).not.toContain('CASE WHEN');
  });

  it('should make a relation filter unknown on the rows its relation is unreadable on, and stop its link there', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableRelationConditions: {
          person: { tasks: ['"person"."x" = :x'] },
        },
        whereClauses: [{ operator: 'and', sql: '__exists_task__' }],
        existsFilterClauses: [
          {
            token: '__exists_task__',
            alias: 'task',
            parentAlias: 'person',
            relationFieldName: 'tasks',
            targetTableShape: { ...personTableShape, tableName: 'task' },
            correlationCondition: '"task"."personId" = "person"."id"',
            conditionClauses: [
              { operator: 'and', sql: `"task"."title" = 'Open'` },
            ],
            additionalOnConditions: [],
          },
        ],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain(
      'WHERE (CASE WHEN COALESCE(("person"."x" = :x), FALSE) THEN NULL ELSE EXISTS (',
    );
    expect(sql).toContain(
      'WHERE "task"."personId" = "person"."id" AND NOT COALESCE(("person"."x" = :x), FALSE) AND',
    );
  });

  it('should join nothing from the rows a relation is unreadable on', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableRelationConditions: {
          person: { company: ['"person"."x" = :x'] },
        },
        joinClauses: [
          {
            alias: 'company',
            parentAlias: 'person',
            relationFieldName: 'company',
            targetTableShape: { ...personTableShape, tableName: 'company' },
            relationType: RelationType.MANY_TO_ONE,
            joinType: 'LEFT',
            condition: '"person"."companyId" = "company"."id"',
            additionalOnConditions: [],
          },
        ],
        includeDeleted: true,
      }),
    );

    expect(sql).toContain(
      'LEFT JOIN "workspace_1wgvd1injqtife6y4rvfbu3h5"."company" AS "company" ON ("person"."companyId" = "company"."id") AND (NOT COALESCE(("person"."x" = :x), FALSE))',
    );
  });

  it('should keep every row when only a sort reads an unreadable column', () => {
    const sql = buildSelectStatement(
      buildState({
        unreadableColumnConditions: { person: { id: ['"person"."x" = :x'] } },
        orderByClauses: [{ expression: '"person"."id"', direction: 'ASC' }],
        includeDeleted: true,
      }),
    );

    expect(sql).not.toContain('NOT COALESCE');
  });

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
