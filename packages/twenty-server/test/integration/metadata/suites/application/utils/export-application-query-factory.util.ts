import gql from 'graphql-tag';

export const exportApplicationQueryFactory = ({
  universalIdentifier,
  includeDependencies,
}: {
  universalIdentifier: string;
  includeDependencies?: boolean;
}) => ({
  query: gql`
    query ExportApplication(
      $universalIdentifier: UUID!
      $includeDependencies: Boolean
    ) {
      exportApplication(
        universalIdentifier: $universalIdentifier
        includeDependencies: $includeDependencies
      ) {
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
    includeDependencies,
  },
});
