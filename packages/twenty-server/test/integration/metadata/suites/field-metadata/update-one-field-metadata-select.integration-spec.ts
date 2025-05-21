import {
  UPDATE_CREATE_ONE_FIELD_METADATA_SELECT_TEST_CASES,
  UpdateCreateFieldMetadataSelectTestCase,
} from 'test/integration/metadata/suites/field-metadata/update-create-one-field-metadata-select-tests-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { CreateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata-query-factory.util';
import { isDefined } from 'twenty-shared/utils';

const { failingTestCases, successfulTestCases } =
  UPDATE_CREATE_ONE_FIELD_METADATA_SELECT_TEST_CASES;

describe('Field metadata select update tests group', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadata: string;
  const initialOptions: CreateOneFieldFactoryInput['options'] = [
    {
      label: 'Option 1',
      value: 'OPTION_1',
      color: 'green',
      position: 1,
    },
    {
      label: 'Option 2',
      value: 'OPTION_2',
      color: 'green',
      position: 2,
    },
  ];
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
        options: initialOptions,
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

  const updateSpecificSuccessfulTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
    [
      {
        context: {
          input: {
            defaultValue: "'OPTION_2'",
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
          expectedOptions: initialOptions,
        },
        title: 'should succeed with default value and no options',
      },
    ];
  test.each([...successfulTestCases, ...updateSpecificSuccessfulTestCases])(
    'Update $title',
    async ({ context: { input, expectedOptions } }) => {
      const { data, errors } = await updateOneFieldMetadata({
        input: {
          idToUpdate: createdFieldMetadata,
          updatePayload: input,
        },
        gqlFields: `
        id
        options
        defaultValue
        `,
      });

      expect(data.updateOneField).toBeDefined();
      const updatedOptions: FieldMetadataComplexOption[] =
        data.updateOneField.options;

      expect(errors).toBeUndefined();
      updatedOptions.forEach((option) => expect(option.id).toBeDefined());

      const optionsToCompare = expectedOptions ?? input.options;
      expect(updatedOptions.length).toBe(optionsToCompare.length);
      expect(updatedOptions).toMatchObject(optionsToCompare);

      if (isDefined(input.defaultValue)) {
        expect(data.updateOneField.defaultValue).toEqual(input.defaultValue);
      }
    },
  );

  const updateSpecificFailingTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
    [
      {
        context: {
          input: {
            defaultValue: "'OPTION_42'",
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
        },
        title: 'should fail with unknown default value and no options',
      },
    ];
  test.each([...updateSpecificFailingTestCases, ...failingTestCases])(
    'Update $title',
    async ({ context: { input } }) => {
      const { data, errors } = await updateOneFieldMetadata({
        input: {
          idToUpdate: createdFieldMetadata,
          updatePayload: input,
        },
        gqlFields: `
        id
        options
        `,
      });

      expect(data).toBeNull();
      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );
});
