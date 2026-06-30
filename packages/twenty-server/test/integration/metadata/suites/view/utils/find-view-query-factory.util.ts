import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewQueryFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId: string;
}) => ({
  query: gql`
    query GetView($id: String!) {
      getView(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewId,
  },
});
