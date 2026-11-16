import {
  buildColumn,
  buildQueryBuilder,
  personTableShape,
} from 'src/engine/twenty-orm/query-builder/__tests__/workspace-select-query-builder-test-shapes.util';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

const tableShape: WorkspaceTableShape = {
  ...personTableShape,
  columnShapeByColumnName: {
    ...personTableShape.columnShapeByColumnName,
    score: { ...buildColumn('score'), isComputed: true },
    doubleScore: { ...buildColumn('doubleScore'), isComputed: true },
  },
  computedColumnNames: ['score', 'doubleScore'],
};

const getUnresolvedColumnNames = (
  queryBuilder: ReturnType<typeof buildQueryBuilder>['queryBuilder'],
) =>
  queryBuilder
    .getUnresolvedComputedColumns()
    .map(({ columnName }) => columnName);

describe('WorkspaceSelectQueryBuilder computed columns', () => {
  it('needs no computed column for a statement that reads stored columns only', () => {
    const { queryBuilder } = buildQueryBuilder({ tableShape });

    queryBuilder.where('"person"."id" = :id', { id: '1' });

    expect(getUnresolvedColumnNames(queryBuilder)).toEqual([]);
  });

  it.each([
    [
      'the selection',
      (queryBuilder) =>
        queryBuilder.setFindOptions({ select: { score: true } }),
    ],
    ['a filter', (queryBuilder) => queryBuilder.where('person.score > 1')],
    [
      'a row access condition',
      (queryBuilder) =>
        queryBuilder.addRowAccessCondition('"person"."score" > 1'),
    ],
    ['a sort', (queryBuilder) => queryBuilder.orderBy('person.score', 'ASC')],
    ['a grouping', (queryBuilder) => queryBuilder.groupBy('person.score')],
    [
      'an added column',
      (queryBuilder) => queryBuilder.addSelect('person.score'),
    ],
  ] satisfies [
    string,
    (
      queryBuilder: ReturnType<typeof buildQueryBuilder>['queryBuilder'],
    ) => unknown,
  ][])('needs a computed column read by %s', (_, readScore) => {
    const { queryBuilder } = buildQueryBuilder({ tableShape });

    readScore(queryBuilder);

    expect(getUnresolvedColumnNames(queryBuilder)).toEqual(['score']);
  });

  it('needs the computed columns that a resolved one reads, and computes them a level below', () => {
    const { queryBuilder } = buildQueryBuilder({ tableShape });

    queryBuilder.select(['id', 'doubleScore']);
    queryBuilder.setComputedColumnSql({
      alias: 'person',
      columnName: 'doubleScore',
      computedColumnSql: {
        sql: '"person"."score" * 2',
        readComputedColumnNames: ['score'],
      },
    });

    expect(getUnresolvedColumnNames(queryBuilder)).toEqual(['score']);

    queryBuilder.setComputedColumnSql({
      alias: 'person',
      columnName: 'score',
      computedColumnSql: { sql: '1', readComputedColumnNames: [] },
    });

    expect(getUnresolvedColumnNames(queryBuilder)).toEqual([]);
    expect(queryBuilder.getQuery()).toContain(
      'FROM (SELECT "person".*, ("person"."score" * 2) AS "doubleScore" FROM (SELECT "person".*, (1) AS "score" FROM',
    );
  });
});
