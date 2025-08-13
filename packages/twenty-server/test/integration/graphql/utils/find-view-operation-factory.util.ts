import gql from 'graphql-tag';
import { VIEW_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const findViewOperationFactory = ({
  gqlFields = VIEW_GQL_FIELDS,
  viewId,
}: {
  gqlFields?: string;
  viewId: string;
}) => ({
  query: gql`
    query GetCoreView($id: String!) {
      getCoreView(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: viewId,
  },
});
