import gql from 'graphql-tag';

const CLAIMED_APPLICATION_FIELDS = `
  id
  universalIdentifier
  version
  state
`;

export const installApplicationAsyncQueryFactory = ({
  universalIdentifier,
  version,
}: {
  universalIdentifier: string;
  version?: string;
}) => ({
  query: gql`
    mutation InstallApplicationAsync(
      $universalIdentifier: String!
      $version: String
    ) {
      installApplicationAsync(
        universalIdentifier: $universalIdentifier
        version: $version
      ) {
        ${CLAIMED_APPLICATION_FIELDS}
      }
    }
  `,
  variables: { universalIdentifier, version },
});

export const uninstallApplicationAsyncQueryFactory = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}) => ({
  query: gql`
    mutation UninstallApplicationAsync($universalIdentifier: String!) {
      uninstallApplicationAsync(universalIdentifier: $universalIdentifier) {
        ${CLAIMED_APPLICATION_FIELDS}
      }
    }
  `,
  variables: { universalIdentifier },
});
