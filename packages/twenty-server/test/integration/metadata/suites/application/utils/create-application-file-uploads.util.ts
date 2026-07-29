import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export type ApplicationFileUploadTarget = {
  fileId: string;
  fileFolder: string;
  filePath: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

export const createApplicationFileUploads = async ({
  applicationUniversalIdentifier,
  files,
}: {
  applicationUniversalIdentifier: string;
  files: { fileFolder: string; filePath: string; size: number }[];
}) => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation CreateApplicationFileUploads(
        $applicationUniversalIdentifier: String!
        $files: [ApplicationFileUploadRequestInput!]!
      ) {
        createApplicationFileUploads(
          applicationUniversalIdentifier: $applicationUniversalIdentifier
          files: $files
        ) {
          fileId
          fileFolder
          filePath
          uploadUrl
          contentType
          expiresAt
        }
      }
    `,
    variables: { applicationUniversalIdentifier, files },
  });

  return {
    data: response.body.data as {
      createApplicationFileUploads: ApplicationFileUploadTarget[];
    } | null,
    errors: response.body.errors as { message: string }[] | undefined,
  };
};

export const completeApplicationFileUploads = async ({
  applicationUniversalIdentifier,
  fileIds,
}: {
  applicationUniversalIdentifier: string;
  fileIds: string[];
}) => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation CompleteApplicationFileUploads(
        $applicationUniversalIdentifier: String!
        $fileIds: [UUID!]!
      ) {
        completeApplicationFileUploads(
          applicationUniversalIdentifier: $applicationUniversalIdentifier
          fileIds: $fileIds
        ) {
          id
          path
          size
        }
      }
    `,
    variables: { applicationUniversalIdentifier, fileIds },
  });

  return {
    data: response.body.data as {
      completeApplicationFileUploads: {
        id: string;
        path: string;
        size: number;
      }[];
    } | null,
    errors: response.body.errors as { message: string }[] | undefined,
  };
};
