import gql from 'graphql-tag';

export const createApplicationFileUploadsQueryFactory = ({
  applicationUniversalIdentifier,
  files,
}: {
  applicationUniversalIdentifier: string;
  files: { fileFolder: string; filePath: string; size: number }[];
}) => ({
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
