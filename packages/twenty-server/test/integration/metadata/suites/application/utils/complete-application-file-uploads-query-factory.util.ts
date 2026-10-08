import gql from 'graphql-tag';

export const completeApplicationFileUploadsQueryFactory = ({
  applicationUniversalIdentifier,
  fileIds,
}: {
  applicationUniversalIdentifier: string;
  fileIds: string[];
}) => ({
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
