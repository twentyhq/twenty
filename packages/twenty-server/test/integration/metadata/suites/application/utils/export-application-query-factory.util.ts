import gql from 'graphql-tag';

export const exportApplicationQueryFactory = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}) => ({
  query: gql`
    query ExportApplication($universalIdentifier: UUID!) {
      exportApplication(universalIdentifier: $universalIdentifier) {
        application {
          universalIdentifier
          displayName
          sourceType
        }
        manifest
        coverage {
          metadataName
          universalIdentifier
          status
          reason
        }
        files {
          folder
          path
          content
        }
      }
    }
  `,
  variables: {
    universalIdentifier,
  },
});
