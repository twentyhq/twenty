import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
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

const PROJECT_ID = '20202020-a0a0-4000-8000-000000000001';
const DONE_FILTER_ID = '20202020-a0a0-4000-8000-0000000000f1';

describe('Rollup field metadata', () => {
  let testObjects: RollupTestObjects;

  const createRollupField = ({
    name,
    settings,
    expectToFail = false,
  }: {
    name: string;
    settings: Record<string, unknown>;
    expectToFail?: boolean;
  }) =>
    createOneFieldMetadata<FieldMetadataType.ROLLUP>({
      expectToFail,
      input: {
        objectMetadataId: testObjects.projectObjectMetadataId,
        name,
        label: name,
        type: FieldMetadataType.ROLLUP,
        settings,
      },
      gqlFields: 'id name type settings isNullable isUIEditable isAuditLogged',
    });

  beforeAll(async () => {
    testObjects = await setupRollupTestObjects();

    await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'rollupProject',
        gqlFields: 'id',
        data: { id: PROJECT_ID, name: 'Rollup project one' },
      }),
    );
  });

  afterAll(async () => {
    await teardownRollupTestObjects(testObjects);
  });

  describe('creation', () => {
    it('creates a count as a number rollup the user cannot edit', async () => {
      const { data, errors } = await createRollupField({
        name: 'taskCount',
        settings: {
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT,
        },
      });

      expect(errors).toBeUndefined();
      expect(data.createOneField).toMatchObject({
        type: FieldMetadataType.ROLLUP,
        isNullable: true,
        isUIEditable: false,
        isAuditLogged: false,
        settings: {
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT,
          aggregatedFieldMetadataId: null,
          filters: [],
          filterGroups: [],
          resultType: FieldMetadataType.NUMBER,
        },
      });
    });

    it('creates a filtered sum of a number field', async () => {
      const { data, errors } = await createRollupField({
        name: 'doneEstimate',
        settings: {
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
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

      expect(errors).toBeUndefined();
      expect(data.createOneField.settings).toMatchObject({
        aggregateOperation: AggregateOperations.SUM,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.estimate,
        filters: [
          {
            id: DONE_FILTER_ID,
            fieldMetadataId: testObjects.taskFieldMetadataIdByName.isDone,
          },
        ],
        resultType: FieldMetadataType.NUMBER,
      });
    });

    it.each([
      {
        name: 'lastDueAt',
        aggregateOperation: AggregateOperations.MAX,
        aggregatedFieldName: 'dueAt' as const,
        resultType: FieldMetadataType.DATE_TIME,
      },
      {
        name: 'firstStartsOn',
        aggregateOperation: AggregateOperations.MIN,
        aggregatedFieldName: 'startsOn' as const,
        resultType: FieldMetadataType.DATE,
      },
    ])(
      'creates $aggregateOperation of a $resultType field as a $resultType rollup',
      async ({ name, aggregateOperation, aggregatedFieldName, resultType }) => {
        const { data, errors } = await createRollupField({
          name,
          settings: {
            relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
            aggregateOperation,
            aggregatedFieldMetadataId:
              testObjects.taskFieldMetadataIdByName[aggregatedFieldName],
          },
        });

        expect(errors).toBeUndefined();
        expect(data.createOneField.settings).toMatchObject({ resultType });
      },
    );
  });

  describe('records', () => {
    it('reads, filters and sorts a rollup like a field of its result type', async () => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'rollupProject',
          objectMetadataPluralName: 'rollupProjects',
          gqlFields: 'id taskCount doneEstimate lastDueAt firstStartsOn',
          filter: {
            id: { eq: PROJECT_ID },
            or: [{ taskCount: { is: 'NULL' } }, { taskCount: { gte: 0 } }],
            lastDueAt: { is: 'NULL' },
            firstStartsOn: { is: 'NULL' },
          },
          orderBy: [
            { doneEstimate: 'DescNullsLast' },
            { firstStartsOn: 'AscNullsLast' },
          ],
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.rollupProjects.edges).toHaveLength(1);
    });

    it('refuses to write a rollup', async () => {
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'rollupProject',
          gqlFields: 'id',
          recordId: PROJECT_ID,
          data: { taskCount: 12 },
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('taskCount');
    });
  });

  describe('refused definitions', () => {
    it.each([
      {
        title: 'a many-to-one relation',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.projectRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT,
        }),
      },
      {
        title: 'a count on a field',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT,
          aggregatedFieldMetadataId:
            testObjects.taskFieldMetadataIdByName.estimate,
        }),
      },
      {
        title: 'a sum without a field',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.SUM,
        }),
      },
      {
        title: 'a sum of a date',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.SUM,
          aggregatedFieldMetadataId:
            testObjects.taskFieldMetadataIdByName.dueAt,
        }),
      },
      {
        title: 'a max of a text',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.MAX,
          aggregatedFieldMetadataId:
            testObjects.taskFieldMetadataIdByName.title,
        }),
      },
      {
        title: 'a field of the rollup object itself',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.SUM,
          aggregatedFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
        }),
      },
      {
        title: 'an operation that is not a rollup operation',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT_EMPTY,
        }),
      },
      {
        title: 'a filter relative to the current date',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT,
          filters: [
            {
              id: DONE_FILTER_ID,
              fieldMetadataId: testObjects.taskFieldMetadataIdByName.dueAt,
              operand: ViewFilterOperand.IS_IN_PAST,
              value: '',
            },
          ],
        }),
      },
      {
        title: 'a filter on a field of another object',
        buildSettings: () => ({
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.COUNT,
          filters: [
            {
              id: DONE_FILTER_ID,
              fieldMetadataId: testObjects.tasksRelationFieldMetadataId,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        }),
      },
    ])('refuses $title', async ({ buildSettings }) => {
      const { errors } = await createRollupField({
        name: 'refusedRollup',
        settings: buildSettings(),
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
    });
  });

  describe('update', () => {
    const updateRollupSettings = ({
      fieldMetadataId,
      settings,
      expectToFail,
    }: {
      fieldMetadataId: string;
      settings: Record<string, unknown>;
      expectToFail: boolean;
    }) =>
      updateOneFieldMetadata({
        expectToFail,
        input: { idToUpdate: fieldMetadataId, updatePayload: { settings } },
        gqlFields: 'id settings',
      });

    it('changes the operation when the result type stays the same, and refuses otherwise', async () => {
      const { data } = await createRollupField({
        name: 'estimateRollup',
        settings: {
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.SUM,
          aggregatedFieldMetadataId:
            testObjects.taskFieldMetadataIdByName.estimate,
        },
      });

      const updated = await updateRollupSettings({
        fieldMetadataId: data.createOneField.id,
        expectToFail: false,
        settings: {
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.AVG,
          aggregatedFieldMetadataId:
            testObjects.taskFieldMetadataIdByName.estimate,
          decimals: 2,
        },
      });

      expect(updated.errors).toBeUndefined();
      expect(updated.data.updateOneField.settings).toMatchObject({
        aggregateOperation: AggregateOperations.AVG,
        resultType: FieldMetadataType.NUMBER,
        decimals: 2,
      });

      const refused = await updateRollupSettings({
        fieldMetadataId: data.createOneField.id,
        expectToFail: true,
        settings: {
          relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
          aggregateOperation: AggregateOperations.MAX,
          aggregatedFieldMetadataId:
            testObjects.taskFieldMetadataIdByName.dueAt,
        },
      });

      expect(refused.errors).toBeDefined();
    });
  });
});
