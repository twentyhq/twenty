import { FieldMetadataType } from 'twenty-shared/types';

import { TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { buildInsertStatement } from 'src/engine/twenty-orm/sql/utils/build-insert-statement.util';
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
    nameFirstName: buildColumn('nameFirstName'),
    jobTitle: buildColumn('jobTitle'),
  },
  columnNames: ['id', 'nameFirstName', 'jobTitle'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: false,
};

describe('buildInsertStatement', () => {
  it('should build a single-row insert with RETURNING', () => {
    expect(
      buildInsertStatement({
        tableShape: personTableShape,
        columnNames: ['id', 'jobTitle'],
        rows: [
          [
            { kind: 'parameter', parameterName: 'ormInsert_0' },
            { kind: 'parameter', parameterName: 'ormInsert_1' },
          ],
        ],
        returningColumns: ['id', 'jobTitle'],
      }),
    ).toBe(
      `INSERT INTO "${SCHEMA_NAME}"."person" ("id", "jobTitle") ` +
        'VALUES (:ormInsert_0, :ormInsert_1) ' +
        'RETURNING "id", "jobTitle"',
    );
  });

  it('should emit DEFAULT for columns a row omits', () => {
    expect(
      buildInsertStatement({
        tableShape: personTableShape,
        columnNames: ['id', 'jobTitle'],
        rows: [
          [
            { kind: 'parameter', parameterName: 'ormInsert_0' },
            { kind: 'parameter', parameterName: 'ormInsert_1' },
          ],
          [
            { kind: 'parameter', parameterName: 'ormInsert_2' },
            { kind: 'default' },
          ],
        ],
        returningColumns: ['id'],
      }),
    ).toBe(
      `INSERT INTO "${SCHEMA_NAME}"."person" ("id", "jobTitle") ` +
        'VALUES (:ormInsert_0, :ormInsert_1), (:ormInsert_2, DEFAULT) ' +
        'RETURNING "id"',
    );
  });

  it('should omit RETURNING when no columns are requested', () => {
    expect(
      buildInsertStatement({
        tableShape: personTableShape,
        columnNames: ['id'],
        rows: [[{ kind: 'parameter', parameterName: 'ormInsert_0' }]],
        returningColumns: [],
      }),
    ).toBe(
      `INSERT INTO "${SCHEMA_NAME}"."person" ("id") VALUES (:ormInsert_0)`,
    );
  });

  it('should reject an insert with no rows', () => {
    expect(() =>
      buildInsertStatement({
        tableShape: personTableShape,
        columnNames: ['id'],
        rows: [],
        returningColumns: ['id'],
      }),
    ).toThrow(TwentyOrmException);
  });
});
