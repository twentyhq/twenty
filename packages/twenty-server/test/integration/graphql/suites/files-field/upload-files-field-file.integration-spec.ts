import gql from 'graphql-tag';
import { makeGraphqlAPIRequestWithFileUpload } from 'test/integration/graphql/utils/make-graphql-api-request-with-file-upload.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFilesFieldFileMutation } from 'test/integration/graphql/utils/upload-files-field-file-mutation.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';

const deleteFileMutation = gql`
  mutation DeleteFile($fileId: UUID!) {
    deleteFile(fileId: $fileId) {
      id
    }
  }
`;

describe('uploadFilesFieldFile', () => {
  let createdObjectMetadataId: string;
  let createdFieldMetadataId: string;
  let uploadedFileId: string | null = null;

  const getFieldMetadataUniversalIdentifier = async (
    fieldMetadataId: string,
  ): Promise<string> => {
    const result = await global.testDataSource.query(
      'SELECT "universalIdentifier" FROM core."fieldMetadata" WHERE id = $1',
      [fieldMetadataId],
    );

    return result[0].universalIdentifier;
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'uploadTestObject',
        namePlural: 'uploadTestObjects',
        labelSingular: 'Upload Test Object',
        labelPlural: 'Upload Test Objects',
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

  afterAll(async () => {
    if (uploadedFileId) {
      await makeGraphqlAPIRequest({
        query: deleteFileMutation,
        variables: { fileId: uploadedFileId },
      });
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

  it('should upload a file and return file metadata', async () => {
    const testFileContent = 'Hello, this is a test file content';
    const testFileName = 'test-file.txt';
    const testMimeType = 'text/plain';

    const response = await makeGraphqlAPIRequestWithFileUpload(
      {
        query: uploadFilesFieldFileMutation,
        variables: {
          file: null,
          fieldMetadataId: createdFieldMetadataId,
        },
      },
      {
        field: 'file',
        buffer: Buffer.from(testFileContent),
        filename: testFileName,
        contentType: testMimeType,
      },
    );

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();

    const fileResult = response.body.data.uploadFilesFieldFile;

    expect(fileResult).toBeDefined();
    expect(fileResult.id).toBeDefined();
    expect(typeof fileResult.id).toBe('string');
    expect(fileResult.path).toBeDefined();
    expect(typeof fileResult.path).toBe('string');
    expect(fileResult.path).toContain(FileFolder.FilesField);

    const fieldUniversalIdentifier = await getFieldMetadataUniversalIdentifier(
      createdFieldMetadataId,
    );

    expect(fileResult.path).toContain(fieldUniversalIdentifier);
    expect(fileResult.size).toBe(testFileContent.length);
    expect(fileResult.createdAt).toBeDefined();

    uploadedFileId = fileResult.id;
  });
});
