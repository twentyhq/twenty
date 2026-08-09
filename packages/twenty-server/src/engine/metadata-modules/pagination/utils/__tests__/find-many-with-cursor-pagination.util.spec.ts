import { type SelectQueryBuilder } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { encodeCursorData } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import {
  findManyItemsWithCursorPagination,
  findManyWithCursorPagination,
} from 'src/engine/metadata-modules/pagination/utils/find-many-with-cursor-pagination.util';

type FakeEntity = { id: string };

const UUID_A = '00000000-0000-4000-8000-00000000000a';
const UUID_B = '00000000-0000-4000-8000-00000000000b';
const UUID_C = '00000000-0000-4000-8000-00000000000c';
const UUID_D = '00000000-0000-4000-8000-00000000000d';

const createFakeQueryBuilder = (rows: FakeEntity[]) => {
  const calls = {
    orderBy: [] as [string, string][],
    andWhere: [] as [string, Record<string, unknown> | undefined][],
    take: [] as number[],
  };

  const queryBuilder = {
    orderBy(column: string, direction: string) {
      calls.orderBy.push([column, direction]);

      return queryBuilder;
    },
    andWhere(condition: string, parameters?: Record<string, unknown>) {
      calls.andWhere.push([condition, parameters]);

      return queryBuilder;
    },
    take(amount: number) {
      calls.take.push(amount);

      return queryBuilder;
    },
    getMany: async () => [...rows],
  };

  return {
    queryBuilder: queryBuilder as unknown as SelectQueryBuilder<FakeEntity>,
    calls,
  };
};

const paginate = (
  rows: FakeEntity[],
  paging: Parameters<typeof findManyWithCursorPagination>[0]['paging'],
) => {
  const { queryBuilder, calls } = createFakeQueryBuilder(rows);

  return {
    calls,
    result: findManyWithCursorPagination({
      queryBuilder,
      alias: 'entity',
      paging,
      defaultResultSize: 10,
      maxResultsSize: 1000,
    }),
  };
};

const cursorFor = (id: string) => encodeCursorData({ id });

describe('findManyWithCursorPagination', () => {
  it.each([
    [{ first: 1, last: 1 }],
    [{ first: 1, before: cursorFor(UUID_A) }],
    [{ last: 1, after: cursorFor(UUID_A) }],
    [{ after: cursorFor(UUID_A), before: cursorFor(UUID_B) }],
    [{ first: -1 }],
    [{ last: -1 }],
    [{ first: 1001 }],
  ])('rejects invalid paging %j', async (paging) => {
    await expect(paginate([], paging).result).rejects.toThrow(UserInputError);
  });

  it.each([
    ['not-base64-json'],
    [Buffer.from('null').toString('base64')],
    [Buffer.from('42').toString('base64')],
    [Buffer.from('[]').toString('base64')],
    [Buffer.from('{"noId":true}').toString('base64')],
    [Buffer.from('{"id":42}').toString('base64')],
    [Buffer.from('{"id":"not-a-uuid"}').toString('base64')],
  ])('rejects malformed cursor %s as user input error', async (after) => {
    await expect(paginate([], { after }).result).rejects.toThrow(
      UserInputError,
    );
  });

  it('pages forward with id DESC ordering and a keyset condition', async () => {
    const rows = [{ id: UUID_C }, { id: UUID_B }, { id: UUID_A }];
    const { result, calls } = paginate(rows, {
      first: 2,
      after: cursorFor(UUID_D),
    });
    const connection = await result;

    expect(calls.orderBy).toEqual([['"entity"."id"', 'DESC']]);
    expect(calls.andWhere).toEqual([
      [
        '"entity"."id" < :metadataPaginationCursorId',
        { metadataPaginationCursorId: UUID_D },
      ],
    ]);
    expect(calls.take).toEqual([3]);
    expect(connection.edges.map(({ node }) => node.id)).toEqual([
      UUID_C,
      UUID_B,
    ]);
    expect(connection.pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: true,
      startCursor: cursorFor(UUID_C),
      endCursor: cursorFor(UUID_B),
    });
  });

  it('reports no previous page when paging forward from the start', async () => {
    const { result } = paginate([{ id: UUID_B }, { id: UUID_A }], {
      first: 10,
    });
    const connection = await result;

    expect(connection.pageInfo.hasNextPage).toBe(false);
    expect(connection.pageInfo.hasPreviousPage).toBe(false);
  });

  it('pages backward with reversed ordering and reversed results', async () => {
    const rows = [{ id: UUID_B }, { id: UUID_C }, { id: UUID_D }];
    const { result, calls } = paginate(rows, {
      last: 2,
      before: cursorFor(UUID_A),
    });
    const connection = await result;

    expect(calls.orderBy).toEqual([['"entity"."id"', 'ASC']]);
    expect(calls.andWhere).toEqual([
      [
        '"entity"."id" > :metadataPaginationCursorId',
        { metadataPaginationCursorId: UUID_A },
      ],
    ]);
    expect(connection.edges.map(({ node }) => node.id)).toEqual([
      UUID_C,
      UUID_B,
    ]);
    expect(connection.pageInfo.hasPreviousPage).toBe(true);
    expect(connection.pageInfo.hasNextPage).toBe(true);
  });

  it('supports fetching the last page without a before cursor', async () => {
    const rows = [{ id: UUID_A }, { id: UUID_B }, { id: UUID_C }];
    const { result, calls } = paginate(rows, { last: 2 });
    const connection = await result;

    expect(calls.orderBy).toEqual([['"entity"."id"', 'ASC']]);
    expect(connection.edges.map(({ node }) => node.id)).toEqual([
      UUID_B,
      UUID_A,
    ]);
    expect(connection.pageInfo).toMatchObject({
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  it('uses the default result size when paging is omitted', async () => {
    const { result, calls } = paginate([{ id: UUID_A }], undefined);

    await result;

    expect(calls.take).toEqual([11]);
  });

  it('returns null cursors for an empty page', async () => {
    const connection = await paginate([], { first: 5 }).result;

    expect(connection.edges).toEqual([]);
    expect(connection.pageInfo.startCursor).toBeNull();
    expect(connection.pageInfo.endCursor).toBeNull();
  });

  it('uses the same cursor semantics for batched relation items', () => {
    const connection = findManyItemsWithCursorPagination({
      items: [{ id: UUID_A }, { id: UUID_D }, { id: UUID_B }, { id: UUID_C }],
      paging: { first: 2, after: cursorFor(UUID_D) },
      defaultResultSize: 10,
      maxResultsSize: 1000,
    });

    expect(connection.edges.map(({ node }) => node.id)).toEqual([
      UUID_C,
      UUID_B,
    ]);
    expect(connection.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
