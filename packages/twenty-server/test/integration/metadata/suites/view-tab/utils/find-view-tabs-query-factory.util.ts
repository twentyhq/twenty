import gql from 'graphql-tag';
import { VIEW_TAB_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewTabsQueryFactory = ({
  gqlFields = VIEW_TAB_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId: string;
}) => ({
  query: gql`
    query GetViewTabs($viewId: String!) {
      getViewTabs(viewId: $viewId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    viewId,
  },
});
