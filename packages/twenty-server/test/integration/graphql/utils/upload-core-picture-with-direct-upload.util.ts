import { type DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const createWorkspaceLogoUploadMutation = gql`
  mutation CreateWorkspaceLogoUpload($filename: String!, $size: Float!) {
    createWorkspaceLogoUpload(filename: $filename, size: $size) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;

export const completeWorkspaceLogoUploadMutation = gql`
  mutation CompleteWorkspaceLogoUpload($fileId: String!) {
    completeWorkspaceLogoUpload(fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;

export const createWorkspaceMemberProfilePictureUploadMutation = gql`
  mutation CreateWorkspaceMemberProfilePictureUpload(
    $filename: String!
    $size: Float!
  ) {
    createWorkspaceMemberProfilePictureUpload(
      filename: $filename
      size: $size
    ) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;

export const completeWorkspaceMemberProfilePictureUploadMutation = gql`
  mutation CompleteWorkspaceMemberProfilePictureUpload($fileId: String!) {
    completeWorkspaceMemberProfilePictureUpload(fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;

export type CorePictureUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

export type UploadedCorePicture = {
  id: string;
  path: string;
  size: number;
  createdAt: string;
  url: string;
};

export const putCorePictureToUploadTarget = async ({
  uploadTarget,
  content,
}: {
  uploadTarget: CorePictureUploadTarget;
  content: Buffer;
}) => {
  // Integration tests run on the local storage driver, so the upload url
  // targets the server's streaming endpoint: replay it against the test app.
  const { pathname, search } = new URL(uploadTarget.uploadUrl);

  return request(global.app.getHttpServer())
    .put(`${pathname}${search}`)
    .set('Content-Type', uploadTarget.contentType)
    .send(content);
};

type UploadCorePictureWithDirectUploadArgs = {
  filename: string;
  content: Buffer;
  token?: string;
};

const uploadCorePictureWithDirectUpload = async ({
  createMutation,
  createMutationName,
  completeMutation,
  completeMutationName,
  filename,
  content,
  token,
}: UploadCorePictureWithDirectUploadArgs & {
  createMutation: DocumentNode;
  createMutationName: string;
  completeMutation: DocumentNode;
  completeMutationName: string;
}): Promise<UploadedCorePicture> => {
  const createResponse = await makeMetadataAPIRequest(
    {
      query: createMutation,
      variables: { filename, size: content.length },
    },
    token,
  );

  expect(createResponse.body.errors).toBeUndefined();

  const uploadTarget: CorePictureUploadTarget =
    createResponse.body.data[createMutationName];

  const putResponse = await putCorePictureToUploadTarget({
    uploadTarget,
    content,
  });

  expect(putResponse.status).toBe(204);

  const completeResponse = await makeMetadataAPIRequest(
    {
      query: completeMutation,
      variables: { fileId: uploadTarget.fileId },
    },
    token,
  );

  expect(completeResponse.body.errors).toBeUndefined();

  return completeResponse.body.data[completeMutationName];
};

export const uploadWorkspaceLogoWithDirectUpload = (
  args: UploadCorePictureWithDirectUploadArgs,
): Promise<UploadedCorePicture> =>
  uploadCorePictureWithDirectUpload({
    ...args,
    createMutation: createWorkspaceLogoUploadMutation,
    createMutationName: 'createWorkspaceLogoUpload',
    completeMutation: completeWorkspaceLogoUploadMutation,
    completeMutationName: 'completeWorkspaceLogoUpload',
  });

export const uploadWorkspaceMemberProfilePictureWithDirectUpload = (
  args: UploadCorePictureWithDirectUploadArgs,
): Promise<UploadedCorePicture> =>
  uploadCorePictureWithDirectUpload({
    ...args,
    createMutation: createWorkspaceMemberProfilePictureUploadMutation,
    createMutationName: 'createWorkspaceMemberProfilePictureUpload',
    completeMutation: completeWorkspaceMemberProfilePictureUploadMutation,
    completeMutationName: 'completeWorkspaceMemberProfilePictureUpload',
  });
