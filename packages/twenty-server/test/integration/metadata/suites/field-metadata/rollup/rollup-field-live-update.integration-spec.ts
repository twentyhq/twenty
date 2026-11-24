import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { findRollupProject } from 'test/integration/metadata/suites/field-metadata/rollup/utils/find-rollup-project.util';
import {
  type RollupTestObjects,
  setupRollupTestObjects,
} from 'test/integration/metadata/suites/field-metadata/rollup/utils/setup-rollup-test-objects.util';
import { teardownRollupTestObjects } from 'test/integration/metadata/suites/field-metadata/rollup/utils/teardown-rollup-test-objects.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

const FIRST_PROJECT_ID = '20202020-a0a3-4000-8000-000000000001';
const SECOND_PROJECT_ID = '20202020-a0a3-4000-8000-000000000002';
const FIRST_TASK_ID = '20202020-a0a3-4000-8000-0000000000a1';
const SECOND_TASK_ID = '20202020-a0a3-4000-8000-0000000000a2';
const DONE_FILTER_ID = '20202020-a0a3-4000-8000-0000000000f1';
const ROLLUP_GQL_FIELDS = 'taskCount totalEstimate doneEstimate lastDueAt';

describe('Rollup field live update', () => {
  let testObjects: RollupTestObjects;

  const createRollupField = async ({
    name,
    settings,
  }: {
    name: string;
    settings: Record<string, unknown>;
  }) => {
    const rollupSettings: Record<string, unknown> = {
      relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
      ...settings,
    };

    await createOneFieldMetadata<FieldMetadataType.ROLLUP>({
      expectToFail: false,
      input: {
        objectMetadataId: testObjects.projectObjectMetadataId,
        name,
        label: name,
        type: FieldMetadataType.ROLLUP,
        settings: rollupSettings,
      },
      gqlFields: 'id',
    });
  };

  const updateTask = (taskId: string, data: Record<string, unknown>) =>
    makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        gqlFields: 'id',
        recordId: taskId,
        data,
      }),
    );

  const findProject = (projectId: string) =>
    findRollupProject({ projectId, gqlFields: ROLLUP_GQL_FIELDS });

  beforeAll(async () => {
    testObjects = await setupRollupTestObjects();

    await createRollupField({
      name: 'taskCount',
      settings: { aggregateOperation: AggregateOperations.COUNT },
    });
    await createRollupField({
      name: 'totalEstimate',
      settings: {
        aggregateOperation: AggregateOperations.SUM,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.estimate,
      },
    });
    await createRollupField({
      name: 'doneEstimate',
      settings: {
        aggregateOperation: AggregateOperations.SUM,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.estimate,
        filters: [
          {
            id: DONE_FILTER_ID,
            fieldMetadataId: testObjects.taskFieldMetadataIdByName.isDone,
            operand: ViewFilterOperand.IS,
            value: 'true',
          },
        ],
      },
    });
    await createRollupField({
      name: 'lastDueAt',
      settings: {
        aggregateOperation: AggregateOperations.MAX,
        aggregatedFieldMetadataId: testObjects.taskFieldMetadataIdByName.dueAt,
      },
    });

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rollupProject',
        objectMetadataPluralName: 'rollupProjects',
        gqlFields: 'id',
        data: [
          { id: FIRST_PROJECT_ID, name: 'First project' },
          { id: SECOND_PROJECT_ID, name: 'Second project' },
        ],
      }),
    );
  });

  afterAll(async () => {
    await teardownRollupTestObjects(testObjects);
  });

  it('initializes the rollups of a new record', async () => {
    expect(await findProject(FIRST_PROJECT_ID)).toMatchObject({
      taskCount: 0,
      totalEstimate: null,
      doneEstimate: null,
      lastDueAt: null,
    });
  });

  it('recomputes the parent when related records are created', async () => {
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        data: [
          {
            id: FIRST_TASK_ID,
            name: 'First task',
            projectId: FIRST_PROJECT_ID,
            estimate: 5,
            isDone: true,
            dueAt: '2026-04-01T08:00:00.000Z',
          },
          {
            id: SECOND_TASK_ID,
            name: 'Second task',
            projectId: FIRST_PROJECT_ID,
            estimate: 2,
            isDone: false,
            dueAt: '2026-09-30T18:00:00.000Z',
          },
        ],
      }),
    );

    expect(await findProject(FIRST_PROJECT_ID)).toMatchObject({
      taskCount: 2,
      totalEstimate: 7,
      doneEstimate: 5,
      lastDueAt: '2026-09-30T18:00:00.000Z',
    });
  });

  it('recomputes the parent when the aggregated field or a filter field changes', async () => {
    await updateTask(SECOND_TASK_ID, { estimate: 10, isDone: true });

    expect(await findProject(FIRST_PROJECT_ID)).toMatchObject({
      taskCount: 2,
      totalEstimate: 15,
      doneEstimate: 15,
    });
  });

  it('recomputes both parents when a related record moves', async () => {
    await updateTask(SECOND_TASK_ID, { projectId: SECOND_PROJECT_ID });

    expect(await findProject(FIRST_PROJECT_ID)).toMatchObject({
      taskCount: 1,
      totalEstimate: 5,
      lastDueAt: '2026-04-01T08:00:00.000Z',
    });
    expect(await findProject(SECOND_PROJECT_ID)).toMatchObject({
      taskCount: 1,
      totalEstimate: 10,
      lastDueAt: '2026-09-30T18:00:00.000Z',
    });
  });

  it('leaves a deleted related record out, and counts it again once restored', async () => {
    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        filter: { id: { in: [FIRST_TASK_ID] } },
      }),
    );

    expect(await findProject(FIRST_PROJECT_ID)).toMatchObject({
      taskCount: 0,
      totalEstimate: null,
      lastDueAt: null,
    });

    await makeGraphqlApiRequest(
      restoreManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        filter: { id: { in: [FIRST_TASK_ID] } },
      }),
    );

    expect(await findProject(FIRST_PROJECT_ID)).toMatchObject({
      taskCount: 1,
      totalEstimate: 5,
    });
  });

  it('recomputes the parent when a related record is destroyed', async () => {
    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        filter: { id: { in: [SECOND_TASK_ID] } },
      }),
    );
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        filter: { id: { in: [SECOND_TASK_ID] } },
      }),
    );

    expect(await findProject(SECOND_PROJECT_ID)).toMatchObject({
      taskCount: 0,
      totalEstimate: null,
    });
  });
});
