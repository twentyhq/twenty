import { getFieldMetadataCreationInputs } from 'test/integration/graphql/suites/inputs-validation/utils/get-field-metadata-creation-inputs.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const TEST_OBJECT_METADATA_NAME_SINGULAR = 'apiInputValidationTestObject';
const TEST_OBJECT_METADATA_NAME_PLURAL = 'apiInputValidationTestObjects';
const TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_1 =
  'apiInputValidationTargetTestObject1';
const TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_1 =
  'apiInputValidationTargetTestObjects1';
const TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_2 =
  'apiInputValidationTargetTestObject2';
const TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_2 =
  'apiInputValidationTargetTestObjects2';

export const TEST_TARGET_OBJECT_RECORD_ID =
  '20202020-a21e-4ec2-873b-de4264d89025';

export const TEST_UUID_FIELD_VALUE = '20202020-b21e-4ec2-873b-de4264d89025';

export const TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE =
  '20202020-b21e-4ec2-873b-de4264d89021';

export const joinColumnNameForManyToOneMorphRelationField1 =
  computeMorphRelationFieldName({
    fieldName: 'manyToOneMorphRelationField',
    relationType: RelationType.MANY_TO_ONE,
    targetObjectMetadataNameSingular:
      TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_1,
    targetObjectMetadataNamePlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_1,
  }) + 'Id';

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

  const createdTargetObjectMetadata1 = await createOneObjectMetadata({
    input: {
      nameSingular: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_1,
      namePlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_1,
      labelSingular: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_1,
      labelPlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_1,
    },
  });

  const createdTargetObjectMetadata2 = await createOneObjectMetadata({
    input: {
      nameSingular: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_2,
      namePlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_2,
      labelSingular: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_2,
      labelPlural: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_2,
    },
  });

  const targetObjectMetadata1Id =
    createdTargetObjectMetadata1.data.createOneObject.id;
  const targetObjectMetadata2Id =
    createdTargetObjectMetadata2.data.createOneObject.id;

  const fieldMetadataCreationInputs = getFieldMetadataCreationInputs(
    objectMetadataId,
    targetObjectMetadata1Id,
    targetObjectMetadata2Id,
  );

  for (const input of fieldMetadataCreationInputs) {
    await createOneFieldMetadata({
      input,
    });
  }

  await makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_1,
      objectMetadataPluralName: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_1,
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
      gqlFields: `
      id
      ${joinColumnNameForManyToOneMorphRelationField1}`,
      data: [
        {
          id: v4(),
          manyToOneRelationFieldId: TEST_TARGET_OBJECT_RECORD_ID,
          [joinColumnNameForManyToOneMorphRelationField1]:
            TEST_TARGET_OBJECT_RECORD_ID,
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
          id: v4(),
        },
      ],
    }),
  );

  await makeGraphqlAPIRequest(
    createManyOperationFactory({
      objectMetadataSingularName: TEST_TARGET_OBJECT_METADATA_NAME_SINGULAR_1,
      objectMetadataPluralName: TEST_TARGET_OBJECT_METADATA_NAME_PLURAL_1,
      gqlFields: `id`,
      data: [
        {
          id: TEST_TARGET_OBJECT_RECORD_ID_FIELD_VALUE,
        },
      ],
    }),
  );

  return {
    objectMetadataId,
    targetObjectMetadata1Id,
    targetObjectMetadata2Id,
    objectMetadataSingularName: TEST_OBJECT_METADATA_NAME_SINGULAR,
    objectMetadataPluralName: TEST_OBJECT_METADATA_NAME_PLURAL,
  };
};
