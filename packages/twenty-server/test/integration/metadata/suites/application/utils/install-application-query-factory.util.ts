import gql from 'graphql-tag';

export type InstallApplicationFactoryInput = {
  applicationUniversalIdentifier: string;
  version: string;
};

export const installApplicationQueryFactory = ({
  input,
}: {
  input: InstallApplicationFactoryInput;
}) => ({
  query: gql`
    mutation InstallApplication(
      $applicationUniversalIdentifier: UUID!
      $version: String!
    ) {
      installApplication(
        applicationUniversalIdentifier: $applicationUniversalIdentifier
        version: $version
      )
    }
  `,
  variables: {
    applicationUniversalIdentifier: input.applicationUniversalIdentifier,
    version: input.version,
  },
});
