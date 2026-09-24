import gql from 'graphql-tag';

export const createAppTarballUploadQueryFactory = ({
  filename,
  size,
}: {
  filename: string;
  size: number;
}) => ({
  query: gql`
    mutation CreateAppTarballUpload($filename: String!, $size: Float!) {
      createFileUpload(
        filename: $filename
        size: $size
        fileFolder: AppTarball
      ) {
        fileId
        uploadUrl
        contentType
        expiresAt
      }
    }
  `,
  variables: { filename, size },
});
