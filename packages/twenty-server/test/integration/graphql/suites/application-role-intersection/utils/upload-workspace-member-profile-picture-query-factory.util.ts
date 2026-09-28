import gql from 'graphql-tag';

export const uploadWorkspaceMemberProfilePictureQueryFactory = () => ({
  query: gql`
    mutation UploadWorkspaceMemberProfilePicture($file: Upload!) {
      uploadWorkspaceMemberProfilePicture(file: $file) {
        id
        url
      }
    }
  `,
  variables: { file: null },
});
