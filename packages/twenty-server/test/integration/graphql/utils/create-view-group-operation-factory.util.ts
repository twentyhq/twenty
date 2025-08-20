import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';

type CreateViewGroupOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewGroup>;
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
