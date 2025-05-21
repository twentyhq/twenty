import {
  UPDATE_CREATE_ONE_FIELD_METADATA_SELECT_TEST_CASES,
  UpdateCreateFieldMetadataSelectTestCase,
} from 'test/integration/metadata/suites/field-metadata/update-create-one-field-metadata-select-tests-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { isDefined } from 'twenty-shared/utils';

const { failingTestCases, successfulTestCases } =
  UPDATE_CREATE_ONE_FIELD_METADATA_SELECT_TEST_CASES;

describe('Field metadata select creation tests group', () => {
  let createdObjectMetadataId: string;

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
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  test.each(successfulTestCases)(
    'Create $title',
    async ({ context: { input, expectedOptions } }) => {
      const { data, errors } = await createOneFieldMetadata({
        input: {
          objectMetadataId: createdObjectMetadataId,
          type: FieldMetadataType.SELECT,
          name: 'testField',
          label: 'Test Field',
          isLabelSyncedWithName: false,
          ...input,
        },
        gqlFields: `
        id
        options
        defaultValue
        `,
      });

      expect(data).not.toBeNull();
      expect(data.createOneField).toBeDefined();
      const createdOptions: FieldMetadataComplexOption[] =
        data.createOneField.options;

      const optionsToCompare = expectedOptions ?? input.options;

      expect(errors).toBeUndefined();
      expect(createdOptions.length).toBe(optionsToCompare.length);
      createdOptions.forEach((option) => expect(option.id).toBeDefined());
      expect(createdOptions).toMatchObject(optionsToCompare);

      if (isDefined(input.defaultValue)) {
        expect(data.createOneField.defaultValue).toEqual(input.defaultValue);
      }
    },
  );

  const createSpecificFailingTestCases: UpdateCreateFieldMetadataSelectTestCase[] =
    [
      {
        title: 'should fail with null options',
        context: {
          input: {
            options: null as unknown as FieldMetadataComplexOption[],
          },
        },
      },
      {
        title: 'should fail with undefined options',
        context: {
          input: {
            options: undefined as unknown as FieldMetadataComplexOption[],
          },
        },
      },
    ];

  test.each([...failingTestCases, ...createSpecificFailingTestCases])(
    'Create $title',
    async ({ context: { input } }) => {
      const { data, errors } = await createOneFieldMetadata({
        input: {
          objectMetadataId: createdObjectMetadataId,
          type: FieldMetadataType.SELECT,
          name: 'testField',
          label: 'Test Field',
          isLabelSyncedWithName: false,
          ...input,
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
