import { buildQueryBuilder } from 'src/engine/twenty-orm-v2/query-builder/__tests__/workspace-select-query-builder-v2-test-shapes.util';

describe('WorkspaceSelectQueryBuilderV2 order, group and distinct', () => {
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

  it('should render a DISTINCT ON clause with normalised columns', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.distinctOn(['company.name', 'nameFirstName']);

    expect(queryBuilder.getQuery()).toContain(
      'SELECT DISTINCT ON ("company"."name", "person"."nameFirstName") ',
    );
  });

  it('should order by an added-select alias without qualifying it', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.addSelect('MAX("person"."nameFirstName")', 'max_first_name');
    queryBuilder.groupBy('person.companyId');
    queryBuilder.orderBy('max_first_name', 'DESC');

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('ORDER BY "max_first_name" DESC');
    expect(sql).not.toContain('"person"."max_first_name"');
  });

  it('should not report an added-select order-by alias as a selected column', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.select([]);
    queryBuilder.addSelect('MAX("person"."nameFirstName")', 'max_first_name');
    queryBuilder.orderBy('max_first_name', 'DESC');

    expect(queryBuilder.getReferencedColumnNamesByAlias()['person']).toEqual([
      'nameFirstName',
    ]);
  });

  it('should report distinct-on columns as referenced for permissions', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.distinctOn(['company.name']);

    expect(queryBuilder.getReferencedColumnNamesByAlias()['company']).toEqual([
      'name',
    ]);
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

  it('should not attribute a joined column to the main alias', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.addSelect('"company"."name"', 'company_name');

    const columnNamesByAlias = queryBuilder.getReferencedColumnNamesByAlias();

    expect(columnNamesByAlias['person']).toEqual(['id']);
    expect(columnNamesByAlias['company']).toEqual(['name']);
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
        `FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."person" AS "person" ` +
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
});
