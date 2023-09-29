import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

/**
 * Generate a GraphQL edge type based on the ObjectType.
 * @param ObjectType Object type to be used in the Edge.
 * @returns GraphQL edge type.
 */
export const generateEdgeType = <T extends GraphQLObjectType>(
  ObjectType: T,
): GraphQLObjectType<any, any> => {
  return new GraphQLObjectType({
    name: `${ObjectType.name}Edge`,
    fields: {
      node: {
        type: ObjectType,
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
  });
};
