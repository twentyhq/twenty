import { GraphQLError } from 'graphql';

type Assert = (
  condition: unknown,
  message: string,
  code: string,
) => asserts condition;

/**
 * assert condition and throws a HttpException
 */
export const assertThrowGql: Assert = (condition, message, code) => {
  if (!condition) {
    if (message) {
      throw new GraphQLError(message, { extensions: { code } });
    }
  }
};
