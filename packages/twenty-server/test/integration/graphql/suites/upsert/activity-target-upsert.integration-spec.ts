import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';

describe('activity target upsert', () => {
  it.each([
    {
      activityName: 'task',
      targetName: 'taskTarget',
      targetNamePlural: 'taskTargets',
      createTargetsKey: 'createTaskTargets',
      activityIdField: 'taskId',
    },
    {
      activityName: 'note',
      targetName: 'noteTarget',
      targetNamePlural: 'noteTargets',
      createTargetsKey: 'createNoteTargets',
      activityIdField: 'noteId',
    },
  ])(
    'keeps one live $targetName when a removed target is added again and its $activityName is restored',
    async ({
      activityName,
      targetName,
      targetNamePlural,
      createTargetsKey,
      activityIdField,
    }) => {
      const activityId = randomUUID();
      const personId = randomUUID();
      const targetIds: string[] = [];

      const findLiveTargetIds = async (): Promise<string[]> => {
        const findResponse = await makeGraphqlApiRequest(
          findManyOperationFactory({
            objectMetadataSingularName: targetName,
            objectMetadataPluralName: targetNamePlural,
            gqlFields: 'id',
            filter: {
              [activityIdField]: { eq: activityId },
              targetPersonId: { eq: personId },
            },
          }),
        );

        return findResponse.body.data[targetNamePlural].edges.map(
          ({ node }: { node: { id: string } }) => node.id,
        );
      };

      try {
        await createOneOperation({
          objectMetadataSingularName: activityName,
          gqlFields: 'id',
          input: { id: activityId, title: 'Activity target upsert' },
        });
        await createOneOperation({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          input: {
            id: personId,
            name: { firstName: 'Activity target', lastName: 'upsert' },
          },
        });

        const upsertTarget = async (): Promise<{
          id: string;
          deletedAt: string | null;
        }> => {
          const response = await makeGraphqlApiRequest(
            createManyOperationFactory({
              objectMetadataSingularName: targetName,
              objectMetadataPluralName: targetNamePlural,
              gqlFields: 'id deletedAt',
              data: [
                { [activityIdField]: activityId, targetPersonId: personId },
              ],
              upsert: true,
            }),
          );

          return response.body.data[createTargetsKey][0];
        };

        const createdTarget = await upsertTarget();

        targetIds.push(createdTarget.id);

        expect(await upsertTarget()).toEqual({
          id: createdTarget.id,
          deletedAt: null,
        });

        await makeGraphqlApiRequest(
          deleteOneOperationFactory({
            objectMetadataSingularName: targetName,
            gqlFields: 'id',
            recordId: createdTarget.id,
          }),
        );

        const recreatedTarget = await upsertTarget();

        targetIds.push(recreatedTarget.id);

        expect(recreatedTarget.id).not.toEqual(createdTarget.id);
        expect(recreatedTarget.deletedAt).toBeNull();
        expect(await findLiveTargetIds()).toEqual([recreatedTarget.id]);

        await makeGraphqlApiRequest(
          deleteOneOperationFactory({
            objectMetadataSingularName: activityName,
            gqlFields: 'id',
            recordId: activityId,
          }),
        );

        expect(await findLiveTargetIds()).toEqual([]);

        const restoreResponse = await makeGraphqlApiRequest(
          restoreOneOperationFactory({
            objectMetadataSingularName: activityName,
            gqlFields: 'id',
            recordId: activityId,
          }),
        );

        expect(restoreResponse.body.errors).toBeUndefined();
        expect(await findLiveTargetIds()).toEqual([recreatedTarget.id]);
      } finally {
        for (const targetId of targetIds) {
          await makeGraphqlApiRequest(
            destroyOneOperationFactory({
              objectMetadataSingularName: targetName,
              gqlFields: 'id',
              recordId: targetId,
            }),
          );
        }

        await makeGraphqlApiRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: activityName,
            gqlFields: 'id',
            recordId: activityId,
          }),
        );
        await makeGraphqlApiRequest(
          destroyOneOperationFactory({
            objectMetadataSingularName: 'person',
            gqlFields: 'id',
            recordId: personId,
          }),
        );
      }
    },
  );
});
