import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { generateEdgeType } from 'src/tenant/schema-builder/utils/generate-edge-type.util';

describe('generateEdgeType', () => {
  // Mock GraphQLObjectType for testing
  const mockObjectType = new GraphQLObjectType({
    name: 'MockItem',
    fields: {
      sampleField: { type: GraphQLString },
    },
  });

  test('should generate a GraphQLObjectType', () => {
    const edgeType = generateEdgeType(mockObjectType);
    expect(edgeType).toBeInstanceOf(GraphQLObjectType);
  });

  test('should generate a type with the correct name', () => {
    const edgeType = generateEdgeType(mockObjectType);
    expect(edgeType.name).toBe('MockItemEdge');
  });

  test('should have a "node" field of the provided ObjectType', () => {
    const edgeType = generateEdgeType(mockObjectType);
    const fields = edgeType.getFields();
    expect(fields.node.type).toBe(mockObjectType);
  });

  test('should have a "cursor" field of type GraphQLNonNull(GraphQLString)', () => {
    const edgeType = generateEdgeType(mockObjectType);
    const fields = edgeType.getFields();
    expect(fields.cursor.type).toBeInstanceOf(GraphQLNonNull);
    if (fields.cursor.type instanceof GraphQLNonNull) {
      expect(fields.cursor.type.ofType).toBe(GraphQLString);
    }
  });
});
