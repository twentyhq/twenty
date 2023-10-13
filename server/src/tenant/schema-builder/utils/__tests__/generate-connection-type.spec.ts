import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { PageInfoType } from 'src/tenant/schema-builder/utils/page-into-type.util';
import { generateConnectionType } from 'src/tenant/schema-builder/utils/generate-connection-type.util';

describe('generateConnectionType', () => {
  // Create a mock EdgeType for testing
  const mockEdgeType = new GraphQLObjectType({
    name: 'MockEdge',
    fields: {
      node: { type: GraphQLString },
      cursor: { type: GraphQLString },
    },
  });

  // Generate a connection type using the mock
  const MockConnectionType = generateConnectionType(mockEdgeType);

  test('should generate a GraphQLObjectType', () => {
    expect(MockConnectionType).toBeInstanceOf(GraphQLObjectType);
  });

  test('should generate a type with the correct name', () => {
    expect(MockConnectionType.name).toBe('MockConnection');
  });

  test('should include the correct fields', () => {
    const fields = MockConnectionType.getFields();

    expect(fields).toHaveProperty('edges');
    if (
      fields.edges.type instanceof GraphQLList ||
      fields.edges.type instanceof GraphQLNonNull
    ) {
      expect(fields.edges.type.ofType).toBe(mockEdgeType);
    } else {
      fail('edges.type is not an instance of GraphQLList or GraphQLNonNull');
    }

    expect(fields).toHaveProperty('pageInfo');
    if (fields.pageInfo.type instanceof GraphQLNonNull) {
      expect(fields.pageInfo.type.ofType).toBe(PageInfoType);
    } else {
      fail('pageInfo.type is not an instance of GraphQLNonNull');
    }
  });
});
