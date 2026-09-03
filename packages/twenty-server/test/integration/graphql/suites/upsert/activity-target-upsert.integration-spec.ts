import { randomUUID } from 'crypto';
import { isDefined } from 'twenty-shared/utils';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

describe('activity target upsert', () => {
  it('keeps one live task target and restores it after deletion', async () => {
    const taskId = randomUUID();
    const personId = randomUUID();
    let taskTargetId: string | undefined;

    try {
      await createOneOperation({
        objectMetadataSingularName: 'task',
        gqlFields: 'id',
        input: { id: taskId, title: 'Activity target upsert task' },
      });
      await createOneOperation({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        input: {
          id: personId,
          name: { firstName: 'Activity target', lastName: 'upsert' },
        },
      });

      const createTaskTarget = () =>
        makeGraphqlAPIRequest(
          createManyOperationFactory({
            objectMetadataSingularName: 'taskTarget',
            objectMetadataPluralName: 'taskTargets',
            gqlFields: 'id deletedAt taskId targetPersonId',
            data: [{ taskId, targetPersonId: personId }],
            upsert: true,
          }),
        );

      const firstCreateResponse = await createTaskTarget();
      const createdTaskTargetId =
        firstCreateResponse.body.data.createTaskTargets[0].id;

      taskTargetId = createdTaskTargetId;

      const repeatedCreateResponse = await createTaskTarget();

      expect(repeatedCreateResponse.body.data.createTaskTargets[0]).toEqual(
        expect.objectContaining({ id: createdTaskTargetId, deletedAt: null }),
      );

      await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'taskTarget',
          gqlFields: 'id',
          recordId: createdTaskTargetId,
        }),
      );

      const restoreResponse = await createTaskTarget();

      expect(restoreResponse.body.data.createTaskTargets[0]).toEqual(
        expect.objectContaining({ id: createdTaskTargetId, deletedAt: null }),
      );

      const findResponse = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'taskTarget',
          objectMetadataPluralName: 'taskTargets',
          gqlFields: 'id',
          filter: {
            taskId: { eq: taskId },
            targetPersonId: { eq: personId },
          },
        }),
      );

      expect(findResponse.body.data.taskTargets.edges).toHaveLength(1);
    } finally {
      if (isDefined(taskTargetId)) {
        await makeGraphqlAPIRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'taskTarget',
            gqlFields: 'id',
            recordId: taskTargetId,
          }),
        );
      }

      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'task',
          gqlFields: 'id',
          recordId: taskId,
        }),
      );
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: personId,
        }),
      );
    }
  });
});
