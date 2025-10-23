import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { findOneOperation } from 'test/integration/graphql/utils/find-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { FieldMetadataType } from 'twenty-shared/types';

const TEST_OBJECT_NAME_SINGULAR = 'testSelectObject';
const TEST_OBJECT_NAME_PLURAL = 'testSelectObjects';

describe('successful update default value option value and side effect on records', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;
  let firstOptionId: string;
  let secondOptionId: string;
  let thirdOptionId: string;

  beforeAll(async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: TEST_OBJECT_NAME_SINGULAR,
        namePlural: TEST_OBJECT_NAME_PLURAL,
        labelSingular: 'Test Select Object',
        labelPlural: 'Test Select Objects',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = objectData.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'statusField',
        label: 'Status Field',
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
        defaultValue: "'OPTION_1'",
      },
      gqlFields: `
        id
        options
        defaultValue
      `,
    });

    createdFieldMetadataId = fieldData.createOneField.id;
    const options = fieldData.createOneField.options;

    if (!options) {
      throw new Error('Options should be defined');
    }

    const option1 = options.find((opt) => opt.value === 'OPTION_1');
    const option2 = options.find((opt) => opt.value === 'OPTION_2');
    const option3 = options.find((opt) => opt.value === 'OPTION_3');

    if (!option1?.id || !option2?.id || !option3?.id) {
      throw new Error('All options and their IDs should be defined');
    }

    firstOptionId = option1.id;
    secondOptionId = option2.id;
    thirdOptionId = option3.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it('should update existing records when default value option value is changed and not mutate when default option is changed', async () => {
    const { data: createFirstRecordData } = await createOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      input: {},
      gqlFields: `
          id
          statusField
        `,
    });

    const firstRecordId = createFirstRecordData.createOneResponse.id;

    expect(createFirstRecordData.createOneResponse.statusField).toBe(
      'OPTION_1',
    );

    const { data: updateOptionValueData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          defaultValue: "'OPTION_1_MODIFIED'",
          options: [
            {
              id: firstOptionId,
              label: 'Option 1',
              value: 'OPTION_1_MODIFIED',
              color: 'green',
              position: 0,
            },
            {
              id: secondOptionId,
              label: 'Option 2',
              value: 'OPTION_2',
              color: 'blue',
              position: 1,
            },
            {
              id: thirdOptionId,
              label: 'Option 3',
              value: 'OPTION_3',
              color: 'red',
              position: 2,
            },
          ],
        },
      },
      gqlFields: `
        id
        options
        defaultValue
      `,
    });

    expect(updateOptionValueData.updateOneField.defaultValue).toBe(
      "'OPTION_1_MODIFIED'",
    );

    const { data: queryFirstRecordAfterOptionValueUpdate } =
      await findOneOperation({
        expectToFail: false,
        objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
        gqlFields: `
        id
        statusField
      `,
        filter: { id: { eq: firstRecordId } },
      });

    expect(
      queryFirstRecordAfterOptionValueUpdate.findResponse.statusField,
    ).toBe('OPTION_1_MODIFIED');

    const { data: updateDefaultOptionData } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdFieldMetadataId,
        updatePayload: {
          defaultValue: "'OPTION_2'",
        },
      },
      gqlFields: `
        id
        options
        defaultValue
      `,
    });

    expect(updateDefaultOptionData.updateOneField.defaultValue).toBe(
      "'OPTION_2'",
    );
    expect(updateDefaultOptionData.updateOneField.options).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(
        updateDefaultOptionData.updateOneField.options as any,
      ),
    );

    const { data: createSecondRecordData } = await createOneOperation({
      expectToFail: false,
      objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
      input: {},
      gqlFields: `
          id
          statusField
        `,
    });

    expect(createSecondRecordData.createOneResponse.statusField).toBe(
      'OPTION_2',
    );

    const { data: queryFirstRecordAfterDefaultChange } = await findOneOperation(
      {
        expectToFail: false,
        objectMetadataSingularName: TEST_OBJECT_NAME_SINGULAR,
        gqlFields: `
        id
        statusField
      `,
        filter: { id: { eq: firstRecordId } },
      },
    );

    expect(queryFirstRecordAfterDefaultChange.findResponse.statusField).toBe(
      'OPTION_1_MODIFIED',
    );
  });
});
