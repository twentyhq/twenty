import gql from 'graphql-tag';
import { VIEW_FILTER_GROUP_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';

import { type ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';

type CreateViewFilterGroupOperationFactoryParams = {
  gqlFields?: string;
  data?: Partial<ViewFilterGroupEntity>;
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
