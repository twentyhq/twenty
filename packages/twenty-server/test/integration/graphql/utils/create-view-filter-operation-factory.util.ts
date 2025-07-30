import gql from 'graphql-tag';
import { VIEW_FILTER_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

type CreateViewFilterOperationFactoryParams = {
  gqlFields?: string;
  data?: object;
};

export const createViewFilterOperationFactory = ({
  gqlFields = VIEW_FILTER_GQL_FIELDS,
  data = {},
}: CreateViewFilterOperationFactoryParams = {}) => ({
  query: gql`
    mutation CreateCoreViewFilter($input: CreateViewFilterInput!) {
      createCoreViewFilter(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
