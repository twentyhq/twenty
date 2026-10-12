import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';

describe('formatErrorWithCause', () => {
  it('shows the Postgres error the ORM hides behind a generic message', () => {
    const postgresError = Object.assign(
      new Error('unsupported Unicode escape sequence'),
      { code: '22P05' },
    );

    expect(formatErrorWithCause(computeTwentyOrmException(postgresError))).toBe(
      'Error: Data validation error. <- Error: unsupported Unicode escape sequence',
    );
  });

  it('shows a cause the AI SDK sets as a plain string', () => {
    const error = Object.assign(new Error('Type validation failed'), {
      cause: 'value must be a string in the enum',
    });

    expect(formatErrorWithCause(error)).toBe(
      'Error: Type validation failed <- value must be a string in the enum',
    );
  });

  it('formats an error without a cause', () => {
    expect(formatErrorWithCause(new Error('Provider timed out'))).toBe(
      'Error: Provider timed out',
    );
  });

  it('formats a thrown non-Error value', () => {
    expect(formatErrorWithCause('boom')).toBe('boom');
  });
});
