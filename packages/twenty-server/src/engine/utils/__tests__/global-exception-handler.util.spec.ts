import { RetryableLogicFunctionError } from 'twenty-shared/logic-function';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import {
  handleException,
  shouldCaptureException,
} from 'src/engine/utils/global-exception-handler.util';

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

  it('does not capture a suspended workspace auth exception', () => {
    expect(
      shouldCaptureException(
        new AuthException(
          'Workspace is suspended',
          AuthExceptionCode.WORKSPACE_SUSPENDED,
        ),
      ),
    ).toBe(false);
  });

  it('continues to capture an internal auth exception', () => {
    expect(
      shouldCaptureException(
        new AuthException(
          'Unexpected auth failure',
          AuthExceptionCode.INTERNAL_SERVER_ERROR,
        ),
      ),
    ).toBe(true);
  });

  it('continues to capture an unexpected error', () => {
    expect(shouldCaptureException(new Error('Unexpected failure'))).toBe(true);
  });
});

describe('handleException', () => {
  it.each([
    { code: AuthExceptionCode.WORKSPACE_SUSPENDED, isCaptured: false },
    { code: AuthExceptionCode.INTERNAL_SERVER_ERROR, isCaptured: true },
  ])(
    'should capture a $code auth exception: $isCaptured',
    ({ code, isCaptured }) => {
      const captureExceptions = jest.fn();

      handleException({
        exception: new AuthException('Auth failure', code),
        exceptionHandlerService: {
          captureExceptions,
        } as unknown as ExceptionHandlerService,
      });

      expect(captureExceptions).toHaveBeenCalledTimes(isCaptured ? 1 : 0);
    },
  );
});
