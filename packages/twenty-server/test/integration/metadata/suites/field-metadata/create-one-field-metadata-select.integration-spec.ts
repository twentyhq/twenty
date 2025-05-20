import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';
import { EachTestingContext } from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

describe('Field metadata select creation tests group', () => {
  let createdObjectMetadataId: string;

  beforeEach(async () => {
    const { data } = await forceCreateOneObjectMetadata({
      labelSingular: LISTING_NAME_SINGULAR,
      labelPlural: LISTING_NAME_PLURAL,
      nameSingular: LISTING_NAME_SINGULAR,
      namePlural: LISTING_NAME_PLURAL,
      icon: 'IconBuildingSkyscraper',
      isLabelSyncedWithName: false,
    });

    createdObjectMetadataId = data.createOneObject.id;
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  type TestCase = EachTestingContext<{
    options: FieldMetadataComplexOption[];
  }>;
  const successfulTestCases: TestCase[] = [
    {
      title: 'It should create option with provided id',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
            id: '26c602c3-cba9-4d83-92d4-4ba7dbae2f31',
          },
        ],
      },
    },
    {
      title: 'It should create option with various options id',
      context: {
        options: Array.from({ length: 42 }, (_value, index) => {
          const optionWithoutId: FieldMetadataComplexOption = {
            label: `Option ${index}`,
            value: `option${index}`,
            color: 'green',
            position: index,
          };

          if (index % 2 === 0) {
            return {
              ...optionWithoutId,
              id: v4(),
            };
          }

          return optionWithoutId;
        }),
      },
    },
    {
      title: 'It should create option even if no id is provided',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
          },
        ],
      },
    },
  ];

  test.each(successfulTestCases)('$title', async ({ context: { options } }) => {
    const { data, errors } = await createOneFieldMetadata({
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'testField',
        label: 'Test Field',
        isLabelSyncedWithName: false,
        options,
      },
      gqlFields: `
        id
        options
        `,
    });

    expect(data.createOneField).toBeDefined();
    const createdOptions: FieldMetadataComplexOption[] =
      data.createOneField.options;

    expect(errors).toBeUndefined();
    expect(createdOptions.length).toBe(options.length);
    createdOptions.forEach((option) => expect(option.id).toBeDefined());
    expect(createdOptions).toMatchObject(options);
  });

  const failingTestCases: TestCase[] = [
    {
      title: 'It should fail to create option with invalid id',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
            id: 'not a uuid',
          },
        ],
      },
    },
    {
      title: 'It should fail to create field metadata with null options',
      context: {
        options: null as unknown as FieldMetadataComplexOption[],
      },
    },
    {
      title: 'It should fail to create field metadata with undefined options',
      context: {
        options: undefined as unknown as FieldMetadataComplexOption[],
      },
    },
    {
      title:
        'It should fail to create field metadata with an option that has value exceeding maximal name size',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'a'.repeat(64),
            color: 'green',
            position: 1,
          },
        ],
      },
    },
    {
      title:
        'It should fail to create field metadata with an option that has a comma',
      context: {
        options: [
          {
            label: 'Some option value, 1',
            value: 'value , value 2',
            color: 'green',
            position: 1,
          },
        ],
      },
    },
    {
      title:
        'It should fail to create field metadata with options having duplicated values',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 0,
          },
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
          },
        ],
      },
    },
    {
      title: 'It should fail to create field metadata with empty options',
      context: {
        options: [],
      },
    },
    {
      title: 'It should fail to create two options with the same id',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
            id: 'fd1f11fd-3f05-4a33-bddf-800c3412ce98',
          },
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 2,
            id: 'fd1f11fd-3f05-4a33-bddf-800c3412ce98',
          },
        ],
      },
    },
    {
      title: 'It should fail to create two options with the same position',
      context: {
        options: [
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
          },
          {
            label: 'Option 1',
            value: 'option1',
            color: 'green',
            position: 1,
          },
        ],
      },
    },
  ];

  test.each(failingTestCases)('$title', async ({ context: { options } }) => {
    const { data, errors } = await createOneFieldMetadata({
      input: {
        objectMetadataId: createdObjectMetadataId,
        type: FieldMetadataType.SELECT,
        name: 'testField',
        label: 'Test Field',
        isLabelSyncedWithName: false,
        options,
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
