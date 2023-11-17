import { GraphQLInputObjectType, GraphQLList } from 'graphql';

import { UUIDScalarType } from 'src/workspace/workspace-schema-builder/graphql-types/scalars';

export const UUIDFilterType = new GraphQLInputObjectType({
  name: 'UUIDFilter',
  fields: {
    eq: { type: UUIDScalarType },
    in: { type: new GraphQLList(UUIDScalarType) },
    neq: { type: UUIDScalarType },
  },
});
