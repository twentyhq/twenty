import { GraphQLBoolean, GraphQLInputObjectType } from 'graphql';

export const BooleanFilterType = new GraphQLInputObjectType({
  name: 'BooleanFilter',
  fields: {
    eq: { type: GraphQLBoolean },
  },
});
