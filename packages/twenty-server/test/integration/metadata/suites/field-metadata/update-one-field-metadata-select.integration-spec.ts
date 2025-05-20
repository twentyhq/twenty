import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { UPDATE_CREATE_ONE_FIELD_METADATA_SELECT_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/update-create-one-field-metadata-select-tests-cases';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';

const { failingTestCases, successfulTestCases } =
  UPDATE_CREATE_ONE_FIELD_METADATA_SELECT_TEST_CASES;

describe('Field metadata select update tests group', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadata: string;

  beforeEach(async () => {
    const { data } = await createOneObjectMetadata({
      input: {
        labelSingular: LISTING_NAME_SINGULAR,
        labelPlural: LISTING_NAME_PLURAL,
        nameSingular: LISTING_NAME_SINGULAR,
        namePlural: LISTING_NAME_PLURAL,
        icon: 'IconBuildingSkyscraper',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;

    const {
      data: { createOneField },
    } = await createOneFieldMetadata({
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'testField',
        label: 'Test Field',
        isLabelSyncedWithName: false,
        options: [
          {
            label: 'Option 1',
            value: 'OPTION_1',
            color: 'green',
            position: 1,
          },
        ],
      },
      gqlFields: `
        id
        `,
    });
    createdFieldMetadata = createOneField.id;
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  test.each(successfulTestCases)('$title', async ({ context: { options } }) => {
    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdFieldMetadata,
        updatePayload: {
          options,
        },
      },
      gqlFields: `
        id
        options
        `,
    });

    expect(data.updateOneField).toBeDefined();
    const updatedOptions: FieldMetadataComplexOption[] =
      data.updateOneField.options;

    expect(errors).toBeUndefined();
    expect(updatedOptions.length).toBe(options.length);
    updatedOptions.forEach((option) => expect(option.id).toBeDefined());
    expect(updatedOptions).toMatchObject(options);
  });

  test.each(failingTestCases)('$title', async ({ context: { options } }) => {
    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: createdFieldMetadata,
        updatePayload: {
          objectMetadataId: createdObjectMetadataId,
          name: 'testField',
          label: 'Test Field',
          isLabelSyncedWithName: false,
          options,
        },
      },
      gqlFields: `
        id
        options
        `,
    });

    expect(data).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors).toMatchSnapshot();
  });
});
