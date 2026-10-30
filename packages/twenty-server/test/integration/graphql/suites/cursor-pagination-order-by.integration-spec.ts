import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
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
  objectMetadataSingularName?: string;
  objectMetadataPluralName?: string;
  filter?: object;
  gqlFields?: string;
  first?: number;
  last?: number;
};

const paginateForward = async ({
  orderBy,
  objectMetadataSingularName = 'opportunity',
  objectMetadataPluralName = 'opportunities',
  filter,
  gqlFields = 'id',
  first = PAGE_SIZE,
}: PaginateAllParams) => {
  const ids: string[] = [];
  let after: string | undefined = undefined;
  let pages = 0;

  for (let iteration = 0; iteration < 20; iteration++) {
    const response: GraphqlResponse = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName,
        objectMetadataPluralName,
        gqlFields,
        filter,
        orderBy,
        first,
        after,
      }),
    ).expect(200);

    expect(response.body.errors).toBeUndefined();

    const connection: RecordConnection =
      response.body.data[objectMetadataPluralName];

    ids.push(...connection.edges.map((edge) => edge.node.id));
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
  filter,
  last = PAGE_SIZE,
}: PaginateAllParams & { startingBefore: string }) => {
  const ids: string[] = [];
  let before: string | undefined = startingBefore;

  for (let iteration = 0; iteration < 20; iteration++) {
    const response: GraphqlResponse = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields,
        orderBy,
        filter,
        last,
        before,
      }),
    ).expect(200);

    expect(response.body.errors).toBeUndefined();

    const connection: RecordConnection = response.body.data.opportunities;

    ids.unshift(...connection.edges.map((edge) => edge.node.id));

    if (!connection.pageInfo.hasPreviousPage) {
      break;
    }

    before = connection.pageInfo.startCursor;
  }

  return { ids };
};

describe('Cursor pagination exhaustiveness with orderBy (issue #24333)', () => {
  beforeAll(async () => {
    await deleteAllRecords('opportunity');

    await makeGraphqlApiRequest(
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
    const forwardResponse = await makeGraphqlApiRequest(
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

    expect(ids).toEqual(forwardIds.slice(0, -1));
  });

  it('should reject a cursor that does not carry the orderBy field value', async () => {
    const staleCursor = Buffer.from(
      JSON.stringify({ id: datedOpportunityIds[0] }),
    ).toString('base64');

    const response: GraphqlResponse = await makeGraphqlApiRequest(
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
    const { ids } = await paginateForward({
      filter: { closeDate: { gte: DATED_CLOSE_DATES[2] } },
      orderBy: { closeDate: 'AscNullsLast' },
      first: 2,
    });

    expect(ids).toEqual(datedOpportunityIds.slice(2));
  });

  // Lowercase UUID strings sort the same in JS and Postgres, so a plain string sort gives the expected order.
  it('should honor an explicit descending id ordering across pages', async () => {
    const { ids } = await paginateForward({
      orderBy: { id: 'DescNullsLast' },
    });

    expect(ids).toEqual(
      [...datedOpportunityIds, ...nullCloseDateOpportunityIds].sort().reverse(),
    );
  });

  it('should tie-break with an explicit descending id inside the NULL block', async () => {
    const { ids } = await paginateForward({
      orderBy: [{ closeDate: 'AscNullsLast' }, { id: 'DescNullsLast' }],
    });

    expect(ids).toEqual([
      ...datedOpportunityIds,
      ...[...nullCloseDateOpportunityIds].sort().reverse(),
    ]);
  });

  it('should keep the first direction when the same field is ordered twice', async () => {
    const { ids } = await paginateForward({
      orderBy: [{ closeDate: 'AscNullsLast' }, { closeDate: 'DescNullsFirst' }],
    });

    expect(ids.slice(0, DATED_CLOSE_DATES.length)).toEqual(datedOpportunityIds);
    expect(new Set(ids.slice(DATED_CLOSE_DATES.length))).toEqual(
      new Set(nullCloseDateOpportunityIds),
    );
  });
});

describe('Cursor pagination with composite orderBy not in the selection set', () => {
  const personIds = Array.from({ length: 5 }, () => randomUUID());
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];

  beforeAll(async () => {
    await deleteAllRecords('person');

    await makeGraphqlApiRequest(
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
    const { ids } = await paginateForward({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      orderBy: { name: { firstName: 'AscNullsLast' } },
      first: 2,
    });

    expect(ids).toEqual(personIds);
  });
});

describe('Cursor pagination ordered by a nullable foreign key', () => {
  const companyIds = [randomUUID(), randomUUID()];
  const withCompanyOpportunityIds = [randomUUID(), randomUUID(), randomUUID()];
  const withoutCompanyOpportunityIds = [
    randomUUID(),
    randomUUID(),
    randomUUID(),
  ];
  const fkTotalCount =
    withCompanyOpportunityIds.length + withoutCompanyOpportunityIds.length;

  beforeAll(async () => {
    await deleteAllRecords('opportunity');
    await deleteAllRecords('company');

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: companyIds.map((id, index) => ({
          id,
          name: `Cursor FK company ${index + 1}`,
        })),
      }),
    ).expect(200);

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          ...withCompanyOpportunityIds.map((id, index) => ({
            id,
            name: `FK opportunity ${index + 1}`,
            companyId: companyIds[index % companyIds.length],
          })),
          ...withoutCompanyOpportunityIds.map((id, index) => ({
            id,
            name: `FK-less opportunity ${index + 1}`,
          })),
        ],
      }),
    ).expect(200);
  });

  it('should return every record when ordering by the foreign key column', async () => {
    const { ids } = await paginateForward({
      orderBy: { companyId: 'AscNullsLast' },
      first: 2,
    });

    expect(ids).toHaveLength(fkTotalCount);
    expect(new Set(ids).size).toBe(fkTotalCount);
    expect(new Set(ids.slice(withCompanyOpportunityIds.length))).toEqual(
      new Set(withoutCompanyOpportunityIds),
    );
  });
});

describe('Cursor pagination ordered by a nullable composite sub-field', () => {
  const withAmountOpportunityIds = [
    randomUUID(),
    randomUUID(),
    randomUUID(),
    randomUUID(),
  ];
  const withoutAmountOpportunityIds = [
    randomUUID(),
    randomUUID(),
    randomUUID(),
  ];
  const amountTotalCount =
    withAmountOpportunityIds.length + withoutAmountOpportunityIds.length;

  beforeAll(async () => {
    await deleteAllRecords('opportunity');

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          ...withAmountOpportunityIds.map((id, index) => ({
            id,
            name: `Amount opportunity ${index + 1}`,
            amount: {
              amountMicros: (index + 1) * 1_000_000,
              currencyCode: 'USD',
            },
          })),
          ...withoutAmountOpportunityIds.map((id, index) => ({
            id,
            name: `Amount-less opportunity ${index + 1}`,
          })),
        ],
      }),
    ).expect(200);
  });

  it('should paginate across the NULL block of a currency sub-field', async () => {
    const { ids } = await paginateForward({
      orderBy: { amount: { amountMicros: 'AscNullsLast' } },
      first: 2,
    });

    expect(ids).toHaveLength(amountTotalCount);
    expect(new Set(ids).size).toBe(amountTotalCount);
    expect(ids.slice(0, withAmountOpportunityIds.length)).toEqual(
      withAmountOpportunityIds,
    );
    expect(new Set(ids.slice(withAmountOpportunityIds.length))).toEqual(
      new Set(withoutAmountOpportunityIds),
    );
  });
});

describe('Cursor pagination with duplicate sort values', () => {
  const duplicatedCloseDates = [
    '2026-02-01T00:00:00.000Z',
    '2026-02-01T00:00:00.000Z',
    '2026-02-02T00:00:00.000Z',
    '2026-02-02T00:00:00.000Z',
    '2026-02-03T00:00:00.000Z',
    '2026-02-03T00:00:00.000Z',
  ];
  const duplicateDatedOpportunityIds = duplicatedCloseDates.map(() =>
    randomUUID(),
  );
  const duplicateNullOpportunityIds = [randomUUID(), randomUUID()];
  const duplicatesTotalCount =
    duplicateDatedOpportunityIds.length + duplicateNullOpportunityIds.length;

  beforeAll(async () => {
    await deleteAllRecords('opportunity');

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: [
          ...duplicatedCloseDates.map((closeDate, index) => ({
            id: duplicateDatedOpportunityIds[index],
            name: `Duplicate dated opportunity ${index + 1}`,
            closeDate,
          })),
          ...duplicateNullOpportunityIds.map((id, index) => ({
            id,
            name: `Duplicate undated opportunity ${index + 1}`,
          })),
        ],
      }),
    ).expect(200);
  });

  it('should neither skip nor repeat records when the sort value has duplicates', async () => {
    // Page size 2 lands page boundaries inside the duplicate groups
    const { ids } = await paginateForward({
      orderBy: { closeDate: 'AscNullsLast' },
      first: 2,
    });

    expect(ids).toHaveLength(duplicatesTotalCount);
    expect(new Set(ids).size).toBe(duplicatesTotalCount);
    expect(new Set(ids.slice(duplicatedCloseDates.length))).toEqual(
      new Set(duplicateNullOpportunityIds),
    );
  });
});

// Empty TEXT values are stored as SQL NULL but returned as '' by the API: the scan's NULL block holds every empty row,
// and cursors carry the raw SQL values so the continuation follows the scan.
describe('Cursor pagination ordered by a TEXT field with empty values', () => {
  const namedCompanyIds = {
    ALPHA: '20202020-eeee-4000-8000-000000000001',
    BETA: '20202020-eeee-4000-8000-000000000002',
  };
  const emptyNameCompanyIds = [
    '20202020-eeee-4000-8000-000000000003',
    '20202020-eeee-4000-8000-000000000004',
    '20202020-eeee-4000-8000-000000000005',
    '20202020-eeee-4000-8000-000000000006',
  ];
  const allCompanyIds = [
    ...Object.values(namedCompanyIds),
    ...emptyNameCompanyIds,
  ];

  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: namedCompanyIds.ALPHA, name: 'Alpha Corp' },
          { id: namedCompanyIds.BETA, name: 'Beta Inc' },
          { id: emptyNameCompanyIds[0], name: '' },
          ...emptyNameCompanyIds.slice(1).map((id) => ({ id })),
        ],
        upsert: true,
      }),
    ).expect(200);
  });

  it('should paginate the empty block exhaustively with AscNullsLast', async () => {
    const { ids } = await paginateForward({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      filter: { id: { in: allCompanyIds } },
      orderBy: { name: 'AscNullsLast' },
      first: 2,
    });

    expect(ids).toEqual([
      namedCompanyIds.ALPHA,
      namedCompanyIds.BETA,
      ...emptyNameCompanyIds,
    ]);
  });

  it('should paginate the empty block exhaustively with DescNullsLast', async () => {
    const { ids } = await paginateForward({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      filter: { id: { in: allCompanyIds } },
      orderBy: { name: 'DescNullsLast' },
      first: 2,
    });

    expect(ids).toEqual([
      namedCompanyIds.BETA,
      namedCompanyIds.ALPHA,
      ...emptyNameCompanyIds,
    ]);
  });
});

describe('Cursor pagination ordered by a DATE_TIME field with rows sharing a millisecond', () => {
  const opportunities = [
    {
      id: '55555555-5555-4555-8555-555555555555',
      createdAt: '2020-01-01T00:00:00.123100Z',
    },
    {
      id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      createdAt: '2020-01-01T00:00:00.123500Z',
    },
    {
      id: '11111111-1111-4111-8111-111111111111',
      createdAt: '2020-01-01T00:00:00.123900Z',
    },
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      createdAt: '2020-01-01T00:00:00.124000Z',
    },
    {
      id: '99999999-9999-4999-8999-999999999999',
      createdAt: '2020-01-01T00:00:00.124500Z',
    },
  ];
  const ascendingIds = opportunities.map(({ id }) => id);
  const descendingIds = [...ascendingIds].reverse();
  const filter = { id: { in: ascendingIds } };

  beforeAll(async () => {
    await deleteAllRecords('opportunity');

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: opportunities.map(({ id, createdAt }, index) => ({
          id,
          name: `Same millisecond opportunity ${index + 1}`,
          createdAt,
        })),
      }),
    ).expect(200);
  });

  it('should keep returning millisecond values', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'createdAt',
        filter,
        orderBy: { createdAt: 'AscNullsLast' },
      }),
    ).expect(200);

    expect(
      response.body.data.opportunities.edges.map(
        (edge: { node: { createdAt: string } }) => edge.node.createdAt,
      ),
    ).toEqual([
      '2020-01-01T00:00:00.123Z',
      '2020-01-01T00:00:00.123Z',
      '2020-01-01T00:00:00.123Z',
      '2020-01-01T00:00:00.124Z',
      '2020-01-01T00:00:00.124Z',
    ]);
  });

  it.each([
    { operator: 'eq', expectedIds: ascendingIds.slice(0, 3) },
    { operator: 'gt', expectedIds: ascendingIds.slice(3) },
  ])(
    'should preserve millisecond $operator filters while paginating through GraphQL',
    async ({ operator, expectedIds }) => {
      const { ids } = await paginateForward({
        orderBy: { createdAt: 'AscNullsLast' },
        filter: {
          and: [
            filter,
            { createdAt: { [operator]: '2020-01-01T00:00:00.123Z' } },
          ],
        },
        first: 1,
      });

      expect(ids).toEqual(expectedIds);
    },
  );

  it.each([
    { operator: 'eq', expectedIds: ascendingIds.slice(0, 3) },
    { operator: 'gt', expectedIds: ascendingIds.slice(3) },
  ])(
    'should preserve millisecond $operator filters while paginating through REST',
    async ({ operator, expectedIds }) => {
      const ids: string[] = [];
      let startingAfter: string | undefined = undefined;

      for (let iteration = 0; iteration < opportunities.length; iteration++) {
        const path: string =
          `/opportunities?filter=createdAt[${operator}]:2020-01-01T00:00:00.123Z&order_by=createdAt[AscNullsLast]&limit=1` +
          (startingAfter ? `&starting_after=${startingAfter}` : '');
        const response = await makeRestApiRequest({
          method: 'get',
          path,
        }).expect(200);

        ids.push(
          ...response.body.data.opportunities.map(
            (opportunity: { id: string }) => opportunity.id,
          ),
        );

        if (!response.body.pageInfo.hasNextPage) {
          break;
        }

        startingAfter = response.body.pageInfo.endCursor;
      }

      expect(ids).toEqual(expectedIds);
    },
  );

  it.each([
    { direction: 'AscNullsLast', first: 1, expectedIds: ascendingIds },
    { direction: 'AscNullsLast', first: 2, expectedIds: ascendingIds },
    { direction: 'DescNullsFirst', first: 1, expectedIds: descendingIds },
  ])(
    'should walk forward with $direction in pages of $first without skipping or repeating',
    async ({ direction, first, expectedIds }) => {
      const { ids } = await paginateForward({
        orderBy: { createdAt: direction },
        filter,
        first,
      });

      expect(ids).toEqual(expectedIds);
    },
  );

  it.each([
    { direction: 'AscNullsLast', expectedIds: ascendingIds },
    { direction: 'DescNullsFirst', expectedIds: descendingIds },
  ])(
    'should walk backward with $direction without skipping or repeating',
    async ({ direction, expectedIds }) => {
      const forwardResponse = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'opportunity',
          objectMetadataPluralName: 'opportunities',
          gqlFields: 'id',
          filter,
          orderBy: { createdAt: direction },
          first: 3,
        }),
      ).expect(200);

      const { ids } = await paginateBackwardFrom({
        orderBy: { createdAt: direction },
        filter,
        last: 1,
        startingBefore:
          forwardResponse.body.data.opportunities.pageInfo.endCursor,
      });

      expect(ids).toEqual(expectedIds.slice(0, 2));
    },
  );
});

describe('Cursor pagination ordered by a relation DATE_TIME field with rows sharing a millisecond', () => {
  const companies = [
    { id: randomUUID(), createdAt: '2020-01-01T00:00:00.123100Z' },
    { id: randomUUID(), createdAt: '2020-01-01T00:00:00.123500Z' },
    { id: randomUUID(), createdAt: '2020-01-01T00:00:00.123900Z' },
  ];
  const relationOpportunityIds = [
    '55555555-5555-4555-8555-000000000001',
    'eeeeeeee-eeee-4eee-8eee-000000000002',
    '11111111-1111-4111-8111-000000000003',
  ];

  beforeAll(async () => {
    await deleteAllRecords('opportunity');
    await deleteAllRecords('company');

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: companies.map(({ id, createdAt }, index) => ({
          id,
          name: `Same millisecond company ${index + 1}`,
          createdAt,
        })),
      }),
    ).expect(200);

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: relationOpportunityIds.map((id, index) => ({
          id,
          name: `Same millisecond company opportunity ${index + 1}`,
          companyId: companies[index].id,
        })),
      }),
    ).expect(200);
  });

  it.each(['AscNullsLast', 'DescNullsFirst'])(
    'should walk forward with %s without skipping or repeating',
    async (direction) => {
      const { ids } = await paginateForward({
        orderBy: { company: { createdAt: direction } },
        filter: { id: { in: relationOpportunityIds } },
        first: 1,
      });

      expect(ids).toEqual(
        direction === 'AscNullsLast'
          ? relationOpportunityIds
          : [...relationOpportunityIds].reverse(),
      );
    },
  );

  it.each(['AscNullsLast', 'DescNullsFirst'])(
    'should walk backward with %s without skipping or repeating',
    async (direction) => {
      const orderBy = { company: { createdAt: direction } };
      const filter = { id: { in: relationOpportunityIds } };
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'opportunity',
          objectMetadataPluralName: 'opportunities',
          gqlFields: 'id',
          orderBy,
          filter,
          first: 3,
        }),
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const { ids } = await paginateBackwardFrom({
        orderBy,
        filter,
        last: 1,
        startingBefore: response.body.data.opportunities.pageInfo.endCursor,
      });
      const expectedIds =
        direction === 'AscNullsLast'
          ? relationOpportunityIds
          : [...relationOpportunityIds].reverse();

      expect(ids).toEqual(expectedIds.slice(0, -1));
    },
  );
});
