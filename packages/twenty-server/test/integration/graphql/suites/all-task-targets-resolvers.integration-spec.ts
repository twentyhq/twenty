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

const TASK_TARGET_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const TASK_TARGET_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const TASK_TARGET_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const PERSON_1_ID = '777a8457-eb2d-40ac-a707-441b615b6989';
const PERSON_2_ID = '777a8457-eb2d-40ac-a707-331b615b6989';
const TASK_TARGET_GQL_FIELDS = `
    id
    createdAt
    deletedAt
    rocketId
    personId
    companyId
    opportunityId
    person{
      id
    }
`;

describe('taskTargets resolvers (integration)', () => {
  beforeAll(async () => {
    const personName1 = generateRecordName(PERSON_1_ID);
    const personName2 = generateRecordName(PERSON_2_ID);
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `id`,
      data: [
        {
          id: PERSON_1_ID,
          name: {
            firstName: personName1,
            lastName: personName1,
          },
        },
        {
          id: PERSON_2_ID,
          name: {
            firstName: personName2,
            lastName: personName2,
          },
        },
      ],
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  afterAll(async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: `id`,
      filter: {
        id: {
          in: [PERSON_1_ID, PERSON_2_ID],
        },
      },
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });
  it('1. should create and return taskTargets', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: [
        {
          id: TASK_TARGET_1_ID,
        },
        {
          id: TASK_TARGET_2_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createTaskTargets).toHaveLength(2);

    response.body.data.createTaskTargets.forEach((taskTarget) => {
      expect(taskTarget).toHaveProperty('id');
      expect(taskTarget).toHaveProperty('createdAt');
      expect(taskTarget).toHaveProperty('deletedAt');
      expect(taskTarget).toHaveProperty('rocketId');
      expect(taskTarget).toHaveProperty('personId');
      expect(taskTarget).toHaveProperty('companyId');
      expect(taskTarget).toHaveProperty('opportunityId');
      expect(taskTarget).toHaveProperty('person');
    });
  });

  it('1b. should create and return one taskTarget', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: {
        id: TASK_TARGET_3_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdTaskTarget = response.body.data.createTaskTarget;

    expect(createdTaskTarget).toHaveProperty('id');
    expect(createdTaskTarget).toHaveProperty('createdAt');
    expect(createdTaskTarget).toHaveProperty('deletedAt');
    expect(createdTaskTarget).toHaveProperty('rocketId');
    expect(createdTaskTarget).toHaveProperty('personId');
    expect(createdTaskTarget).toHaveProperty('companyId');
    expect(createdTaskTarget).toHaveProperty('opportunityId');
    expect(createdTaskTarget).toHaveProperty('person');
  });

  it('2. should find many taskTargets', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.taskTargets;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const taskTarget = edges[0].node;

      expect(taskTarget).toHaveProperty('id');
      expect(taskTarget).toHaveProperty('createdAt');
      expect(taskTarget).toHaveProperty('deletedAt');
      expect(taskTarget).toHaveProperty('rocketId');
      expect(taskTarget).toHaveProperty('personId');
      expect(taskTarget).toHaveProperty('companyId');
      expect(taskTarget).toHaveProperty('opportunityId');
      expect(taskTarget).toHaveProperty('person');
    }
  });

  it('2b. should find one taskTarget', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_TARGET_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const taskTarget = response.body.data.taskTarget;

    expect(taskTarget).toHaveProperty('id');
    expect(taskTarget).toHaveProperty('createdAt');
    expect(taskTarget).toHaveProperty('deletedAt');
    expect(taskTarget).toHaveProperty('rocketId');
    expect(taskTarget).toHaveProperty('personId');
    expect(taskTarget).toHaveProperty('companyId');
    expect(taskTarget).toHaveProperty('opportunityId');
    expect(taskTarget).toHaveProperty('person');
  });

  it('3. should update many taskTargets', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: {
        personId: PERSON_1_ID,
      },
      filter: {
        id: {
          in: [TASK_TARGET_1_ID, TASK_TARGET_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedTaskTargets = response.body.data.updateTaskTargets;

    expect(updatedTaskTargets).toHaveLength(2);

    updatedTaskTargets.forEach((taskTarget) => {
      expect(taskTarget.person.id).toEqual(PERSON_1_ID);
    });
  });

  it('3b. should update one taskTarget', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: {
        personId: PERSON_2_ID,
      },
      recordId: TASK_TARGET_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedTaskTarget = response.body.data.updateTaskTarget;

    expect(updatedTaskTarget.person.id).toEqual(PERSON_2_ID);
  });

  it('4. should find many taskTargets with updated personId', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        personId: {
          eq: PERSON_1_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTargets.edges).toHaveLength(2);
  });

  it('4b. should find one taskTarget with updated personId', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        personId: {
          eq: PERSON_2_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTarget.person.id).toEqual(PERSON_2_ID);
  });

  it('5. should delete many taskTargets', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_TARGET_1_ID, TASK_TARGET_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteTaskTargets = response.body.data.deleteTaskTargets;

    expect(deleteTaskTargets).toHaveLength(2);

    deleteTaskTargets.forEach((taskTarget) => {
      expect(taskTarget.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one taskTarget', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      recordId: TASK_TARGET_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteTaskTarget.deletedAt).toBeTruthy();
  });

  it('6. should not find many taskTargets anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_TARGET_1_ID, TASK_TARGET_2_ID],
        },
      },
    });

    const findTaskTargetsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(findTaskTargetsResponse.body.data.taskTargets.edges).toHaveLength(0);
  });

  it('6b. should not find one taskTarget anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_TARGET_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTarget).toBeNull();
  });

  it('7. should find many deleted taskTargets with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_TARGET_1_ID, TASK_TARGET_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTargets.edges).toHaveLength(2);
  });

  it('7b. should find one deleted taskTarget with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_TARGET_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTarget.id).toEqual(TASK_TARGET_3_ID);
  });

  it('8. should destroy many taskTargets', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_TARGET_1_ID, TASK_TARGET_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyTaskTargets).toHaveLength(2);
  });

  it('8b. should destroy one taskTarget', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      recordId: TASK_TARGET_3_ID,
    });

    const destroyTaskTargetsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyTaskTargetsResponse.body.data.destroyTaskTarget).toBeTruthy();
  });

  it('9. should not find many taskTargets anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_TARGET_1_ID, TASK_TARGET_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTargets.edges).toHaveLength(0);
  });

  it('9b. should not find one taskTarget anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_TARGET_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.taskTarget).toBeNull();
  });
});
