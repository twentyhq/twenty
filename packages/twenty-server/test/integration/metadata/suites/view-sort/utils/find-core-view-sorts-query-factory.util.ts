import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findCoreViewSortsQueryFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId: string;
}) => ({
  query: gql`
    query GetCoreViewSorts($viewId: UUID!) {
      getCoreViewSorts(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    viewId,
  },
});
