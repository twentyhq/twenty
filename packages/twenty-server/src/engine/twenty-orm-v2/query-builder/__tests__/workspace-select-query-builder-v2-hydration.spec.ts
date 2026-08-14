import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import {
  SCHEMA_NAME,
  buildQueryBuilder,
} from 'src/engine/twenty-orm-v2/query-builder/__tests__/workspace-select-query-builder-v2-test-shapes.util';

describe('WorkspaceSelectQueryBuilderV2 joined hydration', () => {
  it('should project every joined column for a leftJoinAndSelect', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoinAndSelect('person.company', 'company');

    const sql = queryBuilder.getQuery();

    expect(sql).toContain(
      '"company"."id" AS "company_id", "company"."name" AS "company_name", ' +
        '"company"."deletedAt" AS "company_deletedAt"',
    );
    expect(sql).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."company" AS "company" ` +
        'ON ("person"."companyId" = "company"."id")',
    );
  });

  it('should render an inner join for an innerJoinAndSelect', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.innerJoinAndSelect('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      `INNER JOIN "${SCHEMA_NAME}"."company" AS "company"`,
    );
  });

  it('should hydrate joined columns under the relation property', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [
        {
          person_id: 'person-1',
          company_id: 'company-1',
          company_name: 'Acme',
          company_deletedAt: null,
        },
      ],
    });

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoinAndSelect('person.company', 'company');

    await expect(queryBuilder.getMany()).resolves.toEqual([
      {
        id: 'person-1',
        company: { id: 'company-1', name: 'Acme', deletedAt: null },
      },
    ]);
  });

  it('should hydrate an unmatched left-joined relation as null', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [
        {
          person_id: 'person-1',
          company_id: null,
          company_name: null,
          company_deletedAt: null,
        },
      ],
    });

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoinAndSelect('person.company', 'company');

    await expect(queryBuilder.getMany()).resolves.toEqual([
      { id: 'person-1', company: null },
    ]);
  });

  it('should hydrate a partial relation column selected without an output alias', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [{ person_id: 'person-1', company_name: 'Acme' }],
    });

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.addSelect('company.name');
    queryBuilder.leftJoin('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      '"company"."name" AS "company_name"',
    );
    await expect(queryBuilder.getMany()).resolves.toEqual([
      { id: 'person-1', company: { name: 'Acme' } },
    ]);
  });

  it('should keep a partial relation object whose only selected column is null', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [{ person_id: 'person-1', company_name: null }],
    });

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.addSelect('company.name');
    queryBuilder.leftJoin('person.company', 'company');

    await expect(queryBuilder.getMany()).resolves.toEqual([
      { id: 'person-1', company: { name: null } },
    ]);
  });

  it('should keep an aliased relation column selection as raw output', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [{ person_id: 'person-1', companyName: 'Acme' }],
    });

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addSelect('company.name', 'companyName');

    expect(queryBuilder.getQuery()).toContain(
      '"company"."name" AS "companyName"',
    );
    await expect(queryBuilder.getMany()).resolves.toEqual([{ id: 'person-1' }]);
  });

  it('should reject a partial selection on an unknown alias or column', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');

    queryBuilder.addSelect('unknown.name');
    expect(() => queryBuilder.getQuery()).toThrow(TwentyOrmV2Exception);
  });

  it('should report joined projections and every joined alias for permissions', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoinAndSelect('person.company', 'company');
    queryBuilder.leftJoin('person.people', 'people');

    const columnNamesByAlias = queryBuilder.getReferencedColumnNamesByAlias();

    expect(columnNamesByAlias['company']).toEqual(['id', 'name', 'deletedAt']);
    expect(columnNamesByAlias['people']).toEqual([]);
  });

  it('should still reject a to-many joinAndSelect for an entity-hydrating read', async () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoinAndSelect('person.people', 'people');

    await expect(queryBuilder.getMany()).rejects.toThrow(TwentyOrmV2Exception);
  });

  it('should render an added join condition on a selected inner join', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.innerJoinAndSelect('person.company', 'company');
    queryBuilder.addJoinCondition('company', '"company"."name" = :rlsName');
    queryBuilder.setParameters({ rlsName: 'Acme' });

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('("company"."name" = :rlsName)');
    expect(sql.indexOf('"company"."name" = :rlsName')).toBeLessThan(
      sql.indexOf('WHERE'),
    );
  });
});
