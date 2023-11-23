import { GraphQLBoolean, GraphQLInputObjectType } from 'graphql';

import { FilterIsNullable } from 'src/workspace/workspace-schema-builder/graphql-types/input/filter-is-nullable.input-type';

export const BooleanFilterType = new GraphQLInputObjectType({
  name: 'BooleanFilter',
  fields: {
    eq: { type: GraphQLBoolean },
    is: { type: FilterIsNullable },
  },
});
