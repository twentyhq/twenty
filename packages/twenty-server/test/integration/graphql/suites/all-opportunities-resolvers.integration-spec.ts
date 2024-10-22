import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const OPPORTUNITY_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const OPPORTUNITY_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const OPPORTUNITY_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const OPPORTUNITY_GQL_FIELDS = `
    id
    name
    createdAt
    updatedAt
    deletedAt
    searchVector
    stage
    position    
`;

describe('opportunities resolvers (integration)', () => {
  it('1. should create and return opportunities', async () => {
    const opportunityName1 = generateRecordName(OPPORTUNITY_1_ID);
    const opportunityName2 = generateRecordName(OPPORTUNITY_2_ID);
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      data: [
        {
          id: OPPORTUNITY_1_ID,
          name: opportunityName1,
        },
        {
          id: OPPORTUNITY_2_ID,
          name: opportunityName2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createOpportunities).toHaveLength(2);

    response.body.data.createOpportunities.forEach((opportunity) => {
      expect(opportunity).toHaveProperty('name');
      expect([opportunityName1, opportunityName2]).toContain(opportunity.name);

      expect(opportunity).toHaveProperty('id');
      expect(opportunity).toHaveProperty('createdAt');
      expect(opportunity).toHaveProperty('updatedAt');
      expect(opportunity).toHaveProperty('deletedAt');
      expect(opportunity).toHaveProperty('searchVector');
      expect(opportunity).toHaveProperty('stage');
      expect(opportunity).toHaveProperty('position');
    });
  });

  it('1b. should create and return one opportunity', async () => {
    const opportunityName3 = generateRecordName(OPPORTUNITY_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      data: {
        id: OPPORTUNITY_3_ID,
        name: opportunityName3,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdOpportunity = response.body.data.createOpportunity;

    expect(createdOpportunity).toHaveProperty('name');
    expect(createdOpportunity.name).toEqual(opportunityName3);

    expect(createdOpportunity).toHaveProperty('id');
    expect(createdOpportunity).toHaveProperty('createdAt');
    expect(createdOpportunity).toHaveProperty('updatedAt');
    expect(createdOpportunity).toHaveProperty('deletedAt');
    expect(createdOpportunity).toHaveProperty('searchVector');
    expect(createdOpportunity).toHaveProperty('stage');
    expect(createdOpportunity).toHaveProperty('position');
  });

  it('2. should find many opportunities', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.opportunities;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const opportunity = edges[0].node;

      expect(opportunity).toHaveProperty('id');
      expect(opportunity).toHaveProperty('createdAt');
      expect(opportunity).toHaveProperty('updatedAt');
      expect(opportunity).toHaveProperty('deletedAt');
      expect(opportunity).toHaveProperty('searchVector');
      expect(opportunity).toHaveProperty('stage');
      expect(opportunity).toHaveProperty('position');
    }
  });

  it('2b. should find one opportunity', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          eq: OPPORTUNITY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const opportunity = response.body.data.opportunity;

    expect(opportunity).toHaveProperty('name');

    expect(opportunity).toHaveProperty('id');
    expect(opportunity).toHaveProperty('createdAt');
    expect(opportunity).toHaveProperty('updatedAt');
    expect(opportunity).toHaveProperty('deletedAt');
    expect(opportunity).toHaveProperty('searchVector');
    expect(opportunity).toHaveProperty('stage');
    expect(opportunity).toHaveProperty('position');
  });

  it('3. should update many opportunities', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      data: {
        name: 'Updated Name',
      },
      filter: {
        id: {
          in: [OPPORTUNITY_1_ID, OPPORTUNITY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedOpportunities = response.body.data.updateOpportunities;

    expect(updatedOpportunities).toHaveLength(2);

    updatedOpportunities.forEach((opportunity) => {
      expect(opportunity.name).toEqual('Updated Name');
    });
  });

  it('3b. should update one opportunity', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      data: {
        name: 'New Name',
      },
      recordId: OPPORTUNITY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedOpportunity = response.body.data.updateOpportunity;

    expect(updatedOpportunity.name).toEqual('New Name');
  });

  it('4. should find many opportunities with updated name', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        name: {
          eq: 'Updated Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunities.edges).toHaveLength(2);
  });

  it('4b. should find one opportunity with updated name', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        name: {
          eq: 'New Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunity.name).toEqual('New Name');
  });

  it('5. should delete many opportunities', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          in: [OPPORTUNITY_1_ID, OPPORTUNITY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteOpportunities = response.body.data.deleteOpportunities;

    expect(deleteOpportunities).toHaveLength(2);

    deleteOpportunities.forEach((opportunity) => {
      expect(opportunity.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one opportunity', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      recordId: OPPORTUNITY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteOpportunity.deletedAt).toBeTruthy();
  });

  it('6. should not find many opportunities anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          in: [OPPORTUNITY_1_ID, OPPORTUNITY_2_ID],
        },
      },
    });

    const findOpportunitiesResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findOpportunitiesResponse.body.data.opportunities.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one opportunity anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          eq: OPPORTUNITY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunity).toBeNull();
  });

  it('7. should find many deleted opportunities with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          in: [OPPORTUNITY_1_ID, OPPORTUNITY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunities.edges).toHaveLength(2);
  });

  it('7b. should find one deleted opportunity with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          eq: OPPORTUNITY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunity.id).toEqual(OPPORTUNITY_3_ID);
  });

  it('8. should destroy many opportunities', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          in: [OPPORTUNITY_1_ID, OPPORTUNITY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyOpportunities).toHaveLength(2);
  });

  it('8b. should destroy one opportunity', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      recordId: OPPORTUNITY_3_ID,
    });

    const destroyOpportunitiesResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyOpportunitiesResponse.body.data.destroyOpportunity,
    ).toBeTruthy();
  });

  it('9. should not find many opportunities anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'opportunity',
      objectMetadataPluralName: 'opportunities',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          in: [OPPORTUNITY_1_ID, OPPORTUNITY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunities.edges).toHaveLength(0);
  });

  it('9b. should not find one opportunity anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'opportunity',
      gqlFields: OPPORTUNITY_GQL_FIELDS,
      filter: {
        id: {
          eq: OPPORTUNITY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.opportunity).toBeNull();
  });
});
