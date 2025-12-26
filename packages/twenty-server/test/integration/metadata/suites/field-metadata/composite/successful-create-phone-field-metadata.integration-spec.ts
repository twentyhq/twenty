import { faker } from '@faker-js/faker';
import { type CountryCode } from 'libphonenumber-js';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { type EachTestingContext } from 'twenty-shared/testing';
import {
  FieldMetadataType,
  type AdditionalPhoneMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

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
      title: 'create primary phone field',
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
      title: 'create primary phone field with number and other information',
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
        'create primary phone field with full international format and other information',
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
          additionalPhones: [],
        },
      },
    },
    {
      title:
        'create primary phone field with full international and infer other information from it but not the countryCode as its shared',
      context: {
        input: { primaryPhoneNumber: '+1123456789' },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneCallingCode: '+1',
          additionalPhones: [],
        },
      },
    },
    {
      title:
        'create primary phone field with full international and infer other information from it',
      context: {
        input: { primaryPhoneNumber: '+33123456789' },
        expected: {
          primaryPhoneNumber: '123456789',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneCallingCode: '+33',
          additionalPhones: [],
        },
      },
    },
    {
      title: 'create primary phone field with empty payload',
      context: {
        input: {},
        expected: {
          primaryPhoneNumber: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneCallingCode: '',
          additionalPhones: [],
        },
      },
    },
    {
      title: 'create primary phone field with empty strings in payload',
      context: {
        input: {
          primaryPhoneNumber: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneCallingCode: '',
          additionalPhones: null,
        },
        expected: {
          primaryPhoneNumber: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneCallingCode: '',
          additionalPhones: [],
        },
      },
    },
    {
      title: 'create additional phone field with number and other information',
      context: {
        input: {
          additionalPhones: [
            { callingCode: '+33', countryCode: 'FR', number: '123456789' },
          ],
        },
        expected: {
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneNumber: '',
          additionalPhones: [
            { callingCode: '+33', countryCode: 'FR', number: '123456789' },
          ],
        },
      },
    },
    {
      title:
        'create additional phone field with full international format and other information',
      context: {
        input: {
          additionalPhones: [
            { callingCode: '+1', countryCode: 'US', number: '+1123456789' },
          ],
        },
        expected: {
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneNumber: '',
          additionalPhones: [
            { callingCode: '+1', countryCode: 'US', number: '123456789' },
          ],
        },
      },
    },
    {
      title:
        'create additional phone field with full international and infer other information from it but not the countryCode as its shared',
      context: {
        input: { additionalPhones: [{ number: '+1123456789' }] },
        expected: {
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneNumber: '',
          additionalPhones: [
            {
              callingCode: '+1',
              number: '123456789',
            },
          ],
        },
      },
    },
    {
      title:
        'create additional phone field with full international and infer other information from it',
      context: {
        input: { additionalPhones: [{ number: '+33123456789' }] },
        expected: {
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneNumber: '',
          additionalPhones: [
            { callingCode: '+33', countryCode: 'FR', number: '123456789' },
          ],
        },
      },
    },
    {
      title: 'create additional phone field with empty payload',
      context: {
        input: { additionalPhones: [{}] },
        expected: {
          primaryPhoneCallingCode: '',
          primaryPhoneCountryCode: '' as CountryCode,
          primaryPhoneNumber: '',
          additionalPhones: [{}],
        },
      },
    },
  ];

describe('successful create phone field metadata test suite', () => {
  let createdObjectMetadataId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
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
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  test.each(SUCCESSFUL_TEST_CASES)(
    'it should succeed $title',

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
      const { id: _id, ...rest } = createOneResponse;

      expect(rest[FIELD_NAME]).toStrictEqual({
        ...expected,
        __typename: 'Phones',
      });
    },
  );
});
