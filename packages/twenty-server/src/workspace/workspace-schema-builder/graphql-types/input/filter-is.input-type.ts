import { GraphQLEnumType } from 'graphql';

export const FilterIs = new GraphQLEnumType({
  name: 'FilterIs',
  description: 'This enum to filter by nullability',
  values: {
    NULL: {
      value: 'NULL',
      description: 'Nulish values',
    },
    NOT_NULL: {
      value: 'NOT_NULL',
      description: 'Non-nulish values',
    },
  },
});
