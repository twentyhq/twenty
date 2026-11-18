import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { waitForTimelineActivities } from 'test/integration/utils/wait-for-timeline-activities.util';

const OPPORTUNITY_GQL_FIELDS = `
  id
  name
`;

describe('opportunities merge resolvers (integration)', () => {
  let createdOpportunityIds: string[] = [];

  afterEach(async () => {
    await deleteRecordsByIds('opportunity', createdOpportunityIds);
    createdOpportunityIds = [];
  });

  it('should merge records of an object without duplicate criteria', async () => {
    const createResponse = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        data: [{ name: 'Deal A' }, { name: 'Deal B' }],
      }),
    );

    const [opportunityA, opportunityB] =
      createResponse.body.data.createOpportunities;

    createdOpportunityIds.push(opportunityA.id, opportunityB.id);

    await waitForTimelineActivities('targetOpportunityId', [
      opportunityA.id,
      opportunityB.id,
    ]);

    const mergeResponse = await makeGraphqlApiRequest(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'opportunities',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        ids: [opportunityA.id, opportunityB.id],
        conflictPriorityIndex: 0,
      }),
    );

    expect(mergeResponse.body.errors).toBeUndefined();
    expect(mergeResponse.body.data.mergeOpportunities).toMatchObject({
      id: opportunityA.id,
      name: 'Deal A',
    });

    const findMergedAwayResponse = await makeGraphqlApiRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'opportunity',
        gqlFields: OPPORTUNITY_GQL_FIELDS,
        filter: { id: { eq: opportunityB.id } },
      }),
    );

    expect(findMergedAwayResponse.body.data.opportunity).toBeNull();
  });

  it('should keep the other record amount when the priority amount only has a currency code', async () => {
    const gqlFields = `
      id
      amount {
        amountMicros
        currencyCode
      }
    `;

    const createResponse = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'opportunity',
        objectMetadataPluralName: 'opportunities',
        gqlFields,
        data: [
          {
            name: 'Renewal without amount',
            amount: { amountMicros: null, currencyCode: 'USD' },
          },
          {
            name: 'Renewal with amount',
            amount: { amountMicros: 24000000000, currencyCode: 'USD' },
          },
        ],
      }),
    );

    const [emptyAmountOpportunity, opportunityWithAmount] =
      createResponse.body.data.createOpportunities;

    createdOpportunityIds.push(
      emptyAmountOpportunity.id,
      opportunityWithAmount.id,
    );

    await waitForTimelineActivities('targetOpportunityId', [
      emptyAmountOpportunity.id,
      opportunityWithAmount.id,
    ]);

    const mergeResponse = await makeGraphqlApiRequest(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'opportunities',
        gqlFields,
        ids: [emptyAmountOpportunity.id, opportunityWithAmount.id],
        conflictPriorityIndex: 0,
      }),
    );

    expect(mergeResponse.body.errors).toBeUndefined();
    expect(mergeResponse.body.data.mergeOpportunities).toMatchObject({
      id: emptyAmountOpportunity.id,
      amount: { amountMicros: 24000000000, currencyCode: 'USD' },
    });
  });
});
