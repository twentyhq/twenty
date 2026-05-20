import { GraphQLError } from 'graphql';

import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';

describe('shouldCaptureException', () => {
  it('should not capture graphql errors with status code under 500', () => {
    const graphQLError = new GraphQLError('Forbidden', {
      extensions: {
        http: {
          status: 403,
        },
      },
    });

    expect(shouldCaptureException(graphQLError)).toBe(false);
  });

  it('should not capture throttler limit reached exceptions', () => {
    const throttlerException = new ThrottlerException(
      'Limit reached',
      ThrottlerExceptionCode.LIMIT_REACHED,
    );

    expect(shouldCaptureException(throttlerException)).toBe(false);
  });

  it('should capture unexpected errors', () => {
    expect(shouldCaptureException(new Error('Unexpected'))).toBe(true);
  });
});
