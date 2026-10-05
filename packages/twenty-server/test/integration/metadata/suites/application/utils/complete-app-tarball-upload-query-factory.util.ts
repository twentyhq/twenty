import gql from 'graphql-tag';

export const completeAppTarballUploadQueryFactory = ({
  fileId,
}: {
  fileId: string;
}) => ({
  query: gql`
    mutation CompleteAppTarballUpload($fileId: UUID!) {
      completeAppTarballUpload(fileId: $fileId) {
        id
        universalIdentifier
        name
      }
    }
  `,
  variables: { fileId },
});
