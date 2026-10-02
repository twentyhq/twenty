import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildMutationStatement,
  type MutationStatementState,
} from 'src/engine/twenty-orm/sql/utils/build-mutation-statement.util';
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
    jobTitle: buildColumn('jobTitle'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'jobTitle', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const buildState = (
  overrides: Partial<MutationStatementState> = {},
): MutationStatementState => ({
  alias: 'person',
  tableShape: personTableShape,
  kind: 'update',
  setClauses: [{ columnName: 'jobTitle', valueExpression: ':jobTitle' }],
  whereClauses: [
    { operator: 'and', sql: '("person"."id" = :a)' },
    { operator: 'or', sql: '("person"."id" = :b)' },
  ],
  rowAccessConditions: ['"person"."ownerId" = :ownerId'],
  includeDeleted: false,
  returningColumns: [],
  ...overrides,
});

describe('buildMutationStatement', () => {
  it('should keep row access conditions outside a user OR chain on an update', () => {
    expect(buildMutationStatement(buildState())).toBe(
      `UPDATE "${SCHEMA_NAME}"."person" AS "person" SET "jobTitle" = :jobTitle ` +
        'WHERE (("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId)',
    );
  });

  it('should keep row access conditions outside a user OR chain on a delete', () => {
    expect(
      buildMutationStatement(buildState({ kind: 'delete', setClauses: [] })),
    ).toBe(
      `DELETE FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE (("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId)',
    );
  });

  it('should keep the live-row predicate outside the guarded expression on a soft delete', () => {
    expect(
      buildMutationStatement(
        buildState({
          kind: 'soft-delete',
          setClauses: [
            { columnName: 'deletedAt', valueExpression: 'CURRENT_TIMESTAMP' },
          ],
        }),
      ),
    ).toContain(
      'WHERE ((("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."ownerId" = :ownerId)) AND "person"."deletedAt" IS NULL',
    );
  });

  it('should render row access conditions alone when there is no user where', () => {
    expect(
      buildMutationStatement(
        buildState({ kind: 'delete', setClauses: [], whereClauses: [] }),
      ),
    ).toBe(
      `DELETE FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE ("person"."ownerId" = :ownerId)',
    );
  });
});
