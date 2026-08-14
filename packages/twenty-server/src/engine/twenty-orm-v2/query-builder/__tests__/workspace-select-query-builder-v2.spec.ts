import { FieldMetadataType } from 'twenty-shared/types';
import { And, Equal, In, LessThan, Not } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { buildColumnResultAlias } from 'src/engine/twenty-orm-v2/sql/utils/build-column-result-alias.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const buildColumn = (
  columnName: string,
  compositeParentFieldName?: string,
) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: compositeParentFieldName ?? columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
  ...(compositeParentFieldName !== undefined
    ? { compositeParentFieldName }
    : {}),
});

const companyTableShape: WorkspaceTableShape = {
  objectMetadataId: 'company-object-id',
  nameSingular: 'company',
  schemaName: SCHEMA_NAME,
  tableName: 'company',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    name: buildColumn('name'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'name', 'deletedAt'],
  relationShapeByFieldName: {
    person: {
      fieldName: 'person',
      fieldMetadataId: 'field-company',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'person-object-id',
      targetFieldMetadataId: 'field-people',
      joinColumnName: 'personId',
    },
  },
  hasDeletedAtColumn: true,
};

const personTableShape: WorkspaceTableShape = {
  objectMetadataId: 'person-object-id',
  nameSingular: 'person',
  schemaName: SCHEMA_NAME,
  tableName: 'person',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    nameFirstName: buildColumn('nameFirstName', 'name'),
    nameLastName: buildColumn('nameLastName', 'name'),
    companyId: buildColumn('companyId'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: [
    'id',
    'nameFirstName',
    'nameLastName',
    'companyId',
    'deletedAt',
  ],
  relationShapeByFieldName: {
    company: {
      fieldName: 'company',
      fieldMetadataId: 'field-company',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'company-object-id',
      targetFieldMetadataId: 'field-people',
      joinColumnName: 'companyId',
    },
    people: {
      fieldName: 'people',
      fieldMetadataId: 'field-people',
      relationType: RelationType.ONE_TO_MANY,
      targetObjectMetadataId: 'company-object-id',
      targetFieldMetadataId: 'field-company',
    },
  },
  hasDeletedAtColumn: true,
};

const buildQueryBuilder = ({
  rows = [],
  tableShape = personTableShape,
}: {
  rows?: Record<string, unknown>[];
  tableShape?: WorkspaceTableShape;
} = {}) => {
  const executedStatements: CompiledStatement[] = [];

  const queryBuilder = new WorkspaceSelectQueryBuilderV2('person', {
    tableShape,
    executor: {
      execute: async (statement) => {
        executedStatements.push(statement);

        return rows;
      },
    },
    objectRecordsPermissions: {},
    tableShapeByObjectMetadataId: () => companyTableShape,
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

  return { queryBuilder, executedStatements };
};

describe('WorkspaceSelectQueryBuilderV2', () => {
  it('should select the requested columns with alias-prefixed output names', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({
      select: { id: true, nameFirstName: true },
    });

    expect(queryBuilder.getQuery()).toBe(
      'SELECT "person"."id" AS "person_id", "person"."nameFirstName" AS "person_nameFirstName" ' +
        `FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE "person"."deletedAt" IS NULL',
    );
  });

  it('should compile named parameters coming from the shared filter parser', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .andWhere('"person"."nameFirstName" ILIKE :name7f3a', {
        name7f3a: '%ac%',
      });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."nameFirstName" ILIKE $1');
    expect(values).toEqual(['%ac%']);
  });

  it('should add the soft-delete predicate unless withDeleted was called', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    expect(queryBuilder.getQuery()).toContain('"person"."deletedAt" IS NULL');

    queryBuilder.withDeleted();
    expect(queryBuilder.getQuery()).not.toContain(
      '"person"."deletedAt" IS NULL',
    );
  });

  it('should join a to-one relation on its foreign key', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."company" AS "company" ` +
        'ON ("person"."companyId" = "company"."id")',
    );
  });

  it('should render an inner join for a to-one relation', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.innerJoin('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      `INNER JOIN "${SCHEMA_NAME}"."company" AS "company" ` +
        'ON ("person"."companyId" = "company"."id")',
    );
  });

  it('should resolve a join path rooted on a joined alias', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.leftJoin('company.person', 'companyPerson');

    expect(queryBuilder.getQuery()).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."company" AS "companyPerson" ` +
        'ON ("company"."personId" = "companyPerson"."id")',
    );
  });

  it('should reject a join path rooted on an unknown alias', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(() => queryBuilder.leftJoin('unknown.company', 'company')).toThrow(
      TwentyOrmV2Exception,
    );
  });

  it('should report a to-many join to the shared guard rather than rendering it', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.people', 'people');

    expect(queryBuilder.expressionMap.joinAttributes).toEqual([
      {
        alias: { name: 'people' },
        relation: { isOneToMany: true, isManyToMany: false },
      },
    ]);
    expect(() => queryBuilder.getQuery()).toThrow(TwentyOrmV2Exception);
  });

  it('should render a deduped to-many join on the inverse foreign key when the caller opts in', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.people', 'people', undefined, {
      allowToManyJoin: true,
    });

    expect(queryBuilder.getQuery()).toContain(
      `LEFT JOIN (SELECT DISTINCT ON ("personId") * ` +
        `FROM "${SCHEMA_NAME}"."company" ` +
        `WHERE "deletedAt" IS NULL ` +
        `ORDER BY "personId", "id") AS "people" ` +
        'ON ("people"."personId" = "person"."id")',
    );
  });

  it('should emit a plain parameterised LIMIT, with no distinct sub-select', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.limit(31);

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('LIMIT $');
    expect(text).not.toContain('DISTINCT');
    expect(values).toContain(31);
  });

  it('should reuse one statement shape across page sizes and offsets', () => {
    const buildPaginatedQuery = (limit: number, offset: number) => {
      const { queryBuilder } = buildQueryBuilder();

      queryBuilder.setFindOptions({ select: { id: true } });
      queryBuilder.limit(limit);
      queryBuilder.offset(offset);

      return queryBuilder.getQueryAndParameters();
    };

    const [firstText, firstValues] = buildPaginatedQuery(30, 0);
    const [secondText, secondValues] = buildPaginatedQuery(60, 120);

    expect(firstText).toBe(secondText);
    expect(firstValues).toEqual([30, 0]);
    expect(secondValues).toEqual([60, 120]);
  });

  it('should render order by with direction and nulls handling', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.orderBy({
      'person.nameFirstName': { order: 'DESC', nulls: 'NULLS LAST' },
      'company.name': { order: 'ASC' },
    });

    expect(queryBuilder.getQuery()).toContain(
      'ORDER BY "person"."nameFirstName" DESC NULLS LAST, "company"."name" ASC',
    );
  });

  it('should reject a column that does not exist on the object', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { nonExistent: true } });

    expect(() => queryBuilder.getQuery()).toThrow(TwentyOrmV2Exception);
  });

  it('should nest a bracketed condition built by the shared parsers', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.andWhere({
      whereFactory: (nested) => {
        nested.where('"person"."id" = :a', { a: 1 });
        nested.orWhere('"person"."id" = :b', { b: 2 });
      },
    });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('(("person"."id" = $1) OR ("person"."id" = $2))');
    expect(values).toEqual([1, 2]);
  });

  it('should negate a NotBrackets group instead of rendering it as a plain group', () => {
    const { queryBuilder } = buildQueryBuilder();
    const notBrackets = {
      '@instanceof': Symbol.for('NotBrackets'),
      whereFactory: (nested: { where: (sql: string) => unknown }) => {
        nested.where('"person"."nameFirstName" = \'Ada\'');
      },
    };

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.andWhere(notBrackets);

    expect(queryBuilder.getQuery()).toContain(
      'NOT (("person"."nameFirstName" = \'Ada\'))',
    );
  });

  it('should render a plain Brackets group without negation', () => {
    const { queryBuilder } = buildQueryBuilder();
    const brackets = {
      '@instanceof': Symbol.for('Brackets'),
      whereFactory: (nested: { where: (sql: string) => unknown }) => {
        nested.where('"person"."nameFirstName" = \'Ada\'');
      },
    };

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.andWhere(brackets);

    expect(queryBuilder.getQuery()).not.toContain('NOT (');
  });

  it('should select only aggregate expressions after select([])', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true, nameFirstName: true } });
    queryBuilder.select([]);
    queryBuilder.addSelect('COUNT("person"."id")', 'totalCount');

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('SELECT COUNT("person"."id") AS "totalCount" FROM');
    expect(sql).not.toContain('"person"."nameFirstName"');
  });

  it('should count columns referenced only inside aggregates as selected', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.addSelect('MAX("person"."nameFirstName")', 'maxFirstName');

    expect(queryBuilder.getSelectedColumnNames()).toContain('nameFirstName');
  });

  it('should keep an explicit empty selection on a clone', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.select([]);
    queryBuilder.addSelect('COUNT("person"."id")', 'totalCount');

    expect(queryBuilder.clone().getQuery()).not.toContain('"person"."id" AS');
  });

  it('should carry applied row-level markers onto a clone', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(queryBuilder.markRowLevelPermissionApplied('person')).toBe(true);
    expect(queryBuilder.clone().markRowLevelPermissionApplied('person')).toBe(
      false,
    );
  });

  it('should clear applied row-level markers when where() replaces the WHERE', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.markRowLevelPermissionApplied('person');
    queryBuilder.where('"person"."id" = :id', { id: 1 });

    expect(queryBuilder.markRowLevelPermissionApplied('person')).toBe(true);
  });

  it('should report joined-alias columns referenced only in order by', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.orderBy({ 'company.name': { order: 'ASC' } });

    const columnNamesByAlias = queryBuilder.getReferencedColumnNamesByAlias();

    expect(columnNamesByAlias['person']).toEqual(['id']);
    expect(columnNamesByAlias['company']).toEqual(['name']);
  });

  it('should report joined-alias columns referenced only in an added select', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addSelect('"company"."name"', 'company_name');

    expect(queryBuilder.getReferencedColumnNamesByAlias()['company']).toEqual([
      'name',
    ]);
  });

  it('should quote bare alias.column references in raw where SQL', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.where('company.name = :name', { name: 'Acme' });
    queryBuilder.andWhere('person.id IN (:...ids)', { ids: ['a'] });

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('("company"."name" = :name)');
    expect(sql).toContain('("person"."id" IN (:...ids))');
  });

  it('should quote bare alias.column references inside select and order expressions', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addSelect('MAX(company.name)', 'max_name');
    queryBuilder.groupBy('person.id');
    queryBuilder.addOrderBy('MIN(company.name)', 'ASC');

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('MAX("company"."name") AS "max_name"');
    expect(sql).toContain('ORDER BY MIN("company"."name") ASC');
  });

  it('should attribute aggregate references over a joined alias to that alias', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addSelect('MAX(company.name)', 'max_name');

    expect(queryBuilder.getReferencedColumnNamesByAlias()['company']).toEqual([
      'name',
    ]);
  });

  it('should keep the soft-delete predicate outside an OR chain', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.where('"person"."id" = :a', { a: 1 });
    queryBuilder.orWhere('"person"."id" = :b', { b: 2 });

    expect(queryBuilder.getQuery()).toContain(
      'WHERE (("person"."id" = :a) OR ("person"."id" = :b)) AND "person"."deletedAt" IS NULL',
    );
  });

  it('should filter soft-deleted joined rows in the ON clause', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('("company"."deletedAt" IS NULL)');
    expect(sql.indexOf('"company"."deletedAt"')).toBeLessThan(
      sql.indexOf('WHERE'),
    );
  });

  it('should add a joined predicate to ON rather than WHERE', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addJoinCondition('company', '"company"."name" = :owner');
    queryBuilder.setParameters({ owner: 'Acme' });

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('("company"."name" = :owner)');
    expect(sql.indexOf('"company"."name"')).toBeLessThan(sql.indexOf('WHERE'));
  });

  it('should restore the previous limit when getOne fails', async () => {
    const failingBuilder = new WorkspaceSelectQueryBuilderV2('person', {
      tableShape: personTableShape,
      executor: {
        execute: async () => {
          throw new Error('connection lost');
        },
      },
      objectRecordsPermissions: {},
      tableShapeByObjectMetadataId: () => companyTableShape,
      onBeforeExecute: () => undefined,
      formatResult: (records) => records as never,
    });

    failingBuilder.setFindOptions({ select: { id: true } });
    failingBuilder.limit(25);

    await expect(failingBuilder.getOne()).rejects.toThrow('connection lost');
    expect(failingBuilder.getQueryAndParameters()[1]).toEqual([25]);
  });

  it('should not attribute a joined column to the main alias', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addSelect('"company"."name"', 'company_name');

    const columnNamesByAlias = queryBuilder.getReferencedColumnNamesByAlias();

    expect(columnNamesByAlias['person']).toEqual(['id']);
    expect(columnNamesByAlias['company']).toEqual(['name']);
  });

  it('should keep joined row-level markers when where() replaces the WHERE', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.markRowLevelPermissionApplied('person');
    queryBuilder.markRowLevelPermissionApplied('company');
    queryBuilder.where('"person"."id" = :id', { id: 1 });

    expect(queryBuilder.markRowLevelPermissionApplied('person')).toBe(true);
    expect(queryBuilder.markRowLevelPermissionApplied('company')).toBe(false);
  });

  it('should strip the alias prefix when mapping rows back to records', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [
        {
          person_id: 'person-1',
          person_nameFirstName: 'Ada',
          company_name: 'Acme',
        },
      ],
    });

    queryBuilder.setFindOptions({ select: { id: true, nameFirstName: true } });

    const records = await queryBuilder.getMany();

    expect(records).toEqual([{ id: 'person-1', nameFirstName: 'Ada' }]);
  });

  it('should not widen the projection when a relation is joined', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      'SELECT "person"."id" AS "person_id" FROM',
    );
  });

  it('should keep result aliases within the postgres identifier limit', async () => {
    const longColumnName = `veryLongSubfield${'X'.repeat(60)}`;
    const otherLongColumnName = `veryLongSubfield${'Y'.repeat(60)}`;
    const resultAlias = buildColumnResultAlias('person', longColumnName);
    const otherResultAlias = buildColumnResultAlias(
      'person',
      otherLongColumnName,
    );

    const { queryBuilder } = buildQueryBuilder({
      tableShape: {
        ...personTableShape,
        columnShapeByColumnName: {
          ...personTableShape.columnShapeByColumnName,
          [longColumnName]: buildColumn(longColumnName),
          [otherLongColumnName]: buildColumn(otherLongColumnName),
        },
      },
      rows: [{ [resultAlias]: 'left', [otherResultAlias]: 'right' }],
    });

    queryBuilder.setFindOptions({
      select: { [longColumnName]: true, [otherLongColumnName]: true },
    });

    expect(resultAlias.length).toBeLessThanOrEqual(63);
    expect(resultAlias).not.toBe(otherResultAlias);
    expect(queryBuilder.getQuery()).toContain(
      `"person"."${longColumnName}" AS "${resultAlias}"`,
    );
    await expect(queryBuilder.getMany()).resolves.toEqual([
      { [longColumnName]: 'left', [otherLongColumnName]: 'right' },
    ]);
  });

  it('should refuse a caller parameter that collides with a reserved name', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(() =>
      queryBuilder.andWhere('"person"."id" = :ormV2Limit', { ormV2Limit: 1 }),
    ).toThrow(TwentyOrmV2Exception);
  });

  it('should report the columns it selected so permissions do not have to parse SQL', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true, companyId: true } });

    expect(queryBuilder.getSelectedColumnNames()).toEqual(['id', 'companyId']);
  });

  it('should keep a clone independent of the builder it came from', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });

    const clone = queryBuilder.clone();

    clone.andWhere('"person"."id" = :id', { id: 1 });

    expect(queryBuilder.getQuery()).not.toContain('"person"."id" = :id');
    expect(clone.getQuery()).toContain('"person"."id" = :id');
  });

  it('should send one parameterised statement to the executor', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .andWhere('"person"."nameFirstName" = :name', { name: 'Ada' });

    await queryBuilder.getMany();

    expect(executedStatements).toHaveLength(1);
    expect(executedStatements[0].text).toContain('$1');
    expect(executedStatements[0].values).toEqual(['Ada']);
  });

  it('should map take and skip to LIMIT and OFFSET parameters', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .take(31)
      .skip(60);

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('LIMIT $1');
    expect(text).toContain('OFFSET $2');
    expect(values).toEqual([31, 60]);
  });

  it('should build a COUNT statement that ignores projection, order and pagination', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder({
      rows: [{ count: '7' }],
    });

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .orderBy('"person"."id"', 'ASC')
      .take(10);

    const count = await queryBuilder.getCount();

    expect(count).toBe(7);
    expect(executedStatements[0].text).toBe(
      'SELECT COUNT(1) AS "count" ' +
        `FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE "person"."deletedAt" IS NULL',
    );
  });

  it('should render an object-literal where with In as a bound IN clause', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ id: In(['a', 'b']) });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."id" IN ($1, $2)');
    expect(values).toEqual(['a', 'b']);
  });

  it('should allocate unique parameter names across object-literal where clauses', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ id: In(['a']) })
      .andWhere({ companyId: In(['b']) });

    const [, values] = queryBuilder.getQueryAndParameters();

    expect(values).toEqual(['a', 'b']);
  });

  it('should reject an object-literal where on an unknown column', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(() => queryBuilder.where({ missing: In(['x']) })).toThrow(
      TwentyOrmV2Exception,
    );
  });

  it('should render comparison operators in an object-literal where', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.where({ nameFirstName: LessThan('x') });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."nameFirstName" < $1');
    expect(values).toContain('x');
  });

  it('should combine operators with And', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.where({ nameFirstName: And(LessThan('z'), Not(Equal('a'))) });

    const [text] = queryBuilder.getQueryAndParameters();

    expect(text).toContain(
      '("person"."nameFirstName" < $1 AND NOT ("person"."nameFirstName" = $2))',
    );
  });

  it('should negate a nested operator with Not', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.where({ id: Not(In(['a', 'b'])) });

    const [text] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('NOT ("person"."id" IN ($1, $2))');
  });

  it('should treat a plain value in an object-literal where as equality', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ companyId: 'company-1' });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('("person"."companyId" = $1)');
    expect(values).toEqual(['company-1']);
  });

  it('should treat the Equal operator in an object-literal where as equality', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ companyId: Equal('company-1') });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('("person"."companyId" = $1)');
    expect(values).toEqual(['company-1']);
  });

  it('should treat a null value in an object-literal where as IS NULL', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ companyId: null });

    expect(queryBuilder.getQuery()).toContain('("person"."companyId" IS NULL)');
  });

  it('should emit a GROUP BY with aggregate and grouped columns', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .select([])
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect('"person"."companyId"', 'companyId')
      .groupBy('"person"."companyId"');

    expect(queryBuilder.getQuery()).toBe(
      'SELECT COUNT(*) AS "totalCount", "person"."companyId" AS "companyId" ' +
        `FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE "person"."deletedAt" IS NULL ' +
        'GROUP BY "person"."companyId"',
    );
  });

  it('should append additional GROUP BY expressions with addGroupBy', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .select([])
      .addSelect('COUNT(*)', 'totalCount')
      .groupBy('"person"."companyId"')
      .addGroupBy('"person"."nameFirstName"');

    expect(queryBuilder.getQuery()).toContain(
      'GROUP BY "person"."companyId", "person"."nameFirstName"',
    );
  });

  it('should return every raw row from getRawMany', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder({
      rows: [
        { companyId: 'c1', totalCount: '3' },
        { companyId: 'c2', totalCount: '1' },
      ],
    });

    queryBuilder
      .select([])
      .addSelect('COUNT(*)', 'totalCount')
      .addSelect('"person"."companyId"', 'companyId')
      .groupBy('"person"."companyId"');

    const rows = await queryBuilder.getRawMany();

    expect(rows).toEqual([
      { companyId: 'c1', totalCount: '3' },
      { companyId: 'c2', totalCount: '1' },
    ]);
    expect(executedStatements[0].text).toContain(
      'GROUP BY "person"."companyId"',
    );
  });
});
