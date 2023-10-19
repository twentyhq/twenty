import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const DateTimeScalarType = new GraphQLScalarType({
  name: 'DateTime',
  description: 'A custom scalar that represents a datetime in ISO format',
  serialize(value: string): string {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format, expected ISO date string');
    }

    return date.toISOString();
  },
  parseValue(value: string): Date {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format, expected ISO date string');
    }

    return date;
  },
  parseLiteral(ast): Date {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Invalid date format, expected ISO date string');
    }

    const date = new Date(ast.value);

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format, expected ISO date string');
    }

    return date;
  },
});
