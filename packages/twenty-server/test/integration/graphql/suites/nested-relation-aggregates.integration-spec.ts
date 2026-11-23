import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const FIRST_COMPANY_ID = '20202020-fffd-4000-8000-000000000001';
const SECOND_COMPANY_ID = '20202020-fffd-4000-8000-000000000002';
const COMPANY_IDS = [FIRST_COMPANY_ID, SECOND_COMPANY_ID];

const buildOpportunityId = (index: number) =>
  `20202020-eeec-4000-8000-${index.toString().padStart(12, '0')}`;

const buildOpportunity = ({
  index,
  companyId,
  stage,
  amount,
  closeDate,
}: {
  index: number;
  companyId: string;
  stage: string;
  amount: number;
  closeDate: string;
}) => ({
  id: buildOpportunityId(index),
  name: `Nested aggregates opportunity ${index}`,
  companyId,
  stage,
  amount: { amountMicros: amount * 1_000_000, currencyCode: 'USD' },
  closeDate,
});

const OPPORTUNITIES = [
  buildOpportunity({
    index: 1,
    companyId: FIRST_COMPANY_ID,
    stage: 'NEW',
    amount: 100,
    closeDate: '2026-03-01T00:00:00.000Z',
  }),
  buildOpportunity({
    index: 2,
    companyId: FIRST_COMPANY_ID,
    stage: 'NEW',
    amount: 300,
    closeDate: '2026-01-01T00:00:00.000Z',
  }),
  buildOpportunity({
    index: 3,
    companyId: FIRST_COMPANY_ID,
    stage: 'CUSTOMER',
    amount: 5000,
    closeDate: '2025-06-01T00:00:00.000Z',
  }),
  buildOpportunity({
    index: 4,
    companyId: SECOND_COMPANY_ID,
    stage: 'CUSTOMER',
    amount: 700,
    closeDate: '2026-05-01T00:00:00.000Z',
  }),
];

type OpportunityAggregates = {
  totalCount: number;
  sumAmountAmountMicros: number | null;
  avgAmountAmountMicros: number | null;
  minCloseDate: string | null;
};

describe('Aggregates of a filtered nested one-to-many relation (e2e)', () => {
  beforeAll(async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          { id: FIRST_COMPANY_ID, name: 'Nested aggregates company one' },
          { id: SECOND_COMPANY_ID, name: 'Nested aggregates company two' },
        ],
        upsert: false,
      }),
    );

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        data: OPPORTUNITIES,
        upsert: false,
      }),
    );
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: 'id',
        filter: { id: { in: OPPORTUNITIES.map(({ id }) => id) } },
      }),
    );

    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        filter: { id: { in: COMPANY_IDS } },
      }),
    );

    await waitForAllJobsToFinish();
  });

  it('computes each aggregate per parent over the related records the filter keeps', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `
          id
          openOpportunities: opportunities(filter: { stage: { eq: NEW } }) {
            totalCount
            sumAmountAmountMicros
            avgAmountAmountMicros
            minCloseDate
            edges { node { id } }
          }
        `,
        filter: { id: { in: COMPANY_IDS } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const aggregatesByCompanyId = Object.fromEntries(
      response.body.data.companies.edges.map(
        ({
          node,
        }: {
          node: { id: string; openOpportunities: OpportunityAggregates };
        }) => [
          node.id,
          {
            totalCount: node.openOpportunities.totalCount,
            sumAmountAmountMicros: node.openOpportunities.sumAmountAmountMicros,
            avgAmountAmountMicros: node.openOpportunities.avgAmountAmountMicros,
            minCloseDate: node.openOpportunities.minCloseDate,
          },
        ],
      ),
    );

    expect(aggregatesByCompanyId[FIRST_COMPANY_ID]).toEqual({
      totalCount: 2,
      sumAmountAmountMicros: 400_000_000,
      avgAmountAmountMicros: 200_000_000,
      minCloseDate: expect.stringContaining('2026-01-01'),
    });
    expect(aggregatesByCompanyId[SECOND_COMPANY_ID]).toMatchObject({
      totalCount: 0,
    });
    expect(
      aggregatesByCompanyId[SECOND_COMPANY_ID].sumAmountAmountMicros ?? null,
    ).toBeNull();
  });

  it('keeps the aggregates of an unfiltered alias apart from a filtered one', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: `
          id
          allOpportunities: opportunities {
            sumAmountAmountMicros
            edges { node { id } }
          }
          wonOpportunities: opportunities(filter: { stage: { eq: CUSTOMER } }) {
            sumAmountAmountMicros
            edges { node { id } }
          }
        `,
        filter: { id: { eq: FIRST_COMPANY_ID } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const [{ node }] = response.body.data.companies.edges;

    expect(node.allOpportunities.sumAmountAmountMicros).toBe(5_400_000_000);
    expect(node.wonOpportunities.sumAmountAmountMicros).toBe(5_000_000_000);
  });
});
