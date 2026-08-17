import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import {
  SCHEMA_NAME,
  buildQueryBuilder,
} from 'src/engine/twenty-orm-v2/query-builder/__tests__/workspace-select-query-builder-v2-test-shapes.util';

describe('WorkspaceSelectQueryBuilderV2 joins', () => {
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

  it('should reject a join alias that collides with the main alias', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(() => queryBuilder.leftJoin('person.company', 'person')).toThrow(
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

  it('should render a plain to-many join for a raw read', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.addSelect('person.id', 'id');
    queryBuilder.innerJoin('person.people', 'people');

    await queryBuilder.getRawMany();

    expect(executedStatements[0].text).toContain(
      `INNER JOIN "${SCHEMA_NAME}"."company" AS "people" ` +
        'ON ("people"."personId" = "person"."id") AND ("people"."deletedAt" IS NULL)',
    );
  });

  it('should render a plain to-many left join for a raw read', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.addSelect('person.id', 'id');
    queryBuilder.leftJoin('person.people', 'people');

    await queryBuilder.getRawMany();

    expect(executedStatements[0].text).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."company" AS "people" ` +
        'ON ("people"."personId" = "person"."id")',
    );
  });

  it('should still reject a plain to-many join for an entity-hydrating read', async () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.people', 'people');

    await expect(queryBuilder.getMany()).rejects.toThrow(TwentyOrmV2Exception);
    await expect(queryBuilder.getOne()).rejects.toThrow(TwentyOrmV2Exception);
  });

  it('should reject a to-many join with an explicit condition for an entity-hydrating read', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin(
      'person.people',
      'people',
      '"people"."personId" = "person"."id"',
    );

    await expect(queryBuilder.getMany()).rejects.toThrow(TwentyOrmV2Exception);

    queryBuilder.select([]);
    queryBuilder.addSelect('person.id', 'id');
    await queryBuilder.getRawMany();

    expect(executedStatements[0].text).toContain(
      'ON ("people"."personId" = "person"."id")',
    );
  });

  it('should count distinct main records when a to-many join multiplies rows', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder({
      rows: [{ count: '3' }],
    });

    queryBuilder.innerJoin('person.people', 'people');
    queryBuilder.where('people.name = :name', { name: 'Acme' });
    queryBuilder.groupBy('person.id');

    const count = await queryBuilder.getCount();

    expect(count).toBe(3);
    expect(executedStatements[0].text).toContain(
      'SELECT COUNT(DISTINCT "person"."id") AS "count"',
    );
    expect(executedStatements[0].text).toContain(
      `INNER JOIN "${SCHEMA_NAME}"."company" AS "people"`,
    );
    expect(executedStatements[0].text).not.toContain('GROUP BY');
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

  it('should render an added join condition on a plain to-many join', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.addSelect('person.id', 'id');
    queryBuilder.innerJoin('person.people', 'people');
    queryBuilder.addJoinCondition('people', '"people"."name" = :ownerName');
    queryBuilder.setParameters({ ownerName: 'Acme' });

    await queryBuilder.getRawMany();

    expect(executedStatements[0].text).toContain(
      '("people"."personId" = "person"."id") AND ("people"."name" = $1)',
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

  it('should not widen the projection when a relation is joined', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      'SELECT "person"."id" AS "person_id" FROM',
    );
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

  it('should keep joined row-level markers when where() replaces the WHERE', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.markRowLevelPermissionApplied('person');
    queryBuilder.markRowLevelPermissionApplied('company');
    queryBuilder.where('"person"."id" = :id', { id: 1 });

    expect(queryBuilder.markRowLevelPermissionApplied('person')).toBe(true);
    expect(queryBuilder.markRowLevelPermissionApplied('company')).toBe(false);
  });
});
