import { Any, Equal } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { applyFindOptionsToQueryBuilder } from 'src/engine/twenty-orm/query-builder/utils/apply-find-options.util';
import { buildQueryBuilder } from 'src/engine/twenty-orm/query-builder/__tests__/workspace-select-query-builder-test-shapes.util';

describe('WorkspaceSelectQueryBuilder relation-keyed where', () => {
  it('should filter a to-many relation with a correlated EXISTS instead of a join', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { name: Equal('Twenty') } });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain(
      'EXISTS (SELECT 1 FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."company" AS "person_people_filter" WHERE "person_people_filter"."personId" = "person"."id" AND ("person_people_filter"."name" = $1) AND "person_people_filter"."deletedAt" IS NULL)',
    );
    expect(text).not.toContain('JOIN');
    expect(values).toEqual(['Twenty']);
  });

  it('should register a caller-written to-many condition as a correlated EXISTS', () => {
    const { queryBuilder } = buildQueryBuilder();

    const token = queryBuilder.addRelationExistsFilter({
      relationFieldName: 'people',
      applyWhere: (nestedBuilder) => {
        nestedBuilder.where(`"${nestedBuilder.alias}"."name" = :name`, {
          name: 'Twenty',
        });
      },
    });

    queryBuilder.setFindOptions({ select: { id: true } }).where(token);

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain(
      'EXISTS (SELECT 1 FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."company" AS "person_people_filter" WHERE "person_people_filter"."personId" = "person"."id" AND ("person_people_filter"."name" = $1) AND "person_people_filter"."deletedAt" IS NULL)',
    );
    expect(text).not.toContain('JOIN');
    expect(text).not.toContain('__ormExistsFilter');
    expect(values).toEqual(['Twenty']);
  });

  it('should reject an EXISTS filter on an unknown relation', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(() =>
      queryBuilder.addRelationExistsFilter({
        relationFieldName: 'unknown',
        applyWhere: () => {},
      }),
    ).toThrow(TwentyOrmException);
  });

  it('should correlate a to-one relation on the parent join column', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ company: { name: Equal('Twenty') } });

    expect(queryBuilder.getQuery()).toContain(
      'EXISTS (SELECT 1 FROM "workspace_1wgvd1injqtife6y4rvfbu3h5"."company" AS "person_company_filter" WHERE "person"."companyId" = "person_company_filter"."id"',
    );
  });

  it('should combine a relation filter with sibling column conditions', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } }).where({
      nameFirstName: Equal('Ada'),
      people: { name: Equal('Twenty') },
    });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."nameFirstName" = $1 AND EXISTS (');
    expect(values).toEqual(['Ada', 'Twenty']);
  });

  it('should keep a relation filter inside its OR group', () => {
    const { queryBuilder } = buildQueryBuilder();

    applyFindOptionsToQueryBuilder(queryBuilder, {
      select: { id: true },
      where: [
        { nameFirstName: Equal('Ada') },
        { people: { name: Equal('Twenty') } },
      ],
    });

    const text = queryBuilder.getQuery();

    expect(text).toContain('OR');
    expect(text).toContain('EXISTS (');
    expect(text).not.toContain('__ormExistsFilter');
  });

  it('should nest a relation filter reached through another relation', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { person: { name: Equal('Twenty') } } });

    const text = queryBuilder.getQuery();

    expect(text).toContain('"person_people_filter"."personId" = "person"."id"');
    expect(text).toContain(
      '"person_people_filter"."personId" = "person_people_filter_person_filter"."id"',
    );
    expect(text).not.toContain('__ormExistsFilter');
  });

  it('should drop the soft-delete predicate inside the subquery when deleted rows are included', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { name: Equal('Twenty') } })
      .withDeleted();

    expect(queryBuilder.getQuery()).not.toContain(
      '"person_people_filter"."deletedAt" IS NULL',
    );
  });

  it('should apply a row-level permission predicate inside the subquery', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { name: Equal('Twenty') } });

    queryBuilder.addJoinCondition(
      'person_people_filter',
      '"person_people_filter"."name" <> \'hidden\'',
    );

    expect(queryBuilder.getQuery()).toContain(
      'AND "person_people_filter"."name" <> \'hidden\'',
    );
  });

  it('should expose the filtered relation as a join attribute so permissions resolve it', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { name: Equal('Twenty') } });

    expect(
      queryBuilder.getJoinAliases().map((joinAlias) => joinAlias.name),
    ).toContain('person_people_filter');
    expect(
      queryBuilder.getJoinedTableShape('person_people_filter')?.nameSingular,
    ).toBe('company');
  });

  it('should count parents once when filtering on a to-many relation', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder({
      rows: [{ count: '2' }],
    });

    queryBuilder.where({ people: { name: Equal('Twenty') } });

    await expect(queryBuilder.getCount()).resolves.toBe(2);

    expect(executedStatements[0].text).toContain('EXISTS (');
    expect(executedStatements[0].text).not.toContain('DISTINCT');
    expect(executedStatements[0].text).not.toContain('JOIN');
  });

  it('should pass an Any operator through to the subquery', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { id: Any(['a', 'b']) } });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person_people_filter"."id" = ANY($1)');
    expect(values).toEqual([['a', 'b']]);
  });

  it('should reject a relation filter whose inverse foreign key cannot be resolved', () => {
    const { queryBuilder } = buildQueryBuilder({
      tableShape: {
        objectMetadataId: 'person-object-id',
        nameSingular: 'person',
        schemaName: 'workspace_1wgvd1injqtife6y4rvfbu3h5',
        tableName: 'person',
        columnShapeByColumnName: {},
        columnNames: [],
        relationShapeByFieldName: {
          orphans: {
            fieldName: 'orphans',
            fieldMetadataId: 'field-orphans',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectMetadataId: 'company-object-id',
            targetFieldMetadataId: null,
          },
        },
        hasDeletedAtColumn: false,
      },
    });

    expect(() =>
      queryBuilder.where({ orphans: { name: Equal('Twenty') } }),
    ).toThrow(TwentyOrmException);
  });

  it('should carry relation filters into a builder that copies the where clauses', () => {
    const { queryBuilder } = buildQueryBuilder();
    const { queryBuilder: snapshotQueryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .where({ people: { name: Equal('Twenty') } });

    snapshotQueryBuilder
      .setFindOptions({ select: { id: true } })
      .copyWhereFrom(queryBuilder);

    const text = snapshotQueryBuilder.getQuery();

    expect(text).toContain('EXISTS (');
    expect(text).not.toContain('__ormExistsFilter');
  });

  it('should reject a relation filter on a mutation', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.where({ people: { name: Equal('Twenty') } });

    expect(() => queryBuilder.delete()).toThrow(TwentyOrmException);
  });
});
