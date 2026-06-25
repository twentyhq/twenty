import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewFiltersQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId?: string;
}) => ({
  query: gql`
    query GetViewFilters($viewId: String) {
      getViewFilters(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    viewId,
  },
});
