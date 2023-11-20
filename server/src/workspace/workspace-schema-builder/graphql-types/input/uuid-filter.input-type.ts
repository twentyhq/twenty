import { GraphQLInputObjectType, GraphQLList } from 'graphql';

import { FilterIsNullable } from 'src/workspace/workspace-schema-builder/graphql-types/input/filter-is-nullable.input-type';
import { UUIDScalarType } from 'src/workspace/workspace-schema-builder/graphql-types/scalars';

export const UUIDFilterType = new GraphQLInputObjectType({
  name: 'UUIDFilter',
  fields: {
    eq: { type: UUIDScalarType },
    in: { type: new GraphQLList(UUIDScalarType) },
    neq: { type: UUIDScalarType },
    is: { type: FilterIsNullable },
  },
});
