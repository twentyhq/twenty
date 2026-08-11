import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { compileNamedParameters } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

// Values must never reach the SQL text and identifiers must never break out of their
// quotes. Asserting on the emitted statement rather than on the escaping helper is what
// makes this a regression net: a future code path that interpolates a value fails here.
const HOSTILE_VALUES = [
  "'; DROP TABLE company; --",
  "1' OR '1'='1",
  'Robert"); DROP TABLE person; --',
  "\\'; SELECT pg_sleep(10); --",
];

const HOSTILE_IDENTIFIERS = [
  'name" , (SELECT pg_sleep(10)) AS "x',
  'name"; DROP TABLE company; --',
  'name") OR 1=1 --',
];

const SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const buildColumn = (columnName: string) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
});

const buildTableShape = (columnNames: string[]): WorkspaceTableShape => ({
  objectMetadataId: 'person-object-id',
  nameSingular: 'person',
  schemaName: SCHEMA_NAME,
  tableName: 'person',
  columnShapeByColumnName: Object.fromEntries(
    columnNames.map((columnName) => [columnName, buildColumn(columnName)]),
  ),
  columnNames,
  relationShapeByFieldName: {},
  fieldIdByName: {},
  fieldIdByJoinColumnName: {},
  hasDeletedAtColumn: columnNames.includes('deletedAt'),
});

const buildQueryBuilder = (columnNames = ['id', 'name', 'deletedAt']) =>
  new WorkspaceSelectQueryBuilderV2('person', {
    tableShape: buildTableShape(columnNames),
    executor: { execute: async () => [] },
    objectRecordsPermissions: {},
    tableShapeByObjectMetadataId: () => buildTableShape(columnNames),
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

describe('ORM v2 SQL injection invariants', () => {
  describe('values', () => {
    it.each(HOSTILE_VALUES)(
      'should bind %j as a parameter instead of writing it into the SQL text',
      (hostileValue) => {
        const queryBuilder = buildQueryBuilder();

        queryBuilder.where('"person"."name" = :name', { name: hostileValue });

        const [text, values] = queryBuilder.getQueryAndParameters();

        expect(text).not.toContain(hostileValue);
        expect(text).toContain('$1');
        expect(values).toContain(hostileValue);
      },
    );

    it('should bind every element of a spread list rather than inlining any of them', () => {
      const queryBuilder = buildQueryBuilder();

      queryBuilder.where('"person"."id" IN (:...ids)', { ids: HOSTILE_VALUES });

      const [text, values] = queryBuilder.getQueryAndParameters();

      for (const hostileValue of HOSTILE_VALUES) {
        expect(text).not.toContain(hostileValue);
        expect(values).toContain(hostileValue);
      }
    });

    it('should bind a value that looks like a placeholder', () => {
      const compiled = compileNamedParameters('"person"."name" = :name', {
        name: '$1',
      });

      expect(compiled.text).toBe('"person"."name" = $1');
      expect(compiled.values).toEqual(['$1']);
    });

    it('should never emit a quote character that came from a value', () => {
      const compiled = compileNamedParameters(
        '"person"."name" = :name AND "person"."id" = :id',
        { name: "o'brien\"; --", id: "'; DROP TABLE person; --" },
      );

      expect(compiled.text).toBe(
        '"person"."name" = $1 AND "person"."id" = $2',
      );
      expect(compiled.values).toEqual([
        "o'brien\"; --",
        "'; DROP TABLE person; --",
      ]);
    });
  });

  describe('identifiers', () => {
    it.each(HOSTILE_IDENTIFIERS)(
      'should keep %j inside one quoted identifier',
      (hostileIdentifier) => {
        const queryBuilder = buildQueryBuilder([
          'id',
          hostileIdentifier,
          'deletedAt',
        ]);

        queryBuilder.setFindOptions({
          select: { [hostileIdentifier]: true },
        });

        const sql = queryBuilder.getQuery();

        expect(sql).toContain(`"${hostileIdentifier.replace(/"/g, '""')}"`);

        // The payload may appear inside a quoted identifier, where it is just a
        // column name. What matters is that none of it survives outside one, so
        // strip every quoted identifier and assert the skeleton stays clean.
        const sqlOutsideIdentifiers = sql.replace(/"(?:[^"]|"")*"/g, '""');

        expect(sqlOutsideIdentifiers).not.toMatch(
          /pg_sleep|DROP TABLE|OR 1=1|--/,
        );
      },
    );

    it('should reject a null byte in an identifier rather than emit it', () => {
      const queryBuilder = buildQueryBuilder(['id', 'na\u0000me', 'deletedAt']);

      queryBuilder.setFindOptions({ select: { 'na\u0000me': true } });

      expect(() => queryBuilder.getQuery()).toThrow(
        'Null bytes are not allowed in PostgreSQL identifiers',
      );
    });
  });
});
