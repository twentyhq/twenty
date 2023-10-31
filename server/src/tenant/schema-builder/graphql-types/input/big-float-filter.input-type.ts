import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
} from 'graphql';

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
  },
});
