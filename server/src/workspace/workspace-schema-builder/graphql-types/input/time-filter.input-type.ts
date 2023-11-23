import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FilterIsNullable } from 'src/workspace/workspace-schema-builder/graphql-types/input/filter-is-nullable.input-type';
import { TimeScalarType } from 'src/workspace/workspace-schema-builder/graphql-types/scalars';

export const TimeFilterType = new GraphQLInputObjectType({
  name: 'TimeFilter',
  fields: {
    eq: { type: TimeScalarType },
    gt: { type: TimeScalarType },
    gte: { type: TimeScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(TimeScalarType)) },
    lt: { type: TimeScalarType },
    lte: { type: TimeScalarType },
    neq: { type: TimeScalarType },
    is: { type: FilterIsNullable },
  },
});
