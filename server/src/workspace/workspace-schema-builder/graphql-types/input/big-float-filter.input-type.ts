import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
} from 'graphql';

import { FilterIsNullable } from 'src/workspace/workspace-schema-builder/graphql-types/input/filter-is-nullable.input-type';

export const BigFloatFilterType = new GraphQLInputObjectType({
  name: 'BigFloatFilter',
  fields: {
    eq: { type: GraphQLFloat },
    gt: { type: GraphQLFloat },
    gte: { type: GraphQLFloat },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLFloat)) },
    lt: { type: GraphQLFloat },
    lte: { type: GraphQLFloat },
    neq: { type: GraphQLFloat },
    is: { type: FilterIsNullable },
  },
});
