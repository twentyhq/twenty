import gql from 'graphql-tag';

export const exportApplicationQueryFactory = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}) => ({
  query: gql`
    query ExportApplication($universalIdentifier: String!) {
      exportApplication(universalIdentifier: $universalIdentifier) {
        applicationUniversalIdentifier
        manifest
      }
    }
  `,
  variables: {
    universalIdentifier,
  },
});
