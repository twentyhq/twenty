import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { TimeScalarType } from 'src/tenant/schema-builder/graphql-types/scalars/time.scalar';

import { FilterIsEnumType } from './filter-is-enum-filter.type';

export const TimeFilter = new GraphQLInputObjectType({
  name: 'TimeFilter',
  fields: {
    eq: { type: TimeScalarType },
    gt: { type: TimeScalarType },
    gte: { type: TimeScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(TimeScalarType)) },
    lt: { type: TimeScalarType },
    lte: { type: TimeScalarType },
    neq: { type: TimeScalarType },
    is: { type: FilterIsEnumType },
  },
});
