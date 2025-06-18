import { faker } from '@faker-js/faker/.';
import { EachTestingContext } from 'twenty-shared/testing';

import { PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_NAME = 'phonenumber';

type CreatePhoneFieldMetadataTestCase = {
  input: Partial<PhonesMetadata>;
  expected: Partial<PhonesMetadata>
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<CreatePhoneFieldMetadataTestCase>[] = [
  {
    title: 'create phone field with number only',
    context: {
      input: {
        primaryPhoneNumber: '781037818',
        additionalPhones: [],
      },
      expected: {
        primaryPhoneNumber: '781037818',
        additionalPhones: [],
      },
    },
  },
  {
    title: 'create phone field with full international format',
    context: {
      input: {
        primaryPhoneNumber: '+1781037818',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
        additionalPhones: null,
      },
      expected: {
        primaryPhoneNumber: '781037818',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
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
];

describe('Phone field metadata tests suite', () => {
  let createdObjectMetadataId: string;

  beforeEach(async () => {
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

  afterEach(async () => {
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  test.each(SUCCESSFUL_TEST_CASES)(
    '$title',
    async ({ context: { input, expected } }) => {
      const {
        data: { createOneResponse },
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

      const { id, ...rest } = createOneResponse;
      expect(rest[FIELD_NAME]).toMatchObject({
        ...expected,
        __typename: 'Phones',
      });
    },
  );
});
