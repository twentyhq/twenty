import { type FieldMetadataFilteredRelationComputation } from 'twenty-shared/types';

import {
  buildQueryBuilder,
  personTableShape,
} from 'src/engine/twenty-orm/query-builder/__tests__/workspace-select-query-builder-test-shapes.util';

const PARENT_RECORD_IDS = ['20202020-0000-4000-8000-000000000001'];
const PERSON_TABLE = `"${personTableShape.schemaName}"."person"`;

// Stands for the expression compiler: a field name reads the column of that name
const buildFilteredRelationQueryBuilder = ({
  unreadableExpressions = [],
}: { unreadableExpressions?: string[] } = {}) =>
  buildQueryBuilder({
    buildComputedFieldExpressionSql: ({ expression, alias }) =>
      Promise.resolve(
        unreadableExpressions.includes(expression)
          ? undefined
          : { sql: `"${alias}"."${expression}"`, readComputedColumnNames: [] },
      ),
  }).queryBuilder.select('"person"."id"', 'id');

const COMPUTATION: FieldMetadataFilteredRelationComputation = {
  kind: 'FILTERED_RELATION',
  relationFieldName: 'people',
  filter: 'nameFirstName',
  orderBy: [{ expression: 'nameLastName', direction: 'DescNullsLast' }],
  limit: 2,
};

const restrict = async (
  computation: FieldMetadataFilteredRelationComputation,
  queryBuilder = buildFilteredRelationQueryBuilder(),
) =>
  (
    await queryBuilder.whereInRecordsPerParent({
      filter: computation.filter,
      orderBy: computation.orderBy,
      limit: computation.limit,
      joinColumnName: 'companyId',
      parentRecordIds: PARENT_RECORD_IDS,
    })
  ).getQuery();

describe('WorkspaceSelectQueryBuilder filtered relation', () => {
  it('keeps the records of each parent that pass the stored filter, in the stored order, up to the stored limit', async () => {
    const queryBuilder = buildFilteredRelationQueryBuilder();

    expect(await restrict(COMPUTATION, queryBuilder)).toBe(
      `SELECT "person"."id" AS "id" FROM ${PERSON_TABLE} AS "person" ` +
        'WHERE (("person"."id" IN (SELECT "member"."id" ' +
        'FROM unnest(:perParentRecordIds::uuid[]) AS "parent"("id") ' +
        `CROSS JOIN LATERAL (SELECT "person_member"."id" AS "id" FROM ${PERSON_TABLE} AS "person_member" ` +
        'WHERE (("person_member"."companyId" = "parent"."id") AND ("person_member"."nameFirstName")) ' +
        'AND "person_member"."deletedAt" IS NULL ' +
        'ORDER BY ("person_member"."nameLastName") DESC NULLS LAST, "person_member"."id" ASC LIMIT 2) AS "member"))) ' +
        'AND "person"."deletedAt" IS NULL',
    );
    expect(queryBuilder.getParameters()).toEqual({
      perParentRecordIds: PARENT_RECORD_IDS,
    });
  });

  it('looks among soft-deleted records too when the statement does', async () => {
    expect(
      await restrict(
        COMPUTATION,
        buildFilteredRelationQueryBuilder().withDeleted(),
      ),
    ).not.toContain('"deletedAt" IS NULL');
  });

  it('only filters when no limit is stored', async () => {
    expect(await restrict({ ...COMPUTATION, limit: undefined })).toBe(
      `SELECT "person"."id" AS "id" FROM ${PERSON_TABLE} AS "person" ` +
        'WHERE (("person"."nameFirstName")) AND "person"."deletedAt" IS NULL',
    );
  });

  it('keeps no record when the reader cannot read what the stored filter reads', async () => {
    expect(
      await restrict(
        { ...COMPUTATION, limit: undefined },
        buildFilteredRelationQueryBuilder({
          unreadableExpressions: ['nameFirstName'],
        }),
      ),
    ).toContain('WHERE ((FALSE))');
  });

  it('orders by the stored sorts the reader can read, then by id', async () => {
    const computation: FieldMetadataFilteredRelationComputation = {
      ...COMPUTATION,
      orderBy: [
        { expression: 'nameLastName', direction: 'DescNullsLast' },
        { expression: 'nameFirstName', direction: 'AscNullsFirst' },
      ],
    };

    expect(
      (
        await buildFilteredRelationQueryBuilder().orderByExpressions(
          computation.orderBy,
        )
      ).getQuery(),
    ).toContain(
      'ORDER BY ("person"."nameLastName") DESC NULLS LAST, ("person"."nameFirstName") ASC NULLS FIRST, "person"."id" ASC',
    );
    expect(
      (
        await buildFilteredRelationQueryBuilder({
          unreadableExpressions: ['nameLastName'],
        }).orderByExpressions(computation.orderBy)
      ).getQuery(),
    ).toContain(
      'ORDER BY ("person"."nameFirstName") ASC NULLS FIRST, "person"."id" ASC',
    );
  });
});
