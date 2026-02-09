import gql from 'graphql-tag';
import { makeGraphqlAPIRequestWithFileUpload } from 'test/integration/graphql/utils/make-graphql-api-request-with-file-upload.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFilesFieldFileMutation } from 'test/integration/graphql/utils/upload-files-field-file-mutation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

const deleteFileMutation = gql`
  mutation DeleteFile($fileId: UUID!) {
    deleteFile(fileId: $fileId) {
      id
    }
  }
`;

const createRecordsQuery = gql`
  mutation CreateRecords(
    $data: [FileSyncTestObjectCreateInput!]!
    $upsert: Boolean
  ) {
    createFileSyncTestObjects(data: $data, upsert: $upsert) {
      id
      name
      filesField {
        fileId
        label
        extension
        url
      }
    }
  }
`;

const updateRecordQuery = gql`
  mutation UpdateFileSyncTestObject(
    $fileSyncTestObjectId: UUID!
    $data: FileSyncTestObjectUpdateInput!
  ) {
    updateFileSyncTestObject(id: $fileSyncTestObjectId, data: $data) {
      id
      name
      filesField {
        fileId
        label
        extension
        url
      }
    }
  }
`;

const deleteRecordsQuery = gql`
  mutation DeleteRecords($filter: FileSyncTestObjectFilterInput!) {
    deleteFileSyncTestObjects(filter: $filter) {
      id
    }
  }
`;

type UploadedFile = {
  id: string;
  contentType: string;
};

const deleteFile = async (fileId: string): Promise<void> => {
  await makeGraphqlAPIRequest({
    query: deleteFileMutation,
    variables: { fileId },
  });
};

describe('fileFieldSync - FILES field <> files sync', () => {
  let createdObjectMetadataId = '';
  let createdFieldMetadataId = '';
  let uploadedFiles: UploadedFile[] = [];

  const uploadFile = async (
    filename: string,
    content: string,
    contentType: string,
  ): Promise<UploadedFile> => {
    const response = await makeGraphqlAPIRequestWithFileUpload(
      {
        query: uploadFilesFieldFileMutation,
        variables: { file: null, fieldMetadataId: createdFieldMetadataId },
      },
      {
        field: 'file',
        buffer: Buffer.from(content),
        filename,
        contentType,
      },
    );

    expect(response.body.errors).toBeUndefined();

    return {
      id: response.body.data.uploadFilesFieldFile.id,
      contentType,
    };
  };

  const checkFileExistsInDB = async (fileId: string): Promise<boolean> => {
    const result = await global.testDataSource.query(
      'SELECT id FROM core."file" WHERE id = $1 AND "deletedAt" IS NULL',
      [fileId],
    );

    return result.length > 0;
  };

  const checkFileIsInPermanentStorage = async (
    fileId: string,
  ): Promise<boolean> => {
    const result = await global.testDataSource.query(
      'SELECT settings FROM core."file" WHERE id = $1',
      [fileId],
    );

    if (result.length === 0) {
      return false;
    }

    return result[0].settings.isTemporaryFile === false;
  };

  const checkFileIsTemporary = async (fileId: string): Promise<boolean> => {
    const result = await global.testDataSource.query(
      'SELECT settings FROM core."file" WHERE id = $1',
      [fileId],
    );

    if (result.length === 0) {
      return false;
    }

    return result[0].settings.isTemporaryFile === true;
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'fileSyncTestObject',
        namePlural: 'fileSyncTestObjects',
        labelSingular: 'File Sync Test Object',
        labelPlural: 'File Sync Test Objects',
        icon: 'IconFile',
      },
    });

    createdObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      input: {
        name: 'filesField',
        label: 'Files Field',
        type: FieldMetadataType.FILES,
        objectMetadataId: createdObjectMetadataId,
        settings: { maxNumberOfValues: 5 },
      },
      gqlFields: `
        id
        name
        label
        type
      `,
    });

    createdFieldMetadataId = fieldMetadataId;
  });

  afterEach(async () => {
    for (const file of uploadedFiles) {
      await deleteFile(file.id);
    }
    uploadedFiles = [];
  });

  afterAll(async () => {
    jest.useFakeTimers();

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

  it('createMany without upsert - files sync successfully', async () => {
    const imageFile = await uploadFile(
      'test-image.png',
      'fake image content',
      'image/png',
    );
    const textFile = await uploadFile(
      'test-text.txt',
      'fake text content',
      'text/plain',
    );

    uploadedFiles.push(imageFile, textFile);

    expect(await checkFileExistsInDB(imageFile.id)).toBe(true);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileIsTemporary(imageFile.id)).toBe(true);
    expect(await checkFileIsTemporary(textFile.id)).toBe(true);

    const response = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record with image',
            filesField: [
              {
                fileId: imageFile.id,
                label: 'test-image.png',
              },
              {
                fileId: textFile.id,
                label: 'test-text.txt',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const createdRecord = response.body.data.createFileSyncTestObjects[0];

    expect(createdRecord.filesField).toHaveLength(2);
    expect(createdRecord.filesField[0].fileId).toBe(imageFile.id);
    expect(createdRecord.filesField[0].extension).toBe('.png');
    expect(createdRecord.filesField[1].fileId).toBe(textFile.id);
    expect(createdRecord.filesField[1].extension).toBe('.txt');
    expect(createdRecord.filesField[0].url).toBeDefined();
    expect(createdRecord.filesField[1].url).toBeDefined();

    expect(await checkFileExistsInDB(imageFile.id)).toBe(true);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(imageFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(textFile.id)).toBe(true);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: createdRecord.id } },
      },
    });
  });

  it('createMany with upsert - files sync successfully', async () => {
    const imageFile = await uploadFile(
      'test-image.png',
      'fake image content',
      'image/png',
    );
    const textFile = await uploadFile(
      'test-text.txt',
      'fake text content',
      'text/plain',
    );
    const anotherImageFile = await uploadFile(
      'test-another-image.png',
      'fake another image content',
      'image/png',
    );

    uploadedFiles.push(imageFile, textFile, anotherImageFile);

    expect(await checkFileExistsInDB(imageFile.id)).toBe(true);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileExistsInDB(anotherImageFile.id)).toBe(true);
    expect(await checkFileIsTemporary(imageFile.id)).toBe(true);
    expect(await checkFileIsTemporary(textFile.id)).toBe(true);
    expect(await checkFileIsTemporary(anotherImageFile.id)).toBe(true);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record to upsert',
            filesField: [
              {
                fileId: imageFile.id,
                label: 'imageFile-label.png',
              },
              {
                fileId: anotherImageFile.id,
                label: 'anotherImageFile-label.png',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    const createdRecord = createResponse.body.data.createFileSyncTestObjects[0];
    const recordId = createdRecord.id;

    expect(createdRecord.filesField[0].extension).toBe('.png');

    const upsertResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            id: recordId,
            name: 'Record updated via upsert',
            filesField: [
              {
                fileId: textFile.id,
                label: 'new-added-text-file.txt',
              },
              {
                fileId: imageFile.id,
                label: 'imageFile-label.png',
              },
              {
                fileId: anotherImageFile.id,
                label: 'updated-anotherImageFile-label.png',
              },
            ],
          },
        ],
        upsert: true,
      },
    });

    expect(upsertResponse.body.errors).toBeUndefined();

    const updatedRecord = upsertResponse.body.data.createFileSyncTestObjects[0];

    expect(updatedRecord.id).toBe(recordId);
    expect(updatedRecord.name).toBe('Record updated via upsert');
    expect(updatedRecord.filesField).toHaveLength(3);
    expect(updatedRecord.filesField[1].fileId).toBe(imageFile.id);
    expect(updatedRecord.filesField[1].label).toBe('imageFile-label.png');
    expect(updatedRecord.filesField[1].extension).toBe('.png');
    expect(updatedRecord.filesField[1].url).toBeDefined();
    expect(updatedRecord.filesField[2].fileId).toBe(anotherImageFile.id);
    expect(updatedRecord.filesField[2].label).toBe(
      'updated-anotherImageFile-label.png',
    );
    expect(updatedRecord.filesField[2].extension).toBe('.png');
    expect(updatedRecord.filesField[2].url).toBeDefined();
    expect(updatedRecord.filesField[0].fileId).toBe(textFile.id);
    expect(updatedRecord.filesField[0].label).toBe('new-added-text-file.txt');
    expect(updatedRecord.filesField[0].extension).toBe('.txt');
    expect(updatedRecord.filesField[0].url).toBeDefined();

    expect(await checkFileIsInPermanentStorage(imageFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(anotherImageFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(textFile.id)).toBe(true);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: recordId } },
      },
    });
  });

  it('updateOne - files sync successfully', async () => {
    const imageFile = await uploadFile(
      'test-image.png',
      'fake image content',
      'image/png',
    );
    const textFile = await uploadFile(
      'test-text.txt',
      'fake text content',
      'text/plain',
    );

    uploadedFiles.push(imageFile, textFile);

    expect(await checkFileExistsInDB(imageFile.id)).toBe(true);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileIsTemporary(imageFile.id)).toBe(true);
    expect(await checkFileIsTemporary(textFile.id)).toBe(true);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record for updateOne test',
            filesField: [
              {
                fileId: imageFile.id,
                label: 'original-image.png',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    expect(await checkFileIsInPermanentStorage(imageFile.id)).toBe(true);

    const createdRecord = createResponse.body.data.createFileSyncTestObjects[0];
    const recordId = createdRecord.id;

    expect(createdRecord.filesField[0].extension).toBe('.png');

    const updateResponse = await makeGraphqlAPIRequest({
      query: updateRecordQuery,
      variables: {
        fileSyncTestObjectId: recordId,
        data: {
          name: 'Record updated via updateOne',
          filesField: [
            {
              fileId: textFile.id,
              label: 'added-text.txt',
            },
            {
              fileId: imageFile.id,
              label: 'original-image.png',
            },
          ],
        },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();

    const updatedRecord = updateResponse.body.data.updateFileSyncTestObject;

    expect(updatedRecord.id).toBe(recordId);
    expect(updatedRecord.name).toBe('Record updated via updateOne');
    expect(updatedRecord.filesField).toHaveLength(2);
    expect(updatedRecord.filesField[1].fileId).toBe(imageFile.id);
    expect(updatedRecord.filesField[1].label).toBe('original-image.png');
    expect(updatedRecord.filesField[1].url).toBeDefined();
    expect(updatedRecord.filesField[0].fileId).toBe(textFile.id);
    expect(updatedRecord.filesField[0].label).toBe('added-text.txt');
    expect(updatedRecord.filesField[0].url).toBeDefined();
    expect(await checkFileExistsInDB(imageFile.id)).toBe(true);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(imageFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(textFile.id)).toBe(true);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: recordId } },
      },
    });
  });

  it('updateOne with removeFiles - verifies files can be removed', async () => {
    const imageFile = await uploadFile(
      'test-image-to-delete.png',
      'fake image content',
      'image/png',
    );
    const textFile = await uploadFile(
      'test-text-to-keep.txt',
      'fake text content',
      'text/plain',
    );

    uploadedFiles.push(imageFile, textFile);

    expect(await checkFileExistsInDB(imageFile.id)).toBe(true);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileIsTemporary(imageFile.id)).toBe(true);
    expect(await checkFileIsTemporary(textFile.id)).toBe(true);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record for file deletion test',
            filesField: [
              {
                fileId: imageFile.id,
                label: 'image-to-delete.png',
              },
              {
                fileId: textFile.id,
                label: 'text-to-keep.txt',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    expect(await checkFileIsInPermanentStorage(imageFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(textFile.id)).toBe(true);

    const createdRecord = createResponse.body.data.createFileSyncTestObjects[0];
    const recordId = createdRecord.id;

    const updateResponse = await makeGraphqlAPIRequest({
      query: updateRecordQuery,
      variables: {
        fileSyncTestObjectId: recordId,
        data: {
          filesField: [
            {
              fileId: textFile.id,
              label: 'text-to-keep.txt',
            },
          ],
        },
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();

    const updatedRecord = updateResponse.body.data.updateFileSyncTestObject;

    expect(updatedRecord.filesField).toHaveLength(1);
    expect(updatedRecord.filesField[0].fileId).toBe(textFile.id);

    expect(await checkFileExistsInDB(imageFile.id)).toBe(false);
    expect(await checkFileExistsInDB(textFile.id)).toBe(true);
    expect(await checkFileIsInPermanentStorage(textFile.id)).toBe(true);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: recordId } },
      },
    });
  });
});
