import { type MessageDescriptor } from '@lingui/core';
import { CustomError } from 'twenty-shared/utils';

const CommonExceptionCode = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export const appendCommonExceptionCode = <
  SpecificExceptionCode = Record<string, string>,
>(
  specificExceptionCode: SpecificExceptionCode,
) => {
  return {
    ...CommonExceptionCode,
    ...specificExceptionCode,
  } as const;
};

export abstract class CustomException<
  ExceptionCode extends string = string,
  ExceptionMessage extends string = string,
> extends CustomError {
  code: ExceptionCode;
  userFriendlyMessage: MessageDescriptor;

  constructor(
    message: ExceptionMessage,
    code: ExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage: MessageDescriptor },
  ) {
    super(message);
    this.code = code;
    this.userFriendlyMessage = userFriendlyMessage;
  }
}

/**
 * Exception class for test scenarios and edge cases.
 * Prefer domain-specific exceptions in production code.
 */
export class UnknownException extends CustomException {}
