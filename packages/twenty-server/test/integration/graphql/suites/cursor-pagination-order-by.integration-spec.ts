import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

const PAGE_SIZE = 3;

const DATED_CLOSE_DATES = [
  '2026-01-01T00:00:00.000Z',
  '2026-01-02T00:00:00.000Z',
  '2026-01-03T00:00:00.000Z',
  '2026-01-04T00:00:00.000Z',
  '2026-01-05T00:00:00.000Z',
  '2026-01-06T00:00:00.000Z',
];
const NULL_CLOSE_DATE_COUNT = 4;
const TOTAL_COUNT = DATED_CLOSE_DATES.length + NULL_CLOSE_DATE_COUNT;

const datedOpportunityIds = DATED_CLOSE_DATES.map(() => randomUUID());
const nullCloseDateOpportunityIds = Array.from(
  { length: NULL_CLOSE_DATE_COUNT },
  () => randomUUID(),
);

type GraphqlResponse = {
  body: {
    errors?: { message: string }[];
    // oxlint-disable-next-line typescript/no-explicit-any
    data: Record<string, any>;
  };
};

type RecordConnection = {
  edges: { node: { id: string } }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
};

type PaginateAllParams = {
  orderBy: object;
  gqlFields?: string;
  first?: number;
};

const paginateForward = async ({
  orderBy,
  gqlFields = 'id',
  first = PAGE_SIZE,
}: PaginateAllParams) => {
  const ids: string[] = [];
  let after: string | undefined = undefined;
  let pages = 0;

  // Cap the loop far above the expected page count so a paging bug cannot hang the suite
  for (let iteration = 0; iteration < 20; iteration++) {
    const response: GraphqlResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields,
        orderBy,
        first,
        after,
      }),
    ).expect(200);

    expect(response.body.errors).toBeUndefined();

    const connection = response.body.data.opportunities;

    ids.push(
      ...connection.edges.map((edge: { node: { id: string } }) => edge.node.id),
    );
    pages++;

    if (!connection.pageInfo.hasNextPage) {
      break;
    }

    after = connection.pageInfo.endCursor;
  }

  return { ids, pages };
};

const paginateBackwardFrom = async ({
  orderBy,
  startingBefore,
  gqlFields = 'id',
}: PaginateAllParams & { startingBefore: string }) => {
  const ids: string[] = [];
  let before: string | undefined = startingBefore;
  let pages = 0;

  for (let iteration = 0; iteration < 20; iteration++) {
    const response: GraphqlResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields,
        orderBy,
        last: PAGE_SIZE,
        before,
      }),
    ).expect(200);

    expect(response.body.errors).toBeUndefined();

    const connection: RecordConnection = response.body.data.opportunities;

    ids.unshift(...connection.edges.map((edge) => edge.node.id));
    pages++;

    if (!connection.pageInfo.hasPreviousPage) {
      break;
    }

    before = connection.pageInfo.startCursor;
  }

  return { ids, pages };
};

describe('Cursor pagination exhaustiveness with orderBy (issue #24333)', () => {
  beforeAll(async () => {
    await deleteAllRecords('opportunity');

    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          ...DATED_CLOSE_DATES.map((closeDate, index) => ({
            id: datedOpportunityIds[index],
            name: `Dated opportunity ${index + 1}`,
            closeDate,
          })),
          ...nullCloseDateOpportunityIds.map((id, index) => ({
            id,
            name: `Undated opportunity ${index + 1}`,
          })),
        ],
      }),
    ).expect(200);
  });

  it('should return every record when paginating ordered by id (baseline)', async () => {
    const { ids } = await paginateForward({
      orderBy: { id: 'AscNullsLast' },
    });

    expect(new Set(ids).size).toBe(TOTAL_COUNT);
  });

  it('should return every record when the orderBy field is not in the selection set', async () => {
    const { ids, pages } = await paginateForward({
      orderBy: { closeDate: 'AscNullsFirst' },
      gqlFields: 'id',
    });

    expect(ids).toHaveLength(TOTAL_COUNT);
    expect(new Set(ids).size).toBe(TOTAL_COUNT);
    expect(pages).toBe(Math.ceil(TOTAL_COUNT / PAGE_SIZE));
  });

  it.each(['AscNullsLast', 'DescNullsLast'])(
    'should paginate across the trailing NULL block with %s',
    async (direction) => {
      const { ids } = await paginateForward({
        orderBy: { closeDate: direction },
      });

      expect(ids).toHaveLength(TOTAL_COUNT);
      expect(new Set(ids).size).toBe(TOTAL_COUNT);

      // The NULL block sorts last: its records must all be there, at the end
      expect(new Set(ids.slice(DATED_CLOSE_DATES.length))).toEqual(
        new Set(nullCloseDateOpportunityIds),
      );
    },
  );

  it.each(['AscNullsFirst', 'DescNullsFirst'])(
    'should paginate across the leading NULL block with %s',
    async (direction) => {
      const { ids } = await paginateForward({
        orderBy: { closeDate: direction },
      });

      expect(ids).toHaveLength(TOTAL_COUNT);
      expect(new Set(ids).size).toBe(TOTAL_COUNT);

      expect(new Set(ids.slice(0, NULL_CLOSE_DATE_COUNT))).toEqual(
        new Set(nullCloseDateOpportunityIds),
      );
    },
  );

  it('should keep the requested global order across pages', async () => {
    const { ids } = await paginateForward({
      orderBy: { closeDate: 'AscNullsLast' },
    });

    expect(ids.slice(0, DATED_CLOSE_DATES.length)).toEqual(datedOpportunityIds);
  });

  it('should walk backward across the NULL boundary with before cursors', async () => {
    // Reach the last page forward, then walk back from its end cursor: the
    // backward scan re-crosses the null/non-null boundary in reverse
    const forwardResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        orderBy: { closeDate: 'AscNullsLast' },
        first: TOTAL_COUNT,
      }),
    ).expect(200);

    const forwardConnection = forwardResponse.body.data.opportunities;
    const forwardIds = forwardConnection.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(forwardIds).toHaveLength(TOTAL_COUNT);

    const { ids } = await paginateBackwardFrom({
      orderBy: { closeDate: 'AscNullsLast' },
      startingBefore: forwardConnection.pageInfo.endCursor,
    });

    // Everything before the last record, in the same order as the forward scan
    expect(ids).toEqual(forwardIds.slice(0, -1));
  });

  it('should reject a cursor that does not carry the orderBy field value', async () => {
    const staleCursor = Buffer.from(
      JSON.stringify({ id: datedOpportunityIds[0] }),
    ).toString('base64');

    const response: GraphqlResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        orderBy: { closeDate: 'AscNullsLast' },
        first: PAGE_SIZE,
        after: staleCursor,
      }),
    ).expect(200);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors?.[0].message).toContain(
      'Cursor is missing the value for orderBy field "closeDate"',
    );
  });

  it('should paginate exhaustively when a filter is combined with the cursor', async () => {
    const expectedIds = datedOpportunityIds.slice(2);
    const ids: string[] = [];
    let after: string | undefined = undefined;

    for (let iteration = 0; iteration < 10; iteration++) {
      const response: GraphqlResponse = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'opportunity',
          objectMetadataPluralName: 'opportunities',
          gqlFields: 'id',
          filter: { closeDate: { gte: DATED_CLOSE_DATES[2] } },
          orderBy: { closeDate: 'AscNullsLast' },
          first: 2,
          after,
        }),
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.opportunities;

      ids.push(
        ...connection.edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      );

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }

    expect(ids).toEqual(expectedIds);
  });
});

describe('Cursor pagination with composite orderBy not in the selection set', () => {
  const personIds = Array.from({ length: 5 }, () => randomUUID());
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

  beforeAll(async () => {
    await deleteAllRecords('person');

    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        data: personIds.map((id, index) => ({
          id,
          name: {
            firstName: firstNames[index],
            lastName: 'Test',
          },
        })),
      }),
    ).expect(200);
  });

  it('should return every record when only id is selected', async () => {
    const ids: string[] = [];
    let after: string | undefined = undefined;

    for (let iteration = 0; iteration < 10; iteration++) {
      const response: GraphqlResponse = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          orderBy: { name: { firstName: 'AscNullsLast' } },
          first: 2,
          after,
        }),
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.people;

      ids.push(
        ...connection.edges.map(
          (edge: { node: { id: string } }) => edge.node.id,
        ),
      );

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }

    // Global order must hold across pages: Alice..Eve
    expect(ids).toEqual(personIds);
  });
});
