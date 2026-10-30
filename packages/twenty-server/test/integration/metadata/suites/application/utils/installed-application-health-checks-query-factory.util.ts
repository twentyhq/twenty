import gql from 'graphql-tag';

export const installedApplicationHealthChecksQueryFactory = () => ({
  query: gql`
    query InstalledApplicationHealthChecks {
      currentUser {
        currentWorkspace {
          installedApplications {
            id
            runOnUserPreferences
          }
        }
      }
    }
  `,
  variables: {},
});
