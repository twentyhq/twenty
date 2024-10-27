import { HttpException } from '@nestjs/common';

type Assert = (
  condition: unknown,
  message?: string,
  ErrorType?: new (message?: string) => HttpException,
) => asserts condition;

/**
 * assert condition and throws a HttpException
 */
export const assert: Assert = (condition, message, ErrorType) => {
  if (!condition) {
    if (ErrorType) {
      if (message) {
        throw new ErrorType(message);
      }

      throw new ErrorType();
    }

    throw new Error(message);
  }
};

export const assertNotNull = <T>(item: T): item is NonNullable<T> =>
  item !== null && item !== undefined;

export const assertNever = (_value: never, message?: string): never => {
  throw new Error(message ?? "Didn't expect to get here.");
};
