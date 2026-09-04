import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type FileFolder } from 'twenty-shared/types';

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

type UploadFileWithDirectUploadArgs = {
  filename: string;
  content: Buffer;
  fileFolder: keyof typeof FileFolder;
  fieldMetadataId?: string;
};

type DirectUploadedFile = {
  id: string;
  path: string;
  size: number;
  createdAt: string;
  url: string;
};

export const uploadFileWithDirectUpload = async ({
  filename,
  content,
  fileFolder,
  fieldMetadataId,
}: UploadFileWithDirectUploadArgs): Promise<DirectUploadedFile> => {
  const createResponse = await makeMetadataAPIRequest({
    query: createFileUploadMutation,
    variables: {
      filename,
      size: content.length,
      fileFolder,
      fieldMetadataId,
    },
  });

  expect(createResponse.body.errors).toBeUndefined();

  const { fileId, uploadUrl, contentType } =
    createResponse.body.data.createFileUpload;

  // Integration tests run on the local storage driver, so the upload url
  // targets the server's streaming endpoint: replay it against the test app.
  const { pathname, search } = new URL(uploadUrl);

  const putResponse = await request(global.app.getHttpServer())
    .put(`${pathname}${search}`)
    .set('Content-Type', contentType)
    .send(content);

  expect(putResponse.status).toBe(204);

  const completeResponse = await makeMetadataAPIRequest({
    query: completeFileUploadMutation,
    variables: { fileId },
  });

  expect(completeResponse.body.errors).toBeUndefined();

  return completeResponse.body.data.completeFileUpload;
};
