import { msg } from '@lingui/core/macro';
import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import { convertCustomExceptionToGraphQLError } from 'src/engine/core-modules/graphql/utils/convert-custom-exception-to-graphql-error.util';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';
import { UnknownException } from 'src/utils/custom-exception';

describe('shouldCaptureException', () => {
  it('does not capture an explicitly retryable logic function error', () => {
    expect(
      shouldCaptureException(
        new RetryableLogicFunctionError(
          'The remote dependency is temporarily unavailable',
        ),
      ),
    ).toBe(false);
  });

  it('does not capture a rate-limit throttler exception', () => {
    expect(
      shouldCaptureException(
        new ThrottlerException(
          'Limit reached (30 tokens per 30000 ms)',
          ThrottlerExceptionCode.LIMIT_REACHED,
        ),
      ),
    ).toBe(false);
  });

  it('honors the source exception override on a converted GraphQL error', () => {
    const exception = new UnknownException('Expected failure', 'SOME_CODE', {
      userFriendlyMessage: msg`Expected failure.`,
      category: 'INTERNAL_SERVER_ERROR',
      shouldBeCapturedBySentry: false,
    });

    expect(
      shouldCaptureException(convertCustomExceptionToGraphQLError(exception)),
    ).toBe(false);
  });

  it('continues to capture an unexpected error', () => {
    expect(shouldCaptureException(new Error('Unexpected failure'))).toBe(true);
  });
});
