import gql from 'graphql-tag';

export const versionInfoQueryFactory = () => ({
  query: gql`
    query VersionInfo {
      versionInfo {
        currentVersion
        latestVersion
      }
    }
  `,
  variables: {},
});
