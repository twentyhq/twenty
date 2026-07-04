import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { isTransientPostgresConnectionError } from 'src/modules/messaging/message-import-manager/utils/is-transient-postgres-connection-error.util';

describe('isTransientPostgresConnectionError', () => {
  it('should return true when error has a transient postgres connection code', () => {
    expect(
      isTransientPostgresConnectionError({
        code: POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
      }),
    ).toBe(true);
  });

  it('should return true when driverError has a transient postgres connection code', () => {
    expect(
      isTransientPostgresConnectionError({
        driverError: {
          code: POSTGRESQL_ERROR_CODES.ADMIN_SHUTDOWN,
        },
      }),
    ).toBe(true);
  });

  it('should return false for non transient postgres errors', () => {
    expect(
      isTransientPostgresConnectionError({
        code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
      }),
    ).toBe(false);
  });

  it('should return false when no code is available', () => {
    expect(
      isTransientPostgresConnectionError({
        message: 'Connection terminated unexpectedly',
      }),
    ).toBe(false);
  });
});
