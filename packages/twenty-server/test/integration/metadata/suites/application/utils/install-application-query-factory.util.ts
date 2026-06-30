import gql from 'graphql-tag';

export type InstallApplicationFactoryInput = {
  universalIdentifier: string;
  version?: string;
  allowDestructive?: boolean;
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
      $allowDestructive: Boolean
    ) {
      installApplication(
        universalIdentifier: $universalIdentifier
        version: $version
        allowDestructive: $allowDestructive
      ) {
        id
      }
    }
  `,
  variables: {
    universalIdentifier: input.universalIdentifier,
    version: input.version,
    allowDestructive: input.allowDestructive,
  },
});
