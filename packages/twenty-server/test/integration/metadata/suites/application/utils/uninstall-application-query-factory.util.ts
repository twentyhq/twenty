import gql from 'graphql-tag';

export const uninstallApplicationQueryFactory = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}) => ({
  query: gql`
    mutation UninstallApplication($universalIdentifier: String!) {
      uninstallApplication(universalIdentifier: $universalIdentifier)
    }
  `,
  variables: {
    universalIdentifier,
  },
});
