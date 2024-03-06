import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull } from 'graphql';

import { FilterIs } from 'src/workspace/workspace-schema-builder/graphql-types/input/filter-is.input-type';
import { PositionScalarType } from 'src/workspace/workspace-schema-builder/graphql-types/scalars/position.scalar';

export const PositionFilterType = new GraphQLInputObjectType({
  name: 'PositionFilter',
  fields: {
    eq: { type: PositionScalarType },
    gt: { type: PositionScalarType },
    gte: { type: PositionScalarType },
    in: { type: new GraphQLList(new GraphQLNonNull(PositionScalarType)) },
    lt: { type: PositionScalarType },
    lte: { type: PositionScalarType },
    neq: { type: PositionScalarType },
    is: { type: FilterIs },
  },
});
