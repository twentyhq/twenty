import { GraphQLEnumType } from 'graphql';

export const FilterIsEnumType = new GraphQLEnumType({
  name: 'FilterIs',
  values: {
    PENDING: { value: 'PENDING' },
    RELEASED: { value: 'RELEASED' },
  },
});
