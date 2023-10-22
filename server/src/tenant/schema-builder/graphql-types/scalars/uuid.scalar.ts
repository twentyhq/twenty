import { GraphQLScalarType, Kind } from 'graphql';

export const UUIDScalarType = new GraphQLScalarType({
  name: 'UUID',
  description: 'A UUID scalar type',
  serialize(value: string): string {
    if (typeof value !== 'string') {
      throw new Error('UUID must be a string');
    }

    return value;
  },
  parseValue(value: string): string {
    if (typeof value !== 'string') {
      throw new Error('UUID must be a string');
    }

    return value;
  },
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new Error('UUID must be a string');
    }

    return ast.value;
  },
});
