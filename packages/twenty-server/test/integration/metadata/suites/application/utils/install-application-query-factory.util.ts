import gql from 'graphql-tag';

export type InstallApplicationFactoryInput = {
  universalIdentifier: string;
  version?: string;
};

export const installApplicationQueryFactory = ({
  input,
}: {
  input: InstallApplicationFactoryInput;
}) => ({
  query: gql`
    mutation InstallApplication(
      $universalIdentifier: String!
      $version: String
    ) {
      installApplication(
        universalIdentifier: $universalIdentifier
        version: $version
      ) {
        id
      }
    }
  `,
  variables: {
    universalIdentifier: input.universalIdentifier,
    version: input.version,
  },
});
