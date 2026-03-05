import gql from 'graphql-tag';

export const uploadAppTarballQueryFactory = ({
  universalIdentifier,
}: {
  universalIdentifier?: string;
}) => ({
  query: gql`
    mutation UploadAppTarball($file: Upload!, $universalIdentifier: String) {
      uploadAppTarball(file: $file, universalIdentifier: $universalIdentifier) {
        id
        universalIdentifier
        name
      }
    }
  `,
  variables: {
    file: null,
    universalIdentifier: universalIdentifier ?? null,
  },
});
