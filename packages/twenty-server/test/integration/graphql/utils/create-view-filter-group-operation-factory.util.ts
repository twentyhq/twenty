import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

type CreateViewFilterGroupOperationFactoryParams = {
  gqlFields?: string;
  data?: object;
};

export const createViewFilterGroupOperationFactory = ({
  gqlFields = VIEW_FILTER_GROUP_GQL_FIELDS,
  data = {},
}: CreateViewFilterGroupOperationFactoryParams = {}) => ({
  query: gql`
    mutation CreateCoreViewFilterGroup($input: CreateViewFilterGroupInput!) {
      createCoreViewFilterGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
