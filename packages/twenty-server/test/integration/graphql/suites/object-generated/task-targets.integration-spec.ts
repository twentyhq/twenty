import { randomUUID } from 'crypto';

import request from 'supertest';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

const client = request(`http://localhost:${APP_PORT}`);

const TASK_GQL_FIELDS = `
  id
  title
  deletedAt
`;

const TASK_TARGET_GQL_FIELDS = `
  id
  taskId
  deletedAt
`;

describe('taskTargetsResolver (e2e)', () => {
  it('should find many taskTargets', () => {
    const queryData = {
      query: `
        query taskTargets {
          taskTargets {
            edges {
              node {
                id
                createdAt
                updatedAt
                deletedAt
                taskId
                personId
                companyId
                opportunityId
                petId
                surveyResultId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.taskTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const taskTargets = edges[0].node;

          expect(taskTargets).toHaveProperty('id');
          expect(taskTargets).toHaveProperty('createdAt');
          expect(taskTargets).toHaveProperty('updatedAt');
          expect(taskTargets).toHaveProperty('deletedAt');
          expect(taskTargets).toHaveProperty('taskId');
          expect(taskTargets).toHaveProperty('personId');
          expect(taskTargets).toHaveProperty('companyId');
          expect(taskTargets).toHaveProperty('opportunityId');
          expect(taskTargets).toHaveProperty('petId');
          expect(taskTargets).toHaveProperty('surveyResultId');
        }
      });
  });
});

describe('taskTargets hooks on task actions', () => {
  const taskIds: string[] = [];
  const taskTargetIds: string[] = [];

  afterAll(async () => {
    if (taskIds.length > 0) {
      const destroyTasksOperation = destroyManyOperationFactory({
        objectMetadataSingularName: 'task',
        objectMetadataPluralName: 'tasks',
        gqlFields: 'id',
        filter: { id: { in: taskIds } },
      });

      await makeGraphqlAPIRequest(destroyTasksOperation);
    }

    if (taskTargetIds.length > 0) {
      const destroyTaskTargetsOperation = destroyManyOperationFactory({
        objectMetadataSingularName: 'taskTarget',
        objectMetadataPluralName: 'taskTargets',
        gqlFields: 'id',
        filter: { id: { in: taskTargetIds } },
      });

      await makeGraphqlAPIRequest(destroyTaskTargetsOperation);
    }
  });

  it('deleteOne task should soft delete related taskTargets', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();

    taskIds.push(taskId);
    taskTargetIds.push(taskTargetId);

    const createTaskOperation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId, title: 'Test Task for DeleteOne' },
    });

    await makeGraphqlAPIRequest(createTaskOperation);

    const createTaskTargetOperation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId, taskId },
    });

    await makeGraphqlAPIRequest(createTaskTargetOperation);

    const deleteTaskOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: taskId,
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteTaskOperation);

    expect(deleteResponse.body.data.deleteTask).toBeDefined();
    expect(deleteResponse.body.data.deleteTask.deletedAt).not.toBeNull();

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: { eq: taskTargetId },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(1);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).not.toBeNull();
  });

  it('deleteMany tasks should soft delete related taskTargets', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();
    const taskTargetId1 = randomUUID();
    const taskTargetId2 = randomUUID();

    taskIds.push(taskId1, taskId2);
    taskTargetIds.push(taskTargetId1, taskTargetId2);

    const createTask1Operation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId1, title: 'Test Task 1 for DeleteMany' },
    });

    const createTask2Operation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId2, title: 'Test Task 2 for DeleteMany' },
    });

    await Promise.all([
      makeGraphqlAPIRequest(createTask1Operation),
      makeGraphqlAPIRequest(createTask2Operation),
    ]);

    const createTaskTarget1Operation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId1, taskId: taskId1 },
    });

    const createTaskTarget2Operation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId2, taskId: taskId2 },
    });

    await Promise.all([
      makeGraphqlAPIRequest(createTaskTarget1Operation),
      makeGraphqlAPIRequest(createTaskTarget2Operation),
    ]);

    const deleteTasksOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: { id: { in: [taskId1, taskId2] } },
    });

    const deleteResponse = await makeGraphqlAPIRequest(deleteTasksOperation);

    expect(deleteResponse.body.data.deleteTasks).toHaveLength(2);

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: {
        id: { in: [taskTargetId1, taskTargetId2] },
        not: { deletedAt: { is: 'NULL' } },
      },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(2);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).not.toBeNull();
    expect(
      taskTargetResponse.body.data.taskTargets.edges[1].node.deletedAt,
    ).not.toBeNull();
  });

  it('restoreOne task should restore related taskTargets', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();

    taskIds.push(taskId);
    taskTargetIds.push(taskTargetId);

    const createTaskOperation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId, title: 'Test Task for RestoreOne' },
    });

    await makeGraphqlAPIRequest(createTaskOperation);

    const createTaskTargetOperation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId, taskId },
    });

    await makeGraphqlAPIRequest(createTaskTargetOperation);

    const deleteTaskOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: taskId,
    });

    await makeGraphqlAPIRequest(deleteTaskOperation);

    const restoreTaskOperation = restoreOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      recordId: taskId,
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreTaskOperation);

    expect(restoreResponse.body.data.restoreTask).toBeDefined();
    expect(restoreResponse.body.data.restoreTask.deletedAt).toBeNull();

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { eq: taskTargetId } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(1);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).toBeNull();
  });

  it('restoreMany tasks should restore related taskTargets', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();
    const taskTargetId1 = randomUUID();
    const taskTargetId2 = randomUUID();

    taskIds.push(taskId1, taskId2);
    taskTargetIds.push(taskTargetId1, taskTargetId2);

    const createTask1Operation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId1, title: 'Test Task 1 for RestoreMany' },
    });

    const createTask2Operation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId2, title: 'Test Task 2 for RestoreMany' },
    });

    await Promise.all([
      makeGraphqlAPIRequest(createTask1Operation),
      makeGraphqlAPIRequest(createTask2Operation),
    ]);

    const createTaskTarget1Operation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId1, taskId: taskId1 },
    });

    const createTaskTarget2Operation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId2, taskId: taskId2 },
    });

    await Promise.all([
      makeGraphqlAPIRequest(createTaskTarget1Operation),
      makeGraphqlAPIRequest(createTaskTarget2Operation),
    ]);

    const deleteTasksOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: { id: { in: [taskId1, taskId2] } },
    });

    await makeGraphqlAPIRequest(deleteTasksOperation);

    const restoreTasksOperation = restoreManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: TASK_GQL_FIELDS,
      filter: { id: { in: [taskId1, taskId2] } },
    });

    const restoreResponse = await makeGraphqlAPIRequest(restoreTasksOperation);

    expect(restoreResponse.body.data.restoreTasks).toHaveLength(2);

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { in: [taskTargetId1, taskTargetId2] } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(2);
    expect(
      taskTargetResponse.body.data.taskTargets.edges[0].node.deletedAt,
    ).toBeNull();
    expect(
      taskTargetResponse.body.data.taskTargets.edges[1].node.deletedAt,
    ).toBeNull();
  });

  it('destroyOne task should destroy related taskTargets', async () => {
    const taskId = randomUUID();
    const taskTargetId = randomUUID();

    taskIds.push(taskId);

    const createTaskOperation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId, title: 'Test Task for DestroyOne' },
    });

    await makeGraphqlAPIRequest(createTaskOperation);

    const createTaskTargetOperation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId, taskId },
    });

    await makeGraphqlAPIRequest(createTaskTargetOperation);

    const destroyTaskOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: 'id',
      recordId: taskId,
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyTaskOperation);

    expect(destroyResponse.body.data.destroyTask).toBeDefined();

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { eq: taskTargetId } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(0);
  });

  it('destroyMany tasks should destroy related taskTargets', async () => {
    const taskId1 = randomUUID();
    const taskId2 = randomUUID();
    const taskTargetId1 = randomUUID();
    const taskTargetId2 = randomUUID();

    taskIds.push(taskId1, taskId2);

    const createTask1Operation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId1, title: 'Test Task 1 for DestroyMany' },
    });

    const createTask2Operation = createOneOperationFactory({
      objectMetadataSingularName: 'task',
      gqlFields: TASK_GQL_FIELDS,
      data: { id: taskId2, title: 'Test Task 2 for DestroyMany' },
    });

    await Promise.all([
      makeGraphqlAPIRequest(createTask1Operation),
      makeGraphqlAPIRequest(createTask2Operation),
    ]);

    const createTaskTarget1Operation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId1, taskId: taskId1 },
    });

    const createTaskTarget2Operation = createOneOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      data: { id: taskTargetId2, taskId: taskId2 },
    });

    await Promise.all([
      makeGraphqlAPIRequest(createTaskTarget1Operation),
      makeGraphqlAPIRequest(createTaskTarget2Operation),
    ]);

    const destroyTasksOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'task',
      objectMetadataPluralName: 'tasks',
      gqlFields: 'id',
      filter: { id: { in: [taskId1, taskId2] } },
    });

    const destroyResponse = await makeGraphqlAPIRequest(destroyTasksOperation);

    expect(destroyResponse.body.data.destroyTasks).toHaveLength(2);

    const findTaskTargetsOperation = findManyOperationFactory({
      objectMetadataSingularName: 'taskTarget',
      objectMetadataPluralName: 'taskTargets',
      gqlFields: TASK_TARGET_GQL_FIELDS,
      filter: { id: { in: [taskTargetId1, taskTargetId2] } },
    });

    const taskTargetResponse = await makeGraphqlAPIRequest(
      findTaskTargetsOperation,
    );

    expect(taskTargetResponse.body.data.taskTargets.edges).toHaveLength(0);
  });
});
