import gql from 'graphql-tag';
import { DASHBOARD_GQL_FIELDS } from 'test/integration/constants/dashboard-gql-fields.constants';

type DuplicateDashboardOperationFactoryParams = {
  dashboardId: string;
  gqlFields?: string;
};

export const duplicateDashboardOperationFactory = ({
  dashboardId,
  gqlFields = DASHBOARD_GQL_FIELDS,
}: DuplicateDashboardOperationFactoryParams) => ({
  query: gql`
    mutation DuplicateDashboard($id: String!) {
      duplicateDashboard(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: dashboardId,
  },
});
