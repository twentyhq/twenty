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

const FAILING_TEST_INPUTS: { input: Partial<PhonesMetadata>; label: string }[] =
  [
    {
      label: 'phone field without country or calling code at all',
      input: {
        primaryPhoneNumber: '123456789',
        additionalPhones: [],
      },
    },
    {
      label: 'phone field with invalid country code',
      input: {
        primaryPhoneNumber: '123456789',
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'XX' as CountryCode,
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

const additionalPhonesNumberFailingTests = FAILING_TEST_INPUTS.map<
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
  [...primaryFailingTests, ...additionalPhonesNumberFailingTests];

describe('failing create phone field metadata test suite', () => {
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

  test.each(FAILING_TEST_CASES)(
    'it should fail to $title',

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
