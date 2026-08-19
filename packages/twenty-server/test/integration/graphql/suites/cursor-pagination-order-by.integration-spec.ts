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
  objectMetadataSingularName?: string;
  objectMetadataPluralName?: string;
  filter?: object;
  gqlFields?: string;
  first?: number;
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

  // Cap the loop far above the expected page count so a paging bug cannot hang the suite
  for (let iteration = 0; iteration < 20; iteration++) {
    const response: GraphqlResponse = await makeGraphqlAPIRequest(
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
}: PaginateAllParams & { startingBefore: string }) => {
  const ids: string[] = [];
  let before: string | undefined = startingBefore;

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
    const { ids } = await paginateForward({
      filter: { closeDate: { gte: DATED_CLOSE_DATES[2] } },
      orderBy: { closeDate: 'AscNullsLast' },
      first: 2,
    });

    expect(ids).toEqual(datedOpportunityIds.slice(2));
  });

  // Canonical lowercase UUID strings sort the same way in JS and in Postgres,
  // so the expected order can be computed with a plain string sort
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
    const { ids } = await paginateForward({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      orderBy: { name: { firstName: 'AscNullsLast' } },
      first: 2,
    });

    // Global order must hold across pages: Alice..Eve
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

    await makeGraphqlAPIRequest(
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

    await makeGraphqlAPIRequest(
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

    await makeGraphqlAPIRequest(
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
    // Non-null amounts keep their micros order across pages
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

    await makeGraphqlAPIRequest(
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

// Empty TEXT values are stored as SQL NULL (write-side normalization) and
// presented as '' by the API: the scan's NULL block holds every empty row, and
// cursors read the raw SQL values so the continuation follows the scan exactly
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
    await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: namedCompanyIds.ALPHA, name: 'Alpha Corp' },
          { id: namedCompanyIds.BETA, name: 'Beta Inc' },
          // One explicitly empty, the others without the field: both store NULL
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
