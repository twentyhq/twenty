import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

const createRecordQuery = gql`
  mutation CreateFirstRecord($data: TestRecordObjectCreateInput!) {
    createTestRecordObject(data: $data) {
      id
      uniqueTestField
    }
  }
`;

describe('create records with custom unique fields', () => {
  let createdObjectMetadataId = '';
  let uniqueFieldId = '';

  beforeAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: true,
    });
  });

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testRecordObject',
        namePlural: 'testRecordObjects',
        labelSingular: 'Test Record Object',
        labelPlural: 'Test Record Objects',
        icon: 'IconTestRecord',
      },
    });

    createdObjectMetadataId = objectMetadataId;

    const { data: createdField } = await createOneFieldMetadata({
      input: {
        name: 'uniqueTestField',
        label: 'Unique Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: createdObjectMetadataId,
        isUnique: true,
      },
      gqlFields: `
        id
        name
        label
        type
        isUnique
      `,
    });

    uniqueFieldId = createdField.createOneField.id;
  });

  afterEach(async () => {
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

  it('should not create the second record with same value on unique field', async () => {
    const firstRecordResponse = await makeGraphqlAPIRequest({
      query: createRecordQuery,
      variables: {
        data: {
          uniqueTestField: 'uniqueValue123',
        },
      },
    });

    expect(firstRecordResponse.body.errors).toBeUndefined();
    expect(firstRecordResponse.body.data.createTestRecordObject).toBeDefined();
    expect(
      firstRecordResponse.body.data.createTestRecordObject.uniqueTestField,
    ).toBe('uniqueValue123');

    const secondRecordResponse = await makeGraphqlAPIRequest({
      query: createRecordQuery,
      variables: {
        data: {
          uniqueTestField: 'uniqueValue123',
        },
      },
    });

    expect(secondRecordResponse.body.errors).toBeDefined();
    expect(secondRecordResponse.body.errors[0].message).toContain(
      'Duplicate Unique Test Field with value uniqueValue123. Please set a unique one.',
    );
    expect(secondRecordResponse.body.data.createTestRecordObject).toBeNull();
  });

  it('should create the second record with same value on updated field (previously unique)', async () => {
    const firstRecordResponse = await makeGraphqlAPIRequest({
      query: createRecordQuery,
      variables: {
        data: {
          uniqueTestField: 'duplicateValue',
        },
      },
    });

    expect(firstRecordResponse.body.errors).toBeUndefined();
    expect(
      firstRecordResponse.body.data.createTestRecordObject.uniqueTestField,
    ).toBe('duplicateValue');

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: uniqueFieldId,
        updatePayload: { isUnique: false },
      },
      gqlFields: `
        id
        name
        isUnique
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.isUnique).toBe(false);

    const secondRecordResponse = await makeGraphqlAPIRequest({
      query: createRecordQuery,
      variables: {
        data: {
          uniqueTestField: 'duplicateValue',
        },
      },
    });

    expect(secondRecordResponse.body.errors).toBeUndefined();
    expect(secondRecordResponse.body.data.createTestRecordObject).toBeDefined();
    expect(
      secondRecordResponse.body.data.createTestRecordObject.uniqueTestField,
    ).toBe('duplicateValue');
  });

  it('should not create a unique index on field if records with same value already exist', async () => {
    await updateOneFieldMetadata({
      input: {
        idToUpdate: uniqueFieldId,
        updatePayload: { isUnique: false },
      },
      gqlFields: `
        id
        name
        isUnique
      `,
    });

    const firstRecordResponse = await makeGraphqlAPIRequest({
      query: createRecordQuery,
      variables: {
        data: {
          uniqueTestField: 'duplicatedValue',
        },
      },
    });

    expect(firstRecordResponse.body.errors).toBeUndefined();

    const secondRecordResponse = await makeGraphqlAPIRequest({
      query: createRecordQuery,
      variables: {
        data: {
          uniqueTestField: 'duplicatedValue',
        },
      },
    });

    expect(secondRecordResponse.body.errors).toBeUndefined();

    const { data, errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: uniqueFieldId,
        updatePayload: { isUnique: true },
      },
      gqlFields: `
        id
        name
        isUnique
      `,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expect(errors).toBeDefined();
    expect(errors[0].message).toContain(
      'Unique index creation failed because of unique constraint violation',
    );
  });
});
