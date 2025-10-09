import { randomUUID } from 'crypto';

import { TEST_OBJECT_GQL_FIELDS } from 'test/integration/graphql/suites/inputs-validation/constants/test-object-gql-fields.constant';
import { getFieldMetadataCreationInputs } from 'test/integration/graphql/suites/inputs-validation/utils/get-field-metadata-creation-inputs.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';

const TEST_OBJECT_METADATA_NAME_SINGULAR = 'apiInputValidationTestObject';
const TEST_OBJECT_METADATA_NAME_PLURAL = 'apiInputValidationTestObjects';
const TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR =
  'apiInputValidationTargetTestObject';
const TEST_TARGET_OBJECT_METADATA_NAME_PLURAL =
  'apiInputValidationTargetTestObjects';

export const TEST_TARGET_OBJECT_RECORD_ID =
  '20202020-a21e-4ec2-873b-de4264d89025';

export const TEST_UUID_FIELD_VALUE = '20202020-b21e-4ec2-873b-de4264d89025';

export const setupTestObjectsWithAllFieldTypes = async () => {
  const createdObjectMetadata = await createOneObjectMetadata({
    input: {
      nameSingular: TEST_OBJECT_METADATA_NAME_SINGULAR,
      namePlural: TEST_OBJECT_METADATA_NAME_PLURAL,
      labelSingular: TEST_OBJECT_METADATA_NAME_SINGULAR,
      labelPlural: TEST_OBJECT_METADATA_NAME_PLURAL,
    },
  });

  const objectMetadataId = createdObjectMetadata.data.createOneObject.id;

  const createdTargetObjectMetadata = await createOneObjectMetadata({
    input: {
      nameSingular: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR,
      namePlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL,
      labelSingular: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR,
      labelPlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL,
    },
  });

  const targetObjectMetadataId =
    createdTargetObjectMetadata.data.createOneObject.id;

  const fieldMetadataCreationInputs = getFieldMetadataCreationInputs(
    objectMetadataId,
    targetObjectMetadataId,
  );

  for (const input of fieldMetadataCreationInputs) {
    await createOneFieldMetadata({
      input,
    });
  }

  await makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR,
      objectMetadataPluralName: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL,
      gqlFields: `id`,
      data: [
        {
          id: TEST_TARGET_OBJECT_RECORD_ID,
        },
      ],
    }),
  );

  await makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName: TEST_OBJECT_METADATA_NAME_SINGULAR,
      objectMetadataPluralName: TEST_OBJECT_METADATA_NAME_PLURAL,
      gqlFields: TEST_OBJECT_GQL_FIELDS,
      data: [
        {
          id: randomUUID(),
          manyToOneRelationFieldId: TEST_TARGET_OBJECT_RECORD_ID,
          uuidField: TEST_UUID_FIELD_VALUE,
          textField: 'test',
          phonesField: {
            primaryPhoneNumber: '01234567890',
            primaryPhoneCallingCode: '+33',
            primaryPhoneCountryCode: 'FR',
            additionalPhones: [
              {
                number: '01234567890',
                callingCode: '+33',
                countryCode: 'FR',
              },
            ],
          },
          emailsField: {
            primaryEmail: 'test@test.com',
            additionalEmails: ['test@test.com'],
          },
          dateTimeField: '2025-01-01T00:00:00Z',
          dateField: '2025-01-01',
          booleanField: true,
          numberField: 1,
          linksField: {
            primaryLinkUrl: 'twenty.com',
            primaryLinkLabel: 'twenty - #1 Open source CRM',
            secondaryLinks: [
              {
                url: 'twenty.com',
                label: 'twenty - #1 Open source CRM',
              },
            ],
          },
          currencyField: {
            amountMicros: 1000000,
            currencyCode: 'USD',
          },
          fullNameField: {
            firstName: 'John',
            lastName: 'Doe',
          },
          ratingField: 'RATING_5',
          selectField: 'OPTION_1',
          multiSelectField: ['OPTION_1'],
          addressField: {
            addressStreet1: 'address street 1',
            addressStreet2: 'address street 2',
            addressCity: 'address city',
            addressState: 'address state',
            addressCountry: 'address country',
            addressPostcode: 'address postcode',
          },
          rawJsonField: {
            test: 'test',
          },
          arrayField: ['test'],
        },
        {
          id: randomUUID(),
        },
      ],
    }),
  );

  return {
    objectMetadataId,
    targetObjectMetadataId,
    objectMetadataSingularName: TEST_OBJECT_METADATA_NAME_SINGULAR,
    objectMetadataPluralName: TEST_OBJECT_METADATA_NAME_PLURAL,
  };
};
