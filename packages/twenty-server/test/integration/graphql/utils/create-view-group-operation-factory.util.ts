import gql from 'graphql-tag';
import { VIEW_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';

type CreateViewGroupOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewGroupEntity>;
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
