import gql from 'graphql-tag';

export const uploadWorkspaceLogoMutation = gql`
  mutation UploadWorkspaceLogo($file: Upload!) {
    uploadWorkspaceLogo(file: $file) {
      id
      url
    }
  }
`;
