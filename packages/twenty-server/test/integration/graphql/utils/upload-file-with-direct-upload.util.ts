import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FileFolder } from 'twenty-shared/types';

export const createFileUploadMutation = gql`
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

export const completeFileUploadMutation = gql`
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

export type DirectUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
};

type UploadFileWithDirectUploadArgs = {
  filename: string;
  content: Buffer;
  fileFolder: keyof typeof FileFolder;
  fieldMetadataId?: string;
  token?: string;
};

type DirectUploadedFile = {
  id: string;
  path: string;
  size: number;
  createdAt: string;
  url: string;
};

export const putFileToUploadTarget = async ({
  uploadTarget,
  content,
}: {
  uploadTarget: DirectUploadTarget;
  content: Buffer;
}) => {
  const { pathname, search } = new URL(uploadTarget.uploadUrl);

  return request(global.app.getHttpServer())
    .put(`${pathname}${search}`)
    .set('Content-Type', uploadTarget.contentType)
    .send(content);
};

export const createFileUploadAndPutFile = async ({
  filename,
  content,
  fileFolder,
  fieldMetadataId,
  token,
}: UploadFileWithDirectUploadArgs): Promise<DirectUploadTarget> => {
  const createResponse = await makeMetadataApiRequest(
    {
      query: createFileUploadMutation,
      variables: {
        filename,
        size: content.length,
        fileFolder,
        fieldMetadataId,
      },
    },
    token,
  );

  expect(createResponse.body.errors).toBeUndefined();

  const uploadTarget: DirectUploadTarget =
    createResponse.body.data.createFileUpload;

  const putResponse = await putFileToUploadTarget({ uploadTarget, content });

  expect(putResponse.status).toBe(204);

  return uploadTarget;
};

export const uploadFileWithDirectUpload = async (
  args: UploadFileWithDirectUploadArgs,
): Promise<DirectUploadedFile> => {
  const { fileId } = await createFileUploadAndPutFile(args);

  const completeResponse = await makeMetadataApiRequest(
    {
      query: completeFileUploadMutation,
      variables: { fileId },
    },
    args.token,
  );

  expect(completeResponse.body.errors).toBeUndefined();

  return completeResponse.body.data.completeFileUpload;
};
