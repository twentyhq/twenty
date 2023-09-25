import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';

import { PageInfoType } from './page-info.graphql-type';

/**
 * Generate a GraphQL connection type based on the EdgeType.
 * @param EdgeType Edge type to be used in the connection.
 * @returns GraphQL connection type.
 */
export const generateConnectionType = <T extends GraphQLObjectType>(
  EdgeType: T,
): GraphQLObjectType<any, any> => {
  return new GraphQLObjectType({
    name: `${EdgeType.name.slice(0, -4)}Connection`, // Removing 'Edge' from the name
    fields: {
      edges: {
        type: new GraphQLList(EdgeType),
      },
      pageInfo: {
        type: new GraphQLNonNull(PageInfoType),
      },
    },
  });
};
