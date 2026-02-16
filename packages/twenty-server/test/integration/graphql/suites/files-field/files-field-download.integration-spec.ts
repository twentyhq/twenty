import gql from 'graphql-tag';
import request from 'supertest';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFilesFieldFileMutation } from 'test/integration/graphql/utils/upload-files-field-file-mutation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
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
    $data: [FileDownloadTestObjectCreateInput!]!
    $upsert: Boolean
  ) {
    createFileDownloadTestObjects(data: $data, upsert: $upsert) {
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
  mutation DeleteRecords($filter: FileDownloadTestObjectFilterInput!) {
    deleteFileDownloadTestObjects(filter: $filter) {
      id
    }
  }
`;

type UploadedFile = {
  id: string;
  contentType: string;
  content: string;
};

const deleteFile = async (fileId: string): Promise<void> => {
  await makeMetadataAPIRequest({
    query: deleteFileMutation,
    variables: { fileId },
  });
};

describe('file-by-id.controller - GET /file/:fileFolder/:id', () => {
  let createdObjectMetadataId = '';
  let createdFieldMetadataId = '';
  let uploadedFiles: UploadedFile[] = [];

  const uploadFile = async (
    filename: string,
    content: string,
    contentType: string,
  ): Promise<UploadedFile> => {
    const response = await makeMetadataAPIRequestWithFileUpload(
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
      content,
    };
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'fileDownloadTestObject',
        namePlural: 'fileDownloadTestObjects',
        labelSingular: 'File Download Test Object',
        labelPlural: 'File Download Test Objects',
        icon: 'IconFile',
      },
    });

    createdObjectMetadataId = objectMetadataId;

    const {
      data: { createOneField: createdFieldMetadata },
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

    createdFieldMetadataId = createdFieldMetadata.id;
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

  it('should download file successfully with valid url', async () => {
    const testFileContent = 'This is test file content for download';
    const textFile = await uploadFile(
      'download-test.txt',
      testFileContent,
      'text/plain',
    );

    uploadedFiles.push(textFile);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record for download test',
            filesField: [
              {
                fileId: textFile.id,
                label: 'download-test.txt',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    expect(createResponse.body.errors).toBeUndefined();

    const createdRecord =
      createResponse.body.data.createFileDownloadTestObjects[0];
    const fileUrl = createdRecord.filesField[0].url;
    const fileId = createdRecord.filesField[0].fileId;

    expect(fileUrl).toBeDefined();
    expect(fileId).toBe(textFile.id);

    // Extract path from full URL (remove domain)
    const urlPath = new URL(fileUrl).pathname + new URL(fileUrl).search;

    const downloadResponse = await request(global.app.getHttpServer()).get(
      urlPath,
    );

    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.text).toBe(testFileContent);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: createdRecord.id } },
      },
    });
  });

  it('should download image file successfully with valid url', async () => {
    const testFileContent = 'This is test file content for download';
    const textFile = await uploadFile(
      'test-file.txt',
      testFileContent,
      'text/plain',
    );

    uploadedFiles.push(textFile);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record with image',
            filesField: [
              {
                fileId: textFile.id,
                label: 'test-file.txt',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    expect(createResponse.body.errors).toBeUndefined();

    const createdRecord =
      createResponse.body.data.createFileDownloadTestObjects[0];
    const fileUrl = createdRecord.filesField[0].url;

    expect(fileUrl).toBeDefined();
    expect(createdRecord.filesField[0].extension).toBe('.txt');

    // Extract path from full URL (remove domain)
    const urlPath = new URL(fileUrl).pathname + new URL(fileUrl).search;

    const downloadResponse = await request(global.app.getHttpServer()).get(
      urlPath,
    );

    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.text).toBe(testFileContent);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: createdRecord.id } },
      },
    });
  });

  it('should return 403 when token is missing', async () => {
    const textFile = await uploadFile(
      'unauthorized-test.txt',
      'content',
      'text/plain',
    );

    uploadedFiles.push(textFile);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record for unauthorized test',
            filesField: [
              {
                fileId: textFile.id,
                label: 'unauthorized-test.txt',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    const createdRecord =
      createResponse.body.data.createFileDownloadTestObjects[0];
    const fileId = createdRecord.filesField[0].fileId;

    const downloadResponse = await request(global.app.getHttpServer()).get(
      `/file/files-field/${fileId}`,
    );

    expect(downloadResponse.status).toBe(403);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: createdRecord.id } },
      },
    });
  });

  it('should return 403 when url is invalid', async () => {
    const textFile = await uploadFile(
      'invalid-token-test.txt',
      'content',
      'text/plain',
    );

    uploadedFiles.push(textFile);

    const createResponse = await makeGraphqlAPIRequest({
      query: createRecordsQuery,
      variables: {
        data: [
          {
            name: 'Record for invalid token test',
            filesField: [
              {
                fileId: textFile.id,
                label: 'invalid-token-test.txt',
              },
            ],
          },
        ],
        upsert: false,
      },
    });

    const createdRecord =
      createResponse.body.data.createFileDownloadTestObjects[0];
    const fileId = createdRecord.filesField[0].fileId;

    const downloadResponse = await request(global.app.getHttpServer())
      .get(`/file/files-field/${fileId}`)
      .query({ token: 'invalid-token-12345' });

    expect(downloadResponse.status).toBe(403);

    await makeGraphqlAPIRequest({
      query: deleteRecordsQuery,
      variables: {
        filter: { id: { eq: createdRecord.id } },
      },
    });
  });
});
