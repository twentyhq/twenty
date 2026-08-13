import { FieldMetadataType } from 'twenty-shared/types';
import { In } from 'typeorm';

import { applyFindOptionsToQueryBuilder } from 'src/engine/twenty-orm-v2/query-builder/utils/apply-find-options.util';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const SCHEMA_NAME = 'workspace_test';

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
    name: buildColumn('name'),
    companyId: buildColumn('companyId'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'name', 'companyId', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const buildQueryBuilder = () =>
  new WorkspaceSelectQueryBuilderV2('person', {
    tableShape: personTableShape,
    executor: { execute: async () => [] },
    objectRecordsPermissions: {},
    tableShapeByObjectMetadataId: () => personTableShape,
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

describe('applyFindOptionsToQueryBuilder', () => {
  it('returns the query builder unchanged when no options are given', () => {
    const queryBuilder = buildQueryBuilder();

    expect(applyFindOptionsToQueryBuilder(queryBuilder)).toBe(queryBuilder);
    expect(queryBuilder.getQuery()).toContain(
      `FROM "${SCHEMA_NAME}"."person" AS "person" WHERE "person"."deletedAt" IS NULL`,
    );
  });

  it('applies an equality where as an AND condition', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      where: { name: 'Twenty' },
    });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."name" = $1');
    expect(text).toContain('"person"."deletedAt" IS NULL');
    expect(values).toContain('Twenty');
  });

  it('applies an In operator as an IN clause', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      where: { id: In(['a', 'b']) },
    });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."id" IN ($1, $2)');
    expect(values).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('renders a null where value as IS NULL', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      where: { companyId: null },
    });

    expect(queryBuilder.getQuery()).toContain('"person"."companyId" IS NULL');
  });

  it('treats a where array as a bracketed OR so an ANDed predicate covers all branches', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      where: [{ name: 'A' }, { name: 'B' }],
    });

    const [text] = queryBuilder.getQueryAndParameters();

    // The disjunction is grouped, then the soft-delete predicate is ANDed onto
    // the whole group rather than only the first branch.
    expect(text).toContain(
      '((("person"."name" = $1) OR ("person"."name" = $2))) AND "person"."deletedAt" IS NULL',
    );
  });

  it('normalizes an array select into the builder column map', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      select: ['id', 'name'],
    });

    expect(queryBuilder.getQuery()).toContain(
      'SELECT "person"."id" AS "person_id", "person"."name" AS "person_name"',
    );
  });

  it('applies select, order, take and skip', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      select: { id: true, name: true },
      order: { name: 'DESC' },
      take: 10,
      skip: 5,
    });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain(
      'SELECT "person"."id" AS "person_id", "person"."name" AS "person_name"',
    );
    expect(text).toContain('ORDER BY "person"."name" DESC');
    expect(text).toContain('LIMIT $');
    expect(text).toContain('OFFSET $');
    expect(values).toEqual(expect.arrayContaining([10, 5]));
  });

  it('drops the soft-delete predicate when withDeleted is set', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      withDeleted: true,
    });

    expect(queryBuilder.getQuery()).not.toContain(
      '"person"."deletedAt" IS NULL',
    );
  });

  it('ignores relations in the base query (the repository loads them separately)', () => {
    const queryBuilder = applyFindOptionsToQueryBuilder(buildQueryBuilder(), {
      where: { id: 'x' },
      relations: { company: true },
    });

    expect(queryBuilder.getQuery()).not.toContain('JOIN');
    expect(queryBuilder.getQuery()).toContain('"person"."id" =');
  });
});
