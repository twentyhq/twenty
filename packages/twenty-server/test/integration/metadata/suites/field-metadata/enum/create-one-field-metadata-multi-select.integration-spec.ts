import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/common/multi-select-operation-agnostic-test-cases';
import { UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/enum/types/update-create-field-metadata-enum-test-case';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';

describe('Field metadata select creation tests group', () => {
  let createdObjectMetadataId: string;

  beforeEach(async () => {
    const { data, errors } = await createOneObjectMetadata({
      input: {
        labelSingular: LISTING_NAME_SINGULAR,
        labelPlural: LISTING_NAME_PLURAL,
        nameSingular: LISTING_NAME_SINGULAR,
        namePlural: LISTING_NAME_PLURAL,
        icon: 'IconBuildingSkyscraper',
        isLabelSyncedWithName: false,
      },
    });

    console.log(errors);

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  test.each(
    MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES.successful,
  )('Create $title', async ({ context: { input, expectedOptions } }) => {
    const { data, errors } = await createOneFieldMetadata({
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.MULTI_SELECT,
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

    console.log({ data, errors });

    expect(data).not.toBeNull();
    expect(data.createOneField).toBeDefined();
    const createdOptions:
      | FieldMetadataDefaultOption[]
      | FieldMetadataComplexOption[] = data.createOneField.options;

    const optionsToCompare = expectedOptions ?? input.options;

    expect(errors).toBeUndefined();
    expect(createdOptions.length).toBe(optionsToCompare.length);
    createdOptions.forEach((option) => expect(option.id).toBeDefined());
    expect(createdOptions).toMatchObject(optionsToCompare);

    if (isDefined(input.defaultValue)) {
      expect(data.createOneField.defaultValue).toEqual(input.defaultValue);
    }
  });

  // Could centralize
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

  test.each([
    ...createSpecificFailingTestCases,
    ...MUTLI_SELECT_OPERATION_AGNOSTIC_TEST_CASES.failing,
  ])('Create $title', async ({ context: { input } }) => {
    const { data, errors } = await createOneFieldMetadata({
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.MULTI_SELECT,
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

    expect(data).toBeNull();
    expect(errors).toBeDefined();
    expect(errors).toMatchSnapshot();
  });
});
