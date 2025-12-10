import gql from 'graphql-tag';
import { DASHBOARD_GQL_FIELDS } from 'test/integration/constants/dashboard-gql-fields.constants';

export type DuplicateOneDashboardFactoryInput = {
  id: string;
};

export const duplicateOneDashboardQueryFactory = ({
  input,
  gqlFields = DASHBOARD_GQL_FIELDS,
}: {
  input: DuplicateOneDashboardFactoryInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation DuplicateDashboard($id: String!) {
      duplicateDashboard(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
