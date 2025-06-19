import { faker } from '@faker-js/faker';
import { EachTestingContext } from 'twenty-shared/testing';

import {
  AdditionalPhoneMetadata,
  PhonesMetadata,
} from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { forceCreateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/force-create-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_NAME = 'phonenumber';

type TestCaseInputAndExpected = Partial<
  Omit<PhonesMetadata, 'additionalPhones'>
> & {
  additionalPhones?: Array<Partial<AdditionalPhoneMetadata>> | null;
};
type CreatePhoneFieldMetadataTestCase = {
  input: TestCaseInputAndExpected;
  expected?: TestCaseInputAndExpected;
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<CreatePhoneFieldMetadataTestCase>[] =
  [
    {
      title: 'create phone field with number only',
      context: {
        input: {
          primaryPhoneNumber: '123456789',
          additionalPhones: [],
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '' as any,
          additionalPhones: [],
        },
      },
    },
    {
      title: 'create phone field with number and other information',
      context: {
        input: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+33',
          primaryPhoneCountryCode: 'FR',
          additionalPhones: [],
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+33',
          primaryPhoneCountryCode: 'FR',
          additionalPhones: [],
        },
      },
    },
    {
      title:
        'create phone field with full international format and other information',
      context: {
        input: {
          primaryPhoneNumber: '+1123456789',
          primaryPhoneCountryCode: 'US',
          primaryPhoneCallingCode: '+1',
          additionalPhones: null,
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCountryCode: 'US',
          primaryPhoneCallingCode: '+1',
          additionalPhones: null,
        },
      },
    },
    {
      title:
        'create phone field with full international and infer other information from it but not the countryCode as its shared',
      context: {
        input: {
          primaryPhoneNumber: '+1123456789',
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCountryCode: '' as any,
          primaryPhoneCallingCode: '+1',
          additionalPhones: null,
        },
      },
    },
    {
      title:
        'create phone field with full international and infer other information from it',
      context: {
        input: {
          primaryPhoneNumber: '+33123456789',
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneCallingCode: '+33',
          additionalPhones: null,
        },
      },
    },
    {
      title: 'create phone field with empty payload',
      context: {
        input: {},
        expected: {
          primaryPhoneNumber: '',
          primaryPhoneCountryCode: '' as any,
          primaryPhoneCallingCode: '',
          additionalPhones: null,
        },
      },
    },
    {
      title: 'create phone field with multiple additional phones',
      context: {
        input: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          additionalPhones: [
            {
              number: '987654321',
              callingCode: '+33',
              countryCode: 'FR',
            },
            {
              number: '+44456789123',
            },
          ],
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          additionalPhones: [
            {
              number: '987654321',
              callingCode: '+33',
              countryCode: 'FR',
            },
            {
              number: '456789123',
              callingCode: '+44',
            },
          ],
        },
      },
    },
    {
      title:
        'create phone field with additional phone having minimal information',
      context: {
        input: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          additionalPhones: [
            {
              number: '987654321',
              callingCode: '',
              countryCode: 'US',
            },
          ],
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          additionalPhones: [
            {
              number: '987654321',
              callingCode: '',
              countryCode: 'US',
            },
          ],
        },
      },
    },
    {
      title:
        'create phone field with additional phone using international format',
      context: {
        input: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          additionalPhones: [
            {
              number: '+61412345678',
            },
          ],
        },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
          additionalPhones: [
            {
              number: '412345678',
              callingCode: '+61',
              countryCode: 'AU',
            },
          ],
        },
      },
    },
  ];

const FAILING_TEST_INPUTS: { input: Partial<PhonesMetadata>; label: string }[] =
  [
    {
      label: 'phone field with invalid country code',
      input: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'XX' as any,
        additionalPhones: [],
      },
    },
    {
      label: 'phone field with invalid calling code',
      input: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+999',
        primaryPhoneCountryCode: 'FR',
        additionalPhones: [],
      },
    },
    {
      label: 'phone field with conflicting country code and calling code',
      input: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'US',
        additionalPhones: [],
      },
    },
    {
      label: 'phone field with invalid phone number format',
      input: {
        primaryPhoneNumber: 'not-a-number',
        additionalPhones: [],
      },
    },
    {
      label: 'phone field with conflicting phone number country code',
      input: {
        primaryPhoneNumber: '+33123456789',
        primaryPhoneCountryCode: 'US',
        additionalPhones: [],
      },
    },
    {
      label: 'phone field with conflicting phone number calling code',
      input: {
        primaryPhoneNumber: '+33123456789',
        primaryPhoneCallingCode: '+1',
        additionalPhones: [],
      },
    },
  ];

const primaryFailingTests = FAILING_TEST_INPUTS.map<
  EachTestingContext<CreatePhoneFieldMetadataTestCase>
>(({ input, label }) => ({
  title: `create primary ${label}`,
  context: {
    input: {
      ...input,
      additionalPhones: [],
    },
  },
}));

const additionalPhonesNumberTests = FAILING_TEST_INPUTS.map<
  EachTestingContext<CreatePhoneFieldMetadataTestCase>
>(
  ({
    input: {
      primaryPhoneCallingCode,
      primaryPhoneCountryCode,
      primaryPhoneNumber,
    },
    label,
  }) => ({
    title: `create primary ${label}`,
    context: {
      input: {
        additionalPhones: [
          {
            callingCode: primaryPhoneCallingCode,
            countryCode: primaryPhoneCountryCode,
            number: primaryPhoneNumber,
          },
        ],
      },
    },
  }),
);

const FAILING_TEST_CASES: EachTestingContext<CreatePhoneFieldMetadataTestCase>[] =
  [...primaryFailingTests, ...additionalPhonesNumberTests];

describe('Phone field metadata tests suite', () => {
  let createdObjectMetadataId: string;

  beforeEach(async () => {
    const { data } = await forceCreateOneObjectMetadata({
      input: {
        nameSingular: 'myTestObject',
        namePlural: 'myTestObjects',
        labelSingular: 'My Test Object',
        labelPlural: 'My Test Objects',
        icon: 'Icon123',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;

    await createOneFieldMetadata({
      input: {
        name: FIELD_NAME,
        label: 'Phone number',
        type: FieldMetadataType.PHONES,
        objectMetadataId: createdObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
        id
        name
        label
        isLabelSyncedWithName
      `,
    });
  });

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  test.skip.each(SUCCESSFUL_TEST_CASES)(
    'It should succeed $title',

    async ({ context: { input, expected } }) => {
      const {
        data: { createOneResponse },
        errors,
      } = await createOneOperation<{
        id: string;
        [FIELD_NAME]: any;
      }>({
        objectMetadataSingularName: 'myTestObject',
        input: {
          id: faker.string.uuid(),
          [FIELD_NAME]: input,
        },
        gqlFields: `
          id
          ${FIELD_NAME} {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
            __typename
          }
        `,
      });

      expect(errors).toBeUndefined();
      const { id, ...rest } = createOneResponse;
      expect(rest[FIELD_NAME]).toStrictEqual({
        ...expected,
        __typename: 'Phones',
      });
    },
  );

  test.each(FAILING_TEST_CASES)(
    'It should fail to $title',

    async ({ context: { input } }) => {
      const {
        data: { createOneResponse },
        errors,
      } = await createOneOperation<{
        id: string;
        [FIELD_NAME]: any;
      }>({
        objectMetadataSingularName: 'myTestObject',
        input: {
          id: faker.string.uuid(),
          [FIELD_NAME]: input,
        },
        gqlFields: `
          id
          ${FIELD_NAME} {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
            __typename
          }
        `,
      });

      expect(createOneResponse).toBeNull();
      expect(errors).toBeDefined();
      expect(errors).toMatchSnapshot();
    },
  );
});
