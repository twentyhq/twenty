import gql from 'graphql-tag';

export const exportApplicationQueryFactory = ({
  universalIdentifier,
  shouldIncludeDependencies,
}: {
  universalIdentifier: string;
  shouldIncludeDependencies?: boolean;
}) => ({
  query: gql`
    query ExportApplication(
      $universalIdentifier: UUID!
      $shouldIncludeDependencies: Boolean
    ) {
      exportApplication(
        universalIdentifier: $universalIdentifier
        shouldIncludeDependencies: $shouldIncludeDependencies
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
    shouldIncludeDependencies,
  },
});
