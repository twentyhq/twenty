import {
  applyRowAccessCondition,
  buildQueryBuilder,
} from 'src/engine/twenty-orm/query-builder/__tests__/workspace-select-query-builder-test-shapes.util';

const GUARDED_OR_CHAIN =
  '(("person"."id" = :a) OR ("person"."id" = :b)) AND ("person"."companyId" = :rowAccessCompanyId)';

const countOccurrences = (text: string, searched: string): number =>
  text.split(searched).length - 1;

const buildRowAccessQueryBuilder = () => {
  const built = buildQueryBuilder({ onBeforeExecute: applyRowAccessCondition });

  built.queryBuilder.setFindOptions({ select: { id: true } });

  return built;
};

describe('WorkspaceSelectQueryBuilder row access conditions', () => {
  it('should not let an orWhere bypass the row access condition', async () => {
    const { queryBuilder, executedStatements } = buildRowAccessQueryBuilder();

    await queryBuilder
      .where('"person"."id" = :a', { a: 1 })
      .orWhere('"person"."id" = :b', { b: 2 })
      .getMany();

    expect(executedStatements[0].text).toContain(
      'WHERE ((("person"."id" = $1) OR ("person"."id" = $2)) AND ("person"."companyId" = $3)) AND "person"."deletedAt" IS NULL',
    );
    expect(executedStatements[0].values).toEqual([1, 2, 'company-1']);
  });

  it('should keep an orWhere added after the policy was applied inside the guarded expression', () => {
    const { queryBuilder } = buildRowAccessQueryBuilder();

    queryBuilder
      .where('"person"."id" = :a', { a: 1 })
      .applyRowLevelPermissions()
      .orWhere('"person"."id" = :b', { b: 2 });

    expect(queryBuilder.getQuery()).toContain(GUARDED_OR_CHAIN);
  });

  it('should guard a count', async () => {
    const { queryBuilder, executedStatements } = buildRowAccessQueryBuilder();

    await queryBuilder
      .where('"person"."id" = :a', { a: 1 })
      .orWhere('"person"."id" = :b', { b: 2 })
      .getCount();

    expect(executedStatements[0].text).toContain(
      '(("person"."id" = $1) OR ("person"."id" = $2)) AND ("person"."companyId" = $3)',
    );
  });

  it('should guard a mutation built from the select builder', () => {
    const { queryBuilder } = buildRowAccessQueryBuilder();

    const mutationQueryBuilder = queryBuilder
      .where('"person"."id" = :a', { a: 1 })
      .orWhere('"person"."id" = :b', { b: 2 })
      .applyRowLevelPermissions()
      .delete();

    expect(mutationQueryBuilder.getQuery()).toBe(
      `DELETE FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."person" AS "person" WHERE ${GUARDED_OR_CHAIN}`,
    );
  });

  it('should carry the row access condition onto a clone without applying it twice', async () => {
    const { queryBuilder, executedStatements } = buildRowAccessQueryBuilder();

    queryBuilder
      .where('"person"."id" = :a', { a: 1 })
      .applyRowLevelPermissions();

    await queryBuilder
      .clone()
      .orWhere('"person"."id" = :b', { b: 2 })
      .getMany();

    expect(executedStatements[0].text).toContain(
      '(("person"."id" = $1) OR ("person"."id" = $2)) AND ("person"."companyId" = $3)',
    );
    expect(
      countOccurrences(executedStatements[0].text, '"person"."companyId"'),
    ).toBe(1);
  });

  it('should re-apply the row access condition exactly once after where() replaces the WHERE', async () => {
    const { queryBuilder, executedStatements } = buildRowAccessQueryBuilder();

    await queryBuilder.where('"person"."id" = :a', { a: 1 }).getMany();
    await queryBuilder
      .where('"person"."id" = :b', { b: 2 })
      .orWhere('"person"."id" = :c', { c: 3 })
      .getMany();

    expect(executedStatements[1].text).toContain(
      '(("person"."id" = $1) OR ("person"."id" = $2)) AND ("person"."companyId" = $3)',
    );
    expect(
      countOccurrences(executedStatements[1].text, '"person"."companyId"'),
    ).toBe(1);
  });

  it('should carry the row access condition into a builder that copies the where clauses', () => {
    const { queryBuilder } = buildRowAccessQueryBuilder();
    const { queryBuilder: snapshotQueryBuilder } = buildQueryBuilder();

    queryBuilder
      .where('"person"."id" = :a', { a: 1 })
      .orWhere('"person"."id" = :b', { b: 2 })
      .applyRowLevelPermissions();

    snapshotQueryBuilder
      .setFindOptions({ select: { id: true } })
      .withDeleted()
      .copyWhereFrom(queryBuilder);

    expect(snapshotQueryBuilder.getQuery()).toContain(
      `WHERE ${GUARDED_OR_CHAIN}`,
    );
    expect(snapshotQueryBuilder.getParameters()).toMatchObject({
      rowAccessCompanyId: 'company-1',
    });
  });
});
