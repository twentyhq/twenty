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

const TASK_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const TASK_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const TASK_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const TASK_GQL_FIELDS = `
    id
    title
    createdAt
    updatedAt
    deletedAt
    body
    position    
`;

describe('tasks resolvers (integration)', () => {
  it('1. should create and return tasks', async () => {
    const taskTitle1 = generateRecordName(TASK_1_ID);
    const taskTitle2 = generateRecordName(TASK_2_ID);
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      data: [
        {
          id: TASK_1_ID,
          title: taskTitle1,
        },
        {
          id: TASK_2_ID,
          title: taskTitle2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createTasks).toHaveLength(2);

    response.body.data.createTasks.forEach((task) => {
      expect(task).toHaveProperty('title');
      expect([taskTitle1, taskTitle2]).toContain(task.title);

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
      expect(task).toHaveProperty('deletedAt');
      expect(task).toHaveProperty('body');
      expect(task).toHaveProperty('position');
    });
  });

  it('1b. should create and return one task', async () => {
    const taskTitle3 = generateRecordName(TASK_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: {
        id: TASK_3_ID,
        title: taskTitle3,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdTask = response.body.data.createTask;

    expect(createdTask).toHaveProperty('title');
    expect(createdTask.title).toEqual(taskTitle3);

    expect(createdTask).toHaveProperty('id');
    expect(createdTask).toHaveProperty('createdAt');
    expect(createdTask).toHaveProperty('updatedAt');
    expect(createdTask).toHaveProperty('deletedAt');
    expect(createdTask).toHaveProperty('body');
    expect(createdTask).toHaveProperty('position');
  });

  it('2. should find many tasks', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.tasks;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const task = edges[0].node;

      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
      expect(task).toHaveProperty('deletedAt');
      expect(task).toHaveProperty('body');
      expect(task).toHaveProperty('position');
    }
  });

  it('2b. should find one task', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const task = response.body.data.task;

    expect(task).toHaveProperty('title');

    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('createdAt');
    expect(task).toHaveProperty('updatedAt');
    expect(task).toHaveProperty('deletedAt');
    expect(task).toHaveProperty('body');
    expect(task).toHaveProperty('position');
  });

  it('3. should update many tasks', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      data: {
        title: 'Updated Title',
      },
      filter: {
        id: {
          in: [TASK_1_ID, TASK_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedTasks = response.body.data.updateTasks;

    expect(updatedTasks).toHaveLength(2);

    updatedTasks.forEach((task) => {
      expect(task.title).toEqual('Updated Title');
    });
  });

  it('3b. should update one task', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: {
        title: 'New Title',
      },
      recordId: TASK_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedTask = response.body.data.updateTask;

    expect(updatedTask.title).toEqual('New Title');
  });

  it('4. should find many tasks with updated title', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        title: {
          eq: 'Updated Title',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.tasks.edges).toHaveLength(2);
  });

  it('4b. should find one task with updated title', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        title: {
          eq: 'New Title',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.task.title).toEqual('New Title');
  });

  it('5. should delete many tasks', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_1_ID, TASK_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteTasks = response.body.data.deleteTasks;

    expect(deleteTasks).toHaveLength(2);

    deleteTasks.forEach((task) => {
      expect(task.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one task', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: TASK_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteTask.deletedAt).toBeTruthy();
  });

  it('6. should not find many tasks anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_1_ID, TASK_2_ID],
        },
      },
    });

    const findTasksResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findTasksResponse.body.data.tasks.edges).toHaveLength(0);
  });

  it('6b. should not find one task anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.task).toBeNull();
  });

  it('7. should find many deleted tasks with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_1_ID, TASK_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.tasks.edges).toHaveLength(2);
  });

  it('7b. should find one deleted task with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.task.id).toEqual(TASK_3_ID);
  });

  it('8. should destroy many tasks', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_1_ID, TASK_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyTasks).toHaveLength(2);
  });

  it('8b. should destroy one task', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: TASK_3_ID,
    });

    const destroyTasksResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyTasksResponse.body.data.destroyTask).toBeTruthy();
  });

  it('9. should not find many tasks anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          in: [TASK_1_ID, TASK_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.tasks.edges).toHaveLength(0);
  });

  it('9b. should not find one task anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      filter: {
        id: {
          eq: TASK_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.task).toBeNull();
  });
});
