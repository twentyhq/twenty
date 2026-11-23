import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findRollupProject } from 'test/integration/metadata/suites/field-metadata/rollup/utils/find-rollup-project.util';
import {
  type RollupTestObjects,
  setupRollupTestObjects,
} from 'test/integration/metadata/suites/field-metadata/rollup/utils/setup-rollup-test-objects.util';
import { teardownRollupTestObjects } from 'test/integration/metadata/suites/field-metadata/rollup/utils/teardown-rollup-test-objects.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

const BUSY_PROJECT_ID = '20202020-a0a2-4000-8000-000000000001';
const EMPTY_PROJECT_ID = '20202020-a0a2-4000-8000-000000000002';
const DELETED_TASK_ID = '20202020-a0a2-4000-8000-0000000000d1';
const DONE_FILTER_ID = '20202020-a0a2-4000-8000-0000000000f1';

const TASKS = [
  {
    name: 'Design',
    estimate: 3,
    isDone: true,
    dueAt: '2026-03-01T10:00:00.000Z',
    startsOn: '2026-02-10',
  },
  {
    name: 'Build',
    estimate: 8,
    isDone: true,
    dueAt: '2026-05-20T16:30:00.000Z',
    startsOn: '2026-03-02',
  },
  {
    name: 'Ship',
    estimate: 2.5,
    isDone: false,
    dueAt: '2026-06-15T09:00:00.000Z',
    startsOn: '2026-01-05',
  },
  {
    id: DELETED_TASK_ID,
    name: 'Cancelled',
    estimate: 100,
    isDone: true,
    dueAt: '2027-01-01T00:00:00.000Z',
    startsOn: '2025-01-01',
  },
];

describe('Rollup field computation', () => {
  let testObjects: RollupTestObjects;
  let averageEstimateFieldMetadataId: string;

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
    const { data } = await createOneFieldMetadata<FieldMetadataType.ROLLUP>({
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

    return data.createOneField.id;
  };

  beforeAll(async () => {
    testObjects = await setupRollupTestObjects();

    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rollupProject',
        objectMetadataPluralName: 'rollupProjects',
        gqlFields: 'id',
        data: [
          { id: BUSY_PROJECT_ID, name: 'Busy project' },
          { id: EMPTY_PROJECT_ID, name: 'Empty project' },
        ],
      }),
    );
    await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        data: TASKS.map((task) => ({ ...task, projectId: BUSY_PROJECT_ID })),
      }),
    );
    await makeGraphqlApiRequest(
      deleteManyOperationFactory({
        objectMetadataSingularName: 'rollupTask',
        objectMetadataPluralName: 'rollupTasks',
        gqlFields: 'id',
        filter: { id: { in: [DELETED_TASK_ID] } },
      }),
    );

    await createRollupField({
      name: 'taskCount',
      settings: { aggregateOperation: AggregateOperations.COUNT },
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
    averageEstimateFieldMetadataId = await createRollupField({
      name: 'averageEstimate',
      settings: {
        aggregateOperation: AggregateOperations.AVG,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.estimate,
      },
    });
    await createRollupField({
      name: 'largestEstimate',
      settings: {
        aggregateOperation: AggregateOperations.MAX,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.estimate,
      },
    });
    await createRollupField({
      name: 'lastDueAt',
      settings: {
        aggregateOperation: AggregateOperations.MAX,
        aggregatedFieldMetadataId: testObjects.taskFieldMetadataIdByName.dueAt,
      },
    });
    await createRollupField({
      name: 'firstStartsOn',
      settings: {
        aggregateOperation: AggregateOperations.MIN,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.startsOn,
      },
    });
  });

  afterAll(async () => {
    await teardownRollupTestObjects(testObjects);
  });

  it('computes every rollup of the existing records when the field is created', async () => {
    const project = await findRollupProject({
      projectId: BUSY_PROJECT_ID,
      gqlFields:
        'taskCount doneEstimate averageEstimate largestEstimate lastDueAt firstStartsOn',
    });

    expect(project).toMatchObject({
      taskCount: 3,
      doneEstimate: 11,
      averageEstimate: 4.5,
      largestEstimate: 8,
      lastDueAt: '2026-06-15T09:00:00.000Z',
      firstStartsOn: '2026-01-05',
    });
  });

  it('counts zero and leaves the other rollups empty for a record without related records', async () => {
    const project = await findRollupProject({
      projectId: EMPTY_PROJECT_ID,
      gqlFields:
        'taskCount doneEstimate averageEstimate largestEstimate lastDueAt firstStartsOn',
    });

    expect(project).toMatchObject({
      taskCount: 0,
      doneEstimate: null,
      averageEstimate: null,
      largestEstimate: null,
      lastDueAt: null,
      firstStartsOn: null,
    });
  });

  it('recomputes the existing records when the rollup definition changes', async () => {
    const settings: Record<string, unknown> = {
      relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
      aggregateOperation: AggregateOperations.MIN,
      aggregatedFieldMetadataId: testObjects.taskFieldMetadataIdByName.estimate,
    };

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: averageEstimateFieldMetadataId,
        updatePayload: { settings },
      },
    });

    const project = await findRollupProject({
      projectId: BUSY_PROJECT_ID,
      gqlFields: 'averageEstimate',
    });

    expect(project.averageEstimate).toBe(2.5);
  });
});
