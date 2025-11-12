import gql from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

const createRecordsQuery = gql`
  mutation CreateRecords(
    $data: [TestRecordObjectCreateInput!]!
    $upsert: Boolean
  ) {
    createTestRecordObjects(data: $data, upsert: $upsert) {
      id
      firstUniqueTestField
      secondUniqueTestField
      name
      deletedAt
    }
  }
`;

const deleteRecordsQuery = gql`
  mutation DeleteRecords($filter: TestRecordObjectFilterInput!) {
    deleteTestRecordObjects(filter: $filter) {
      id
      firstUniqueTestField
      secondUniqueTestField
      name
      deletedAt
    }
  }
`;

describe('upsert (createMany with upsert:true)', () => {
  let createdObjectMetadataId = '';

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

    await createOneFieldMetadata({
      input: {
        name: 'firstUniqueTestField',
        label: 'First Unique Test Field',
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

    await createOneFieldMetadata({
      input: {
        name: 'secondUniqueTestField',
        label: 'Second Unique Test Field',
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

  it('should update many records', async () => {
    // Create 2 records
    await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            firstUniqueTestField: 'firstUniqueTestField1',
            secondUniqueTestField: 'secondUniqueTestField1',
            name: 'record1',
          },
          {
            firstUniqueTestField: 'firstUniqueTestField2',
            secondUniqueTestField: 'secondUniqueTestField2',
            name: 'record2',
          },
        ],
        upsert: false,
      },
    });

    // Update 2 records using upsert
    const updatedRecordsResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            firstUniqueTestField: 'firstUniqueTestField1',
            name: 'updatedRecord1',
          },
          {
            firstUniqueTestField: 'firstUniqueTestField2',
            name: 'updatedRecord2',
          },
        ],
        upsert: true,
      },
    });

    const updatedRecords =
      updatedRecordsResponse.body.data.createTestRecordObjects;

    expect(updatedRecords).toHaveLength(2);

    const record1 = updatedRecords.find(
      (record: any) => record.firstUniqueTestField === 'firstUniqueTestField1',
    );
    const record2 = updatedRecords.find(
      (record: any) => record.firstUniqueTestField === 'firstUniqueTestField2',
    );

    expect(record1).toEqual({
      id: expect.any(String),
      firstUniqueTestField: 'firstUniqueTestField1',
      secondUniqueTestField: 'secondUniqueTestField1',
      name: 'updatedRecord1',
      deletedAt: null,
    });

    expect(record2).toEqual({
      id: expect.any(String),
      firstUniqueTestField: 'firstUniqueTestField2',
      secondUniqueTestField: 'secondUniqueTestField2',
      name: 'updatedRecord2',
      deletedAt: null,
    });
  });

  it('should throw an error when multiple records with the same unique field values are found', async () => {
    await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            firstUniqueTestField: 'firstUniqueTestField1',
            secondUniqueTestField: 'secondUniqueTestField1',
            name: 'record1',
          },
          {
            firstUniqueTestField: 'firstUniqueTestField2',
            secondUniqueTestField: 'secondUniqueTestField2',
            name: 'record2',
          },
        ],
        upsert: false,
      },
    });

    const upsertResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            firstUniqueTestField: 'firstUniqueTestField1',
            secondUniqueTestField: 'secondUniqueTestField2',
            name: 'conflictingRecord',
          },
        ],
        upsert: true,
      },
    });

    expect(upsertResponse.body.errors).toBeDefined();
    expect(upsertResponse.body.errors[0].message).toContain(
      'Multiple records found with the same unique field values',
    );
    expect(upsertResponse.body.errors[0].extensions.code).toBe(
      'BAD_USER_INPUT',
    );
  });

  it('should update and restore updated soft-deleted record', async () => {
    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            firstUniqueTestField: 'softDeletedRecord',
            secondUniqueTestField: 'softDeletedSecondField',
            name: 'originalRecord',
          },
        ],
        upsert: false,
      },
    });

    const createdRecord = createResponse.body.data.createTestRecordObjects[0];

    const deleteResponse = await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: createdRecord.id } },
      },
    });

    const updateResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [{ id: createdRecord.id, name: 'updatedRecord' }],
        upsert: true,
      },
    });

    expect(
      deleteResponse.body.data.deleteTestRecordObjects[0].deletedAt,
    ).toEqual(expect.any(String));
    expect(
      updateResponse.body.data.createTestRecordObjects[0].deletedAt,
    ).toBeNull();
    expect(updateResponse.body.data.createTestRecordObjects[0].id).toEqual(
      createdRecord.id,
    );
  });
});
