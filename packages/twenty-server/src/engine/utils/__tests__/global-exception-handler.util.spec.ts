import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

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

  it('continues to capture an unexpected error', () => {
    expect(shouldCaptureException(new Error('Unexpected failure'))).toBe(true);
  });
});
