import {
  type RollupTestObjects,
  setupRollupTestObjects,
} from 'test/integration/metadata/suites/field-metadata/rollup/utils/setup-rollup-test-objects.util';
import { teardownRollupTestObjects } from 'test/integration/metadata/suites/field-metadata/rollup/utils/teardown-rollup-test-objects.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  AggregateOperations,
  FeatureFlagKey,
  FieldMetadataType,
  RelationType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { ROLLUP_MAX_FIELDS_PER_OBJECT } from 'src/engine/metadata-modules/flat-field-metadata/constants/rollup-max-fields-per-object.constant';

const STATUS_FILTER_ID = '20202020-a0a1-4000-8000-0000000000f1';

describe('Rollup field metadata dependencies', () => {
  let testObjects: RollupTestObjects;
  let isChildObjectDeleted = false;

  const createRollupField = ({
    objectMetadataId = testObjects.projectObjectMetadataId,
    name,
    settings,
    expectToFail = false,
  }: {
    objectMetadataId?: string;
    name: string;
    settings: Record<string, unknown>;
    expectToFail?: boolean;
  }) =>
    createOneFieldMetadata<FieldMetadataType.ROLLUP>({
      expectToFail,
      input: {
        objectMetadataId,
        name,
        label: name,
        type: FieldMetadataType.ROLLUP,
        settings,
      },
      gqlFields: 'id name settings',
    });

  const findField = async (fieldMetadataId: string) => {
    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: { filter: { id: { eq: fieldMetadataId } }, paging: { first: 1 } },
      gqlFields: 'id name settings',
    });

    return fields[0]?.node;
  };

  const deleteField = async (fieldMetadataId: string) => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: fieldMetadataId },
    });
  };

  const countTasksSettings = () => ({
    relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
    aggregateOperation: AggregateOperations.COUNT,
  });

  beforeAll(async () => {
    testObjects = await setupRollupTestObjects();
  });

  afterAll(async () => {
    if (isChildObjectDeleted) {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: testObjects.projectObjectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: testObjects.projectObjectMetadataId },
      });

      return;
    }

    await teardownRollupTestObjects(testObjects);
  });

  it('refuses a rollup while the feature flag is off', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROLLUP_FIELD_ENABLED,
      value: false,
      expectToFail: false,
    });

    const { errors } = await createRollupField({
      name: 'flaggedOffRollup',
      settings: countTasksSettings(),
      expectToFail: true,
    });

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ROLLUP_FIELD_ENABLED,
      value: true,
      expectToFail: false,
    });

    expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(JSON.stringify(errors[0].extensions)).toContain('not enabled');
  });

  it('follows a renamed select option in the rollup filters', async () => {
    const { data: statusFieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: testObjects.taskObjectMetadataId,
        name: 'status',
        label: 'Status',
        type: FieldMetadataType.SELECT,
        options: [
          { label: 'Open', value: 'OPEN', color: 'blue', position: 0 },
          { label: 'Done', value: 'DONE', color: 'green', position: 1 },
        ],
      },
      gqlFields: 'id options',
    });
    const statusField = statusFieldData.createOneField;

    jestExpectToBeDefined(statusField.options);

    const { data: rollupData } = await createRollupField({
      name: 'doneTaskCount',
      settings: {
        ...countTasksSettings(),
        filters: [
          {
            id: STATUS_FILTER_ID,
            fieldMetadataId: statusField.id,
            operand: ViewFilterOperand.IS,
            value: ['DONE'],
          },
        ],
      },
    });

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: statusField.id,
        updatePayload: {
          options: statusField.options.map((option) =>
            option.value === 'DONE'
              ? { ...option, label: 'Complete', value: 'COMPLETE' }
              : option,
          ),
        },
      },
    });

    const rollupField = await findField(rollupData.createOneField.id);

    expect(rollupField.settings.filters).toMatchObject([
      { id: STATUS_FILTER_ID, value: ['COMPLETE'] },
    ]);
  });

  it('refuses a rollup calculated from itself through another rollup', async () => {
    const subProjectsRelationField = await createRelationBetweenObjects({
      objectMetadataId: testObjects.taskObjectMetadataId,
      targetObjectMetadataId: testObjects.projectObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.ONE_TO_MANY,
      name: 'subProjects',
      label: 'Sub projects',
      targetFieldLabel: 'Parent task',
      targetFieldIcon: 'IconCheckbox',
    });
    const { data: projectRollupData } = await createRollupField({
      name: 'totalEstimate',
      settings: {
        relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
        aggregateOperation: AggregateOperations.SUM,
        aggregatedFieldMetadataId:
          testObjects.taskFieldMetadataIdByName.estimate,
      },
    });
    const { data: taskRollupData } = await createRollupField({
      objectMetadataId: testObjects.taskObjectMetadataId,
      name: 'subProjectsEstimate',
      settings: {
        relationFieldMetadataId: subProjectsRelationField.id,
        aggregateOperation: AggregateOperations.SUM,
        aggregatedFieldMetadataId: projectRollupData.createOneField.id,
      },
    });

    const settings: Record<string, unknown> = {
      relationFieldMetadataId: testObjects.tasksRelationFieldMetadataId,
      aggregateOperation: AggregateOperations.SUM,
      aggregatedFieldMetadataId: taskRollupData.createOneField.id,
    };
    const { errors } = await updateOneFieldMetadata({
      expectToFail: true,
      input: {
        idToUpdate: projectRollupData.createOneField.id,
        updatePayload: { settings },
      },
    });

    expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(JSON.stringify(errors[0].extensions)).toContain(
      'cannot depend on itself',
    );
  });

  it('deletes a rollup, and the rollups calculated from it, with the field it calculates on', async () => {
    const { fields: projectRollupFields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: {
          objectMetadataId: { eq: testObjects.projectObjectMetadataId },
        },
        paging: { first: 100 },
      },
      gqlFields: 'id name',
    });
    const { fields: taskFields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: testObjects.taskObjectMetadataId } },
        paging: { first: 100 },
      },
      gqlFields: 'id name',
    });
    const totalEstimateId = projectRollupFields.find(
      ({ node }: { node: { name: string } }) => node.name === 'totalEstimate',
    )?.node.id;
    const subProjectsEstimateId = taskFields.find(
      ({ node }: { node: { name: string } }) =>
        node.name === 'subProjectsEstimate',
    )?.node.id;

    jestExpectToBeDefined(totalEstimateId);
    jestExpectToBeDefined(subProjectsEstimateId);

    await deleteField(testObjects.taskFieldMetadataIdByName.estimate);

    expect(await findField(totalEstimateId)).toBeUndefined();
    expect(await findField(subProjectsEstimateId)).toBeUndefined();
  });

  it('refuses more rollups than an object can have', async () => {
    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: {
          objectMetadataId: { eq: testObjects.projectObjectMetadataId },
        },
        paging: { first: 100 },
      },
      gqlFields: 'id type',
    });
    const existingRollupCount = fields.filter(
      ({ node }: { node: { type: FieldMetadataType } }) =>
        node.type === FieldMetadataType.ROLLUP,
    ).length;

    for (
      let index = existingRollupCount;
      index < ROLLUP_MAX_FIELDS_PER_OBJECT;
      index++
    ) {
      await createRollupField({
        name: `taskCount${index}`,
        settings: countTasksSettings(),
      });
    }

    const { errors } = await createRollupField({
      name: 'oneRollupTooMany',
      settings: countTasksSettings(),
      expectToFail: true,
    });

    expect(JSON.stringify(errors[0].extensions)).toContain(
      'cannot have more than',
    );
  });

  it('deletes the rollups of an object with the related object they go through', async () => {
    const { data } = await createRollupField({
      objectMetadataId: testObjects.taskObjectMetadataId,
      name: 'subProjectCount',
      settings: {
        relationFieldMetadataId: (
          await findManyFieldsMetadata({
            expectToFail: false,
            input: {
              filter: {
                objectMetadataId: { eq: testObjects.taskObjectMetadataId },
              },
              paging: { first: 100 },
            },
            gqlFields: 'id name',
          })
        ).fields.find(
          ({ node }: { node: { name: string } }) => node.name === 'subProjects',
        ).node.id,
        aggregateOperation: AggregateOperations.COUNT,
      },
    });
    const { fields: projectFieldsBefore } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: {
          objectMetadataId: { eq: testObjects.projectObjectMetadataId },
        },
        paging: { first: 100 },
      },
      gqlFields: 'id type',
    });

    expect(data.createOneField.id).toBeDefined();
    expect(
      projectFieldsBefore.some(
        ({ node }: { node: { type: FieldMetadataType } }) =>
          node.type === FieldMetadataType.ROLLUP,
      ),
    ).toBe(true);

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjects.taskObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjects.taskObjectMetadataId },
    });
    isChildObjectDeleted = true;

    const { fields: projectFieldsAfter } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: {
          objectMetadataId: { eq: testObjects.projectObjectMetadataId },
        },
        paging: { first: 100 },
      },
      gqlFields: 'id type',
    });

    expect(
      projectFieldsAfter.some(
        ({ node }: { node: { type: FieldMetadataType } }) =>
          node.type === FieldMetadataType.ROLLUP,
      ),
    ).toBe(false);
  });
});
