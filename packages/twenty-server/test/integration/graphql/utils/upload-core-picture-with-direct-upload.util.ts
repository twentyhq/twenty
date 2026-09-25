import gql from 'graphql-tag';
import {
  createFileUploadAndPutFile,
  createFileUploadMutation,
  type DirectUploadTarget,
} from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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

export type UploadedCorePicture = {
  id: string;
  path: string;
  size: number;
  createdAt: string;
  url: string;
};

export const createCorePictureUpload = async ({
  filename,
  size,
  token,
}: {
  filename: string;
  size: number;
  token?: string;
}): Promise<DirectUploadTarget> => {
  const response = await makeMetadataApiRequest(
    {
      query: createFileUploadMutation,
      variables: { filename, size, fileFolder: 'CorePicture' },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createFileUpload;
};

export const uploadWorkspaceLogoWithDirectUpload = async ({
  filename,
  content,
  token,
}: {
  filename: string;
  content: Buffer;
  token?: string;
}): Promise<UploadedCorePicture> => {
  const { fileId } = await createFileUploadAndPutFile({
    filename,
    content,
    fileFolder: 'CorePicture',
    token,
  });

  const completeResponse = await makeMetadataApiRequest(
    {
      query: completeWorkspaceLogoUploadMutation,
      variables: { fileId },
    },
    token,
  );

  expect(completeResponse.body.errors).toBeUndefined();

  return completeResponse.body.data.completeWorkspaceLogoUpload;
};

export const uploadWorkspaceMemberProfilePictureWithDirectUpload = async ({
  filename,
  content,
  token,
}: {
  filename: string;
  content: Buffer;
  token?: string;
}): Promise<UploadedCorePicture> => {
  const { fileId } = await createFileUploadAndPutFile({
    filename,
    content,
    fileFolder: 'CorePicture',
    token,
  });

  const completeResponse = await makeMetadataApiRequest(
    {
      query: completeWorkspaceMemberProfilePictureUploadMutation,
      variables: { fileId },
    },
    token,
  );

  expect(completeResponse.body.errors).toBeUndefined();

  return completeResponse.body.data.completeWorkspaceMemberProfilePictureUpload;
};
