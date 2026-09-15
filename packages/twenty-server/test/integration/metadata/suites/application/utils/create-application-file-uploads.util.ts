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

export type ApplicationFileUploadError = {
  fileFolder: string;
  filePath: string;
  message: string;
};

export type CreateApplicationFileUploadsResult = {
  targets: ApplicationFileUploadTarget[];
  errors: ApplicationFileUploadError[];
};

export type CompleteApplicationFileUploadsResult = {
  files: { id: string; path: string; size: number }[];
  errors: { fileId: string; message: string }[];
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
          targets {
            fileId
            fileFolder
            filePath
            uploadUrl
            contentType
            expiresAt
          }
          errors {
            fileFolder
            filePath
            message
          }
        }
      }
    `,
    variables: { applicationUniversalIdentifier, files },
  });

  return {
    data: response.body.data as {
      createApplicationFileUploads: CreateApplicationFileUploadsResult;
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
          files {
            id
            path
            size
          }
          errors {
            fileId
            message
          }
        }
      }
    `,
    variables: { applicationUniversalIdentifier, fileIds },
  });

  return {
    data: response.body.data as {
      completeApplicationFileUploads: CompleteApplicationFileUploadsResult;
    } | null,
    errors: response.body.errors as { message: string }[] | undefined,
  };
};
