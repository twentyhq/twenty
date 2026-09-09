import gql from 'graphql-tag';
import request from 'supertest';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';

const createFileUploadMutation = gql`
  mutation CreateFileUpload(
    $filename: String!
    $size: Float!
    $fileFolder: FileFolder!
    $fieldMetadataId: String
  ) {
    createFileUpload(
      filename: $filename
      size: $size
      fileFolder: $fileFolder
      fieldMetadataId: $fieldMetadataId
    ) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;

const completeFileUploadMutation = gql`
  mutation CompleteFileUpload($fileId: String!) {
    completeFileUpload(fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;

const deleteFileMutation = gql`
  mutation DeleteFile($fileId: UUID!) {
    deleteFile(fileId: $fileId) {
      id
    }
  }
`;

describe('direct file upload (createFileUpload / completeFileUpload)', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;
  const uploadedFileIds: string[] = [];

  const createFileUpload = async (variables: Record<string, unknown>) => {
    return makeMetadataAPIRequest({
      query: createFileUploadMutation,
      variables,
    });
  };

  const completeFileUpload = async (fileId: string) => {
    return makeMetadataAPIRequest({
      query: completeFileUploadMutation,
      variables: { fileId },
    });
  };

  const putFileToUploadUrl = async (
    uploadUrl: string,
    contentType: string,
    content: Buffer,
  ) => {
    // Integration tests run on the local storage driver, so the upload url
    // targets the server's streaming endpoint: replay it against the test app.
    const { pathname, search } = new URL(uploadUrl);

    return request(global.app.getHttpServer())
      .put(`${pathname}${search}`)
      .set('Content-Type', contentType)
      .send(content);
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'directUploadTestObject',
        namePlural: 'directUploadTestObjects',
        labelSingular: 'Direct Upload Test Object',
        labelPlural: 'Direct Upload Test Objects',
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
      `,
    });

    createdFieldMetadataId = fieldMetadataId;
  });

  afterAll(async () => {
    for (const fileId of uploadedFileIds) {
      try {
        await makeMetadataAPIRequest({
          query: deleteFileMutation,
          variables: { fileId },
        });
      } catch {
        // Cleanup is best-effort: a failed deletion must not prevent the
        // object metadata teardown below.
      }
    }

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

    jest.useFakeTimers();
  });

  it('should upload a file end to end: initiate, PUT bytes, complete', async () => {
    const testFileContent = Buffer.from('direct upload test content');

    const createResponse = await createFileUpload({
      filename: 'direct-upload.txt',
      size: testFileContent.length,
      fileFolder: 'FilesField',
      fieldMetadataId: createdFieldMetadataId,
    });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.errors).toBeUndefined();

    const uploadTarget = createResponse.body.data.createFileUpload;

    expect(uploadTarget.fileId).toBeDefined();
    expect(uploadTarget.uploadUrl).toContain(
      `/file-upload/${uploadTarget.fileId}?token=`,
    );
    expect(uploadTarget.contentType).toBe('application/octet-stream');
    expect(new Date(uploadTarget.expiresAt).getTime()).toBeGreaterThan(
      Date.now(),
    );

    uploadedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadUrl(
      uploadTarget.uploadUrl,
      uploadTarget.contentType,
      testFileContent,
    );

    expect(putResponse.status).toBe(204);

    const completeResponse = await completeFileUpload(uploadTarget.fileId);

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.errors).toBeUndefined();

    const completedFile = completeResponse.body.data.completeFileUpload;

    expect(completedFile.id).toBe(uploadTarget.fileId);
    expect(completedFile.path).toContain(FileFolder.FilesField);
    expect(completedFile.size).toBe(testFileContent.length);
    expect(completedFile.url).toContain(
      `/file/${FileFolder.FilesField}/${uploadTarget.fileId}?token=`,
    );

    // The confirmed file is downloadable through the regular file endpoint
    const { pathname, search } = new URL(completedFile.url);
    const downloadResponse = await request(global.app.getHttpServer()).get(
      `${pathname}${search}`,
    );

    expect(downloadResponse.status).toBe(200);
    expect(downloadResponse.text).toBe(testFileContent.toString());
  });

  it('should refuse to complete an upload whose bytes never reached storage', async () => {
    const createResponse = await createFileUpload({
      filename: 'never-uploaded.txt',
      size: 100,
      fileFolder: 'FilesField',
      fieldMetadataId: createdFieldMetadataId,
    });

    const uploadTarget = createResponse.body.data.createFileUpload;

    uploadedFileIds.push(uploadTarget.fileId);

    const completeResponse = await completeFileUpload(uploadTarget.fileId);

    expect(completeResponse.body.errors).toBeDefined();
    expect(completeResponse.body.errors[0].message).toContain(
      'has not been uploaded',
    );
  });

  it('should reject completing an upload whose content contradicts its extension', async () => {
    const spoofedContent = Buffer.from('this is not really a png image');

    const createResponse = await createFileUpload({
      filename: 'actually-text.png',
      size: spoofedContent.length,
      fileFolder: 'FilesField',
      fieldMetadataId: createdFieldMetadataId,
    });

    const uploadTarget = createResponse.body.data.createFileUpload;

    uploadedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadUrl(
      uploadTarget.uploadUrl,
      uploadTarget.contentType,
      spoofedContent,
    );

    expect(putResponse.status).toBe(204);

    const completeResponse = await completeFileUpload(uploadTarget.fileId);

    expect(completeResponse.body.errors).toBeDefined();
    expect(completeResponse.body.errors[0].message).toContain(
      'does not match its extension',
    );

    const retryResponse = await completeFileUpload(uploadTarget.fileId);

    expect(retryResponse.body.errors).toBeDefined();
    expect(retryResponse.body.data?.completeFileUpload ?? null).toBeNull();
  });

  it('should refuse a PUT larger than the declared size', async () => {
    const declaredSize = 10;
    const oversizedContent = Buffer.from(
      'this content is longer than ten bytes',
    );

    const createResponse = await createFileUpload({
      filename: 'oversized.txt',
      size: declaredSize,
      fileFolder: 'FilesField',
      fieldMetadataId: createdFieldMetadataId,
    });

    const uploadTarget = createResponse.body.data.createFileUpload;

    uploadedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadUrl(
      uploadTarget.uploadUrl,
      uploadTarget.contentType,
      oversizedContent,
    );

    expect(putResponse.status).toBe(413);
  });

  it('should refuse a PUT without a valid upload token', async () => {
    const createResponse = await createFileUpload({
      filename: 'bad-token.txt',
      size: 10,
      fileFolder: 'FilesField',
      fieldMetadataId: createdFieldMetadataId,
    });

    const uploadTarget = createResponse.body.data.createFileUpload;

    uploadedFileIds.push(uploadTarget.fileId);

    const putResponse = await request(global.app.getHttpServer())
      .put(`/file-upload/${uploadTarget.fileId}?token=not-a-valid-token`)
      .set('Content-Type', 'application/octet-stream')
      .send(Buffer.from('0123456789'));

    expect(putResponse.status).toBe(403);
  });

  it('should reject file folders without direct upload support', async () => {
    const createResponse = await createFileUpload({
      filename: 'picture.png',
      size: 10,
      fileFolder: 'CorePicture',
    });

    expect(createResponse.body.errors).toBeDefined();
  });

  it('should reject a size above the direct upload maximum', async () => {
    const createResponse = await createFileUpload({
      filename: 'huge.bin',
      size: 5 * 1024 * 1024 * 1024,
      fileFolder: 'FilesField',
      fieldMetadataId: createdFieldMetadataId,
    });

    expect(createResponse.body.errors).toBeDefined();
  });
});
