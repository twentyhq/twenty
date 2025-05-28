import { UpdateCreateFieldMetadataSelectTestCase } from 'test/integration/metadata/suites/field-metadata/update-create-one-field-metadata-select-tests-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import {
    LISTING_NAME_PLURAL,
    LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';

describe('Field metadata select creation tests group', () => {
  let createdObjectMetadataId: string;

  beforeEach(async () => {
    const { data, errors } = await forceCreateOneObjectMetadata({
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

  const successfullTestCases: UpdateCreateFieldMetadataSelectTestCase[] = [
    // {
    //   title: 'should succeed with provided option id',
    //   context: {
    //     input: {
    //       options: [
    //         {
    //           label: 'Option 1',
    //           value: 'OPTION_1',
    //           color: 'green',
    //           position: 1,
    //           id: '26c602c3-cba9-4d83-92d4-4ba7dbae2f31',
    //         },
    //       ],
    //     },
    //   },
    // },
    {
      title: 'should succeed with valid multi-select default values',
      context: {
        input: {
          defaultValue: JSON.stringify(["'OPTION_1'", "'OPTION_2'"]),
          options: [
            {
              label: 'Option 1',
              value: 'OPTION_1',
              color: 'green',
              position: 1,
            },
            {
              label: 'Option 2',
              value: 'OPTION_2',
              color: 'blue',
              position: 2,
            },
          ],
        },
      },
    },
    // {
    //   title: 'should succeed with empty multi-select default values array',
    //   context: {
    //     input: {
    //       defaultValue: [],
    //       options: [
    //         {
    //           label: 'Option 1',
    //           value: 'OPTION_1',
    //           color: 'green',
    //           position: 1,
    //         },
    //       ],
    //     },
    //   },
    // },
  ];

  test.each(successfullTestCases)(
    'Create $title',
    async ({ context: { input, expectedOptions } }) => {
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

  const failingTestCases: UpdateCreateFieldMetadataSelectTestCase[] = [
    {
      title: 'should succeed with empty multi-select default values array',
      context: {
        input: {
          defaultValue: 'Option_1',
          options: [
            {
              label: 'Option 1',
              value: 'OPTION_1',
              color: 'green',
              position: 1,
            },
          ],
        },
      },
    },
  ];

  //   test.each(failingTestCases)(
  //     'Create $title',
  //     async ({ context: { input } }) => {
  //       const { data, errors } = await createOneFieldMetadata({
  //         input: {
  //           objectMetadataId: createdObjectMetadataId,
  //           type: FieldMetadataType.MULTI_SELECT,
  //           name: 'testField',
  //           label: 'Test Field',
  //           isLabelSyncedWithName: false,
  //           ...input,
  //         },
  //         gqlFields: `
  //           id
  //           options
  //           defaultValue
  //           `,
  //       });

  //       expect(data).toBeNull();
  //       expect(errors).toBeDefined();
  //       expect(errors).toMatchSnapshot();
  //     },
  //   );
});
