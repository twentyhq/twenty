import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

type CreateViewGroupOperationFactoryParams = {
  gqlFields?: string;
  data?: object;
};

export const createViewGroupOperationFactory = ({
  gqlFields = VIEW_GROUP_GQL_FIELDS,
  data = {},
}: CreateViewGroupOperationFactoryParams = {}) => ({
  query: gql`
    mutation CreateCoreViewGroup($input: CreateViewGroupInput!) {
      createCoreViewGroup(input: $input) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    input: data,
  },
});
