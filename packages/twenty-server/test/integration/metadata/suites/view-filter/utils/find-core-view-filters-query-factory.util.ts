import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findCoreViewFiltersQueryFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId?: string;
}) => ({
  query: gql`
    query GetCoreViewFilters($viewId: String) {
      getCoreViewFilters(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    viewId,
  },
});
