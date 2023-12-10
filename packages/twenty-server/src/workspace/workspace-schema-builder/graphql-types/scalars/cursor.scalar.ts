import { GraphQLScalarType, Kind } from 'graphql';

export const CursorScalarType = new GraphQLScalarType({
  name: 'Cursor',
  description: 'A custom scalar that represents a cursor for pagination',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new Error('Cursor must be a string');
    }

    return value;
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Cursor must be a string');
    }

    return value;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Cursor must be a string');
    }

    return ast.value;
  },
});
