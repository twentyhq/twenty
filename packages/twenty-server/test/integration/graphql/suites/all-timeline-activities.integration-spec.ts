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

const TIMELINE_ACTIVITY_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const TIMELINE_ACTIVITY_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const TIMELINE_ACTIVITY_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const TIMELINE_ACTIVITY_GQL_FIELDS = `
  id
  happensAt
  name
  properties
  linkedRecordCachedName
  linkedRecordId
  linkedObjectMetadataId
  createdAt
  updatedAt
  deletedAt
  workspaceMemberId
  personId
  companyId
  opportunityId
  noteId
  taskId
  workflowId
  workflowVersionId
  workflowRunId
  rocketId
`;

describe('timelineActivities resolvers (integration)', () => {
  it('1. should create and return timelineActivities', async () => {
    const timelineActivityName1 = generateRecordName(TIMELINE_ACTIVITY_1_ID);
    const timelineActivityName2 = generateRecordName(TIMELINE_ACTIVITY_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      data: [
        {
          id: TIMELINE_ACTIVITY_1_ID,
          name: timelineActivityName1,
        },
        {
          id: TIMELINE_ACTIVITY_2_ID,
          name: timelineActivityName2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createTimelineActivities).toHaveLength(2);

    response.body.data.createTimelineActivities.forEach((timelineActivity) => {
      expect(timelineActivity).toHaveProperty('name');
      expect([timelineActivityName1, timelineActivityName2]).toContain(
        timelineActivity.name,
      );
      expect(timelineActivity).toHaveProperty('id');
      expect(timelineActivity).toHaveProperty('happensAt');
      expect(timelineActivity).toHaveProperty('properties');
      expect(timelineActivity).toHaveProperty('linkedRecordCachedName');
      expect(timelineActivity).toHaveProperty('linkedRecordId');
      expect(timelineActivity).toHaveProperty('linkedObjectMetadataId');
      expect(timelineActivity).toHaveProperty('createdAt');
      expect(timelineActivity).toHaveProperty('updatedAt');
      expect(timelineActivity).toHaveProperty('deletedAt');
      expect(timelineActivity).toHaveProperty('workspaceMemberId');
      expect(timelineActivity).toHaveProperty('personId');
      expect(timelineActivity).toHaveProperty('companyId');
      expect(timelineActivity).toHaveProperty('opportunityId');
      expect(timelineActivity).toHaveProperty('noteId');
      expect(timelineActivity).toHaveProperty('taskId');
      expect(timelineActivity).toHaveProperty('workflowId');
      expect(timelineActivity).toHaveProperty('workflowVersionId');
      expect(timelineActivity).toHaveProperty('workflowRunId');
      expect(timelineActivity).toHaveProperty('rocketId');
    });
  });

  it('1b. should create and return one timelineActivity', async () => {
    const timelineActivityName = generateRecordName(TIMELINE_ACTIVITY_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      data: {
        id: TIMELINE_ACTIVITY_3_ID,
        name: timelineActivityName,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdTimelineActivity = response.body.data.createTimelineActivity;

    expect(createdTimelineActivity).toHaveProperty('name');
    expect(createdTimelineActivity.name).toEqual(timelineActivityName);
    expect(createdTimelineActivity).toHaveProperty('id');
    expect(createdTimelineActivity).toHaveProperty('happensAt');
    expect(createdTimelineActivity).toHaveProperty('properties');
    expect(createdTimelineActivity).toHaveProperty('linkedRecordCachedName');
    expect(createdTimelineActivity).toHaveProperty('linkedRecordId');
    expect(createdTimelineActivity).toHaveProperty('linkedObjectMetadataId');
    expect(createdTimelineActivity).toHaveProperty('createdAt');
    expect(createdTimelineActivity).toHaveProperty('updatedAt');
    expect(createdTimelineActivity).toHaveProperty('deletedAt');
    expect(createdTimelineActivity).toHaveProperty('workspaceMemberId');
    expect(createdTimelineActivity).toHaveProperty('personId');
    expect(createdTimelineActivity).toHaveProperty('companyId');
    expect(createdTimelineActivity).toHaveProperty('opportunityId');
    expect(createdTimelineActivity).toHaveProperty('noteId');
    expect(createdTimelineActivity).toHaveProperty('taskId');
    expect(createdTimelineActivity).toHaveProperty('workflowId');
    expect(createdTimelineActivity).toHaveProperty('workflowVersionId');
    expect(createdTimelineActivity).toHaveProperty('workflowRunId');
    expect(createdTimelineActivity).toHaveProperty('rocketId');
  });

  it('2. should find many timelineActivities', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.timelineActivities;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const timelineActivities = data.edges[0].node;

      expect(timelineActivities).toHaveProperty('happensAt');
      expect(timelineActivities).toHaveProperty('name');
      expect(timelineActivities).toHaveProperty('properties');
      expect(timelineActivities).toHaveProperty('linkedRecordCachedName');
      expect(timelineActivities).toHaveProperty('linkedRecordId');
      expect(timelineActivities).toHaveProperty('linkedObjectMetadataId');
      expect(timelineActivities).toHaveProperty('id');
      expect(timelineActivities).toHaveProperty('createdAt');
      expect(timelineActivities).toHaveProperty('updatedAt');
      expect(timelineActivities).toHaveProperty('deletedAt');
      expect(timelineActivities).toHaveProperty('workspaceMemberId');
      expect(timelineActivities).toHaveProperty('personId');
      expect(timelineActivities).toHaveProperty('companyId');
      expect(timelineActivities).toHaveProperty('opportunityId');
      expect(timelineActivities).toHaveProperty('noteId');
      expect(timelineActivities).toHaveProperty('taskId');
      expect(timelineActivities).toHaveProperty('workflowId');
      expect(timelineActivities).toHaveProperty('workflowVersionId');
      expect(timelineActivities).toHaveProperty('workflowRunId');
      expect(timelineActivities).toHaveProperty('rocketId');
    }
  });

  it('2b. should find one timelineActivity', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          eq: TIMELINE_ACTIVITY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const timelineActivity = response.body.data.timelineActivity;

    expect(timelineActivity).toHaveProperty('happensAt');
    expect(timelineActivity).toHaveProperty('name');
    expect(timelineActivity).toHaveProperty('properties');
    expect(timelineActivity).toHaveProperty('linkedRecordCachedName');
    expect(timelineActivity).toHaveProperty('linkedRecordId');
    expect(timelineActivity).toHaveProperty('linkedObjectMetadataId');
    expect(timelineActivity).toHaveProperty('id');
    expect(timelineActivity).toHaveProperty('createdAt');
    expect(timelineActivity).toHaveProperty('updatedAt');
    expect(timelineActivity).toHaveProperty('deletedAt');
    expect(timelineActivity).toHaveProperty('workspaceMemberId');
    expect(timelineActivity).toHaveProperty('personId');
    expect(timelineActivity).toHaveProperty('companyId');
    expect(timelineActivity).toHaveProperty('opportunityId');
    expect(timelineActivity).toHaveProperty('noteId');
    expect(timelineActivity).toHaveProperty('taskId');
    expect(timelineActivity).toHaveProperty('workflowId');
    expect(timelineActivity).toHaveProperty('workflowVersionId');
    expect(timelineActivity).toHaveProperty('workflowRunId');
    expect(timelineActivity).toHaveProperty('rocketId');
  });

  it('3. should update many timelineActivities', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      data: {
        name: 'Updated Name',
      },
      filter: {
        id: {
          in: [TIMELINE_ACTIVITY_1_ID, TIMELINE_ACTIVITY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedTimelineActivities =
      response.body.data.updateTimelineActivities;

    expect(updatedTimelineActivities).toHaveLength(2);

    updatedTimelineActivities.forEach((timelineActivity) => {
      expect(timelineActivity.name).toEqual('Updated Name');
    });
  });

  it('3b. should update one timelineActivity', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      data: {
        name: 'New Name',
      },
      recordId: TIMELINE_ACTIVITY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedTimelineActivity = response.body.data.updateTimelineActivity;

    expect(updatedTimelineActivity.name).toEqual('New Name');
  });

  it('4. should find many timelineActivities with updated name', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        name: {
          eq: 'Updated Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivities.edges).toHaveLength(2);
  });

  it('4b. should find one timelineActivity with updated name', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        name: {
          eq: 'New Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivity.name).toEqual('New Name');
  });

  it('5. should delete many timelineActivities', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          in: [TIMELINE_ACTIVITY_1_ID, TIMELINE_ACTIVITY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedTimelineActivities =
      response.body.data.deleteTimelineActivities;

    expect(deletedTimelineActivities).toHaveLength(2);

    deletedTimelineActivities.forEach((timelineActivity) => {
      expect(timelineActivity.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one timelineActivity', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      recordId: TIMELINE_ACTIVITY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteTimelineActivity.deletedAt).toBeTruthy();
  });

  it('6. should not find many timelineActivities anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          in: [TIMELINE_ACTIVITY_1_ID, TIMELINE_ACTIVITY_2_ID],
        },
      },
    });

    const findTimelineActivitiesResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findTimelineActivitiesResponse.body.data.timelineActivities.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one timelineActivity anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          eq: TIMELINE_ACTIVITY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivity).toBeNull();
  });

  it('7. should find many deleted timelineActivities with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          in: [TIMELINE_ACTIVITY_1_ID, TIMELINE_ACTIVITY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivities.edges).toHaveLength(2);
  });

  it('7b. should find one deleted timelineActivity with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          eq: TIMELINE_ACTIVITY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivity.id).toEqual(
      TIMELINE_ACTIVITY_3_ID,
    );
  });

  it('8. should destroy many timelineActivities', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          in: [TIMELINE_ACTIVITY_1_ID, TIMELINE_ACTIVITY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyTimelineActivities).toHaveLength(2);
  });

  it('8b. should destroy one timelineActivity', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      recordId: TIMELINE_ACTIVITY_3_ID,
    });

    const destroyTimelineActivityResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyTimelineActivityResponse.body.data.destroyTimelineActivity,
    ).toBeTruthy();
  });

  it('9. should not find many timelineActivities anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          in: [TIMELINE_ACTIVITY_1_ID, TIMELINE_ACTIVITY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivities.edges).toHaveLength(0);
  });

  it('9b. should not find one timelineActivity anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      gqlFields: TIMELINE_ACTIVITY_GQL_FIELDS,
      filter: {
        id: {
          eq: TIMELINE_ACTIVITY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.timelineActivity).toBeNull();
  });
});
