import gql from 'graphql-tag';

export type InstallMarketplaceAppFactoryInput = {
  universalIdentifier: string;
  version?: string;
};

export const installMarketplaceAppQueryFactory = ({
  input,
}: {
  input: InstallMarketplaceAppFactoryInput;
}) => ({
  query: gql`
    mutation InstallMarketplaceApp(
      $universalIdentifier: String!
      $version: String
    ) {
      installMarketplaceApp(
        universalIdentifier: $universalIdentifier
        version: $version
      )
    }
  `,
  variables: {
    universalIdentifier: input.universalIdentifier,
    version: input.version,
  },
});
