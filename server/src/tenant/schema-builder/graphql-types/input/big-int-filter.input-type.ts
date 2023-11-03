import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
} from 'graphql';

export const BigIntFilterType = new GraphQLInputObjectType({
  name: 'BigIntFilter',
  fields: {
    eq: { type: GraphQLInt },
    gt: { type: GraphQLInt },
    gte: { type: GraphQLInt },
    in: { type: new GraphQLList(new GraphQLNonNull(GraphQLInt)) },
    lt: { type: GraphQLInt },
    lte: { type: GraphQLInt },
    neq: { type: GraphQLInt },
  },
});
