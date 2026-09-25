import gql from 'graphql-tag';

export const isMaintenanceModeBannerDismissedQueryFactory = () => ({
  query: gql`
    query IsMaintenanceModeBannerDismissed {
      isMaintenanceModeBannerDismissed
    }
  `,
  variables: {},
});
