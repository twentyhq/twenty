import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { DateScalarType } from 'src/tenant/schema-builder/graphql-types/scalars/date.scalar';

import { FilterIsEnumType } from './filter-is-enum-filter.type';

export const DateFilterType = new GraphQLInputObjectType({
  name: 'DateFilter',
  fields: {
    eq: { type: DateScalarType },
    gt: { type: DateScalarType },
    gte: { type: DateScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(DateScalarType)) },
    lt: { type: DateScalarType },
    lte: { type: DateScalarType },
    neq: { type: DateScalarType },
    is: { type: FilterIsEnumType },
  },
});
