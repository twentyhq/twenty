import { faker } from '@faker-js/faker';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { FieldMetadataType } from 'twenty-shared/types';

const OBJECT_SINGULAR = 'uniquePhonesTestObject';
const OBJECT_PLURAL = 'uniquePhonesTestObjects';
const FIELD_NAME = 'phone';

describe('unique PHONES field with empty values', () => {
  let createdObjectMetadataId: string;
  let createdRecordIdsForCleaning: string[] = [];

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Unique Phones Test Object',
        labelPlural: 'Unique Phones Test Objects',
        icon: 'IconPhone',
        isLabelSyncedWithName: false,
      },
    });

    createdObjectMetadataId = data.createOneObject.id;

    await createOneFieldMetadata({
      input: {
        name: FIELD_NAME,
        label: 'Phone',
        type: FieldMetadataType.PHONES,
        objectMetadataId: createdObjectMetadataId,
        isUnique: true,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
        id
        name
        isUnique
      `,
    });
  });

  afterEach(async () => {
    if (createdRecordIdsForCleaning.length > 0) {
      await deleteRecordsByIds(OBJECT_SINGULAR, createdRecordIdsForCleaning);
      createdRecordIdsForCleaning = [];
    }
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
    });
  });

  it('should allow creating two records with empty primaryPhoneNumber on a unique PHONES field', async () => {
    const firstId = faker.string.uuid();
    const secondId = faker.string.uuid();

    const firstResponse = await createOneOperation({
      objectMetadataSingularName: OBJECT_SINGULAR,
      input: {
        id: firstId,
        [FIELD_NAME]: { primaryPhoneNumber: '' },
      },
      gqlFields: `id`,
    });

    expect(firstResponse.errors).toBeUndefined();
    expect(firstResponse.data.createOneResponse.id).toBe(firstId);
    createdRecordIdsForCleaning.push(firstId);

    const secondResponse = await createOneOperation({
      objectMetadataSingularName: OBJECT_SINGULAR,
      input: {
        id: secondId,
        [FIELD_NAME]: { primaryPhoneNumber: '' },
      },
      gqlFields: `id`,
    });

    expect(secondResponse.errors).toBeUndefined();
    expect(secondResponse.data.createOneResponse.id).toBe(secondId);
    createdRecordIdsForCleaning.push(secondId);
  });

  it('should allow creating two records with no PHONES payload at all', async () => {
    const firstId = faker.string.uuid();
    const secondId = faker.string.uuid();

    const firstResponse = await createOneOperation({
      objectMetadataSingularName: OBJECT_SINGULAR,
      input: { id: firstId },
      gqlFields: `id`,
    });

    expect(firstResponse.errors).toBeUndefined();
    createdRecordIdsForCleaning.push(firstId);

    const secondResponse = await createOneOperation({
      objectMetadataSingularName: OBJECT_SINGULAR,
      input: { id: secondId },
      gqlFields: `id`,
    });

    expect(secondResponse.errors).toBeUndefined();
    createdRecordIdsForCleaning.push(secondId);
  });

  it('should still enforce uniqueness when two records share the same non-empty primaryPhoneNumber', async () => {
    const firstId = faker.string.uuid();
    const secondId = faker.string.uuid();

    const firstResponse = await createOneOperation({
      objectMetadataSingularName: OBJECT_SINGULAR,
      input: {
        id: firstId,
        [FIELD_NAME]: {
          primaryPhoneNumber: '4155552671',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
        },
      },
      gqlFields: `id`,
    });

    expect(firstResponse.errors).toBeUndefined();
    createdRecordIdsForCleaning.push(firstId);

    const secondResponse = await createOneOperation({
      objectMetadataSingularName: OBJECT_SINGULAR,
      input: {
        id: secondId,
        [FIELD_NAME]: {
          primaryPhoneNumber: '4155552671',
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
        },
      },
      gqlFields: `id`,
      expectToFail: true,
    });

    expect(secondResponse.errors).toBeDefined();
  });
});
