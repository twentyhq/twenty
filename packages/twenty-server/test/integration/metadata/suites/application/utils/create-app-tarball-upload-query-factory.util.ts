import gql from 'graphql-tag';

export const createAppTarballUploadQueryFactory = ({
  size,
}: {
  size: number;
}) => ({
  query: gql`
    mutation CreateAppTarballUpload($size: Float!) {
      createAppTarballUpload(size: $size) {
        fileId
        uploadUrl
        contentType
        expiresAt
      }
    }
  `,
  variables: { size },
});
