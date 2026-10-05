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

export type ExceptionCategory =
  | 'BAD_USER_INPUT'
  | 'UNAUTHENTICATED'
  | 'PAYMENT_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'GONE'
  | 'PAYLOAD_TOO_LARGE'
  | 'RANGE_NOT_SATISFIABLE'
  | 'UNPROCESSABLE_ENTITY'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT';

export abstract class CustomException<
  ExceptionCode extends string = string,
  ExceptionMessage extends string = string,
> extends CustomError {
  code: ExceptionCode;
  userFriendlyMessage: MessageDescriptor;
  category: ExceptionCategory;
  shouldBeCapturedBySentry?: boolean;

  constructor(
    message: ExceptionMessage,
    code: ExceptionCode,
    {
      userFriendlyMessage,
      category,
      shouldBeCapturedBySentry,
    }: {
      userFriendlyMessage: MessageDescriptor;
      category: ExceptionCategory;
      // Forces the Sentry decision; by default only 4xx responses skip Sentry
      shouldBeCapturedBySentry?: boolean;
    },
  ) {
    super(message);
    this.code = code;
    this.userFriendlyMessage = userFriendlyMessage;
    this.category = category;
    this.shouldBeCapturedBySentry = shouldBeCapturedBySentry;
  }
}

// For test scenarios and edge cases; prefer domain-specific exceptions in production code.
export class UnknownException extends CustomException {}
