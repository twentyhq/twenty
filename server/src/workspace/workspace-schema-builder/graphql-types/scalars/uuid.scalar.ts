import { GraphQLScalarType, Kind } from 'graphql';
import { validate as uuidValidate } from 'uuid';

const checkUUID = (value: any): string => {
  if (typeof value !== 'string') {
    throw new Error('UUID must be a string');
  }
  if (!uuidValidate(value)) {
    throw new Error('Invalid UUID');
  }

  return value;
};

export const UUIDScalarType = new GraphQLScalarType({
  name: 'UUID',
  description: 'A UUID scalar type',
  serialize: checkUUID,
  parseValue: checkUUID,
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new Error('UUID must be a string');
    }

    return ast.value;
  },
});
