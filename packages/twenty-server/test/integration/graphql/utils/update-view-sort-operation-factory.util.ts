import gql from 'graphql-tag';
import { VIEW_SORT_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

export const updateViewSortOperationFactory = ({
  gqlFields = VIEW_SORT_GQL_FIELDS,
  viewSortId,
  data = {},
}: {
  gqlFields?: string;
  viewSortId: string;
  data?: object;
}) => ({
  query: gql`
    mutation UpdateViewSort($input: UpdateViewSortInput!) {
      updateViewSort(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: { id: viewSortId, update: data },
  },
});
