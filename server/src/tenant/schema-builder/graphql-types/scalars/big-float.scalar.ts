import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const BigFloatScalarType = new GraphQLScalarType({
  name: 'BigFloat',
  description:
    'A custom scalar type for representing big floating point numbers',
  serialize(value: number): string {
    return String(value);
  },
  parseValue(value: string): number {
    return parseFloat(value);
  },
  parseLiteral(ast): number | null {
    if (ast.kind === Kind.FLOAT) {
      return parseFloat(ast.value);
    }

    return null;
  },
});
