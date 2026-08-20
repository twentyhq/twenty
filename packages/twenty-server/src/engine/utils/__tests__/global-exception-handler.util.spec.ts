import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

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

  it('continues to capture an unexpected error', () => {
    expect(shouldCaptureException(new Error('Unexpected failure'))).toBe(true);
  });
});
