import { GraphQLEnumType } from 'graphql';

export const OrderByDirectionType = new GraphQLEnumType({
  name: 'OrderByDirection',
  description: 'This enum is used to specify the order of results',
  values: {
    AscNullsFirst: {
      value: 'AscNullsFirst',
      description: 'Ascending order, nulls first',
    },
    AscNullsLast: {
      value: 'AscNullsLast',
      description: 'Ascending order, nulls last',
    },
    DescNullsFirst: {
      value: 'DescNullsFirst',
      description: 'Descending order, nulls first',
    },
    DescNullsLast: {
      value: 'DescNullsLast',
      description: 'Descending order, nulls last',
    },
  },
});
