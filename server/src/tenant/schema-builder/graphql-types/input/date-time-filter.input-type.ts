import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { DateTimeScalarType } from 'src/tenant/schema-builder/graphql-types/scalars';

export const DatetimeFilterType = new GraphQLInputObjectType({
  name: 'DateTimeFilter',
  fields: {
    eq: { type: DateTimeScalarType },
    gt: { type: DateTimeScalarType },
    gte: { type: DateTimeScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(DateTimeScalarType)) },
    lt: { type: DateTimeScalarType },
    lte: { type: DateTimeScalarType },
    neq: { type: DateTimeScalarType },
  },
});
