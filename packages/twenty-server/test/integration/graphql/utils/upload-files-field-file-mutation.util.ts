import gql from 'graphql-tag';

export const uploadFilesFieldFileMutation = gql`
  mutation UploadFilesFieldFile($file: Upload!, $fieldMetadataId: String!) {
    uploadFilesFieldFile(file: $file, fieldMetadataId: $fieldMetadataId) {
      id
      path
      size
      createdAt
    }
  }
`;
