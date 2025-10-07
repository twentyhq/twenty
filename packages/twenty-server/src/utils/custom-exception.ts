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
  ForceFriendlyMessage = false,
  ExceptionMessage extends string = string,
  ExceptionFriendlyMessage extends string = string,
> extends CustomError {
  code: ExceptionCode;
  userFriendlyMessage?: ExceptionFriendlyMessage;

  constructor(
    message: ExceptionMessage,
    code: ExceptionCode,
    ...userFriendlyMessage: ForceFriendlyMessage extends true
      ? [{ userFriendlyMessage: ExceptionFriendlyMessage }]
      : [{ userFriendlyMessage?: ExceptionFriendlyMessage }?]
  ) {
    super(message);
    this.code = code;
    this.userFriendlyMessage = userFriendlyMessage
      ? userFriendlyMessage?.[0]?.userFriendlyMessage
      : undefined;
  }
}

/**
 * Exception class for test scenarios and edge cases.
 * Prefer domain-specific exceptions in production code.
 */
export class UnknownException extends CustomException {}
