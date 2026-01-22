import gql from 'graphql-tag';
import { makeGraphqlAPIRequestWithFileUpload } from 'test/integration/graphql/utils/make-graphql-api-request-with-file-upload.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { FileFolder } from 'twenty-shared/types';

const uploadFilesFieldFileMutation = gql`
  mutation uploadFilesFieldFile($file: Upload!) {
    uploadFilesFieldFile(file: $file) {
      id
      path
      size
      createdAt
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

describe('uploadFilesFieldFile', () => {
  let uploadedFileId: string | null = null;

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    if (uploadedFileId) {
      await makeGraphqlAPIRequest({
        query: deleteFileMutation,
        variables: { fileId: uploadedFileId },
      });
    }
    jest.useFakeTimers();
  });

  it('should upload a file and return file metadata', async () => {
    const testFileContent = 'Hello, this is a test file content';
    const testFileName = 'test-file.txt';
    const testMimeType = 'text/plain';

    const response = await makeGraphqlAPIRequestWithFileUpload(
      {
        query: uploadFilesFieldFileMutation,
        variables: { file: null },
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
    expect(fileResult.size).toBe(testFileContent.length);
    expect(fileResult.createdAt).toBeDefined();

    uploadedFileId = fileResult.id;
  });
});
