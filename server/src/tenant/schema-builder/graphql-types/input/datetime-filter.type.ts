import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { DatetimeScalarType } from 'src/tenant/schema-builder/graphql-types/scalars/datetime.scalar';

import { FilterIsEnumType } from './filter-is-enum-filter.type';

export const DatetimeFilterInputType = new GraphQLInputObjectType({
  name: 'DatetimeFilter',
  fields: {
    eq: { type: DatetimeScalarType },
    gt: { type: DatetimeScalarType },
    gte: { type: DatetimeScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(DatetimeScalarType)) },
    lt: { type: DatetimeScalarType },
    lte: { type: DatetimeScalarType },
    neq: { type: DatetimeScalarType },
    is: { type: FilterIsEnumType },
  },
});
