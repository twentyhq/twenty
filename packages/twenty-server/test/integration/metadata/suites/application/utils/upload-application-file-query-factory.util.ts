import gql from 'graphql-tag';

export const uploadApplicationFileQueryFactory = ({
  applicationUniversalIdentifier,
  fileFolder,
  filePath,
}: {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
}) => ({
  query: gql`
    mutation UploadApplicationFile(
      $file: Upload!
      $applicationUniversalIdentifier: String!
      $fileFolder: FileFolder!
      $filePath: String!
    ) {
      uploadApplicationFile(
        file: $file
        applicationUniversalIdentifier: $applicationUniversalIdentifier
        fileFolder: $fileFolder
        filePath: $filePath
      ) {
        id
        path
      }
    }
  `,
  variables: {
    file: null,
    applicationUniversalIdentifier,
    fileFolder,
    filePath,
  },
});
