import { faker } from '@faker-js/faker/.';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { updateOneOperation } from 'test/integration/graphql/utils/update-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

const FIELD_NAME = 'phonenumber';

describe('Phone field metadata tests suite', () => {
  let createdObjectMetadataId: string;

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'myTestObject',
        namePlural: 'myTestObjects',
        labelSingular: 'My Test Object',
        labelPlural: 'My Test Objects',
        icon: 'Icon123',
      },
    });

    createdObjectMetadataId = objectMetadataId;

    const createFieldInput = {
      name: FIELD_NAME,
      label: 'Phone number',
      type: FieldMetadataType.PHONES,
      objectMetadataId: createdObjectMetadataId,
      isLabelSyncedWithName: false,
    };
    await createOneFieldMetadata({
      input: createFieldInput,
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
  it('Stephanie reproduction', async () => {
    const {
      data: { createOneResponse },
    } = await createOneOperation<{
      id: string;
      [FIELD_NAME]: any;
    }>({
      objectMetadataSingularName: 'myTestObject',
      input: {
        id: faker.string.uuid(),
        [FIELD_NAME]: {
          primaryPhoneNumber: '781037818',
          additionalPhones: [],
        },
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
    expect(rest).toMatchInlineSnapshot(`
{
  "phonenumber": {
    "__typename": "Phones",
    "additionalPhones": [],
    "primaryPhoneCallingCode": "",
    "primaryPhoneCountryCode": "",
    "primaryPhoneNumber": "781037818",
  },
}
`);
    const createdRecordId = createOneResponse.id;

    const {
      data: { updateOneResponse },
    } = await updateOneOperation({
      input: {
        [FIELD_NAME]: {
          primaryPhoneNumber: '+1781037818',
          primaryPhoneCountryCode: 'US',
          primaryPhoneCallingCode: '+1',
          additionalPhones: [],
        },
      },
      objectMetadataSingularName: 'myTestObject',
      recordId: createdRecordId,
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

    {
      const { id, ...rest } = updateOneResponse;
      expect(rest).toMatchInlineSnapshot(`
{
  "phonenumber": {
    "__typename": "Phones",
    "additionalPhones": [],
    "primaryPhoneCallingCode": "+1",
    "primaryPhoneCountryCode": "US",
    "primaryPhoneNumber": "781037818",
  },
}
`);
    }
  });

  it.skip('Empty phone', async () => {
    const {
      data: { createOneResponse },
    } = await createOneOperation<{
      id: string;
      [FIELD_NAME]: any;
    }>({
      objectMetadataSingularName: 'myTestObject',
      input: {
        id: faker.string.uuid(),
        [FIELD_NAME]: {},
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
    expect(rest).toMatchInlineSnapshot(`
{
  "phonenumber": {
    "__typename": "Phones",
    "additionalPhones": null,
    "primaryPhoneCallingCode": "",
    "primaryPhoneCountryCode": "",
    "primaryPhoneNumber": "",
  },
}
`);
  });
});
