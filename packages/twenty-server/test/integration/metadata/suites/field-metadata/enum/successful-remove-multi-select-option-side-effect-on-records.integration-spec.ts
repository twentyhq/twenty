import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

const TEST_OBJECT_NAME_SINGULAR = 'testMultiSelectRemoval';
const TEST_OBJECT_NAME_PLURAL = 'testMultiSelectRemovals';

// Reproduces the bug where removing a multi-select option fails when
// existing records contain both the removed option and surviving options.
describe('remove multi-select option with side effect on records', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;
  let firstOptionId: string;
  let thirdOptionId: string;

  beforeAll(async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: TEST_OBJECT_NAME_SINGULAR,
        namePlural: TEST_OBJECT_NAME_PLURAL,
        labelSingular: 'Test Multi Select Removal',
        labelPlural: 'Test Multi Select Removals',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = objectData.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.MULTI_SELECT,
        name: 'tagField',
        label: 'Tag Field',
        isLabelSyncedWithName: false,
        options: [
          {
            label: 'Option 1',
            value: 'OPTION_1',
            color: 'green',
            position: 0,
          },
          {
            label: 'Option 2',
            value: 'OPTION_2',
            color: 'blue',
            position: 1,
          },
          {
            label: 'Option 3',
            value: 'OPTION_3',
            color: 'red',
            position: 2,
          },
        ],
      },
      gqlFields: `
        id
        options
      `,
    });

    createdFieldMetadataId = fieldData.createOneField.id;
    const options = fieldData.createOneField.options;

    if (!options) {
      throw new Error('Options should be defined');
    }

    const option1 = options.find(
      (opt: { value: string }) => opt.value === 'OPTION_1',
    );
    const option2 = options.find(
      (opt: { value: string }) => opt.value === 'OPTION_2',
    );
    const option3 = options.find(
      (opt: { value: string }) => opt.value === 'OPTION_3',
    );

    if (!option1?.id || !option2?.id || !option3?.id) {
      throw new Error('All options and their IDs should be defined');
    }

    firstOptionId = option1.id;
    thirdOptionId = option3.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it('should strip the removed option from existing records that contain both surviving and removed values', async () => {
    // Record with OPTION_1 + OPTION_2 (OPTION_2 will be removed)
    const { data: mixedRecordData } = await createOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      input: { tagField: ['OPTION_1', 'OPTION_2'] },
      gqlFields: `id tagField`,
    });

    const mixedRecordId = mixedRecordData.createOneResponse.id;

    expect(mixedRecordData.createOneResponse.tagField).toEqual([
      'OPTION_1',
      'OPTION_2',
    ]);

    // Record with only OPTION_2 (the option that will be removed)
    const { data: removedOnlyData } = await createOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      input: { tagField: ['OPTION_2'] },
      gqlFields: `id tagField`,
    });

    const removedOnlyRecordId = removedOnlyData.createOneResponse.id;

    // Record with only surviving options
    const { data: survivingData } = await createOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      input: { tagField: ['OPTION_1', 'OPTION_3'] },
      gqlFields: `id tagField`,
    });

    const survivingRecordId = survivingData.createOneResponse.id;

    // Remove OPTION_2 -- keep OPTION_1 and OPTION_3
    const { data: updateData, errors: updateErrors } =
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdFieldMetadataId,
          updatePayload: {
            options: [
              {
                id: firstOptionId,
                label: 'Option 1',
                value: 'OPTION_1',
                color: 'green',
                position: 0,
              },
              {
                id: thirdOptionId,
                label: 'Option 3',
                value: 'OPTION_3',
                color: 'red',
                position: 1,
              },
            ],
          },
        },
        gqlFields: `id options`,
      });

    expect(updateErrors).toBeUndefined();
    expect(updateData.updateOneField.options).toHaveLength(2);

    // Mixed record: OPTION_2 should be stripped, only OPTION_1 remains
    const { data: mixedAfter } = await findOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      gqlFields: `id tagField`,
      filter: { id: { eq: mixedRecordId } },
    });

    expect(mixedAfter.findResponse.tagField).toEqual(['OPTION_1']);

    // Removed-only record: all values were removed, field is empty
    const { data: removedOnlyAfter } = await findOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      gqlFields: `id tagField`,
      filter: { id: { eq: removedOnlyRecordId } },
    });

    const removedOnlyTagField = removedOnlyAfter.findResponse.tagField;

    expect(
      removedOnlyTagField === null || removedOnlyTagField.length === 0,
    ).toBe(true);

    // Surviving record: should be unchanged
    const { data: survivingAfter } = await findOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      gqlFields: `id tagField`,
      filter: { id: { eq: survivingRecordId } },
    });

    expect(survivingAfter.findResponse.tagField).toEqual([
      'OPTION_1',
      'OPTION_3',
    ]);
  });
});
