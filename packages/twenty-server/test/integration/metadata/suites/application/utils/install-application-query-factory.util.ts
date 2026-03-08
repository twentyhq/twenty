import gql from 'graphql-tag';

export type InstallApplicationFactoryInput = {
  appRegistrationId: string;
  version?: string;
};

export const installApplicationQueryFactory = ({
  input,
}: {
  input: InstallApplicationFactoryInput;
}) => ({
  query: gql`
    mutation InstallApplication($appRegistrationId: String!, $version: String) {
      installApplication(
        appRegistrationId: $appRegistrationId
        version: $version
      )
    }
  `,
  variables: {
    appRegistrationId: input.appRegistrationId,
    version: input.version,
  },
});
